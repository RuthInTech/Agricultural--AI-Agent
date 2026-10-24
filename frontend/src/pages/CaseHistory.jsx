import { useEffect, useMemo, useState } from 'react';
import {
  CircleAlert,
  History as FolderHistory,
  LoaderCircle,
  MapPin,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
import { apiErrorMessage, fetchCases, fetchLocations } from '../api/agriguide.js';
import useApiMode from '../api/useApiMode.js';
import { DEMO_NOTICE } from '../api/demoData.js';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function CaseHistory() {
  const mode = useApiMode();

  const [locations, setLocations] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [locationFilter, setLocationFilter] = useState('');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Load every location, then all cases (no location_id → backend returns all).
        const [locList, caseList] = await Promise.all([
          fetchLocations().catch(() => []),
          fetchCases().catch((err) => {
            throw err;
          }),
        ]);
        if (!active) return;
        setLocations(locList);
        setCases(caseList);
      } catch (err) {
        if (active) {
          setCases([]);
          setError(apiErrorMessage(err, 'Case history could not be loaded.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesLocation =
        !locationFilter || String(c.location_ref || c.location) === locationFilter;
      const matchesQuery =
        !needle ||
        [c.id, c.location, c.symptom_summary, c.outcome_summary, c.growth_stage]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle));
      return matchesLocation && matchesQuery;
    });
  }, [cases, locationFilter, query]);

  const hasFilters = Boolean(query.trim() || locationFilter);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <FolderHistory size={24} strokeWidth={2.2} aria-hidden="true" /> Case History
          </h1>
          <p className="page-subtitle">
            Previous cases recorded at each location, read from the backend via{' '}
            <code>readCaseHistory</code>. These give context for new assessments.
          </p>
        </div>
      </div>

      {mode === 'demo' && (
        <div className="alert alert--warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>
            {DEMO_NOTICE} The backend is unreachable, so these cases come from the labelled demo
            dataset.
          </span>
        </div>
      )}

      <section className="card" aria-label="Filter cases">
        <div className="filter-bar">
          <div className="filter-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case ID, symptoms or outcome…"
              aria-label="Search cases"
            />
          </div>
          <div className="filter-select">
            <label htmlFor="case-location">Location</label>
            <select
              id="case-location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                setQuery('');
                setLocationFilter('');
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </section>

      <section className="card" aria-label="Case list">
        <div className="panel-header">
          <h2 className="section-title">
            Cases <span className="count-chip">{filtered.length}</span>
          </h2>
        </div>

        {loading && (
          <div className="state-block" role="status">
            <LoaderCircle size={22} className="spin" aria-hidden="true" />
            <p>Loading case history from the backend…</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert--error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="state-block">
            <FolderHistory size={26} aria-hidden="true" />
            <p>
              {hasFilters
                ? 'No cases match your filters.'
                : 'No previous cases are stored yet.'}
            </p>
            {hasFilters && (
              <button
                type="button"
                className="btn btn--outline btn--small"
                onClick={() => {
                  setQuery('');
                  setLocationFilter('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="record-list">
            {filtered.map((c) => (
              <li
                key={c.id}
                className={`record-item ${String(openId) === String(c.id) ? 'record-item--active' : ''}`}
              >
                <div className="record-main">
                  <div className="record-head">
                    <span className="record-id">{c.id}</span>
                    <span className="badge badge--info">{c.crop}</span>
                    {c.growth_stage && <span className="badge badge--neutral">{c.growth_stage}</span>}
                    {c.demo && <span className="badge badge--warning">Fictional demo</span>}
                  </div>
                  <div className="record-meta">
                    <span>
                      <MapPin size={13} /> {c.location || '—'}
                    </span>
                    <span>{formatDate(c.recorded_on)}</span>
                  </div>
                  <p className="record-symptoms">{c.symptom_summary}</p>

                  {String(openId) === String(c.id) && (
                    <div style={{ marginTop: 12 }}>
                      {c.outcome_summary && (
                        <>
                          <h3 className="review-heading">Outcome</h3>
                          <p className="detail-text">{c.outcome_summary}</p>
                        </>
                      )}
                      {Array.isArray(c.previous_follow_ups) && c.previous_follow_ups.length > 0 && (
                        <>
                          <h3 className="review-heading">Previous follow-ups</h3>
                          <ul className="evidence-list">
                            {c.previous_follow_ups.map((f, i) => (
                              <li key={i}>
                                {f.date ? `[${f.date}] ` : ''}
                                {f.task} {f.status ? `— ${f.status}` : ''}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--small"
                  onClick={() => setOpenId(String(openId) === String(c.id) ? null : c.id)}
                  aria-expanded={String(openId) === String(c.id)}
                >
                  {String(openId) === String(c.id) ? 'Hide details' : 'View details'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
