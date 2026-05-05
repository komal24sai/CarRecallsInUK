'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [theme, setTheme] = useState('light');
  const [contrast, setContrast] = useState('normal');

  useEffect(() => {
    // Read from localStorage or system preference
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    const savedContrast = localStorage.getItem('app-contrast') || 'normal';
    setTheme(savedTheme);
    setContrast(savedContrast);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-contrast', savedContrast);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleContrast = () => {
    const newContrast = contrast === 'normal' ? 'high' : 'normal';
    setContrast(newContrast);
    localStorage.setItem('app-contrast', newContrast);
    document.documentElement.setAttribute('data-contrast', newContrast);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo">
          <span className="logo-flag">🇬🇧</span> CarRecalls UK
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <ul className="nav">
            <li><a href="/">Home</a></li>
            <li><a href="/recalls">Recalls Database</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/" className="nav-cta">Check Vehicle</a></li>
          </ul>
          
          <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
            <button 
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem' }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={toggleContrast} 
              title="Toggle High Contrast Mode (Accessibility)"
              style={{ background: contrast === 'high' ? 'var(--text-primary)' : 'transparent', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: contrast === 'high' ? 'var(--bg-primary)' : 'var(--text-primary)', fontWeight: 'bold' }}
            >
              👁️
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
