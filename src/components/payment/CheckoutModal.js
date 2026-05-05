'use client';

import { useState } from 'react';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, onPaymentSuccess, amount = '9.99' }) {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    email: '',
    phone: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return Object.values(formData).every(val => val.trim() !== '');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setIsProcessing(true);
    setStatus(null);

    // Simulate Payment API Call
    setTimeout(() => {
      // Simulate 90% success rate for the demo
      const isSuccessful = Math.random() > 0.1;

      if (isSuccessful) {
        setStatus('success');
        // Simulate sending notifications
        console.log(`[Notification] Receipt sent to ${formData.email} and SMS to ${formData.phone}`);
        
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      } else {
        setStatus('error');
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-card" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <h3 style={{ margin: 0 }}>Unlock Forensic Report</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>
        
        <div className="checkout-body">
          <div style={{ background: 'rgba(var(--accent-purple-rgb), 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(var(--accent-purple-rgb), 0.1)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>🔓 WHAT'S INCLUDED:</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <li>🧠 AI Forensic Verdict</li>
              <li>🛡️ Finance & Stolen Check</li>
              <li>📊 Market Valuation</li>
              <li>💰 Maintenance Forecast</li>
              <li>📉 Mileage Auditing</li>
              <li>🚗 Owner History</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>£{amount}</div>
          </div>

          <div className="payment-methods">
            <div className="method-btn active">💳 Card</div>
            <div className="method-btn"> Pay</div>
          </div>

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" name="cardName" className="form-input" placeholder="John Doe"
                value={formData.cardName} onChange={handleInputChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input 
                type="text" name="cardNumber" className="form-input" placeholder="xxxx xxxx xxxx xxxx"
                value={formData.cardNumber} onChange={handleInputChange} required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input 
                  type="text" name="expiry" className="form-input" placeholder="MM/YY"
                  value={formData.expiry} onChange={handleInputChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input 
                  type="password" name="cvv" className="form-input" placeholder="***"
                  value={formData.cvv} onChange={handleInputChange} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email for Receipt</label>
              <input 
                type="email" name="email" className="form-input" placeholder="your@email.com"
                value={formData.email} onChange={handleInputChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone for SMS Notification</label>
              <input 
                type="tel" name="phone" className="form-input" placeholder="+44 7..."
                value={formData.phone} onChange={handleInputChange} required
              />
            </div>

            {status === 'success' && (
              <div className="status-message status-success">
                ✅ Payment Successful! Authenticating...
              </div>
            )}

            {status === 'error' && (
              <div className="status-message status-error">
                ❌ {validateForm() ? 'Payment Failed. Please check your card details.' : 'All fields are required.'}
              </div>
            )}

            <button type="submit" className="pay-btn" disabled={isProcessing || status === 'success'}>
              {isProcessing ? 'Processing Securely...' : `Pay £${amount} Securely`}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Secured by Stripe & 256-bit Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
