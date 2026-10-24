import { useState } from 'react';
import './AdvisoryResponse.css';
import { confirmAdvisory } from '../api/agent';
import {
  ShieldAlert,
  CheckCircle2,
  BookmarkCheck,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdvisoryResponse({ draft, reportData, onBackToForm }) {
  const navigate = useNavigate();

  const [advisoryText, setAdvisoryText] = useState(draft?.advisory_text || '');
  const [followUpTask, setFollowUpTask] = useState(draft?.follow_up_task || '');
  const [followUpDueDate, setFollowUpDueDate] = useState(draft?.follow_up_due_date || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleConfirmSave = async () => {
    if (!isConfirmed) return;

    setIsSaving(true);
    setSaveError(null);

    const payload = {
      confirmed: true,
      report: reportData,
      advisory: {
        observations: draft.observations || [],
        case_history: draft.case_history || [],
        possible_explanations: draft.possible_explanations || [],
        next_steps: draft.next_steps || [],
        sources: draft.sources || [],
        advisory_text: advisoryText,
        follow_up_task: followUpTask,
        follow_up_due_date: followUpDueDate,
      },
      follow_up_task: followUpTask,
      follow_up_due_date: followUpDueDate,
    };

    try {
      const record = await confirmAdvisory(payload);
      setSavedRecord(record);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save advisory. Ensure explicit confirmation is provided.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // If successfully saved to PostgreSQL database
  if (savedRecord) {
    return (
      <div className="advisory-wrapper">
        <div className="advisory-success-card">
          <CheckCircle2 size={54} color="#16a34a" />
          <h2>Advisory Saved Successfully!</h2>
          <p>
            The field advisory and follow-up task have been permanently recorded to the PostgreSQL database.
            Reference ID: <strong>#{savedRecord.id}</strong> ({savedRecord.crop} • {savedRecord.location_name || savedRecord.location_ref})
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/SavedRecords')}
            >
              <BookmarkCheck size={16} />
              <span>View Saved Advisories</span>
            </button>
            <button
              type="button"
              className="btn-save-confirm"
              onClick={onBackToForm}
            >
              <span>Create Another Crop Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toolCalls = draft?.tool_calls || [];
  const sources = draft?.sources || [];
  const observations = draft?.observations || [];
  const possibleExplanations = draft?.possible_explanations || [];
  const nextSteps = draft?.next_steps || [];
  const matchingCases = draft?.case_history || [];

  return (
    <div className="advisory-wrapper">
      {/* Top Header Card */}
      <div className="advisory-header-card">
        <div className="advisory-header-card__top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onBackToForm}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              title="Return to report form"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="advisory-title">AI Advisory Preview & Review</h1>
          </div>

          <div className="tool-calls-pills">
            {toolCalls.map((tc, idx) => (
              <span key={idx} className={`tool-pill ${tc.status === 'error' ? 'error' : ''}`}>
                <Sparkles size={13} />
                <span>{tc.tool}: {tc.status === 'ok' ? `${tc.count} retrieved` : 'error'}</span>
              </span>
            ))}
          </div>
        </div>

        <p style={{ color: '#4b6354', fontSize: '14.5px' }}>
          Report for <strong>{reportData.crop || 'Maize'}</strong> at <strong>{reportData.location_name || reportData.location_ref}</strong> ({reportData.growth_stage}).
        </p>
      </div>

      {/* Uncertainty & Agricultural Safety Warning Banner */}
      <div className="uncertainty-banner">
        <AlertTriangle size={24} className="uncertainty-banner__icon" />
        <div className="uncertainty-banner__text">
          <h4>Cautious Agricultural Advisory — Human Review Required</h4>
          <p>
            {draft?.evidence_warning ||
              'This advisory draft is generated from retrieved evidence notes and field observations. It represents possible explanations rather than a confirmed diagnosis. Always re-inspect the field and consult a qualified local extension officer before applying chemical treatments.'}
          </p>
        </div>
      </div>

      {/* Field Observations */}
      {observations.length > 0 && (
        <div className="advisory-section">
          <h3 className="advisory-section__title">
            <Info size={19} color="#2d6a4f" />
            <span>Field Observations (Recorded Facts)</span>
          </h3>
          <ul className="bullet-list">
            {observations.map((obs, idx) => (
              <li key={idx} className="bullet-item">
                <CheckCircle2 size={16} />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Relevant Previous Cases */}
      {matchingCases.length > 0 && (
        <div className="advisory-section">
          <h3 className="advisory-section__title">
            <History size={19} color="#2d6a4f" />
            <span>Matching Historical Cases for This Location</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matchingCases.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: '#fbfdfc',
                  border: '1px solid #e2ede5',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#1b4332' }}>{c.case_ref || c.case_id} — {c.farmer_name}</strong>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{c.growth_stage}</span>
                </div>
                <p style={{ color: '#334155', margin: '4px 0' }}>{c.recorded_facts}</p>
                {c.outcome_summary && (
                  <p style={{ color: '#2d6a4f', fontSize: '12.5px', fontWeight: 500 }}>
                    Outcome: {c.outcome_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting Source References */}
      {sources.length > 0 && (
        <div className="advisory-section">
          <h3 className="advisory-section__title">
            <BookOpen size={19} color="#2d6a4f" />
            <span>Supporting Guidance References (Source of Truth)</span>
          </h3>
          <div className="sources-grid">
            {sources.map((src, idx) => (
              <div key={idx} className="source-card">
                <div className="source-card__header">
                  <span className="source-badge">{src.source_id}</span>
                  <span className="source-section">{src.section}</span>
                </div>
                <h4 className="source-title">{src.title}</h4>
                <p className="source-snippet">"{src.snippet}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Possible Explanations */}
      {possibleExplanations.length > 0 && (
        <div className="advisory-section">
          <h3 className="advisory-section__title">
            <HelpCircle size={19} color="#2d6a4f" />
            <span>Evidence-Based Possibilities</span>
          </h3>
          <ul className="bullet-list">
            {possibleExplanations.map((p, idx) => (
              <li key={idx} className="bullet-item">
                <span style={{ fontWeight: 700, color: '#1b4332' }}>• {p.label || 'Possibility'}:</span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="advisory-section">
          <h3 className="advisory-section__title">
            <Clock size={19} color="#2d6a4f" />
            <span>Recommended Next Steps</span>
          </h3>
          <ul className="bullet-list">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="bullet-item">
                <CheckCircle2 size={16} />
                <span>{step.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User Review & Edit Form */}
      <div className="advisory-section">
        <h3 className="advisory-section__title">
          <Sparkles size={19} color="#2d6a4f" />
          <span>Review & Edit Proposed Advisory</span>
        </h3>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '14px' }}>
          As the extension agent, review and adjust the synthesized advisory notes and follow-up plan before final approval.
        </p>

        <div className="edit-box">
          <label htmlFor="editAdvisory">Proposed Advisory Statement</label>
          <textarea
            id="editAdvisory"
            className="edit-textarea"
            rows={5}
            value={advisoryText}
            onChange={(e) => setAdvisoryText(e.target.value)}
          />

          <div className="edit-row">
            <div>
              <label htmlFor="editFollowUp">Proposed Follow-Up Task</label>
              <textarea
                id="editFollowUp"
                className="edit-textarea"
                rows={2}
                value={followUpTask}
                onChange={(e) => setFollowUpTask(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="editDueDate" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} /> Follow-Up Due Date
              </label>
              <input
                type="date"
                id="editDueDate"
                className="edit-textarea"
                style={{ height: '48px', marginBottom: 0 }}
                value={followUpDueDate}
                onChange={(e) => setFollowUpDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {saveError && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13.5px' }}>
            {saveError}
          </div>
        )}

        {/* Explicit Confirmation Box */}
        <div className="confirmation-box">
          <label className="confirm-checkbox-label">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <span>
              I have reviewed this crop advisory, verified the supporting guidance references, and confirmed that the proposed follow-up actions are safe and appropriate.
            </span>
          </label>

          <div className="action-row">
            <button type="button" className="btn-secondary" onClick={onBackToForm}>
              Edit Field Report
            </button>
            <button
              type="button"
              className="btn-save-confirm"
              disabled={!isConfirmed || isSaving}
              onClick={handleConfirmSave}
            >
              {isSaving ? 'Persisting to Database...' : 'Save Approved Advisory'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
