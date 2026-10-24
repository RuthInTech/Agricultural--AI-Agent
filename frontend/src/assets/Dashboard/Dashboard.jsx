import './Dashboard.css'
import {useNavigate} from 'react-router-dom';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const FarmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10"/><path d="M10 20c0-4.4 3.6-8 8-8"/><path d="M4 11c3.5 0 6.5 2.5 7 6"/><path d="M12 20V10"/><path d="M12 10a8 8 0 0 1 8-8 8 8 0 0 1-8 8Z"/>
  </svg>
);

const RecommendationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const WeatherIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.94 11.23a5 5 0 1 0-7.88 4.27"/><path d="M18.8 17.5A4.5 4.5 0 0 0 12 14c-.6 0-1.18.12-1.7.35"/>
  </svg>
);

const MarketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

export default function Dashboard({isOpen, onClose}){

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("Home")
  }

  const navigate2 = useNavigate();
  const handleNavigate2 = () => {
    navigate2("MyFarm")
  }
  const navigate3 = useNavigate();
  const handleNavigate3 = () => {
    navigate3("Recommendations")
  }
  const navigate4 = useNavigate();
  const handleNavigate4 = () => {
    navigate4("Weather")
  }
  const navigate5 = useNavigate();
  const handleNavigate5 = () => {
    navigate5("MarketPlace")
  }
  const navigate6 = useNavigate();
  const handleNavigate6 = () => {
    navigate6("Profile")
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onClose) onClose();
    navigate('/Login', {replace: true})
  };
  return(
    <>
    {isOpen && (
      <div className='dashboard-overlay' onClick={onClose}/>
    )}

    <aside className={`dashboard-drawer ${isOpen ? 'open' : ''}`}>
      <div className='dashboard-header'>
        <h2 className='dashboard-title'>DASHBOARD</h2>
        <button onClick={onClose} className='dashboard-close-btn' aria-label='Close Dashboard'>
          <CloseIcon/>
        </button>
      </div>

      <nav className='dashboard-nav'>
        <a href='/Home' onClick={handleNavigate} className='dashboard-link'>
          <HomeIcon/>
          <span>Home</span>
        </a>
        <a href='/MyFarm' onClick={handleNavigate2} className='dashboard-link'>
          <FarmIcon/>
          <span>My Farm</span>
        </a>
        <a href='/Recommendations' onClick={handleNavigate3} className='dashboard-link'>
          <RecommendationsIcon/>
          <span>Recommendations</span>
        </a>
        <a href='/Weather' onClick={handleNavigate4} className='dashboard-link'>
          <WeatherIcon/>
          <span>Weather</span>
        </a>
        <a href='/MarketPlace' onClick={handleNavigate5} className='dashboard-link'>
          <MarketIcon/>
          <span>Market Place</span>
        </a>
        <a href='/Profile' onClick={handleNavigate6} className='dashboard-link'>
          <ProfileIcon/>
          <span>Profile</span>
        </a>
      </nav>

      <div className='dashboard-footer'>
        <button onClick={handleLogout} className='dashboard-logout-btn'>
          <LogoutIcon/>
          <span>Logout</span>
        </button>

{/*The whole lower part is going to be replaced with dynamic features puuling out from 
database when it is ready*/}
        <div className='dashboard-user-card'>
          <div className='user-avatar-wrapper'>
            <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="User Profile"
                className="user-avatar-img"
              />
          </div>
          <div className='user-info'>
            <span className='user-name'>Eyob Tekaligne</span>
            <span className='user-role'>Admin</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}