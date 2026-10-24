import {useNavigate} from "react-router-dom";
import {useState, useRef} from "react";

const SproutIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c0-4.4 3.6-8 8-8" /><path d="M4 11c3.5 0 6.5 2.5 7 6" /><path d="M12 20V10" /><path d="M12 10a8 8 0 0 1 8-8 8 8 0 0 1-8 8Z" />
  </svg>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const MenuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);


export default function IntroPage(){

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const targetSectionRef = useRef(null);
    
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/Register");
  };

  const navigate3 = useNavigate();
  const handleNavigate3 = () => {
    navigate3("/Login");
  };



  const handleNavAndScroll = (e, tabName) => {
    e.preventDefault(); 
    setActiveTab(tabName);

    if (targetSectionRef.current) {
      targetSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return(
    <div className="agrivox-page-wrapper">
      <header className="agrivox-navbar">
        <div className="agrivox-nav-container">
          <a href="#home" className="agrivox-brand-logo">
            <div className="agrivox-logo-icon">
              <SproutIcon />
            </div>

            <div className="agrivox-brand-text">
              <span className="agrivox-title">AgriVox</span>
              <span className="agrivox-subtitle">AGRI-INTELLIGENCE ECOSYSTEM</span>
            </div>
          </a>

          <nav className="agrivox-nav-menu">
            <a href="vision" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'all')}>Platform Vision</a>
            <a href="voice" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'voice')}>Voice AI Engine</a>
            <a href="market" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'market')}>Direct Exchange</a>
            <a href="climate" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'climate')}>Agro-Climate</a>
          </nav>

          <div className="agrivox-nav-actions">
            <button className="agrivox-btn-secondary" onClick={handleNavigate3}>
              Portal Sign In
            </button>
            <button className="agrivox-btn-primary" onClick={handleNavigate}>
              Join Ecosystem
            </button>
          </div>

          <button 
            className="agrivox-mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu">
           {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="agrivox-mobile-drawer">
            <nav className="agrivox-mobile-menu">
              <a href="vision" onClick={(e) => handleNavAndScroll(e, 'all')}>Platform Vision</a>
              <a href="voice" onClick={(e) => handleNavAndScroll(e, 'voice')}>Voice AI Engine</a>
              <a href="market" onClick={(e) => handleNavAndScroll(e, 'market')}>Direct Exchange</a>
              <a href="climate" onClick={(e) => handleNavAndScroll(e, 'climate')}>Agro-Climate</a>
            </nav>
            <div className="agrivox-mobile-actions">
              <button className="agrivox-btn-secondary" onClick={handleNavigate3}>
                Portal Sign In
              </button>
              <button className="agrivox-btn-primary" onClick={handleNavigate}>
                Join Ecosystem <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="agrivox-main-content">                  
        <section className="agrivox-hero-section">
          <div className="agrivox-hero-badge">
            <span className="agrivox-badge-pulse"></span>
            <span>Transforming African Agriculture Through Voice Intelligence</span>
          </div>

          <h1 className="agrivox-hero-heading">
            Empowering every farmer with <span className="agrivox-heading-accent">voice-driven insights & fair market access.</span>
          </h1>

          <p className="agrivox-hero-description">
            AgriVox breaks digital and literacy barriers across rural food supply chains. We combine multi-lingual voice AI, real-time commodity pricing forecasts, and precision soil diagnostic models into an open, accessible agricultural network.
          </p>

          <div className="agrivox-cta-wrapper">
            <button className="agrivox-btn-hero-primary" onClick={handleNavigate}>
              Launch AgriVox Platform <ArrowRightIcon />
            </button>
            <button className="agrivox-btn-hero-secondary" onClick={handleNavigate}>
              Listen to Amharic Voice Demo
            </button>
          </div>

          <div className="agrivox-hero-stats">
            <div className="hero-stat-item">
              <span className="stat-number">2</span>
              <span className="stat-desc">Regional Languages & Dialects Supported</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-desc">Market Price Prediction Accuracy</span>
            </div>
            <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="stat-number">0.2s</span>
                <span className="stat-desc">Low-Latency Voice Query Response</span>
              </div>
            </div>
        </section>

        <section ref={targetSectionRef} className="agrivox-filter-bar">
          <div className="agrivox-chip-scroll">
            <button 
              className={`agrivox-chip ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              >
                🌱 Complete Platform Vision
            </button>                    
            <button 
              className={`agrivox-chip ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveTab('voice')}
              >
                🎙️ Multilingual Voice Engine
            </button>
            <button 
              className={`agrivox-chip ${activeTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveTab('market')}
              >
                📈 Price Intelligence & Trading
            </button>
            <button 
              className={`agrivox-chip ${activeTab === 'climate' ? 'active' : ''}`}
              onClick={() => setActiveTab('climate')}
              >
                ☀️ Agro-Climate & Soil Health
            </button>
          </div>
        </section>

        <section className="agrivox-pinterest-grid">        

          {(activeTab === 'all' || activeTab === 'voice') && (
            <div className="agrivox-pin-card agrivox-card-emerald">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><MicIcon /> Voice First AI</span>
                <span className="agrivox-lang-pill">አማርኛ • English</span>
              </div>
              <h3 className="agrivox-pin-title">Dialect-Aware Conversational AI</h3>
              <p className="agrivox-pin-body">
                Farmers can speak naturally in local languages using basic smartphone browsers or low-bandwidth voice channels. No typing or complex navigation required.
              </p>
                        
              <div className="agrivox-voice-box">
                <div className="agrivox-voice-user">
                  <span className="agrivox-voice-label">Farmer Voice Inquiry:</span>
                  <p className="agrivox-voice-quote">"የስንዴ እና የጤፍ የገበያ ዋጋ በዛሬው ዕለት ስንት ነው?"</p>
                </div>
                <div className="agrivox-voice-waves">
                  <span className="wave bar1"></span>
                  <span className="wave bar2"></span>
                  <span className="wave bar3"></span>
                  <span className="wave bar4"></span>
                  <span className="wave bar5"></span>
                </div>
                <div className="agrivox-voice-ai">
                  <span className="agrivox-voice-label">AgriVox Voice Response:</span>
                  <p className="agrivox-voice-response">"Today's White Teff is trading at 8,200 ETB/Quintal (+3.1%). Wheat is steady at 4,900 ETB."</p>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'market') && (
            <div className="agrivox-pin-card">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><TrendingUpIcon /> Market Forecasting</span>
              </div>
              <h3 className="agrivox-pin-title">Predictive Commodity Pricing</h3>
              <p className="agrivox-pin-body">
                Advanced machine learning models analyze historical trading volumes, seasonal weather patterns, and transportation costs to predict crop price movements up to 14 days in advance.
              </p>
                  
              <div className="agrivox-stat-card">
                <div className="agrivox-stat-row">
                  <div>
                    <span className="crop-name">White Teff</span>
                    <span className="crop-loc">Addis Ababa Central</span>
                  </div>
                  <span className="agrivox-stat-badge positive">↑ 8,200 ETB (+3.1%)</span>
                </div>
                <div className="agrivox-stat-row">
                  <div>
                    <span className="crop-name">Red Teff</span>
                    <span className="crop-loc">Bahr Dar Regional</span>
                  </div>
                  <span className="agrivox-stat-badge positive">↑ 6,750 ETB (+1.8%)</span>
                </div>
                  <div className="agrivox-stat-row">
                    <div>
                      <span className="crop-name">Export Grade Coffee</span>
                      <span className="crop-loc">Jimma Exchange</span>
                    </div>
                    <span className="agrivox-stat-badge neutral">→ 18,400 ETB (Stable)</span>
                  </div>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'market') && (
            <div className="agrivox-pin-card">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><StoreIcon /> Direct Exchange</span>
              </div>
              <h3 className="agrivox-pin-title">Bypassing Information Middlemen</h3>
              <p className="agrivox-pin-body">
                We eliminate predatory price gouging by providing a transparent digital exchange where smallholder farmers, regional cooperatives, and commercial wholesalers trade directly.
              </p>
              <div className="agrivox-trade-preview">
                <div className="trade-step">
                  <div className="step-num">1</div>
                  <p>Farmers list expected yield via simple voice prompt</p>
                </div>
                <div className="trade-step">
                  <div className="step-num">2</div>
                  <p>AI verifies quality benchmarks and local price index</p>
                </div>
                <div className="trade-step">
                  <div className="step-num">3</div>
                  <p>Instant SMS & Voice matching with verified bulk buyers</p>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'climate') && (
            <div className="agrivox-pin-card">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><SunIcon /> Precision Agriculture</span>
              </div>
              <h3 className="agrivox-pin-title">Micro-Climate & Agro-Advisories</h3>
              <p className="agrivox-pin-body">
                Hyper-local weather telemetry combined with satellite soil moisture mapping gives growers actionable advice on optimal sowing, fertilization, and harvesting schedules.
              </p>
              <div className="agrivox-weather-preview">
                <div className="agrivox-weather-icon"><SunIcon /></div>
                <div>
                  <h4 className="agrivox-weather-temp">Optimal Plant Season • High Yield Potential</h4>
                  <p className="agrivox-weather-text">Rain expected in 48 hours. Recommended fertilizer application window closes tomorrow evening.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="agrivox-pin-card agrivox-card-accent">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><GlobeIcon /> Macro Impact</span>
              </div>
              <h3 className="agrivox-pin-title">Regional Supply Chain Analytics</h3>
              <p className="agrivox-pin-body">
                Providing governments, agricultural NGOs, and food security agencies with real-time crop health heatmaps and regional yield estimates to prevent food shortages.
              </p>
              <div className="agrivox-impact-tags">
                <span className="impact-pill">Food Security Alerting</span>
                <span className="impact-pill">Regional Yield Heatmaps</span>
                <span className="impact-pill">Fair Trade Verification</span>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>        
  );
}