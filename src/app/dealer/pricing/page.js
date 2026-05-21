'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
  const [formData, setFormData] = useState({ businessName: '', email: '', plan: 'basic' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openSubscriptionModal = (selectedPlan) => {
    setFormData(prev => ({ ...prev, plan: selectedPlan }));
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/dealer/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: formData.businessName,
          email: formData.email,
          plan: formData.plan
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to initiate checkout');
      }

      // Redirect to the checkout URL (or demo return success path)
      window.location.href = result.checkout_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          
          <span style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent-yellow)', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Dealer Intelligence Portal
          </span>
          
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '1rem' }}>
            Protect your stock. Protect your reviews.
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 4rem', lineHeight: '1.6' }}>
            Check your entire stock for hidden maintenance liabilities before you list. Flag the cars that will cost you customer returns.
          </p>

          {/* Pricing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '5rem' }}>
            
            {/* Basic Plan */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3rem 2rem', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Basic</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>Ideal for local independent dealers.</p>
              
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>£49</span>
                <span style={{ color: 'var(--text-secondary)' }}> / month</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <li>✔️ <strong>50</strong> automated vehicle checks per month</li>
                <li>✔️ Premium stock exposure dashboard</li>
                <li>✔️ Complete safety recall mapping</li>
                <li>✔️ Raw CSV reports export</li>
              </ul>

              <button
                onClick={() => openSubscriptionModal('basic')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '2px solid var(--text-primary)',
                  padding: '0.9rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  transition: 'var(--transition)'
                }}
              >
                Start 30-Day Free Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-yellow)', borderRadius: '6px', padding: '3rem 2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--accent-yellow)', color: 'var(--bg-secondary)', fontSize: '0.75rem', fontWeight: '900', padding: '0.25rem 0.6rem', borderRadius: '2px', fontFamily: 'var(--font-heading)' }}>
                POPULAR
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pro</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>Perfect for multi-site dealerships.</p>
              
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>£99</span>
                <span style={{ color: 'var(--text-secondary)' }}> / month</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <li>✔️ <strong>Unlimited</strong> vehicle checks</li>
                <li>✔️ Batch check API keys access</li>
                <li>✔️ White-label buyer reports (PDF format)</li>
                <li>✔️ Priority DVSA direct feed speeds</li>
              </ul>

              <button
                onClick={() => openSubscriptionModal('pro')}
                style={{
                  background: 'var(--accent-yellow)',
                  color: 'var(--bg-secondary)',
                  border: 'none',
                  padding: '0.9rem',
                  fontWeight: '900',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'var(--transition)'
                }}
              >
                Start 30-Day Free Trial
              </button>
            </div>

          </div>

          {/* FAQ SECTION */}
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>
              Frequently Asked Questions
            </h3>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>What counts as a check?</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  A check is logged whenever your account performs a search or includes a new registration in a batch check. Re-checking a vehicle within 7 days is completely free.
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Can I add more checks?</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Yes, Basic plan members can easily check additional vehicles at a cost of £1.50 per check, or scale directly to our unlimited Pro plan.
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Is there a free trial?</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Yes, all new signups include a comprehensive 30-day free trial. Your account is not billed until the end of your trial month.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Subscription Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2.5rem', maxWidth: '450px', width: '100%', position: 'relative' }}>
            
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
              Setup Your {formData.plan} Trial
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Apex Used Cars"
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.75rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Business Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="dealer@apex.co.uk"
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.75rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
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
                {loading ? 'Initiating...' : 'Proceed to Checkout'}
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
