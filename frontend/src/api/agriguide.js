// AgriGuide API service layer.
//
// All backend communication happens here, never inside UI components.
// Expected Django REST Framework endpoints (see report at end of task):
//   GET  /api/locations/
//   GET  /api/cases/?location_id=...
//   GET  /api/guidance/search/?q=...&crop=maize
//   POST /api/advisories/preview/     (never persists a final record)
//   POST /api/advisories/confirm/     (persists only with explicit approval)
//   GET  /api/advisories/
//   GET  /api/advisories/{id}/
//
// Behaviour on failure:
//   - backend unreachable (no HTTP response)  -> explicit demo fallback, the
//     app switches to 'demo' mode and the UI shows a visible warning;
//   - backend returns 4xx/5xx                 -> the error is thrown and shown
//     to the user. We never fabricate a success or silently mock a failure.

import API from './axios.js';
import { getApiMode, setApiMode, isNetworkError } from './apiMode.js';
import {
  demoLocations,
  demoCasesFor,
  demoSearchGuidance,
  demoPreviewAdvisory,
  demoConfirmAdvisory,
  loadDemoRecords,
  demoLoadAdvisory,
} from './demoData.js';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === 'object' && Array.isArray(value.results)) return value.results;
  return [value];
}

async function request(call, fallback) {
  if (getApiMode() === 'demo') return fallback();
  try {
    const response = await call();
    setApiMode('live');
    return response.data;
  } catch (error) {
    if (isNetworkError(error)) {
      setApiMode('demo');
      return fallback();
    }
    throw error;
  }
}

// ---- normalizers ----------------------------------------------------------

function normalizeLocation(raw, index) {
  if (raw == null || typeof raw !== 'object') {
    return { id: index + 1, name: String(raw), code: String(raw) };
  }
  return {
    id: raw.id ?? raw.pk ?? index + 1,
    name: raw.name ?? raw.label ?? raw.title ?? `Location ${index + 1}`,
    // `code` is the stable reference the backend agent tools (readCaseHistory)
    // key on (e.g. SITE-A). Falls back to the id when the backend omits it.
    code: raw.code ?? raw.slug ?? raw.id ?? index + 1,
  };
}

function normalizeCase(raw) {
  const item = raw && typeof raw === 'object' ? raw : { symptom_summary: String(raw) };
  return {
    id: item.id ?? item.case_id ?? '',
    location: typeof item.location === 'object' ? item.location?.name : (item.location_name ?? item.location ?? ''),
    crop: item.crop ?? 'Maize',
    growth_stage: item.growth_stage ?? '',
    symptom_summary: item.symptom_summary ?? item.symptoms ?? item.summary ?? '',
    recorded_on: item.recorded_on ?? item.created_at ?? item.date ?? '',
    outcome_summary: item.outcome_summary ?? item.outcome ?? '',
    demo: Boolean(item.demo),
  };
}

function normalizeGuidance(raw) {
  const item = raw && typeof raw === 'object' ? raw : { text: String(raw) };
  return {
    source_id: item.source_id ?? item.sourceId ?? item.id ?? '',
    title: item.title ?? item.name ?? 'Untitled guidance note',
    topic: item.topic ?? item.category ?? '',
    crop: item.crop ?? '',
    text: item.text ?? item.guidance_text ?? item.content ?? item.body ?? '',
    section: item.section ?? item.section_ref ?? item.reference ?? '',
    demo: Boolean(item.demo),
  };
}

function toTextItem(raw) {
  if (raw == null) return { text: '' };
  if (typeof raw === 'string') return { text: raw, label: '' };
  return {
    text: raw.text ?? raw.description ?? raw.detail ?? String(raw),
    label: raw.label ?? '',
  };
}

function normalizeSource(raw) {
  const item = raw && typeof raw === 'object' ? raw : { source_id: String(raw) };
  return {
    source_id: item.source_id ?? item.sourceId ?? item.id ?? '',
    title: item.title ?? item.name ?? '',
    section: item.section ?? item.section_ref ?? item.reference ?? '',
    snippet: item.snippet ?? item.excerpt ?? item.text ?? '',
    demo: Boolean(item.demo),
  };
}

function normalizeAdvisory(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const merged = item.advisory && typeof item.advisory === 'object' ? { ...item, ...item.advisory } : item;
  const followUp = merged.follow_up && typeof merged.follow_up === 'object' ? merged.follow_up : {};

  return {
    observations: asArray(merged.observations ?? merged.submitted_observations).map(toTextItem),
    case_history: asArray(merged.case_history ?? merged.previous_cases ?? merged.cases).map(normalizeCase),
    possible_explanations: asArray(merged.possible_explanations ?? merged.explanations).map(toTextItem),
    next_steps: asArray(merged.next_steps ?? merged.suggested_next_steps ?? merged.suggestions).map(toTextItem),
    sources: asArray(merged.sources ?? merged.source_references).map(normalizeSource),
    advisory_text: merged.advisory_text ?? merged.summary ?? merged.text ?? '',
    follow_up_task: merged.follow_up_task ?? followUp.task ?? '',
    follow_up_due_date: merged.follow_up_due_date ?? followUp.due_date ?? '',
    status: merged.status ?? merged.approval_status ?? 'awaiting_approval',
    evidence_warning: merged.evidence_warning ?? null,
    demo: Boolean(merged.demo),
  };
}

