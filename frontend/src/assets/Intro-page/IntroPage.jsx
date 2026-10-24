import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

const SproutIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" /><path d="M10 20c0-4.4 3.6-8 8-8" /><path d="M4 11c3.5 0 6.5 2.5 7 6" /><path d="M12 20V10" /><path d="M12 10a8 8 0 0 1 8-8 8 8 0 0 1-8 8Z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
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

export default function IntroPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const targetSectionRef = useRef(null);

  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/Register");
  };

  const handleSignIn = () => {
    navigate("/Login");
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

  return (
    <div className="agrivox-page-wrapper">
      {/* Header Bar */}
      <header className="agrivox-navbar">
        <div className="agrivox-nav-container">
          <a href="#home" className="agrivox-brand-logo">
            <div className="agrivox-logo-icon">
              <SproutIcon />
            </div>
            <div className="agrivox-brand-text">
              <span className="agrivox-title">AgriGuide</span>
              <span className="agrivox-subtitle">AI AGRICULTURAL EXTENSION PLATFORM</span>
            </div>
          </a>

          <nav className="agrivox-nav-menu">
            <a href="#workflow" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'all')}>Platform Overview</a>
            <a href="#guidance" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'guidance')}>Crop Guidance</a>
            <a href="#history" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'history')}>Case Management</a>
            <a href="#approval" className="agrivox-nav-link" onClick={(e) => handleNavAndScroll(e, 'approval')}>Secure Advisories</a>
          </nav>

          <div className="agrivox-nav-actions">
            <button className="agrivox-btn-secondary" onClick={handleSignIn}>
              Sign In
            </button>
            <button className="agrivox-btn-primary" onClick={handleRegister}>
              Register
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
              <a href="#workflow" onClick={(e) => handleNavAndScroll(e, 'all')}>Platform Overview</a>
              <a href="#guidance" onClick={(e) => handleNavAndScroll(e, 'guidance')}>Crop Guidance</a>
              <a href="#history" onClick={(e) => handleNavAndScroll(e, 'history')}>Case Management</a>
              <a href="#approval" onClick={(e) => handleNavAndScroll(e, 'approval')}>Secure Advisories</a>
            </nav>
            <div className="agrivox-mobile-actions">
              <button className="agrivox-btn-secondary" onClick={handleSignIn}>
                Sign In
              </button>
              <button className="agrivox-btn-primary" onClick={handleRegister}>
                Submit Crop Report <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero Section */}
      <main className="agrivox-main-content">
        <section className="agrivox-hero-section">
          <div className="agrivox-hero-badge">
            <span className="agrivox-badge-pulse"></span>
            <span>Enterprise AI Agricultural Extension System</span>
          </div>

          <h1 className="agrivox-hero-heading">
            Intelligent, source-referenced crop advisory for <span className="agrivox-heading-accent">modern farming operations.</span>
          </h1>

          <p className="agrivox-hero-description">
            AgriGuide streamlines field problem reporting, queries verified agronomic guidance databases, cross-references historical farm records, and generates actionable advisories backed by complete accountability and user verification.
          </p>

          <div className="agrivox-cta-wrapper">
            <button className="agrivox-btn-hero-primary" onClick={handleRegister}>
              Launch Extension Platform <ArrowRightIcon />
            </button>
            <button className="agrivox-btn-hero-secondary" onClick={handleRegister}>
              Explore Knowledge Base
            </button>
          </div>

          {/* Professional Stats Bar */}
          <div className="agrivox-hero-stats">
            <div className="hero-stat-item">
              <span className="stat-number">Real-Time</span>
              <span className="stat-desc">Field Condition Analysis</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">Verified</span>
              <span className="stat-desc">Agronomic Guidelines</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">Secure</span>
              <span className="stat-desc">Centralized Case History</span>
            </div>
          </div>
        </section>

        {/* Tab Filter Bar */}
        <section ref={targetSectionRef} className="agrivox-filter-bar">
          <div className="agrivox-chip-scroll">
            <button
              className={`agrivox-chip ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              🌱 Complete Platform Capabilities
            </button>
            <button
              className={`agrivox-chip ${activeTab === 'guidance' ? 'active' : ''}`}
              onClick={() => setActiveTab('guidance')}
            >
              📚 Validated Crop Guidance
            </button>
            <button
              className={`agrivox-chip ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📂 Farm Case History
            </button>
            <button
              className={`agrivox-chip ${activeTab === 'approval' ? 'active' : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              ✅ Verification & Workflows
            </button>
          </div>
        </section>

        {/* Cards Grid */}
        <section className="agrivox-pinterest-grid">

          {(activeTab === 'all' || activeTab === 'guidance') && (
            <div className="agrivox-pin-card agrivox-card-emerald">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><BookOpenIcon /> Guidance Retrieval</span>
                <span className="agrivox-lang-pill">Knowledge Base • Maize</span>
              </div>
              <h3 className="agrivox-pin-title">Evidence-Based Reference Engine</h3>
              <p className="agrivox-pin-body">
                Instantly queries structured agronomic documentation to match field symptoms with official guidelines, ensuring recommendations remain grounded and cautious.
              </p>

              <div className="agrivox-voice-box">
                <div className="agrivox-voice-user">
                  <span className="agrivox-voice-label">Sample Field Observation:</span>
                  <p className="agrivox-voice-quote">"Yellowing leaves starting from leaf tips following heavy rainfall."</p>
                </div>
                <div className="agrivox-voice-ai">
                  <span className="agrivox-voice-label">Matched Guidance Reference:</span>
                  <p className="agrivox-voice-response">"Yellow leaves can have multiple possible causes. Record affected leaves, growth stage, and soil moisture before concluding."</p>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'history') && (
            <div className="agrivox-pin-card">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><HistoryIcon /> Case Management</span>
              </div>
              <h3 className="agrivox-pin-title">Regional Farm History Tracking</h3>
              <p className="agrivox-pin-body">
                Maintains continuous records across regional farm sites, enabling extension officers to review previous treatments and track follow-up tasks seamlessly.
              </p>

              <div className="agrivox-stat-card">
                <div className="agrivox-stat-row">
                  <div>
                    <span className="crop-name">Site A — Central Station</span>
                    <span className="crop-loc">Active Case: Abebe Tadesse</span>
                  </div>
                  <span className="agrivox-stat-badge positive">Vegetative (V8)</span>
                </div>
                <div className="agrivox-stat-row">
                  <div>
                    <span className="crop-name">Site B — Regional Valley</span>
                    <span className="crop-loc">Active Case: Tigist Bekele</span>
                  </div>
                  <span className="agrivox-stat-badge positive">Early Whorl</span>
                </div>
                <div className="agrivox-stat-row">
                  <div>
                    <span className="crop-name">Site C — Expansion Hub</span>
                    <span className="crop-loc">New Deployment Zone</span>
                  </div>
                  <span className="agrivox-stat-badge neutral">Ready</span>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'approval') && (
            <div className="agrivox-pin-card">
              <div className="agrivox-pin-header">
                <span className="agrivox-pin-tag"><CheckCircleIcon /> Advisory Governance</span>
              </div>
              <h3 className="agrivox-pin-title">Explicit Expert Verification</h3>
              <p className="agrivox-pin-body">
                Generated advisories and follow-up schedules are presented in preview mode. Data is only committed to permanent records upon explicit confirmation from an extension agent.
              </p>
              <div className="agrivox-trade-preview">
                <div className="trade-step">
                  <div className="step-num">1</div>
                  <p>AI generates preliminary advisory with verified citations</p>
                </div>
                <div className="trade-step">
                  <div className="step-num">2</div>
                  <p>Officer reviews, adjusts, and assigns follow-up tasks</p>
                </div>
                <div className="trade-step">
                  <div className="step-num">3</div>
                  <p>Explicit sign-off securely stores record to database</p>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}