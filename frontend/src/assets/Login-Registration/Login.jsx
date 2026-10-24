import API from '../../api/axios.js';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';

const SproutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" /><path d="M10 20c0-4.4 3.6-8 8-8" /><path d="M4 11c3.5 0 6.5 2.5 7 6" /><path d="M12 20V10" /><path d="M12 10a8 8 0 0 1 8-8 8 8 0 0 1-8 8Z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

const NetworkGraphic = () => (
  <svg
    className="registration-svg"
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto', maxHeight: '420px' }}
  >
    <defs>
      <linearGradient id="regLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#15803d" />
        <stop offset="50%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>

      <linearGradient id="regAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>

      <radialGradient id="regBgGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </radialGradient>

      <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Animated Breathing Background Glow */}
    <circle cx="250" cy="250" r="210" fill="url(#regBgGlow)" className="anim-bg-glow" />

    {/* Counter-Rotating Orbit Rings */}
    <circle cx="250" cy="250" r="185" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.4" className="anim-ring-outer" />
    <circle cx="250" cy="250" r="140" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5" className="anim-ring-inner" />

    {/* Network Arcs and Stem */}
    <path d="M 130 250 A 120 120 0 0 1 370 250" stroke="url(#regAccentGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    <path d="M 160 250 A 90 90 0 0 1 340 250" stroke="url(#regLeafGrad)" strokeWidth="4" strokeLinecap="round" />
    <path d="M 250 360 V 215" stroke="url(#regLeafGrad)" strokeWidth="6" strokeLinecap="round" />

    {/* Leaves */}
    <path d="M 250 285 C 190 275 170 220 215 210 C 238 220 248 250 250 285 Z" fill="url(#regLeafGrad)" />
    <path d="M 250 250 C 310 240 330 185 285 175 C 262 185 252 215 250 250 Z" fill="url(#regLeafGrad)" />

    {/* Pulsating Core Node */}
    <circle cx="250" cy="195" r="15" fill="url(#regAccentGrad)" filter="url(#nodeGlow)" className="anim-node-pulse" />
    <circle cx="250" cy="195" r="6" fill="#ffffff" />

    {/* Floating Satellite Nodes */}
    <g opacity="0.85">
      <g className="anim-float-1">
        <line x1="250" y1="195" x2="340" y2="135" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="340" cy="135" r="8" fill="#16a34a" />
        <circle cx="340" cy="135" r="3.5" fill="#ffffff" />
      </g>

      <g className="anim-float-2">
        <line x1="250" y1="195" x2="165" y2="145" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="165" cy="145" r="7" fill="#eab308" />
      </g>

      <g className="anim-float-1">
        <line x1="250" y1="285" x2="360" y2="295" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="360" cy="295" r="7" fill="#10b981" />
      </g>

      <g className="anim-float-2">
        <line x1="250" y1="320" x2="145" y2="325" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="145" cy="325" r="6" fill="#22c55e" />
      </g>
    </g>

    {/* Animated Telemetry Equalizer Bars */}
    <g transform="translate(198, 375)">
      <rect x="0" y="10" width="5" height="20" rx="2.5" fill="#16a34a" className="anim-bar bar-1" />
      <rect x="15" y="2" width="5" height="28" rx="2.5" fill="#22c55e" className="anim-bar bar-2" />
      <rect x="30" y="-8" width="5" height="38" rx="2.5" fill="#10b981" className="anim-bar bar-3" />
      <rect x="45" y="-3" width="5" height="33" rx="2.5" fill="#eab308" className="anim-bar bar-4" />
      <rect x="60" y="5" width="5" height="25" rx="2.5" fill="#16a34a" className="anim-bar bar-5" />
      <rect x="75" y="12" width="5" height="18" rx="2.5" fill="#16a34a" className="anim-bar bar-6" />
    </g>
  </svg>
);
export default function Login() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/Register')
  };

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try{

      const response = await API.post('/auth/login', formData);

      if (response.data?.token){
        localStorage.setItem('token', response.data.token);
        navigate('/Home');
      }
    }catch(err) {
      setError(err.response?.data?.message  || 'Login Failed. Please check your credentials.');
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        
        <div className="login-graphic-side">
          <NetworkGraphic />
          <div className="graphic-overlay-content">
            <span className="graphic-badge">AgriGuide Intelligence</span>
            <h3>AI-Agricultural Extension Platform</h3>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-header-tag">LOGIN</div>

          <div className="login-brand-header">
            <div className="agrivox-logo-icon">
              <SproutIcon />
            </div>
            <span className="agrivox-title">AgriGuide</span>
          </div>

          <div className="login-title-group">
            <h2>Welcome Back!</h2>
            <p>Log in to your account.</p>
          </div>

          {error && (
            <p className='error-message' style={{ color: '#ff4d4d', marginBottom: '1rem'}}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label>Username(First Name) or Email</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><UserIcon/></span>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username(first name) or email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn-primary" disabled={isLoading}>
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          <div className="social-divider">
          </div>

          <div className="register-footer-prompt">
            Don't have an account?{' '}
            <button type="button" onClick={handleNavigate} className="register-link-btn">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}