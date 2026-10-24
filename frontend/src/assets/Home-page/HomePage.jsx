
const MicIcon = () => (
<svg 
  className="mic-svg" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2.5" 
  strokeLinecap="round" 
  strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
</svg>
);
export default function Homepage(){

  return(
    <div className='homepage-wrapper'>
      <div className='top-box'>
        <div className='highlighted-note'>
          <span className='flash-icon'>⚡</span> 
          Low-Latency Dialect Voice Engine
        </div>
        <h1 className='top-header'>Ask AgriVox Anything in Your Language</h1>
        <p className='sub-text'>Tap the microphone and ask for market prices, weather advisories, or list your harvest</p>
        <div className='mic-button-wrapper'>
          <button className='voice-mic-btn' aria-label="Tap to speak">
            <MicIcon/>
            <span className='btn-label'>TAP TO SPEAK</span>
          </button>
        </div>

        <div className="suggested-container">
          <span className="suggested-title">SUGGESTED QUESTIONS</span>
          <div className="chips-wrapper">
            <button className="chip-btn">
              💬 "የዛሬ የጤፍ ዋጋ ስንት ነው?"
            </button>
            <button className="chip-btn">
              🌧️ "በሚቀጥሉት 3 ቀናት ዝናብ አለ?"
            </button>
          </div>
        </div>
      </div>

      <div className="middle-box">
        <div className="top-left">
          <h1>Predictive Commodity Prices</h1>
          <span>Machine learning price forecast updated hourly across major regional hubs.</span>
        </div>
        <div className="top-right">
          <button>View All Markets →</button>
        </div>

        <div className="card-box">
          <div className="card-top">
            <div className="left">
              🌾
            </div>
            <div className="middle">
              <h1>White Teff</h1>
              <span>Addis Ababa Central</span>
            </div>
            <div className="right">
              + 3.1%
            </div>
          </div>
          <div className="card-middle">
            <h1>8,200 ETB</h1>
            <span>/Quintal</span>
            <h3>📈 14-Day Forecast: Projected to reach 8,450 ETB</h3>
          </div>
          <div className="card-lower">
            <span>Demand: High</span>
          </div>
        </div>

        <div className="card-box">
          <div className="card-top">
            <div className="left">
              🌾
            </div>
            <div className="middle">
              <h1>Red Teff</h1>
              <span>Bahir Dar Regional</span>
            </div>
            <div className="right">
              + +1.8%
            </div>
          </div>
          <div className="card-middle">
            <h1>6,750 ETB</h1>
            <span>/Quintal</span>
            <h3>📈 14-Day Forecast: Moderate upward trend</h3>
          </div>
          <div className="card-lower">
            <span>Demand: Medium</span>
          </div>
        </div>

        <div className="card-box">
          <div className="card-top">
            <div className="left">
              ☕
            </div>
            <div className="middle">
              <h1>Export Grade Coffee</h1>
              <span>Jimma Exchange</span>
            </div>
            <div className="right3">
              ➔ Stable
            </div>
          </div>
          <div className="card-middle">
            <h1>18,400 ETB</h1>
            <span>/Quintal</span>
            <h3>📈 14-Day Forecast: Prices holding steady</h3>
          </div>
          <div className="card-lower">
            <span>Demand: Very High</span>
          </div>
        </div>
      </div>

      <div className="lower-section">
        <div className="lower-box">
          <div className="lower-upper">
            <h3 className="lower-tag">DIRECT MARKET ACCESS</h3>
            <h1 className="lower-title">List Your Harvest via Voice</h1>
            <p className="lower-desc">Eliminate middleman price goughing. Speak your crop yield and location to isntantly list your products for verified regional wholesalers.</p>
          </div>
          <button className="voice-list-btn">
            <span>🎙️</span>
            <span>Speak via Your Voice</span>
          </button>
        </div>

        <div className="lower-lower">
          <div className="lower-lower-upper">
            <div className="lower-lower-left">
              <h2>Verified Regional Buyers</h2> 
              <span>Automated SMS and voice matching with bulk buyers.</span>
            </div>
            
            <div className="lower-lower-right">
              <span className="badge-active">3 Active Near You</span>
            </div>
          </div>

          <div className="lower-lower-middle">
            <div className="buyer-avatar">A1</div>
            <div className="buyer-info">
              <h4>Addis Farmers Union</h4>
              <span>Seeking 50+ Quintals White Teff</span>
            </div>
            <button className="connect-btn">connect</button>
          </div>

          <div className="lower-lower-lower">
            <button className="browse-btn">Browse All Bulk Buyers →</button>
          </div>
        </div>
      </div>  
    </div>
  );

}