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
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
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
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>

            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        <circle cx="250" cy="250" r="210" fill="url(#regBgGlow)" />
        <circle cx="250" cy="250" r="185" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.35" />
        <circle cx="250" cy="250" r="140" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.45" />
        <path d="M 130 250 A 120 120 0 0 1 370 250" stroke="url(#regAccentGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M 160 250 A 90 90 0 0 1 340 250" stroke="url(#regLeafGrad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 250 360 V 215" stroke="url(#regLeafGrad)" strokeWidth="6" strokeLinecap="round" />

        <path
            d="M 250 285 C 190 275 170 220 215 210 C 238 220 248 250 250 285 Z"
            fill="url(#regLeafGrad)"
        />

        <path
            d="M 250 250 C 310 240 330 185 285 175 C 262 185 252 215 250 250 Z"
            fill="url(#regLeafGrad)"
        />

        <circle cx="250" cy="195" r="15" fill="url(#regAccentGrad)" filter="url(#nodeGlow)" />
        <circle cx="250" cy="195" r="6" fill="#ffffff" />

        <g opacity="0.85">
            <line x1="250" y1="195" x2="340" y2="135" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="340" cy="135" r="8" fill="#16a34a" />
            <circle cx="340" cy="135" r="3.5" fill="#ffffff" />
            <line x1="250" y1="195" x2="165" y2="145" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="165" cy="145" r="7" fill="#eab308" />
            <line x1="250" y1="285" x2="360" y2="295" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="360" cy="295" r="7" fill="#10b981" />
            <line x1="250" y1="320" x2="145" y2="325" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="145" cy="325" r="6" fill="#22c55e" />
        </g>

        <g transform="translate(198, 375)">
            <rect x="0" y="10" width="5" height="20" rx="2.5" fill="#16a34a" opacity="0.5" />
            <rect x="15" y="2" width="5" height="28" rx="2.5" fill="#22c55e" />
            <rect x="30" y="-8" width="5" height="38" rx="2.5" fill="#10b981" />
            <rect x="45" y="-3" width="5" height="33" rx="2.5" fill="#eab308" />
            <rect x="60" y="5" width="5" height="25" rx="2.5" fill="#16a34a" opacity="0.8" />
            <rect x="75" y="12" width="5" height="18" rx="2.5" fill="#16a34a" opacity="0.4" />
        </g>
    </svg>
);

export default function Register(){
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/Login')
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);

    const [formData, setFormData] = useState({ 
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '', 
        password: '', 
        password1: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (formData.password !== formData.password1) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                first_name: formData.firstname,
                last_name: formData.lastname,
                email: formData.email,
                phone_number: formData.phonenumber,
                password: formData.password,
                password2: formData.password1,
            };

            const response = await API.post(
                '/auth/register/',
                payload
            );

            console.log(
                'Registration successful:',
                response.data
            );

            navigate('/Login');

        } catch (err) {
            console.error(
                'Registration error:',
                err.response?.data || err.message
            );

            const data = err.response?.data;

            if (data?.email) {
                setError(data.email[0]);

            } else if (data?.phone_number) {
                setError(data.phone_number[0]);

            } else if (data?.password) {
                setError(data.password[0]);

            } else if (data?.password2) {
                setError(data.password2[0]);

            } else if (data?.message) {
                setError(data.message);

            } else {
                setError(
                    'Registration failed. Please try again.'
                );
            }

        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className='login-page-wrapper'>
            <div className="login-card-container">
        
                <div className="login-form-side">
                    <div className="login-header-tag">REGISTER</div>

                    <div className="login-brand-header">
                        <div className="agrivox-logo-icon">
                            <SproutIcon />
                        </div>
                        <span className="agrivox-title">AgriVox</span>
                    </div>

                    <div className="login-title-group">
                        <h2>Welcome To AgriVox!</h2>
                        <p>Create an account:</p>
                    </div>

                    {error && (
                        <p className="error-message" style={{ color: '#ff4d4d', marginBottom: '1rem' }}>
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-field">
                            <label>First Name</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon"><UserIcon /></span>
                                <input
                                type="text"
                                name="firstname"
                                placeholder="Enter your first name"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Last Name</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon"><UserIcon /></span>
                                <input
                                type="text"
                                name="lastname"
                                placeholder="Enter your last name"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Phone Number</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon"><PhoneIcon /></span>
                                <input
                                type="text"
                                name="phonenumber"
                                placeholder="Enter your phone number"
                                value={formData.phonenumber}
                                onChange={handleChange}
                                required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Email</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon"><MailIcon /></span>
                                <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Enter your Password</label>
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
                        
                        <div className="form-field">
                            <label>Re-enter your Password</label>
                            <div className="input-icon-wrapper">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                type={showPassword1 ? 'text' : 'password'}
                                name="password1"
                                placeholder="Re-enter your password"
                                value={formData.password1}
                                onChange={handleChange}
                                required
                                />                                
                                <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword1(!showPassword1)}
                                aria-label="Toggle password visibility"
                                >
                                <EyeIcon show={showPassword1} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn-primary" disabled={isLoading}>
                            {isLoading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>

                    <div className="social-divider">
                        <span>Or register with</span>
                    </div>

                    <div className="social-buttons-group">
                        <button className="social-btn" aria-label="Log in with Google">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                        </button>
                        <button className="social-btn" aria-label="Log in with Apple">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.75-.95 2.78 1.01.08 2.05-.53 2.68-1.28z"/></svg>
                        </button>
                        <button className="social-btn" aria-label="Log in with Microsoft">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#7fba00" d="M13 1h10v10H13z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>
                        </button>
                    </div>

                    <div className="register-footer-prompt">
                        Have an account?{' '}
                        <button type="button" onClick={handleNavigate} className="register-link-btn">
                            Login
                        </button>
                    </div>
                </div>

                <div className="login-graphic-side">
                    <NetworkGraphic />
                    <div className="graphic-overlay-content">
                        <span className="graphic-badge">AgriVox Intelligence</span>
                        <h3>Voice-Driven Agricultural Insights</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};