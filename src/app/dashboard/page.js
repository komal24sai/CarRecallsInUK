'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedSearches = [];
    try {
      storedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch (e) {
      console.warn('Could not read recent searches from localStorage:', e);
    }
    
    if (storedSearches.length === 0) {
      setLoading(false);
      return;
    }

    const regsQuery = storedSearches.join(',');
    
    fetch(`/api/analytics?regs=${regsQuery}`).then(r => r.json()).then(d => {
      setMetrics(d.metrics);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h2>📊 Your Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Aggregated metrics from your recently searched vehicles</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Vehicles Analysed</div>
            <div className="metric-value blue">{metrics?.totalVehicles || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MOT Tests Processed</div>
            <div className="metric-value purple">{metrics?.totalMOTTests || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Average Pass Rate</div>
            <div className="metric-value green">{metrics?.avgPassRate || 0}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Defects Recorded</div>
            <div className="metric-value amber">{metrics?.totalDefects || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Mileage Anomalies</div>
            <div className="metric-value red">{metrics?.mileageAnomalies || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg Safety Score</div>
            <div className="metric-value blue">{metrics?.avgSafetyScore || '—'}</div>
          </div>
        </div>

        {metrics?.topDefectCategories && metrics.topDefectCategories.length > 0 && (
          <div className="info-card" style={{ marginBottom: '2rem' }}>
            <h3>🏷️ Top Defect Categories</h3>
            {metrics.topDefectCategories.map((d, i) => (
              <div key={i} className="score-breakdown-item">
                <span style={{ minWidth: '140px' }}>{d.category}</span>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{
                    width: `${(d.count / Math.max(...metrics.topDefectCategories.map(x => x.count))) * 100}%`,
                    background: 'var(--gradient-accent)'
                  }} />
                </div>
                <span>{d.count}</span>
              </div>
            ))}
          </div>
        )}

        {metrics?.topMakes && metrics.topMakes.length > 0 && (
          <div className="info-card">
            <h3>🏭 Top Makes Analysed</h3>
            {metrics.topMakes.map((m, i) => (
              <div key={i} className="score-breakdown-item">
                <span style={{ minWidth: '140px' }}>{m.make}</span>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{
                    width: `${(m.count / Math.max(...metrics.topMakes.map(x => x.count))) * 100}%`,
                    background: 'var(--gradient-accent)'
                  }} />
                </div>
                <span>{m.count} vehicles · {m.avg_pass_rate || '—'}% pass</span>
              </div>
            ))}
          </div>
        )}

        {(!metrics || metrics.totalVehicles === 0) && !loading && (
          <div className="info-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</p>
            <h3>No Data Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Search for vehicles on the <a href="/">home page</a> to populate the dashboard. 
              Each vehicle lookup feeds the Bronze→Silver→Gold pipeline.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
