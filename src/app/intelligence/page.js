'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock AI Suggestions Database
const carDatabase = [
  {
    make: 'Ford', model: 'Fiesta', year: '2015-2018', minBudget: 3000, maxBudget: 8000,
    lifestyle: ['City Commuting', 'First Car'],
    highlights: ['Cheap to insure', 'Excellent fuel economy (55 mpg)', 'Fun to drive'],
    emoji: '🚗', color: 'var(--accent-blue)',
    aiNote: "The UK's best-selling car for a reason. Parts are cheap and it handles like a go-kart."
  },
  {
    make: 'Toyota', model: 'Yaris Hybrid', year: '2016-2020', minBudget: 6000, maxBudget: 14000,
    lifestyle: ['City Commuting', 'Eco-Friendly'],
    highlights: ['Bulletproof reliability', 'Congestion charge exempt', '70+ mpg around town'],
    emoji: '🍃', color: 'var(--accent-green)',
    aiNote: "If you hate visiting the mechanic, buy this. The hybrid system is practically indestructible."
  },
  {
    make: 'Volkswagen', model: 'Golf', year: '2014-2019', minBudget: 5000, maxBudget: 15000,
    lifestyle: ['All-Rounder', 'Family Transport', 'City Commuting'],
    highlights: ['Premium interior feel', 'Quiet at motorway speeds', 'Strong resale value'],
    emoji: '🇩🇪', color: 'var(--accent-purple)',
    aiNote: "The classless car. Looks as good parked outside a supermarket as it does outside a luxury hotel."
  },
  {
    make: 'Skoda', model: 'Octavia Estate', year: '2015-2021', minBudget: 6000, maxBudget: 18000,
    lifestyle: ['Family Transport', 'Long Commutes'],
    highlights: ['Massive 610L boot space', 'VW reliability for less money', 'Incredibly practical'],
    emoji: '📦', color: 'var(--accent-red)',
    aiNote: "The thinking person's family car. You can fit an entire flat pack kitchen in the back."
  },
  {
    make: 'BMW', model: '3 Series (F30)', year: '2013-2018', minBudget: 7000, maxBudget: 16000,
    lifestyle: ['Long Commutes', 'Weekend Fun'],
    highlights: ['Rear-wheel drive dynamics', 'Exceptional infotainment', 'Smooth automatic gearboxes'],
    emoji: '🏎️', color: 'var(--accent-blue)',
    aiNote: "The ultimate driving machine for the middle manager. Watch out for timing chain rattles on early diesels."
  },
  {
    make: 'Tesla', model: 'Model 3', year: '2019-2022', minBudget: 18000, maxBudget: 35000,
    lifestyle: ['Eco-Friendly', 'Tech Enthusiast', 'Long Commutes'],
    highlights: ['Access to Supercharger network', 'Autopilot features', '0-60 mph in 4.2s (Long Range)'],
    emoji: '⚡', color: 'var(--accent-green)',
    aiNote: "The iPhone of cars. Incredible tech, but watch out for panel gaps on the early models."
  },
  {
    make: 'Volvo', model: 'XC90', year: '2016-2021', minBudget: 22000, maxBudget: 45000,
    lifestyle: ['Family Transport', 'Luxury'],
    highlights: ['Class-leading safety features', 'Beautiful minimalist interior', 'Genuine 7-seater'],
    emoji: '🛡️', color: 'var(--accent-purple)',
    aiNote: "The safest place to put your family. The interior feels like a high-end Scandinavian living room."
  },
  {
    make: 'Mazda', model: 'MX-5 (ND)', year: '2016-2022', minBudget: 10000, maxBudget: 22000,
    lifestyle: ['Weekend Fun', 'Track Days'],
    highlights: ['Perfect 50:50 weight distribution', 'Manual soft top takes 3 seconds', 'Legendary reliability'],
    emoji: '😎', color: 'var(--accent-red)',
    aiNote: "The answer is always Miata. The most fun you can have at legal speeds."
  },
  {
    make: 'Porsche', model: 'Cayman (981)', year: '2013-2016', minBudget: 25000, maxBudget: 40000,
    lifestyle: ['Weekend Fun', 'Luxury'],
    highlights: ['Mid-engine handling perfection', 'Glorious flat-six engine note', 'Surprising daily usability'],
    emoji: '🏁', color: 'var(--accent-purple)',
    aiNote: "Often better to drive than a 911. A true modern classic that won't depreciate heavily."
  },
  {
    make: 'Dacia', model: 'Sandero', year: '2018-2023', minBudget: 4000, maxBudget: 10000,
    lifestyle: ['First Car', 'Budget Friendly'],
    highlights: ['Incredibly cheap to run', 'No-nonsense mechanics', 'Surprisingly spacious'],
    emoji: '🛒', color: 'var(--accent-blue)',
    aiNote: "Good news! It's the Dacia Sandero. It's honest, cheap transport with zero pretension."
  }
];

