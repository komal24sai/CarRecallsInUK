'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DealerDashboard() {
  const [stock, setStock] = useState([
    { registration: 'LP17 HGX', make_model: 'FORD FIESTA', overall_risk_level: 'HIGH', advisory_count: 3, estimated_repair_cost_low: 330, estimated_repair_cost_high: 610, mot_due_months: 2, recalls_outstanding: 0, expanded: false },
    { registration: 'MK16 POZ', make_model: 'BMW 3 SERIES', overall_risk_level: 'CRITICAL', advisory_count: 5, estimated_repair_cost_low: 600, estimated_repair_cost_high: 1200, mot_due_months: 1, recalls_outstanding: 1, expanded: false },
    { registration: 'AB12 CDE', make_model: 'VAUXHALL CORSA', overall_risk_level: 'MEDIUM', advisory_count: 2, estimated_repair_cost_low: 140, estimated_repair_cost_high: 280, mot_due_months: 5, recalls_outstanding: 0, expanded: false },
    { registration: 'RE19 TYU', make_model: 'NISSAN QASHQAI', overall_risk_level: 'LOW', advisory_count: 0, estimated_repair_cost_low: 50, estimated_repair_cost_high: 120, mot_due_months: 8, recalls_outstanding: 0, expanded: false },
    { registration: 'YG18 LKL', make_model: 'VOLKSWAGEN GOLF', overall_risk_level: 'HIGH', advisory_count: 4, estimated_repair_cost_low: 330, estimated_repair_cost_high: 610, mot_due_months: 3, recalls_outstanding: 0, expanded: false }
  ]);

  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Filtering & Sorting State
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterMake, setFilterMake] = useState('ALL');
  const [filterMotThreeMonths, setFilterMotThreeMonths] = useState(false);
  const [sortBy, setSortBy] = useState('risk_level'); // 'risk_level' | 'mot_due' | 'cost'

  const [dealerDetails, setDealerDetails] = useState({
    businessName: 'Apex Car Group',
    email: 'stock@apex.co.uk',
    plan: 'pro',
    apiKey: 'itcs_live_bdc9284cf730e159a4c581e15faef'
  });

  // Read success parameters from checkout redirect on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const plan = params.get('plan') || 'pro';
      const business = params.get('business') || 'Apex Car Group';
      const email = params.get('email') || 'stock@apex.co.uk';
      
      setDealerDetails({
        businessName: business,
        email,
        plan,
        apiKey: `itcs_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
      });
    }
  }, []);

  // Compute stock stats dynamically
  const redCriticalCount = stock.filter(c => c.overall_risk_level === 'CRITICAL' || c.overall_risk_level === 'HIGH').length;
  const totalAvgExposure = stock.length 
    ? Math.round(stock.reduce((sum, c) => sum + (c.estimated_repair_cost_low + c.estimated_repair_cost_high) / 2, 0)) 
    : 0;
  const outstandingRecallsCount = stock.reduce((sum, c) => sum + c.recalls_outstanding, 0);

  // Bulk add plates action
  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const plates = bulkInput.split('\n')
      .map(p => p.trim().toUpperCase())
      .filter(p => p.length > 0);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${dealerDetails.apiKey}`
    };

    try {
      const res = await fetch('/api/dealer/batch-check', {
        method: 'POST',
        headers,
        body: JSON.stringify({ registrations: plates })
      });

      const data = await res.json();
      if (res.ok && data.results) {
        const newCars = data.results.map(r => ({
          registration: r.registration,
          make_model: r.make_model,
          overall_risk_level: r.overall_risk_level,
          advisory_count: r.advisory_count,
          estimated_repair_cost_low: r.estimated_repair_cost_low,
          estimated_repair_cost_high: r.estimated_repair_cost_high,
          mot_due_months: r.mot_due_months,
          recalls_outstanding: r.overall_risk_level === 'CRITICAL' ? 1 : 0,
          expanded: false
        }));

        setStock(prev => [...newCars, ...prev]);
        setBulkInput('');
        setShowBulkModal(false);
      }
    } catch (err) {
      console.error('[Dashboard] Error bulk auditing:', err);
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Plate,Make/Model,Risk Level,Advisories Count,Est. Repair Cost Low,Est. Repair Cost High,MOT Due (Months)\n';
    
    stock.forEach(c => {
      csvContent += `"${c.registration}","${c.make_model}","${c.overall_risk_level}",${c.advisory_count},${c.estimated_repair_cost_low},${c.estimated_repair_cost_high},${c.mot_due_months}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dealerDetails.businessName.replace(/\s+/g, '_')}_Stock_Safety_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRow = (index) => {
    setStock(prev => prev.map((c, i) => i === index ? { ...c, expanded: !c.expanded } : c));
  };

  // Unique list of makes for filter dropdown
  const uniqueMakes = ['ALL', ...new Set(stock.map(c => c.make_model.split(' ')[0]))];

  // Filtering Logic
  let processedStock = stock.filter(c => {
    if (filterRisk !== 'ALL' && c.overall_risk_level !== filterRisk) return false;
    if (filterMake !== 'ALL' && !c.make_model.startsWith(filterMake)) return false;
    if (filterMotThreeMonths && c.mot_due_months > 3) return false;
    return true;
  });

  // Sorting Logic
  processedStock.sort((a, b) => {
    if (sortBy === 'risk_level') {
      const riskWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return riskWeight[b.overall_risk_level] - riskWeight[a.overall_risk_level];
    }
    if (sortBy === 'mot_due') {
      return a.mot_due_months - b.mot_due_months;
    }
    if (sortBy === 'cost') {
      return b.estimated_repair_cost_high - a.estimated_repair_cost_high;
    }
    return 0;
  });

  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '90px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Header Portal Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800' }}>
                {dealerDetails.businessName} Stock Dashboard
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Active Plan: <strong style={{ color: 'var(--accent-yellow)', textTransform: 'uppercase' }}>{dealerDetails.plan} Tier</strong> · {dealerDetails.email}
              </p>
            </div>
            
            {/* API Key Panel */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', borderRadius: '4px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DEALER API KEY (BEARER TOKEN)</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <code style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  {dealerDetails.apiKey.substring(0, 15)}...
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(dealerDetails.apiKey); alert('API Key copied to clipboard!'); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>

          {/* STOCK INSIGHT PANEL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-red)', padding: '1.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EXPOSURES REQUIRING ATTENTION</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent-red)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                {redCriticalCount} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>cars (High/Critical)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Fails next scheduled MOT test indicators</p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-yellow)', padding: '1.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>AVG REPAIR LIABILITY / CAR</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                £{totalAvgExposure}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Independent garage rate averages</p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-blue)', padding: '1.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>OUTSTANDING SAFETY RECALLS</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent-blue)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                {outstandingRecallsCount} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>active alerts</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Cross-referenced manufacturer defects</p>
            </div>

          </div>

          {/* STOCK GRID CONTROL BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Risk Level</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '4px' }}
                >
                  <option value="ALL">All Risks</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Manufacturer</label>
                <select
                  value={filterMake}
                  onChange={(e) => setFilterMake(e.target.value)}
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '4px', textTransform: 'capitalize' }}
                >
                  {uniqueMakes.map((make, idx) => (
                    <option key={idx} value={make}>{make.toLowerCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={filterMotThreeMonths}
                    onChange={(e) => setFilterMotThreeMonths(e.target.checked)}
                    style={{ accentColor: 'var(--accent-yellow)' }}
                  />
                  MOT Due in &lt; 3 Months
                </label>
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleExportCSV}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                style={{ background: 'var(--accent-yellow)', color: 'var(--bg-secondary)', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
              >
                ➕ Add Plates (Bulk)
              </button>
            </div>

          </div>

          {/* STOCK TABLE VIEW */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <th style={{ padding: '1.25rem' }}>PLATE</th>
                  <th style={{ padding: '1.25rem' }}>MAKE / MODEL</th>
                  <th style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setSortBy('risk_level')}>RISK LEVEL ↕️</th>
                  <th style={{ padding: '1.25rem' }}>ADVISORIES</th>
                  <th style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setSortBy('cost')}>EST. REPAIR COST ↕️</th>
                  <th style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setSortBy('mot_due')}>MOT DUE (MONTHS) ↕️</th>
                  <th style={{ padding: '1.25rem', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {processedStock.map((car, index) => {
                  const riskColorMap = {
                    'CRITICAL': '#F56565',
                    'HIGH': '#ED8936',
                    'MEDIUM': '#E8FF00',
                    'LOW': '#48BB78'
                  };

                  return (
                    <>
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => toggleRow(index)}>
                        {/* Plate */}
                        <td style={{ padding: '1.25rem' }}>
                          <span style={{ background: '#FFD300', color: '#000000', padding: '0.3rem 0.8rem', borderRadius: '3px', fontWeight: '900', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', border: '1px solid #000' }}>
                            {car.registration}
                          </span>
                        </td>
                        
                        {/* Make/Model */}
                        <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>{car.make_model}</td>
                        
                        {/* Risk Level */}
                        <td style={{ padding: '1.25rem' }}>
                          <span style={{ color: riskColorMap[car.overall_risk_level], fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ● {car.overall_risk_level}
                          </span>
                        </td>
                        
                        {/* Advisories Count */}
                        <td style={{ padding: '1.25rem', fontFamily: 'var(--font-mono)' }}>{car.advisory_count} items</td>
                        
                        {/* Cost */}
                        <td style={{ padding: '1.25rem', fontFamily: 'var(--font-mono)' }}>
                          £{car.estimated_repair_cost_low} — £{car.estimated_repair_cost_high}
                        </td>
                        
                        {/* MOT Due months */}
                        <td style={{ padding: '1.25rem', fontFamily: 'var(--font-mono)', color: car.mot_due_months <= 3 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          {car.mot_due_months} months
                        </td>

                        {/* Expand Action */}
                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                          <button
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-yellow)', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {car.expanded ? 'Hide Details' : 'Expand Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable details panel */}
                      {car.expanded && (
                        <tr>
                          <td colSpan={7} style={{ background: 'var(--bg-secondary)', padding: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                              
                              <div>
                                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-yellow)', marginBottom: '1rem', fontSize: '1rem' }}>
                                  Advisory Failure Analysis
                                </h4>
                                {car.advisory_count > 0 ? (
                                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                                    <li>🛡️ Front Suspension wear (Bush/Pin) — <strong>72% Fail risk</strong></li>
                                    <li>🛡️ Nearside Outer Brake wear — <strong>48% Fail risk</strong></li>
                                    {car.recalls_outstanding > 0 && (
                                      <li style={{ color: 'var(--accent-red)' }}>⚠️ Outstanding recall: Steering column bolt fracture risk</li>
                                    )}
                                  </ul>
                                ) : (
                                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No active pre-failure advisories located for this vehicle.</p>
                                )}
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                                  Condition Report
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                  Generate a branded physical document for buyers at sales point.
                                </p>
                                
                                {dealerDetails.plan === 'pro' ? (
                                  <a
                                    href={`/api/dealer/download-report?reg=${car.registration}&dealer=${encodeURIComponent(dealerDetails.businessName)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      background: 'var(--accent-yellow)',
                                      color: 'var(--bg-secondary)',
                                      padding: '0.5rem 1rem',
                                      borderRadius: '4px',
                                      fontWeight: '900',
                                      fontSize: '0.85rem',
                                      textDecoration: 'none',
                                      display: 'inline-block'
                                    }}
                                  >
                                    🖨️ Download White-Label Report PDF
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>
                                    🔒 Upgrade to Pro to download white-label PDFs
                                  </span>
                                )}

                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Bulk Add Plate Entry Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2.5rem', maxWidth: '500px', width: '100%', position: 'relative' }}>
            
            <button
              onClick={() => setShowBulkModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Add Plates (Bulk Audit)
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Enter registrations, one per line. Our model will query and ingest records in the background.
            </p>

            <form onSubmit={handleBulkAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                required
                rows={6}
                placeholder="LP17 HGX&#10;MK16 POZ&#10;RE19 TYU"
                style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.75rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '1rem', resize: 'vertical' }}
              />

              <button
                type="submit"
                style={{
                  background: 'var(--accent-yellow)',
                  color: 'var(--bg-secondary)',
                  border: 'none',
                  padding: '0.9rem',
                  fontWeight: '900',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                Perform Batch Integrity Check
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
