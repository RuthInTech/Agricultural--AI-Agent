import { useState, useEffect, useCallback } from 'react';
import { searchGuidance } from '../api/agent';
import { BookOpen, Search, RefreshCw, AlertCircle, FileText, Bookmark } from 'lucide-react';

const PRESET_QUERIES = [
  'Yellowing leaves',
  'Ragged holes',
  'Midday leaf rolling',
  'Water deficit',
  'Nitrogen',
  'Fall Armyworm',
];

export default function GuidancePage() {
  const [query, setQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  const [guidanceList, setGuidanceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchGuidance = useCallback(async (q, crop) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await searchGuidance(q, crop);
      if (Array.isArray(data)) {
        setGuidanceList(data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to search guidance library from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuidance(query, selectedCrop);
  }, [query, selectedCrop, fetchGuidance]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGuidance(query, selectedCrop);
  };

  const handleChipClick = (topic) => {
    setQuery(topic);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1b4332', marginBottom: '4px' }}>
            Agricultural Guidance Library
          </h1>
          <p style={{ color: '#4b6354', fontSize: '14.5px' }}>
            Official agricultural extension notes and source-referenced rules consulted via the <code>searchCropGuidance</code> agent tool.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchGuidance(query, selectedCrop)}
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

      {/* Search Bar & Crop Selector */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          background: '#ffffff',
          border: '1px solid #c8e6c9',
          borderRadius: '14px',
          padding: '12px 18px',
          marginBottom: '16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '220px' }}>
          <Search size={20} color="#2d6a4f" />
          <input
            type="text"
            placeholder="Search symptoms, pests, nutrition guidelines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', color: '#1b281f' }}
          />
        </div>

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          style={{
            border: '1px solid #c8e6c9',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            background: '#fbfdfc',
            color: '#1b4332',
            fontWeight: 600,
            outline: 'none',
          }}
        >
          <option value="Maize">Maize (Corn)</option>
        </select>

        <button
          type="submit"
          style={{
            background: '#1b4332',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {/* Suggested Topic Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Suggested Topics:
        </span>
        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleChipClick(preset)}
            style={{
              background: query === preset ? '#1b4332' : '#ffffff',
              color: query === preset ? '#ffffff' : '#2d6a4f',
              border: `1px solid ${query === preset ? '#1b4332' : '#c8e6c9'}`,
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {preset}
          </button>
        ))}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#991b1b',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '4px',
            }}
          >
            Clear
          </button>
        )}
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
          <p style={{ fontWeight: 600 }}>Searching guidance notes via backend tool...</p>
        </div>
      ) : guidanceList.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2ede5', padding: '48px', textAlign: 'center' }}>
          <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#1b4332', marginBottom: '6px' }}>No Matching Guidance Notes</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
            No stored guidance matched the query "{query}". The agent reports insufficient evidence rather than inventing advice.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {guidanceList.map((note) => (
            <div
              key={note.source_id}
              style={{
                background: '#ffffff',
                border: '1px solid #c8e6c9',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  {note.source_id}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2d6a4f',
                    background: '#e8f5e9',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {note.section}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1b4332', marginBottom: '4px' }}>
                  {note.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  Topic: {note.topic || 'Agronomy'} • Crop: {note.crop || 'Maize'}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.55, flex: '1', fontStyle: 'italic', background: '#fafcfb', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                "{note.text}"
              </p>

              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bookmark size={14} /> Official Demonstration Reference Note
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
