import React from 'react';
import { BsCalendar3 } from 'react-icons/bs';
import { MdMyLocation } from 'react-icons/md';
import { toDateInputValue } from '../utils/formatters';

const styles = `
  .datepicker-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
    animation: fadeUp 0.4s ease both;
  }

  .datepicker-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .datepicker-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    color-scheme: dark;
    cursor: pointer;
  }

  .datepicker-input:focus {
    border-color: var(--accent-blue);
    background: rgba(99,179,237,0.05);
  }

  .datepicker-today-btn {
    padding: 8px 16px;
    background: rgba(99,179,237,0.1);
    border: 1px solid var(--border-accent);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-blue);
    transition: all 0.2s;
    white-space: nowrap;
  }

  .datepicker-today-btn:hover {
    background: rgba(99,179,237,0.2);
    transform: translateY(-1px);
  }

  .datepicker-today-btn:active {
    transform: translateY(0);
  }

  .gps-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(104,211,145,0.1);
    border: 1px solid rgba(104,211,145,0.3);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    color: #68d391;
    transition: all 0.2s;
    margin-left: auto;
    white-space: nowrap;
  }

  .gps-btn:hover {
    background: rgba(104,211,145,0.2);
    transform: translateY(-1px);
  }

  .gps-btn:active {
    transform: translateY(0);
  }

  .gps-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .gps-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #68d391;
    animation: pulse-dot 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.6); opacity: 0.4; }
  }

  @media (max-width: 640px) {
    .datepicker-bar { padding: 12px 14px; gap: 8px; }
    .gps-btn        { margin-left: 0; width: 100%; justify-content: center; }
  }
`;

export default function DatePickerBar({ selectedDate, onDateChange, onGpsClick, gpsLoading }) {
  const today = toDateInputValue();

  return (
    <>
      <style>{styles}</style>
      <div className="datepicker-bar">

        {/* Calendar icon + label */}
        <span className="datepicker-label">
          <BsCalendar3 size={14} color="#63b3ed" />
          Date
        </span>

        {/* Date input — NO max so future dates work too */}
        <input
          type="date"
          className="datepicker-input"
          value={selectedDate}
          onChange={e => onDateChange(e.target.value)}
        />

        {/* Today shortcut */}
        <button
          className="datepicker-today-btn"
          onClick={() => onDateChange(today)}
        >
          Today
        </button>

        {/* GPS button */}
        <button
          className="gps-btn"
          onClick={onGpsClick}
          disabled={gpsLoading}
        >
          {gpsLoading ? (
            <>
              <div className="gps-dot" />
              Detecting…
            </>
          ) : (
            <>
              <MdMyLocation size={15} />
              Use My Location
            </>
          )}
        </button>

      </div>
    </>
  );
}