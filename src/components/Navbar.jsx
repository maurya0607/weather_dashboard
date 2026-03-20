import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { geocodeCity } from '../services/weatherApi';

const styles = `
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0 24px;
    background: rgba(8, 12, 20, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: border-color 0.3s ease;
  }

  .navbar.scrolled {
    border-bottom-color: var(--border-accent);
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 68px;
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-logo {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.04em;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    color: var(--text-primary);
  }

  .nav-logo span {
    color: var(--accent-blue);
  }

  .logo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-cyan);
    box-shadow: 0 0 12px var(--accent-cyan);
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.6; }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-link {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }

  .nav-link:hover {
    color: var(--text-primary);
    background: rgba(255,255,255,0.05);
  }

  .nav-link.active {
    color: var(--accent-blue);
    background: rgba(99, 179, 237, 0.1);
  }

  .nav-search {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0;
    position: relative;
  }

  .search-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-right: none;
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    padding: 8px 14px;
    font-size: 14px;
    color: var(--text-primary);
    width: 220px;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .search-input:focus {
    border-color: var(--accent-blue);
    background: rgba(99, 179, 237, 0.05);
  }

  .search-btn {
    background: var(--accent-blue);
    border: none;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 8px 14px;
    color: var(--bg-primary);
    font-size: 16px;
    font-weight: 700;
    transition: background 0.2s, transform 0.15s;
  }

  .search-btn:hover {
    background: var(--accent-cyan);
    transform: scaleX(1.05);
  }

  .search-btn:active { transform: scaleX(0.97); }

  .search-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    z-index: 200;
  }

  .search-option {
    width: 100%;
    text-align: left;
    padding: 10px 16px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
    border-bottom: 1px solid var(--border);
  }

  .search-option:last-child { border-bottom: none; }

  .search-option:hover {
    background: rgba(99, 179, 237, 0.08);
    color: var(--text-primary);
  }

  .search-option strong {
    color: var(--text-primary);
    font-size: 14px;
    display: block;
  }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .search-input { width: 140px; }
  }
`;

export default function Navbar({ onLocationChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await geocodeCity(query);
      setResults(data.slice(0, 4));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function selectLocation(loc) {
    setResults([]);
    setQuery('');
    onLocationChange({ lat: loc.latitude, lon: loc.longitude, name: `${loc.name}, ${loc.country}` });
    navigate('/');
  }

  return (
    <>
      <style>{styles}</style>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="logo-dot" />
            Sky<span>Pulse</span>
          </div>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Current
            </NavLink>
            <NavLink to="/historical" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Historical
            </NavLink>
          </div>

          <div className="nav-search">
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <input
                className="search-input"
                type="text"
                placeholder="Search city…"
                value={query}
                onChange={e => { setQuery(e.target.value); if (!e.target.value) setResults([]); }}
              />
              <button className="search-btn" type="submit">
                {loading ? '…' : '→'}
              </button>
            </form>

            {results.length > 0 && (
              <div className="search-dropdown">
                {results.map((r) => (
                  <button
                    key={r.id}
                    className="search-option"
                    onClick={() => selectLocation(r)}
                  >
                    <strong>{r.name}</strong>
                    {r.admin1 ? `${r.admin1}, ` : ''}{r.country}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}