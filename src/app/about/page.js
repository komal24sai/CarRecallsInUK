import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'About — CarRecalls UK',
  description: 'Learn about our Bronze→Silver→Gold data engineering approach to UK vehicle safety intelligence.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="vehicle-page">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h2>About CarRecalls UK</h2>
          <p style={{ color: 'var(--text-secondary)' }}>UK vehicle safety intelligence powered by official DVSA data</p>
        </div>

        <div className="vehicle-grid">
          <div className="info-card">
            <h3>🎯 Mission</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              CarRecalls UK provides transparent, data-driven vehicle safety intelligence for every UK-registered vehicle.
              We believe every car buyer, seller, and owner deserves easy access to comprehensive MOT history and safety recall data.
            </p>
          </div>

          <div className="info-card">
            <h3>📐 Architecture</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Built on a <strong>medallion data architecture</strong> (Bronze → Silver → Gold), inspired by modern data engineering practices.
              Raw DVSA data is ingested, cleaned, enriched, and aggregated through three distinct layers before reaching the user.
            </p>
          </div>

          <div className="info-card vehicle-grid-full">
            <h3>📊 Data Sources</h3>
            <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div>
                <div className="info-item-label">MOT History API</div>
                <div className="info-item-value">DVSA Official</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Test dates, results, mileage, defects since 2005
                </p>
              </div>
              <div>
                <div className="info-item-label">Vehicle Recalls</div>
                <div className="info-item-value">DVSA + SMMT</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Manufacturer safety recalls &amp; completion status
                </p>
              </div>
              <div>
                <div className="info-item-label">Global Platform</div>
                <div className="info-item-value">CarRecallsAI</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  NHTSA (USA), EU RAPEX integration at carrecallsai.com
                </p>
              </div>
            </div>
          </div>

          <div className="info-card vehicle-grid-full">
            <h3>👨‍💻 Built By</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <strong>Venkata Komal Sai Mantha</strong> — Data Engineer &amp; Full-Stack Developer.
              Part of the CarRecallsAI ecosystem, a distributed ETL platform unifying vehicle safety recall data from USA, UK &amp; EU government sources.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <a href="https://carrecallsai.com" target="_blank" rel="noopener">🌍 Visit Global Platform</a>
              {' · '}
              <a href="https://github.com/komal24sai/carrecallsAI" target="_blank" rel="noopener">📂 GitHub</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
