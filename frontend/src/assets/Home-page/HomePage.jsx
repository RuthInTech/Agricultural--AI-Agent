import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ClipboardList,
  CloudSun,
  History,
  BookmarkCheck,
  BookOpen,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Droplets,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { getStoredUser } from '../../api/auth';
import { getWeather } from '../../api/weather';
import { getCases, getSavedAdvisories, searchGuidance, getLocations } from '../../api/agent';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('SITE-A');
  const [weather, setWeather] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [recentAdvisories, setRecentAdvisories] = useState([]);
  const [guidancePreview, setGuidancePreview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Fetch locations
  useEffect(() => {
    getLocations()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live weather for selected location
  useEffect(() => {
    getWeather(selectedLocation)
      .then((data) => {
        if (data?.current) setWeather(data);
      })
      .catch(() => {});
  }, [selectedLocation]);

  // Load dashboard widgets from backend
  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      getCases(),
      getSavedAdvisories(),
      searchGuidance('', 'Maize'),
    ])
      .then(([casesRes, advisoriesRes, guidanceRes]) => {
        if (casesRes.status === 'fulfilled' && Array.isArray(casesRes.value)) {
          setRecentCases(casesRes.value.slice(0, 3));
        }
        if (advisoriesRes.status === 'fulfilled' && Array.isArray(advisoriesRes.value)) {
          setRecentAdvisories(advisoriesRes.value.slice(0, 3));
        }
        if (guidanceRes.status === 'fulfilled' && Array.isArray(guidanceRes.value)) {
          setGuidancePreview(guidanceRes.value.slice(0, 2));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const userName = currentUser?.first_name || currentUser?.username || 'Extension Worker';

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
      {/* Welcoming Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '32px 36px',
          marginBottom: '28px',
          boxShadow: '0 8px 30px rgba(27, 67, 50, 0.16)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.16)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={14} /> AgriGuide Agricultural Intelligence System
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Welcome back, {userName}!
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: 1.5 }}>
            Help farmers report maize crop problems, cross-reference historical cases, retrieve verified agronomic guidance, and generate source-referenced advisories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/Recommendations')}
          style={{
            background: '#ffffff',
            color: '#1b4332',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.15s ease',
          }}
        >
          <ClipboardList size={18} color="#1b4332" />
          <span>New Crop Assessment</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Grid: Live Weather + Location Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Weather Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #c8e6c9',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudSun size={20} color="#2d6a4f" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1b4332' }}>Live Weather Telemetry</h3>
            </div>

            {/* Location Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="#40916c" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  border: '1px solid #c8e6c9',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '13px',
                  background: '#f8faf8',
                  color: '#1b4332',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="SITE-A">Site A (Debre Zeit)</option>
                <option value="SITE-B">Site B (Hawassa)</option>
                <option value="SITE-C">Site C (Adama)</option>
                <option value="Bahir Dar">Bahir Dar</option>
              </select>
            </div>
          </div>

          {weather && weather.current ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <span style={{ fontSize: '42px' }}>{weather.current.icon}</span>
                <div>
                  <div style={{ fontSize: '38px', fontWeight: 800, color: '#1b4332', lineHeight: 1 }}>
                    {weather.current.temperature}
                  </div>
                  <div style={{ fontSize: '15px', color: '#4b6354', fontWeight: 500, marginTop: '2px' }}>
                    {weather.current.condition} • {weather.location}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: '#334155', background: '#fafcfb', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2ede5' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Droplets size={14} color="#0284c7" /> Humidity: <strong>{weather.current.humidity}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Wind size={14} color="#0d9488" /> Wind: <strong>{weather.current.wind_speed}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  🌧 Rain: <strong>{weather.current.rain_probability}</strong>
                </span>
              </div>

              {weather.advice && (
                <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px' }}>
                  <strong>{weather.advice.alert}</strong> {weather.advice.recommendation}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 6px' }} />
              Fetching live weather...
            </div>
          )}
        </div>

        {/* Quick Action & Protocol Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #c8e6c9',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1b4332', marginBottom: '8px' }}>
              Extension Workflow Protocol
            </h3>
            <p style={{ fontSize: '13.5px', color: '#4b6354', lineHeight: 1.5, marginBottom: '16px' }}>
              Follow the bounded agent workflow: report observations, read case histories, search guidance, review cited recommendations, and approve with explicit confirmation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                <CheckCircle2 size={16} /> 1. Input field telemetry & symptoms
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                <CheckCircle2 size={16} /> 2. Agent searches guidance & past cases
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                <CheckCircle2 size={16} /> 3. Review, edit & confirm advisory
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/Recommendations')}
            style={{
              background: '#e8f5e9',
              color: '#1b4332',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Launch Assessment</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Cases & Saved Advisories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Recent Cases */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2ede5',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#2d6a4f" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1b4332' }}>Recent Field Cases</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/CaseHistory')}
              style={{ background: 'transparent', border: 'none', color: '#2d6a4f', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>

          {recentCases.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '13.5px', padding: '16px 0' }}>No historical cases retrieved.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentCases.map((c) => (
                <div
                  key={c.case_ref || c.id}
                  style={{
                    background: '#fbfdfc',
                    border: '1px solid #e2ede5',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px', color: '#1b4332' }}>{c.farmer_name}</strong>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                      {c.case_ref}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b6354', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.recorded_facts}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Saved Advisories */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2ede5',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookmarkCheck size={18} color="#2d6a4f" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1b4332' }}>Persistent Records</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/SavedRecords')}
              style={{ background: 'transparent', border: 'none', color: '#2d6a4f', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>

          {recentAdvisories.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '10px' }}>No advisories saved yet.</p>
              <button
                type="button"
                onClick={() => navigate('/Recommendations')}
                style={{ background: '#1b4332', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
              >
                Create First Report
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAdvisories.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    background: '#fbfdfc',
                    border: '1px solid #e2ede5',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/SavedRecords')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px', color: '#1b4332' }}>
                      {rec.farmer_name || 'Farmer Record'} (#{rec.id})
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Approved'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b6354', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rec.advisory_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guidance Library Snippet */}
      {guidancePreview.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #c8e6c9',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#2d6a4f" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1b4332' }}>Official Agricultural Guidance</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/Guidance')}
              style={{ background: 'transparent', border: 'none', color: '#2d6a4f', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Open Library →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {guidancePreview.map((note) => (
              <div
                key={note.source_id}
                style={{
                  background: '#fbfdfc',
                  border: '1px solid #e2ede5',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ background: '#1b4332', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                    {note.source_id}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#52b788' }}>{note.section}</span>
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1b281f', margin: '4px 0' }}>{note.title}</h4>
                <p style={{ fontSize: '12.5px', color: '#4b6354', fontStyle: 'italic', margin: 0 }}>"{note.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}