import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  History as FolderHistory,
  LoaderCircle,
  MapPin,
  Sprout,
  TriangleAlert,
} from 'lucide-react';
import {
  apiErrorMessage,
  fetchAdvisories,
  fetchCases,
  fetchLocations,
  searchGuidance,
} from '../api/agriguide.js';
import useApiMode from '../api/useApiMode.js';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const mode = useApiMode();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [cases, setCases] = useState([]);
  const [guidance, setGuidance] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [advisoriesAuthError, setAdvisoriesAuthError] = useState(false);

  const loggedIn = Boolean(localStorage.getItem('access_token'));

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      const results = await Promise.allSettled([
        fetchLocations(),
        fetchCases(), // no location → recent cases across all locations
        searchGuidance({ q: '', crop: 'maize' }),
        loggedIn ? fetchAdvisories() : Promise.reject(new Error('auth')),
      ]);
      if (!active) return;

      const [locRes, caseRes, guideRes, advRes] = results;

      if (locRes.status === 'fulfilled') setLocations(locRes.value);
      else setError(apiErrorMessage(locRes.reason, 'Could not load locations.'));

      if (caseRes.status === 'fulfilled') setCases(caseRes.value);

      if (guideRes.status === 'fulfilled') setGuidance(guideRes.value);

      if (advRes.status === 'fulfilled') setAdvisories(advRes.value);
      else if (advRes.reason?.message !== 'auth') setAdvisories([]);
      if (advRes.status === 'rejected' && advRes.reason?.message === 'auth') {
        setAdvisoriesAuthError(true);
      } else if (
        advRes.status === 'rejected' &&
        advRes.reason?.response?.status === 401
      ) {
        setAdvisoriesAuthError(true);
      }

      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loggedIn]);

  const stats = [
    { label: 'Locations', value: locations.length, icon: MapPin, to: '/Recommendations' },
    { label: 'Stored cases', value: cases.length, icon: FolderHistory, to: '/CaseHistory' },
    { label: 'Guidance notes', value: guidance.length, icon: BookOpen, to: '/Guidance' },
    {
      label: 'Saved advisories',
      value: advisories.length,
      icon: Sprout,
      to: '/SavedRecords',
    },
  ];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <ClipboardList size={24} strokeWidth={2.2} aria-hidden="true" /> Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back. Start a crop assessment, review previous cases, and search evidence-backed
            guidance. All figures below come from the live backend.
          </p>
        </div>
        <Link to="/Recommendations" className="btn btn--primary">
          <ClipboardList size={16} /> New crop assessment
        </Link>
      </div>

      {mode === 'demo' && (
        <div className="alert alert--warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>
            The Django backend is unreachable, so these figures come from the labelled demo fallback
            and are not live database values.
          </span>
        </div>
      )}

      {loading && (
        <div className="card state-block" role="status">
          <LoaderCircle size={24} className="spin" aria-hidden="true" />
          <p>Loading dashboard data from the backend…</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert--error" role="alert">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="stat-grid" aria-label="Summary">
            {stats.map((s) => (
              <Link key={s.label} to={s.to} className="stat-card" style={{ textDecoration: 'none' }}>
                <span className="stat-card__icon" aria-hidden="true">
                  <s.icon size={20} />
                </span>
                <span className="stat-card__value">{s.value}</span>
                <span className="stat-card__label">{s.label}</span>
              </Link>
            ))}
          </section>

          <div className="grid-2">
            <section className="card" aria-label="Recent saved advisories">
              <div className="panel-header">
                <h2 className="section-title">
                  <Sprout size={18} aria-hidden="true" /> Recent saved advisories
                </h2>
                <Link to="/SavedRecords" className="btn btn--ghost btn--small">
                  View all
                </Link>
              </div>

              {advisoriesAuthError ? (
                <div className="state-block">
                  <Sprout size={24} aria-hidden="true" />
                  <p>Log in to see your saved advisories.</p>
                  <Link to="/Login" className="btn btn--outline btn--small">
                    Go to login
                  </Link>
                </div>
              ) : advisories.length === 0 ? (
                <div className="state-block">
                  <Sprout size={24} aria-hidden="true" />
                  <p>No saved advisories yet.</p>
                  <Link to="/Recommendations" className="btn btn--primary btn--small">
                    Create the first report
                  </Link>
                </div>
              ) : (
                <ul className="record-list">
                  {advisories.slice(0, 4).map((record) => (
                    <li key={record.id} className="record-item">
                      <div className="record-main">
                        <div className="record-head">
                          <span className="record-id">Record #{record.id}</span>
                          <span className="badge badge--success">{record.approval_status}</span>
                        </div>
                        <div className="record-meta">
                          <span>
                            <MapPin size={13} /> {record.location || '—'}
                          </span>
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                        <p className="record-symptoms">{record.symptom_summary || 'No summary.'}</p>
                      </div>
                      <Link to="/SavedRecords" className="btn btn--outline btn--small">
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card" aria-label="Recent cases">
              <div className="panel-header">
                <h2 className="section-title">
                  <FolderHistory size={18} aria-hidden="true" /> Recent cases
                </h2>
                <Link to="/CaseHistory" className="btn btn--ghost btn--small">
                  View all
                </Link>
              </div>
              {cases.length === 0 ? (
                <div className="state-block">
                  <FolderHistory size={24} aria-hidden="true" />
                  <p>No previous cases stored yet.</p>
                </div>
              ) : (
                <ul className="record-list">
                  {cases.slice(0, 4).map((c) => (
                    <li key={c.id} className="record-item">
                      <div className="record-main">
                        <div className="record-head">
                          <span className="record-id">{c.id}</span>
                          <span className="badge badge--info">{c.crop}</span>
                        </div>
                        <div className="record-meta">
                          <span>
                            <MapPin size={13} /> {c.location || '—'}
                          </span>
                          <span>{formatDate(c.recorded_on)}</span>
                        </div>
                        <p className="record-symptoms">{c.symptom_summary}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="card" aria-label="Quick actions">
            <div className="panel-header">
              <h2 className="section-title">Quick actions</h2>
            </div>
            <div className="filter-bar">
              <Link to="/Recommendations" className="btn btn--primary">
                <ClipboardList size={16} /> New crop assessment
              </Link>
              <Link to="/Guidance" className="btn btn--outline">
                <BookOpen size={16} /> Search guidance
              </Link>
              <Link to="/CaseHistory" className="btn btn--outline">
                <FolderHistory size={16} /> Case history
              </Link>
              <Link to="/SavedRecords" className="btn btn--outline">
                <Sprout size={16} /> Saved advisories
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
