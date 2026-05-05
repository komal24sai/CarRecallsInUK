'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = reg.replace(/\s/g, '').toUpperCase();
    if (cleaned.length >= 2) router.push(`/vehicle/${cleaned}`);
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Powered by Official DVSA Data
            </div>
            <h1>
              UK Vehicle Safety<br />
              <span className="gradient-text">Intelligence Platform</span>
            </h1>
            <p>
              Check MOT history, safety recalls, and AI-powered risk scores for any UK-registered vehicle. 
              Built on a Bronze→Silver→Gold data engineering pipeline.
            </p>
            <div className="search-container">
              <form onSubmit={handleSearch}>
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Enter UK registration (e.g. AB12 CDE)"
                    value={reg}
                    onChange={(e) => setReg(e.target.value.toUpperCase())}
                    maxLength={8}
                    id="registration-search"
                  />
                  <button type="submit" className="search-btn" disabled={reg.replace(/\s/g, '').length < 2}>
                    🔍 Check Vehicle
                  </button>
                </div>
              </form>
              <p className="search-hint">Enter any UK number plate to view full MOT history &amp; safety analysis</p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="stats-bar">
          <div className="stats-grid">
            <div><div className="stat-value">50M+</div><div className="stat-label">MOT Records Available</div></div>
            <div><div className="stat-value">40M+</div><div className="stat-label">UK Vehicles Covered</div></div>
            <div><div className="stat-value">100%</div><div className="stat-label">Official DVSA Data</div></div>
            <div><div className="stat-value">Real-time</div><div className="stat-label">API Integration</div></div>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="section-header">
            <h2>Comprehensive Vehicle Intelligence</h2>
            <p>Every UK vehicle check is processed through our three-layer data pipeline</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>MOT History Analysis</h3>
              <p>Complete test history with pass/fail records, mileage readings, and every defect ever recorded by DVSA testing stations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safety Score Engine</h3>
              <p>AI-powered composite safety rating (0-100) calculated from MOT reliability, defect severity, mileage consistency, and recall risk.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h3>Recall Monitoring</h3>
              <p>Cross-reference manufacturer safety recalls from DVSA&apos;s recall database to identify outstanding safety issues.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Mileage Fraud Detection</h3>
              <p>Odometer timeline analysis with anomaly detection flags suspicious mileage rollbacks or impossibly high daily averages.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <h3>Defect Classification</h3>
              <p>Every MOT defect is categorized into 14 component groups with severity mapping: Dangerous, Major, Minor, Advisory.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Make/Model Benchmarks</h3>
              <p>Compare any vehicle against its make/model averages for pass rates, common defects, and overall reliability rankings.</p>
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section className="pipeline">
          <div className="pipeline-inner">
            <div className="section-header">
              <h2>Data Engineering Pipeline</h2>
              <p>Medallion architecture ensuring data quality at every stage</p>
            </div>
            <div className="pipeline-grid">
              <div className="pipeline-card" data-layer="Layer 1">
                <span className="pipeline-medal">🥉</span>
                <h3>Bronze Layer</h3>
                <p>Raw, unmodified DVSA data</p>
                <ul className="pipeline-items">
                  <li>📥 Raw MOT test records</li>
                  <li>📥 Raw recall status data</li>
                  <li>📥 Vehicle metadata</li>
                  <li>📋 API audit trail</li>
                </ul>
              </div>
              <div className="pipeline-card" data-layer="Layer 2">
                <span className="pipeline-medal">🥈</span>
                <h3>Silver Layer</h3>
                <p>Cleaned &amp; enriched data</p>
                <ul className="pipeline-items">
                  <li>🔄 Make/model normalization</li>
                  <li>🏷️ Defect classification</li>
                  <li>📏 Mileage timeline</li>
                  <li>🔍 Anomaly detection</li>
                </ul>
              </div>
              <div className="pipeline-card" data-layer="Layer 3">
                <span className="pipeline-medal">🥇</span>
                <h3>Gold Layer</h3>
                <p>Business intelligence</p>
                <ul className="pipeline-items">
                  <li>⭐ Safety score (0-100)</li>
                  <li>📊 Risk aggregations</li>
                  <li>📈 Trend analytics</li>
                  <li>🏆 Model rankings</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
