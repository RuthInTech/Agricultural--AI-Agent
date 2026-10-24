import { useState, useEffect } from 'react';
import './FarmerReportForm.css';
import { getLocations, getCases, previewAdvisory } from '../api/agent';
import AdvisoryResponse from './AdvisoryResponse';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function FarmerReportForm() {
  const [locations, setLocations] = useState([
    { code: 'SITE-A', name: 'Site A' },
    { code: 'SITE-B', name: 'Site B' },
    { code: 'SITE-C', name: 'Site C' },
  ]);
  const [selectedLocation, setSelectedLocation] = useState('SITE-A');
  const [caseHistories, setCaseHistories] = useState([]);
  const [selectedCaseRef, setSelectedCaseRef] = useState('');

  const [formData, setFormData] = useState({
    farmerName: 'Abebe Tadesse',
    crop: 'Maize',
    growthStage: 'Vegetative (V8)',
    symptoms: 'Yellow leaves observed across the lower canopy following heavy rain.',
    rainfall: 'Heavy rain for 3 days',
    soilCondition: 'Waterlogged on moist clay loam',
    affectedArea: 'Lower leaves across 20% of plot',
    dateObserved: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [advisoryDraft, setAdvisoryDraft] = useState(null);

  // Fetch locations from backend on mount
  useEffect(() => {
    let active = true;
    getLocations()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setLocations(data);
          setSelectedLocation(data[0].code || 'SITE-A');
        }
      })
      .catch((err) => {
        console.warn('Using default locations list:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Fetch previous cases for selected location from backend
  useEffect(() => {
    let active = true;
    getCases(selectedLocation)
      .then((data) => {
        if (active && Array.isArray(data)) {
          setCaseHistories(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load previous cases:', err);
      });
    return () => {
      active = false;
    };
  }, [selectedLocation]);

  const handleLocationChange = (e) => {
    const locCode = e.target.value;
    setSelectedLocation(locCode);
    setSelectedCaseRef('');
  };

  const handleCaseSelect = (e) => {
    const ref = e.target.value;
    setSelectedCaseRef(ref);

    if (!ref) return;

    const matchedCase = caseHistories.find((c) => c.case_ref === ref || c.case_id === ref);
    if (matchedCase) {
      setFormData((prev) => ({
        ...prev,
        farmerName: matchedCase.farmer_name || prev.farmerName,
        crop: matchedCase.crop || 'Maize',
        growthStage: matchedCase.growth_stage || prev.growthStage,
        symptoms: matchedCase.recorded_facts || prev.symptoms,
      }));
      setErrors({});
    }
  };

  const handleQuickPreset = (type) => {
    if (type === 'yellowing') {
      setSelectedLocation('SITE-A');
      setSelectedCaseRef('CASE-001');
      setFormData({
        farmerName: 'Abebe Tadesse',
        crop: 'Maize',
        growthStage: 'Vegetative (V8)',
        symptoms: 'Yellow leaves observed across the lower canopy following heavy rain.',
        rainfall: 'Heavy rain for 3 days',
        soilCondition: 'Waterlogged on moist clay loam',
        affectedArea: 'Lower canopy across 20% of plot',
        dateObserved: new Date().toISOString().split('T')[0],
      });
    } else if (type === 'holes') {
      setSelectedLocation('SITE-B');
      setSelectedCaseRef('CASE-002');
      setFormData({
        farmerName: 'Tigist Bekele',
        crop: 'Maize',
        growthStage: 'Early Whorl',
        symptoms: 'Scattered ragged holes in central leaves with visible chewing marks.',
        rainfall: 'Dry spell conditions with warm weather',
        soilCondition: 'Dry topsoil',
        affectedArea: 'Central whorls on scattered plants',
        dateObserved: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.farmerName.trim()) {
      newErrors.farmerName = 'Farmer name is required.';
    }

    if (!formData.growthStage.trim()) {
      newErrors.growthStage = 'Growth stage is required.';
    }

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Observed symptoms are required.';
    } else if (formData.symptoms.trim().length < 10) {
      newErrors.symptoms = 'Please describe symptoms in more detail (at least 10 characters).';
    }

    if (!formData.rainfall.trim() && !formData.soilCondition.trim()) {
      newErrors.rainfall = 'At least one field condition (rainfall or soil condition) is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    const locationObj = locations.find((l) => l.code === selectedLocation);
    const locationName = locationObj ? locationObj.name : selectedLocation;

    const reportPayload = {
      location_ref: selectedLocation,
      location_name: locationName,
      farmer_name: formData.farmerName,
      crop: formData.crop,
      growth_stage: formData.growthStage,
      symptoms: formData.symptoms,
      field_conditions: {
        rainfall: formData.rainfall,
        soil_condition: formData.soilCondition,
        affected_area: formData.affectedArea,
        date_observed: formData.dateObserved,
      },
    };

    try {
      const draft = await previewAdvisory(reportPayload);
      setAdvisoryDraft({
        draft,
        reportData: reportPayload,
      });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to generate advisory draft. Please verify field report inputs.';
      const missing = err.response?.data?.missing;
      if (missing && Array.isArray(missing)) {
        setSubmitError(`${detail} Missing: ${missing.map((m) => m.message).join(', ')}`);
      } else {
        setSubmitError(detail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If advisory preview draft is ready, render the preview & confirmation screen
  if (advisoryDraft) {
    return (
      <AdvisoryResponse
        draft={advisoryDraft.draft}
        reportData={advisoryDraft.reportData}
        onBackToForm={() => setAdvisoryDraft(null)}
      />
    );
  }

  return (
    <div className="form-card">
      <h1 className="form-title">New Crop Assessment & AI Advisory</h1>
      <p className="form-subtitle">
        Submit maize crop problem observations. The AI agent will validate inputs, retrieve historical location cases, search stored guidance, and generate an evidence-referenced advisory.
      </p>

      {/* Quick Test Presets for Demo Judging */}
      <div className="preset-container">
        <span className="preset-label">Test Case Presets:</span>
        <div className="preset-buttons">
          <button
            type="button"
            className="preset-btn"
            onClick={() => handleQuickPreset('yellowing')}
          >
            GUIDE-001 (Yellow Leaves • Site A)
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => handleQuickPreset('holes')}
          >
            CASE-002 (Pest / Holes • Site B)
          </button>
        </div>
      </div>

      {submitError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', marginBottom: '20px', fontSize: '14px' }}>
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="farmer-form" noValidate>
        <div className="form-row">
          {/* Location Selection */}
          <div className="form-group">
            <label htmlFor="locationSelect" className="form-label">
              Reporting Location <span className="required">*</span>
            </label>
            <select
              id="locationSelect"
              className="form-select"
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {locations.map((loc) => (
                <option key={loc.code || loc.id} value={loc.code || loc.id}>
                  {loc.name} ({loc.code || loc.id})
                </option>
              ))}
            </select>
          </div>

          {/* Previous Case History Selection */}
          <div className="form-group">
            <label htmlFor="caseSelect" className="form-label">
              Previous Case Reference (readCaseHistory)
            </label>
            <select
              id="caseSelect"
              className="form-select"
              value={selectedCaseRef}
              onChange={handleCaseSelect}
            >
              <option value="">-- New Report / No Prior Case --</option>
              {caseHistories.map((c) => (
                <option key={c.case_ref || c.case_id} value={c.case_ref || c.case_id}>
                  {c.case_ref || c.case_id} — {c.farmer_name} ({c.growth_stage})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Farmer Name */}
        <div className="form-group">
          <label htmlFor="farmerName" className="form-label">
            Farmer Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="farmerName"
            name="farmerName"
            value={formData.farmerName}
            onChange={handleChange}
            placeholder="e.g., Abebe Tadesse"
            className={`form-input ${errors.farmerName ? 'input-error' : ''}`}
          />
          {errors.farmerName && <span className="error-text">{errors.farmerName}</span>}
        </div>

        <div className="form-row">
          {/* Crop Selection */}
          <div className="form-group">
            <label htmlFor="crop" className="form-label">
              Crop <span className="required">*</span>
            </label>
            <select id="crop" name="crop" value={formData.crop} onChange={handleChange} className="form-select">
              <option value="Maize">Maize (Corn)</option>
            </select>
          </div>

          {/* Growth Stage */}
          <div className="form-group">
            <label htmlFor="growthStage" className="form-label">
              Growth Stage <span className="required">*</span>
            </label>
            <input
              type="text"
              id="growthStage"
              name="growthStage"
              value={formData.growthStage}
              onChange={handleChange}
              placeholder="e.g., Vegetative (V8), Early Whorl, Tasseling"
              className={`form-input ${errors.growthStage ? 'input-error' : ''}`}
            />
            {errors.growthStage && <span className="error-text">{errors.growthStage}</span>}
          </div>
        </div>

        {/* Symptoms */}
        <div className="form-group">
          <label htmlFor="symptoms" className="form-label">
            Observed Symptoms <span className="required">*</span>
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            rows="3"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="Describe what is visible on leaves, whorls, stalks, or roots (minimum 10 characters)..."
            className={`form-textarea ${errors.symptoms ? 'input-error' : ''}`}
          />
          {errors.symptoms && <span className="error-text">{errors.symptoms}</span>}
        </div>

        {/* Field Conditions */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rainfall" className="form-label">
              Recent Rainfall / Weather Conditions <span className="required">*</span>
            </label>
            <input
              type="text"
              id="rainfall"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleChange}
              placeholder="e.g., Heavy rain for 3 days, dry spell"
              className={`form-input ${errors.rainfall ? 'input-error' : ''}`}
            />
            {errors.rainfall && <span className="error-text">{errors.rainfall}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="soilCondition" className="form-label">
              Soil Condition <span className="required">*</span>
            </label>
            <input
              type="text"
              id="soilCondition"
              name="soilCondition"
              value={formData.soilCondition}
              onChange={handleChange}
              placeholder="e.g., Waterlogged, moist clay loam, dry"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="affectedArea" className="form-label">
              Affected Area / Distribution
            </label>
            <input
              type="text"
              id="affectedArea"
              name="affectedArea"
              value={formData.affectedArea}
              onChange={handleChange}
              placeholder="e.g., Lower canopy across 20% of field"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateObserved" className="form-label">
              Date Observed
            </label>
            <input
              type="date"
              id="dateObserved"
              name="dateObserved"
              value={formData.dateObserved}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Agent Executing readCaseHistory & searchCropGuidance...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Run Agent Workflow (Generate Preview)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}