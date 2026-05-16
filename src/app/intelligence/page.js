'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Expanded AI Suggestions Database for UK Market
const carDatabase = [
  {
    id: 'fiesta', make: 'Ford', model: 'Fiesta', year: '2015-2018', minBudget: 3000, maxBudget: 8000,
    lifestyle: ['City Commuting', 'First Car'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['Cheap to insure', 'Excellent fuel economy (55 mpg)', 'Fun to drive'],
    emoji: '🚗', color: '#3b82f6', reliability: 78, tax: '£0 - £35',
    aiNote: "The UK's best-selling car for a reason. Parts are cheap and it handles like a go-kart.",
    faults: "Listen for rattling timing belts on the 1.0L EcoBoost engine."
  },
  {
    id: 'yaris', make: 'Toyota', model: 'Yaris Hybrid', year: '2016-2020', minBudget: 6000, maxBudget: 14000,
    lifestyle: ['City Commuting', 'Eco-Friendly'], fuel: 'Hybrid', transmission: 'Auto',
    highlights: ['Bulletproof reliability', 'Congestion charge exempt', '70+ mpg around town'],
    emoji: '🍃', color: '#10b981', reliability: 95, tax: '£0',
    aiNote: "If you hate visiting the mechanic, buy this. The hybrid system is practically indestructible.",
    faults: "Catalytic converters are prone to theft. Ensure it has a protective shield fitted."
  },
  {
    id: 'golf', make: 'Volkswagen', model: 'Golf (Mk7)', year: '2014-2019', minBudget: 5000, maxBudget: 15000,
    lifestyle: ['All-Rounder', 'Family Transport', 'City Commuting'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['Premium interior feel', 'Quiet at motorway speeds', 'Strong resale value'],
    emoji: '🇩🇪', color: '#8b5cf6', reliability: 82, tax: '£30 - £165',
    aiNote: "The classless car. Looks as good parked outside a supermarket as it does outside a luxury hotel.",
    faults: "DSG automatic gearboxes can be jerky if not serviced every 40,000 miles."
  },
  {
    id: 'octavia', make: 'Skoda', model: 'Octavia Estate', year: '2015-2021', minBudget: 6000, maxBudget: 18000,
    lifestyle: ['Family Transport', 'Long Commutes'], fuel: 'Diesel', transmission: 'Manual',
    highlights: ['Massive 610L boot space', 'VW reliability for less money', 'Incredibly practical'],
    emoji: '📦', color: '#ef4444', reliability: 85, tax: '£20 - £165',
    aiNote: "The thinking person's family car. You can fit an entire flat pack kitchen in the back.",
    faults: "Check the DPF (Diesel Particulate Filter) isn't clogged if primarily used for short city trips."
  },
  {
    id: '3series', make: 'BMW', model: '3 Series (F30)', year: '2013-2018', minBudget: 7000, maxBudget: 16000,
    lifestyle: ['Long Commutes', 'Weekend Fun'], fuel: 'Diesel', transmission: 'Auto',
    highlights: ['Rear-wheel drive dynamics', 'Exceptional infotainment', 'Smooth automatic gearboxes'],
    emoji: '🏎️', color: '#3b82f6', reliability: 72, tax: '£30 - £165',
    aiNote: "The ultimate driving machine for the middle manager. The 8-speed auto is best-in-class.",
    faults: "N47 diesel engines (pre-2015) are notorious for timing chain snapping. Check service history carefully."
  },
  {
    id: 'model3', make: 'Tesla', model: 'Model 3', year: '2019-2022', minBudget: 18000, maxBudget: 35000,
    lifestyle: ['Eco-Friendly', 'Tech Enthusiast', 'Long Commutes'], fuel: 'Electric', transmission: 'Auto',
    highlights: ['Access to Supercharger network', 'Autopilot features', '0-60 mph in 4.2s (Long Range)'],
    emoji: '⚡', color: '#10b981', reliability: 88, tax: '£0',
    aiNote: "The iPhone of cars. Incredible tech and charging network make it the easiest EV to live with.",
    faults: "Suspension components wear quickly due to the battery weight. Check for squeaks over bumps."
  },
  {
    id: 'xc90', make: 'Volvo', model: 'XC90', year: '2016-2021', minBudget: 22000, maxBudget: 45000,
    lifestyle: ['Family Transport', 'Luxury'], fuel: 'Hybrid', transmission: 'Auto',
    highlights: ['Class-leading safety features', 'Beautiful minimalist interior', 'Genuine 7-seater'],
    emoji: '🛡️', color: '#8b5cf6', reliability: 80, tax: '£165 - £490',
    aiNote: "The safest place to put your family. The interior feels like a high-end Scandinavian living room.",
    faults: "The complex infotainment screen can freeze, and air suspension compressors can fail."
  },
  {
    id: 'mx5', make: 'Mazda', model: 'MX-5 (ND)', year: '2016-2022', minBudget: 10000, maxBudget: 22000,
    lifestyle: ['Weekend Fun', 'Track Days'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['Perfect 50:50 weight distribution', 'Manual soft top takes 3 seconds', 'Legendary reliability'],
    emoji: '😎', color: '#ef4444', reliability: 92, tax: '£165',
    aiNote: "The answer is always Miata. The most fun you can have at legal speeds without breaking the bank.",
    faults: "Check for rust around the rear arches and ensure the roof drains aren't blocked."
  },
  {
    id: 'cayman', make: 'Porsche', model: 'Cayman (981)', year: '2013-2016', minBudget: 25000, maxBudget: 40000,
    lifestyle: ['Weekend Fun', 'Luxury'], fuel: 'Petrol', transmission: 'Auto',
    highlights: ['Mid-engine handling perfection', 'Glorious flat-six engine note', 'Surprising daily usability'],
    emoji: '🏁', color: '#8b5cf6', reliability: 84, tax: '£330+',
    aiNote: "Often better to drive than a 911. A true modern classic that won't depreciate heavily.",
    faults: "Brake lines can corrode and PDK gearbox replacements are astronomically expensive."
  },
  {
    id: 'sandero', make: 'Dacia', model: 'Sandero', year: '2018-2023', minBudget: 4000, maxBudget: 10000,
    lifestyle: ['First Car', 'Budget Friendly'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['Incredibly cheap to run', 'No-nonsense mechanics', 'Surprisingly spacious'],
    emoji: '🛒', color: '#3b82f6', reliability: 86, tax: '£165',
    aiNote: "Good news! It's the Dacia Sandero. It's honest, cheap transport with zero pretension.",
    faults: "Interior plastics are scratchy and the base models lack basic safety tech."
  }
];

const LIFESTYLES = ['City Commuting', 'Family Transport', 'Long Commutes', 'Weekend Fun', 'Eco-Friendly', 'All-Rounder', 'First Car', 'Budget Friendly', 'Luxury', 'Tech Enthusiast', 'Track Days'];
const FUEL_TYPES = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Any', 'Manual', 'Auto'];

export default function CarIntelligencePage() {
  const [minBudget, setMinBudget] = useState(2000);
  const [maxBudget, setMaxBudget] = useState(15000);
  const [selectedLifestyles, setSelectedLifestyles] = useState(['All-Rounder']);
  const [fuelPref, setFuelPref] = useState('Any');
  const [transPref, setTransPref] = useState('Any');
  
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [comparingIds, setComparingIds] = useState([]);

  // Auto-correct overlapping sliders
  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    setMinBudget(val);
    if (val >= maxBudget) setMaxBudget(val + 1000);
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    setMaxBudget(val);
    if (val <= minBudget) setMinBudget(Math.max(1000, val - 1000));
  };

  const toggleLifestyle = (lifestyle) => {
    if (selectedLifestyles.includes(lifestyle)) {
      if (selectedLifestyles.length > 1) {
        setSelectedLifestyles(selectedLifestyles.filter(l => l !== lifestyle));
      }
    } else {
      if (selectedLifestyles.length < 3) {
        setSelectedLifestyles([...selectedLifestyles, lifestyle]);
      }
    }
  };

  const toggleCompare = (id) => {
    if (comparingIds.includes(id)) {
      setComparingIds(comparingIds.filter(i => i !== id));
    } else {
      if (comparingIds.length < 2) {
        setComparingIds([...comparingIds, id]);
      } else {
        setComparingIds([comparingIds[1], id]);
      }
    }
  };

  const findMatches = () => {
    setIsThinking(true);
    setHasSearched(true);
    setComparingIds([]);
    
    setTimeout(() => {
      let matches = carDatabase.filter(car => {
        const withinBudget = (car.minBudget <= maxBudget && car.maxBudget >= minBudget);
        const lifestyleMatch = car.lifestyle.some(l => selectedLifestyles.includes(l));
        const fuelMatch = fuelPref === 'Any' || car.fuel === fuelPref;
        const transMatch = transPref === 'Any' || car.transmission === transPref;
        return withinBudget && lifestyleMatch && fuelMatch && transMatch;
      });

      matches.sort((a, b) => b.reliability - a.reliability);
      
      if (matches.length === 0) {
        matches = carDatabase
          .filter(car => car.minBudget <= maxBudget && car.maxBudget >= minBudget)
          .sort((a, b) => b.reliability - a.reliability);
      }

      setSuggestions(matches);
      setIsThinking(false);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-header')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 1500);
  };

  const comparedCars = carDatabase.filter(car => comparingIds.includes(car.id));

  return (
    <>
      <Header />
      <main className="layout-container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠 AI Car Matchmaker</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Personalized automotive intelligence. We&apos;ll help you find the most reliable car for your budget range and lifestyle.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Form Section */}
          <div className="info-card" style={{ padding: '2rem', border: '1px solid var(--accent-purple)', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1)' }}>
            
            {/* Budget Range */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
                <span>Budget Range</span>
                <span style={{ color: 'var(--accent-purple)', fontSize: '1.3rem' }}>£{minBudget.toLocaleString()} - £{maxBudget.toLocaleString()}</span>
              </label>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Minimum Target</label>
                  <input 
                    type="range" min="1000" max="49000" step="1000"
                    value={minBudget} onChange={handleMinChange}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Maximum Cap</label>
                  <input 
                    type="range" min="2000" max="50000" step="1000"
                    value={maxBudget} onChange={handleMaxChange}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Hardware Preferences */}
            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1rem' }}>Fuel Type Preference</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {FUEL_TYPES.map(f => (
                    <button 
                      key={f} onClick={() => setFuelPref(f)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid', fontSize: '0.9rem',
                        borderColor: fuelPref === f ? 'var(--accent-blue)' : 'var(--border)',
                        background: fuelPref === f ? 'var(--accent-blue)' : 'transparent',
                        color: fuelPref === f ? 'white' : 'var(--text)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1rem' }}>Transmission Preference</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {TRANSMISSIONS.map(t => (
                    <button 
                      key={t} onClick={() => setTransPref(t)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid', fontSize: '0.9rem',
                        borderColor: transPref === t ? 'var(--accent-blue)' : 'var(--border)',
                        background: transPref === t ? 'var(--accent-blue)' : 'transparent',
                        color: transPref === t ? 'white' : 'var(--text)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1.1rem' }}>Your Lifestyle Profile (Select 1-3)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {LIFESTYLES.map(l => (
                  <button 
                    key={l} onClick={() => toggleLifestyle(l)}
                    style={{
                      padding: '0.6rem 1.2rem', borderRadius: '25px', border: '1px solid',
                      borderColor: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'var(--border)',
                      background: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'transparent',
                      color: selectedLifestyles.includes(l) ? 'white' : 'var(--text)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      fontWeight: selectedLifestyles.includes(l) ? 'bold' : 'normal',
                      boxShadow: selectedLifestyles.includes(l) ? '0 4px 10px rgba(139, 92, 246, 0.3)' : 'none'
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>

            <button 
              className="action-btn primary" 
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', background: 'var(--gradient-accent)', fontWeight: '800', letterSpacing: '0.5px' }}
              onClick={findMatches} disabled={isThinking}
            >
              {isThinking ? '🧠 RUNNING AI SIMULATIONS...' : 'GENERATE MY PERSONALIZED DOSSIER'}
            </button>
          </div>

          {/* Results Header */}
          {hasSearched && !isThinking && (
            <div id="results-header" style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Found {suggestions.length} Strategic Matches</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Based on reliability data, maintenance costs, and your lifestyle profile.</p>
              {suggestions.length > 1 && <p style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginTop: '0.5rem' }}>💡 Select up to 2 cars to compare them side-by-side.</p>}
            </div>
          )}

          {/* Comparing Bar (Floating) */}
          {comparingIds.length > 0 && (
            <div style={{
              position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
              padding: '1rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '2rem',
              zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
              color: 'white', width: 'max-content'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {comparedCars.map(car => (
                  <div key={car.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{car.emoji}</span>
                    <span style={{ fontWeight: 'bold' }}>{car.model}</span>
                    <button onClick={() => toggleCompare(car.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>×</button>
                  </div>
                ))}
                {comparingIds.length === 1 && <div style={{ border: '1px dashed #475569', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>Select 1 more to compare</div>}
              </div>
              {comparingIds.length === 2 && (
                <button 
                  className="action-btn primary" 
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '25px', fontSize: '0.9rem' }}
                  onClick={() => document.getElementById('comparison-modal').scrollIntoView({ behavior: 'smooth' })}
                >Compare Now</button>
              )}
            </div>
          )}

          {/* Results List */}
          {hasSearched && (
            <div style={{ marginTop: '1rem' }}>
              {isThinking ? (
                <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                  <div className="spinner" style={{ width: '60px', height: '60px', borderTopColor: 'var(--accent-purple)', margin: '0 auto 2rem' }}></div>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Aggregating UK market prices and historical fault reports...</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {suggestions.length > 0 ? suggestions.map((car, idx) => (
                    <div key={car.id} className="metric-card" style={{ 
                      display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', 
                      position: 'relative', overflow: 'hidden', border: comparingIds.includes(car.id) ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'default'
                    }}>
                      {/* Background Visual */}
                      <div style={{ position: 'absolute', top: '-20px', right: '-30px', fontSize: '12rem', opacity: 0.04, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
                        {car.emoji}
                      </div>
                      
                      {/* Top Action Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            {idx === 0 && <span style={{ background: '#10b981', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>OPTIMAL MATCH</span>}
                            <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '900' }}>{car.make} {car.model}</h3>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
                            <span style={{ color: car.color, fontWeight: 'bold' }}>{car.year}</span> Model Range • {car.fuel} • {car.transmission}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <button 
                            onClick={() => toggleCompare(car.id)}
                            style={{
                              padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', fontSize: '0.85rem',
                              borderColor: comparingIds.includes(car.id) ? 'var(--accent-blue)' : 'var(--border)',
                              background: comparingIds.includes(car.id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              color: comparingIds.includes(car.id) ? 'var(--accent-blue)' : 'var(--text-secondary)',
                              cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold'
                            }}
                          >
                            {comparingIds.includes(car.id) ? '✓ Added to Compare' : '+ Add to Compare'}
                          </button>
                          <div style={{ textAlign: 'right', background: 'var(--bg-secondary)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Market Price</span>
                            <strong style={{ fontSize: '1.4rem', color: car.color }}>£{car.minBudget.toLocaleString()} - £{car.maxBudget.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>

                      {/* AI Verdict Bubble */}
                      <div style={{ 
                        background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '20px', 
                        borderLeft: `5px solid ${car.color}`, zIndex: 1, position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                         <div style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--bg-secondary)', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Expert Verdict</div>
                        <p style={{ margin: 0, fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text)', lineHeight: '1.6' }}>&quot;{car.aiNote}&quot;</p>
                      </div>

                      {/* Info Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', zIndex: 1 }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', fontSize: '1rem', color: '#10b981' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Why Buy It?
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {car.highlights.map((h, i) => (
                                <span key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                             <strong style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '1rem', color: '#ef4444' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                              The "Reality Check"
                            </strong>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{car.faults}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '15px' }}>
                          <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Forensic Data Insights</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Historical Reliability</span>
                                <strong style={{ color: car.reliability >= 90 ? '#10b981' : car.reliability >= 80 ? '#f59e0b' : '#ef4444' }}>{car.reliability}% Score</strong>
                              </div>
                              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${car.reliability}%`, height: '100%', background: car.reliability >= 90 ? '#10b981' : car.reliability >= 80 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }}></div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Est. Road Tax (Annual)</span>
                              <strong style={{ color: 'var(--text)' }}>{car.tax}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Typical Mileage</span>
                              <strong style={{ color: 'var(--text)' }}>8k - 12k p/a</strong>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )) : (
                    <div className="info-card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--border)' }}>
                      <p style={{ fontSize: '5rem', margin: '0 0 1.5rem 0' }}>🕵️‍♂️</p>
                      <h3 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>No direct matches found</h3>
                      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>Your combination of requirements is very specific. Try expanding your budget range or choosing &apos;Any&apos; for technical preferences.</p>
                      <button className="action-btn primary" style={{ marginTop: '2rem', padding: '0.8rem 2rem' }} onClick={() => { setMinBudget(2000); setMaxBudget(50000); setFuelPref('Any'); setTransPref('Any'); }}>Reset All Filters</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comparison View Section */}
          {comparingIds.length === 2 && !isThinking && (
            <div id="comparison-modal" style={{ marginTop: '5rem', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '30px', border: '1px solid var(--border)', animation: 'fadeIn 0.6s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>⚔️ The Head-to-Head</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Comparing {comparedCars[0].model} vs {comparedCars[1].model}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                 {/* Row: Model */}
                 <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Car Model</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '15px', background: 'var(--bg-primary)' }}>
                    <div style={{ fontSize: '2rem' }}>{comparedCars[0].emoji}</div>
                    <div style={{ fontWeight: 'bold' }}>{comparedCars[0].make} {comparedCars[0].model}</div>
                 </div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '15px', background: 'var(--bg-primary)' }}>
                    <div style={{ fontSize: '2rem' }}>{comparedCars[1].emoji}</div>
                    <div style={{ fontWeight: 'bold' }}>{comparedCars[1].make} {comparedCars[1].model}</div>
                 </div>

                 {/* Row: Reliability */}
                 <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Reliability Rating</div>
                 <div style={{ textAlign: 'center', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: comparedCars[0].reliability > comparedCars[1].reliability ? '#10b981' : 'var(--text)' }}>
                   {comparedCars[0].reliability}% {comparedCars[0].reliability > comparedCars[1].reliability && '🏆'}
                 </div>
                 <div style={{ textAlign: 'center', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: comparedCars[1].reliability > comparedCars[0].reliability ? '#10b981' : 'var(--text)' }}>
                   {comparedCars[1].reliability}% {comparedCars[1].reliability > comparedCars[0].reliability && '🏆'}
                 </div>

                 {/* Row: Price Range */}
                 <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Price Range</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>£{comparedCars[0].minBudget.toLocaleString()} - £{comparedCars[0].maxBudget.toLocaleString()}</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>£{comparedCars[1].minBudget.toLocaleString()} - £{comparedCars[1].maxBudget.toLocaleString()}</div>

                 {/* Row: Running Costs (Tax) */}
                 <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Annual Road Tax</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>{comparedCars[0].tax}</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>{comparedCars[1].tax}</div>

                 {/* Row: Transmission */}
                 <div style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Transmission</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>{comparedCars[0].transmission}</div>
                 <div style={{ textAlign: 'center', padding: '1rem' }}>{comparedCars[1].transmission}</div>
              </div>

              <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>🤖 AI Final Verdict</h3>
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1rem' }}>
                  If you prioritize <strong>reliability and low maintenance</strong>, the <strong>{comparedCars[0].reliability > comparedCars[1].reliability ? comparedCars[0].model : comparedCars[1].model}</strong> is the clear winner. 
                  However, the <strong>{comparedCars[0].model}</strong> is better suited for {selectedLifestyles[0].toLowerCase()} needs. 
                  {comparedCars[0].fuel === 'Electric' || comparedCars[1].fuel === 'Electric' ? " Transitioning to electric will save you significantly on tax and fuel, but ensure you have home charging access." : ""}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
