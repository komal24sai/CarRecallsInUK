import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export async function generateStaticParams() {
  return [
    { slug: 'rear-brake-disc-corrosion' },
    { slug: 'suspension-arm-pin-bush-worn' },
    { slug: 'tyre-worn-close-to-legal-limit' },
    { slug: 'coil-spring-corroded' },
    { slug: 'brake-pipe-corroded' }
  ];
}

export default async function AdvisoryExplanationPage({ params }) {
  const { slug } = await params;
  
  // Format slug to readable Title Case
  const formattedTitle = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Dynamic JSON-LD Structured Data (schema.org/AutoRepair)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `${formattedTitle} MOT Advisory Repair Guide`,
    "image": "https://isthiscarsafe.co.uk/logo.png",
    "description": `What ${formattedTitle} means on an MOT test, how serious it is, repair procedures, and estimated cost ranges.`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "priceRange": "£70 - £350"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ background: '#0D0F14', color: '#FFFFFF', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <span style={{ color: '#E8FF00', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            MOT Code Dictionary
          </span>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800', marginTop: '1rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            {formattedTitle} — What This MOT Advisory Means
          </h1>

          {/* Plain English explanation */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#E8FF00', marginBottom: '1rem' }}>
              Plain English Explanation
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: '1.05rem', lineHeight: '1.6' }}>
              This advisory indicates that while the component is still technically legal and functioning, it is showing noticeable wear, corrosion, or degradation. An MOT tester flags this to alert you that the part will need replacement in the near future.
            </p>
          </section>

          {/* Seriousness Progress bar */}
          <section style={{ background: '#161922', border: '1px solid #262B38', padding: '2rem', borderRadius: '4px', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              Failure Likelihood & Timeline
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem', color: '#A0AEC0', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                <span>Failure Progression Probability</span>
                <span style={{ color: '#F56565', fontWeight: 'bold' }}>64%</span>
              </div>
              <div style={{ background: '#0D0F14', height: '8px', borderRadius: '4px' }}>
                <div style={{ background: '#F56565', width: '64%', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', borderTop: '1px solid #262B38', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>REPAIR TIMELINE</span>
                <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>3 — 6 Months</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>URGENCY ASSESSMENT</span>
                <strong style={{ fontSize: '1.1rem', color: '#ED8936' }}>Medium Risk Warning</strong>
              </div>
            </div>
          </section>

          {/* Repair Details & Costs */}
          <section style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem' }}>
              What the Repair Involves & Costs
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Repairing this issue typically requires booking the vehicle into an independent garage to replace the worn components. Driving on heavily corroded or play-laden parts can affect stopping distances, alignment, and general road safety.
            </p>

            <div style={{ background: '#161922', border: '1px solid #262B38', padding: '1.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>AVERAGE REPAIR COST RANGE</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                £120 — £280
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.5rem', margin: 0 }}>
                Includes brand-new quality replacement parts and standard independent workshop labor charges.
              </p>
            </div>
          </section>

          {/* Check CTA */}
          <div style={{ background: 'linear-gradient(to right, #161922, #12151C)', border: '1px solid #E8FF00', padding: '3rem 2rem', borderRadius: '4px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Check if your car has this advisory
            </h3>
            <p style={{ color: '#A0AEC0', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.5' }}>
              Run our predictive scoring engine on your registration to isolate worn components immediately.
            </p>
            
            <a
              href="/"
              style={{
                background: '#E8FF00',
                color: '#0D0F14',
                padding: '0.9rem 2.2rem',
                fontWeight: '900',
                fontSize: '1rem',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
                fontFamily: 'var(--font-heading)',
                boxShadow: 'var(--shadow-glow)',
                display: 'inline-block'
              }}
            >
              Start Free Check Now
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
