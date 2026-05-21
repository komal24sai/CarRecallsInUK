import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', lineHeight: '1.6' }}>
          
          <span style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Terms & Conditions
          </span>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800', marginTop: '1rem', marginBottom: '2rem' }}>
            Terms of Service
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Welcome to <strong>IsThisCarSafe</strong> (domain: [isthiscarsafe.co.uk](https://isthiscarsafe.co.uk)). By accessing our lookup services, purchasing diagnostic integrity reports, or using our dealer API portals, you agree to comply with the terms and conditions outlined below.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            1. Nature of Our Predictions
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            All safety scores, pre-failure probabilities, and maintenance cost forecasts compiled by IsThisCarSafe represent statistical evaluations derived from historical national DVSA MOT records. <strong>Our reports do not represent formal engineering guarantees or mechanical inspection certifications.</strong> Actual road safety conditions of individual vehicles can vary depending on driver care, local terrain, and past repair history.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            2. Limitation of Liability
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            To the maximum extent permitted by UK law, IsThisCarSafe accepts no liability for purchasing decisions, mechanical failures, accidents, personal injuries, or financial losses incurred based on diagnostic information retrieved from our platform. Always arrange for a physical pre-purchase inspection from an independent mechanic before committing to a used vehicle purchase.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            3. Refund Policy
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Due to the immediate digital delivery nature of our diagnostic integrity reports, all sales of single reports and dealer subscription checks are final and non-refundable. Exception conditions apply exclusively in the event of a verified technical database outage where records could not be fetched from DVSA within 24 hours of successful checkout.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            4. Acceptable Use Guidelines
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Users are strictly prohibited from:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <li>Utilizing automated scrapers, web spiders, or harvesting robots to extract large-scale diagnostic records from public pages.</li>
            <li>Reselling individual predictive reports to commercial third parties without an active dealer agreement.</li>
            <li>Attempting to bypass paid preview locks or checkout gateways.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            5. B2B Dealer API Regulations
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Active dealer members are issued secure API keys to automate batch audits. B2B accounts must comply with the rate limits defined for their chosen tier (e.g. 50 checks per batch limit on the Basic plan). Prohibited uses include leasing API keys to third parties, white-labeling diagnostic report data feeds as proprietary models, or using lookup records for legal prosecution cases.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Governing Law
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            These Terms of Service and all related user interactions are governed exclusively by the laws of <strong>England and Wales</strong>. Any disputes arising from the use of our services fall under the jurisdiction of the courts of England.
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
