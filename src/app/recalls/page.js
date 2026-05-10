'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RecallsSearchPage() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!make || !model) return;

    if (year && (year.length !== 4 || isNaN(year) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 1)) {
      setError('Please enter a valid 4-digit year (e.g. 2008).');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const query = new URLSearchParams({ make, model });
      if (year) query.append('year', year);

      const res = await fetch(`/api/recalls?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch recalls. Please ensure the make and model are correct.');
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="layout-container" style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="vehicle-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Vehicle Recall Database</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Search the official DVSA database to uncover historic safety recalls, manufacturing defects, and known component failures for any vehicle.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', padding: '2rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Make (e.g. VOLKSWAGEN)</label>
              <input 
                type="text" 
                required 
                value={make} 
                onChange={e => setMake(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="Make"
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Model (e.g. GOLF)</label>
              <input 
                type="text" 
                required 
                value={model} 
                onChange={e => setModel(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="Model"
              />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Year (Optional)</label>
              <input 
                type="number" 
                min="1900"
                max={new Date().getFullYear() + 1}
                value={year} 
                onChange={e => {
                  if (e.target.value.length <= 4) setYear(e.target.value);
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                placeholder="YYYY"
              />
            </div>
            <button type="submit" className="action-btn primary" disabled={loading} style={{ padding: '0 2rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
              {loading ? 'Searching...' : 'Search Recalls'}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {results && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {results.totalRecalls} Recalls Found for {results.make} {results.model} {results.year !== 'All' ? `(${results.year})` : ''}
              </h2>
            </div>

            {results.totalRecalls === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3>No Safety Recalls Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>The DVSA has not issued any safety recalls for this specific Make, Model, and Year combination.</p>
              </div>
            ) : results.partitioned ? (
              /* NO YEAR ENTERED: Show Partitioned View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {Object.keys(results.partitioned)
                  .sort((a, b) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : parseInt(b) - parseInt(a)))
                  .map(yearKey => (
                    <div key={yearKey}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{yearKey}</h2>
                        <div style={{ height: '2px', flex: 1, background: 'var(--border-glass)' }}></div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{results.partitioned[yearKey].length} Recalls</span>
                      </div>
                      <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {results.partitioned[yearKey].map((recall, i) => (
                          <RecallCard key={`${yearKey}-${i}`} recall={recall} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* YEAR ENTERED: Show Flat List */
              <div style={{ display: 'grid', gap: '1rem' }}>
                {results.recalls.map((recall, i) => (
                  <RecallCard key={i} recall={recall} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

/**
 * Sub-component for individual Recall Card to keep code clean
 */
function RecallCard({ recall }) {
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--accent-red)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Recall Ref: {recall.recall_number}</div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{recall.concern}</h3>
        </div>
        <div className="vehicle-tags">
          <span className="tag">Builds: {recall.build_start || 'Unknown'} to {recall.build_end || 'Unknown'}</span>
          <span className="tag">Issued: {recall.recalled_date || 'Unknown'}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
        <div>
          <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The Defect</strong>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{recall.defect}</p>
        </div>
        <div>
          <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The Remedy</strong>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{recall.remedy}</p>
        </div>
      </div>
    </div>
  );
}

