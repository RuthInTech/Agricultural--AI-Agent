import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CloudSun,
  ClipboardList,
  History,
  BookOpen,
  BookmarkCheck,
  Building2,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import './AppShell.css';
import { getStoredUser, logoutUser } from '../api/auth';
import { getWeather } from '../api/weather';

const NAV_ITEMS = [
  { to: '/Home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/Weather', label: 'Local Weather', icon: CloudSun },
  { to: '/Recommendations', label: 'New Crop Report', icon: ClipboardList },
  { to: '/CaseHistory', label: 'Previous Cases', icon: History },
  { to: '/Guidance', label: 'Guidance Library', icon: BookOpen },
  { to: '/SavedRecords', label: 'Saved Advisories', icon: BookmarkCheck },
  { to: '/MyFarm', label: 'My Farm Profile', icon: Building2 },
  { to: '/Profile', label: 'Profile & Settings', icon: UserCircle },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [quickWeather, setQuickWeather] = useState(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Fetch quick weather indicator on mount
  useEffect(() => {
    let active = true;
    getWeather('Addis Ababa')
      .then((data) => {
        if (active && data?.current) {
          setQuickWeather({
            temp: data.current.temperature,
            condition: data.current.condition,
            icon: data.current.icon,
            location: data.location?.split(',')[0] || 'Addis Ababa',
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/Login', { replace: true });
  };

  const getPageTitle = () => {
    const item = NAV_ITEMS.find((nav) => nav.to === location.pathname);
    return item ? item.label : 'AgriGuide';
  };

  const displayName = currentUser?.first_name
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
    : currentUser?.username || 'Signed In';
  const displayRole = currentUser?.email || 'Extension Agent';
  const avatarInitials = (displayName || 'AG')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  return (
    <div className="ag-shell">
      {/* Mobile Drawer Scrim */}
      <div
        className={`ag-sidebar__scrim ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`ag-sidebar ${isSidebarOpen ? 'is-open' : ''}`} aria-label="Main Navigation">
        <div className="ag-sidebar__brand">
          <div className="ag-brand__icon" aria-hidden="true">
            <Sprout size={24} />
          </div>
          <div>
            <div className="ag-brand__name">AgriGuide</div>
            <div className="ag-brand__tag">Extension Agent</div>
          </div>
          <button
            type="button"
            className="ag-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="ag-sidebar__nav">
          <span className="ag-nav__label">Workflow & Advisory</span>
          {NAV_ITEMS.slice(0, 6).map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ag-nav__link ${isActive ? 'is-active' : ''}`}
              >
                <IconComponent size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <span className="ag-nav__label" style={{ marginTop: '10px' }}>
            Account & Operations
          </span>
          {NAV_ITEMS.slice(6).map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ag-nav__link ${isActive ? 'is-active' : ''}`}
              >
                <IconComponent size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="ag-sidebar__footer">
          <div className="ag-usercard">
            <div className="ag-usercard__avatar">{avatarInitials}</div>
            <div className="ag-usercard__meta">
              <span className="ag-usercard__name">{displayName}</span>
              <span className="ag-usercard__role">{displayRole}</span>
            </div>
          </div>
          <button type="button" className="ag-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="ag-main">
        <header className="ag-topbar">
          <button
            type="button"
            className="ag-topbar__menu"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <span className="ag-topbar__title">{getPageTitle()}</span>

          <div className="ag-topbar__spacer" />

          <div className="ag-topbar__badges">
            {quickWeather && (
              <NavLink to="/Weather" className="ag-pill ag-pill--weather" title="View live weather forecast">
                <span>{quickWeather.icon}</span>
                <span>{quickWeather.temp}</span>
                <span style={{ opacity: 0.8 }}>({quickWeather.location})</span>
              </NavLink>
            )}
            <span className="ag-pill ag-pill--success" title="Backed by retrieved official agricultural guidance">
              <ShieldCheck size={14} />
              <span>Evidence-Backed</span>
            </span>
          </div>
        </header>

        <main className="ag-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
