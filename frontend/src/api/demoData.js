// ---------------------------------------------------------------------------
// FICTIONAL DEMONSTRATION DATA — AgriGuide
//
// Everything in this file is invented for the hackathon demo. It is NOT
// official agricultural guidance, NOT real case data, and NOT real sources.
// Source IDs use a `DEMO-` prefix precisely so they can never be mistaken for
// official references. The UI must label this data whenever it is shown.
// ---------------------------------------------------------------------------

export const DEMO_NOTICE = 'Fictional demonstration data — not official agricultural sources.';

export const demoLocations = [
  { id: 1, name: 'Site A', code: 'site_a' },
  { id: 2, name: 'Site B', code: 'site_b' },
  { id: 3, name: 'Site C', code: 'site_c' },
];

export const demoGuidance = [
  {
    source_id: 'DEMO-GRN-001',
    title: 'Maize leaf yellowing — field observation checklist',
    topic: 'Nutrition and water',
    crop: 'Maize',
    section: 'Section 2.1',
    text: 'Fictional demo note. Yellowing that starts on older, lower leaves can accompany nitrogen deficiency, while yellowing that follows uneven watering patterns can accompany moisture stress. Record where the yellowing appears first, whether it is uniform across the plot, and recent irrigation or rainfall before drawing any conclusion.',
    demo: true,
  },
  {
    source_id: 'DEMO-GRN-002',
    title: 'Waterlogging and drainage stress in maize',
    topic: 'Water management',
    crop: 'Maize',
    section: 'Section 3.4',
    text: 'Fictional demo note. After heavy rainfall, standing water or prolonged saturated soil can produce wilting, yellowing and stunted growth even while the field is wet. Check for ponding, soil odour, and whether symptoms are worst in low-lying parts of the plot.',
    demo: true,
  },
  {
    source_id: 'DEMO-GRN-003',
    title: 'Leaf and stalk feeding damage — pest observation guide',
    topic: 'Pests',
    crop: 'Maize',
    section: 'Section 5.2',
    text: 'Fictional demo note. Chewed leaf margins, window-paning of young leaves, and small feeding pellets in the whorl are observations worth recording. Inspect at least ten plants across the affected area before estimating how widespread the damage is.',
    demo: true,
  },
  {
    source_id: 'DEMO-GRN-004',
    title: 'Recording field observations for extension follow-up',
    topic: 'Field records',
    crop: 'General',
    section: 'Section 1.2',
    text: 'Fictional demo note. A useful follow-up record states what was observed, where, when, what was done next, and the date to re-inspect. Keep observations separate from any diagnosis so later readers can judge the evidence themselves.',
    demo: true,
  },
];

const demoCasesByLocation = {
  1: [
    {
      id: 'DEMO-CASE-A-01',
      location: 'Site A',
      crop: 'Maize',
      growth_stage: 'Vegetative',
      symptom_summary: 'Patchy yellowing on lower leaves along the eastern boundary.',
      recorded_on: '2026-07-18',
      outcome_summary: 'Fictional demo case: drainage was improved and re-inspection was scheduled.',
      demo: true,
    },
    {
      id: 'DEMO-CASE-A-02',
      location: 'Site A',
      crop: 'Maize',
      growth_stage: 'Seedling',
      symptom_summary: 'Uneven seedling emergence after heavy early rains.',
      recorded_on: '2026-06-02',
      outcome_summary: 'Fictional demo case: replanting of gaps was recorded at the next visit.',
      demo: true,
    },
  ],
  2: [
    {
      id: 'DEMO-CASE-B-01',
      location: 'Site B',
      crop: 'Maize',
      growth_stage: 'Flowering',
      symptom_summary: 'Chewed leaf margins noticed in two rows near the plot edge.',
      recorded_on: '2026-07-30',
      outcome_summary: 'Fictional demo case: monitoring count increased to ten plants per row.',
      demo: true,
    },
  ],
  3: [
    {
      id: 'DEMO-CASE-C-01',
      location: 'Site C',
      crop: 'Maize',
      growth_stage: 'Maturity',
      symptom_summary: 'Stalk lodging after wind and rain at Site C.',
      recorded_on: '2026-08-11',
      outcome_summary: 'Fictional demo case: affected area was mapped for later comparison.',
      demo: true,
    },
  ],
};

