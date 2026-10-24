import { useState, useEffect } from 'react';
import { getCases, getLocations } from '../api/agent';
import { History, MapPin, Search, Calendar, CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export default function CasesPage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getLocations()
      .then((data) => {
        if (Array.isArray(data)) setLocations(data);
      })
      .catch(() => {});
  }, []);

  const loadCases = async (locCode) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getCases(locCode);
      if (Array.isArray(data)) {
        setCases(data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Could not fetch historical cases from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases(selectedLocation);
  }, [selectedLocation]);

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const farmer = (c.farmer_name || '').toLowerCase();
    const facts = (c.recorded_facts || '').toLowerCase();
    const crop = (c.crop || '').toLowerCase();
    const ref = (c.case_ref || '').toLowerCase();
    return farmer.includes(q) || facts.includes(q) || crop.includes(q) || ref.includes(q);
  });

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1b4332', marginBottom: '4px' }}>
            Previous Case Histories
          </h1>
          <p style={{ color: '#4b6354', fontSize: '14.5px' }}>
            Historical diagnostic observations and recorded outcomes retrieved via the <code>readCaseHistory</code> agent tool.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadCases(selectedLocation)}
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
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid #e2ede5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px' }}>
          <Search size={18} color="#40916c" />
          <input
            type="text"
            placeholder="Filter by farmer, symptoms, crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#1b281f',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="#40916c" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              border: '1px solid #c8e6c9',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13.5px',
              color: '#1b281f',
              background: '#fbfdfc',
              outline: 'none',
            }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.code || loc.id} value={loc.code || loc.id}>
                {loc.name} ({loc.code || loc.id})
              </option>
            ))}
          </select>
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
          <p style={{ fontWeight: 600 }}>Querying previous location cases from database...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ede5', padding: '48px', textAlign: 'center' }}>
          <History size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#1b4332', marginBottom: '6px' }}>No Case Histories Found</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {selectedLocation
              ? `No previous case records currently exist for location ${selectedLocation}.`
              : 'No matching case records found. Try modifying your search filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCases.map((c) => {
            const locName = c.location?.name || c.location?.code || selectedLocation || 'Regional Site';
            const followUps = c.previous_follow_ups || [];

            return (
              <div
                key={c.case_ref || c.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2ede5',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: '#1b4332',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {c.case_ref || `CASE-${c.id}`}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>
                      {c.farmer_name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#e8f5e9',
                        color: '#1b4332',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      <MapPin size={13} /> {locName}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      🌽 {c.crop || 'Maize'} ({c.growth_stage})
                    </span>
                  </div>
                </div>

                <div style={{ margin: '12px 0', fontSize: '14.5px', color: '#1b281f', lineHeight: 1.5 }}>
                  <strong style={{ color: '#2d6a4f' }}>Recorded Field Facts: </strong>
                  {c.recorded_facts}
                </div>

                {c.outcome_summary && (
                  <div style={{ margin: '8px 0', fontSize: '13.5px', color: '#334155', background: '#f8faf8', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2ede5' }}>
                    <strong style={{ color: '#166534' }}>Diagnostic Outcome / Resolution: </strong>
                    {c.outcome_summary}
                  </div>
                )}

                {followUps.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Follow-up Tasks
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {followUps.map((fu, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: '#fafcfb', padding: '6px 10px', borderRadius: '6px' }}>
                          <span style={{ color: '#1b281f' }}>• {fu.task}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: fu.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                              color: fu.status === 'Completed' ? '#166534' : '#92400e',
                            }}
                          >
                            {fu.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
