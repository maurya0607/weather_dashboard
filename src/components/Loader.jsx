import React from 'react';

const styles = `
  .loader-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 64px 24px;
    animation: fadeUp 0.3s ease both;
  }

  .loader-orbs {
    position: relative;
    width: 56px;
    height: 56px;
  }

  .loader-orb {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent-blue);
    animation: orbit 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  .loader-orb:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%);  animation-delay: 0s; }
  .loader-orb:nth-child(2) { top: 50%; right: 0; transform: translateY(-50%); animation-delay: -1.05s; background: var(--accent-cyan); }
  .loader-orb:nth-child(3) { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: -0.7s; }
  .loader-orb:nth-child(4) { top: 50%; left: 0; transform: translateY(-50%);  animation-delay: -0.35s; background: var(--accent-cyan); }

  @keyframes orbit {
    0%, 100% { opacity: 1; transform: scale(1) translateX(-50%); }
    50%       { opacity: 0.3; transform: scale(0.5) translateX(-50%); }
  }

  .loader-text {
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
`;

export default function Loader({ message = 'Fetching weather data…' }) {
  return (
    <>
      <style>{styles}</style>
      <div className="loader-wrap">
        <div className="loader-orbs">
          <div className="loader-orb" />
          <div className="loader-orb" />
          <div className="loader-orb" />
          <div className="loader-orb" />
        </div>
        <p className="loader-text">{message}</p>
      </div>
    </>
  );
}