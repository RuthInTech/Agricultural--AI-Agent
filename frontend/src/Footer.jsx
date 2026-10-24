const SproutIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c0-4.4 3.6-8 8-8" /><path d="M4 11c3.5 0 6.5 2.5 7 6" /><path d="M12 20V10" /><path d="M12 10a8 8 0 0 1 8-8 8 8 0 0 1-8 8Z" />
  </svg>
);


export default function Footer(){
    return(
            <footer className="agrivox-footer">
              <div className="agrivox-footer-container">
                <div className="agrivox-footer-brand">
                  <div className="agrivox-logo-icon">
                    <SproutIcon />
                  </div>
                  <div>
                    <span className="agrivox-title">AgriVox</span>
                    <p className="agrivox-footer-sub">Next-Generation Voice Agricultural Intelligence</p>
                  </div>
                </div>
                <p className="agrivox-copyright">
                  © 2026 AgriVox Technologies. All rights reserved. Built for agricultural transformation.
                </p>
              </div>
            </footer>
    );
}