export function demoCasesFor(key) {
  const asNumber = Number(key);
  if (!Number.isNaN(asNumber) && demoCasesByLocation[asNumber]) {
    return demoCasesByLocation[asNumber].map((c) => ({ ...c }));
  }
  // The report form passes a location code (e.g. 'site_a' / 'SITE-A').
  const match = demoLocations.find(
    (loc) => String(loc.code) === String(key) || String(loc.id) === String(key),
  );
  if (match && demoCasesByLocation[match.id]) {
    return demoCasesByLocation[match.id].map((c) => ({ ...c }));
  }
  return [];
}

export function demoSearchGuidance({ q = '', crop = '' } = {}) {
  const tokens = String(q).toLowerCase().split(/\s+/).filter(Boolean);
  const cropNeedle = String(crop).toLowerCase();
  return demoGuidance
    .filter((note) => {
      const matchesCrop = !cropNeedle || note.crop.toLowerCase().includes(cropNeedle) || note.crop === 'General';
      if (!matchesCrop) return false;
      if (tokens.length === 0) return true;
      const haystack = `${note.title} ${note.topic} ${note.text}`.toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    })
    .map((note) => ({ ...note }));
}

function plusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function locationLabel(report) {
  if (report.location_name) return report.location_name;
  const ref = report.location_ref ?? report.location_id;
  const match = demoLocations.find(
    (loc) => String(loc.id) === String(ref) || String(loc.code) === String(ref),
  );
  return match ? match.name : `Location ${ref ?? ''}`;
}

function buildExplanations(report) {
  const symptoms = String(report.symptoms || '').toLowerCase();
  const conditions = report.field_conditions || {};
  const soil = String(conditions.soil_condition || report.soil_condition || '').toLowerCase();
  const observations = [];
  const explanations = [];

  if (soil.includes('waterlogged')) {
    observations.push('Soil was reported as waterlogged.');
    explanations.push({
      label: 'Possibility',
      text: 'Prolonged saturated soil can produce yellowing and wilting even while the field is wet. This is a possibility, not a confirmed diagnosis.',
    });
  }
  if (/yellow|chlorosis/.test(symptoms)) {
    observations.push('Yellowing of leaves was reported.');
    explanations.push({
      label: 'Possibility',
      text: 'Yellowing can accompany nutrient shortage or uneven moisture. The pattern across the plot must be checked before separating these causes.',
    });
  }
  if (/hole|chew|eaten|spot|worm|pest|damage/.test(symptoms)) {
    observations.push('Leaf feeding or spotting was reported.');
    explanations.push({
      label: 'Possibility',
      text: 'Feeding damage or spotting can indicate insect activity, but similar marks can come from weather or handling. Inspect several plants before concluding.',
    });
  }
  if (explanations.length === 0) {
    explanations.push({
      label: 'Possibility',
      text: 'The reported symptoms do not match a single clear pattern in the demonstration guidance. More observation is needed before any explanation can be offered.',
    });
  }

  return { observations, explanations };
}

