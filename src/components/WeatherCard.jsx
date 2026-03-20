import React from 'react';
import * as WI from 'react-icons/wi';
import { WiHumidity, WiStrongWind, WiBarometer, WiRain, WiThermometer } from 'react-icons/wi';
import { TbUvIndex } from 'react-icons/tb';
import { MdVisibility, MdAir } from 'react-icons/md';
import { BsWind } from 'react-icons/bs';
import {
  getWeatherInfo, formatTemp, windDirection,
  uvLabel, formatVisibility, formatPressure,
} from '../utils/formatters';

// Renders any WI icon by name string
function WeatherIcon({ iconName, color, size }) {
  const Icon = WI[iconName] || WI.WiDayCloudy;
  return <Icon size={size} color={color} />;
}

const styles = `
  .hero-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    background: linear-gradient(145deg, #0d1a2e 0%, #080c14 100%);
    padding: 40px;
    margin-bottom: 24px;
    animation: fadeUp 0.5s ease both;
  }

  .hero-card::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,179,237,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 32px;
  }

  .hero-location {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent-blue);
    margin-bottom: 6px;
  }

  .hero-city {
    font-family: var(--font-display);
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .hero-condition {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 300;
    font-style: italic;
  }

  .hero-wi-icon {
    filter: drop-shadow(0 8px 32px rgba(99,179,237,0.35));
    animation: float 4s ease-in-out infinite;
    line-height: 0;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }

  .hero-temp-row {
    display: flex;
    align-items: baseline;
    gap: 18px;
    margin-bottom: 28px;
  }

  .hero-temp {
    font-family: var(--font-display);
    font-size: 100px;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-feels {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .stat-pill {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
  }

  .stat-pill:hover {
    background: rgba(99,179,237,0.06);
    border-color: var(--border-accent);
    transform: translateY(-2px);
  }

  .stat-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(99,179,237,0.1);
    flex-shrink: 0;
  }

  .stat-text { flex: 1; min-width: 0; }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 3px;
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .stat-sub {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 1px;
  }

  .daily-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    margin-top: 24px;
    animation: fadeUp 0.6s 0.15s ease both;
  }

  .day-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 10px;
    text-align: center;
    transition: border-color 0.2s, transform 0.2s, background 0.2s;
    cursor: default;
  }

  .day-card:hover {
    border-color: var(--border-accent);
    transform: translateY(-4px);
    background: var(--bg-card-hover);
  }

  .day-name {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .day-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    line-height: 0;
  }

  .day-high {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .day-low {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  @media (max-width: 900px) { .daily-row { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 768px) {
    .hero-card { padding: 24px; }
    .hero-city  { font-size: 28px; }
    .hero-temp  { font-size: 72px; }
  }
  @media (max-width: 480px) {
    .daily-row  { grid-template-columns: repeat(3, 1fr); }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

export default function WeatherCard({ data, locationName }) {
  if (!data) return null;

  const { current, daily } = data;
  const currentInfo = getWeatherInfo(current.weather_code, current.is_day);

  const stats = [
    { icon: <WiHumidity   size={26} color="#63b3ed" />, label: 'Humidity',   value: `${current.relative_humidity_2m}%` },
    { icon: <WiStrongWind size={26} color="#76e4f7" />, label: 'Wind',       value: `${Math.round(current.wind_speed_10m)} km/h`, sub: windDirection(current.wind_direction_10m) },
    { icon: <WiBarometer  size={26} color="#63b3ed" />, label: 'Pressure',   value: formatPressure(current.surface_pressure) },
    { icon: <TbUvIndex    size={22} color="#f6c90e" />, label: 'UV Index',   value: current.uv_index ?? '—', sub: uvLabel(current.uv_index) },
    { icon: <WiRain       size={26} color="#76e4f7" />, label: 'Precip.',    value: `${current.precipitation ?? 0} mm` },
    { icon: <MdVisibility size={22} color="#63b3ed" />, label: 'Visibility', value: formatVisibility(current.visibility) },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="hero-card">
        <div className="hero-top">
          <div>
            <div className="hero-location">📍 {locationName}</div>
            <div className="hero-city">{locationName.split(',')[0]}</div>
            <div className="hero-condition">{currentInfo.label}</div>
          </div>
          <div className="hero-wi-icon">
            <WeatherIcon iconName={currentInfo.iconName} color={currentInfo.color} size={100} />
          </div>
        </div>

        <div className="hero-temp-row">
          <div className="hero-temp">{formatTemp(current.temperature_2m)}</div>
          <div className="hero-feels">
            <WiThermometer size={20} color="#8899bb" />
            Feels like {formatTemp(current.apparent_temperature)}
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-pill" key={s.label}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-text">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {daily && (
        <div className="daily-row">
          {daily.time.map((date, i) => {
            const dayInfo = getWeatherInfo(daily.weather_code[i], 1);
            const label = i === 0
              ? 'Today'
              : new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div className="day-card" key={date}>
                <div className="day-name">{label}</div>
                <div className="day-icon">
                  <WeatherIcon iconName={dayInfo.iconName} color={dayInfo.color} size={34} />
                </div>
                <div className="day-high">{formatTemp(daily.temperature_2m_max[i])}</div>
                <div className="day-low">{formatTemp(daily.temperature_2m_min[i])}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---- AQI helper used by CurrentWeather page -------------------
export function AqiCard({ hourly }) {
  if (!hourly?.pm10) return null;

  // Get current hour index
  const now = new Date();
  const idx = hourly.time?.findIndex(t => new Date(t) >= now) ?? 0;
  const pm10  = hourly.pm10?.[idx]  ?? hourly.pm10?.[0]  ?? null;
  const pm2_5 = hourly.pm2_5?.[idx] ?? hourly.pm2_5?.[0] ?? null;

  function aqiLevel(val, type) {
    if (val == null) return { label: '—', color: '#8899bb' };
    if (type === 'pm2_5') {
      if (val <= 12)  return { label: 'Good',      color: '#68d391' };
      if (val <= 35)  return { label: 'Moderate',  color: '#f6c90e' };
      if (val <= 55)  return { label: 'Unhealthy', color: '#fc8181' };
      return           { label: 'Hazardous',  color: '#fc4444' };
    } else {
      if (val <= 20)  return { label: 'Good',      color: '#68d391' };
      if (val <= 50)  return { label: 'Moderate',  color: '#f6c90e' };
      if (val <= 100) return { label: 'Unhealthy', color: '#fc8181' };
      return           { label: 'Hazardous',  color: '#fc4444' };
    }
  }

  const pm25Level = aqiLevel(pm2_5, 'pm2_5');
  const pm10Level = aqiLevel(pm10,  'pm10');

  const aqiStyles = `
    .aqi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      margin-top: 16px;
      animation: fadeUp 0.5s 0.2s ease both;
      transition: border-color 0.2s;
    }
    .aqi-card:hover { border-color: var(--border-accent); }
    .aqi-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .aqi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .aqi-tile {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .aqi-icon-wrap {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .aqi-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 2px;
    }
    .aqi-value {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
    }
    .aqi-badge {
      font-size: 11px;
      font-weight: 600;
      margin-top: 2px;
    }
  `;

  return (
    <>
      <style>{aqiStyles}</style>
      <div className="aqi-card">
        <div className="aqi-header">
          <MdAir size={20} color="#76e4f7" />
          Air Quality Index
        </div>
        <div className="aqi-grid">
          <div className="aqi-tile">
            <div className="aqi-icon-wrap" style={{ background: `${pm25Level.color}18` }}>
              <BsWind size={20} color={pm25Level.color} />
            </div>
            <div>
              <div className="aqi-label">PM2.5</div>
              <div className="aqi-value" style={{ color: pm25Level.color }}>
                {pm2_5 != null ? `${pm2_5.toFixed(1)}` : '—'}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>µg/m³</span>
              </div>
              <div className="aqi-badge" style={{ color: pm25Level.color }}>{pm25Level.label}</div>
            </div>
          </div>

          <div className="aqi-tile">
            <div className="aqi-icon-wrap" style={{ background: `${pm10Level.color}18` }}>
              <MdAir size={20} color={pm10Level.color} />
            </div>
            <div>
              <div className="aqi-label">PM10</div>
              <div className="aqi-value" style={{ color: pm10Level.color }}>
                {pm10 != null ? `${pm10.toFixed(1)}` : '—'}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>µg/m³</span>
              </div>
              <div className="aqi-badge" style={{ color: pm10Level.color }}>{pm10Level.label}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}