import { useState, useEffect } from 'react';
import { getSavedAdvisories, getSavedAdvisoryDetail } from '../api/agent';
import {
  BookmarkCheck,
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  X,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SavedAdvisoriesPage() {
  const navigate = useNavigate();
  const [advisories, setAdvisories] = useState([]);
  const [selectedAdvisory, setSelectedAdvisory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadAdvisories = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSavedAdvisories();
      if (Array.isArray(data)) {
        setAdvisories(data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Authentication required to view your persistent advisory records. Please log in.');
      } else {
        setErrorMessage(err.response?.data?.detail || 'Failed to load saved advisories from backend.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisories();
  }, []);

  const handleOpenDetail = async (id) => {
    setIsDetailLoading(true);
    try {
      const detail = await getSavedAdvisoryDetail(id);
      setSelectedAdvisory(detail);
    } catch (err) {
      alert('Could not fetch advisory detail: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1b4332', marginBottom: '4px' }}>
            Saved Advisories & Follow-Ups
          </h1>
          <p style={{ color: '#4b6354', fontSize: '14.5px' }}>
            Persistent records saved to PostgreSQL through the Django backend following explicit user confirmation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={loadAdvisories}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #c8e6c9',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#1b4332',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} style={isLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/Recommendations')}
            style={{
              background: '#1b4332',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + New Crop Report
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ede5', padding: '48px', textAlign: 'center', color: '#2d6a4f' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>Loading saved advisory records from PostgreSQL...</p>
        </div>
      ) : advisories.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ede5', padding: '48px', textAlign: 'center' }}>
          <BookmarkCheck size={38} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#1b4332', marginBottom: '6px' }}>No Saved Advisories Yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '460px', margin: '0 auto 16px' }}>
            Complete a crop report assessment, preview the evidence-grounded draft, and explicitly approve the advisory to save records here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/Recommendations')}
            style={{
              background: '#1b4332',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Run New Crop Assessment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {advisories.map((rec) => {
            const locLabel = rec.location_name || rec.location_ref || 'Field Site';
            const dateStr = rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Recent';

            return (
              <div
                key={rec.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #c8e6c9',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#1b4332',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    #{rec.id}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#166534',
                      background: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    <FileCheck2 size={12} /> Approved
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1b4332', marginBottom: '4px' }}>
                    {rec.farmer_name || 'Farmer Report'}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12.5px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={13} /> {locLabel}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={13} /> {dateStr}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, flex: '1', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rec.advisory_text}
                </div>

                {rec.follow_up_task && (
                  <div style={{ background: '#f8faf8', border: '1px solid #e2ede5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#1b4332' }}>
                    <strong>Task:</strong> {rec.follow_up_task}
                    {rec.follow_up_due_date && (
                      <div style={{ color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                        Due: {rec.follow_up_due_date}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenDetail(rec.id)}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#166534',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  <span>Reopen Full Record</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal Dialog */}
      {selectedAdvisory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 30, 20, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedAdvisory(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ background: '#1b4332', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                  RECORD #{selectedAdvisory.id}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1b4332', marginTop: '6px' }}>
                  {selectedAdvisory.farmer_name} — {selectedAdvisory.crop}
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Location: {selectedAdvisory.location_name || selectedAdvisory.location_ref} • Stage: {selectedAdvisory.growth_stage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdvisory(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                aria-label="Close record"
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ marginBottom: '18px', background: '#fafcfb', border: '1px solid #e2ede5', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1b4332', textTransform: 'uppercase', marginBottom: '6px' }}>
                Field Symptoms & Conditions:
              </h4>
              <p style={{ fontSize: '14px', color: '#1b281f', marginBottom: '8px' }}>
                {selectedAdvisory.symptoms}
              </p>
              {selectedAdvisory.field_conditions && (
                <div style={{ fontSize: '12.5px', color: '#4b6354' }}>
                  {Object.entries(selectedAdvisory.field_conditions).map(([k, v]) => (
                    <span key={k} style={{ marginRight: '12px' }}>
                      <strong>{k.replace('_', ' ')}:</strong> {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1b4332', textTransform: 'uppercase', marginBottom: '6px' }}>
                Confirmed Advisory Statement:
              </h4>
              <p style={{ fontSize: '14.5px', color: '#1b281f', lineHeight: 1.6, background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                {selectedAdvisory.advisory_text}
              </p>
            </div>

            {selectedAdvisory.sources && selectedAdvisory.sources.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1b4332', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} /> Supporting References:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedAdvisory.sources.map((src, idx) => (
                    <div key={idx} style={{ background: '#f8faf8', border: '1px solid #e2ede5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, color: '#1b4332' }}>[{src.source_id}] {src.title}</span> ({src.section})
                      <p style={{ color: '#4b6354', fontStyle: 'italic', marginTop: '2px', fontSize: '12.5px' }}>"{src.snippet}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAdvisory.follow_up_task && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Follow-Up Task:
                </h4>
                <p style={{ fontSize: '14px', color: '#78350f' }}>{selectedAdvisory.follow_up_task}</p>
                {selectedAdvisory.follow_up_due_date && (
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#b45309', display: 'block', marginTop: '4px' }}>
                    Scheduled Due Date: {selectedAdvisory.follow_up_due_date}
                  </span>
                )}
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedAdvisory(null)}
                style={{
                  background: '#1b4332',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
