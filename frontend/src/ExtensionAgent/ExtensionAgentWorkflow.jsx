import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdvisoryResponse from './AdvisoryResponse.jsx';
import FarmerReportForm from './FarmerReportForm.jsx';
import { caseHistories, guidanceNotes } from '../data/demoData.js';

const STORAGE_KEY = 'agrivox-demo-advisories';

function loadRecords() {
  const rawRecords = localStorage.getItem(STORAGE_KEY);
  if (!rawRecords) return [];
  const parsedRecords = JSON.parse(rawRecords);
  if (!Array.isArray(parsedRecords)) throw new Error('Saved demo cases have an invalid format.');
  return parsedRecords;
}

function matchGuidance(report) {
  const reportText = `${report.symptoms} ${report.fieldConditions}`.toLowerCase();
  if (/yellow|chlorosis/.test(reportText)) return guidanceNotes.find((note) => note.id === 'GUIDE-001');
  if (/hole|chew|frass|larva/.test(reportText)) return guidanceNotes.find((note) => note.id === 'GUIDE-002');
  if (/roll|wilt/.test(reportText)) return guidanceNotes.find((note) => note.id === 'GUIDE-003');
  return null;
}

function getClarificationQuestion(report, note) {
  if (!note) return '';
  const reportText = `${report.symptoms} ${report.fieldConditions}`.toLowerCase();
  if (note.id === 'GUIDE-001') {
    const hasDistribution = /lower|upper|central|patch|throughout|scattered|tip|edge/.test(reportText);
    const hasSoilCondition = /soil|moist|wet|dry|drain/.test(reportText);
    if (!hasDistribution || !hasSoilCondition) {
      return 'Which leaves are affected, and what is the soil condition (for example, moist, wet, or dry)?';
    }
  }
  if (note.id === 'GUIDE-002') {
    const hasAffectedShare = /\b\d+\s?%|percent|proportion|out of\b/.test(reportText);
    const hasPestSign = /frass|larvae|caterpillar|no insect|not observed/.test(reportText);
    if (!hasAffectedShare || !hasPestSign) {
      return 'About what proportion of plants is affected, and were larvae or frass observed? Say “not observed” or “not recorded” if unknown.';
    }
  }
  if (note.id === 'GUIDE-003') {
    const hasRecoveryDetail = /overnight|at night|recover|midday|noon/.test(reportText);
    const hasSoilCondition = /soil|moist|wet|dry/.test(reportText);
    if (!hasRecoveryDetail || !hasSoilCondition) {
      return 'Do the leaves recover overnight, and what is the soil moisture condition?';
    }
  }
  return '';
}

function buildAdvisory(report) {
  const source = matchGuidance(report);
  const relatedCase = caseHistories.find((item) => item.case_id === report.caseId);
  const observations = [
    { label: 'Reported symptoms', value: report.symptoms },
    { label: 'Reported field conditions', value: report.fieldConditions },
  ];
  if (report.clarification) observations.push({ label: 'Farmer clarification', value: report.clarification });
  if (relatedCase) {
    observations.push({ label: 'Earlier demo case history', value: relatedCase.recorded_facts });
    relatedCase.previous_follow_ups.forEach((followUp) => {
      observations.push({
        label: 'Prior demo follow-up',
        value: `${followUp.task} · Due ${followUp.date} · ${followUp.status}`,
      });
    });
  }

  let possibleCauses = [];
  let recommendedActions = [];
  if (source?.id === 'GUIDE-001') {
    possibleCauses = [{
      title: 'More than one cause is possible',
      details: 'The guidance note says yellow leaves can have multiple causes and that leaf colour alone does not identify one.',
    }];
    recommendedActions = [
      'Record the affected leaves, symptom distribution, soil condition, growth stage, and recent field conditions.',
      'Do not conclude the cause from leaf colour alone.',
    ];
  } else if (source?.id === 'GUIDE-002') {
    possibleCauses = [{
      title: 'Pest activity is one possibility to check',
      details: 'The note associates holes or chewing with possible pest activity, including larvae in the whorl; the report does not confirm a pest.',
    }];
    recommendedActions = [
      'Record the estimated share of affected plants, whether frass or larvae are present, and recent weather.',
      'Check infestation levels; the note does not support assuming chemical treatment is necessary.',
    ];
  } else if (source?.id === 'GUIDE-003') {
    possibleCauses = [{
      title: 'Moisture stress is one possibility to check',
      details: 'The note lists moisture stress or drought as possible explanations for inward leaf rolling; this report does not confirm either.',
    }];
    recommendedActions = [
      'Check whether leaves recover overnight, soil moisture, and crop growth stage.',
      'Use those observations to distinguish temporary heat stress from persistent water deficit.',
    ];
  }

  const clarificationIsUnknown = /not recorded|not observed|unknown|not sure|do not know|don't know/i.test(report.clarification || '');
  const clarificationQuestion = getClarificationQuestion(report, source);
  return {
    demoMode: true,
    observations,
    possibleCauses,
    recommendedActions,
    sources: source ? [source] : [],
    missingInformation: clarificationIsUnknown && clarificationQuestion ? [clarificationQuestion] : [],
    relatedFollowUps: relatedCase?.previous_follow_ups || [],
  };
}

