import React from 'react';
import { MdAir } from 'react-icons/md';
import { BsWind } from 'react-icons/bs';
import { TbAtom2, TbDropletFilled, TbFlame } from 'react-icons/tb';
import { GiChemicalDrop } from 'react-icons/gi';
import { WiDust } from 'react-icons/wi';

function level(val, thresholds) {
  if (val == null) return { label: 'N/A', color: '#4a5a78' };
  for (const t of thresholds) {
    if (val <= t.max) return { label: t.label, color: t.color };
  }
  return { label: 'Hazardous', color: '#fc4444' };
}

const THRESHOLDS = {
  pm2_5:           [{ max: 12,    label: 'Good',      color: '#68d391' }, { max: 35,   label: 'Moderate',  color: '#f6c90e' }, { max: 55,   label: 'Unhealthy', color: '#fc8181' }],
  pm10:            [{ max: 20,    label: 'Good',      color: '#68d391' }, { max: 50,   label: 'Moderate',  color: '#f6c90e' }, { max: 100,  label: 'Unhealthy', color: '#fc8181' }],
  carbon_monoxide: [{ max: 4400,  label: 'Good',      color: '#68d391' }, { max: 9400, label: 'Moderate',  color: '#f6c90e' }, { max: 12400,label: 'Unhealthy', color: '#fc8181' }],
  nitrogen_dioxide:[{ max: 40,    label: 'Good',      color: '#68d391' }, { max: 70,   label: 'Moderate',  color: '#f6c90e' }, { max: 150,  label: 'Unhealthy', color: '#fc8181' }],
  sulphur_dioxide: [{ max: 20,    label: 'Good',      color: '#68d391' }, { max: 80,   label: 'Moderate',  color: '#f6c90e' }, { max: 250,  label: 'Unhealthy', color: '#fc8181' }],
};

const styles = `
  .aqi-section {
    margin-top: 24px;
    animation: fadeUp 0.5s 0.2s ease both;
  }

  .aqi-section-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aqi-note {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 14px;
  }

  .aqi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }

  .aqi-tile {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, transform 0.2s;
  }

  .aqi-tile:hover {
    border-color: var(--border-accent);
    transform: translateY(-2px);
  }

  .aqi-tile.unavailable {
    opacity: 0.5;
  }

  .aqi-icon-box {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .aqi-text { flex: 1; min-width: 0; }

  .aqi-param {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 3px;
  }

  .aqi-val {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .aqi-unit {
    font-size: 11px;
    color: var(--text-muted);
    margin-left: 3px;
    font-weight: 400;
  }

  .aqi-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 3px;
    padding: 2px 7px;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    .aqi-grid { grid-template-columns: 1fr 1fr; }
  }
`;

function AqiTile({ icon, iconBg, param, value, unit, thKey, unavailable }) {
  const lv = unavailable
    ? { label: 'Not Available', color: '#4a5a78' }
    : level(value, THRESHOLDS[thKey] ?? []);

  return (
    <div className={`aqi-tile${unavailable ? ' unavailable' : ''}`}>
      <div className="aqi-icon-box" style={{ background: iconBg }}>{icon}</div>
      <div className="aqi-text">
        <div className="aqi-param">{param}</div>
        <div className="aqi-val" style={{ color: unavailable ? '#4a5a78' : lv.color }}>
          {unavailable ? '—' : value != null ? value.toFixed(1) : '—'}
          {!unavailable && <span className="aqi-unit">{unit}</span>}
        </div>
        <span
          className="aqi-badge"
          style={{ background: `${lv.color}22`, color: lv.color }}
        >
          {lv.label}
        </span>
      </div>
    </div>
  );
}

export default function AirQualityCard({ hourly }) {
  const nowHour = new Date().getHours();
  const idx     = Math.min(nowHour, (hourly?.time?.length ?? 1) - 1);
  const get     = (key) => hourly?.[key]?.[idx] ?? null;

  const metrics = [
    {
      param:   'PM2.5',
      value:   get('pm2_5'),
      unit:    'µg/m³',
      thKey:   'pm2_5',
      icon:    <WiDust size={24} color="#76e4f7" />,
      iconBg:  'rgba(118,228,247,0.1)',
    },
    {
      param:   'PM10',
      value:   get('pm10'),
      unit:    'µg/m³',
      thKey:   'pm10',
      icon:    <MdAir size={22} color="#63b3ed" />,
      iconBg:  'rgba(99,179,237,0.1)',
    },
    {
      param:   'Carbon Monoxide (CO)',
      value:   get('carbon_monoxide'),
      unit:    'µg/m³',
      thKey:   'carbon_monoxide',
      icon:    <TbFlame size={22} color="#f6c90e" />,
      iconBg:  'rgba(246,201,14,0.1)',
    },
    {
      param:   'Carbon Dioxide (CO₂)',
      value:   null,
      unit:    'ppm',
      thKey:   'co2',
      icon:    <TbAtom2 size={22} color="#8899bb" />,
      iconBg:  'rgba(136,153,187,0.1)',
      unavailable: true,   // Not provided by Open-Meteo
    },
    {
      param:   'Nitrogen Dioxide (NO₂)',
      value:   get('nitrogen_dioxide'),
      unit:    'µg/m³',
      thKey:   'nitrogen_dioxide',
      icon:    <TbDropletFilled size={22} color="#fc8181" />,
      iconBg:  'rgba(252,129,129,0.1)',
    },
    {
      param:   'Sulphur Dioxide (SO₂)',
      value:   get('sulphur_dioxide'),
      unit:    'µg/m³',
      thKey:   'sulphur_dioxide',
      icon:    <GiChemicalDrop size={22} color="#b794f4" />,
      iconBg:  'rgba(183,148,244,0.1)',
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="aqi-section">
        <div className="aqi-section-title">
          <MdAir size={20} color="#76e4f7" />
          Air Quality & Pollutants
        </div>
        <p className="aqi-note">
          ⚠️ CO₂ data is not available via Open-Meteo API — all other parameters are live.
        </p>
        <div className="aqi-grid">
          {metrics.map((m) => (
            <AqiTile key={m.param} {...m} />
          ))}
        </div>
      </div>
    </>
  );
}