'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { isValidUKRegistration } from '@/lib/validation';

export default function HomePage() {
  const [reg, setReg] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setReg(value);
    if (error) setError('');
  };

  const handleSearch = (searchTier = 'free') => {
    const cleaned = reg.replace(/\s/g, '').toUpperCase();
    if (isValidUKRegistration(cleaned)) {
      router.push(`/vehicle/${cleaned}?tier=${searchTier}`);
    } else {
      setError('Please enter a valid UK registration (e.g. AB12 CDE)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch('free');
  };

  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '72px', width: '100%', overflowX: 'hidden' }}>

        {/* ── HERO (Matching Inner Page Card Design) ── */}
        <section style={{ padding: '2rem 1rem 4rem', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)', 
            padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2.5rem)', 
            width: '100%', 
            maxWidth: '1000px', 
            textAlign: 'center', 
            transition: 'background 0.3s ease, border-color 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Find out what your next MOT will cost you.<br />
              <span style={{ color: 'var(--accent-yellow)' }}>Before you buy.</span>
            </h1>
            
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.95rem, 4vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
              Every MOT advisory tells a story. We read it for you. Powered by official DVSA data covering 40 million UK vehicles.
            </p>

            {/* Exact matching Plate Display from Inner Page */}
            <div style={{
              display: 'flex',
              background: '#FFD300',
              borderRadius: '6px',
              border: '3px solid #000000',
              padding: '2px',
              maxWidth: '360px',
              width: '100%',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              alignItems: 'stretch',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onFocus={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)'; }}
            onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'; }}
            >
              {/* GB Flag side */}
              <div style={{
                background: '#002F6C',
                color: '#FFFFFF',
                width: '35px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.55rem',
                fontWeight: '900',
                borderRadius: '3px 0 0 3px',
                margin: '-2px 2px -2px -2px',
                padding: '0 4px',
                fontFamily: 'var(--font-body)'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#FFD300', marginBottom: '1px' }}>★</span>
                <span>GB</span>
              </div>
              <input
                id="reg-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="ENTER REG"
                value={reg}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={8}
                aria-label="Enter UK vehicle registration number"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#000000',
                  fontSize: '1.9rem',
                  fontWeight: '900',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  padding: '6px 10px',
                  fontFamily: 'var(--font-mono), monospace',
                  width: '100%',
                  caretColor: '#000'
                }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--accent-red)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                {error}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap', maxWidth: '400px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => handleSearch('free')}
                aria-label="Run a free MOT history check"
                style={{
                  flex: '1 1 100%',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--text-primary)',
                  padding: '0.9rem 1.5rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  letterSpacing: '0.05em'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                Free Check
              </button>

              <button
                type="button"
                onClick={() => handleSearch('paid')}
                aria-label="Get full risk report for £2.99"
                style={{
                  flex: '1 1 100%',
                  background: 'var(--accent-yellow)',
                  color: '#000',
                  border: 'none',
                  padding: '0.9rem 1.5rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  boxShadow: 'var(--shadow-glow)',
                  letterSpacing: '0.05em'
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Full Risk Report — £2.99
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--bg-primary)', padding: '0.45rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>🛡️ DVSA Official Data</span>
              <span style={{ background: 'var(--bg-primary)', padding: '0.45rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>🚗 40M+ Vehicles</span>
              <span style={{ background: 'var(--bg-primary)', padding: '0.45rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>🔄 Updated Daily</span>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: What We Check ── */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,5vw,2rem)', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,5vw,2.2rem)', textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
              Core Safety Integrity Indicators
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>

              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>MOT History (Free)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Complete official record logs since 2005. Track pass rates, historical failures, and exact odometer check logs.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Safety Recalls (Free)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Active safety alerts cross-referenced against manufacturers. Ensure outstanding recall repairs are resolved.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '6px', border: '1px solid var(--accent-yellow)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--accent-yellow)', color: 'var(--bg-primary)', fontSize: '0.7rem', fontWeight: '900', padding: '0.2rem 0.5rem', borderRadius: '2px', fontFamily: 'var(--font-heading)' }}>
                  PAID
                </div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Failure Risk Report (Paid)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Predictive analysis of historical MOT advisories. Know what will fail next with local repair cost ranges.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 3: How It Works ── */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,5vw,2rem)', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,5vw,2.2rem)', textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))', gap: '2rem' }}>
              {[
                { n: '01', title: 'Enter Plate', desc: 'Type any UK vehicle registration to begin.' },
                { n: '02', title: 'Data Pull', desc: 'We retrieve official raw history records directly from DVSA.' },
                { n: '03', title: 'Pattern Match', desc: 'Our model predicts upcoming mechanical and structural component failures.' },
                { n: '04', title: 'Get Forecast', desc: 'Review repair cost ranges before buying a used vehicle.' },
              ].map(({ n, title, desc }) => (
                <div key={n}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', lineHeight: 1 }}>{n}</div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Sample Report Preview ── */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,5vw,2rem)', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,5vw,2.2rem)', textAlign: 'center', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Dossier Preview
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              Real prediction layout displaying component wear logs
            </p>

            <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: 'clamp(1.25rem,5vw,2.5rem)', position: 'relative', overflow: 'hidden' }}>
              {/* Paywall Overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, var(--bg-glass), var(--bg-primary))', backdropFilter: 'blur(3px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem,4vw,1.6rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Predictive Analysis Locked
                </h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Advisories have been parsed. Unlock the cost assessment report for this vehicle.
                </p>
                <button type="button" className="btn-paid" onClick={() => handleSearch('paid')} style={{ maxWidth: '280px' }}>
                  See your car&apos;s report — £2.99
                </button>
              </div>

              {/* Blurred preview behind overlay */}
              <div style={{ opacity: 0.2, filter: 'blur(1px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>FORD FIESTA</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Registration: XX17 XXX</p>
                  </div>
                  <div style={{ background: '#FFD300', color: '#000', padding: '0.5rem 1.25rem', fontWeight: '900', borderRadius: '4px', fontFamily: 'var(--font-mono)', alignSelf: 'flex-start' }}>
                    XX17 XXX
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '4px', borderLeft: '4px solid var(--accent-yellow)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>BUDGET FORECAST</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>£220 — £380</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Front Suspension Bushings</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Advisory: pin or bush worn but not resulting in excessive movement</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Why We Are Different ── */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,5vw,2rem)', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,5vw,2.2rem)', textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
              Why We Are Different
            </h2>

            <div style={{ borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', width: '45%' }}>Feature</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', width: '25%' }}>Others</th>
                    <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)', width: '30%' }}>IsThisCarSafe</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['MOT Pass / Fail Records', '✔️ Yes', '✔️ Yes'],
                    ['Manufacturer Recall Logs', '✔️ Yes', '✔️ Yes'],
                    ['Future Failure Predictions', '❌ Historical Only', '✔️ Yes (Core Engine)'],
                    ['Component Repair Budget Ranges', '❌ None', '✔️ Yes (GBP estimates)'],
                    ['Urgency Level Indicators', '❌ None', '✔️ Yes (Time-weighted)'],
                  ].map(([feature, other, us], i, arr) => (
                    <tr key={feature} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', lineHeight: '1.4' }}>{feature}</td>
                      <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', color: 'var(--text-muted)', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', lineHeight: '1.4' }}>{other}</td>
                      <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', color: 'var(--accent-green)', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', lineHeight: '1.4' }}>{us}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