const LIFESTYLES = ['City Commuting', 'Family Transport', 'Weekend Fun', 'Eco-Friendly', 'All-Rounder', 'First Car', 'Luxury'];

export default function CarIntelligencePage() {
  const [budget, setBudget] = useState(10000);
  const [selectedLifestyles, setSelectedLifestyles] = useState(['All-Rounder']);
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

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

  const findMatches = () => {
    setIsThinking(true);
    setHasSearched(true);
    
    // Simulate AI thinking time for engagement
    setTimeout(() => {
      let matches = carDatabase.filter(car => {
        const withinBudget = budget >= car.minBudget && budget <= (car.maxBudget * 1.2); // Give a little leeway on max
        const lifestyleMatch = car.lifestyle.some(l => selectedLifestyles.includes(l)) || selectedLifestyles.includes('All-Rounder');
        return withinBudget && lifestyleMatch;
      });

      // Sort by how well they fit the budget (closest to max)
      matches.sort((a, b) => b.maxBudget - a.maxBudget);
      
      // If no matches, just suggest the closest ones by budget
      if (matches.length === 0) {
        matches = carDatabase
          .filter(car => budget >= car.minBudget)
          .sort((a, b) => Math.abs(budget - a.maxBudget) - Math.abs(budget - b.maxBudget))
          .slice(0, 2);
      }

      setSuggestions(matches.slice(0, 3)); // Top 3 matches
      setIsThinking(false);
    }, 1500);
  };

  return (
    <>
      <Header />
      <main className="layout-container" style={{ paddingTop: '2rem' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠 AI Car Matchmaker</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Tell our AI what you need and what you can spend. We'll cross-reference millions of data points to find your perfect automotive match.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Form Section */}
          <div className="info-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <span>What is your maximum budget?</span>
                <span style={{ color: 'var(--accent-purple)' }}>£{budget.toLocaleString()}</span>
              </label>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="500"
                value={budget} 
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <span>£1k</span>
                <span>£50k+</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '1rem', fontSize: '1.1rem' }}>What is this car primarily for? (Select up to 3)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {LIFESTYLES.map(l => (
                  <button 
                    key={l}
                    onClick={() => toggleLifestyle(l)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'var(--border)',
                      background: selectedLifestyles.includes(l) ? 'var(--accent-purple)' : 'transparent',
                      color: selectedLifestyles.includes(l) ? 'white' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: selectedLifestyles.includes(l) ? 'bold' : 'normal',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="action-btn primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--gradient-accent)' }}
              onClick={findMatches}
              disabled={isThinking}
            >
              {isThinking ? '🧠 AI is calculating optimal matches...' : 'Find My Perfect Car'}
            </button>
          </div>

          {/* Results Section */}
          {hasSearched && (
            <div style={{ marginTop: '1rem' }}>
              {isThinking ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: 'var(--accent-purple)', margin: '0 auto 1.5rem' }}></div>
                  <h3 style={{ color: 'var(--text-secondary)' }}>Scanning market data & reliability scores...</h3>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Your Top Matches</h2>
                  
                  {suggestions.length > 0 ? suggestions.map((car, idx) => (
                    <div key={idx} className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.05, transform: 'rotate(15deg)' }}>
                        {car.emoji}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '2rem' }}>{car.emoji}</span>
                            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{car.make} {car.model}</h3>
                          </div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recommended Years: {car.year}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Price</span>
                          <strong style={{ fontSize: '1.25rem', color: car.color }}>£{car.minBudget.toLocaleString()} - £{car.maxBudget.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${car.color}`, zIndex: 1 }}>
                        <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.95rem' }}>"{car.aiNote}"</p>
                      </div>

                      <div style={{ zIndex: 1, marginTop: '0.5rem' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Highlight Features:</strong>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {car.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    </div>
                  )) : (
                    <div className="info-card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <p style={{ fontSize: '3rem', margin: 0 }}>🤷</p>
                      <h3>No perfect match found</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your budget or lifestyle requirements.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
