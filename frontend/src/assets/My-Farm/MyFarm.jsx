import './MyFarm.css';
import {useState} from 'react';
import {Building2, MapPin, Ruler, Sprout, Mountain, Layers, Droplets, Save, RefreshCw, CheckCircle2, AlertCircle} from 'lucide-react';

export default function MyFarm({ initialData = null, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    farmId: initialData?.id || null,
    farmName: initialData?.farmName || '',
    location: initialData?.location || '',
    farmSize: initialData?.farmSize || '',
    soilType: initialData?.soilType || '',
    elevation: initialData?.elevation || '',
    topography: initialData?.topography || '',
    waterAvailability: initialData?.waterAvailability || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      console.log('Sending POST Payload to Backend:', formData);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Example API Call:
      // const response = await fetch('/api/farms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      // Simulate delay for testing UI


      setStatusMessage({ type: 'success', text: 'Farm profile created successfully!' });
      if (onSaveSuccess) onSaveSuccess(formData);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to save farm details. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!formData.farmId) {
      setStatusMessage({ type: 'error', text: 'No existing farm ID found to update. Click "Save Farm" instead.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      console.log(`Sending PUT Payload for Farm ID ${formData.farmId}:`, formData);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatusMessage({ type: 'success', text: 'Farm profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to update farm details. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="farm-page-wrapper">
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      <div className="farm-container">
        <header className="page-header">
          <div className="header-badge">AgriVox Intelligence</div>
          <h1 className="page-title">My Farm Profile</h1>
          <p className="page-subtitle">Configure land metrics to generate accurate agricultural & market insights.</p>
        </header>

        {statusMessage && (
          <div className={`status-toast ${statusMessage.type}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form className="farm-form">
          <section className="form-card">
            <div className="card-header">
              <div className="icon-badge">
                <Building2 size={20} />
              </div>
              <div>
                <h2>General Identification</h2>
                <p>Basic location and ownership details</p>
              </div>
            </div>

            <div className="card-grid">
              <div className="form-group full-width">
                <label htmlFor="farmName">Farm Name</label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" size={18} />
                  <input
                    type="text"
                    id="farmName"
                    name="farmName"
                    placeholder="e.g., Green Valley Organic Farm"
                    value={formData.farmName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="e.g., Oromia, East Shewa"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="farmSize">Farm Size</label>
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
                <p>Environmental variables used for crop advisories</p>
              </div>
            </div>

            <div className="card-grid">
              <div className="form-group">
                <label htmlFor="soilType">Soil Type</label>
                <div className="input-wrapper">
                  <Sprout className="input-icon" size={18} />
                  <input
                    type="text"
                    id="soilType"
                    name="soilType"
                    placeholder="e.g., Black teff soil, Clay loam"
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
                <label htmlFor="waterAvailability">Water Availability</label>
                <div className="input-wrapper">
                  <Droplets className="input-icon" size={18} />
                  <input
                    type="text"
                    id="waterAvailability"
                    name="waterAvailability"
                    placeholder="e.g., Seasonal rain, River irrigation"
                    value={formData.waterAvailability}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="form-actions-dock">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="btn btn-update"
            >
              <RefreshCw size={18} className={isSubmitting ? 'spin' : ''} />
              <span>{isSubmitting ? 'Updating...' : 'Update Farm'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="btn btn-save"
            >
              <Save size={18} />
              <span>{isSubmitting ? 'Saving...' : 'Save Farm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}