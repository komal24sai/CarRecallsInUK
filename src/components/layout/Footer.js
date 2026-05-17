export default function Footer() {
  return (
    <footer style={{
      background: '#0D0F14',
      borderTop: '1px solid #262B38',
      padding: '3rem 2rem',
      textAlign: 'center',
      color: '#A0AEC0',
      fontSize: '0.9rem',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Brand Casing */}
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 'bold', color: '#FFFFFF' }}>
          IsThisCarSafe
        </div>

        {/* Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontWeight: '600' }}>
          <a href="/privacy" style={{ hover: { color: '#E8FF00' } }}>Privacy Policy</a>
          <span>|</span>
          <a href="/terms">Terms</a>
          <span>|</span>
          <a href="/about">About</a>
          <span>|</span>
          <a href="/api-docs">Dealer API</a>
        </div>

        {/* Not affiliated notice */}
        <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '600px', margin: '0 auto', lineHeight: '1.4' }}>
          Data sourced from DVSA — not affiliated with or endorsed by DVSA
        </p>

        {/* Copyright */}
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
          IsThisCarSafe © 2026
        </p>

      </div>
    </footer>
  );
}
