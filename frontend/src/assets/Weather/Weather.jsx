import { useState, useEffect } from 'react';
import './Weather.css';
import API from '../../api/axios.js';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Weather() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const convertBackendWeather = (data) => {
    if (!data) return null;
    return {
      location: data.location || "Addis Ababa",
      current: {
        temperature: data.current?.temperature || data.current?.temp || "24°C",
        condition: data.current?.condition || "Partly cloudy",
        icon: data.current?.icon || "⛅",
        rainProbability: data.current?.rain_probability || data.current?.rainProbability || "70%",
        humidity: data.current?.humidity || "65%",
      },
      advice: {
        title: data.advice?.title || "Farming Advice",
        alert: data.advice?.alert || "⚠️ Rain expected tomorrow.",
        recommendation: data.advice?.recommendation || "Consider delaying fertilizer application until conditions improve.",
      },
      forecast: (data.forecast || []).map((day, index) => ({
        id: day.id || `f${index + 1}`,
        day: day.day || "Mon",
        date: day.date || "Oct 8",
        condition: day.condition || "Sunny",
        icon: day.icon || "☀️",
        tempHigh: day.temp_high || day.tempHigh || "25°C",
        tempLow: day.temp_low || day.tempLow || "12°C",
        rainChance: day.rain_chance || day.rainChance || "10%",
      })),
    };
  };

  useEffect(() => {
    const loadWeather = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const response = await API.get('/weather/');
        console.log('Weather data from backend:', response.data);

        if (response.data) {
          setWeatherData(convertBackendWeather(response.data));
        }
      } catch (err) {
        console.error('Failed to load weather:', err.response?.data || err.message);
        setStatusMessage({
          type: 'error',
          text: err.response?.data?.detail || 'Could not fetch live weather insights. Displaying local defaults.',
        });

        // Fallback mock data if backend endpoint is not yet active
        setWeatherData({
          location: "Addis Ababa",
          current: {
            temperature: "24°C",
            condition: "Partly cloudy",
            icon: "⛅",
            rainProbability: "70%",
            humidity: "65%",
          },
          advice: {
            title: "Farming Advice",
            alert: "⚠️ Rain expected tomorrow.",
            recommendation: "Consider delaying fertilizer application until conditions improve.",
          },
          forecast: [
            { id: "f1", day: "Mon", date: "Oct 8", condition: "Rainy", icon: "🌧️", tempHigh: "22°C", tempLow: "15°C", rainChance: "80%" },
            { id: "f2", day: "Tue", date: "Oct 9", condition: "Sunny", icon: "☀️", tempHigh: "26°C", tempLow: "13°C", rainChance: "10%" },
            { id: "f3", day: "Wed", date: "Oct 10", condition: "Cloudy", icon: "☁️", tempHigh: "23°C", tempLow: "14°C", rainChance: "30%" },
            { id: "f4", day: "Thu", date: "Oct 11", condition: "Showers", icon: "🌦️", tempHigh: "21°C", tempLow: "15°C", rainChance: "60%" },
            { id: "f5", day: "Fri", date: "Oct 12", condition: "Sunny", icon: "☀️", tempHigh: "25°C", tempLow: "12°C", rainChance: "0%" },
            { id: "f6", day: "Sat", date: "Oct 13", condition: "Partly Cloudy", icon: "⛅", tempHigh: "24°C", tempLow: "14°C", rainChance: "20%" },
            { id: "f7", day: "Sun", date: "Oct 14", condition: "Sunny", icon: "☀️", tempHigh: "27°C", tempLow: "13°C", rainChance: "5%" },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWeather();
  }, []);

  const currentData = weatherData || {
    location: "Addis Ababa",
    current: { temperature: "24°C", condition: "Loading...", icon: "⛅", rainProbability: "0%", humidity: "0%" },
    advice: { title: "Farming Advice", alert: "", recommendation: "" },
    forecast: [],
  };

  const { location, current, advice, forecast } = currentData;

  return (
    <div className="weather-container">
      <div className="weather-header">
        <h1 className="main-title">Local Weather</h1>
        <p className="sub-title">Real-time weather insights for {location}</p>
      </div>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', marginBottom: '20px', borderRadius: '12px', background: statusMessage.type === 'error' ? '#fef2f2' : '#f0fdf4', color: statusMessage.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="status-toast success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <RefreshCw size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontWeight: 600, color: '#1b4332' }}>Fetching live weather metrics...</span>
        </div>
      ) : (
        <>
          <div className="weather-hero-card">
            <div className="hero-primary">
              <div className="temp-display">
                {current.icon} {current.temperature}
              </div>
              <div className="condition-text">{current.condition}</div>
            </div>

            <div className="hero-stats">
              <div className="stat-group">
                <span className="stat-label">🌧 Rain</span>
                <span className="stat-value">{current.rainProbability}</span>
              </div>
              <div className="stat-group">
                <span className="stat-label">💧 Humidity</span>
                <span className="stat-value">{current.humidity}</span>
              </div>
            </div>
          </div>

          <div className="advice-card">
            <div className="advice-header">
              <span style={{ fontSize: '22px' }}>🌾</span>
              <h2 className="advice-title">{advice.title}</h2>
            </div>
            <p className="advice-alert">{advice.alert}</p>
            <p className="advice-recommendation">{advice.recommendation}</p>
          </div>

          <div className="forecast-section">
            <h2 className="forecast-title">7-Day Forecast</h2>
            
            <div className="forecast-grid">
              {forecast.map((day) => (
                <div key={day.id} className="forecast-card">
                  <p className="forecast-day">{day.day}</p>
                  <span className="forecast-date">{day.date}</span>
                  <span className="forecast-icon">{day.icon}</span>
                  <span className="forecast-condition">{day.condition}</span>
                  <div className="forecast-temps">
                    <span className="temp-high">{day.tempHigh}</span>
                    <span className="temp-low">{day.tempLow}</span>
                  </div>
                  <span className="forecast-rain">💧 {day.rainChance}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}