function normalizeRecord(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const location = typeof item.location === 'object' ? item.location?.name : (item.location_name ?? item.location ?? '');
  return {
    id: item.id ?? item.record_id ?? item.pk ?? '',
    location: location ?? '',
    crop: item.crop ?? 'Maize',
    growth_stage: item.growth_stage ?? '',
    symptom_summary: item.symptom_summary ?? item.symptoms ?? item.summary ?? '',
    created_at: item.created_at ?? item.date ?? item.submitted_at ?? '',
    approval_status: item.approval_status ?? item.status ?? '',
    follow_up_status: item.follow_up_status ?? (item.follow_up && item.follow_up.status) ?? '',
    demo: Boolean(item.demo),
  };
}

function normalizeRecordDetail(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const merged = item.record && typeof item.record === 'object' ? { ...item, ...item.record } : item;
  const conditions = merged.field_conditions && typeof merged.field_conditions === 'object' ? merged.field_conditions : {};
  const base = normalizeRecord(merged);

  return {
    ...base,
    symptoms: merged.symptoms ?? base.symptom_summary,
    field_conditions: {
      affected_area: merged.affected_area ?? conditions.affected_area ?? '',
      rainfall: merged.rainfall ?? conditions.rainfall ?? '',
      soil_condition: merged.soil_condition ?? conditions.soil_condition ?? '',
      date_observed: merged.date_observed ?? conditions.date_observed ?? '',
    },
    observations: asArray(merged.observations).map(toTextItem),
    case_history: asArray(merged.case_history ?? merged.previous_cases).map(normalizeCase),
    possible_explanations: asArray(merged.possible_explanations ?? merged.explanations).map(toTextItem),
    next_steps: asArray(merged.next_steps ?? merged.suggested_next_steps).map(toTextItem),
    sources: asArray(merged.sources ?? merged.source_references).map(normalizeSource),
    advisory_text: merged.advisory_text ?? merged.summary ?? '',
    follow_up_task: merged.follow_up_task ?? (merged.follow_up && merged.follow_up.task) ?? '',
    follow_up_due_date: merged.follow_up_due_date ?? (merged.follow_up && merged.follow_up.due_date) ?? '',
  };
}

// ---- public API -----------------------------------------------------------

export async function fetchLocations() {
  const data = await request(() => API.get('/locations/'), () => demoLocations);
  return asArray(data).map(normalizeLocation);
}

export async function fetchCases(locationId) {
  const data = await request(
    () => API.get('/cases/', { params: { location_id: locationId } }),
    () => demoCasesFor(locationId),
  );
  return asArray(data).map(normalizeCase);
}

export async function searchGuidance({ q = '', crop = 'maize' } = {}) {
  const data = await request(
    () => API.get('/guidance/search/', { params: { q, crop } }),
    () => demoSearchGuidance({ q, crop }),
  );
  return asArray(data).map(normalizeGuidance);
}

// Preview only: the backend must NOT persist anything for this request.
export async function previewAdvisory(report) {
  const data = await request(
    () => API.post('/advisories/preview/', report),
    () => demoPreviewAdvisory(report),
  );
  return normalizeAdvisory(data);
}

// Final save: called only after the user explicitly approves the advisory.
export async function confirmAdvisory(payload) {
  const data = await request(
    () => API.post('/advisories/confirm/', { ...payload, confirmed: true }),
    () => demoConfirmAdvisory(payload),
  );
  return normalizeRecord(data);
}

export async function fetchAdvisories() {
  const data = await request(() => API.get('/advisories/'), () => loadDemoRecords());
  return asArray(data).map(normalizeRecord);
}

export async function fetchAdvisory(id) {
  const data = await request(() => API.get(`/advisories/${id}/`), () => demoLoadAdvisory(id));
  return normalizeRecordDetail(data);
}

// ---- error helpers --------------------------------------------------------

export function apiErrorMessage(error, fallback = 'The request could not be completed.') {
  if (!error) return fallback;

  if (error.response) {
    const data = error.response.data;
    let detail = '';
    if (typeof data === 'string' && data.trim()) {
      detail = data.trim();
    } else if (data && typeof data === 'object') {
      const parts = [];
      Object.entries(data).forEach(([key, value]) => {
        const text = Array.isArray(value) ? value.join(' ') : String(value);
        if (text && text !== '[object Object]') parts.push(`${key}: ${text}`);
      });
      detail = parts.join(' ');
    }
    if (detail) return `Backend error: ${detail}`;
    return `Backend error (HTTP ${error.response.status}).`;
  }

  if (error.request) return 'Could not reach the Django backend. Check that it is running and VITE_API_BASE_URL is correct.';
  return error.message || fallback;
}