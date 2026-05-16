import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'About — isthiscarsafe',
  description: 'Learn about our approach to UK vehicle safety intelligence.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="vehicle-page">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h2>About isthiscarsafe</h2>
          <p style={{ color: 'var(--text-secondary)' }}>UK vehicle safety intelligence powered by official DVSA data</p>
        </div>

        <div className="vehicle-grid">
          <div className="info-card">
            <h3>🎯 Mission</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              isthiscarsafe provides transparent, data-driven vehicle safety intelligence for every UK-registered vehicle.
              We believe every car buyer, seller, and owner deserves easy access to comprehensive MOT history and safety recall data.
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
                <div className="info-item-value">isthiscarsafe AI</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  NHTSA (USA), EU RAPEX integration at isthiscarsafe.co.uk
                </p>
              </div>
            </div>
          </div>


        </div>
      </div>
      <Footer />
    </>
  );
}
