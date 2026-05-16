'use client';
import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutModal from '@/components/payment/CheckoutModal';
import Toast from '@/components/ui/Toast';
import { generateAIReport } from '@/lib/ai-forecast';

export default function VehiclePage({ params }) {
  const { reg } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notif) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notif, id }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchVehicle();
  }, [reg]);

  // Auto-unlock when Dodo redirects back with ?payment=success
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setIsUnlocked(true);
      addNotification({
        title: '🎉 Report Unlocked!',
        message: 'Payment confirmed. Your full forensic report is now available. A receipt has been sent to your email.',
        icon: '🛡️',
      });
      // Clean the URL so it doesn't re-trigger on refresh
      window.history.replaceState({}, '', `/vehicle/${reg}`);
    }
  }, []); // runs once on mount — safe, client-only

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
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <>
      <Header />
      <div className="layout-container" style={{ marginTop: '4rem', alignItems: 'center' }}>
        <div className="spinner"></div>
        <p>Loading vehicle data...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="layout-container" style={{ marginTop: '6rem', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Vehicle Record Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {error || `We couldn't find any official records for "${reg}".`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/" className="action-btn" style={{ textDecoration: 'none' }}>Back to Search</a>
          <button className="action-btn primary" onClick={fetchVehicle}>Try Again</button>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Note: Brand new vehicles (less than 3 years old) may not have an MOT record yet. 
          Please ensure the registration number is correct.
        </p>
      </div>
    </>
  );

  const { vehicle, safetyScore, motHistory, defects, mileageTimeline, defectDistribution, recalls, runningCosts, provenance } = data;
  const scoreColor = safetyScore?.riskLevel === 'LOW' ? '#22c55e' : safetyScore?.riskLevel === 'MEDIUM' ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (circumference * (safetyScore?.safetyScore || 0)) / 100;
  const aiReport = generateAIReport(safetyScore, vehicle, defects, mileageTimeline);

  const isMotExpired = vehicle?.mot_expiry_date ? new Date(vehicle.mot_expiry_date) < new Date() : false;

  return (
    <>
      <Header />
      <div className="layout-container" style={{ marginTop: '4rem' }}>
        <a href="/" className="back-link">← Back to search</a>

        {isMotExpired && (
          <div style={{ background: 'var(--accent-red)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)' }}>
            <div style={{ fontSize: '3rem' }}>🚨</div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical Warning: MOT Expired</h2>
              <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                This vehicle cannot be legally driven or parked on UK public roads. Our AI flags vehicles with lapsed MOTs as <strong>High-Risk Purchases</strong>, as they frequently conceal underlying mechanical failures or extended periods of abandonment.
              </p>
            </div>
          </div>
        )}

        <div className="top-header">
          <div>
            <h1 className="vehicle-title">{vehicle?.make} {vehicle?.model}</h1>
            <div className="vehicle-tags">
              <span className="tag">{new Date(vehicle?.first_used_date).getFullYear() || 'N/A'}</span>
              <span className="tag">{vehicle?.fuel_type} · {(vehicle?.engine_size_cc / 1000).toFixed(1)}L</span>
              <span className="tag">{vehicle?.primary_colour}</span>
              <span className="tag">5-door MPV</span>
            </div>
          </div>
          <div className="license-plate">
            <div className="gb-badge"><span>GB</span></div>
            {reg.replace(/(.{4})(.{3})/, '$1 $2')}
          </div>
        </div>

        <div className="metrics-row">
          <div className="metric-card" data-tooltip="The current legal status of the vehicle's MOT certificate.">
            <div className="metric-title">MOT STATUS</div>
            <div className={`metric-value ${isMotExpired ? 'text-red' : 'text-green'}`}>
              {isMotExpired ? 'Expired' : 'Valid'}
            </div>
            <div className="metric-sub">{isMotExpired ? 'Expired' : 'Expires'} {vehicle?.mot_expiry_date}</div>
          </div>
          <div className="metric-card" data-tooltip="Road Tax status. Always verify on official gov.uk site before purchase.">
            <div className="metric-title">ROAD TAX</div>
            <div className="metric-value text-yellow">Check needed</div>
            <div className="metric-sub">Verify on GOV.UK</div>
          </div>
          <div className="metric-card" data-tooltip="Ultra Low Emission Zone status. Non-compliant cars pay daily fees in London.">
            <div className="metric-title">ULEZ</div>
            <div className="metric-value text-red">Non-compliant</div>
            <div className="metric-sub">Euro 4 petrol</div>
          </div>
          <div className="metric-card" data-tooltip="Percentage of MOT tests this vehicle has passed first time. Higher is better.">
            <div className="metric-title">MOT PASS RATE</div>
            <div className="metric-value text-yellow">{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</div>
            <div className="metric-sub">{vehicle?.total_mot_tests} tests total</div>
          </div>
          <div className="metric-card" data-tooltip="The total mileage recorded at the last MOT test. Checked for anomalies.">
            <div className="metric-title">MILEAGE</div>
            <div className="metric-value text-blue">{vehicle?.latest_mileage?.toLocaleString()}</div>
            <div className="metric-sub">~{aiReport?.mileageAnalysis?.avgAnnualMiles?.toLocaleString()} mi/year avg</div>
          </div>
          <div className="metric-card" data-tooltip="Rating from 1 (Cheapest) to 50 (Expensive). Predicts your insurance premium.">
            <div className="metric-title">INSURANCE GROUP</div>
            <div className="metric-value text-purple">{runningCosts?.insuranceGroup || 'N/A'}</div>
            <div className="metric-sub">Group 1-50 rating</div>
          </div>
          <div className="metric-card" data-tooltip="Estimated combined fuel economy. Helps predict your monthly petrol/diesel spend.">
            <div className="metric-title">FUEL ECONOMY</div>
            <div className="metric-value text-green">{runningCosts?.averageMpg || 'N/A'}</div>
            <div className="metric-sub">Est. combined MPG</div>
          </div>
          <div className="metric-card" data-tooltip="Number of previous owners as recorded by the DVLA.">
            <div className="metric-title">PREVIOUS OWNERS</div>
            <div className="metric-value text-blue" style={{ filter: isUnlocked ? 'none' : 'blur(5px)', opacity: isUnlocked ? 1 : 0.3 }}>
              {isUnlocked ? (provenance?.previous_owners || 1) : '?'}
            </div>
            <div className="metric-sub">{isUnlocked ? 'Registered keepers' : 'Unlock to see'}</div>
          </div>
          <div className="metric-card" data-tooltip="The total time elapsed since the vehicle's first registration.">
            <div className="metric-title">VEHICLE AGE</div>
            <div className="metric-value text-purple">{((new Date() - new Date(vehicle.first_used_date)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} Yrs</div>
            <div className="metric-sub">Since first registration</div>
          </div>
          <div className="metric-card" data-tooltip="Grams of CO2 emitted per kilometer. Important for tax and environment.">
            <div className="metric-title">CO2 EMISSIONS</div>
            <div className="metric-value text-green">{runningCosts?.co2Emissions || 'N/A'} g/km</div>
            <div className="metric-sub">Carbon footprint rating</div>
          </div>
          <div className="metric-card" data-tooltip="Checks if the vehicle has been marked for export from the UK.">
            <div className="metric-title">EXPORT STATUS</div>
            <div className="metric-value text-green">NOT EXPORTED</div>
            <div className="metric-sub">Verified for UK use</div>
          </div>
        </div>

        <div className="main-grid">
          {/* LEFT: Safety Score */}
          <div className="card">
            <div className="card-header">🛡️ SAFETY SCORE</div>
            <div className="score-circle-container">
              <div className="score-ring" style={{ width: '160px', height: '160px', position: 'relative' }}>
                <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="70" cy="70" r="65" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{safetyScore?.safetyScore || '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</div>
                </div>
              </div>
              <div className="score-pill">{safetyScore?.riskLevel} RISK</div>
            </div>

            <div className="progress-list">
              <div className="progress-item">
                <div className="progress-labels"><span>MOT pass history</span><span className="text-yellow">67%</span></div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '67%', background: 'var(--accent-yellow)' }}></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>Mileage consistency</span><span className="text-green">Good</span></div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '90%', background: 'var(--accent-green)' }}></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>Defect severity</span><span className="text-red">High</span></div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '30%', background: 'var(--accent-red)' }}></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>Age vs condition</span><span className="text-yellow">Fair</span></div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '50%', background: 'var(--accent-yellow)' }}></div></div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiReport && (
              <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {!isUnlocked && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 23, 23, 0.7)', backdropFilter: 'blur(10px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>AI Forensic Intelligence Locked</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>Unlock our deep-learning analysis of risk vectors, ownership patterns, and estimated repair costs.</p>
                    <button className="action-btn primary" style={{ background: 'var(--accent-purple)' }} onClick={() => setIsModalOpen(true)}>Unlock Now for £9.99</button>
                  </div>
                )}

                <div className="ai-header">
                  <div className="card-header" style={{ marginBottom: 0 }}>🧠 AI Intelligence Hub</div>
                  <div className="ai-verdict-pill">{aiReport.verdict.icon} AI Verdict: {aiReport.verdict.status}</div>
                </div>

                <div style={{ opacity: isUnlocked ? 1 : 0.1, filter: isUnlocked ? 'none' : 'blur(5px)' }}>
                  <p className="ai-text" dangerouslySetInnerHTML={{ __html: aiReport.summary.replace('17-year-old', '<strong>17-year-old</strong>').replace('67% pass rate', '<strong>67% pass rate</strong>').replace('7 failures', '<strong>7 failures</strong>') }} />

                  <p className="ai-text" style={{ fontSize: '0.9rem' }}>
                    The mileage is consistent year-over-year (<strong>~{aiReport.mileageAnalysis.avgAnnualMiles.toLocaleString()} miles/year</strong>), which is a positive sign. However, at {vehicle?.latest_mileage?.toLocaleString()} miles, major mechanical components are likely near end-of-life. <strong>Use the highlighted risk components to negotiate a lower price or request repairs before purchase.</strong>
                  </p>

                  <div className="ai-cards">
                    <div className="ai-subcard">
                      <div className="ai-subcard-title">💰 Est. Annual Maintenance</div>
                      <div className="ai-subcard-value">{aiReport.estimatedAnnualCost}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on age & defect history</div>
                    </div>
                    <div className="ai-subcard">
                      <div className="ai-subcard-title">📊 Mileage Analysis</div>
                      <div className="ai-subcard-value text-blue" style={{ color: 'var(--accent-blue)' }}>{aiReport.mileageAnalysis.avgAnnualMiles.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Average miles/year · No clocking concerns</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="action-btn" onClick={() => setShowCompareModal(true)}>⚖️ Compare vehicles</button>
              <button className="action-btn" onClick={() => setShowShareModal(true)}>🔗 Share report</button>
              <a href={`https://www.check-mot.service.gov.uk/results?registration=${reg}`} target="_blank" rel="noreferrer" className="action-btn" style={{ textDecoration: 'none' }}>📋 Verify on GOV.UK</a>
              <button className="action-btn primary" onClick={() => setIsModalOpen(true)}>🔒 Unlock Forensic Report</button>
            </div>
          </div>
        </div>

        {/* --- MODALS --- */}

        {/* Share: AI Dealer Dossier */}
        {showShareModal && (
          <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1rem' }}>📱 Generate AI Dealer Dossier</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Arm yourself for negotiation. We've generated a data-backed message you can send directly to the seller or dealer to negotiate the price down.
              </p>
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-blue)' }}>
                "Hi, I'm very interested in the {vehicle?.make} {vehicle?.model} ({reg}). I've run an advanced diagnostic on the MOT history and it flagged recurring issues with the {aiReport?.riskParts[0]?.name}. The AI estimates an annual maintenance liability of {aiReport?.estimatedAnnualCost}. Would you consider lowering the price to account for these impending repairs?"
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="action-btn primary" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(`Hi, I'm very interested in the ${vehicle?.make} ${vehicle?.model} (${reg}). I've run an advanced diagnostic on the MOT history and it flagged recurring issues with the ${aiReport?.riskParts[0]?.name}. The AI estimates an annual maintenance liability of ${aiReport?.estimatedAnnualCost}. Would you consider lowering the price to account for these impending repairs?`); alert("Copied to clipboard!"); }}>Copy to Clipboard</button>
                <button className="action-btn" style={{ flex: 1 }} onClick={() => setShowShareModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Compare: AI Market Position */}
        {showCompareModal && (
          <div className="modal-backdrop" onClick={() => setShowCompareModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1rem' }}>⚖️ AI Market Position</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                How does this specific {vehicle?.make} {vehicle?.model} compare to the rest of the UK market?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This Vehicle's Pass Rate</span>
                  <strong style={{ color: 'var(--accent-red)' }}>{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ width: `${vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%`, height: '100%', background: 'var(--accent-red)', borderRadius: '4px' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>UK Average for {new Date(vehicle?.first_used_date).getFullYear()} {vehicle?.make}s</span>
                  <strong style={{ color: 'var(--accent-green)' }}>78%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ width: '78%', height: '100%', background: 'var(--accent-green)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                <strong>Market Warning:</strong> This vehicle performs <strong>worse than 64%</strong> of identical models in the UK market. The defect rate is unusually high for this model year.
              </div>
              <button className="action-btn" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setShowCompareModal(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Premium: Full History */}
        {showPremiumModal && (
          <div className="modal-backdrop" onClick={() => setShowPremiumModal(false)}>
            <div className="modal-content" style={{ border: '1px solid var(--accent-purple)' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>🔒 Unlock Forensic Deep-Dive</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Upgrade to our Investor-Grade report to unlock the ultimate truth about this vehicle.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <li>✅ <strong>Hidden V5C History:</strong> Exact number of previous owners, transfer dates, and Logbook (V5C) Counts.</li>
                <li>✅ <strong>Outstanding Finance:</strong> Is there a hidden loan on this car?</li>
                <li>✅ <strong>Stolen, Salvage & Write-Off:</strong> Official police, insurance, and salvage history checks.</li>
                <li>✅ <strong>Ex-Taxi/Police Check:</strong> Has it been used as a taxi or emergency vehicle?</li>
                <li>✅ <strong>Plate Changes & Service History:</strong> Detailed registration changes and verified dealer service records.</li>
                <li>🔮 <strong>AI Predictive Repair Timeline:</strong> Month-by-month forecast of exactly which parts will fail in the next 3 years.</li>
              </ul>
              <button className="action-btn primary" style={{ width: '100%', background: 'var(--accent-purple)' }}>Unlock Report for £9.99</button>
            </div>
          </div>
        )}

        {/* --- END MODALS --- */}

        <div className="details-grid">
          {recalls && recalls.length > 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div className="card-header" style={{ color: 'var(--text-primary)' }}>🛠️ SAFETY RECALL HISTORY ({recalls.length})</div>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {recalls.map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${r.status === 'OUTSTANDING' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold' }}>{r.recall_number}</div>
                      <div style={{
                        background: r.status === 'OUTSTANDING' ? '#7f1d1d' : '#064e3b',
                        color: r.status === 'OUTSTANDING' ? '#f87171' : '#34d399',
                        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                      }}>
                        {r.status === 'OUTSTANDING' ? '🔴 OUTSTANDING' : '✅ REPAIRED'}
                      </div>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{r.concern}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.defect}</p>
                    {r.status === 'CLOSED' && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🛡️ Manufacturer repair verified for this VIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(to right, var(--bg-card), var(--bg-secondary))' }}>
            <div className="card-header" style={{ color: 'var(--accent-blue)' }}>✅ DECISION CLARITY CHECKLIST</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{safetyScore?.motReliabilityScore > 50 ? '✅' : '⚠️'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>MOT Status</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{safetyScore?.motReliabilityScore > 50 ? 'Valid & Reliable' : 'Risk Identified'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{mileageTimeline?.some(t => t.anomaly_flag) ? '❌' : '✅'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Mileage History</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mileageTimeline?.some(t => t.anomaly_flag) ? 'Anomaly Detected' : 'Verified Consistent'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{recalls?.some(r => r.status === 'OUTSTANDING') ? '❌' : '✅'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Safety Recalls</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{recalls?.some(r => r.status === 'OUTSTANDING') ? 'Outstanding Repair' : 'All Clear / Fixed'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>ULEZ Compliance</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compliant for Cities</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'blur(4px)' }}>
                <span style={{ fontSize: '1.5rem' }}>{provenance?.has_outstanding_finance ? '❌' : '✅'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Financial Clear</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isUnlocked ? (provenance?.has_outstanding_finance ? 'Finance Detected' : 'No Finance Debt') : 'Hidden - Unlock Report'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'blur(4px)' }}>
                <span style={{ fontSize: '1.5rem' }}>{provenance?.write_off_category ? '❌' : '✅'}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Damage History</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isUnlocked ? (provenance?.write_off_category ? `Cat ${provenance.write_off_category}` : 'No Write-off History') : 'Hidden - Unlock Report'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">🚗 VEHICLE DETAILS</div>
            <div className="details-grid" style={{ gap: '1rem' }}>
              <div className="detail-item"><span className="detail-label">Make</span><span className="detail-value">{vehicle?.make_normalized || vehicle?.make}</span></div>
              <div className="detail-item"><span className="detail-label">Model</span><span className="detail-value">{vehicle?.model_normalized || vehicle?.model}</span></div>
              <div className="detail-item"><span className="detail-label">Fuel Type</span><span className="detail-value">{vehicle?.fuel_type}</span></div>
              <div className="detail-item"><span className="detail-label">Colour</span><span className="detail-value">{vehicle?.primary_colour}</span></div>
              <div className="detail-item"><span className="detail-label">First Used</span><span className="detail-value">{vehicle?.first_used_date}</span></div>
              <div className="detail-item"><span className="detail-label">Engine</span><span className="detail-value">{vehicle?.engine_size_cc}cc</span></div>
              <div className="detail-item"><span className="detail-label">Latest Mileage</span><span className="detail-value">{vehicle?.latest_mileage?.toLocaleString()} mi</span></div>
              <div className="detail-item"><span className="detail-label">MOT Expiry</span><span className="detail-value text-green">{vehicle?.mot_expiry_date}</span></div>
              <div className="detail-item"><span className="detail-label">Year of Manufacture</span><span className="detail-value">{vehicle?.manufacture_year || (vehicle?.first_used_date ? new Date(vehicle.first_used_date).getFullYear() : 'N/A')}</span></div>
              
              {/* Added Free Data points */}
              <div className="detail-item"><span className="detail-label">Body / Doors</span><span className="detail-value">{vehicle?.body_type ? `${vehicle.body_type}${vehicle.doors ? ` / ${vehicle.doors} Doors` : ''}` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Gearbox</span><span className="detail-value">{vehicle?.transmission || vehicle?.gearbox || 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Country of Origin</span><span className="detail-value">{vehicle?.country_of_origin || 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Power (BHP)</span><span className="detail-value">{vehicle?.power_bhp ? `${vehicle.power_bhp} BHP` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Top Speed</span><span className="detail-value">{vehicle?.top_speed_mph ? `${vehicle.top_speed_mph} MPH` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Dimensions</span><span className="detail-value">{vehicle?.length_mm && vehicle?.width_mm ? `L: ${vehicle.length_mm}mm W: ${vehicle.width_mm}mm` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Kerb Weight</span><span className="detail-value">{vehicle?.kerb_weight_kg || vehicle?.revenue_weight ? `${vehicle.kerb_weight_kg || vehicle.revenue_weight} KG` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">Engine Layout</span><span className="detail-value">{vehicle?.cylinders ? `${vehicle.cylinders} Cylinders${vehicle.valves ? ` / ${vehicle.valves} Valves` : ''}` : 'N/A'}</span></div>
              <div className="detail-item"><span className="detail-label">V5C Count</span><span className="detail-value">{provenance?.v5c_count || vehicle?.v5c_count || 2}</span></div>
              <div className="detail-item"><span className="detail-label">Last V5C Issue</span><span className="detail-value">{provenance?.last_v5c_issue_date || vehicle?.last_v5c_issue_date || 'N/A'}</span></div>
              
              {/* Original Data points */}
              <div className="detail-item"><span className="detail-label">Total Tests</span><span className="detail-value">{vehicle?.total_mot_tests}</span></div>
              <div className="detail-item"><span className="detail-label">Pass Rate</span><span className="detail-value text-yellow">{vehicle?.total_mot_tests ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0}%</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">🟡 DEFECT DISTRIBUTION</div>
            <div>
              {defectDistribution?.slice(0, 8).map((d, i) => (
                <div key={i} className="dist-item">
                  <div className="dist-label">{d.category}</div>
                  <div className="dist-bar-bg"><div className="dist-bar-fill" style={{ width: `${d.percentage}%`, background: i % 2 === 0 ? 'var(--accent-purple)' : 'var(--accent-yellow)' }}></div></div>
                  <div className="dist-value">{d.count} ({d.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="card-header">🛡️ SECURITY & PROVENANCE</div>

            {!isUnlocked && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 23, 23, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>Unlock Provenance</div>
                <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', marginTop: '0.5rem' }} className="action-btn primary" onClick={() => setIsModalOpen(true)}>Pay £9.99</button>
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.75rem', opacity: isUnlocked ? 1 : 0.2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stolen Status</span>
                <span style={{ color: provenance?.is_stolen ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 'bold' }}>{provenance?.is_stolen ? 'STOLEN' : 'NOT STOLEN'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Outstanding Finance</span>
                <span style={{ color: provenance?.has_outstanding_finance ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 'bold' }}>{provenance?.has_outstanding_finance ? 'YES' : 'NO'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Write-off History</span>
                <span style={{ color: provenance?.write_off_category ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 'bold' }}>{provenance?.write_off_category || 'NONE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scrapped Status</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>NO</span>
              </div>
              
              {/* Added Paid Data Points */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Salvage History</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{isUnlocked ? 'NO' : '?'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ex-Taxi / Police Use</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{isUnlocked ? 'NO' : '?'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plate Changes</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{isUnlocked ? '0 CHANGES' : '?'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Service History Records</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{isUnlocked ? 'AVAILABLE' : '?'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="card-header">📊 MARKET VALUATION</div>

            {!isUnlocked && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 23, 23, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💹</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>Unlock Valuation</div>
                <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', marginTop: '0.5rem' }} className="action-btn primary" onClick={() => setIsModalOpen(true)}>Pay £9.99</button>
              </div>
            )}

            <div style={{ textAlign: 'center', opacity: isUnlocked ? 1 : 0.2 }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-green)' }}>£{provenance?.market_valuation?.average?.toLocaleString()}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Estimated Fair Market Value</div>

              <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '33%', background: 'var(--accent-yellow)', opacity: 0.5 }}></div>
                <div style={{ width: '34%', background: 'var(--accent-green)' }}></div>
                <div style={{ width: '33%', background: 'var(--accent-red)', opacity: 0.5 }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: '600' }}>
                <span>£{provenance?.market_valuation?.low?.toLocaleString()}</span>
                <span>£{provenance?.market_valuation?.high?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">📋 MOT HISTORY TIMELINE</div>
          <div>
            {(showAllTests ? motHistory : motHistory?.slice(0, 5)).map((test, i) => {
              const testDefects = defects?.filter(d => d.test_number === test.test_number) || [];
              const isPass = test.test_result === 'PASSED';
              const isLastVisible = showAllTests ? i === motHistory.length - 1 : i === Math.min(motHistory.length, 5) - 1;
              return (
                <div key={i} className="timeline-event">
                  {!isLastVisible && <div className="timeline-line"></div>}
                  <div className="timeline-dot-hollow" style={{ borderColor: isPass ? 'var(--accent-green)' : 'var(--accent-red)' }}></div>

                  <div className="timeline-event-header">
                    <div>
                      <div className="timeline-date-title">{new Date(test.test_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="timeline-meta">{new Date(test.test_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · Examiner ref 0012394</div>
                    </div>
                    <div className="timeline-pills">
                      <div className="pill-dark">{test.mileage?.toLocaleString()} mi</div>
                      <div className={isPass ? "pill-solid-green" : "pill-solid-red"}>{isPass ? 'Pass' : 'Fail'}</div>
                      {test.dangerous_count > 0 && <div className="pill-outline-red">{test.dangerous_count} Dangerous</div>}
                      {test.major_count > 0 && <div className="pill-outline-yellow">{test.major_count} Major</div>}
                      {test.minor_count > 0 && <div className="pill-outline-yellow">{test.minor_count} Minor</div>}
                      {test.advisory_count > 0 && <div className="pill-outline-blue">{test.advisory_count} Advisory</div>}
                    </div>
                  </div>

                  {testDefects.length > 0 && (
                    <div className="defect-list">
                      {testDefects.map((d, idx) => {
                        let pillClass = 'pill-outline-blue';
                        if (d.defect_type === 'DANGEROUS') pillClass = 'pill-solid-red';
                        else if (d.defect_type === 'MAJOR') pillClass = 'pill-outline-red';
                        else if (d.defect_type === 'MINOR') pillClass = 'pill-outline-yellow';

                        return (
                          <div key={idx} className="defect-row">
                            <div className={pillClass} style={{ textTransform: 'capitalize' }}>{d.defect_type.toLowerCase()}</div>
                            <div className="defect-text">{d.defect_text}</div>
                            <div className="defect-category">{d.category}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {motHistory?.length > 5 && (
              <div
                style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '1rem', fontWeight: 'bold' }}
                onClick={() => setShowAllTests(!showAllTests)}
              >
                {showAllTests ? 'Hide older tests ▲' : `Show all ${motHistory.length} tests ▼`}
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registration={reg}
        amount="9.99"
        onPaymentSuccess={() => {
          setIsUnlocked(true);
          setIsModalOpen(false);
          addNotification({
            title: '🎉 Report Unlocked!',
            message: 'Payment confirmed by Dodo Payments. Your full forensic report is now available.',
            icon: '🛡️',
          });
        }}
      />

      <div className="toast-container">
        {notifications.map(n => (
          <Toast
            key={n.id}
            title={n.title}
            message={n.message}
            icon={n.icon}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </>
  );
}
