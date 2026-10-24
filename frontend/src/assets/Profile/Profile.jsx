import { useState, useEffect } from 'react';
import './Profile.css';
import API from '../../api/axios.js';
import { User, Mail, Phone, MapPin, Sprout, Layers, Droplets, Edit3, Save, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    farmSize: '',
    primaryCrops: '',
    soilType: '',
    irrigationType: '',
  });

  const convertBackendToFrontendProfile = (data) => ({
    firstName: data.first_name || data.firstName || '',
    lastName: data.last_name || data.lastName || '',
    email: data.email || '',
    phoneNumber: data.phone_number || data.phoneNumber || '',
    location: data.location || data.region || 'Addis Ababa, Ethiopia',
    farmSize: data.farm_size || data.farmSize || '2.5',
    primaryCrops: data.primary_crops || data.primary_crop || data.primaryCrops || 'Maize, Teff',
    soilType: data.soil_type || data.soilType || 'Loam',
    irrigationType: data.irrigation_type || data.irrigationType || 'Rainfed',
  });

  useEffect(() => {
    const fetchProfileAndFarmData = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const response = await API.get('/profile/');
        console.log('Profile data loaded:', response.data);

        if (response.data) {
          setUserData(convertBackendToFrontendProfile(response.data));
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err.response?.data || err.message);
        setStatusMessage({
          type: 'error',
          text: 'Could not connect to backend. Showing offline profile values.',
        });

        setUserData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          location: '',
          farmSize: '',
          primaryCrops: '',
          soilType: '',
          irrigationType: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndFarmData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone_number: userData.phoneNumber,
      location: userData.location,
      farm_size: userData.farmSize,
      primary_crops: userData.primaryCrops,
      soil_type: userData.soilType,
      irrigation_type: userData.irrigationType,
    };

    try {
      await API.put('/profile/update/', payload);
      setStatusMessage({ type: 'success', text: 'Profile and farm settings saved!' });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err.response?.data || err.message);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save changes to backend.',
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <RefreshCw size={24} className="spin" />
        <span>Loading profile information...</span>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card-header">
        <div className="avatar-circle">
          <User size={38} color="#0e7537" />
        </div>
        <div className="user-title-group">
          <h2>{`${userData.firstName} ${userData.lastName}`.trim() || 'AgriVox User'}</h2>
          <span className="user-role-badge">Verified Farmer</span>
        </div>
        <button
          className={`action-btn ${isEditing ? 'save-btn' : 'edit-btn'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <RefreshCw size={16} className="spin" />
          ) : isEditing ? (
            <>
              <Save size={16} /> Save Changes
            </>
          ) : (
            <>
              <Edit3 size={16} /> Edit Profile
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-section-card">
          <h3 className="section-title">Personal Details</h3>

          <div className="input-group">
            <label>First Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="text"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <h3 className="section-title">Farm & Location Specs</h3>

          <div className="input-group">
            <label>Location / Region</label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                name="location"
                value={userData.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Farm Size (Hectares)</label>
            <div className="input-wrapper">
              <Sprout size={18} className="input-icon" />
              <input
                type="text"
                name="farmSize"
                value={userData.farmSize}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Primary Crop(s)</label>
            <div className="input-wrapper">
              <Sprout size={18} className="input-icon" />
              <input
                type="text"
                name="primaryCrops"
                value={userData.primaryCrops}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Soil Type</label>
            <div className="input-wrapper">
              <Layers size={18} className="input-icon" />
              <input
                type="text"
                name="soilType"
                value={userData.soilType}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Irrigation System</label>
            <div className="input-wrapper">
              <Droplets size={18} className="input-icon" />
              <input
                type="text"
                name="irrigationType"
                value={userData.irrigationType}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="logout-wrapper">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}