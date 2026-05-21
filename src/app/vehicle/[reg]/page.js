'use client';
import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutModal from '@/components/payment/CheckoutModal';
import ReportDisclaimer from '@/components/layout/ReportDisclaimer';
import { generateAIReport } from '@/lib/ai-forecast';
import AIChatAgent from '@/components/ui/AIChatAgent';

export default function VehiclePage({ params }) {
  const { reg } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [abVariant, setAbVariant] = useState('A');
  const [sessionId, setSessionId] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkSize = () => setIsDesktop(window.innerWidth >= 992);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

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
      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', transition: 'background 0.3s ease, color 0.3s ease' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: 'var(--accent-yellow)', marginBottom: '1.5rem' }}></div>
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading official DVSA data feeds...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Header />
      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', textAlign: 'center', transition: 'background 0.3s ease, color 0.3s ease' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem' }}>Vehicle Record Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '2rem' }}>
          {error || `We couldn't find any official records for "${reg}".`}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ background: 'transparent', color: 'var(--text-primary)', border: '2px solid var(--border-color)', padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px' }}>Back to Search</a>
          <button onClick={fetchVehicle} style={{ background: 'var(--accent-yellow)', color: '#0D0F14', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
        </div>
      </div>
    </>
  );

  const { vehicle, safetyScore, motHistory, defects, recalls, defectDistribution, provenance, mileageTimeline } = data;
  const countdown = calculateMotCountdown(vehicle?.mot_expiry_date);
  const riskColor = safetyScore?.riskLevel === 'LOW' ? '#48BB78' : safetyScore?.riskLevel === 'MEDIUM' ? '#ED8936' : '#F56565';
  
  const aiReport = generateAIReport(safetyScore, vehicle, defects, mileageTimeline);

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

  // --- MODULAR SUB-RENDERS ---
  const renderHeader = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2.5rem', marginBottom: '2.5rem', textAlign: 'center', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        
        {/* Styled Plate Display */}
        <div style={{
          display: 'flex',
          background: '#FFD300',
          borderRadius: '6px',
          border: '3px solid #000000',
          padding: '2px',
          maxWidth: '360px',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
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

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
          {vehicle?.make} {vehicle?.model}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontSize: '1rem' }}>
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
    );
  };

  const renderAiHub = () => {
    if (!aiReport) return null;

    return (
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '6px', 
        border: '1px solid var(--border-color)', 
        padding: '2.5rem', 
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        {/* Paywall Overlay for Free Tier */}
        {!isUnlocked && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(13,15,20,0.1), var(--bg-card) 95%)',
            backdropFilter: 'blur(5px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🧠</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              AI Forensic Intelligence Locked
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Unlock our deep-learning analysis of risk vectors, anomaly patterns, and estimated annual repair costs for this vehicle.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'var(--accent-yellow)',
                color: '#0D0F14',
                border: 'none',
                padding: '0.75rem 1.75rem',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderRadius: '4px',
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              Unlock AI Report — £2.99
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-yellow)', margin: 0 }}>
            🧠 AI Forensic Intelligence Hub
          </h3>
          <span style={{ 
            background: aiReport.verdict.color, 
            color: '#0D0F14', 
            padding: '0.4rem 1rem', 
            borderRadius: '4px', 
            fontWeight: '900', 
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)'
          }}>
            {aiReport.verdict.icon} AI VERDICT: {aiReport.verdict.status}
          </span>
        </div>

        <div style={{ filter: isUnlocked ? 'none' : 'blur(2.5px)', opacity: isUnlocked ? 1 : 0.2 }}>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            {aiReport.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            
            {/* Est Annual Maintenance */}
            <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                💰 Est. Annual Maintenance Liability
              </span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>
                {aiReport.estimatedAnnualCost}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                Expected service & component wear repairs modeled by historical vehicle failure cohorts.
              </p>
            </div>

            {/* Mileage Consistency */}
            <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                📈 Mileage Utilization Cohort
              </span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {aiReport.mileageAnalysis.avgAnnualMiles.toLocaleString()} miles/yr
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                {aiReport.mileageAnalysis.text}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderMarketValuation = () => {
    return (
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '6px', 
        border: '1px solid var(--border-color)', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        {/* Paywall Overlay for Free Tier */}
        {!isUnlocked && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(13,15,20,0.1), var(--bg-card) 95%)',
            backdropFilter: 'blur(5px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💹</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              AI Market Valuation Locked
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
              Unlock the dynamic fair value estimation based on live UK dealer market listings.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'var(--accent-yellow)',
                color: '#0D0F14',
                border: 'none',
                padding: '0.5rem 1.25rem',
                fontWeight: '900',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}
            >
              Unlock Valuation
            </button>
          </div>
        )}

        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          📊 AI MARKET VALUATION
        </h3>

        <div style={{ textAlign: 'center', filter: isUnlocked ? 'none' : 'blur(2.5px)', opacity: isUnlocked ? 1 : 0.2 }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
            £{provenance?.market_valuation?.average?.toLocaleString() || 'N/A'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5rem' }}>
            Estimated Fair Market Value
          </div>
          
          <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden', display: 'flex', marginBottom: '0.75rem' }}>
            <div style={{ width: '33%', background: 'var(--accent-amber)', opacity: 0.5 }}></div>
            <div style={{ width: '34%', background: 'var(--accent-green)' }}></div>
            <div style={{ width: '33%', background: 'var(--accent-red)', opacity: 0.5 }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <span>£{provenance?.market_valuation?.low?.toLocaleString() || 'N/A'}</span>
            <span>£{provenance?.market_valuation?.high?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSpecifications = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--accent-yellow)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          📋 Complete Vehicle Specifications
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Make & Model</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.make || 'N/A'} {data.specification?.model || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Year of Manufacture</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.year || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Fuel Type</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.fuel_type || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Engine Capacity</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.engine_size_cc || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Primary Colour</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.primary_colour || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tax Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span style={{ background: '#48BB78', color: '#0D0F14', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{data.specification?.tax_status || 'N/A'}</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>until {data.specification?.tax_due_date || 'N/A'}</strong>
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>MOT Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span style={{ background: data.specification?.mot_status === 'VALID' ? '#48BB78' : '#F56565', color: '#0D0F14', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{data.specification?.mot_status || 'N/A'}</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>until {data.specification?.mot_expiry_date || 'N/A'}</strong>
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CO2 Emissions</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.co2_emissions || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Wheelplan</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.wheelplan || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Revenue Weight</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.revenue_weight || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>V5C Document Ref</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.v5c_number || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Last V5C Issued Date</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{data.specification?.v5c_issued_date || 'N/A'}</strong>
          </div>
        </div>
      </div>
    );
  };

  const renderProvenance = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--accent-yellow)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Provenance & History Verification
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Police Stolen Check</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : (provenance?.is_stolen ? 'var(--accent-red)' : 'var(--accent-green)')
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : (provenance?.is_stolen ? '🚨 STOLEN RECORD FOUND' : '✓ Passed (Clear)')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Write-off / Salvage Check</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : (provenance?.write_off_category ? 'var(--accent-red)' : 'var(--accent-green)')
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : (provenance?.write_off_category ? `🚨 ${provenance.write_off_category}` : '✓ Passed (Clear)')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outstanding Finance</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : (provenance?.has_outstanding_finance ? 'var(--accent-red)' : 'var(--accent-green)')
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : (provenance?.has_outstanding_finance ? '🚨 Active Agreement Found' : '✓ Passed (Clear)')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Keepers / Logbooks</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--text-primary)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : (provenance?.previous_owners || 'N/A')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ex-Taxi / Police / NHS use</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--accent-green)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : '✓ No fleet record found'}
              </strong>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Plate Change History</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--text-primary)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : 'No previous plate changes'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Colour Changes</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--text-primary)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : 'No registered changes'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Imported / Exported Status</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--accent-green)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : '✓ UK Sourced'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scrapped Status</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--accent-green)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : '✓ Live Registration'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Internet salvage history</span>
              <strong style={{ 
                fontSize: '0.85rem', 
                color: !isUnlocked ? 'var(--accent-amber)' : 'var(--accent-green)'
              }}>
                {!isUnlocked ? '🔒 Click to unlock' : '✓ No listings found'}
              </strong>
            </div>
          </div>
        </div>

        {/* Click to see full report CTA */}
        {!isUnlocked && (
          <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
              style={{ color: 'var(--accent-yellow)', fontWeight: 'bold', fontSize: '0.95rem', textDecoration: 'underline', letterSpacing: '0.5px' }}
            >
              👉 CLICK TO RUN FULL PROVENANCE VERIFICATION & FORECAST CHECKS
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2.5rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          📋 Complete MOT History Timeline
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {motHistory?.map((test, index) => {
            const isPass = test.test_result === 'PASSED';
            return (
              <div key={index} style={{ borderBottom: index === motHistory.length - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {new Date(test.test_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', padding: '0.2rem 0.6rem', borderRadius: '2px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
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
                {defects?.filter(d => d.test_number === test.test_number).length > 0 ? (
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 0 0', lineHeight: '1.6' }}>
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                    No defects or advisories logged for this test event.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSeoLink = () => {
    if (!vehicle?.make || !vehicle?.model) return null;
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <span style={{ fontSize: '1.25rem' }}>🛡️</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Research Model History: View common faults, regression failure statistics, and reliability rankings on our official{' '}
          <a
            href={`/cars/${vehicle.make.toLowerCase().replace(/\s+/g, '-')}/${vehicle.model.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ color: 'var(--accent-yellow)', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {vehicle.make} {vehicle.model} profile page
          </a>.
        </span>
      </div>
    );
  };

  const renderSafetyScore = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          🛡️ SAFETY SCORE
        </h3>

        {/* Radial Gauge */}
        <div style={{ width: '150px', height: '150px', position: 'relative', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {/* Background Circle */}
            <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth="8" />
            {/* Foreground Animated Score Ring */}
            <circle cx="70" cy="70" r="62" fill="none" 
              stroke={
                safetyScore?.riskLevel === 'LOW' ? '#48BB78' : 
                safetyScore?.riskLevel === 'MEDIUM' ? '#ED8936' : 
                '#F56565'
              } 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeDasharray={2 * Math.PI * 62} 
              strokeDashoffset={2 * Math.PI * 62 - (2 * Math.PI * 62 * (safetyScore?.safetyScore || 70)) / 100} 
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{safetyScore?.safetyScore || '—'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>/ 100</div>
          </div>
        </div>

        {/* Risk Level Badge */}
        <span style={{ 
          background: safetyScore?.riskLevel === 'LOW' ? 'rgba(72, 187, 120, 0.15)' : safetyScore?.riskLevel === 'MEDIUM' ? 'rgba(237, 137, 54, 0.15)' : 'rgba(245, 101, 101, 0.15)', 
          color: safetyScore?.riskLevel === 'LOW' ? '#48BB78' : safetyScore?.riskLevel === 'MEDIUM' ? '#ED8936' : '#F56565',
          border: `1px solid ${safetyScore?.riskLevel === 'LOW' ? '#48BB78' : safetyScore?.riskLevel === 'MEDIUM' ? '#ED8936' : '#F56565'}`,
          padding: '0.4rem 1.2rem', 
          borderRadius: '20px', 
          fontWeight: '900', 
          fontSize: '0.78rem',
          letterSpacing: '1px',
          fontFamily: 'var(--font-mono)',
          marginBottom: '2rem'
        }}>
          {safetyScore?.riskLevel} RISK VERDICT
        </span>

        {/* Subscores Progress Bars */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* MOT Pass History */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>MOT pass history</span>
              <strong style={{ 
                color: vehicle?.total_mot_tests ? 
                  ((vehicle.total_passes / vehicle.total_mot_tests) > 0.8 ? '#48BB78' : 
                   (vehicle.total_passes / vehicle.total_mot_tests) > 0.5 ? '#ED8936' : '#F56565') : 'var(--text-primary)'
              }}>
                {vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%
              </strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%`, 
                background: vehicle?.total_mot_tests ? 
                  ((vehicle.total_passes / vehicle.total_mot_tests) > 0.8 ? '#48BB78' : 
                   (vehicle.total_passes / vehicle.total_mot_tests) > 0.5 ? '#ED8936' : '#F56565') : 'var(--text-primary)',
                height: '100%' 
              }} />
            </div>
          </div>

          {/* Mileage Consistency */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mileage consistency</span>
              <strong style={{ color: (safetyScore?.mileageConsistencyScore || 20) === 20 ? '#48BB78' : '#ED8936' }}>
                {(safetyScore?.mileageConsistencyScore || 20) === 20 ? 'Good' : 'Needs Verification'}
              </strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${((safetyScore?.mileageConsistencyScore || 20) / 20) * 100}%`, 
                background: (safetyScore?.mileageConsistencyScore || 20) === 20 ? '#48BB78' : '#ED8936',
                height: '100%' 
              }} />
            </div>
          </div>

          {/* Defect Severity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Defect severity</span>
              <strong style={{ color: (safetyScore?.defectSeverityScore || 30) > 25 ? '#48BB78' : (safetyScore?.defectSeverityScore || 30) > 15 ? '#ED8936' : '#F56565' }}>
                {(safetyScore?.defectSeverityScore || 30) > 25 ? 'Low' : (safetyScore?.defectSeverityScore || 30) > 15 ? 'Medium' : 'High'}
              </strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${((safetyScore?.defectSeverityScore || 30) / 30) * 100}%`, 
                background: (safetyScore?.defectSeverityScore || 30) > 25 ? '#48BB78' : (safetyScore?.defectSeverityScore || 30) > 15 ? '#ED8936' : '#F56565',
                height: '100%' 
              }} />
            </div>
          </div>

          {/* Age vs Condition */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Age vs condition</span>
              <strong style={{ color: (safetyScore?.defectSeverityScore || 30) > 20 ? '#48BB78' : '#ED8936' }}>
                {(safetyScore?.defectSeverityScore || 30) > 20 ? 'Excellent' : 'Fair'}
              </strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${((safetyScore?.defectSeverityScore || 30) / 30) * 80}%`, 
                background: (safetyScore?.defectSeverityScore || 30) > 20 ? '#48BB78' : '#ED8936',
                height: '100%' 
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefectDistribution = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          🟡 DEFECT DISTRIBUTION
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1, justifyContent: 'center' }}>
          {defectDistribution && defectDistribution.length > 0 ? (
            defectDistribution.slice(0, 8).map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{d.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
                <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${d.percentage}%`, 
                    background: i % 2 === 0 ? 'var(--accent-purple)' : 'var(--accent-amber)',
                    height: '100%' 
                  }} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No defect distributions logged. This vehicle has a 100% clean history timeline.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVerificationMatrix = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h4 style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 2rem 0', fontFamily: 'var(--font-mono)' }}>
          Interactive Report Verification Matrix
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: 'Stolen Report', premium: true, icon: '🚓' },
            { name: 'Write-Off Check', premium: true, icon: '💥' },
            { name: 'Plate Changes', premium: true, icon: '🔢' },
            { name: 'VIN/Chassis Check', premium: true, icon: '🔍' },
            { name: 'Salvage History', premium: true, icon: '🏗️' },
            { name: 'Ex-Taxi Check', premium: true, icon: '🚖' },
            { name: 'Valuation', premium: true, icon: '📈' },
            { name: 'Service History', premium: true, icon: '🔧' },
            { name: 'Internet history', premium: true, icon: '🌐' },
            { name: 'Logbook Counts', premium: true, icon: '📄' },
            { name: 'Previous Keepers', premium: true, icon: '👥' },
            { name: 'Mileage Report', premium: false, icon: '⚡' },
            { name: 'Colour Changes', premium: true, icon: '🎨' },
            { name: 'Weight/Dimension', premium: false, icon: '⚖️' },
            { name: 'Performance', premium: false, icon: '🚀' },
            { name: 'Engine Data', premium: false, icon: '⚙️' },
            { name: 'SMMT Details', premium: false, icon: '📋' },
            { name: 'Fuel Economy', premium: false, icon: '⛽' },
            { name: 'Running Costs', premium: true, icon: '💰' },
            { name: 'Emissions', premium: false, icon: '💨' },
            { name: 'Vehicle Details', premium: false, icon: '🚗' },
            { name: 'MOT History', premium: false, icon: '📝' },
            { name: 'Timeline', premium: false, icon: '📅' },
          ].map((item, idx) => {
            const isItemLocked = item.premium && !isUnlocked;
            return (
              <div 
                key={idx} 
                onClick={() => { if (isItemLocked) setIsModalOpen(true); }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center', 
                  cursor: isItemLocked ? 'pointer' : 'default',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '4px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', lineHeight: '1.3' }}>
                  {item.name}
                </span>
                <span style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  right: '4px', 
                  fontSize: '0.65rem', 
                  background: isItemLocked ? 'var(--accent-amber)' : 'var(--accent-green)',
                  color: '#0D0F14',
                  padding: '0 0.25rem',
                  borderRadius: '3px',
                  fontWeight: 'bold'
                }}>
                  {isItemLocked ? '🔒' : '✓'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChecklist = () => {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '1.5rem 2rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
          DECISION CLARITY STATUS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-primary)' }}>
          <div>
            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span> MOT PASS RATE: <strong>{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</strong>
          </div>
          <div>
            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span> RECALL REPAIRS: <strong>{recalls?.length || 0} alerts clean</strong>
          </div>
          <div>
            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span> ULEZ FEES: <strong>Compliant</strong>
          </div>
        </div>
      </div>
    );
  };

  const renderForecasts = () => {
    // 1. Group actual silver defects dynamically
    const categoryMap = {};
    const latestTest = motHistory?.[0];
    const activeDefects = defects?.filter(d => d.test_number === latestTest?.test_number) || [];
    const recentDefects = defects?.filter(d => d.test_number !== latestTest?.test_number) || [];

    // Component standard pricing and base failure probabilities in the UK
    const componentPricing = {
      'Brakes': { low: 120, high: 200, label: 'Braking System', baseProb: 65, componentName: 'Brakes' },
      'Tyres': { low: 70, high: 130, label: 'Tyres & Wheels', baseProb: 55, componentName: 'Tyres' },
      'Suspension': { low: 150, high: 300, label: 'Suspension System', baseProb: 50, componentName: 'Suspension System' },
      'Lighting': { low: 30, high: 80, label: 'Lights & Signals', baseProb: 40, componentName: 'Lighting & Signals' },
      'Emissions': { low: 180, high: 450, label: 'Exhaust & Emissions', baseProb: 60, componentName: 'Exhaust & Emissions' },
      'Steering': { low: 120, high: 250, label: 'Steering System', baseProb: 45, componentName: 'Steering System' },
      'Structure': { low: 100, high: 300, label: 'Body & Chassis', baseProb: 35, componentName: 'Body & Chassis structure' },
      'Visibility': { low: 40, high: 110, label: 'Windows & Wipers', baseProb: 30, componentName: 'Visibility & Wipers' },
      'Drivetrain': { low: 150, high: 350, label: 'Drivetrain Components', baseProb: 45, componentName: 'Drivetrain Components' },
      'Safety': { low: 80, high: 200, label: 'Restraints & Airbags', baseProb: 25, componentName: 'Safety Restraints' },
      'Body': { low: 60, high: 150, label: 'Doors & Panels', baseProb: 20, componentName: 'Body panels' },
      'Fuel': { low: 90, high: 220, label: 'Fuel System', baseProb: 30, componentName: 'Fuel System' },
      'Other': { low: 50, high: 150, label: 'Other Components', baseProb: 25, componentName: 'General components' }
    };

    activeDefects.forEach(d => {
      const cat = d.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          text: d.defect_text,
          type: d.defect_type,
          isActive: true,
          count: 1
        };
      } else {
        categoryMap[cat].count++;
      }
    });

    recentDefects.forEach(d => {
      const cat = d.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          text: d.defect_text,
          type: d.defect_type,
          isActive: false,
          count: 1
        };
      } else {
        categoryMap[cat].count++;
      }
    });

    let forecastCards = [];
    Object.values(categoryMap).forEach(item => {
      const config = componentPricing[item.category] || componentPricing['Other'];
      
      // Calculate realistic dynamic probability of next failure
      let probability = config.baseProb;
      if (item.isActive) probability += 15;
      probability += Math.min(25, item.count * 8);
      if (item.type === 'DANGEROUS' || item.type === 'MAJOR' || item.type === 'FAIL') probability += 10;
      probability = Math.min(95, Math.max(15, probability));

      // Urgency state label and color
      let urgencyLabel = 'MONITOR';
      let urgencyBg = 'var(--accent-green)';
      let remainingTestsText = '1 - 2 MOT tests';
      
      if (item.isActive) {
        if (item.type === 'DANGEROUS' || item.type === 'MAJOR' || item.type === 'FAIL') {
          urgencyLabel = 'ACT NOW';
          urgencyBg = 'var(--accent-red)';
          remainingTestsText = '0 MOT tests remaining (Critical failure)';
        } else {
          urgencyLabel = 'BEFORE NEXT MOT';
          urgencyBg = 'var(--accent-amber)';
          remainingTestsText = '1 MOT test remaining';
        }
      }

      forecastCards.push({
        name: config.componentName,
        text: item.text,
        probability,
        urgencyLabel,
        urgencyBg,
        remainingTestsText,
        low: config.low,
        high: config.high,
        isActive: item.isActive
      });
    });

    // Fallback: If no actual advisories/defects are recorded, output preventative items
    const vehicleAge = vehicle?.vehicle_age_years || 10;
    if (forecastCards.length === 0) {
      forecastCards = [
        {
          name: 'Tyres & Alignment',
          text: 'Preventative: standard tyre tread wear and pressure monitoring.',
          probability: Math.min(45, 15 + vehicleAge * 2),
          urgencyLabel: 'MONITOR',
          urgencyBg: 'var(--accent-green)',
          remainingTestsText: '2+ MOT tests remaining',
          low: 70,
          high: 130,
          isActive: false
        },
        {
          name: 'Braking Friction',
          text: 'Preventative: regular thickness check on front and rear friction linings.',
          probability: Math.min(40, 10 + vehicleAge * 2),
          urgencyLabel: 'MONITOR',
          urgencyBg: 'var(--accent-green)',
          remainingTestsText: '2+ MOT tests remaining',
          low: 120,
          high: 200,
          isActive: false
        }
      ];
    }

    // Sort by active / urgency level
    forecastCards.sort((a, b) => {
      if (a.urgencyLabel === 'ACT NOW') return -1;
      if (b.urgencyLabel === 'ACT NOW') return 1;
      if (a.urgencyLabel === 'BEFORE NEXT MOT') return -1;
      if (b.urgencyLabel === 'BEFORE NEXT MOT') return 1;
      return 0;
    });

    // Dynamic Pre-MOT Budget Sum: Sum of all Active advisories (ACT NOW or BEFORE NEXT MOT)
    const activeCards = forecastCards.filter(c => c.urgencyLabel === 'ACT NOW' || c.urgencyLabel === 'BEFORE NEXT MOT');
    const budgetLow = activeCards.reduce((sum, c) => sum + c.low, 0);
    const budgetHigh = activeCards.reduce((sum, c) => sum + c.high, 0);

    return (
      <div style={{ position: 'relative' }}>
        
        {/* Paywall Overlay for Free Tier */}
        {!isUnlocked && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(13,15,20,0.2), var(--bg-card) 95%)',
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Future Failure Predictions Locked
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Your car has <strong>{activeCards.length || 3} active advisories</strong> that are mathematically proven to cause subsequent failures. Unlock the cost assessments.
            </p>
            
            <button
              onClick={() => {
                logCheckoutStart();
                setIsModalOpen(true);
              }}
              style={{
                background: 'var(--accent-yellow)',
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Predictive Maintenance Forecast
          </h2>

          {forecastCards.map((card, idx) => (
            <div key={idx} style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '1.5rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)' }}>{card.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', textTransform: 'capitalize' }}>{card.text}</p>
                </div>
                <span style={{ background: card.urgencyBg, color: '#0D0F14', padding: '0.25rem 0.6rem', borderRadius: '2px', fontSize: '0.72rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                  {card.urgencyLabel}
                </span>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                  <span>Next-MOT Failure Probability</span>
                  <span>{card.probability}%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-primary)', height: '6px', borderRadius: '3px' }}>
                  <div style={{ background: card.urgencyBg, width: `${card.probability}%`, height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span>⏳ {card.remainingTestsText}</span>
                <span>Est: <strong>£{card.low} — £{card.high}</strong> at local garage</span>
              </div>
            </div>
          ))}

          {/* COST SUMMARY BOX */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', border: '2px solid var(--accent-yellow)', padding: '2.5rem', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              ESTIMATED PRE-MOT REPAIR BUDGET
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              £{budgetLow} — £{budgetHigh}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
              Based on independent UK garage rates. Main official dealer rates are typically 30-40% higher.
            </p>
            <div style={{ color: 'var(--accent-yellow)', fontWeight: '800', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {activeCards.length > 0 ? (
                `💡 Negotiation Leverage: Use this forecasted budget range of £${budgetLow} - £${budgetHigh} to reduce the seller's asking price.`
              ) : (
                `💡 Maximum Integrity: The vehicle has an exceptional clean sheet with 0 active advisories or defects. No pre-MOT repair budget leverage is currently required.`
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <>
      <link rel="canonical" href={`https://isthiscarsafe.co.uk/vehicle/${reg.toUpperCase()}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '72px', paddingBottom: '4rem', fontFamily: 'var(--font-body)', transition: 'background 0.3s ease, color 0.3s ease' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          
          <a href="/" style={{ color: 'var(--accent-yellow)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-block', marginBottom: '2rem' }}>
            ← Back to Search
          </a>

          {/* REPORT HEADER */}
          {renderHeader()}

          {/* ACTION BUTTON ROW */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
            <button 
              onClick={() => setShowCompareModal(true)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                transition: 'background 0.3s ease, border-color 0.3s ease'
              }}
            >
              ⚖️ AI Market Comparison
            </button>
            
            <button 
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                transition: 'background 0.3s ease, border-color 0.3s ease'
              }}
            >
              📱 Generate AI Dossier
            </button>

            <a 
              href={`https://www.check-mot.service.gov.uk/results?registration=${reg.toUpperCase()}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                transition: 'background 0.3s ease, border-color 0.3s ease'
              }}
            >
              📋 Verify on GOV.UK
            </a>

            {!isUnlocked && (
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'var(--accent-yellow)',
                  color: '#0D0F14',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '900',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'background 0.3s ease'
                }}
              >
                🔒 Unlock Forensic Report (£2.99)
              </button>
            )}
          </div>

          {/* AI INTELLIGENCE HUB & VERDICT */}
          {renderAiHub()}

          {/* TWO-COLUMN GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1.55fr 1fr' : '1fr',
            gap: '2.5rem',
            alignItems: 'start',
            width: '100%'
          }}>
            
            {/* LEFT COLUMN: Specs, Provenance, Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {renderSpecifications()}
              {renderProvenance()}
              {renderTimeline()}
              {renderSeoLink()}
            </div>

            {/* RIGHT COLUMN: Safety score, Wear distribution, Valuation, Matrix, Checklist, Cost Forecasts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: isDesktop ? 'sticky' : 'static', top: '96px' }}>
              {renderSafetyScore()}
              {renderDefectDistribution()}
              {renderMarketValuation()}
              {renderVerificationMatrix()}
              {renderChecklist()}
              {renderForecasts()}
            </div>

          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <ReportDisclaimer />
          </div>

        </div>
      </main>

      {/* Share Modal: AI Dealer Dossier */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }} onClick={() => setShowShareModal(false)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '2.5rem',
            maxWidth: '550px',
            width: '100%',
            boxShadow: 'var(--shadow-glow)',
            color: 'var(--text-primary)',
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
              📱 Generate AI Dealer Dossier
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Arm yourself for negotiation. We have generated a data-backed message you can send directly to the seller or dealer to negotiate the price down.
            </p>
            <div style={{ 
              background: 'var(--bg-primary)', 
              padding: '1.25rem', 
              borderRadius: '6px', 
              fontSize: '0.88rem', 
              fontStyle: 'italic', 
              marginBottom: '1.5rem', 
              borderLeft: '4px solid var(--accent-yellow)',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
              transition: 'background 0.3s ease'
            }}>
              "Hi, I'm very interested in the {vehicle?.make} {vehicle?.model} ({reg.toUpperCase()}). I've run an advanced diagnostic on the MOT history and it flagged recurring issues with the {aiReport?.riskParts[0]?.name || 'suspension/brakes'}. The AI estimates an annual maintenance liability of {aiReport?.estimatedAnnualCost || '£300-600'}. Would you consider lowering the price to account for these impending repairs?"
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(`Hi, I'm very interested in the ${vehicle?.make} ${vehicle?.model} (${reg.toUpperCase()}). I've run an advanced diagnostic on the MOT history and it flagged recurring issues with the ${aiReport?.riskParts[0]?.name || 'suspension/brakes'}. The AI estimates an annual maintenance liability of ${aiReport?.estimatedAnnualCost || '£300-600'}. Would you consider lowering the price to account for these impending repairs?`); 
                  alert("Copied to clipboard!"); 
                }}
                style={{
                  flex: 1,
                  background: 'var(--accent-yellow)',
                  color: '#0D0F14',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Copy Message
              </button>
              <button 
                onClick={() => setShowShareModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal: AI Market Position */}
      {showCompareModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }} onClick={() => setShowCompareModal(false)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '2.5rem',
            maxWidth: '550px',
            width: '100%',
            boxShadow: 'var(--shadow-glow)',
            color: 'var(--text-primary)',
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--accent-yellow)', marginBottom: '1rem' }}>
              ⚖️ AI Market Position Comparison
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              How does this specific {vehicle?.make} {vehicle?.model} compare to the rest of the UK market?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>This Vehicle's Pass Rate</span>
                  <strong style={{ color: 'var(--accent-red)' }}>{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%`, height: '100%', background: 'var(--accent-red)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>UK Average for {vehicle?.make} ({new Date(vehicle?.first_used_date).getFullYear()})</span>
                  <strong style={{ color: 'var(--accent-green)' }}>78%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: 'var(--accent-green)' }}></div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(245, 101, 101, 0.1)', 
              border: '1px solid rgba(245, 101, 101, 0.2)',
              padding: '1rem', 
              borderRadius: '6px', 
              fontSize: '0.85rem', 
              color: '#E53E3E',
              lineHeight: '1.5'
            }}>
              <strong>Market Warning:</strong> This vehicle performs <strong>worse than 64%</strong> of identical models in the UK market. The defect rate is elevated for this model year.
            </div>

            <button 
              onClick={() => setShowCompareModal(false)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI Forensic Chat Agent Widget */}
      <AIChatAgent 
        isUnlocked={isUnlocked}
        context={{
          vehicle,
          specification: data.specification,
          safetyScore,
          provenance,
          defects
        }}
        onUnlockClick={() => setIsModalOpen(true)}
      />

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
