export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <ul className="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="https://carrecallsai.com" target="_blank" rel="noopener">Global Platform</a></li>
        </ul>
        <p>© 2026 CarRecalls UK · Data sourced from DVSA MOT History API</p>
        <p style={{ marginTop: '0.25rem' }}>Built by Venkata Komal Sai Mantha · Bronze → Silver → Gold Architecture</p>
      </div>
    </footer>
  );
}
