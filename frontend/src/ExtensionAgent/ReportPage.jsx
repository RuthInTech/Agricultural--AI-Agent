import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FarmerReportForm from './FarmerReportForm.jsx';
import AdvisoryResponse from './AdvisoryResponse.jsx';
import {
  apiErrorMessage,
  confirmAdvisory,
  fetchCases,
  fetchLocations,
  previewAdvisory,
} from '../api/agriguide.js';
import useApiMode from '../api/useApiMode.js';
import { DEMO_NOTICE } from '../api/demoData.js';

// Map backend `missing[].field` (snake_case) to the form's error keys.
const FIELD_MAP = {
  location: 'location',
  growth_stage: 'growthStage',
  symptoms: 'symptoms',
  field_conditions: 'field_conditions',
};

function missingToFieldErrors(missing) {
  const out = {};
  (missing || []).forEach((item) => {
    const key = FIELD_MAP[item.field] || item.field;
    out[key] = item.message;
  });
  return out;
}

export default function ReportPage() {
  const mode = useApiMode();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [cases, setCases] = useState([]);

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);

  const [report, setReport] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewError, setPreviewError] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedRecord, setSavedRecord] = useState(null);

  // Load locations once.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingLocations(true);
      try {
        const list = await fetchLocations();
        if (!active) return;
        setLocations(list);
        if (list.length > 0) setSelectedLocation((prev) => prev || String(list[0].code));
      } catch (err) {
        if (active) setLocations([]);
      } finally {
        if (active) setLoadingLocations(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load cases whenever the selected location changes.
  useEffect(() => {
    let active = true;
    if (!selectedLocation) {
      setCases([]);
      return;
    }
    (async () => {
      setLoadingCases(true);
      try {
        const list = await fetchCases(selectedLocation);
        if (active) setCases(list);
      } catch (err) {
        if (active) setCases([]);
      } finally {
        if (active) setLoadingCases(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedLocation]);

  const handlePreview = useCallback(async (submittedReport) => {
    setReport(submittedReport);
    setAdvisory(null);
    setSavedRecord(null);
    setPreviewError('');
    setSaveError('');
    setIsLoadingPreview(true);

    // Map the report's field_conditions into the shape the backend reads.
    const payload = { ...submittedReport };
    try {
      const draft = await previewAdvisory(payload);
      setAdvisory(draft);
    } catch (err) {
      const data = err.response?.data;
      if (Array.isArray(data?.missing)) {
        setFieldErrors(missingToFieldErrors(data.missing));
        setPreviewError(data?.detail || 'The report is missing required information.');
      } else {
        setPreviewError(apiErrorMessage(err, 'The advisory could not be generated.'));
      }
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  const handleConfirm = useCallback(
    async (edited) => {
      setIsSaving(true);
      setSaveError('');
      const payload = {
        report,
        advisory: { ...advisory, advisory_text: edited.advisory_text },
        follow_up_task: edited.follow_up_task,
        follow_up_due_date: edited.follow_up_due_date,
      };
      try {
        const record = await confirmAdvisory(payload);
        setSavedRecord(record);
        setAdvisory(null);
      } catch (err) {
        if (err.response?.status === 401) {
          setSaveError('Saving requires you to be logged in. Please log in, then approve again.');
        } else {
          setSaveError(apiErrorMessage(err, 'The record could not be saved.'));
        }
      } finally {
        setIsSaving(false);
      }
    },
    [report, advisory],
  );

  const handleReset = useCallback(() => {
    setReport(null);
    setAdvisory(null);
    setSavedRecord(null);
    setFieldErrors({});
    setPreviewError('');
    setSaveError('');
  }, []);

  // Return to the form to edit, PRESERVING the submitted report (never
  // silently discard user input).
  const handleEdit = useCallback(() => {
    setAdvisory(null);
    setSavedRecord(null);
    setPreviewError('');
    setSaveError('');
    setFieldErrors({});
  }, []);

  return (
    <div className="page" style={{ padding: '1rem' }}>
      {mode === 'demo' && (
        <div
          className="adv-alert adv-alert--warning"
          role="status"
          style={{ maxWidth: 760, margin: '1rem auto' }}
        >
          <span>
            <strong>Demo mode.</strong> {DEMO_NOTICE} The backend is unreachable, so results come
            from fictional demonstration data and are not persisted.
          </span>
        </div>
      )}

      {savedRecord ? (
        <div className="adv-card">
          <h2 className="adv-title">Record saved</h2>
          <p className="adv-subtitle">
            The approved advisory was stored as Record #{savedRecord.id} with follow-up status{' '}
            <strong>{savedRecord.follow_up_status}</strong>. You can reopen it any time.
          </p>
          <div className="adv-actions">
            <Link to="/SavedRecords" className="adv-btn adv-btn--primary" style={{ textDecoration: 'none' }}>
              Open Saved Records
            </Link>
            <button type="button" className="adv-btn adv-btn--ghost" onClick={handleReset}>
              Create another report
            </button>
          </div>
        </div>
      ) : advisory ? (
        <>
          {previewError && (
            <div className="adv-alert adv-alert--error" role="alert" style={{ maxWidth: 760, margin: '1rem auto' }}>
              <span>{previewError}</span>
            </div>
          )}
          <AdvisoryResponse
            advisory={advisory}
            report={report}
            mode={mode}
            isSaving={isSaving}
            saveError={saveError}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onReset={handleReset}
          />
        </>
      ) : (
        <>
          {previewError && (
            <div className="adv-alert adv-alert--error" role="alert" style={{ maxWidth: 650, margin: '1rem auto' }}>
              <span>{previewError}</span>
            </div>
          )}
          <FarmerReportForm
            locations={locations}
            cases={cases}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            onSubmitReport={handlePreview}
            isLoading={isLoadingPreview || loadingLocations || loadingCases}
            fieldErrors={fieldErrors}
            initialReport={report}
          />
        </>
      )}
    </div>
  );
}