// Builds a cautious demo advisory. It deliberately avoids any diagnosis or
// treatment prescription and recommends consulting a local professional.
export function demoPreviewAdvisory(report) {
  const location = locationLabel(report);
  const conditions = report.field_conditions || {};
  const cases = demoCasesFor(report.location_ref ?? report.location_id).slice(0, 3);
  const guidance = demoSearchGuidance({ q: `${report.symptoms} ${report.growth_stage}`, crop: 'maize' }).slice(0, 3);
  const { observations, explanations } = buildExplanations(report);

  observations.unshift(
    `Reported a ${String(report.growth_stage || '').toLowerCase()} maize crop at ${location} with symptoms: ${report.symptoms}`,
  );
  if (conditions.affected_area) observations.push(`Affected area / distribution: ${conditions.affected_area}`);
  if (conditions.rainfall) observations.push(`Recent rainfall: ${conditions.rainfall}`);
  if (conditions.soil_condition) observations.push(`Soil condition: ${conditions.soil_condition}`);
  if (conditions.date_observed) observations.push(`Date observed: ${conditions.date_observed}`);

  const nextSteps = [
    'Re-inspect at least ten plants across the affected area and record where symptoms appear first.',
    'Note whether symptoms are concentrated in one part of the field or spread evenly.',
    'Compare the observations with the retrieved guidance notes below before deciding on any action.',
    'If the evidence stays unclear or the problem spreads, consult a qualified local agricultural professional.',
  ];

  const sources = guidance.map((note) => ({
    source_id: note.source_id,
    title: note.title,
    section: note.section,
    snippet: note.text,
    demo: true,
  }));

  const advisoryText = `Observations reported at ${location} (${report.growth_stage} stage, maize) may be consistent with several conditions; the retrieved demonstration guidance suggests: ${explanations
    .map((item) => item.text)
    .join(' ')} This is a cautious, evidence-referenced draft — it is not a confirmed diagnosis. Follow-up: re-inspect the affected area, record what changes, and consult a qualified local agricultural professional if symptoms worsen or remain unexplained.`;

  return {
    observations,
    case_history: cases,
    possible_explanations: explanations,
    next_steps: nextSteps,
    sources,
    advisory_text: advisoryText,
    follow_up_task: `Re-inspect the affected maize at ${location} and record whether symptoms have changed.`,
    follow_up_due_date: plusDays(7),
    status: 'awaiting_approval',
    evidence_warning: sources.length === 0 ? 'No relevant guidance was found for this report.' : null,
    demo: true,
  };
}

// ---- Demo record store (browser storage only; clearly labelled) -----------

const STORAGE_KEY = 'agriguide.demo.records.v1';

export function loadDemoRecords() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistDemoRecords(records) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage may be unavailable (private mode). Report as a failure upstream.
    throw new Error('Demo storage is unavailable in this browser session.');
  }
}

export function demoConfirmAdvisory(payload) {
  const records = loadDemoRecords();
  const nextId = records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1;
  const report = payload.report || {};
  const advisory = payload.advisory || {};
  const conditions = report.field_conditions || {};

  const record = {
    id: nextId,
    location: report.location_name || locationLabel(report),
    crop: report.crop || 'Maize',
    growth_stage: report.growth_stage || '',
    symptoms: report.symptoms || '',
    symptom_summary: String(report.symptoms || '').slice(0, 160),
    field_conditions: {
      affected_area: conditions.affected_area || '',
      rainfall: conditions.rainfall || '',
      soil_condition: conditions.soil_condition || '',
      date_observed: conditions.date_observed || '',
    },
    observations: advisory.observations || [],
    case_history: advisory.case_history || [],
    possible_explanations: advisory.possible_explanations || [],
    next_steps: advisory.next_steps || [],
    sources: advisory.sources || [],
    advisory_text: advisory.advisory_text || '',
    follow_up_task: payload.follow_up_task || '',
    follow_up_due_date: payload.follow_up_due_date || '',
    approval_status: 'approved',
    follow_up_status: 'pending',
    created_at: new Date().toISOString(),
    demo: true,
  };

  records.push(record);
  persistDemoRecords(records);

  return {
    id: record.id,
    approval_status: record.approval_status,
    follow_up_status: record.follow_up_status,
    created_at: record.created_at,
    demo: true,
  };
}

export function demoLoadAdvisory(id) {
  const record = loadDemoRecords().find((item) => String(item.id) === String(id));
  if (!record) {
    const error = new Error(`Demo record ${id} was not found in this browser.`);
    error.response = { status: 404, data: { detail: `Record ${id} not found.` } };
    throw error;
  }
  return record;
}