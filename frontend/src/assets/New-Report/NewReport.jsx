import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Info,
  ListChecks,
  LoaderCircle,
  MapPin,
  Pencil,
  Save,
  Sprout,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  apiErrorMessage,
  confirmAdvisory,
  fetchCases,
  fetchLocations,
  previewAdvisory,
  searchGuidance,
} from '../../api/agriguide.js';
import useApiMode from '../../api/useApiMode.js';
import { DEMO_NOTICE, demoLocations } from '../../api/demoData.js';

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Maturity'];
const SOIL_CONDITIONS = ['Dry', 'Moist', 'Waterlogged', 'Unknown'];
const RAINFALL_OPTIONS = ['None', 'Light', 'Moderate', 'Heavy', 'Unknown'];

const EMPTY_FORM = {
  locationId: '',
  crop: 'Maize',
  growthStage: '',
  symptoms: '',
  affectedArea: '',
  rainfall: '',
  soilCondition: '',
  dateObserved: '',
};

const STEP_DEFINITIONS = [
  { key: 'validate', label: 'Validate the report' },
  { key: 'cases', label: 'Retrieve case history' },
  { key: 'guidance', label: 'Search agricultural guidance' },
  { key: 'advisory', label: 'Prepare an advisory for review' },
];

function initialSteps() {
  return STEP_DEFINITIONS.map((step) => ({ ...step, status: 'pending', detail: '' }));
}

function validateForm(form) {
  const errors = {};
  if (!form.locationId) errors.locationId = 'Choose the demo location where the problem was observed.';
  if (!form.crop) errors.crop = 'Select a crop. This demo supports maize.';
  if (!form.growthStage) errors.growthStage = 'Select the current growth stage of the crop.';
  if (!form.symptoms.trim()) {
    errors.symptoms = 'Describe the symptoms you observed — this is required to search for guidance.';
  } else if (form.symptoms.trim().length < 10) {
    errors.symptoms = 'Add a little more detail (at least 10 characters) so relevant guidance can be matched.';
  }
  return errors;
}

function approvalBadgeClass(status) {
  const key = String(status || '').toLowerCase();
  if (['approved', 'saved', 'complete', 'completed'].includes(key)) return 'badge badge--success';
  if (['awaiting_approval', 'awaiting approval', 'pending_review', 'draft', 'proposed'].includes(key)) return 'badge badge--warning';
  if (['rejected', 'cancelled', 'canceled', 'failed'].includes(key)) return 'badge badge--danger';
  return 'badge badge--info';
}

function followUpBadgeClass(status) {
  const key = String(status || '').toLowerCase();
  if (['done', 'completed', 'closed'].includes(key)) return 'badge badge--success';
  if (['overdue', 'failed'].includes(key)) return 'badge badge--danger';
  return 'badge badge--info';
}

function prettifyStatus(status, fallback = 'Unknown') {
  if (!status) return fallback;
  return String(status).replace(/_/g, ' ');
}

function StepIcon({ status }) {
  if (status === 'running') return <LoaderCircle size={18} className="spin" aria-hidden="true" />;
  if (status === 'success') return <CircleCheck size={18} aria-hidden="true" />;
  if (status === 'error') return <CircleAlert size={18} aria-hidden="true" />;
  return <span className="step-dot" aria-hidden="true" />;
}

