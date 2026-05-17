'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Professional AI Suggestions Database for UK Market
const carDatabase = [
  {
    id: 'picanto-new', make: 'Kia', model: 'Picanto', year: '2024 (Brand New)', minBudget: 15000, maxBudget: 19000,
    lifestyle: ['City Commuting', 'First Car', 'Budget Friendly'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['7-Year Warranty', 'Latest Safety Tech', 'Extremely easy to park'],
    emoji: '🐣', color: '#ef4444', reliability: 99, tax: '£190', isNew: true,
    aiNote: "The perfect 'First Car' if you want zero stress. It's brand new, fully warrantied, and very safe.",
    faults: "Small boot space and not ideal for long motorway journeys."
  },
  {
    id: 'sandero-new', make: 'Dacia', model: 'Sandero', year: '2024 (Brand New)', minBudget: 13000, maxBudget: 17000,
    lifestyle: ['First Car', 'Budget Friendly', 'City Commuting'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['UK\'s cheapest new car', 'Rugged simple design', 'Decent interior space'],
    emoji: '🛒', color: '#3b82f6', reliability: 98, tax: '£190', isNew: true,
    aiNote: "Unbeatable value for a brand new car. It's honest, reliable, and surprisingly comfortable.",
    faults: "Three-star Euro NCAP safety rating due to lack of advanced electronic aids."
  },
  {
    id: 'mg3-new', make: 'MG', model: 'MG3 Hybrid+', year: '2024 (Brand New)', minBudget: 18000, maxBudget: 21000,
    lifestyle: ['City Commuting', 'Eco-Friendly', 'First Car'], fuel: 'Hybrid', transmission: 'Auto',
    highlights: ['Punchy hybrid power', 'High-tech dual screen interior', '7-Year warranty'],
    emoji: '🔋', color: '#10b981', reliability: 97, tax: '£180', isNew: true,
    aiNote: "The new king of hybrid hatchbacks. Faster and better equipped than a Yaris for less money.",
    faults: "Infotainment can be slightly laggy compared to premium brands."
  },
  {
    id: 'fiesta', make: 'Ford', model: 'Fiesta', year: '2017-2022', minBudget: 7000, maxBudget: 15000,
    lifestyle: ['City Commuting', 'First Car', 'All-Rounder'], fuel: 'Petrol', transmission: 'Manual',
    highlights: ['Best-in-class handling', 'Sync 3 Infotainment', 'Widely available parts'],
    emoji: '🚗', color: '#3b82f6', reliability: 82, tax: '£180', isNew: false,
    aiNote: "Even used, this is the gold standard for small cars. Fun, safe, and holds its value well.",
    faults: "Wet-belt timing system on EcoBoost engines requires strict maintenance."
  },
  {
    id: 'yaris-hybrid', make: 'Toyota', model: 'Yaris Hybrid', year: '2020-2024', minBudget: 16000, maxBudget: 24000,
    lifestyle: ['City Commuting', 'Eco-Friendly', 'All-Rounder'], fuel: 'Hybrid', transmission: 'Auto',
    highlights: ['Unrivaled reliability', 'Phenomenal fuel economy', 'Modern safety suite'],
    emoji: '🍃', color: '#10b981', reliability: 96, tax: '£10', isNew: false,
    aiNote: "The sensible choice for the eco-conscious driver. It will likely outlast almost any other car on this list.",
    faults: "CVT gearbox can be noisy under hard acceleration."
  },
  {
    id: 'golf-8', make: 'Volkswagen', model: 'Golf (Mk8)', year: '2020-2024', minBudget: 16000, maxBudget: 28000,
    lifestyle: ['All-Rounder', 'Family Transport', 'Luxury'], fuel: 'Petrol', transmission: 'Auto',
    highlights: ['Digital cockpit', 'Superb refinement', 'Status symbol appeal'],
    emoji: '🇩🇪', color: '#8b5cf6', reliability: 79, tax: '£180', isNew: false,
    aiNote: "The premium hatchback. Ideal if you want a car that feels expensive without being flashy.",
    faults: "Software glitches in the early Mk8 infotainment systems are common."
  },
  {
    id: 'model3-new', make: 'Tesla', model: 'Model 3 (Highland)', year: '2024 (Brand New)', minBudget: 39000, maxBudget: 50000,
    lifestyle: ['Eco-Friendly', 'Tech Enthusiast', 'Luxury'], fuel: 'Electric', transmission: 'Auto',
    highlights: ['Industry-leading range', 'Minimalist high-tech interior', 'Ventilated seats'],
    emoji: '⚡', color: '#10b981', reliability: 94, tax: '£0', isNew: true,
    aiNote: "The definitive electric car. The new 'Highland' refresh is significantly quieter and smoother.",
    faults: "No physical stalks for indicators or gears—it's all on the screen or steering wheel."
  },
  {
    id: 'octavia', make: 'Skoda', model: 'Octavia', year: '2020-2024', minBudget: 14000, maxBudget: 25000,
    lifestyle: ['Family Transport', 'Long Commutes'], fuel: 'Diesel', transmission: 'Auto',
    highlights: ['Enormous practicality', 'Ergonomic excellence', 'Great value'],
    emoji: '📦', color: '#ef4444', reliability: 88, tax: '£180', isNew: false,
    aiNote: "The ultimate family workhorse. More space than cars twice the price.",
    faults: "Styling is safe rather than exciting."
  },
  {
    id: '3series-g20', make: 'BMW', model: '3 Series (G20)', year: '2019-2024', minBudget: 18000, maxBudget: 35000,
    lifestyle: ['Long Commutes', 'Weekend Fun', 'Luxury'], fuel: 'Petrol', transmission: 'Auto',
    highlights: ['Driver-focused interior', 'Incredible chassis balance', 'Premium iDrive system'],
    emoji: '🏎️', color: '#3b82f6', reliability: 84, tax: '£180+', isNew: false,
    aiNote: "The sportiest saloon in its class. Perfect for high-mileage drivers who still enjoy the road.",
    faults: "Run-flat tyres can make the ride feel slightly brittle on broken UK roads."
  },
  {
    id: 'xc40-new', make: 'Volvo', model: 'XC40 Recharge', year: '2024 (Brand New)', minBudget: 45000, maxBudget: 55000,
    lifestyle: ['Family Transport', 'Luxury', 'Eco-Friendly'], fuel: 'Electric', transmission: 'Auto',
    highlights: ['Google Built-in', 'Legendary Volvo safety', 'Chic SUV styling'],
    emoji: '🛡️', color: '#8b5cf6', reliability: 92, tax: '£0', isNew: true,
    aiNote: "Sophisticated, safe, and silent. The best family SUV for those moving to electric.",
    faults: "Range is good but not quite class-leading compared to Tesla."
  }
];

const LIFESTYLES = ['First Car', 'City Commuting', 'Family Transport', 'Long Commutes', 'Weekend Fun', 'Eco-Friendly', 'All-Rounder', 'Budget Friendly', 'Luxury', 'Tech Enthusiast'];
const FUEL_TYPES = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Any', 'Manual', 'Auto'];

export default function CarIntelligencePage() {
  const [minBudget, setMinBudget] = useState(5000);
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedLifestyles, setSelectedLifestyles] = useState(['First Car']);
  const [fuelPref, setFuelPref] = useState('Any');
  const [transPref, setTransPref] = useState('Any');
  
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [comparingIds, setComparingIds] = useState([]);

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
        // Budget logic: Ensure car is within user's range
        const withinBudget = (car.minBudget <= maxBudget && car.maxBudget >= minBudget);
        const lifestyleMatch = car.lifestyle.some(l => selectedLifestyles.includes(l));
        const fuelMatch = fuelPref === 'Any' || car.fuel === fuelPref;
        const transMatch = transPref === 'Any' || car.transmission === transPref;

        // "First Car" specific logic: Favor brand new cars if First Car is selected
        if (selectedLifestyles.includes('First Car') && !car.isNew && car.lifestyle.includes('First Car')) {
           // Allow used first cars but we will sort them later
        }

        return withinBudget && lifestyleMatch && fuelMatch && transMatch;
      });

      // Sort logic: 
      // 1. If 'First Car' is selected, prioritize 'isNew' cars
      // 2. Otherwise sort by reliability
      matches.sort((a, b) => {
        if (selectedLifestyles.includes('First Car')) {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
        }
        return b.reliability - a.reliability;
      });

      setSuggestions(matches);
      setIsThinking(false);
      
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
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1rem' }}>🧠 AI Car Matchmaker</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Our intelligence engine analyzes current market availability, real-world reliability, and total cost of ownership to find your perfect match.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Intelligence Input Console */}
          <div className="info-card" style={{ padding: '2.5rem', border: '1px solid var(--accent-purple)', background: 'var(--bg-secondary)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            
            {/* Budget Console */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                 <div>
                    <label style={{ fontWeight: '800', display: 'block', fontSize: '1.2rem', color: 'var(--text)' }}>Acquisition Budget</label>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Define your target price range for the vehicle.</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-purple)' }}>£{minBudget.toLocaleString()} — £{maxBudget.toLocaleString()}</span>
                 </div>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>Minimum Target</label>
                  <input 
                    type="range" min="1000" max="49000" step="1000"
                    value={minBudget} onChange={handleMinChange}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>Maximum Cap</label>
                  <input 
                    type="range" min="2000" max="60000" step="1000"
                    value={maxBudget} onChange={handleMaxChange}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Technical Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1rem' }}>Propulsion System</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {FUEL_TYPES.map(f => (
                    <button 
                      key={f} onClick={() => setFuelPref(f)}
                      style={{
                        padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid', fontSize: '0.9rem',
                        borderColor: fuelPref === f ? 'var(--accent-blue)' : 'var(--border)',
                        background: fuelPref === f ? 'var(--accent-blue)' : 'var(--bg-primary)',
                        color: fuelPref === f ? 'white' : 'var(--text)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1rem' }}>Transmission Type</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {TRANSMISSIONS.map(t => (
                    <button 
                      key={t} onClick={() => setTransPref(t)}
                      style={{
                        padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid', fontSize: '0.9rem',
                        borderColor: transPref === t ? 'var(--accent-blue)' : 'var(--border)',
                        background: transPref === t ? 'var(--accent-blue)' : 'var(--bg-primary)',
                        color: transPref === t ? 'white' : 'var(--text)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Archetype */}
            <div style={{ marginBottom: '3rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Primary Vehicle Usage (Select 1—3)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {LIFESTYLES.map(l => (
                  <button 
                    key={l} onClick={() => toggleLifestyle(l)}
                    style={{
                      padding: '0.7rem 1.4rem', borderRadius: '30px', border: '1px solid',
                      borderColor: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'var(--border)',
                      background: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'var(--bg-primary)',
                      color: selectedLifestyles.includes(l) ? 'white' : 'var(--text)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      fontWeight: selectedLifestyles.includes(l) ? '800' : '500',
                      boxShadow: selectedLifestyles.includes(l) ? '0 5px 15px rgba(139, 92, 246, 0.4)' : 'none'
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>

            <button 
              className="action-btn primary" 
              style={{ width: '100%', padding: '1.4rem', fontSize: '1.3rem', background: 'var(--gradient-accent)', fontWeight: '900', borderRadius: '16px', border: 'none' }}
              onClick={findMatches} disabled={isThinking}
            >
              {isThinking ? '🧠 ANALYZING MARKET DATA...' : 'GENERATE INTELLIGENCE REPORT'}
            </button>
          </div>

          {/* Results Display */}
          {hasSearched && (
            <div id="results" style={{ marginTop: '2rem' }}>
              {isThinking ? (
                <div style={{ textAlign: 'center', padding: '8rem 0' }}>
                  <div className="spinner" style={{ width: '70px', height: '70px', borderTopColor: 'var(--accent-purple)', margin: '0 auto 2.5rem' }}></div>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', fontWeight: '500' }}>Matching criteria against the IsThisCarSafe database...</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  
                  {suggestions.length > 0 ? (
                    <>
                      <div id="results-header" style={{ textAlign: 'center' }}>
                         <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '0.5rem' }}>Match Results</h2>
                         <p style={{ color: 'var(--text-secondary)' }}>We identified {suggestions.length} high-confidence matches for your profile.</p>
                      </div>

                      {suggestions.map((car, idx) => (
                        <div key={car.id} className="metric-card" style={{ 
                          display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2.5rem', 
                          position: 'relative', overflow: 'hidden', border: comparingIds.includes(car.id) ? '3px solid var(--accent-blue)' : '1px solid var(--border)',
                          background: 'var(--bg-secondary)', borderRadius: '24px'
                        }}>
                          {/* Visual Accent */}
                          <div style={{ position: 'absolute', top: '-30px', right: '-40px', fontSize: '15rem', opacity: 0.05, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
                            {car.emoji}
                          </div>
                          
                          {/* Primary Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                {car.isNew ? (
                                   <span style={{ background: '#f59e0b', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>BRAND NEW CAR</span>
                                ) : (
                                   idx === 0 && <span style={{ background: '#10b981', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>OPTIMAL MATCH</span>
                                )}
                                <h3 style={{ fontSize: '2.2rem', margin: 0, fontWeight: '900' }}>{car.make} {car.model}</h3>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
                                <span style={{ color: car.color, fontWeight: '800' }}>{car.year}</span> • {car.fuel} • {car.transmission}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                               <button 
                                onClick={() => toggleCompare(car.id)}
                                style={{
                                  padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid', fontSize: '0.9rem',
                                  borderColor: comparingIds.includes(car.id) ? 'var(--accent-blue)' : 'var(--border)',
                                  background: comparingIds.includes(car.id) ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                                  color: comparingIds.includes(car.id) ? 'var(--accent-blue)' : 'var(--text)',
                                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '800'
                                }}
                              >
                                {comparingIds.includes(car.id) ? '✓ In Compare' : '+ Add to Compare'}
                              </button>
                              <div style={{ textAlign: 'right', background: 'var(--bg-primary)', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', minWidth: '180px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.25rem' }}>Price Estimate</span>
                                <strong style={{ fontSize: '1.6rem', color: car.color, fontWeight: '900' }}>£{car.minBudget.toLocaleString()} — £{car.maxBudget.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>

                          {/* AI Narrative */}
                          <div style={{ 
                            background: 'var(--bg-primary)', padding: '2rem', borderRadius: '20px', 
                            borderLeft: `6px solid ${car.color}`, zIndex: 1, position: 'relative'
                          }}>
                             <div style={{ position: 'absolute', top: '-10px', left: '25px', background: 'var(--bg-primary)', padding: '2px 12px', fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Expert Verdict</div>
                            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text)', lineHeight: '1.6', fontWeight: '500' }}>&quot;{car.aiNote}&quot;</p>
                          </div>

                          {/* Intelligence Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', zIndex: 1 }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.25rem', fontSize: '1.1rem', color: '#10b981', fontWeight: '900' }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  Strategic Advantages
                                </strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                  {car.highlights.map((h, i) => (
                                    <span key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700' }}>
                                      {h}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                 <strong style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', fontSize: '1.1rem', color: '#ef4444', fontWeight: '900' }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                  Forensic Warning (Reality Check)
                                </strong>
                                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: '500' }}>{car.faults}</p>
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                              <strong style={{ display: 'block', fontSize: '1.1rem', fontWeight: '900', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence Metrics</strong>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Historical Reliability</span>
                                    <strong style={{ color: car.reliability >= 95 ? '#10b981' : car.reliability >= 85 ? '#f59e0b' : '#ef4444' }}>{car.reliability}% Score</strong>
                                  </div>
                                  <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: `${car.reliability}%`, height: '100%', background: car.reliability >= 95 ? '#10b981' : car.reliability >= 85 ? '#f59e0b' : '#ef4444', borderRadius: '6px', transition: 'width 1s ease-out' }}></div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Est. Annual Road Tax</span>
                                  <strong style={{ color: 'var(--text)', fontWeight: '800' }}>{car.tax}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Forensic Value Retention</span>
                                  <strong style={{ color: '#10b981', fontWeight: '800' }}>High</strong>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="info-card" style={{ textAlign: 'center', padding: '6rem 2rem', border: '2px dashed var(--border)', borderRadius: '32px', background: 'var(--bg-secondary)' }}>
                      <p style={{ fontSize: '6rem', margin: '0 0 1.5rem 0' }}>🔎</p>
                      <h2 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '1rem' }}>No direct matches identified</h2>
                      <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.6' }}>
                        Your specific combination of budget, fuel type, and lifestyle didn&apos;t return any exact records in our intelligence database.
                      </p>
                      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                         <button className="action-btn primary" style={{ padding: '1rem 2rem', borderRadius: '12px' }} onClick={() => { setMinBudget(5000); setMaxBudget(55000); setFuelPref('Any'); setTransPref('Any'); }}>Reset All Parameters</button>
                         <button className="action-btn" style={{ padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent' }} onClick={() => setHasSearched(false)}>Back to Intelligence Center</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comparison Modal (Head-to-Head) */}
          {comparingIds.length === 2 && !isThinking && (
            <div id="comparison-modal" style={{ 
              marginTop: '6rem', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '40px', 
              border: '2px solid var(--accent-blue)', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '0.5rem' }}>⚔️ Strategic Comparison</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Data-driven head-to-head analysis of your top candidates.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                 {/* Header Row */}
                 <div style={{ visibility: 'hidden' }}>Label</div>
                 <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '24px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{comparedCars[0].emoji}</div>
                    <div style={{ fontWeight: '900', fontSize: '1.4rem' }}>{comparedCars[0].make} {comparedCars[0].model}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{comparedCars[0].isNew ? 'Brand New' : 'Used Selection'}</div>
                 </div>
                 <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '24px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{comparedCars[1].emoji}</div>
                    <div style={{ fontWeight: '900', fontSize: '1.4rem' }}>{comparedCars[1].make} {comparedCars[1].model}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{comparedCars[1].isNew ? 'Brand New' : 'Used Selection'}</div>
                 </div>

                 {/* Attribute Rows */}
                 <div style={{ color: 'var(--text)', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reliability Rating</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '1.6rem', fontWeight: '900', color: comparedCars[0].reliability > comparedCars[1].reliability ? '#10b981' : 'var(--text)' }}>
                   {comparedCars[0].reliability}% {comparedCars[0].reliability > comparedCars[1].reliability && '🏆'}
                 </div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '1.6rem', fontWeight: '900', color: comparedCars[1].reliability > comparedCars[0].reliability ? '#10b981' : 'var(--text)' }}>
                   {comparedCars[1].reliability}% {comparedCars[1].reliability > comparedCars[0].reliability && '🏆'}
                 </div>

                 <div style={{ color: 'var(--text)', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Price Range</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700', fontSize: '1.1rem' }}>£{comparedCars[0].minBudget.toLocaleString()} — £{comparedCars[0].maxBudget.toLocaleString()}</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700', fontSize: '1.1rem' }}>£{comparedCars[1].minBudget.toLocaleString()} — £{comparedCars[1].maxBudget.toLocaleString()}</div>

                 <div style={{ color: 'var(--text)', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Road Tax (Annual)</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700' }}>{comparedCars[0].tax}</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700' }}>{comparedCars[1].tax}</div>

                 <div style={{ color: 'var(--text)', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Transmission</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700' }}>{comparedCars[0].transmission}</div>
                 <div style={{ textAlign: 'center', padding: '1.5rem', fontWeight: '700' }}>{comparedCars[1].transmission}</div>
              </div>

              <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.5 8.5 0 0 1 7 3.9"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                   IsThisCarSafe AI Final Verdict
                </h3>
                <p style={{ margin: 0, lineHeight: '1.7', fontSize: '1.15rem', color: 'var(--text)', fontWeight: '500' }}>
                  Based on your requirements, if your primary goal is <strong>reliability and hassle-free ownership</strong>, the <strong>{comparedCars[0].reliability > comparedCars[1].reliability ? comparedCars[0].model : comparedCars[1].model}</strong> is the technically superior choice with its {Math.max(comparedCars[0].reliability, comparedCars[1].reliability)}% reliability score. 
                  However, the <strong>{comparedCars[0].model}</strong> offers a more tailored experience for {selectedLifestyles[0].toLowerCase()} usage. 
                  {comparedCars[0].isNew || comparedCars[1].isNew ? " Choosing a brand new vehicle ensures you are covered by manufacturer warranty for at least 3-7 years, significantly reducing your forensic risk profile." : ""}
                </p>
              </div>
            </div>
          )}

          {/* Comparing Floating Bar */}
          {comparingIds.length > 0 && (
            <div style={{
              position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)',
              padding: '1.25rem 2.5rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '2.5rem',
              zIndex: 100, border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              color: 'white', width: 'max-content', transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {comparedCars.map(car => (
                  <div key={car.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>{car.emoji}</span>
                    <span style={{ fontWeight: '900', fontSize: '1rem' }}>{car.model}</span>
                    <button onClick={() => toggleCompare(car.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem 0.6rem', borderRadius: '50%' }}>×</button>
                  </div>
                ))}
                {comparingIds.length === 1 && <div style={{ border: '1.5px dashed rgba(255,255,255,0.2)', padding: '0.6rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Select 1 more to compare</div>}
              </div>
              {comparingIds.length === 2 && (
                <button 
                  className="action-btn primary" 
                  style={{ padding: '0.8rem 2rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '900', boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                  onClick={() => document.getElementById('comparison-modal').scrollIntoView({ behavior: 'smooth' })}
                >RUN COMPARISON</button>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"] {
          height: 6px;
          border-radius: 3px;
        }
        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
}
