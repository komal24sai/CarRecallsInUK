'use client';

import { useState, useEffect } from 'react';
import './CheckoutModal.css';

// Lazy-load the Dodo SDK only on the client side to avoid SSR crashes.
// dodopayments-checkout accesses window/document at import time.
let DodoPayments = null;
let sdkInitialised = false;

async function getSDK() {
  if (DodoPayments) return DodoPayments;
  const mod = await import('dodopayments-checkout');
  DodoPayments = mod.DodoPayments;
  return DodoPayments;
}

function initSDK(sdk, onEvent) {
  if (sdkInitialised) return;
  sdk.Initialize({
    mode: 'test',          // 'live' when Dodo merchant account is approved for live payments
    displayType: 'overlay',
    onEvent,
  });
  sdkInitialised = true;
}

export default function CheckoutModal({ isOpen, onClose, onPaymentSuccess, amount = '9.99', registration }) {
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load and initialise SDK when modal first opens
  useEffect(() => {
    if (!isOpen) return;
    getSDK().then((sdk) => {
      initSDK(sdk, (event) => {
        switch (event.event_type) {
          case 'checkout.opened':
            setIsLoading(false);
            break;
          case 'checkout.redirect':
            // Payment completing — Dodo will redirect to return_url
            onPaymentSuccess?.();
            onClose?.();
            break;
          case 'checkout.closed':
            setIsLoading(false);
            onClose?.();
            break;
          case 'checkout.error':
            console.error('[Checkout] Error:', event.data?.message);
            setError('Checkout encountered an error. Please try again.');
            setIsLoading(false);
            break;
          case 'checkout.link_expired':
            setError('Your checkout session expired. Please try again.');
            setIsLoading(false);
            break;
          default:
            break;
        }
      });
    });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create a checkout session on our server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim() || 'Customer',
          registration: registration || '',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // 2. Open the Dodo overlay with the session URL
      const sdk = await getSDK();
      await sdk.Checkout.open({
        checkoutUrl: data.checkoutUrl,
        options: {
          showTimer: true,
          showSecurityBadge: true,
          themeConfig: {
            dark: {
              bgPrimary: '#0d0d1a',
              bgSecondary: '#1a1a2e',
              borderPrimary: '#2d2d5e',
              textPrimary: '#ffffff',
              textSecondary: '#a0a0c0',
              buttonPrimary: '#7c3aed',
              buttonPrimaryHover: '#6d28d9',
              buttonTextPrimary: '#ffffff',
            },
            radius: '12px',
          },
        },
      });
    } catch (err) {
      console.error('[Checkout]', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-card" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h3 style={{ margin: 0 }}>Unlock Forensic Report</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
            aria-label="Close checkout"
          >
            &times;
          </button>
        </div>

        <div className="checkout-body">
          {/* What's included */}
          <div
            style={{
              background: 'rgba(124,58,237,0.08)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#a78bfa' }}>
              🔓 WHAT'S INCLUDED:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.4rem',
              }}
            >
              <li>🧠 AI Forensic Verdict</li>
              <li>🛡️ Finance &amp; Stolen Check</li>
              <li>📊 Market Valuation</li>
              <li>💰 Maintenance Forecast</li>
              <li>📉 Mileage Auditing</li>
              <li>🚗 Owner History</li>
            </ul>
          </div>

          {/* Price */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>One-time payment</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>£{amount}</div>
          </div>

          {/* Form */}
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-name">Full Name (optional)</label>
              <input
                id="checkout-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="John Smith"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-email">Email for Receipt *</label>
              <input
                id="checkout-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="status-message status-error">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              className="pay-btn"
              disabled={isLoading}
              id="dodo-checkout-submit"
            >
              {isLoading ? 'Opening Secure Checkout…' : `Pay £${amount} Securely`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Secured by Dodo Payments · 256-bit Encryption · PCI-DSS Compliant
          </div>
        </div>
      </div>
    </div>
  );
}
