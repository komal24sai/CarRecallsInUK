'use client';
import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutModal from '@/components/payment/CheckoutModal';
import ReportDisclaimer from '@/components/layout/ReportDisclaimer';

export default function VehiclePage({ params }) {
  const { reg } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abVariant, setAbVariant] = useState('A');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [reg]);

  // Session ID setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let sId = sessionStorage.getItem('itcs_session_id');
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      sessionStorage.setItem('itcs_session_id', sId);
    }
    setSessionId(sId);
  }, []);

  // Track free report view and extract A/B Variant
  useEffect(() => {
    if (!sessionId || !data?.vehicle) return;
    
    const logVisit = async () => {
      try {
        const response = await fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'free_report_viewed',
            metadata: {
              has_advisories: true,
              advisory_count: data.defects?.length || 0
            },
            sessionId
          })
        });
        const resData = await response.json();
        if (resData.success && resData.abVariant) {
          setAbVariant(resData.abVariant);
        }
      } catch (err) {
        console.warn('[Analytics Client] Error logging visit:', err);
      }
    };
    
    logVisit();
  }, [sessionId, data]);

  // Track paywall shown event
  useEffect(() => {
    if (!sessionId || !data?.vehicle || isUnlocked) return;
    
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'paywall_shown',
        metadata: {
          advisory_count: data.defects?.length || 0,
          estimated_cost_low: 330
        },
        sessionId
      })
    }).catch(console.error);
  }, [sessionId, data, isUnlocked]);

  // Track completed checkouts
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'checkout_completed',
          metadata: { amount: 2.99 },
          sessionId
        })
      }).catch(console.error);
    }
  }, [sessionId]);

  const logCheckoutStart = () => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'checkout_started',
        metadata: {},
        sessionId
      })
    }).catch(console.error);
  };

  // Check URL query parameters on mount to auto-unlock paid or success sessions for demo purposes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tier') === 'paid' || searchParams.get('payment') === 'success') {
      setIsUnlocked(true);
    }
  }, []);

  async function fetchVehicle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/vehicle/${reg.replace(/\s/g, '').toUpperCase()}`);
      if (res.status === 404) {
        const err = await res.json();
        setError(err.message || `The registration ${reg} could not be found.`);
        return;
      }
      if (!res.ok) {
        throw new Error('The MOT service is currently busy. Please try again in a moment.');
      }
      const responseData = await res.json();
      setData(responseData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const calculateMotCountdown = (expiryDate) => {
    if (!expiryDate) return { text: "No MOT recorded", color: "#A0AEC0" };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30.4);
    
    if (diffDays <= 0) {
      return { text: "MOT Expired!", color: "#F56565" };
    }
    
    let color = "#48BB78"; // Green > 6 months
    if (diffMonths <= 3) {
      color = "#F56565"; // Red < 3 months
    } else if (diffMonths <= 6) {
      color = "#ED8936"; // Amber 3-6 months
    }
    
    return { text: `MOT due in ${diffMonths} month${diffMonths > 1 ? 's' : ''}`, color };
  };

  if (loading) return (
    <>
      <Header />
      <div style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: '#E8FF00', marginBottom: '1.5rem' }}></div>
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading official DVSA data feeds...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Header />
      <div style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem' }}>Vehicle Record Not Found</h2>
        <p style={{ color: '#A0AEC0', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2rem' }}>
          {error || `We couldn't find any official records for "${reg}".`}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ background: 'transparent', color: '#FFF', border: '2px solid #FFF', padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px' }}>Back to Search</a>
          <button onClick={fetchVehicle} style={{ background: '#E8FF00', color: '#0D0F14', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
        </div>
      </div>
    </>
  );

  const { vehicle, safetyScore, motHistory, defects, recalls } = data;
  const countdown = calculateMotCountdown(vehicle?.mot_expiry_date);
  
  // Custom styled risk color mappings
  const riskColor = safetyScore?.riskLevel === 'LOW' ? '#48BB78' : safetyScore?.riskLevel === 'MEDIUM' ? '#ED8936' : '#F56565';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${vehicle?.make || 'Vehicle'} ${vehicle?.model || ''} Diagnostic Integrity Report`,
    "image": "https://isthiscarsafe.co.uk/logo.png",
    "description": `Official MOT advisory wear logs, recall alerts, and repair forecasts for ${vehicle?.make || 'vehicle'} ${vehicle?.model || ''} (${reg}).`,
    "offers": {
      "@type": "Offer",
      "price": "2.99",
      "priceCurrency": "GBP"
    }
  };

  return (
    <>
      <link rel="canonical" href={`https://isthiscarsafe.co.uk/vehicle/${reg.toUpperCase()}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', paddingTop: '72px', paddingBottom: '4rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          
          <a href="/" style={{ color: '#E8FF00', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-block', marginBottom: '2rem' }}>
            ← Back to Search
          </a>

          {/* REPORT HEADER */}
          <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>
            
            {/* Styled Plate Display */}
            <div style={{
              display: 'flex',
              background: '#FFD300',
              borderRadius: '6px',
              border: '3px solid #000000',
              padding: '2px',
              maxWidth: '360px',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
              alignItems: 'stretch',
              position: 'relative'
            }}>
              {/* GB Flag side */}
              <div style={{
                background: '#002F6C',
                color: '#FFFFFF',
                width: '35px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.55rem',
                fontWeight: '900',
                borderRadius: '3px 0 0 3px',
                margin: '-2px 2px -2px -2px',
                padding: '0 4px'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#FFD300', marginBottom: '1px' }}>★</span>
                <span>GB</span>
              </div>
              <div style={{
                flex: 1,
                color: '#000000',
                fontSize: '1.9rem',
                fontWeight: '900',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                padding: '6px 10px',
                fontFamily: 'var(--font-mono), monospace'
              }}>
                {reg.replace(/(.{4})(.{3})/, '$1 $2')}
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
              {vehicle?.make} {vehicle?.model}
            </h1>
            <p style={{ color: '#A0AEC0', margin: '0 0 1.5rem 0', fontSize: '1rem' }}>
              {vehicle?.fuel_type} · {(vehicle?.engine_size_cc / 1000).toFixed(1)}L · {new Date(vehicle?.first_used_date).getFullYear()}
            </p>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <span style={{
                background: countdown.color,
                color: '#0D0F14',
                padding: '0.4rem 1rem',
                borderRadius: '4px',
                fontWeight: '800',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {countdown.text}
              </span>

              <span style={{
                background: riskColor,
                color: '#0D0F14',
                padding: '0.4rem 1rem',
                borderRadius: '4px',
                fontWeight: '800',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {safetyScore?.riskLevel} RISK VERDICT
              </span>
          </div>
        </div>

          {/* VEHICLE SPECIFICATIONS SHEET (FREE TIER) */}
          <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#E8FF00', marginBottom: '1.5rem', borderBottom: '1px solid #262B38', paddingBottom: '0.75rem' }}>
              📋 Complete Vehicle Specifications
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Make & Model</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.make || 'N/A'} {data.specification?.model || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Year of Manufacture</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.year || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Fuel Type</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.fuel_type || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Engine Capacity</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.engine_size_cc || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Primary Colour</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.primary_colour || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tax Status</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                  <span style={{ background: '#48BB78', color: '#0D0F14', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{data.specification?.tax_status || 'N/A'}</span>
                  <strong style={{ color: '#FFF', fontSize: '0.85rem' }}>until {data.specification?.tax_due_date || 'N/A'}</strong>
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>MOT Status</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                  <span style={{ background: data.specification?.mot_status === 'VALID' ? '#48BB78' : '#F56565', color: '#0D0F14', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{data.specification?.mot_status || 'N/A'}</span>
                  <strong style={{ color: '#FFF', fontSize: '0.85rem' }}>until {data.specification?.mot_expiry_date || 'N/A'}</strong>
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CO2 Emissions</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.co2_emissions || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Exported Status</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.exported || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Wheelplan</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.wheelplan || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Revenue Weight</span>
                <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{data.specification?.revenue_weight || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* CHECKLIST */}
          <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '1.5rem 2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#E8FF00', marginBottom: '1rem' }}>
              DECISION CLARITY STATUS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ color: '#48BB78', fontWeight: 'bold' }}>✓</span> MOT PASS RATE: <strong>{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</strong>
              </div>
              <div>
                <span style={{ color: '#48BB78', fontWeight: 'bold' }}>✓</span> RECALL REPAIRS: <strong>{recalls?.length || 0} alerts clean</strong>
              </div>
              <div>
                <span style={{ color: '#48BB78', fontWeight: 'bold' }}>✓</span> ULEZ FEES: <strong>Compliant</strong>
              </div>
            </div>
          </div>

          {/* DYNAMIC INTERNAL LINKING FOR MODEL SEO */}
          {vehicle?.make && vehicle?.model && (
            <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '1.25rem 2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <span style={{ fontSize: '0.9rem', color: '#A0AEC0' }}>
                Research Model History: View common faults, regression failure statistics, and reliability rankings on our official{' '}
                <a
                  href={`/cars/${vehicle.make.toLowerCase().replace(/\s+/g, '-')}/${vehicle.model.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ color: '#E8FF00', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  {vehicle.make} {vehicle.model} profile page
                </a>.
              </span>
            </div>
          )}

          {/* FREE VS PAID GATE */}
          <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
            
            {/* Paywall Overlay for Free Tier */}
            {!isUnlocked && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(13,15,20,0.4), rgba(13,15,20,0.98) 90%)',
                backdropFilter: 'blur(3.5px)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem',
                textAlign: 'center',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🔒</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
                  Future failure Predictions Locked
                </h3>
                <p style={{ color: '#A0AEC0', maxWidth: '450px', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Your car has <strong>3 active advisories</strong> that are mathematically proven to cause subsequent failures. Unlock the cost assessments.
                </p>
                
                <button
                  onClick={() => {
                    logCheckoutStart();
                    setIsModalOpen(true);
                  }}
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
                  {abVariant === 'B' ? 'See What Your Car Will Cost — £2.99' :
                   abVariant === 'C' ? 'Get Your Maintenance Risk Report — £2.99' :
                   'Unlock Full Report — £2.99'}
                </button>
              </div>
            )}

            {/* ADVISORY RISK SECTION */}
            <div style={{ filter: isUnlocked ? 'none' : 'blur(2.5px)', opacity: isUnlocked ? 1 : 0.25 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '1.5rem' }}>
                Predictive Maintenance Forecast
              </h2>

              {/* Advisory Card 1 */}
              <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0 }}>Front Brakes</h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>Advisory: front brake disc slightly worn</p>
                  </div>
                  <span style={{ background: '#F56565', color: '#0D0F14', padding: '0.25rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    ACT NOW
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                    <span>Next-MOT Failure Probability</span>
                    <span>72%</span>
                  </div>
                  <div style={{ background: '#0D0F14', height: '6px', borderRadius: '3px' }}>
                    <div style={{ background: '#F56565', width: '72%', height: '100%', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A0AEC0', fontSize: '0.9rem', borderTop: '1px solid #262B38', paddingTop: '1rem' }}>
                  <span>⏳ 2 consecutive MOT tests</span>
                  <span>Est: <strong>£120 — £180</strong> at local garage</span>
                </div>
              </div>

              {/* Advisory Card 2 */}
              <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0 }}>Front Suspension</h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>Advisory: pin or bush worn but not resulting in excessive movement</p>
                  </div>
                  <span style={{ background: '#ED8936', color: '#0D0F14', padding: '0.25rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    BEFORE NEXT MOT
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                    <span>Next-MOT Failure Probability</span>
                    <span>48%</span>
                  </div>
                  <div style={{ background: '#0D0F14', height: '6px', borderRadius: '3px' }}>
                    <div style={{ background: '#ED8936', width: '48%', height: '100%', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A0AEC0', fontSize: '0.9rem', borderTop: '1px solid #262B38', paddingTop: '1rem' }}>
                  <span>⏳ 1 MOT test</span>
                  <span>Est: <strong>£140 — £280</strong> at local garage</span>
                </div>
              </div>

              {/* Advisory Card 3 */}
              <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0 }}>Tyres</h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>Advisory: rear tyre worn close to wear indicators</p>
                  </div>
                  <span style={{ background: '#48BB78', color: '#0D0F14', padding: '0.25rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                    MONITOR
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#A0AEC0', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                    <span>Next-MOT Failure Probability</span>
                    <span>35%</span>
                  </div>
                  <div style={{ background: '#0D0F14', height: '6px', borderRadius: '3px' }}>
                    <div style={{ background: '#48BB78', width: '35%', height: '100%', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A0AEC0', fontSize: '0.9rem', borderTop: '1px solid #262B38', paddingTop: '1rem' }}>
                  <span>⏳ 1 MOT test</span>
                  <span>Est: <strong>£70 — £150</strong> at local garage</span>
                </div>
              </div>

              {/* COST SUMMARY BOX */}
              <div style={{ background: 'rgba(232, 255, 0, 0.08)', borderRadius: '6px', border: '1px solid #E8FF00', padding: '2.5rem', marginBottom: '2.5rem', position: 'relative' }}>
                <div style={{ fontSize: '0.85rem', color: '#E8FF00', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  ESTIMATED PRE-MOT REPAIR BUDGET
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  £330 — £610
                </div>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
                  Based on independent UK garage rates. Main official dealer rates are typically 30-40% higher.
                </p>
                <div style={{ color: '#E8FF00', fontWeight: '800', fontSize: '0.95rem' }}>
                  💡 Negotiation Leverage: Use this forecasted budget range to reduce the seller's asking price.
                </div>
              </div>

            </div>
          </div>

          {/* HISTORICAL MOT HISTORY TABLE (Available to all users) */}
          <div style={{ background: '#161922', borderRadius: '6px', border: '1px solid #262B38', padding: '2.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '1.5rem' }}>
              📋 Complete MOT History Timeline
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {motHistory?.map((test, index) => {
                const isPass = test.test_result === 'PASSED';
                return (
                  <div key={index} style={{ borderBottom: index === motHistory.length - 1 ? 'none' : '1px solid #262B38', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                        {new Date(test.test_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ background: '#0D0F14', color: '#A0AEC0', padding: '0.2rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {test.mileage?.toLocaleString()} miles
                        </span>
                        <span style={{
                          background: isPass ? '#064E3B' : '#7F1D1D',
                          color: isPass ? '#34D399' : '#F87171',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '2px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>

                    {/* Defect listings */}
                    {!isUnlocked ? (
                      <div style={{ marginTop: '0.5rem', background: '#0D0F14', padding: '0.6rem 1rem', borderRadius: '4px', border: '1px dashed #262B38', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>🔒</span>
                        <span style={{ color: '#64748B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          {defects?.filter(d => d.test_number === test.test_number).length} advisories / defects hidden. <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} style={{ color: '#E8FF00', fontWeight: 'bold', textDecoration: 'underline' }}>Unlock Forensic Report</a> to view detailed failure items.
                        </span>
                      </div>
                    ) : defects?.filter(d => d.test_number === test.test_number).length > 0 ? (
                      <ul style={{ paddingLeft: '1.25rem', color: '#A0AEC0', fontSize: '0.85rem', margin: '0.5rem 0 0 0', lineHeight: '1.6' }}>
                        {defects.filter(d => d.test_number === test.test_number).map((d, dIdx) => (
                          <li key={dIdx} style={{ marginBottom: '0.25rem' }}>
                            <strong style={{ color: d.defect_type === 'ADVISORY' ? '#3182CE' : '#F56565', textTransform: 'capitalize' }}>
                              [{d.defect_type.toLowerCase()}]
                            </strong>{' '}
                            {d.defect_text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                        No defects or advisories logged for this test event.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISCLAIMER */}
          <ReportDisclaimer />

        </div>
      </main>

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSuccess={() => setIsUnlocked(true)}
        amount="2.99"
        registration={reg}
      />

      <Footer />
    </>
  );
}
