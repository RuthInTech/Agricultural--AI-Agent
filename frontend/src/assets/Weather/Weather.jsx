import { useState, useEffect, useCallback } from 'react';
import './Weather.css';
import { getWeather } from '../../api/weather';
import { RefreshCw, MapPin, AlertCircle, CheckCircle2, Wind, Droplets, CloudRain } from 'lucide-react';

const PRESET_LOCATIONS = [
  { label: 'Addis Ababa', value: 'Addis Ababa' },
  { label: 'Site A (Debre Zeit)', value: 'SITE-A' },
  { label: 'Site B (Hawassa)', value: 'SITE-B' },
  { label: 'Site C (Adama)', value: 'SITE-C' },
  { label: 'Bahir Dar', value: 'Bahir Dar' },
  { label: 'Jimma', value: 'Jimma' },
];

export default function Weather() {
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchWeather = useCallback(async (loc) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getWeather(loc);
      if (data && data.current) {
        setWeatherData(data);
      } else {
        setErrorMessage(`Weather insights currently unavailable for '${loc}'. Please retry.`);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Could not connect to live weather telemetry. Please check backend connection.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [selectedLocation, fetchWeather]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSelectedLocation(searchInput.trim());
    setSearchInput('');
  };

  const handlePresetClick = (locValue) => {
    setSelectedLocation(locValue);
  };

  const current = weatherData?.current;
  const advice = weatherData?.advice;
  const forecast = weatherData?.forecast || [];

  return (
    <div className="weather-container">
      <div className="weather-header">
        <div className="weather-header__text">
          <h1>Agricultural Weather Intelligence</h1>
          <p>Real-time telemetry and 7-day agronomic forecasts for Ethiopian farming hubs</p>
        </div>

        <div className="weather-controls">
          <form onSubmit={handleSearchSubmit} className="weather-search-box">
            <input
              type="text"
              placeholder="Search city/region..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <button
            type="button"
            className="weather-refresh-btn"
            onClick={() => fetchWeather(selectedLocation)}
            disabled={isLoading}
            title="Refresh weather data"
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} style={isLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Preset Location Chips */}
      <div className="weather-presets">
        {PRESET_LOCATIONS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`weather-preset-chip ${selectedLocation === preset.value ? 'is-active' : ''}`}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="status-toast error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => fetchWeather(selectedLocation)}
            style={{ marginLeft: 'auto', background: '#991b1b', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && !weatherData ? (
        <div style={{ background: '#fff', border: '1px solid #e2ede5', borderRadius: '18px', padding: '48px', textAlign: 'center', color: '#2d6a4f' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>Retrieving live weather telemetry & forecast...</p>
        </div>
      ) : weatherData && current ? (
        <>
          {/* Hero Weather Card */}
          <div className="weather-hero-card">
            <div className="weather-hero__main">
              <div className="weather-hero__location">
                <MapPin size={22} />
                <span>{weatherData.location}</span>
              </div>

              <div className="weather-hero__temp-group">
                <span className="weather-hero__icon">{current.icon}</span>
                <span className="weather-hero__temp">{current.temperature}</span>
              </div>

              <div className="weather-hero__condition">{current.condition}</div>
              <div className="weather-hero__time">Updated: {current.updated_at}</div>
            </div>

            <div className="weather-hero__metrics">
              <div className="metric-pill">
                <span className="metric-pill__label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CloudRain size={14} /> Rain Probability
                </span>
                <span className="metric-pill__value">{current.rain_probability}</span>
              </div>

              <div className="metric-pill">
                <span className="metric-pill__label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Droplets size={14} /> Humidity
                </span>
                <span className="metric-pill__value">{current.humidity}</span>
              </div>

              <div className="metric-pill">
                <span className="metric-pill__label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wind size={14} /> Wind Speed
                </span>
                <span className="metric-pill__value">{current.wind_speed}</span>
              </div>

              <div className="metric-pill">
                <span className="metric-pill__label">Country / Basin</span>
                <span className="metric-pill__value" style={{ fontSize: '15px' }}>{weatherData.country}</span>
              </div>
            </div>
          </div>

          {/* Farming Advisory Card */}
          {advice && (
            <div className="weather-advice-card">
              <div className="weather-advice__header">
                <span style={{ fontSize: '20px' }}>🌾</span>
                <h3>{advice.title}</h3>
              </div>
              <p className="weather-advice__alert">{advice.alert}</p>
              <p className="weather-advice__rec">{advice.recommendation}</p>
            </div>
          )}

          {/* 7-Day Forecast Grid */}
          <div className="forecast-section">
            <h2>7-Day Agricultural Forecast</h2>
            <div className="forecast-grid">
              {forecast.map((day) => (
                <div key={day.id} className="forecast-card">
                  <span className="forecast-day">{day.day}</span>
                  <span className="forecast-date">{day.date}</span>
                  <span className="forecast-icon">{day.icon}</span>
                  <span className="forecast-condition">{day.condition}</span>
                  <div className="forecast-temps">
                    <span className="forecast-temp-high">{day.temp_high}</span>
                    <span className="forecast-temp-low">{day.temp_low}</span>
                  </div>
                  <span className="forecast-rain">💧 {day.rain_chance}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}