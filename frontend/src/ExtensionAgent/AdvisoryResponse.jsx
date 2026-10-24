import { useState } from 'react';
import './AdvisoryResponse.css';

function displayValue(value) {
  return value?.trim() || 'Not provided';
}

export default function AdvisoryResponse({
  report,
  advisory,
  onSave,
  onBack,
  onTaskStatusChange,
  isSaving = false,
  saved = false,
  followUp: savedFollowUp,
}) {
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTask, setFollowUpTask] = useState(advisory?.recommendedActions?.[0] || '');
  const [formError, setFormError] = useState('');

  if (!report || !advisory) {
    return (
      <section className="advisory-page">
        <div className="advisory-empty">
          <h2>No advisory available</h2>
          <p>Submit a farmer report before viewing advisory results.</p>
          {onBack && <button className="advisory-btn advisory-btn-primary" onClick={onBack}>Back to report</button>}
        </div>
      </section>
    );
  }

  const observations = advisory.observations || [];
  const possibleCauses = advisory.possibleCauses || [];
  const recommendedActions = advisory.recommendedActions || [];
  const sources = advisory.sources || [];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!followUpTask.trim()) {
      setFormError('Enter a follow-up task before saving.');
      return;
    }
    if (!followUpDate) {
      setFormError('Choose a due date before saving.');
      return;
    }
    setFormError('');
    onSave?.({
      report,
      advisory,
      followUp: { task: followUpTask.trim(), dueDate: followUpDate, status: 'Pending' },
    });
  };

  return (
    <section className="advisory-page">
      <header className="advisory-page-header">
        <div>
          <span className="advisory-eyebrow">FIELD ADVISORY</span>
          <h1>Advisory results</h1>
          <p>Review what was reported, the available demo guidance, and a follow-up plan.</p>
        </div>
        <span className={`advisory-status ${saved ? 'is-saved' : ''}`}>
          {saved ? 'Saved on this device' : 'Draft for review'}
        </span>
      </header>

      {advisory.demoMode && (
        <div className="advisory-disclaimer" role="note">
          Demo mode: this advisory uses the project&apos;s illustrative guidance notes. It is not an
          independently verified diagnosis or server-saved record.
        </div>
      )}

      <div className="advisory-content">
        <section className="advisory-card" aria-labelledby="case-summary-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">01</span>
            <div><h2 id="case-summary-title">Case summary</h2><p>Report details supplied for this case.</p></div>
          </div>
          <div className="advisory-details-grid">
            <div className="advisory-detail"><span>Farmer</span><strong>{displayValue(report.farmerName)}</strong></div>
            <div className="advisory-detail"><span>Case ID</span><strong>{report.caseId || 'Assigned when saved'}</strong></div>
            <div className="advisory-detail"><span>Crop</span><strong>{displayValue(report.crop)}</strong></div>
            <div className="advisory-detail"><span>Growth stage</span><strong>{displayValue(report.growthStage)}</strong></div>
          </div>
          <div className="advisory-observation"><h3>Reported symptoms</h3><p>{displayValue(report.symptoms)}</p></div>
          <div className="advisory-observation"><h3>Recent field conditions</h3><p>{displayValue(report.fieldConditions)}</p></div>
          {report.clarification && <div className="advisory-observation"><h3>Clarification reported</h3><p>{report.clarification}</p></div>}
        </section>

        <section className="advisory-card" aria-labelledby="observations-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">02</span>
            <div><h2 id="observations-title">Field observations</h2><p>Farmer-reported information is not independently verified.</p></div>
          </div>
          {observations.length ? (
            <ul className="advisory-observation-list">
              {observations.map((item, index) => (
                <li key={`${item.label || 'observation'}-${index}`}>
                  <span>{item.label || 'Farmer-reported'}</span><p>{item.value || item}</p>
                </li>
              ))}
            </ul>
          ) : <p className="advisory-muted-copy">No additional observations were recorded.</p>}
          {advisory.missingInformation?.length > 0 && (
            <div className="advisory-missing" role="note">
              <strong>Information still missing</strong>
              <ul>{advisory.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
        </section>

        <section className="advisory-card" aria-labelledby="causes-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">03</span>
            <div><h2 id="causes-title">Possible explanations</h2><p>Possibilities only; this is not a confirmed diagnosis.</p></div>
          </div>
          {possibleCauses.length ? (
            <div className="advisory-cause-list">
              {possibleCauses.map((cause, index) => (
                <article className="advisory-cause" key={`${cause.title || cause}-${index}`}>
                  <span className="advisory-cause-marker">?</span>
                  <div><h3>{cause.title || 'Possibility to check'}</h3><p>{cause.details || cause}</p></div>
                </article>
              ))}
            </div>
          ) : <p className="advisory-muted-copy">The available notes do not support a specific explanation for this report.</p>}
        </section>

        <section className="advisory-card" aria-labelledby="actions-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">04</span>
            <div><h2 id="actions-title">Recommended next steps</h2><p>Actions below are limited to the displayed guidance.</p></div>
          </div>
          {recommendedActions.length ? (
            <ol className="advisory-action-list">{recommendedActions.map((action, index) => <li key={`${action}-${index}`}>{action}</li>)}</ol>
          ) : <p className="advisory-muted-copy">No matching demo note was found. Record additional observations and consult a qualified local extension professional.</p>}
        </section>

        <section className="advisory-card" aria-labelledby="sources-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">05</span>
            <div><h2 id="sources-title">Source references</h2><p>Only guidance notes matched in this demo workflow are listed.</p></div>
          </div>
          {sources.length ? (
            <div className="advisory-source-list">
              {sources.map((source) => (
                <article className="advisory-source" key={source.id}>
                  <div className="advisory-source-top"><span className="advisory-source-id">{source.id}</span><span className="advisory-source-tag">Demo guidance</span></div>
                  <h3>{source.title}</h3><p>{source.content}</p>
                </article>
              ))}
            </div>
          ) : <div className="advisory-empty-source"><p>No guidance note matched this report, so no source is cited.</p></div>}
        </section>

        <section className="advisory-card advisory-followup-card" aria-labelledby="followup-title">
          <div className="advisory-card-heading">
            <span className="advisory-number">06</span>
            <div><h2 id="followup-title">Follow-up task</h2><p>{saved ? 'Saved task details and status.' : 'Review the task before saving this advisory.'}</p></div>
          </div>
          {saved ? (
            <div className="advisory-saved-task">
              <div><span>Task</span><p>{savedFollowUp?.task || 'No follow-up task recorded.'}</p></div>
              <div><span>Due date</span><p>{savedFollowUp?.dueDate || 'Not set'}</p></div>
              <label className="advisory-form-group" htmlFor="saved-task-status">
                Task status
                <select id="saved-task-status" value={savedFollowUp?.status || 'Pending'} onChange={(event) => onTaskStatusChange?.(event.target.value)} disabled={!onTaskStatusChange}>
                  <option>Pending</option><option>Completed</option>
                </select>
              </label>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="advisory-form-group">
                <label htmlFor="follow-up-task">Task</label>
                <textarea id="follow-up-task" value={followUpTask} onChange={(event) => setFollowUpTask(event.target.value)} maxLength={500} required />
              </div>
              <div className="advisory-form-group">
                <label htmlFor="follow-up-date">Due date</label>
                <input id="follow-up-date" type="date" value={followUpDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setFollowUpDate(event.target.value)} required />
              </div>
              <div className="advisory-task-review" aria-live="polite">
                <strong>Review before saving</strong><p>{followUpTask.trim() || 'Enter a task to review it here.'}</p>
                <span>Due: {followUpDate || 'Choose a date'} · Status: Pending</span>
              </div>
              {formError && <p className="advisory-form-error" role="alert">{formError}</p>}
              <div className="advisory-footer">
                {onBack && <button type="button" className="advisory-btn advisory-btn-secondary" onClick={onBack}>Back to report</button>}
                <button type="submit" className="advisory-btn advisory-btn-primary" disabled={isSaving}>{isSaving ? 'Saving…' : 'Confirm and save advisory'}</button>
              </div>
            </form>
          )}
          {saved && onBack && <div className="advisory-footer"><button className="advisory-btn advisory-btn-secondary" onClick={onBack}>Back to saved cases</button></div>}
        </section>
      </div>
    </section>
  );
}
