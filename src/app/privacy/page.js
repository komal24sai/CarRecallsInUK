import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', lineHeight: '1.6' }}>
          
          <span style={{ color: 'var(--accent-yellow)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Compliance & Privacy
          </span>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '800', marginTop: '1rem', marginBottom: '2rem' }}>
            Privacy Policy
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            This policy outlines how <strong>IsThisCarSafe</strong> (referred to as &quot;we&quot; or &quot;our&quot;) collects, uses, and protects your information under UK GDPR. Under UK law, vehicle registration numbers can be considered personal data when linked to an individual owner. We treat registration records and email addresses with the highest standards of data security.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            1. What Data We Collect
          </h2>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <li><strong>Vehicle Registration Numbers:</strong> Used to pull historical MOT logs and safety recalls.</li>
            <li><strong>Email Addresses:</strong> Collected when creating accounts, subscribing to reports, or purchasing dealer checks.</li>
            <li><strong>Payment Transaction Data:</strong> Processed directly by our payment merchants (Dodo Payments and Stripe). We do not store complete credit card details on our local servers.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            2. Why We Collect Your Information
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            We process your information to deliver the predictive vehicle integrity reports, manage dealer subscriptions, prevent fraudulent lookups, and communicate transactional updates or account notifications.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            3. How Long We Retain Data
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Data Type</th>
                <th style={{ padding: '0.75rem' }}>Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Vehicle Registrations</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Cached for 7 days to support duplicate dealer stock audits.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>User & Dealer Emails</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Retained for the lifetime of your active platform subscription.</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Payment Transaction Records</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Kept for 6 years to satisfy UK corporate tax reporting guidelines.</td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            4. Third Parties We Share Data With
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We share specific transaction details with reliable compliance platforms to run our service:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <li><strong>Dodo Payments / Stripe:</strong> Handles all transaction gateways and B2B subscription invoicing.</li>
            <li><strong>DVSA (Driver and Vehicle Standards Agency):</strong> Serves as our primary datasource for live MOT check records.</li>
            <li><strong>Resend:</strong> Distributes secure transactional registration receipts and diagnostic report notifications.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            5. Your Rights Under UK GDPR
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Under UK GDPR guidelines, you possess the absolute right to manage how your personal data is utilized:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <li><strong>Right of Access:</strong> Review a full summary of your transaction records.</li>
            <li><strong>Right of Rectification:</strong> Request changes to correct inaccurate email details.</li>
            <li><strong>Right of Erasure (Article 17):</strong> Request the permanent deletion of your payment histories and account configurations.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Cookie Policies
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            We utilize functional cookies solely to maintain active sessions, verify search quotas, and authenticate subscriptions. We do not use third-party cookies or advertising trackers on our platform.
          </p>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-yellow)', marginTop: '2rem', marginBottom: '1rem' }}>
            7. Contact Us
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            For all formal personal data requests or to exercise your rights under UK GDPR Article 17, contact our data manager:
            <br />
            Email: <strong style={{ color: 'var(--text-primary)' }}>privacy@isthiscarsafe.co.uk</strong>
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
