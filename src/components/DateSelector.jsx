import React from 'react';
import { toDateInputValue, subtractDays } from '../utils/formatters';

const styles = `
  .date-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 28px;
    padding: 20px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    animation: fadeUp 0.45s ease both;
  }

  .date-selector label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .date-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    color-scheme: dark;
  }

  .date-input:focus {
    border-color: var(--accent-blue);
    background: rgba(99,179,237,0.05);
  }

  .date-separator {
    color: var(--text-muted);
    font-size: 14px;
  }

  .preset-btns {
    display: flex;
    gap: 6px;
    margin-left: 8px;
    flex-wrap: wrap;
  }

  .preset-btn {
    padding: 6px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s;
    white-space: nowrap;
  }

  .preset-btn:hover {
    background: rgba(99,179,237,0.1);
    border-color: var(--accent-blue);
    color: var(--accent-blue);
  }

  .fetch-btn {
    margin-left: auto;
    padding: 9px 20px;
    background: var(--accent-blue);
    border: none;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-display);
    color: var(--bg-primary);
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s;
  }

  .fetch-btn:hover { background: var(--accent-cyan); transform: translateY(-1px); }
  .fetch-btn:active { transform: translateY(0); }
  .fetch-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const PRESETS = [
  { label: 'Last 7 days',  days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function DateSelector({ startDate, endDate, onStartChange, onEndChange, onFetch, loading }) {
  const maxDate = toDateInputValue(subtractDays(new Date(), 1));

  function applyPreset(days) {
    const end = subtractDays(new Date(), 1);
    const start = subtractDays(new Date(), days);
    onStartChange(toDateInputValue(start));
    onEndChange(toDateInputValue(end));
  }

  return (
    <>
      <style>{styles}</style>
      <div className="date-selector">
        <label htmlFor="start-date">From</label>
        <input
          id="start-date"
          type="date"
          className="date-input"
          value={startDate}
          max={maxDate}
          onChange={e => onStartChange(e.target.value)}
        />
        <span className="date-separator">→</span>
        <label htmlFor="end-date">To</label>
        <input
          id="end-date"
          type="date"
          className="date-input"
          value={endDate}
          max={maxDate}
          onChange={e => onEndChange(e.target.value)}
        />

        <div className="preset-btns">
          {PRESETS.map(p => (
            <button key={p.days} className="preset-btn" onClick={() => applyPreset(p.days)}>
              {p.label}
            </button>
          ))}
        </div>

        <button className="fetch-btn" onClick={onFetch} disabled={loading}>
          {loading ? 'Loading…' : 'Fetch Data →'}
        </button>
      </div>
    </>
  );
}