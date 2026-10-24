import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  Leaf,
  Wheat,
  ShieldCheck,
  CloudSun,
  FileText,
  CheckCircle2,
  ArrowRight,
  Search,
  Database,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Lock,
  Menu,
  X,
  Sparkles,
  ClipboardCheck,
  Thermometer,
  Wind,
  Droplets,
  BookOpen,
  UserCheck,
  Check,
} from 'lucide-react';
import '../css-files/intro-page.css';

export default function IntroPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('GUIDE-001');
  const [activeFeatureTab, setActiveFeatureTab] = useState('agent');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll position to power the plant growth animation
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = window.scrollY;
        const progress = Math.min(Math.max(current / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute current plant growth stage based on scroll depth
  const getGrowthStage = (progress) => {
    if (progress < 0.25) {
      return {
        stage: 'Seedling Sprout',
        phase: 'Germination & Early Scouting',
        icon: Sprout,
        color: '#16a34a',
      };
    } else if (progress < 0.50) {
      return {
        stage: 'Vegetative Whorl',
        phase: 'Leaf Canopy & Frass Check',
        icon: Leaf,
        color: '#15803d',
      };
    } else if (progress < 0.75) {
      return {
        stage: 'Tasseling Phase',
        phase: 'Stalk Borer & Climate Watch',
        icon: Wheat,
        color: '#ca8a04',
      };
    } else {
      return {
        stage: 'Mature Harvest',
        phase: 'Evidence-Verified Crop Yield',
        icon: ShieldCheck,
        color: '#059669',
      };
    }
  };

  const currentGrowthStage = getGrowthStage(scrollProgress);
  const StageIcon = currentGrowthStage.icon;

  // Strict Credential Guard:
  // Every entry button on the landing page requires credentials before accessing the web app.
  const handleRequireCredentials = (targetPath = '/Recommendations') => {
    navigate('/Login', { state: { from: { pathname: targetPath } } });
  };

  // Demo simulator scenarios
  const demoScenarios = {
    'GUIDE-001': {
      title: 'Maize Fall Armyworm Early Scouting',
      location: 'SITE-A (Bishoftu Demonstration Farm)',
      crop: 'Maize (Zea mays)',
      stage: 'Vegetative (V4 - V6)',
      symptoms: 'Translucent window-pane leaf feeding, small pinholes, moist sawdust-like frass inside the whorl.',
      toolTrace: [
        { tool: 'readCaseHistory', param: "location='SITE-A'", status: '2 historical records found' },
        { tool: 'searchCropGuidance', param: "query='maize leaf frass windows'", status: 'Matched GUIDE-001 §2.1' },
      ],
      citation: {
        id: 'GUIDE-001',
        section: 'Section 2.1 — Early Stage Whorl Feeding',
        snippet: 'Early instar larvae graze epidermis creating silvery window panes. Hand-picking or targeted biopesticide recommended before larvae bore deep into growing point.'
      },
      diagnosis: 'High probability of early-instar Fall Armyworm (Spodoptera frugiperda) infestation.',
      caution: 'Preliminary diagnostic hypothesis. Confirm with physical sampling before chemical application.',
      followUp: 'Scout 20 consecutive maize plants in a W-pattern. Record percentage with active frass by Oct 28.',
      status: 'Approved by Extension Officer'
    },
    'CASE-002': {
      title: 'Maize Stalk Borer Borehole Investigation',
      location: 'SITE-B (Hawassa Demonstration Plot)',
      crop: 'Maize (Zea mays)',
      stage: 'Late Whorl / Tasseling',
      symptoms: 'Internal stem tunneling, circular entrance holes with coarse frass plugs, yellowing top whorl.',
      toolTrace: [
        { tool: 'readCaseHistory', param: "location='SITE-B'", status: 'Prior Busseola fusca case in 2024' },
        { tool: 'searchCropGuidance', param: "query='maize stem tunneling frass plugs'", status: 'Matched GUIDE-002 §4.3' },
      ],
      citation: {
        id: 'GUIDE-002',
        section: 'Section 4.3 — African Maize Stalk Borer Control',
        snippet: 'Larvae penetrate stem after 2nd instar. Foliar sprays are ineffective once larvae are internal. Utilize push-pull intercropping with Desmodium or parasitic wasps.'
      },
      diagnosis: 'Symptoms consistent with African Maize Stalk Borer (Busseola fusca) stem penetration.',
      caution: 'Chemical foliar sprays will not reach internal borers. Avoid unnecessary pesticide expenditure.',
      followUp: 'Destructively sample 5 lodged stems to identify larval instar stage and assess damage severity.',
      status: 'Approved by Extension Officer'
    }
  };

  const currentScenario = demoScenarios[selectedDemo];

  const faqs = [
    {
      q: 'How does AgriGuide prevent AI hallucinations and incorrect diagnoses?',
      a: 'AgriGuide operates within a strictly bounded agent loop. The AI is not permitted to generate diagnostic advice from unrestricted memory. Instead, it must invoke searchCropGuidance to pull verified research notes and readCaseHistory to inspect regional records. Every observation, hypothesis, and follow-up task is explicitly linked to real source IDs and verbatim snippets.'
    },
    {
      q: 'Can the AI save records or alter farm data on its own?',
      a: 'No. Autonomous database mutations are completely prohibited by design. The AI only produces an editable preview. An agricultural extension officer or farmer must inspect the evidence, optionally edit the text or proposed task, and check an explicit confirmation box before the backend executes saveAdvisoryAndFollowUp.'
    },
    {
      q: 'How is live agro-climate weather data integrated?',
      a: 'The Django backend proxies weather requests to Open-Meteo geocoding and forecast APIs without exposing sensitive credentials to the browser. The frontend displays current temperature, relative humidity, wind speed, precipitation, and a 7-day forecast alongside contextual agricultural advice (e.g., spray drift thresholds and evapotranspiration risks).'
    },
    {
      q: 'Which crops and geographic locations are supported in this demo?',
      a: 'This hackathon release specifically targets maize (Zea mays) across three Ethiopian agricultural research locations: SITE-A (Bishoftu/Debre Zeit), SITE-B (Hawassa), and SITE-C (Adama). The underlying model and data schema easily scale to additional crops and geographic coordinates.'
    },
    {
      q: 'Is this architecture 100% compliant with free-tier hackathon rules?',
      a: 'Yes. AgriGuide uses zero paid APIs, zero sponsored credits, and no billing-enabled services. The backend runs on standard Python/Django, the database uses PostgreSQL, AI inference utilizes eligible free-tier API quotas, and weather telemetry uses Open-Meteo keyless open data.'
    }
  ];

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="agri-landing-wrapper">
      {/* ------------------------------------------------------------------ */}
      {/* Scroll-Following Plant Growth Indicator & Vine Animation */}
      {/* ------------------------------------------------------------------ */}
      <aside className="agri-plant-scroll-companion" aria-label="Plant Growth Scroll Indicator">
        {/* Vertical Vine Rail */}
        <div className="agri-vine-rail">
          <div
            className="agri-vine-progress"
            style={{ height: `${Math.round(scrollProgress * 100)}%` }}
          />
          {/* Milestone Leaf Buds */}
          <span className={`agri-vine-bud bud-1 ${scrollProgress >= 0.2 ? 'sprouted' : ''}`}>🌱</span>
          <span className={`agri-vine-bud bud-2 ${scrollProgress >= 0.45 ? 'sprouted' : ''}`}>🌿</span>
          <span className={`agri-vine-bud bud-3 ${scrollProgress >= 0.7 ? 'sprouted' : ''}`}>🌾</span>
          <span className={`agri-vine-bud bud-4 ${scrollProgress >= 0.95 ? 'sprouted' : ''}`}>🌽</span>
        </div>

        {/* Dynamic Sprout Badge that tracks scroll */}
        <div
          className="agri-sprout-follower"
          style={{
            top: `calc(${scrollProgress * 80}% + 80px)`,
            transform: `scale(${1 + scrollProgress * 0.15}) rotate(${scrollProgress * 16 - 8}deg)`,
          }}
        >
          <div className="agri-sprout-badge" title="Plant growth stage progresses as you scroll through AgriGuide">
            <div className="agri-sprout-avatar" style={{ backgroundColor: `${currentGrowthStage.color}18`, color: currentGrowthStage.color }}>
              <StageIcon size={20} className="agri-sprout-glyph" />
            </div>
            <div className="agri-sprout-details">
              <span className="agri-sprout-title">{currentGrowthStage.stage}</span>
              <span className="agri-sprout-subtitle">{Math.round(scrollProgress * 100)}% Explored</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Botanical Background Leaves (Parallax Drift) */}
      <div className="agri-drifting-foliage" aria-hidden="true">
        <div
          className="agri-leaf leaf-1"
          style={{ transform: `translateY(${scrollProgress * -70}px) rotate(${15 + scrollProgress * 35}deg)` }}
        />
        <div
          className="agri-leaf leaf-2"
          style={{ transform: `translateY(${scrollProgress * -110}px) rotate(${-20 + scrollProgress * 50}deg)` }}
        />
        <div
          className="agri-leaf leaf-3"
          style={{ transform: `translateY(${scrollProgress * -50}px) rotate(${35 - scrollProgress * 40}deg)` }}
        />
        <div
          className="agri-leaf leaf-4"
          style={{ transform: `translateY(${scrollProgress * -90}px) rotate(${-15 + scrollProgress * 45}deg)` }}
        />
      </div>

      {/* Top Navigation */}
      <header className="agri-landing-nav">
        <div className="agri-nav-inner">
          <a href="#hero" className="agri-nav-brand">
            <div className="agri-brand-icon">
              <Sprout size={24} />
            </div>
            <div className="agri-brand-text">
              <span className="agri-brand-name">AgriGuide</span>
              <span className="agri-brand-tagline">AI AGRICULTURAL EXTENSION AGENT</span>
            </div>
          </a>

          <nav className="agri-nav-links">
            <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>5-Step Protocol</a>
            <a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')}>Advisory Simulator</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Platform Features</a>
            <a href="#safety" onClick={(e) => scrollToSection(e, 'safety')}>Evidence Standards</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
          </nav>

          <div className="agri-nav-actions">
            <button className="agri-btn-outline" onClick={() => navigate('/Login')}>
              <Lock size={15} /> Sign In
            </button>
            <button className="agri-btn-primary" onClick={() => handleRequireCredentials('/Recommendations')}>
              Launch Agent <ArrowRight size={16} />
            </button>
          </div>

          <button
            className="agri-nav-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="agri-mobile-drawer">
            <nav className="agri-mobile-links">
              <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>5-Step Protocol</a>
              <a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')}>Advisory Simulator</a>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Platform Features</a>
              <a href="#safety" onClick={(e) => scrollToSection(e, 'safety')}>Evidence Standards</a>
              <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
            </nav>
            <div className="agri-mobile-actions">
              <button className="agri-btn-outline w-full" onClick={() => navigate('/Login')}>
                <Lock size={15} /> Sign In with Credentials
              </button>
              <button className="agri-btn-primary w-full" onClick={() => handleRequireCredentials('/Recommendations')}>
                Launch Extension Agent <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="agri-hero-section">
        <div className="agri-hero-container">
          <div className="agri-hero-badge">
            <span className="agri-badge-dot"></span>
            <span>Agricultural Decision Support • Maize Crop Intelligence</span>
          </div>

          <h1 className="agri-hero-title">
            Cautious, Source-Referenced Crop Problem Diagnostics for <span className="agri-highlight">Agricultural Extension</span>
          </h1>

          <p className="agri-hero-subtitle">
            Equipping agricultural extension officers and maize farmers with verified evidence retrieval, local case history comparison, live micro-climate telemetry, and mandatory human-in-the-loop validation.
          </p>

          <div className="agri-hero-cta-group">
            <button className="agri-btn-hero-primary" onClick={() => handleRequireCredentials('/Recommendations')}>
              Start New Crop Report <ArrowRight size={18} />
            </button>
            <button className="agri-btn-hero-secondary" onClick={() => handleRequireCredentials('/Weather')}>
              <CloudSun size={18} /> Live Weather Telemetry
            </button>
            <button className="agri-btn-hero-tertiary" onClick={() => handleRequireCredentials('/CaseHistory')}>
              <BookOpen size={18} /> Previous Cases
            </button>
          </div>

          {/* Trust Metrics */}
          <div className="agri-trust-metrics">
            <div className="agri-metric-item">
              <div className="agri-metric-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="agri-metric-text">
                <span className="agri-metric-value">100%</span>
                <span className="agri-metric-label">Source-Referenced Citations</span>
              </div>
            </div>

            <div className="agri-metric-divider"></div>

            <div className="agri-metric-item">
              <div className="agri-metric-icon">
                <MapPin size={24} />
              </div>
              <div className="agri-metric-text">
                <span className="agri-metric-value">3 Demo Sites</span>
                <span className="agri-metric-label">Bishoftu • Hawassa • Adama</span>
              </div>
            </div>

            <div className="agri-metric-divider"></div>

            <div className="agri-metric-item">
              <div className="agri-metric-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="agri-metric-text">
                <span className="agri-metric-value">Zero</span>
                <span className="agri-metric-label">Hallucinated Diagnoses</span>
              </div>
            </div>

            <div className="agri-metric-divider"></div>

            <div className="agri-metric-item">
              <div className="agri-metric-icon">
                <UserCheck size={24} />
              </div>
              <div className="agri-metric-text">
                <span className="agri-metric-value">Human Gate</span>
                <span className="agri-metric-label">Explicit Sign-off Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: The 5-Step Protocol Workflow */}
      <section id="workflow" className="agri-section agri-workflow-section">
        <div className="agri-section-header">
          <span className="agri-section-tag">Bounded Agent Architecture</span>
          <h2 className="agri-section-title">The 5-Step Extension Decision Protocol</h2>
          <p className="agri-section-desc">
            AgriGuide enforces strict boundaries on every interaction. The agent cannot guess solutions or write to the database without verifiable evidence and extension officer sign-off.
          </p>
        </div>

        <div className="agri-workflow-grid">
          <div className="agri-step-card">
            <div className="agri-step-badge">Step 1</div>
            <div className="agri-step-icon">
              <FileText size={26} />
            </div>
            <h3 className="agri-step-title">Crop Problem Reporting</h3>
            <p className="agri-step-desc">
              Farmer or extension officer specifies location, maize growth stage, observed foliage/stem symptoms, and soil moisture conditions.
            </p>
            <div className="agri-step-foot">
              <span>Input Validation</span>
            </div>
          </div>

          <div className="agri-step-card">
            <div className="agri-step-badge">Step 2</div>
            <div className="agri-step-icon">
              <Database size={26} />
            </div>
            <h3 className="agri-step-title">Case History Lookup</h3>
            <p className="agri-step-desc">
              Agent invokes <code>readCaseHistory</code> to identify previous confirmed crop problem records in the same agricultural zone.
            </p>
            <div className="agri-step-foot">
              <span>Tool 1: readCaseHistory</span>
            </div>
          </div>

          <div className="agri-step-card">
            <div className="agri-step-badge">Step 3</div>
            <div className="agri-step-icon">
              <Search size={26} />
            </div>
            <h3 className="agri-step-title">Guidance Note Search</h3>
            <p className="agri-step-desc">
              Agent executes <code>searchCropGuidance</code> to match symptoms against peer-reviewed agricultural extension documents.
            </p>
            <div className="agri-step-foot">
              <span>Tool 2: searchCropGuidance</span>
            </div>
          </div>

          <div className="agri-step-card">
            <div className="agri-step-badge">Step 4</div>
            <div className="agri-step-icon">
              <Sparkles size={26} />
            </div>
            <h3 className="agri-step-title">Cautious Advisory Synthesis</h3>
            <p className="agri-step-desc">
              Synthesizes a cautious advisory distinguishing facts from hypotheses, providing exact citations and scheduling follow-up scouting.
            </p>
            <div className="agri-step-foot">
              <span>Confidence & Citations</span>
            </div>
          </div>

          <div className="agri-step-card highlight">
            <div className="agri-step-badge">Step 5</div>
            <div className="agri-step-icon">
              <ClipboardCheck size={26} />
            </div>
            <h3 className="agri-step-title">Human Confirmation & Save</h3>
            <p className="agri-step-desc">
              Extension worker reviews, edits observations or follow-ups, and checks explicit confirmation before executing <code>saveAdvisoryAndFollowUp</code>.
            </p>
            <div className="agri-step-foot highlight">
              <span>Tool 3: Explicit Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Advisory Simulator */}
      <section id="simulator" className="agri-section agri-simulator-section">
        <div className="agri-section-header">
          <span className="agri-section-tag">Interactive Preview</span>
          <h2 className="agri-section-title">See AgriGuide in Action</h2>
          <p className="agri-section-desc">
            Switch between documented demonstration cases to inspect the live tool trace, official source citations, and human-in-the-loop review format.
          </p>

          <div className="agri-demo-toggle">
            <button
              className={`agri-demo-btn ${selectedDemo === 'GUIDE-001' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('GUIDE-001')}
            >
              🌱 Preset 1: Fall Armyworm (GUIDE-001)
            </button>
            <button
              className={`agri-demo-btn ${selectedDemo === 'CASE-002' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('CASE-002')}
            >
              🌾 Preset 2: Stalk Borer (CASE-002)
            </button>
          </div>
        </div>

        <div className="agri-sim-card">
          <div className="agri-sim-header">
            <div className="agri-sim-title-group">
              <span className="agri-sim-badge">Demonstration Case Scenario</span>
              <h3 className="agri-sim-name">{currentScenario.title}</h3>
            </div>
            <div className="agri-sim-meta">
              <span><MapPin size={14} /> {currentScenario.location}</span>
              <span><Calendar size={14} /> Stage: {currentScenario.stage}</span>
            </div>
          </div>

          <div className="agri-sim-body">
            {/* Input Details */}
            <div className="agri-sim-input-box">
              <h4 className="agri-sim-subheading">Reported Field Symptoms</h4>
              <p className="agri-sim-text">{currentScenario.symptoms}</p>
            </div>

            {/* Agent Tool Execution Trace */}
            <div className="agri-sim-tools-box">
              <h4 className="agri-sim-subheading">Agent Execution Pipeline</h4>
              <div className="agri-sim-tool-list">
                {currentScenario.toolTrace.map((t, idx) => (
                  <div key={idx} className="agri-sim-tool-pill">
                    <CheckCircle2 size={16} className="text-green" />
                    <span className="tool-name">{t.tool}</span>
                    <span className="tool-param">({t.param})</span>
                    <span className="tool-status">→ {t.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Reference Citation */}
            <div className="agri-sim-citation-box">
              <div className="agri-citation-head">
                <span className="agri-citation-tag">VERIFIED EXTENSION GUIDANCE</span>
                <span className="agri-citation-id">{currentScenario.citation.id}</span>
              </div>
              <h5 className="agri-citation-section">{currentScenario.citation.section}</h5>
              <blockquote className="agri-citation-quote">
                "{currentScenario.citation.snippet}"
              </blockquote>
            </div>

            {/* Cautious Advisory & Follow-Up */}
            <div className="agri-sim-result-grid">
              <div className="agri-result-col">
                <h4 className="agri-sim-subheading">Diagnostic Assessment</h4>
                <p className="agri-diagnosis-text">{currentScenario.diagnosis}</p>
                <div className="agri-caution-banner">
                  <AlertTriangle size={16} />
                  <span>{currentScenario.caution}</span>
                </div>
              </div>

              <div className="agri-result-col">
                <h4 className="agri-sim-subheading">Proposed Extension Action</h4>
                <div className="agri-followup-box">
                  <p className="agri-followup-text">{currentScenario.followUp}</p>
                  <div className="agri-approval-tag">
                    <Check size={14} /> {currentScenario.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="agri-sim-cta">
              <button
                className="agri-btn-primary"
                onClick={() => handleRequireCredentials('/Recommendations')}
              >
                <Lock size={15} /> Run This Test Case in Extension Portal <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Capabilities */}
      <section id="features" className="agri-section agri-features-section">
        <div className="agri-section-header">
          <span className="agri-section-tag">Key Innovations</span>
          <h2 className="agri-section-title">Built for Real Agricultural Field Realities</h2>
          <p className="agri-section-desc">
            Combining deterministic tool execution, local micro-climate forecasting, and reliable offline-tolerant data structures.
          </p>

          <div className="agri-feature-tabs">
            <button
              className={`agri-tab-btn ${activeFeatureTab === 'agent' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('agent')}
            >
              <Sparkles size={16} /> AI Decision Agent
            </button>
            <button
              className={`agri-tab-btn ${activeFeatureTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('weather')}
            >
              <CloudSun size={16} /> Agro-Weather Telemetry
            </button>
            <button
              className={`agri-tab-btn ${activeFeatureTab === 'records' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('records')}
            >
              <Database size={16} /> PostgreSQL Persistence
            </button>
            <button
              className={`agri-tab-btn ${activeFeatureTab === 'freetier' ? 'active' : ''}`}
              onClick={() => setActiveFeatureTab('freetier')}
            >
              <ShieldCheck size={16} /> 100% Free-Tier Architecture
            </button>
          </div>
        </div>

        <div className="agri-feature-display">
          {activeFeatureTab === 'agent' && (
            <div className="agri-feature-content">
              <div className="agri-feat-text">
                <span className="agri-feat-badge">Evidence-Grounded Intelligence</span>
                <h3>Bounded 3-Tool Diagnostic Loop</h3>
                <p>
                  Instead of allowing freeform ungrounded chat responses, AgriGuide utilizes a bounded loop with three deterministic tools: <code>readCaseHistory</code>, <code>searchCropGuidance</code>, and <code>saveAdvisoryAndFollowUp</code>.
                </p>
                <ul className="agri-feat-points">
                  <li><CheckCircle2 size={18} className="text-green" /> Strictly treats retrieved guidance notes as the single source of truth.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Clearly delineates physical observations from hypothetical explanations.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Refuses to invent chemical prescriptions or unsupported pesticide dosages.</li>
                </ul>
                <button className="agri-btn-outline" onClick={() => handleRequireCredentials('/Guidance')}>
                  <Lock size={15} /> Search Guidance Library <ArrowRight size={16} />
                </button>
              </div>
              <div className="agri-feat-card-mock">
                <div className="mock-card-header">
                  <BookOpen size={20} className="text-green" />
                  <h4>Official Guidance Verification</h4>
                </div>
                <div className="mock-guidance-item">
                  <span className="mock-id">GUIDE-001</span>
                  <h5>Fall Armyworm Early Scouting Guide</h5>
                  <p>Threshold: 20% infested plants in early whorl stage warrants biological intervention.</p>
                </div>
                <div className="mock-guidance-item">
                  <span className="mock-id">GUIDE-002</span>
                  <h5>African Maize Stalk Borer Management</h5>
                  <p>Target push-pull companion crops (Desmodium) and stubble destruction post-harvest.</p>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'weather' && (
            <div className="agri-feature-content">
              <div className="agri-feat-text">
                <span className="agri-feat-badge">Micro-Climate Telemetry</span>
                <h3>Protected Open-Meteo Integration</h3>
                <p>
                  Agro-climatic context is vital for crop disease diagnostics. The backend acts as a secure proxy to fetch live temperature, relative humidity, wind speed, precipitation, and 7-day forecasts without exposing API keys to the browser.
                </p>
                <ul className="agri-feat-points">
                  <li><CheckCircle2 size={18} className="text-green" /> Real-time spray drift warnings when wind speeds exceed 15 km/h.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Evapotranspiration and high-temperature stress alerts for maize tasseling.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Fungal leaf disease risk assessment when humidity stays above 80%.</li>
                </ul>
                <button className="agri-btn-outline" onClick={() => handleRequireCredentials('/Weather')}>
                  <Lock size={15} /> Open Weather Radar <ArrowRight size={16} />
                </button>
              </div>
              <div className="agri-feat-card-mock weather">
                <div className="mock-weather-hero">
                  <div>
                    <span className="mock-loc">Bishoftu Demonstration Farm</span>
                    <span className="mock-temp">24.2°C</span>
                    <span className="mock-cond">Partly Cloudy • Optimal Field Conditions</span>
                  </div>
                  <CloudSun size={52} className="text-accent" />
                </div>
                <div className="mock-weather-stats">
                  <div><Droplets size={16} /> Humidity: 58%</div>
                  <div><Wind size={16} /> Wind: 11.2 km/h</div>
                  <div><Thermometer size={16} /> Soil Moisture: Moderate</div>
                </div>
                <div className="mock-weather-advice">
                  <span>Agronomic Advisory:</span> Wind speed is under 15 km/h; morning hours are suitable for biological spraying if threshold is met.
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'records' && (
            <div className="agri-feature-content">
              <div className="agri-feat-text">
                <span className="agri-feat-badge">Full Audit Trail</span>
                <h3>PostgreSQL Persistent Case History</h3>
                <p>
                  Every confirmed advisory and follow-up action is stored in relational PostgreSQL models through Django REST Framework. Extension workers can reopen records, track outcomes, and evaluate season-long crop recovery.
                </p>
                <ul className="agri-feat-points">
                  <li><CheckCircle2 size={18} className="text-green" /> Unique advisory IDs linked to specific locations and field observers.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Timestamped follow-up action items with status tracking.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Detailed audit history ensuring diagnostic decisions can be inspected later.</li>
                </ul>
                <button className="agri-btn-outline" onClick={() => handleRequireCredentials('/SavedRecords')}>
                  <Lock size={15} /> View Saved Advisories <ArrowRight size={16} />
                </button>
              </div>
              <div className="agri-feat-card-mock">
                <div className="mock-card-header">
                  <Database size={20} className="text-green" />
                  <h4>Persistent Case Records</h4>
                </div>
                <div className="mock-case-row">
                  <div>
                    <span className="case-id">ADV-2026-001</span>
                    <span className="case-title">Bishoftu • Maize FAW Follow-Up</span>
                  </div>
                  <span className="case-status pending">Pending Scouting</span>
                </div>
                <div className="mock-case-row">
                  <div>
                    <span className="case-id">ADV-2026-002</span>
                    <span className="case-title">Hawassa • Stalk Borer Verification</span>
                  </div>
                  <span className="case-status resolved">Resolved</span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'freetier' && (
            <div className="agri-feature-content">
              <div className="agri-feat-text">
                <span className="agri-feat-badge">Hackathon Rule Compliance</span>
                <h3>100% Free-Tier & Open Source</h3>
                <p>
                  In strict compliance with <code>AGENTS.md</code> §2, every component in AgriGuide utilizes genuine free-tier services or open-source libraries. Zero credit cards, zero paid API keys, and zero sponsored tier lock-in.
                </p>
                <ul className="agri-feat-points">
                  <li><CheckCircle2 size={18} className="text-green" /> Frontend: React + Vite hosted on free-tier web infrastructure.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Backend: Python + Django REST Framework on free cloud compute.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Database: Remote PostgreSQL free-tier database.</li>
                  <li><CheckCircle2 size={18} className="text-green" /> Weather: Open-Meteo keyless open data integration.</li>
                </ul>
                <button className="agri-btn-outline" onClick={() => navigate('/Register')}>
                  Create Extension Account <ArrowRight size={16} />
                </button>
              </div>
              <div className="agri-feat-card-mock">
                <div className="mock-card-header">
                  <ShieldCheck size={20} className="text-green" />
                  <h4>Service Compliance Ledger</h4>
                </div>
                <div className="mock-service-row">
                  <span>Backend Web Service</span>
                  <span className="badge-free">100% Free Tier</span>
                </div>
                <div className="mock-service-row">
                  <span>PostgreSQL Database</span>
                  <span className="badge-free">100% Free Tier</span>
                </div>
                <div className="mock-service-row">
                  <span>Open-Meteo Weather</span>
                  <span className="badge-free">Keyless Open API</span>
                </div>
                <div className="mock-service-row">
                  <span>Vite / React Frontend</span>
                  <span className="badge-free">Open Source</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Evidence & Safety Standard */}
      <section id="safety" className="agri-section agri-safety-section">
        <div className="agri-section-header">
          <span className="agri-section-tag">Agricultural Safety</span>
          <h2 className="agri-section-title">Strict Agricultural Safety & Evidence Standard</h2>
          <p className="agri-section-desc">
            Agricultural AI can harm farmer livelihoods if allowed to hallucinate treatments or prescribe unauthorized pesticides. AgriGuide enforces four non-negotiable safety guardrails.
          </p>
        </div>

        <div className="agri-safety-grid">
          <div className="agri-safety-card">
            <div className="agri-safety-icon">
              <BookOpen size={24} />
            </div>
            <h3>Retrieved Guidance as Source of Truth</h3>
            <p>
              The agent never invents reference documents, research citations, or official recommendations. Every advisory quotes official text and discloses its document identifier.
            </p>
          </div>

          <div className="agri-safety-card">
            <div className="agri-safety-icon">
              <AlertTriangle size={24} />
            </div>
            <h3>Explicit Uncertainty Disclosures</h3>
            <p>
              AI findings are clearly framed as provisional hypotheses rather than definitive diagnoses. When symptoms are ambiguous, the agent explicitly prompts for on-field scouting.
            </p>
          </div>

          <div className="agri-safety-card">
            <div className="agri-safety-icon">
              <Lock size={24} />
            </div>
            <h3>Zero Autonomous Database Writes</h3>
            <p>
              The agent is completely barred from committing data autonomously. An extension officer must review, edit proposed follow-ups, and check an explicit confirmation box.
            </p>
          </div>

          <div className="agri-safety-card">
            <div className="agri-safety-icon">
              <Sprout size={24} />
            </div>
            <h3>Integrated Pest Management (IPM) First</h3>
            <p>
              The system prioritizes cultural scouting, physical threshold evaluation, and biological checks before chemical intervention, avoiding unnecessary pesticide costs.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions */}
      <section id="faq" className="agri-section agri-faq-section">
        <div className="agri-section-header">
          <span className="agri-section-tag">Got Questions?</span>
          <h2 className="agri-section-title">Frequently Asked Questions</h2>
          <p className="agri-section-desc">
            Everything you need to know about the AgriGuide system, our agent tools, and our hackathon compliance.
          </p>
        </div>

        <div className="agri-faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`agri-faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
              >
                <div className="agri-faq-question">
                  <h4>{faq.q}</h4>
                  <span className="agri-faq-toggle">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </div>
                {isOpen && (
                  <div className="agri-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 6: Bottom Call to Action */}
      <section className="agri-cta-banner">
        <div className="agri-cta-inner">
          <h2>Ready to Verify a Crop Problem in the Field?</h2>
          <p>
            Experience evidence-referenced agricultural extension support powered by verified research, local case history, and live weather telemetry.
          </p>
          <div className="agri-cta-actions">
            <button className="agri-btn-hero-primary" onClick={() => handleRequireCredentials('/Recommendations')}>
              <Lock size={16} /> Sign In &amp; Start Crop Report <ArrowRight size={18} />
            </button>
            <button className="agri-btn-hero-secondary" onClick={() => navigate('/Login')}>
              Portal Credentials Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="agri-landing-footer">
        <div className="agri-footer-inner">
          <div className="agri-footer-brand">
            <div className="agri-brand-logo-group">
              <div className="agri-brand-icon">
                <Sprout size={22} />
              </div>
              <span className="agri-footer-title">AgriGuide</span>
            </div>
            <p className="agri-footer-desc">
              AI Agricultural Extension Agent providing source-referenced maize crop problem diagnostics, previous case retrieval, and human-in-the-loop validation.
            </p>
            <span className="agri-footer-compliance">
              🌱 Built for the Agricultural AI Hackathon • 100% Free-Tier Architecture
            </span>
          </div>

          <div className="agri-footer-column">
            <h5>Navigation</h5>
            <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')}>Overview</a>
            <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')}>5-Step Protocol</a>
            <a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')}>Advisory Simulator</a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Platform Features</a>
            <a href="#safety" onClick={(e) => scrollToSection(e, 'safety')}>Safety Standards</a>
          </div>

          <div className="agri-footer-column">
            <h5>Agent Tools</h5>
            <span className="footer-code-link"><code>readCaseHistory</code></span>
            <span className="footer-code-link"><code>searchCropGuidance</code></span>
            <span className="footer-code-link"><code>saveAdvisoryAndFollowUp</code></span>
            <span className="footer-code-link"><code>GET /api/weather/</code></span>
          </div>

          <div className="agri-footer-column">
            <h5>Access Portal</h5>
            <button className="footer-link-btn" onClick={() => handleRequireCredentials('/Recommendations')}>
              <Lock size={12} /> New Crop Report
            </button>
            <button className="footer-link-btn" onClick={() => handleRequireCredentials('/CaseHistory')}>
              <Lock size={12} /> Previous Cases
            </button>
            <button className="footer-link-btn" onClick={() => handleRequireCredentials('/Guidance')}>
              <Lock size={12} /> Guidance Library
            </button>
            <button className="footer-link-btn" onClick={() => handleRequireCredentials('/SavedRecords')}>
              <Lock size={12} /> Saved Advisories
            </button>
            <button className="footer-link-btn" onClick={() => navigate('/Login')}>
              <Lock size={12} /> Sign In
            </button>
          </div>
        </div>

        <div className="agri-footer-bottom">
          <p>© 2026 AgriGuide — AI Agricultural Extension Agent. Demonstration and educational use.</p>
          <p>Compliant with Hackathon Free-Tier &amp; Agricultural Safety Standards.</p>
        </div>
      </footer>
    </div>
  );
}