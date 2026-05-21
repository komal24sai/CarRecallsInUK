'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  // Detect system preference on first load
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [theme, setTheme] = useState('dark');
  const [contrast, setContrast] = useState('normal');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Use saved preference; fall back to OS preference
    const savedTheme = localStorage.getItem('app-theme') || getSystemTheme();
    const savedContrast = localStorage.getItem('app-contrast') || 'normal';

    setTheme(savedTheme);
    setContrast(savedContrast);

    const root = document.documentElement;
    root.setAttribute('data-theme', savedTheme);
    root.setAttribute('data-contrast', savedContrast);

    // Add transition class after initial paint to avoid flash
    setTimeout(() => root.classList.add('theme-ready'), 100);
  }, []);

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const applyContrast = (newContrast) => {
    setContrast(newContrast);
    localStorage.setItem('app-contrast', newContrast);
    document.documentElement.setAttribute('data-contrast', newContrast);
  };

  const toggleTheme = () => applyTheme(theme === 'light' ? 'dark' : 'light');
  const toggleContrast = () => applyContrast(contrast === 'normal' ? 'high' : 'normal');

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <a href="/" className="logo">
              <span className="logo-flag">🇬🇧</span> IsThisCarSafe
            </a>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <ul className="nav">
              <li><a href="/" onClick={() => setMenuOpen(false)}>Start Check</a></li>
              <li><a href="/recalls" onClick={() => setMenuOpen(false)}>Safety Recalls</a></li>
              <li><a href="/dashboard" onClick={() => setMenuOpen(false)}>My Garage</a></li>
              <li><a href="/intelligence" onClick={() => setMenuOpen(false)}>AI Matchmaker</a></li>
              <li><a href="/about" onClick={() => setMenuOpen(false)}>How It Works</a></li>
              <li><a href="/" className="nav-cta" onClick={() => setMenuOpen(false)}>Reveal Future Failures</a></li>
            </ul>

            {/* Theme & Accessibility controls — shown inside mobile menu AND desktop header-controls */}
            <div className="header-controls">
              {/* Compact Quick Plate Search */}
              <div style={{
                display: 'flex',
                background: '#FFD300',
                borderRadius: '4px',
                border: '2px solid #000000',
                padding: '1px',
                width: '150px',
                alignItems: 'stretch',
                height: '32px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  background: '#002F6C',
                  color: '#FFFFFF',
                  width: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.45rem',
                  fontWeight: '900',
                  borderRadius: '2px 0 0 2px',
                  padding: '0 2px',
                  fontFamily: 'sans-serif'
                }}>
                  GB
                </div>
                <input
                  type="text"
                  placeholder="QUICK CHECK"
                  maxLength={8}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const cleaned = e.target.value.replace(/\s/g, '').toUpperCase();
                      if (cleaned.length >= 2 && cleaned.length <= 8) {
                        window.location.href = `/vehicle/${cleaned}`;
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#000000',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    width: '80px',
                    fontFamily: 'var(--font-mono), monospace'
                  }}
                />
              </div>

              <button
                className={`hub-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
                title="Toggle Dark Mode"
                style={{ width: '36px', height: '36px', fontSize: '1rem' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className={`hub-btn ${contrast === 'high' ? 'active' : ''}`}
                onClick={toggleContrast}
                title="Toggle High Contrast"
                style={{ width: '36px', height: '36px', fontSize: '1rem' }}
              >
                👁️
              </button>
            </div>

            {/* Mobile-only: theme controls visible inside the open nav overlay */}
            <div className="mobile-nav-controls">
              <button
                className={`hub-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                className={`hub-btn ${contrast === 'high' ? 'active' : ''}`}
                onClick={toggleContrast}
                aria-label="Toggle High Contrast"
                style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}
              >
                👁️
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Floating Access Hub — bottom-LEFT (AI Agent FAB is bottom-RIGHT) */}
      <div className="access-hub">
        <button
          className={`hub-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          className={`hub-btn ${contrast === 'high' ? 'active' : ''}`}
          onClick={toggleContrast}
          aria-label={contrast === 'high' ? 'Turn off High Contrast' : 'Turn on High Contrast'}
        >
          👁️
        </button>
      </div>
    </>
  );
}
