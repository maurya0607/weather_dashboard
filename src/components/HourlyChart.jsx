import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Brush,
} from 'recharts';
import { WiThermometer, WiHumidity, WiRain, WiDayFog, WiStrongWind } from 'react-icons/wi';
import { MdAir } from 'react-icons/md';
import { formatHour } from '../utils/formatters';

const styles = `
  .hourly-section {
    margin-top: 24px;
    animation: fadeUp 0.5s 0.2s ease both;
  }

  .hourly-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chart-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .chart-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 13px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(255,255,255,0.03);
    color: var(--text-muted);
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .chart-tab:hover {
    color: var(--text-primary);
    background: rgba(255,255,255,0.06);
  }

  .chart-tab.active {
    background: var(--accent-blue);
    border-color: var(--accent-blue);
    color: var(--bg-primary);
  }

  .temp-toggle {
    margin-left: auto;
    display: flex;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .temp-toggle-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 700;
    border: none;
    background: transparent;
    color: var(--text-muted);
    transition: all 0.2s;
  }

  .temp-toggle-btn.active {
    background: var(--accent-blue);
    color: var(--bg-primary);
  }

  .chart-box {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 12px 8px;
    overflow-x: auto;
    transition: border-color 0.25s;
  }

  .chart-box:hover { border-color: var(--border-accent); }

  .chart-inner {
    min-width: 600px;
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  );
};

const TABS = [
  { key: 'temperature',  label: 'Temp',       icon: <WiThermometer size={16} /> },
  { key: 'humidity',     label: 'Humidity',   icon: <WiHumidity size={16} /> },
  { key: 'precipitation',label: 'Precip.',    icon: <WiRain size={16} /> },
  { key: 'visibility',   label: 'Visibility', icon: <WiDayFog size={16} /> },
  { key: 'wind',         label: 'Wind',       icon: <WiStrongWind size={16} /> },
  { key: 'pm',           label: 'PM10/2.5',   icon: <MdAir size={14} /> },
];

function toF(c) { return +(c * 9 / 5 + 32).toFixed(1); }

export default function HourlyChart({ hourly }) {
  const [activeTab, setActiveTab] = useState('temperature');
  const [unit, setUnit] = useState('C');

  const chartData = useMemo(() => {
    if (!hourly?.time) return [];
    return hourly.time.map((t, i) => ({
      time:        formatHour(t),
      Temperature: hourly.temperature_2m?.[i] ?? null,
      TempF:       hourly.temperature_2m?.[i] != null ? toF(hourly.temperature_2m[i]) : null,
      Humidity:    hourly.relative_humidity_2m?.[i] ?? null,
      Precipitation: hourly.precipitation?.[i] ?? 0,
      'Rain Prob': hourly.precipitation_probability?.[i] ?? null,
      Visibility:  hourly.visibility?.[i] != null ? +(hourly.visibility[i] / 1000).toFixed(2) : null,
      Wind:        hourly.wind_speed_10m?.[i] ?? null,
      PM10:        hourly.pm10?.[i] ?? null,
      'PM2.5':     hourly.pm2_5?.[i] ?? null,
    }));
  }, [hourly]);

  if (!hourly) return null;

  const gradId = (id) => `grad_${id}`;

  function renderChart() {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 24, left: -10, bottom: 0 },
    };
    const axisProps = {
      tick: { fill: 'var(--text-muted)', fontSize: 11 },
      tickLine: false,
      axisLine: false,
    };
    const gridProps = {
      strokeDasharray: '3 3',
      stroke: 'rgba(255,255,255,0.04)',
    };
    const brushProps = {
      dataKey: 'time',
      height: 20,
      stroke: 'var(--border-accent)',
      fill: 'var(--bg-secondary)',
      travellerWidth: 8,
    };

    if (activeTab === 'temperature') {
      const key = unit === 'C' ? 'Temperature' : 'TempF';
      const unitLabel = unit === 'C' ? '°C' : '°F';
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId('temp')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#63b3ed" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#63b3ed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit={unitLabel} />
          <Tooltip content={<CustomTooltip />} />
          <Brush {...brushProps} />
          <Area type="monotone" dataKey={key} name={`Temp (${unitLabel})`} stroke="#63b3ed" strokeWidth={2} fill={`url(#${gradId('temp')})`} dot={false} unit={unitLabel} />
        </AreaChart>
      );
    }

    if (activeTab === 'humidity') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId('hum')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#76e4f7" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#76e4f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit="%" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Brush {...brushProps} />
          <Area type="monotone" dataKey="Humidity" stroke="#76e4f7" strokeWidth={2} fill={`url(#${gradId('hum')})`} dot={false} unit="%" />
        </AreaChart>
      );
    }

    if (activeTab === 'precipitation') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit=" mm" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Brush {...brushProps} />
          <Bar dataKey="Precipitation" fill="#63b3ed" radius={[3, 3, 0, 0]} unit=" mm" />
          <Bar dataKey="Rain Prob" fill="#76e4f7" radius={[3, 3, 0, 0]} unit="%" />
        </BarChart>
      );
    }

    if (activeTab === 'visibility') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId('vis')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b794f4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b794f4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit=" km" />
          <Tooltip content={<CustomTooltip />} />
          <Brush {...brushProps} />
          <Area type="monotone" dataKey="Visibility" stroke="#b794f4" strokeWidth={2} fill={`url(#${gradId('vis')})`} dot={false} unit=" km" />
        </AreaChart>
      );
    }

    if (activeTab === 'wind') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId('wind')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#68d391" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#68d391" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit=" km/h" />
          <Tooltip content={<CustomTooltip />} />
          <Brush {...brushProps} />
          <Area type="monotone" dataKey="Wind" stroke="#68d391" strokeWidth={2} fill={`url(#${gradId('wind')})`} dot={false} unit=" km/h" />
        </AreaChart>
      );
    }

    if (activeTab === 'pm') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} unit=" µg/m³" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Brush {...brushProps} />
          <Line type="monotone" dataKey="PM10"  stroke="#f6c90e" strokeWidth={2} dot={false} unit=" µg/m³" />
          <Line type="monotone" dataKey="PM2.5" stroke="#fc8181" strokeWidth={2} dot={false} unit=" µg/m³" />
        </LineChart>
      );
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="hourly-section">
        <div className="hourly-title">
          <WiThermometer size={22} color="#63b3ed" />
          24-Hour Forecast
        </div>

        <div className="chart-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`chart-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}

          {activeTab === 'temperature' && (
            <div className="temp-toggle">
              <button
                className={`temp-toggle-btn ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
              >°C</button>
              <button
                className={`temp-toggle-btn ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
              >°F</button>
            </div>
          )}
        </div>

        <div className="chart-box">
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height={240}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}