'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function InternalMetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Simple clean authentication gate for local demos
  const handleAuth = (e) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'isthiscarsafe') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect administrative credentials. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/analytics/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--font-body)', paddingTop: '100px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '3rem 2rem', borderRadius: '4px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Admin Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Authorized analytical personnel access only. Please provide credentials.
            </p>
            
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}
              />
              {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                style={{
                  background: 'var(--accent-yellow)',
                  color: 'var(--bg-secondary)',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase'
                }}
              >
                Authenticate Access
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)' }}>LOADING SYSTEM METRICS...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--accent-yellow)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ADMIN METRICS GATEWAY
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem', margin: 0 }}>
                IsThisCarSafe Integrity Metrics
              </h1>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔴 LIVE DATA FEEDS ONLINE
            </div>
          </div>

          {/* REVENUE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Daily Searches (24h)</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                {metrics.dailySearches.toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Daily Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.dailyRevenue.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Weekly Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.weeklyRevenue.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Monthly Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.monthlyRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            
            {/* CONVERSION FUNNEL */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                B2C Search-to-Paid Conversion Funnel
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>1. Free Report Viewed</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{metrics.baselineSearches.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: 'var(--accent-blue)', width: '100%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>2. Forensic Paywall Encountered (60%)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{metrics.paywallsShown.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: 'var(--accent-amber)', width: '60%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>3. Checkout Initiated</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{metrics.checkoutsStarted.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: '#ECC94B', width: '14%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>4. Completed Purchases (Net conversion: {metrics.freeToPaidConversion}%)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)' }}>{metrics.checkoutsCompleted.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: 'var(--accent-yellow)', width: `${metrics.freeToPaidConversion * 10}%`, height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* DEALER SUBSCRIPTION FUNNEL */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                B2B Dealer Subscription Funnel
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TRIAL ACQUISITIONS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--text-primary)' }}>{metrics.dealerFunnel.trials}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONVERTED ACCOUNTS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-green)' }}>{metrics.dealerFunnel.converted}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CHURNED DEALERS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-red)' }}>{metrics.dealerFunnel.churned}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TRIAL CONVERSION RATE</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-yellow)' }}>{metrics.dealerFunnel.conversionRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* A/B COHORT TESTING DETAILS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '4px', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              📊 Paywall CTA Text A/B Cohort Splitting
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderRadius: '4px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Cohort Variant</th>
                  <th style={{ padding: '1rem' }}>Button Text Copy</th>
                  <th style={{ padding: '1rem' }}>Impressions</th>
                  <th style={{ padding: '1rem' }}>Conversions</th>
                  <th style={{ padding: '1rem' }}>Conversion Rate</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.abPerformance.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: row.variant === 'B' ? 'rgba(34,84,61,0.2)' : 'transparent' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>Variant {row.variant}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>&quot;{row.text}&quot;</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{row.shown.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{row.conversions}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: row.variant === 'B' ? 'var(--accent-green)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                      {row.rate}%
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {row.variant === 'B' ? (
                        <span style={{ background: 'rgba(34,84,61,0.4)', color: 'var(--accent-green)', padding: '0.25rem 0.5rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          LEADING WINNER
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Active Test</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOP MAKES */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              🚗 Top Brand Lookups (Search Trends)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {metrics.topMakes.map((make, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '120px', fontWeight: 'bold' }}>{make.make}</div>
                  <div style={{ flexGrow: 1, background: 'var(--bg-primary)', height: '10px', borderRadius: '5px', margin: '0 1.5rem', position: 'relative' }}>
                    <div style={{ background: 'var(--accent-yellow)', width: `${make.pct}%`, height: '100%', borderRadius: '5px' }}></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-muted)', width: '80px', textAlign: 'right' }}>
                    {make.count.toLocaleString()} ({make.pct}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
