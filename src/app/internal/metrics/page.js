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
        <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--font-body)', paddingTop: '100px' }}>
          <div style={{ background: '#161922', border: '1px solid #262B38', padding: '3rem 2rem', borderRadius: '4px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛡️</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Admin Dashboard</h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Authorized analytical personnel access only. Please provide credentials.
            </p>
            
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: '#0D0F14',
                  border: '1px solid #262B38',
                  padding: '0.75rem 1rem',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}
              />
              {error && <p style={{ color: '#F56565', fontSize: '0.75rem', margin: 0 }}>{error}</p>}
              <button
                type="submit"
                style={{
                  background: '#E8FF00',
                  color: '#0D0F14',
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
        <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: '#E8FF00' }}>LOADING SYSTEM METRICS...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262B38', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: '#E8FF00', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ADMIN METRICS GATEWAY
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem', margin: 0 }}>
                IsThisCarSafe Integrity Metrics
              </h1>
            </div>
            <div style={{ background: '#161922', padding: '0.5rem 1rem', border: '1px solid #262B38', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748B' }}>
              🔴 LIVE DATA FEEDS ONLINE
            </div>
          </div>

          {/* REVENUE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Daily Searches (24h)</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                {metrics.dailySearches.toLocaleString()}
              </div>
            </div>
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Daily Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.dailyRevenue.toFixed(2)}
              </div>
            </div>
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Weekly Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.weeklyRevenue.toFixed(2)}
              </div>
            </div>
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '1.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Monthly Revenue</span>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                £{metrics.monthlyRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            
            {/* CONVERSION FUNNEL */}
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                B2C Search-to-Paid Conversion Funnel
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '0.3rem' }}>
                    <span>1. Free Report Viewed</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>{metrics.baselineSearches.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#0D0F14', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: '#3182CE', width: '100%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '0.3rem' }}>
                    <span>2. Forensic Paywall Encountered (60%)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>{metrics.paywallsShown.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#0D0F14', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: '#ED8936', width: '60%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '0.3rem' }}>
                    <span>3. Checkout Initiated</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>{metrics.checkoutsStarted.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#0D0F14', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: '#ECC94B', width: '14%', height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '0.3rem' }}>
                    <span>4. Completed Purchases (Net conversion: {metrics.freeToPaidConversion}%)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#E8FF00' }}>{metrics.checkoutsCompleted.toLocaleString()}</strong>
                  </div>
                  <div style={{ background: '#0D0F14', height: '8px', borderRadius: '4px' }}>
                    <div style={{ background: '#E8FF00', width: `${metrics.freeToPaidConversion * 10}%`, height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* DEALER SUBSCRIPTION FUNNEL */}
            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '2rem', borderRadius: '4px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                B2B Dealer Subscription Funnel
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#0D0F14', padding: '1rem', border: '1px solid #262B38', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>TRIAL ACQUISITIONS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#FFF' }}>{metrics.dealerFunnel.trials}</div>
                </div>
                <div style={{ background: '#0D0F14', padding: '1rem', border: '1px solid #262B38', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>CONVERTED ACCOUNTS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#48BB78' }}>{metrics.dealerFunnel.converted}</div>
                </div>
                <div style={{ background: '#0D0F14', padding: '1rem', border: '1px solid #262B38', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>CHURNED DEALERS</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#F56565' }}>{metrics.dealerFunnel.churned}</div>
                </div>
                <div style={{ background: '#0D0F14', padding: '1rem', border: '1px solid #262B38', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>TRIAL CONVERSION RATE</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#E8FF00' }}>{metrics.dealerFunnel.conversionRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* A/B COHORT TESTING DETAILS */}
          <div style={{ background: '#161922', border: '1px solid #262B38', padding: '2rem', borderRadius: '4px', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              📊 Paywall CTA Text A/B Cohort Splitting
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderRadius: '4px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#12151C', borderBottom: '2px solid #262B38', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#64748B' }}>
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
                  <tr key={idx} style={{ borderBottom: '1px solid #262B38', background: row.variant === 'B' ? '#1B221E' : 'transparent' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>Variant {row.variant}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#A0AEC0' }}>&quot;{row.text}&quot;</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{row.shown.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{row.conversions}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: row.variant === 'B' ? '#48BB78' : '#FFF', fontWeight: 'bold' }}>
                      {row.rate}%
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {row.variant === 'B' ? (
                        <span style={{ background: '#22543D', color: '#48BB78', padding: '0.25rem 0.5rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          LEADING WINNER
                        </span>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Active Test</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOP MAKES */}
          <div style={{ background: '#161922', border: '1px solid #262B38', padding: '2rem', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              🚗 Top Brand Lookups (Search Trends)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {metrics.topMakes.map((make, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '120px', fontWeight: 'bold' }}>{make.make}</div>
                  <div style={{ flexGrow: 1, background: '#0D0F14', height: '10px', borderRadius: '5px', margin: '0 1.5rem', position: 'relative' }}>
                    <div style={{ background: '#E8FF00', width: `${make.pct}%`, height: '100%', borderRadius: '5px' }}></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#64748B', width: '80px', textAlign: 'right' }}>
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
