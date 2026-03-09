import './Footer.css';

const Footer = () => (
  <footer className="ft-footer">
    <div className="ft-inner">
      {/* Top row */}
      <div className="ft-top">
        {/* Brand */}
        <div className="ft-brand">
          <div className="ft-logo-section">
            <svg className="ft-logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Document outline */}
              <rect x="6" y="4" width="20" height="24" rx="2" fill="none" stroke="#ffffff" strokeWidth="1.8"/>
              {/* Text lines */}
              <line x1="10" y1="10" x2="18" y2="10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              <line x1="10" y1="14" x2="22" y2="14" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              <line x1="10" y1="18" x2="16" y2="18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
              {/* Cursor 1 */}
              <path d="M19 9l0 6 2 -2 1.5 3 1.5 -0.5 -1.5 -3 2.5 0z" fill="#ffffff" stroke="#ffffff" strokeWidth="0.5" opacity="0.9"/>
              {/* Cursor 2 */}
              <path d="M13 21l0 5 1.5 -1.5 1 2.5 1.2 -0.5 -1 -2.5 2 0z" fill="#ffffff" stroke="#ffffff" strokeWidth="0.5" opacity="0.9"/>
            </svg>
            <span className="ft-logo">Collabocalypse</span>
          </div>
          <p className="ft-brand-desc">
            Real-time collaborative documents for teams of any size — decentralised, conflict-free, and enterprise-ready.
          </p>
          <div className="ft-socials">
            {/* GitHub */}
            <a href="https://github.com/AryanKhokale" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            {/* X / Twitter */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/aryan-khokale-4b2159289/" target="_blank" rel="noopener noreferrer" className="ft-social" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Essential Links */}
        <div className="ft-col">
          <ul className="ft-links">
            <li><a href="#about" className="ft-link">About</a></li>
            <li><a href="#features" className="ft-link">Features</a></li>
            <li><a href="#contact" className="ft-link">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="ft-bottom">
        <span className="ft-copy">© 2026 Collabocalypse, Inc. All rights reserved.</span>
        <div className="ft-bottom-links">
          <a href="#" className="ft-bottom-link">Privacy</a>
          <a href="#" className="ft-bottom-link">Terms</a>
          <a href="#" className="ft-bottom-link">Security</a>
          <a href="#" className="ft-bottom-link">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
