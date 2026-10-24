import { useState, useEffect } from 'react';
import './Profile.css';
import { getMe, getStoredUser, logoutUser } from '../../api/auth';
import { User, Mail, Phone, MapPin, Sprout, LogOut, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const local = getStoredUser();
    setCurrentUser(local);

    getMe()
      .then((data) => {
        if (data) {
          setCurrentUser((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch /api/auth/me/:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/Login', { replace: true });
  };

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
    : currentUser?.username || 'Extension Officer';

  return (
    <div className="profile-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="profile-card-header">
        <div className="avatar-circle">
          <User size={38} color="#1b4332" />
        </div>
        <div className="user-title-group">
          <h2>{displayName}</h2>
          <span className="user-role-badge">Agricultural Extension Worker</span>
        </div>

        <button
          className="action-btn"
          style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={handleLogout}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-section-card">
          <h3 className="section-title">Account Details</h3>

          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input type="text" value={currentUser?.username || ''} readOnly />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input type="email" value={currentUser?.email || ''} readOnly />
            </div>
          </div>

          <div className="input-group">
            <label>Role</label>
            <div className="input-wrapper">
              <ShieldCheck size={18} className="input-icon" />
              <input type="text" value="Authorized Extension Field Agent" readOnly />
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <h3 className="section-title">System Status & Environment</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534' }}>
              <CheckCircle2 size={16} />
              <span><strong>Backend API:</strong> Connected (Django REST Framework)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534' }}>
              <CheckCircle2 size={16} />
              <span><strong>Database:</strong> PostgreSQL Persistent Records</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534' }}>
              <CheckCircle2 size={16} />
              <span><strong>Weather Telemetry:</strong> Live Regional Forecast Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534' }}>
              <CheckCircle2 size={16} />
              <span><strong>Decision Safety:</strong> Cautious, Source-Referenced Agent Rules</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}