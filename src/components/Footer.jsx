import React from 'react';

const styles = `
  .footer {
    margin-top: auto;
    padding: 24px;
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer-brand {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text-muted);
  }

  .footer-brand span { color: var(--accent-blue); }

  .footer-note {
    font-size: 12px;
    color: var(--text-muted);
  }

  .footer-note a {
    color: var(--accent-blue);
    transition: color 0.2s;
  }

  .footer-note a:hover { color: var(--accent-cyan); }
`;

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Sky<span>Pulse</span></div>
          <p className="footer-note">
            Powered by{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{' '}
            — free & open-source weather API
          </p>
          <p className="footer-note">© {new Date().getFullYear()} SkyPulse</p>
        </div>
      </footer>
    </>
  );
}