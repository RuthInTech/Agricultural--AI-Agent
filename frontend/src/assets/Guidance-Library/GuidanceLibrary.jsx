import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  CircleAlert,
  LoaderCircle,
  Search,
  TriangleAlert,
} from 'lucide-react';
import { apiErrorMessage, searchGuidance } from '../../api/agriguide.js';
import useApiMode from '../../api/useApiMode.js';
import { DEMO_NOTICE } from '../../api/demoData.js';

export default function GuidanceLibrary() {
  const mode = useApiMode();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const load = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const notes = await searchGuidance({ q, crop: 'maize' });
      setItems(notes);
      setAppliedQuery(q);
    } catch (err) {
      setItems([]);
      setError(apiErrorMessage(err, 'Guidance notes could not be loaded.'));
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const handleSubmit = (event) => {
    event.preventDefault();
    load(query.trim());
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            <BookOpen size={24} strokeWidth={2.2} aria-hidden="true" /> Guidance Library
          </h1>
          <p className="page-subtitle">
            Agricultural guidance notes stored by the Django backend, each with its source ID and section
            reference. Advisories cite these notes as their evidence.
          </p>
        </div>
      </div>

      {mode === 'demo' && (
        <div className="alert alert--warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>
            {DEMO_NOTICE} The backend is unreachable, so the notes below come from the labelled demo
            dataset — they are <strong>not</strong> official extension publications.
          </span>
        </div>
      )}

      <section className="card" aria-label="Search guidance">
        <form className="filter-bar" onSubmit={handleSubmit}>
          <div className="filter-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guidance by keyword (e.g. yellowing, drainage, pests)…"
              aria-label="Search guidance notes"
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle size={18} className="spin" aria-hidden="true" /> Searching…
              </>
            ) : (
              <>
                <Search size={18} aria-hidden="true" /> Search
              </>
            )}
          </button>
        </form>
      </section>

      <section className="card" aria-label="Guidance notes">
        <div className="panel-header">
          <h2 className="section-title">
            Guidance notes <span className="count-chip">{items.length}</span>
            {appliedQuery && <span className="muted-note"> for “{appliedQuery}”</span>}
          </h2>
        </div>

        {loading && (
          <div className="state-block" role="status">
            <LoaderCircle size={22} className="spin" aria-hidden="true" />
            <p>Searching stored guidance…</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert--error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>
              {error}{' '}
              <button type="button" className="link-button" onClick={() => load(appliedQuery)}>
                Retry
              </button>
            </span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="state-block">
            <BookOpen size={26} aria-hidden="true" />
            <p>
              {searched && appliedQuery
                ? `No guidance notes matched “${appliedQuery}”.`
                : 'No guidance notes are stored yet.'}
            </p>
            <p className="muted-note">Try a broader keyword, or clear the search to list everything.</p>
            {appliedQuery && (
              <button type="button" className="btn btn--outline btn--small" onClick={() => {
                setQuery('');
                load('');
              }}>
                Show all notes
              </button>
            )}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="guidance-list">
            {items.map((note) => (
              <li key={note.source_id || note.title} className="guidance-item">
                <div className="source-item-head">
                  <span className="source-id">{note.source_id}</span>
                  {note.section && <span className="source-section">{note.section}</span>}
                  {note.demo && <span className="badge badge--neutral">Fictional demo source</span>}
                </div>
                <h3 className="guidance-title">{note.title}</h3>
                <div className="guidance-meta">
                  {note.topic && <span className="badge badge--info">{note.topic}</span>}
                  {note.crop && <span className="badge badge--success">{note.crop}</span>}
                </div>
                <p className="guidance-text">{note.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}