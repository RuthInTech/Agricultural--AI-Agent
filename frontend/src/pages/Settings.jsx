import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cog, LogOut, ShieldCheck, Sprout } from 'lucide-react';
import useApiMode from '../api/useApiMode.js';

function readUser() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const payload = JSON.parse(
      decodeURIComponent(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    );
    return {
      username: payload.username || payload.name || '—',
      email: payload.email || '—',
      tokenType: payload.token_type || 'Bearer',
    };
  } catch {
    return null;
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const mode = useApiMode();
  const [user, setUser] = useState(null);
  const loggedIn = Boolean(localStorage.getItem('access_token'));

  useEffect(() => {
    setUser(readUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/Login', { replace: true });
  };

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <Cog size={24} strokeWidth={2.2} aria-hidden="true" /> Settings &amp; Account
          </h1>
          <p className="page-subtitle">
            Your session and connection details. Profile editing and password changes are not shown
            because the backend does not expose them yet.
          </p>
        </div>
      </div>

      <section className="card" aria-label="Account">
        <div className="panel-header">
          <h2 className="section-title">
            <ShieldCheck size={18} aria-hidden="true" /> Account
          </h2>
          <span className={`badge ${loggedIn ? 'badge--success' : 'badge--warning'}`}>
            {loggedIn ? 'Signed in' : 'Not signed in'}
          </span>
        </div>

        {loggedIn && user ? (
          <dl className="detail-grid">
            <div>
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Auth scheme</dt>
              <dd>{user.tokenType} (JWT)</dd>
            </div>
          </dl>
        ) : (
          <div className="state-block">
            <ShieldCheck size={24} aria-hidden="true" />
            <p>You are not signed in. Log in to manage your session.</p>
          </div>
        )}
      </section>

      <section className="card" aria-label="Connection">
        <div className="panel-header">
          <h2 className="section-title">
            <Sprout size={18} aria-hidden="true" /> Connection
          </h2>
          <span className={`badge ${mode === 'live' ? 'badge--success' : 'badge--warning'}`}>
            {mode === 'live' ? 'Live backend' : mode === 'demo' ? 'Demo fallback' : 'Not checked'}
          </span>
        </div>
        <dl className="detail-grid">
          <div>
            <dt>API base URL</dt>
            <dd style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}>{apiBase}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd>PostgreSQL (via Django)</dd>
          </div>
        </dl>
        <p className="muted-note" style={{ marginTop: 12 }}>
          The frontend never talks to the database or AI provider directly — all requests go through
          the Django REST API.
        </p>
      </section>

      {loggedIn && (
        <section className="card" aria-label="Session actions">
          <div className="panel-header">
            <h2 className="section-title">Session</h2>
          </div>
          <button type="button" className="btn btn--danger" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </section>
      )}
    </div>
  );
}
