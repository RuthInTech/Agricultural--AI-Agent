import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  CloudSun,
  Cog,
  LayoutDashboard as DashboardIcon,
  History as FolderHistory,
  LogOut,
  MapPin,
  Menu,
  Mountain,
  ShoppingBasket,
  Sprout,
  User,
  X,
} from 'lucide-react';

// Decode the JWT (the user's own access token) purely to show a display name.
// No secret is stored client-side; the payload is not signed data we trust for
// authorization — the backend still enforces auth on every protected call.
function userFromToken() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const data = JSON.parse(json);
    return {
      username: data.username || data.name || data.email || 'User',
      email: data.email || '',
    };
  } catch {
    return null;
  }
}

const PRIMARY_NAV = [
  { to: '/Home', label: 'Dashboard', icon: DashboardIcon },
  { to: '/Recommendations', label: 'New Crop Assessment', icon: ClipboardList },
  { to: '/CaseHistory', label: 'Case History', icon: FolderHistory },
  { to: '/Guidance', label: 'Guidance Library', icon: BookOpen },
  { to: '/SavedRecords', label: 'Saved Advisories', icon: Sprout },
  { to: '/Settings', label: 'Settings', icon: Cog },
];

const SECONDARY_NAV = [
  { to: '/MyFarm', label: 'My Farm', icon: Mountain },
  { to: '/Weather', label: 'Weather', icon: CloudSun },
  { to: '/MarketPlace', label: 'Marketplace', icon: ShoppingBasket },
  { to: '/Profile', label: 'Profile', icon: User },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(userFromToken());
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/Login', { replace: true });
  };

  const initials = (user?.username || 'U')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className="app-shell">
      <div
        className={`app-sidebar__scrim ${drawerOpen ? 'is-visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <div className="app-brand">
          <span className="app-brand__mark" aria-hidden="true">
            <Sprout size={20} />
          </span>
          <div>
            <div className="app-brand__name">AgriGuide</div>
            <div className="app-brand__tag">Extension Agent</div>
          </div>
          <button
            type="button"
            className="app-topbar__menu"
            style={{ display: 'inline-flex', marginLeft: 'auto' }}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="app-nav">
          <div className="app-nav__label">Workflow</div>
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav__link ${isActive ? 'is-active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="app-nav__label">More</div>
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav__link ${isActive ? 'is-active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="app-usercard">
            <span className="app-usercard__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="app-usercard__meta">
              <span className="app-usercard__name">{user?.username || 'Signed in'}</span>
              <span className="app-usercard__role">{user?.email || 'Extension worker'}</span>
            </span>
          </div>
          <button type="button" className="app-logout" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-topbar__menu"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="app-topbar__title">AgriGuide</span>
          <span className="app-topbar__spacer" />
          <span className="badge badge--success" title="Connected to the Django backend">
            <MapPin size={12} /> Evidence-backed
          </span>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
