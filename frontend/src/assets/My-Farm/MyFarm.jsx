import { useState, useEffect } from 'react';
import './MyFarm.css';
import { getFarms, createFarm, updateFarm } from '../../api/farms';
import {
  Building2,
  MapPin,
  Ruler,
  Sprout,
  Mountain,
  Layers,
  Droplets,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function MyFarm() {
  const [formData, setFormData] = useState({
    farmId: null,
    farmName: '',
    location: 'Oromia, East Shewa',
    farmSize: '2.5 Hectares',
    soilType: 'Clay loam',
    elevation: '2,350m',
    topography: 'Gently sloping',
    waterAvailability: 'Seasonal rain & groundwater',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Load existing farm profile on mount
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    getFarms()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          const f = data[0];
          setFormData({
            farmId: f.id,
            farmName: f.farm_name || '',
            location: f.location || '',
            farmSize: f.farm_size || '',
            soilType: f.soil_type || '',
            elevation: f.elevation || '',
            topography: f.topography || '',
            waterAvailability: f.water_availability || '',
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load farm profile:', err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.farmName.trim() || !formData.location.trim()) {
      setStatusMessage({ type: 'error', text: 'Farm Name and Location are required.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      farm_name: formData.farmName,
      location: formData.location,
      farm_size: formData.farmSize,
      soil_type: formData.soilType,
      elevation: formData.elevation,
      topography: formData.topography,
      water_availability: formData.waterAvailability,
    };

    try {
      if (formData.farmId) {
        const updated = await updateFarm(formData.farmId, payload);
        setStatusMessage({ type: 'success', text: 'Farm profile successfully updated in database!' });
      } else {
        const created = await createFarm(payload);
        setFormData((prev) => ({ ...prev, farmId: created.id }));
        setStatusMessage({ type: 'success', text: 'Farm profile successfully created!' });
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to save farm details. Please ensure you are logged in.';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="farm-page-wrapper">
      <div className="farm-container">
        <header className="page-header">
          <div className="header-badge">AgriGuide Telemetry</div>
          <h1 className="page-title">Farm & Plot Profile</h1>
          <p className="page-subtitle">
            Configure land telemetry, soil conditions, and elevation metrics used by the AI agent during crop assessments.
          </p>
        </header>

        {statusMessage && (
          <div className={`status-toast ${statusMessage.type}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ede5', padding: '48px', textAlign: 'center', color: '#2d6a4f' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ fontWeight: 600 }}>Loading farm profile from PostgreSQL...</p>
          </div>
        ) : (
          <form className="farm-form" onSubmit={handleSubmit}>
            <section className="form-card">
              <div className="card-header">
                <div className="icon-badge">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2>General Identification</h2>
                  <p>Location, farm naming, and boundaries</p>
                </div>
              </div>

              <div className="card-grid">
                <div className="form-group full-width">
                  <label htmlFor="farmName">Farm / Plot Name *</label>
                  <div className="input-wrapper">
                    <Building2 className="input-icon" size={18} />
                    <input
                      type="text"
                      id="farmName"
                      name="farmName"
                      placeholder="e.g., East Shewa Demo Plot A"
                      value={formData.farmName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location / Woreda *</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" size={18} />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="e.g., Oromia, East Shewa"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="farmSize">Total Farm Area</label>
                  <div className="input-wrapper">
                    <Ruler className="input-icon" size={18} />
                    <input
                      type="text"
                      id="farmSize"
                      name="farmSize"
                      placeholder="e.g., 2.5 Hectares / 10 Timad"
                      value={formData.farmSize}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="form-card">
              <div className="card-header">
                <div className="icon-badge accent-sprout">
                  <Sprout size={20} />
                </div>
                <div>
                  <h2>Terrain & Soil Profile</h2>
                  <p>Environmental conditions evaluated during guidance retrieval</p>
                </div>
              </div>

              <div className="card-grid">
                <div className="form-group">
                  <label htmlFor="soilType">Primary Soil Type</label>
                  <div className="input-wrapper">
                    <Sprout className="input-icon" size={18} />
                    <input
                      type="text"
                      id="soilType"
                      name="soilType"
                      placeholder="e.g., Clay loam, Vertisol, Sandy loam"
                      value={formData.soilType}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="elevation">Elevation</label>
                  <div className="input-wrapper">
                    <Mountain className="input-icon" size={18} />
                    <input
                      type="text"
                      id="elevation"
                      name="elevation"
                      placeholder="e.g., 2,350m above sea level"
                      value={formData.elevation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="topography">Topography</label>
                  <div className="input-wrapper">
                    <Layers className="input-icon" size={18} />
                    <input
                      type="text"
                      id="topography"
                      name="topography"
                      placeholder="e.g., Gently sloping, Flat plain"
                      value={formData.topography}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="waterAvailability">Water Availability & Source</label>
                  <div className="input-wrapper">
                    <Droplets className="input-icon" size={18} />
                    <input
                      type="text"
                      id="waterAvailability"
                      name="waterAvailability"
                      placeholder="e.g., Seasonal rain, River gravity furrow"
                      value={formData.waterAvailability}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="form-actions-dock">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-save"
                style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}
              >
                <Save size={18} />
                <span>{isSubmitting ? 'Saving to Database...' : formData.farmId ? 'Update Farm Profile' : 'Save Farm Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}