export default function NewReport() {
  const mode = useApiMode();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [locationsError, setLocationsError] = useState('');
  const [locationsNote, setLocationsNote] = useState('');

  const [phase, setPhase] = useState('editing'); // editing | analyzing | review | saved
  const [steps, setSteps] = useState(initialSteps);
  const [fatalError, setFatalError] = useState('');

  const [advisory, setAdvisory] = useState(null);
  const [retrievedCases, setRetrievedCases] = useState([]);
  const [advisoryText, setAdvisoryText] = useState('');
  const [followUpTask, setFollowUpTask] = useState('');
  const [followUpDue, setFollowUpDue] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveResult, setSaveResult] = useState(null);

  // Load demo locations from the backend (falls back to labelled demo data
  // when the backend is unreachable; HTTP errors surface visibly).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchLocations();
        if (!cancelled) setLocations(list);
      } catch (error) {
        if (cancelled) return;
        setLocations(demoLocations);
        setLocationsError(apiErrorMessage(error));
        setLocationsNote('Showing fictional demo locations (Site A, Site B, Site C) instead.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locationName = useMemo(() => {
    const match = locations.find((loc) => String(loc.id) === String(form.locationId));
    return match ? match.name : '';
  }, [locations, form.locationId]);

  const isDirty = useMemo(
    () =>
      Boolean(
        form.locationId ||
          form.growthStage ||
          form.symptoms ||
          form.affectedArea ||
          form.rainfall ||
          form.soilCondition ||
          form.dateObserved,
      ),
    [form],
  );

  const fallbackObservations = useMemo(() => {
    const list = [];
    if (locationName || form.growthStage) {
      list.push(`${form.crop} at ${locationName || 'unselected location'} — growth stage: ${form.growthStage || 'not given'}.`);
    }
    list.push(`Observed symptoms: ${form.symptoms || '(none provided)'}`);
    if (form.affectedArea) list.push(`Affected area / distribution: ${form.affectedArea}`);
    if (form.rainfall) list.push(`Recent rainfall: ${form.rainfall}`);
    if (form.soilCondition) list.push(`Soil condition: ${form.soilCondition}`);
    if (form.dateObserved) list.push(`Date observed: ${form.dateObserved}`);
    return list;
  }, [form, locationName]);

  // Case history and observations shown in the review panel: prefer the
  // backend preview response, else the results from steps 2–3 or the user's
  // own submitted values (never invented content).
  const displayCases = () => (advisory && advisory.case_history.length > 0 ? advisory.case_history : retrievedCases);
  const displayObservations = () =>
    advisory && advisory.observations.length > 0
      ? advisory.observations
      : fallbackObservations.map((text) => ({ text, label: '' }));

  const buildReport = () => ({
    location_id: form.locationId,
    location_name: locationName,
    crop: form.crop,
    growth_stage: form.growthStage,
    symptoms: form.symptoms.trim(),
    affected_area: form.affectedArea.trim(),
    rainfall: form.rainfall,
    soil_condition: form.soilCondition,
    date_observed: form.dateObserved,
  });

  const setField = (name) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const updateStep = (key, status, detail) => {
    setSteps((prev) => prev.map((step) => (step.key === key ? { ...step, status, detail } : step)));
  };

  const hardReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setPhase('editing');
    setSteps(initialSteps());
    setFatalError('');
    setAdvisory(null);
    setRetrievedCases([]);
    setAdvisoryText('');
    setFollowUpTask('');
    setFollowUpDue('');
    setSaveError('');
    setSaveResult(null);
  };

  const handleReset = () => {
    if (isDirty && !window.confirm('Discard everything entered in this report? This cannot be undone.')) return;
    hardReset();
  };

  const failStep = (key, message, contextLabel) => {
    updateStep(key, 'error', message);
    setFatalError(`${contextLabel}: ${message} Your report details have been kept — fix the issue and try again.`);
    setPhase('editing');
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setFatalError('');
    setSaveError('');
    setSaveResult(null);

    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const report = buildReport();
    setPhase('analyzing');
    setSteps(initialSteps());
    updateStep('validate', 'success', 'All required fields are present.');

    updateStep('cases', 'running', `Reading previous cases for ${report.location_name}…`);
    let cases = [];
    try {
      cases = await fetchCases(report.location_id);
      updateStep(
        'cases',
        'success',
        cases.length > 0 ? `${cases.length} previous case(s) found.` : 'No previous cases exist for this location.',
      );
    } catch (error) {
      failStep('cases', apiErrorMessage(error), 'Step 2 failed — case history could not be retrieved');
      return;
    }

    updateStep('guidance', 'running', 'Searching stored agricultural guidance for maize…');
    let guidance = [];
    try {
      guidance = await searchGuidance({ q: report.symptoms, crop: 'maize' });
      updateStep(
        'guidance',
        'success',
        guidance.length > 0
          ? `${guidance.length} guidance note(s) matched.`
          : 'No relevant guidance matched — an evidence warning will be shown.',
      );
    } catch (error) {
      failStep('guidance', apiErrorMessage(error), 'Step 3 failed — guidance search did not succeed');
      return;
    }

    updateStep('advisory', 'running', 'Assembling an advisory from the retrieved evidence…');
    try {
      const preview = await previewAdvisory(report);
      setAdvisory(preview);
      setAdvisoryText(preview.advisory_text);
      setFollowUpTask(preview.follow_up_task);
      setFollowUpDue(preview.follow_up_due_date);
      setRetrievedCases(cases);
      updateStep('advisory', 'success', 'Advisory ready for review — nothing has been saved yet.');
      setPhase('review');
    } catch (error) {
      failStep('advisory', apiErrorMessage(error), 'Step 4 failed — the advisory could not be prepared');
    }
  };

  const handleEditReport = () => {
    setPhase('editing');
    setSaveError('');
  };

  const handleCancelReview = () => {
    if (isDirty && !window.confirm('Cancel this review and discard the report?')) return;
    hardReset();
  };

  const handleApprove = async () => {
    if (!advisory || saving) return;
    setSaveError('');
    setSaving(true);
    try {
      const saved = await confirmAdvisory({
        report: buildReport(),
        advisory: {
          observations: displayObservations().map((item) => item.text ?? item),
          case_history: displayCases(),
          possible_explanations: advisory.possible_explanations.map((item) => item.text ?? item),
          next_steps: advisory.next_steps.map((item) => item.text ?? item),
          sources: advisory.sources,
          advisory_text: advisoryText,
        },
        follow_up_task: followUpTask.trim(),
        follow_up_due_date: followUpDue,
      });
      setSaveResult(saved);
      setPhase('saved');
    } catch (error) {
      setSaveError(apiErrorMessage(error, 'The record could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const showSteps = phase !== 'editing' || Boolean(fatalError);
  const hasEvidenceWarning = Boolean(advisory) && (advisory.sources.length === 0 || advisory.evidence_warning);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <ClipboardList size={24} strokeWidth={2.2} aria-hidden="true" /> New Report
          </h1>
          <p className="page-subtitle">
            Report a maize problem for a demo location. AgriGuide retrieves previous cases and guidance,
            then prepares a source-referenced advisory for your review. Nothing is saved until you approve it.
          </p>
        </div>
        {phase === 'editing' && isDirty && (
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            <X size={16} aria-hidden="true" /> Reset form
          </button>
        )}
      </div>

      {showSteps && (
        <section className="card step-panel" aria-label="Agent processing status">
          <h2 className="section-title">Agent processing status</h2>
          <ol className="step-list">
            {steps.map((step, index) => (
              <li key={step.key} className={`step step--${step.status}`}>
                <span className={`step-icon step-icon--${step.status}`}>
                  <StepIcon status={step.status} />
                </span>
                <div className="step-body">
                  <span className="step-index">Step {index + 1}</span>
                  <span className="step-label">{step.label}</span>
                  {step.detail && <span className="step-detail">{step.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
          {mode === 'demo' && phase === 'analyzing' && (
            <p className="muted-note">{DEMO_NOTICE} Processing is running on the labelled demo fallback.</p>
          )}
        </section>
      )}

      {(phase === 'editing' || phase === 'analyzing') && (
        <section className="card" aria-label="Crop report form">
          <h2 className="section-title">Crop report</h2>

          {fatalError && (
            <div className="alert alert--error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{fatalError}</span>
            </div>
          )}

          {locationsError && (
            <div className="alert alert--warning" role="status">
              <TriangleAlert size={18} aria-hidden="true" />
              <span>
                Could not load <code>/api/locations/</code>: {locationsError} {locationsNote}
              </span>
            </div>
          )}

          <form className="report-form" onSubmit={handleAnalyze} noValidate>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="location">
                  Demo location <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="location"
                  value={form.locationId}
                  onChange={setField('locationId')}
                  aria-invalid={Boolean(errors.locationId)}
                  aria-describedby={errors.locationId ? 'location-error' : undefined}
                  disabled={phase === 'analyzing'}
                >
                  <option value="">Select a demo location…</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <span className="field-error" id="location-error">
                    <CircleAlert size={14} aria-hidden="true" /> {errors.locationId}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="crop">
                  Crop <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="crop"
                  value={form.crop}
                  onChange={setField('crop')}
                  disabled={phase === 'analyzing'}
                  aria-invalid={Boolean(errors.crop)}
                >
                  <option value="Maize">Maize</option>
                </select>
                <span className="field-hint">Maize is the supported crop for this demo.</span>
                {errors.crop && <span className="field-error">{errors.crop}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="growthStage">
                  Growth stage <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="growthStage"
                  value={form.growthStage}
                  onChange={setField('growthStage')}
                  disabled={phase === 'analyzing'}
                  aria-invalid={Boolean(errors.growthStage)}
                  aria-describedby={errors.growthStage ? 'stage-error' : undefined}
                >
                  <option value="">Select growth stage…</option>
                  {GROWTH_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                {errors.growthStage && (
                  <span className="field-error" id="stage-error">
                    <CircleAlert size={14} aria-hidden="true" /> {errors.growthStage}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="dateObserved">Date observed</label>
                <input
                  id="dateObserved"
                  type="date"
                  value={form.dateObserved}
                  onChange={setField('dateObserved')}
                  disabled={phase === 'analyzing'}
                />
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="symptoms">
                  Observed symptoms <span className="required" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="symptoms"
                  rows={4}
                  value={form.symptoms}
                  onChange={setField('symptoms')}
                  placeholder="Several maize plants have yellow leaves, especially in one part of the field."
                  disabled={phase === 'analyzing'}
                  aria-invalid={Boolean(errors.symptoms)}
                  aria-describedby={errors.symptoms ? 'symptoms-error' : 'symptoms-hint'}
                />
                <span className="field-hint" id="symptoms-hint">
                  Describe what you can actually see: colour, pattern, which parts of the plant, and where in the field.
                </span>
                {errors.symptoms && (
                  <span className="field-error" id="symptoms-error">
                    <CircleAlert size={14} aria-hidden="true" /> {errors.symptoms}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="affectedArea">Affected area / symptom distribution</label>
                <input
                  id="affectedArea"
                  type="text"
                  value={form.affectedArea}
                  onChange={setField('affectedArea')}
                  placeholder="e.g. About a quarter of the field, along the eastern edge"
                  disabled={phase === 'analyzing'}
                />
              </div>

              <div className="form-field">
                <label htmlFor="rainfall">Recent rainfall</label>
                <select id="rainfall" value={form.rainfall} onChange={setField('rainfall')} disabled={phase === 'analyzing'}>
                  <option value="">Not specified</option>
                  {RAINFALL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="soilCondition">Soil condition</label>
                <select
                  id="soilCondition"
                  value={form.soilCondition}
                  onChange={setField('soilCondition')}
                  disabled={phase === 'analyzing'}
                >
                  <option value="">Not specified</option>
                  {SOIL_CONDITIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={phase === 'analyzing'}>
                {phase === 'analyzing' ? (
                  <>
                    <LoaderCircle size={18} className="spin" aria-hidden="true" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sprout size={18} aria-hidden="true" /> Analyze Report
                  </>
                )}
              </button>
              <button type="button" className="btn btn--outline" onClick={handleReset} disabled={phase === 'analyzing'}>
                Reset
              </button>
              {phase === 'analyzing' && (
                <span className="muted-note">Running the four agent steps — please wait…</span>
              )}
            </div>
          </form>
        </section>
      )}

      {(phase === 'review' || phase === 'saved') && advisory && (
        <section className="card review-panel" aria-label="Advisory review">
          <div className="panel-header">
            <div>
              <h2 className="section-title">Advisory for review</h2>
              <p className="panel-sub">
                {phase === 'saved'
                  ? 'This advisory was approved and saved.'
                  : 'Nothing has been saved yet. Review, edit, then explicitly approve.'}
              </p>
            </div>
            <span className={approvalBadgeClass(saveResult?.approval_status || advisory.status)}>
              {phase === 'saved'
                ? `Saved — ${prettifyStatus(saveResult?.approval_status, 'approved')}`
                : prettifyStatus(advisory.status, 'Awaiting approval')}
            </span>
          </div>

          {mode === 'demo' && (
            <div className="alert alert--warning" role="status">
              <TriangleAlert size={18} aria-hidden="true" />
              <span>{DEMO_NOTICE} This advisory was produced by the labelled demo fallback.</span>
            </div>
          )}

          {phase === 'saved' && saveResult && (
            <div className="alert alert--success" role="status">
              <CircleCheck size={18} aria-hidden="true" />
              <span>
                Record <strong>#{saveResult.id}</strong> saved with status “
                {prettifyStatus(saveResult.approval_status, 'approved')}” and follow-up “
                {prettifyStatus(saveResult.follow_up_status, 'pending')}”.
                {mode === 'demo' && (
                  <>
                    {' '}
                    <strong>Demo fallback:</strong> this record is stored in your browser only — it was not
                    written to PostgreSQL.
                  </>
                )}
              </span>
            </div>
          )}

          {saveError && (
            <div className="alert alert--error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>Saving failed — nothing was stored. {saveError}</span>
            </div>
          )}

          <div className="review-grid">
            <div className="review-col">
              <h3 className="review-heading">
                <Info size={16} aria-hidden="true" /> Submitted observations
              </h3>
              <ul className="evidence-list">
                {displayObservations().map((item, index) => (
                  <li key={`obs-${index}`}>{item.text ?? item}</li>
                ))}
              </ul>

              <h3 className="review-heading">
                <MapPin size={16} aria-hidden="true" /> Relevant previous cases
              </h3>
              {displayCases().length > 0 ? (
                <ul className="case-list">
                  {displayCases().map((item, index) => (
                    <li key={item.id || `case-${index}`} className="case-item">
                      <div className="case-item-head">
                        <span className="source-id">Case {item.id || `#${index + 1}`}</span>
                        {item.recorded_on && <span className="case-date">{item.recorded_on}</span>}
                      </div>
                      <p>{item.symptom_summary}</p>
                      {item.outcome_summary && <p className="muted-note">{item.outcome_summary}</p>}
                      {item.demo && <span className="badge badge--neutral">Fictional demo case</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-inline">No previous cases were found for this location.</p>
              )}

              <h3 className="review-heading">
                <TriangleAlert size={16} aria-hidden="true" /> Possible explanations
              </h3>
              <ul className="explanation-list">
                {advisory.possible_explanations.map((item, index) => (
                  <li key={`exp-${index}`}>
                    <span className="badge badge--warning">{item.label || 'Possibility'}</span>
                    <span className="badge badge--neutral">Not a confirmed diagnosis</span>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>

              <h3 className="review-heading">
                <ListChecks size={16} aria-hidden="true" /> Suggested observations and next steps
              </h3>
              <ol className="next-steps">
                {advisory.next_steps.map((item, index) => (
                  <li key={`step-${index}`}>{item.text ?? item}</li>
                ))}
              </ol>
            </div>

            <div className="review-col">
              <h3 className="review-heading">
                <ClipboardList size={16} aria-hidden="true" /> Source references
              </h3>
              {advisory.sources.length > 0 ? (
                <ul className="source-list">
                  {advisory.sources.map((source, index) => (
                    <li key={source.source_id || `src-${index}`} className="source-item">
                      <div className="source-item-head">
                        <span className="source-id">{source.source_id}</span>
                        {source.section && <span className="source-section">{source.section}</span>}
                      </div>
                      <span className="source-title">{source.title}</span>
                      {source.snippet && <p className="source-snippet">{source.snippet}</p>}
                      {source.demo && <span className="badge badge--neutral">Fictional demo source</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="alert alert--warning" role="status">
                  <TriangleAlert size={18} aria-hidden="true" />
                  <span>
                    {advisory.evidence_warning ||
                      'No relevant guidance was found for this report.'}{' '}
                    The advisory above rests only on your submitted observations. Treat every explanation as
                    unverified and consult a qualified local agricultural professional.
                  </span>
                </div>
              )}

              {hasEvidenceWarning && advisory.sources.length > 0 && advisory.evidence_warning && (
                <div className="alert alert--warning" role="status">
                  <TriangleAlert size={18} aria-hidden="true" />
                  <span>{advisory.evidence_warning}</span>
                </div>
              )}

              <h3 className="review-heading">
                <Pencil size={16} aria-hidden="true" /> Advisory (editable)
              </h3>
              <textarea
                className="review-textarea"
                rows={7}
                value={advisoryText}
                onChange={(event) => setAdvisoryText(event.target.value)}
                disabled={phase === 'saved' || saving}
                aria-label="Advisory text, editable"
              />

              <h3 className="review-heading">
                <Calendar size={16} aria-hidden="true" /> Follow-up task (editable)
              </h3>
              <textarea
                className="review-textarea"
                rows={3}
                value={followUpTask}
                onChange={(event) => setFollowUpTask(event.target.value)}
                disabled={phase === 'saved' || saving}
                aria-label="Follow-up task, editable"
              />
              <div className="form-field">
                <label htmlFor="followUpDue">Follow-up due date</label>
                <input
                  id="followUpDue"
                  type="date"
                  value={followUpDue}
                  onChange={(event) => setFollowUpDue(event.target.value)}
                  disabled={phase === 'saved' || saving}
                />
              </div>

              <h3 className="review-heading">Record status</h3>
              <div className="badge-row">
                <span className={approvalBadgeClass(saveResult?.approval_status || advisory.status)}>
                  Approval: {prettifyStatus(saveResult?.approval_status || advisory.status, 'Awaiting approval')}
                </span>
                <span className={followUpBadgeClass(saveResult?.follow_up_status || 'pending')}>
                  Follow-up: {prettifyStatus(saveResult?.follow_up_status || 'pending')}
                </span>
              </div>
            </div>
          </div>

          <p className="disclaimer">
            This demonstration tool does not replace qualified local agricultural advice. Possibilities listed
            above are not confirmed diagnoses, and no treatment is prescribed here.
          </p>

          <div className="form-actions">
            {phase === 'review' ? (
              <>
                <button type="button" className="btn btn--primary" onClick={handleApprove} disabled={saving}>
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="spin" aria-hidden="true" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save size={18} aria-hidden="true" /> Approve and Save
                    </>
                  )}
                </button>
                <button type="button" className="btn btn--outline" onClick={handleEditReport} disabled={saving}>
                  <Pencil size={16} aria-hidden="true" /> Edit Report
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleCancelReview} disabled={saving}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <NavLink to="/records" className="btn btn--primary">
                  Open Saved Records
                </NavLink>
                <button type="button" className="btn btn--outline" onClick={hardReset}>
                  Create another report
                </button>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
