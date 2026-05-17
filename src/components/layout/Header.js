'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [theme, setTheme] = useState('dark');
  const [contrast, setContrast] = useState('normal');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    const savedContrast = localStorage.getItem('app-contrast') || 'normal';
    
    // Apply immediately to prevent flash
    setTheme(savedTheme);
    setContrast(savedContrast);
    
    const root = document.documentElement;
    root.setAttribute('data-theme', savedTheme);
    root.setAttribute('data-contrast', savedContrast);
    
    // Add a class for transitions after initial load
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
              <li><a href="/">Start Check</a></li>
              <li><a href="/recalls">Safety Recalls</a></li>
              <li><a href="/dashboard">My Garage</a></li>
              <li><a href="/intelligence">AI Matchmaker</a></li>
              <li><a href="/about">How It Works</a></li>
              <li><a href="/" className="nav-cta">Reveal Future Failures</a></li>
            </ul>
            
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
          </nav>
        </div>
      </header>

      {/* Mobile Accessibility Hub - Floating for easy reach */}
      <div className="access-hub">
        <button 
          className={`hub-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button 
          className={`hub-btn ${contrast === 'high' ? 'active' : ''}`}
          onClick={toggleContrast}
          aria-label="Toggle High Contrast"
        >
          👁️
        </button>
      </div>
    </>
  );
}
