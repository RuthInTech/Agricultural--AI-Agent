import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Archive,
  Calendar,
  CircleAlert,
  CircleCheck,
  Eye,
  Inbox,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
import { apiErrorMessage, fetchAdvisories, fetchAdvisory } from '../../api/agriguide.js';
import useApiMode from '../../api/useApiMode.js';
import { DEMO_NOTICE } from '../../api/demoData.js';

function approvalBadgeClass(status) {
  const key = String(status || '').toLowerCase();
  if (['approved', 'saved', 'complete', 'completed'].includes(key)) return 'badge badge--success';
  if (['awaiting_approval', 'awaiting approval', 'pending_review', 'draft', 'proposed'].includes(key)) return 'badge badge--warning';
  if (['rejected', 'cancelled', 'canceled', 'failed'].includes(key)) return 'badge badge--danger';
  return 'badge badge--info';
}

function followUpBadgeClass(status) {
  const key = String(status || '').toLowerCase();
  if (['done', 'completed', 'closed'].includes(key)) return 'badge badge--success';
  if (['overdue', 'failed'].includes(key)) return 'badge badge--danger';
  return 'badge badge--info';
}

function prettifyStatus(status, fallback = 'Unknown') {
  if (!status) return fallback;
  return String(status).replace(/_/g, ' ');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SavedRecords() {
  const mode = useApiMode();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchAdvisories();
      setRecords(list);
    } catch (err) {
      setRecords([]);
      setError(apiErrorMessage(err, 'Saved records could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locationOptions = useMemo(() => {
    const values = new Set();
    records.forEach((record) => {
      if (record.location) values.add(String(record.location));
    });
    return [...values].sort();
  }, [records]);

  const statusOptions = useMemo(() => {
    const values = new Set();
    records.forEach((record) => {
      if (record.approval_status) values.add(String(record.approval_status));
    });
    return [...values].sort();
  }, [records]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        !needle ||
        String(record.id).toLowerCase().includes(needle) ||
        String(record.symptom_summary).toLowerCase().includes(needle);
      const matchesLocation = !locationFilter || String(record.location) === locationFilter;
      const matchesStatus = !statusFilter || String(record.approval_status) === statusFilter;
      return matchesQuery && matchesLocation && matchesStatus;
    });
  }, [records, query, locationFilter, statusFilter]);

  const openRecord = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const record = await fetchAdvisory(id);
      setDetail(record);
    } catch (err) {
      setDetailError(apiErrorMessage(err, `Record ${id} could not be loaded.`));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRecord = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailError('');
  };

  const hasFilters = Boolean(query.trim() || locationFilter || statusFilter);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <Archive size={24} strokeWidth={2.2} aria-hidden="true" /> Saved Records
          </h1>
          <p className="page-subtitle">
            Records approved and stored by the Django backend in PostgreSQL. Open a record to review its
            observations, advisory, sources and follow-up task.
          </p>
        </div>
        <button type="button" className="btn btn--outline" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : undefined} aria-hidden="true" /> Refresh
        </button>
      </div>

      {mode === 'demo' && (
        <div className="alert alert--warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>
            {DEMO_NOTICE} The backend is unreachable, so these records come from the browser's demo
            fallback — they are <strong>not</strong> stored in PostgreSQL.
          </span>
        </div>
      )}

      <section className="card" aria-label="Search and filter saved records">
        <div className="filter-bar">
          <div className="filter-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by record ID or symptoms…"
              aria-label="Search records by record ID or symptoms"
            />
          </div>
          <div className="filter-select">
            <label htmlFor="filter-location">Location</label>
            <select
              id="filter-location"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              <option value="">Any location</option>
              {locationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select">
            <label htmlFor="filter-status">Status</label>
            <select id="filter-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Any status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {prettifyStatus(option)}
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
                setStatusFilter('');
              }}
            >
              <X size={14} aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </section>

      {selectedId !== null && (
        <section className="card detail-panel" aria-label={`Record ${selectedId} details`}>
          <div className="panel-header">
            <h2 className="section-title">Record #{selectedId}</h2>
            <button type="button" className="btn btn--ghost btn--small" onClick={closeRecord}>
              <X size={16} aria-hidden="true" /> Close
            </button>
          </div>

          {detailLoading && (
            <div className="state-block" role="status">
              <LoaderCircle size={22} className="spin" aria-hidden="true" />
              <p>Loading record from the backend…</p>
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="alert alert--error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>
                {detailError}{' '}
                <button type="button" className="link-button" onClick={() => openRecord(selectedId)}>
                  Try again
                </button>
              </span>
            </div>
          )}

          {!detailLoading && detail && (
            <div className="detail-body">
              <div className="badge-row">
                <span className={approvalBadgeClass(detail.approval_status)}>
                  Approval: {prettifyStatus(detail.approval_status)}
                </span>
                <span className={followUpBadgeClass(detail.follow_up_status)}>
                  Follow-up: {prettifyStatus(detail.follow_up_status)}
                </span>
                <span className="badge badge--neutral">
                  <Calendar size={12} aria-hidden="true" /> Created {formatDate(detail.created_at)}
                </span>
              </div>

              <dl className="detail-grid">
                <div>
                  <dt>Location</dt>
                  <dd>
                    <MapPin size={14} aria-hidden="true" /> {detail.location || '—'}
                  </dd>
                </div>
                <div>
                  <dt>Crop</dt>
                  <dd>{detail.crop || '—'}</dd>
                </div>
                <div>
                  <dt>Growth stage</dt>
                  <dd>{detail.growth_stage || '—'}</dd>
                </div>
                <div>
                  <dt>Date observed</dt>
                  <dd>{detail.field_conditions.date_observed || '—'}</dd>
                </div>
                <div>
                  <dt>Affected area</dt>
                  <dd>{detail.field_conditions.affected_area || '—'}</dd>
                </div>
                <div>
                  <dt>Soil condition</dt>
                  <dd>{detail.field_conditions.soil_condition || '—'}</dd>
                </div>
                <div>
                  <dt>Recent rainfall</dt>
                  <dd>{detail.field_conditions.rainfall || '—'}</dd>
                </div>
              </dl>

              <h3 className="review-heading">Reported symptoms</h3>
              <p className="detail-text">{detail.symptoms || '—'}</p>

              <h3 className="review-heading">Submitted observations</h3>
              <ul className="evidence-list">
                {detail.observations.length > 0 ? (
                  detail.observations.map((item, index) => <li key={`obs-${index}`}>{item.text ?? item}</li>)
                ) : (
                  <li className="empty-inline">No observations were stored with this record.</li>
                )}
              </ul>

              <h3 className="review-heading">Saved advisory</h3>
              <p className="detail-text">{detail.advisory_text || '—'}</p>

              <h3 className="review-heading">Possible explanations (not confirmed diagnoses)</h3>
              <ul className="explanation-list">
                {detail.possible_explanations.length > 0 ? (
                  detail.possible_explanations.map((item, index) => (
                    <li key={`exp-${index}`}>
                      <span className="badge badge--warning">Possibility</span>
                      <p>{item.text ?? item}</p>
                    </li>
                  ))
                ) : (
                  <li className="empty-inline">None stored.</li>
                )}
              </ul>

              <h3 className="review-heading">Source references</h3>
              {detail.sources.length > 0 ? (
                <ul className="source-list">
                  {detail.sources.map((source, index) => (
                    <li key={source.source_id || `src-${index}`} className="source-item">
                      <div className="source-item-head">
                        <span className="source-id">{source.source_id}</span>
                        {source.section && <span className="source-section">{source.section}</span>}
                      </div>
                      <span className="source-title">{source.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="alert alert--warning" role="status">
                  <TriangleAlert size={18} aria-hidden="true" />
                  <span>No source references were stored with this record — treat the advisory as unverified.</span>
                </div>
              )}

              <h3 className="review-heading">Follow-up task</h3>
              <div className="followup-box">
                <p>{detail.follow_up_task || '—'}</p>
                <span className="muted-note">
                  Due: {detail.follow_up_due_date || '—'} · Status: {prettifyStatus(detail.follow_up_status)}
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="card" aria-label="Saved records list">
        <div className="panel-header">
          <h2 className="section-title">
            Records <span className="count-chip">{filtered.length}</span>
          </h2>
        </div>

        {loading && (
          <div className="state-block" role="status">
            <LoaderCircle size={22} className="spin" aria-hidden="true" />
            <p>Loading saved records from the backend…</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert--error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>
              {error}{' '}
              <button type="button" className="link-button" onClick={load}>
                Retry
              </button>
            </span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="state-block">
            <Inbox size={26} aria-hidden="true" />
            {records.length === 0 ? (
              <>
                <p>No saved records yet.</p>
                <NavLink to="/report" className="btn btn--primary btn--small">
                  Create the first report
                </NavLink>
              </>
            ) : (
              <>
                <p>No records match your search or filters.</p>
                <button
                  type="button"
                  className="btn btn--outline btn--small"
                  onClick={() => {
                    setQuery('');
                    setLocationFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="record-list">
            {filtered.map((record) => (
              <li key={record.id} className={`record-item ${String(record.id) === String(selectedId) ? 'record-item--active' : ''}`}>
                <div className="record-main">
                  <div className="record-head">
                    <span className="record-id">Record #{record.id}</span>
                    <span className={approvalBadgeClass(record.approval_status)}>
                      {prettifyStatus(record.approval_status)}
                    </span>
                    <span className={followUpBadgeClass(record.follow_up_status)}>
                      Follow-up: {prettifyStatus(record.follow_up_status)}
                    </span>
                  </div>
                  <div className="record-meta">
                    <span>
                      <MapPin size={14} aria-hidden="true" /> {record.location || '—'}
                    </span>
                    <span>
                      <CircleCheck size={14} aria-hidden="true" /> {record.crop}
                    </span>
                    <span>
                      <Calendar size={14} aria-hidden="true" /> {formatDate(record.created_at)}
                    </span>
                  </div>
                  <p className="record-symptoms">{record.symptom_summary || 'No symptom summary stored.'}</p>
                </div>
                <button type="button" className="btn btn--outline btn--small" onClick={() => openRecord(record.id)}>
                  <Eye size={16} aria-hidden="true" /> View Record
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}