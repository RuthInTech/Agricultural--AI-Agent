import { useState, useEffect } from 'react';
import './Recommendations.css';
import API from '../../api/axios.js';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const [farmInfo, setFarmInfo] = useState({
    location: "Addis Ababa",
    temperature: "22°C",
    rainfall: "1100 mm",
    soil: "Clay loam",
    elevation: "2,355 m",
  });

  const [cropsData, setCropsData] = useState([]);

  const convertBackendToFrontendFarm = (farm) => {
    return {
      location: farm.location || "Addis Ababa",
      temperature: farm.temperature || farm.avg_temp || "22°C",
      rainfall: farm.rainfall || farm.avg_rainfall || "1100 mm",
      soil: farm.soil || farm.soil_type || "Clay loam",
      elevation: farm.elevation || "2,355 m",
    };
  };

  const convertBackendCrops = (crops) => {
    if (!crops || !Array.isArray(crops)) return [];
    return crops.map((crop, index) => ({
      id: crop.id || `c${index + 1}`,
      name: crop.name || crop.crop_name || "Crop",
      icon: crop.icon || "🌱",
      suitability: crop.suitability || "HIGH",
      category: crop.category || "High Yield",
      growingPeriod: crop.growingPeriod || crop.growing_period || "~4 months",
      waterRequirement: crop.waterRequirement || crop.water_requirement || "Medium",
      phRange: crop.phRange || crop.ph_range || "5.8 - 7.0",
      recommendedFertilizer: crop.recommendedFertilizer || crop.recommended_fertilizer || "DAP / Urea",
      notes: crop.notes || crop.description || "No additional notes provided.",
    }));
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const response = await API.get('/recommendations/');
        console.log('Recommendations data from backend:', response.data);

        if (response.data) {
          if (response.data.farm) {
            setFarmInfo(convertBackendToFrontendFarm(response.data.farm));
          }
          const cropList = Array.isArray(response.data) ? response.data : (response.data.crops || []);
          if (cropList.length > 0) {
            setCropsData(convertBackendCrops(cropList));
          }
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err.response?.data || err.message);
        setStatusMessage({
          type: 'error',
          text: err.response?.data?.detail || 'Could not fetch live recommendations. Displaying default insights.',
        });

        setCropsData([
          {
            id: "c1",
            name: "Maize",
            icon: "🌽",
            suitability: "HIGH",
            category: "High Yield",
            growingPeriod: "~4 months",
            waterRequirement: "Medium",
            phRange: "5.8 - 7.0",
            recommendedFertilizer: "DAP / Urea",
            notes: "Plant at the onset of the main rainy season. Ensure adequate nitrogen application during vegetative growth.",
          },
          {
            id: "c2",
            name: "Wheat",
            icon: "🌾",
            suitability: "HIGH",
            category: "Low Water",
            growingPeriod: "~3.5 months",
            waterRequirement: "Medium-Low",
            phRange: "6.0 - 7.0",
            recommendedFertilizer: "NPS / Urea",
            notes: "Requires well-drained soil and cooler growing conditions. Performs exceptionally well in highland soil.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const filteredCrops = cropsData.filter((crop) => {
    if (activeTab === "All") return true;
    if (activeTab === "High Yield") return crop.category === "High Yield";
    if (activeTab === "Low Water") return crop.waterRequirement.toLowerCase().includes("low");
    return true;
  });

  return (
    <div className="recommendations-container">
      <div className="header-section">
        <h1 className="main-title">Crop Recommendation</h1>
        <p className="sub-title">AI-driven agricultural insights tailored to your field conditions</p>
      </div>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', marginBottom: '20px', borderRadius: '12px', background: statusMessage.type === 'error' ? '#fef2f2' : '#f0fdf4', color: statusMessage.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="status-toast success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <RefreshCw size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontWeight: 600, color: '#1b4332' }}>Analyzing field profile & fetching recommendations...</span>
        </div>
      ) : (
        <>
          <div className="farm-summary-card">
            <div className="farm-summary-header">
              <h2 className="farm-summary-title">Farm Environmental Profile</h2>
              <span className="location-badge">📍 {farmInfo.location}</span>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-icon">🌡️</span>
                <div className="stat-content">
                  <span className="stat-label">Avg Temp</span>
                  <span className="stat-value">{farmInfo.temperature}</span>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">🌧️</span>
                <div className="stat-content">
                  <span className="stat-label">Rainfall</span>
                  <span className="stat-value">{farmInfo.rainfall}</span>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">🧪</span>
                <div className="stat-content">
                  <span className="stat-label">Soil Type</span>
                  <span className="stat-value">{farmInfo.soil}</span>
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">⛰️</span>
                <div className="stat-content">
                  <span className="stat-label">Elevation</span>
                  <span className="stat-value">{farmInfo.elevation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">Recommended Crops</h2>
            <div className="filter-tabs">
              {["All", "High Yield", "Low Water"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="crop-list">
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>No recommendations found matching this filter.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CropCard({ crop }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="crop-card">
      <div className="crop-header">
        <div className="crop-title-group">
          <span className="crop-emoji">{crop.icon}</span>
          <h3 className="crop-name">{crop.name}</h3>
        </div>
        <span className="suitability-badge">
          SUITABILITY: {crop.suitability}
        </span>
      </div>

      <div className="crop-specs-grid">
        <div className="spec-item">
          <span className="spec-label">Growing Period</span>
          <span className="spec-value">{crop.growingPeriod}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Water Requirement</span>
          <span className="spec-value">{crop.waterRequirement}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="extra-details">
          <div className="detail-block">
            <span className="spec-label">Ideal Soil pH</span>
            <span className="spec-value">{crop.phRange}</span>
          </div>
          <div className="detail-block">
            <span className="spec-label">Recommended Fertilizer</span>
            <span className="spec-value">{crop.recommendedFertilizer}</span>
          </div>
          <div className="detail-block full-width">
            <span className="spec-label">Agronomic Tips</span>
            <span className="spec-value">{crop.notes}</span>
          </div>
        </div>
      )}

      <button 
        className="details-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
        <span className={`chevron-icon ${isExpanded ? "rotated" : ""}`}>▼</span>
      </button>
    </div>
  );
}