function dateLabel(value) {
  if (!value) return 'Date not recorded';
  return new Date(value).toLocaleDateString();
}

export default function ExtensionAgentWorkflow() {
  const location = useLocation();
  const navigate = useNavigate();
  const archiveRoute = location.pathname === '/Advisories';
  const [storedState] = useState(() => {
    try {
      return { records: loadRecords(), error: '' };
    } catch (error) {
      return { records: [], error: error.message || 'Saved demo cases could not be read from this browser.' };
    }
  });
  const [view, setView] = useState('form');
  const [savedRecords, setSavedRecords] = useState(storedState.records);
  const [storageError, setStorageError] = useState(storedState.error);
  const [workflowError, setWorkflowError] = useState('');
  const [draftReport, setDraftReport] = useState(null);
  const [draftAdvisory, setDraftAdvisory] = useState(null);
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeView = archiveRoute ? (selectedRecord ? 'saved' : 'records') : view;

  const handleReportSubmit = async (report) => {
    setIsLoading(true);
    setWorkflowError('');
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const normalizedReport = {
      ...report,
      caseId: report.caseId || `DEMO-${Date.now().toString(36).toUpperCase()}`,
    };
    const question = getClarificationQuestion(normalizedReport, matchGuidance(normalizedReport));
    setDraftReport(normalizedReport);
    setIsLoading(false);
    if (question) {
      setClarificationQuestion(question);
      setClarificationAnswer('');
      setView('clarification');
      return;
    }
    setDraftAdvisory(buildAdvisory(normalizedReport));
    setView('results');
  };

  const handleClarificationSubmit = (event) => {
    event.preventDefault();
    if (!clarificationAnswer.trim()) return;
    const clarifiedReport = { ...draftReport, clarification: clarificationAnswer.trim() };
    setDraftReport(clarifiedReport);
    setDraftAdvisory(buildAdvisory(clarifiedReport));
    setView('results');
  };

  const handleSaveAdvisory = async ({ report, advisory, followUp }) => {
    if (isSaving) return;
    setIsSaving(true);
    setWorkflowError('');
    try {
      const caseId = report.caseId || `DEMO-${Date.now().toString(36).toUpperCase()}`;
      const record = {
        recordId: `${caseId}-${Date.now()}`,
        caseId,
        report: { ...report, caseId },
        advisory,
        followUp,
        status: 'Approved',
        savedAt: new Date().toISOString(),
        storageType: 'browser-demo',
      };
      const nextRecords = [record, ...savedRecords];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
      setSavedRecords(nextRecords);
      setStorageError('');
      setDraftReport(record.report);
      setDraftAdvisory(record.advisory);
      setSelectedRecord(record);
      setView('saved');
    } catch (error) {
      setWorkflowError(error.message || 'The advisory could not be saved in this browser.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskStatusChange = (status) => {
    if (!selectedRecord || !['Pending', 'Completed'].includes(status)) return;
    const nextRecords = savedRecords.map((record) => record.recordId === selectedRecord.recordId
      ? { ...record, followUp: { ...record.followUp, status } }
      : record);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
      setSavedRecords(nextRecords);
      setSelectedRecord((record) => ({ ...record, followUp: { ...record.followUp, status } }));
    } catch (error) {
      setWorkflowError(error.message || 'The task status could not be updated in this browser.');
    }
  };

  const openSavedRecord = (record) => {
    setSelectedRecord(record);
    setView('saved');
  };

  const showArchive = () => navigate('/Advisories');
  const showForm = () => {
    setView('form');
    setSelectedRecord(null);
    navigate('/Recommendations');
  };
  const closeSavedRecord = () => {
    setSelectedRecord(null);
    if (!archiveRoute) showArchive();
  };

  return (
    <div className="extension-workflow">
      <div className="extension-workflow-topline">
        <div>
          <span className="extension-workflow-kicker">AGRI-INTELLIGENCE / EXTENSION</span>
          <h1>Field advisory workspace</h1>
        </div>
        <span className="extension-local-badge">Demo records stored in this browser</span>
      </div>

      {storageError && <p className="extension-message is-error" role="alert">{storageError} Records are not server-backed.</p>}
      {workflowError && <p className="extension-message is-error" role="alert">{workflowError}</p>}

      {activeView === 'form' && (
        <FarmerReportForm
          onSubmitReport={handleReportSubmit}
          onViewSaved={showArchive}
          isLoading={isLoading}
          initialData={draftReport}
        />
      )}

      {activeView === 'clarification' && draftReport && (
        <section className="extension-clarification">
          <span className="extension-workflow-kicker">ONE MORE FIELD DETAIL</span>
          <h2>Clarify before the advisory</h2>
          <p>{clarificationQuestion}</p>
          <form onSubmit={handleClarificationSubmit}>
            <label htmlFor="report-clarification">Farmer&apos;s response</label>
            <textarea
              id="report-clarification"
              value={clarificationAnswer}
              onChange={(event) => setClarificationAnswer(event.target.value)}
              placeholder="Enter the response, or note that it was not recorded."
              maxLength={500}
              required
            />
            <div className="extension-clarification-actions">
              <button type="button" className="extension-secondary-btn" onClick={() => setView('form')}>Edit report</button>
              <button type="submit" className="extension-primary-btn">Continue to advisory</button>
            </div>
          </form>
        </section>
      )}

      {activeView === 'results' && (
        <AdvisoryResponse
          report={draftReport}
          advisory={draftAdvisory}
          onSave={handleSaveAdvisory}
          onBack={() => setView('form')}
          isSaving={isSaving}
        />
      )}

      {activeView === 'records' && (
        <section className="extension-records">
          <div className="extension-records-heading">
            <div><span className="extension-workflow-kicker">LOCAL DEMO ARCHIVE</span><h2>Saved advisory cases</h2></div>
            <button type="button" className="extension-primary-btn" onClick={showForm}>New report</button>
          </div>
          <p className="extension-records-note">These records exist only in this browser and are not stored by the server.</p>
          {savedRecords.length ? (
            <div className="extension-record-list">
              {savedRecords.map((record) => (
                <article className="extension-record-row" key={record.recordId}>
                  <div className="extension-record-main">
                    <span className="extension-record-id">{record.caseId}</span>
                    <h3>{record.report?.farmerName || 'Unnamed farmer'} · {record.report?.crop || 'Crop not recorded'}</h3>
                    <p>{record.advisory?.sources?.[0]?.title || 'No guidance note matched'} · Saved {dateLabel(record.savedAt)}</p>
                  </div>
                  <div className="extension-record-meta">
                    <span className="extension-record-status">{record.followUp?.status || 'No task'}</span>
                    <span>Due {dateLabel(record.followUp?.dueDate)}</span>
                    <button type="button" className="extension-secondary-btn" onClick={() => openSavedRecord(record)}>Open case</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="extension-records-empty">
              <h3>No saved advisory cases</h3>
              <p>Approved demo advisories and their follow-up tasks will appear here.</p>
              <button type="button" className="extension-primary-btn" onClick={showForm}>Start a report</button>
            </div>
          )}
        </section>
      )}

      {activeView === 'saved' && selectedRecord && (
        <AdvisoryResponse
          report={selectedRecord.report}
          advisory={selectedRecord.advisory}
          followUp={selectedRecord.followUp}
          saved
          onTaskStatusChange={handleTaskStatusChange}
          onBack={closeSavedRecord}
        />
      )}
    </div>
  );
}