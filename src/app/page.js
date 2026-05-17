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
      setError('Please enter a valid UK registration number (e.g. AB12 CDE)');
    }
  };

  return (
    <>
      <Header />
      <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', paddingTop: '72px' }}>
        
        {/* SECTION 1: Hero */}
        <section style={{ padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.5rem', color: '#FFFFFF' }}>
              Find out what your next MOT will cost you.<br />
              <span style={{ color: '#E8FF00' }}>Before you buy.</span>
            </h1>
            
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: '#A0AEC0', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
              Every MOT advisory tells a story. We read it for you. Powered by official DVSA data covering 40 million UK vehicles.
            </p>

            {/* Realistic UK Plate Search Box */}
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                background: '#FFD300',
                borderRadius: '6px',
                border: '3px solid #000000',
                padding: '4px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,255,255,0.4)',
                alignItems: 'stretch',
                position: 'relative'
              }}>
                {/* GB Flag side */}
                <div style={{
                  background: '#002F6C',
                  color: '#FFFFFF',
                  width: '45px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '900',
                  borderRadius: '3px 0 0 3px',
                  margin: '-4px 4px -4px -4px',
                  padding: '0 6px',
                  fontFamily: 'var(--font-body)'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#FFD300', marginBottom: '2px' }}>★</span>
                  <span>GB</span>
                </div>
                {/* Input */}
                <input
                  type="text"
                  placeholder="ENTER REG"
                  className="reg-input-plate"
                  value={reg}
                  onChange={handleInputChange}
                  maxLength={8}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#000000',
                    fontSize: '2.4rem',
                    fontWeight: '900',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    padding: '8px 10px',
                    fontFamily: 'var(--font-mono), monospace'
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#F56565', fontSize: '0.9rem', marginTop: '0.75rem', fontWeight: 'bold' }}>
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSearch('free')}
                  style={{
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    padding: '0.85rem 2rem',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    transition: 'var(--transition)'
                  }}
                >
                  Free Check
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSearch('paid')}
                  style={{
                    background: '#E8FF00',
                    color: '#0D0F14',
                    border: 'none',
                    padding: '0.85rem 2rem',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    transition: 'var(--transition)',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  Full Risk Report — £2.99
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#161922', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #262B38', color: '#A0AEC0' }}>
                  🛡️ DVSA Official Data
                </span>
                <span style={{ background: '#161922', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #262B38', color: '#A0AEC0' }}>
                  🚗 40M+ Vehicles
                </span>
                <span style={{ background: '#161922', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #262B38', color: '#A0AEC0' }}>
                  🔄 Updated Daily
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: What We Check */}
        <section style={{ padding: '6rem 2rem', background: '#12151C', borderTop: '1px solid #262B38' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', textAlign: 'center', marginBottom: '4rem' }}>
              Core Safety Integrity Indicators
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              <div style={{ background: '#161922', padding: '2.5rem', borderRadius: '6px', border: '1px solid #262B38' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>📋</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem' }}>MOT History (Free)</h3>
                <p style={{ color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Complete official record logs since 2005. Track pass rates, historical failures, and exact odometer check logs.
                </p>
              </div>

              <div style={{ background: '#161922', padding: '2.5rem', borderRadius: '6px', border: '1px solid #262B38' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>⚠️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem' }}>Safety Recalls (Free)</h3>
                <p style={{ color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Active safety alerts cross-referenced directly against manufacturers. Make sure outstanding safety recall repairs are sorted.
                </p>
              </div>

              <div style={{ background: '#161922', padding: '2.5rem', borderRadius: '6px', border: '1px solid #E8FF00', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#E8FF00', color: '#0D0F14', fontSize: '0.75rem', fontWeight: '900', padding: '0.25rem 0.6rem', borderRadius: '2px', fontFamily: 'var(--font-heading)' }}>
                  PAID
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>📊</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem' }}>Failure Risk Report (Paid)</h3>
                <p style={{ color: '#A0AEC0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Predictive analysis of historical MOT advisories. Know what components will fail next and access local repair cost ranges.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: How It Works */}
        <section style={{ padding: '6rem 2rem', background: '#0D0F14', borderTop: '1px solid #262B38' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', textAlign: 'center', marginBottom: '4rem' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
              
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>01</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>Enter Plate</h4>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', lineHeight: '1.5' }}>Type any UK vehicle registration to begin.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>02</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>Data Pull</h4>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', lineHeight: '1.5' }}>We retrieve official raw history records directly from DVSA.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>03</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>Pattern Match</h4>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', lineHeight: '1.5' }}>Our model predicts upcoming mechanical and structural component failures.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#E8FF00', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>04</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>Get Forecast</h4>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', lineHeight: '1.5' }}>Review repair cost ranges before buying a used vehicle.</p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: Sample Report Preview */}
        <section style={{ padding: '6rem 2rem', background: '#12151C', borderTop: '1px solid #262B38' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', textAlign: 'center', marginBottom: '1rem' }}>
              Dossier Preview
            </h2>
            <p style={{ color: '#A0AEC0', textAlign: 'center', marginBottom: '3rem' }}>
              Real prediction layout displaying component wear logs
            </p>

            <div style={{
              background: '#161922',
              borderRadius: '6px',
              border: '1px solid #262B38',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Paywall Overlay */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(18,21,28,0.4), rgba(13,15,20,0.95))',
                backdropFilter: 'blur(3px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                  Predictive Analysis Locked
                </h3>
                <p style={{ color: '#A0AEC0', maxWidth: '450px', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Advisories have been parsed. Unlock the cost assessment report for this vehicle.
                </p>
                
                <button
                  type="button"
                  onClick={() => handleSearch('paid')}
                  style={{
                    background: '#E8FF00',
                    color: '#0D0F14',
                    border: 'none',
                    padding: '0.9rem 2.2rem',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'uppercase',
                    boxShadow: 'var(--shadow-glow)',
                    transition: 'var(--transition)'
                  }}
                >
                  See your car's report — £2.99
                </button>
              </div>

              {/* Redacted Content Behind Overlay */}
              <div style={{ opacity: 0.25, filter: 'blur(1px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #262B38', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>FORD FIESTA</h3>
                    <p style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>Registration: XX17 XXX</p>
                  </div>
                  <div style={{ background: '#FFD300', color: '#000', padding: '0.5rem 1.5rem', fontWeight: '900', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    XX17 XXX
                  </div>
                </div>

                <div style={{ background: '#0D0F14', padding: '1.5rem', borderRadius: '4px', borderLeft: '4px solid #E8FF00', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>BUDGET FORECAST</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>£220 — £380</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#0D0F14', padding: '1.25rem', borderRadius: '4px', border: '1px solid #262B38' }}>
                    <div style={{ fontWeight: 'bold' }}>Front Suspension Bushings</div>
                    <div style={{ fontSize: '0.85rem', color: '#A0AEC0', marginTop: '0.25rem' }}>Advisory: pin or bush worn but not resulting in excessive movement</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5: Why This Is Different */}
        <section style={{ padding: '6rem 2rem', background: '#0D0F14', borderTop: '1px solid #262B38' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', textAlign: 'center', marginBottom: '4rem' }}>
              Why We Are Different
            </h2>
            
            <div style={{
              overflowX: 'auto',
              borderRadius: '6px',
              border: '1px solid #262B38',
              background: '#161922'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #262B38', background: '#12151C' }}>
                    <th style={{ padding: '1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#FFFFFF' }}>Core Feature</th>
                    <th style={{ padding: '1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#A0AEC0' }}>Standard Check Sites</th>
                    <th style={{ padding: '1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#E8FF00' }}>IsThisCarSafe</th>
                  </tr>
                </thead>
                <tbody>
                  
                  <tr style={{ borderBottom: '1px solid #262B38' }}>
                    <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>MOT Pass / Fail Records</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #262B38' }}>
                    <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>Manufacturer Recall Logs</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #262B38' }}>
                    <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>Future Failure Predictions</td>
                    <td style={{ padding: '1.25rem', color: '#64748B' }}>❌ Historical Only</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes (Core Engine)</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #262B38' }}>
                    <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>Component Repair Budget ranges</td>
                    <td style={{ padding: '1.25rem', color: '#64748B' }}>❌ None</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes (GBP estimates)</td>
                  </tr>

                  <tr>
                    <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>Urgency Level Indicators</td>
                    <td style={{ padding: '1.25rem', color: '#64748B' }}>❌ None</td>
                    <td style={{ padding: '1.25rem', color: '#E8FF00' }}>✔️ Yes (Time-weighted)</td>
                  </tr>

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
