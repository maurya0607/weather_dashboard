import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Brush,
} from 'recharts';
import { WiThermometer, WiSunrise, WiSunset, WiRain, WiStrongWind } from 'react-icons/wi';
import { MdAir } from 'react-icons/md';
import { TbCompass } from 'react-icons/tb';
import DateSelector from '../components/DateSelector';
import Loader from '../components/Loader';
import { fetchHistoricalWeather } from '../services/weatherApi';
import { formatDate, toDateInputValue, subtractDays } from '../utils/formatters';

const styles = `
  .hist-page {
    padding: 28px 24px 56px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .hist-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .hist-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 24px;
  }
  .summary-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    animation: fadeUp 0.45s ease both;
  }
  .summary-tile {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .summary-tile:hover { border-color: var(--border-accent); transform: translateY(-2px); }
  .tile-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .tile-label {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 3px;
  }
  .tile-value {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.03em; color: var(--text-primary);
  }
  .tile-unit { font-size: 12px; color: var(--text-secondary); margin-left: 3px; }
  .charts-stack { display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.5s 0.1s ease both; }
  .hist-chart-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px 16px 12px;
    overflow-x: auto;
    transition: border-color 0.25s;
  }
  .hist-chart-card:hover { border-color: var(--border-accent); }
  .hist-chart-inner { min-width: 600px; }
  .chart-card-title {
    font-family: var(--font-display);
    font-size: 15px; font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 7px;
  }
  .error-box {
    background: rgba(252,129,129,0.08);
    border: 1px solid rgba(252,129,129,0.3);
    border-radius: var(--radius-md);
    padding: 20px 24px; color: var(--accent-red); font-size: 14px;
  }
  .empty-state { text-align: center; padding: 64px 24px; color: var(--text-muted); }
  .empty-icon  { display: flex; justify-content: center; margin-bottom: 16px; opacity: 0.4; }
  .empty-state p { font-size: 15px; }
  @media (max-width: 768px) {
    .summary-row { grid-template-columns: repeat(2, 1fr); }
    .hist-page   { padding: 16px 14px 40px; }
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value ?? '—'}
        </p>
      ))}
    </div>
  );
};

function toIST(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
}

const brushProps = { height: 20, stroke: 'var(--border-accent)', fill: 'var(--bg-secondary)', travellerWidth: 8 };
const axisProps  = { tick: { fill: 'var(--text-muted)', fontSize: 10 }, tickLine: false, axisLine: false };
const gridProps  = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.04)' };

function ChartCard({ title, icon, children }) {
  return (
    <div className="hist-chart-card">
      <div className="chart-card-title">{icon}{title}</div>
      <div className="hist-chart-inner">
        <ResponsiveContainer width="100%" height={220}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function HistoricalWeather({ location }) {
  const defaultEnd   = toDateInputValue(subtractDays(new Date(), 1));
  const defaultStart = toDateInputValue(subtractDays(new Date(), 30));

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate,   setEndDate]   = useState(defaultEnd);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  async function handleFetch() {
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetchHistoricalWeather(location.lat, location.lon, startDate, endDate);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = data?.daily
    ? data.daily.time.map((t, i) => ({
        date:      formatDate(t, { month: 'short', day: 'numeric' }),
        'Max Temp':  data.daily.temperature_2m_max?.[i]  != null ? +data.daily.temperature_2m_max[i].toFixed(1)  : null,
        'Min Temp':  data.daily.temperature_2m_min?.[i]  != null ? +data.daily.temperature_2m_min[i].toFixed(1)  : null,
        'Mean Temp': data.daily.temperature_2m_mean?.[i] != null ? +data.daily.temperature_2m_mean[i].toFixed(1) : null,
        'Precip.':   +(data.daily.precipitation_sum?.[i] ?? 0).toFixed(1),
        'Max Wind':  data.daily.wind_speed_10m_max?.[i]  != null ? +data.daily.wind_speed_10m_max[i].toFixed(1)  : null,
        'Wind Dir':  data.daily.wind_direction_10m_dominant?.[i] ?? null,
        'PM10':      data.daily.pm10?.[i]               != null ? +data.daily.pm10[i].toFixed(1)               : null,
        'PM2.5':     data.daily.pm2_5?.[i]              != null ? +data.daily.pm2_5[i].toFixed(1)              : null,
        'CO':        data.daily.carbon_monoxide?.[i]    != null ? +data.daily.carbon_monoxide[i].toFixed(1)    : null,
        'NO₂':       data.daily.nitrogen_dioxide?.[i]   != null ? +data.daily.nitrogen_dioxide[i].toFixed(1)   : null,
        'SO₂':       data.daily.sulphur_dioxide?.[i]    != null ? +data.daily.sulphur_dioxide[i].toFixed(1)    : null,
        'Sunrise':   toIST(data.daily.sunrise?.[i]),
        'Sunset':    toIST(data.daily.sunset?.[i]),
      }))
    : [];

  const summary = data?.daily ? (() => {
    const max  = data.daily.temperature_2m_max?.filter(v => v != null) ?? [];
    const min  = data.daily.temperature_2m_min?.filter(v => v != null) ?? [];
    const prec = data.daily.precipitation_sum?.filter(v => v != null)  ?? [];
    const wind = data.daily.wind_speed_10m_max?.filter(v => v != null) ?? [];
    const avg  = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '—';
    return {
      avgMax:      avg(max),
      avgMin:      avg(min),
      totalPrecip: prec.reduce((a, b) => a + b, 0).toFixed(1),
      maxWind:     wind.length ? Math.max(...wind).toFixed(0) : '—',
    };
  })() : null;

  const TILES = [
    { label: 'Avg High',   key: 'avgMax',      unit: '°C',   icon: <WiThermometer size={22} color="#fc8181" />, bg: 'rgba(252,129,129,0.1)' },
    { label: 'Avg Low',    key: 'avgMin',       unit: '°C',   icon: <WiThermometer size={22} color="#63b3ed" />, bg: 'rgba(99,179,237,0.1)'  },
    { label: 'Total Rain', key: 'totalPrecip',  unit: 'mm',   icon: <WiRain size={22} color="#76e4f7" />,        bg: 'rgba(118,228,247,0.1)' },
    { label: 'Peak Wind',  key: 'maxWind',      unit: 'km/h', icon: <WiStrongWind size={22} color="#68d391" />,  bg: 'rgba(104,211,145,0.1)' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="hist-page page-enter">
        <h1 className="hist-title">Historical Weather</h1>
        <p className="hist-subtitle">Explore past weather for {location.name} — up to 2 years</p>

        <DateSelector startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} onFetch={handleFetch} loading={loading} />

        {loading && <Loader message="Fetching historical data…" />}
        {error   && <div className="error-box">⚠️ {error}</div>}

        {!loading && !error && !data && (
          <div className="empty-state">
            <div className="empty-icon"><WiThermometer size={56} color="#4a5a78" /></div>
            <p>Select a date range and click <strong>Fetch Data</strong>.</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {summary && (
              <div className="summary-row">
                {TILES.map(t => (
                  <div className="summary-tile" key={t.key}>
                    <div className="tile-icon-wrap" style={{ background: t.bg }}>{t.icon}</div>
                    <div>
                      <div className="tile-label">{t.label}</div>
                      <div className="tile-value">{summary[t.key]}<span className="tile-unit">{t.unit}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="charts-stack">

              {/* 1. Temperature */}
              <ChartCard title="Temperature — Mean, Max & Min (°C)" icon={<WiThermometer size={18} color="#fc8181" />}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    {[['maxG','#fc8181'],['minG','#63b3ed'],['meanG','#f6c90e']].map(([id,c]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} unit="°C" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Brush dataKey="date" {...brushProps} />
                  <Area type="monotone" dataKey="Max Temp"  stroke="#fc8181" strokeWidth={2} fill="url(#maxG)"  dot={false} />
                  <Area type="monotone" dataKey="Min Temp"  stroke="#63b3ed" strokeWidth={2} fill="url(#minG)"  dot={false} />
                  <Area type="monotone" dataKey="Mean Temp" stroke="#f6c90e" strokeWidth={2} fill="url(#meanG)" dot={false} />
                </AreaChart>
              </ChartCard>

              {/* 2. Sunrise & Sunset IST */}
              <ChartCard title="Sun Cycle — Sunrise & Sunset (IST)" icon={<WiSunrise size={18} color="#f6c90e" />}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Brush dataKey="date" {...brushProps} />
                  <Line type="monotone" dataKey="Sunrise" stroke="#f6c90e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Sunset"  stroke="#fc8181" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartCard>

              {/* 3. Precipitation */}
              <ChartCard title="Daily Precipitation (mm)" icon={<WiRain size={18} color="#76e4f7" />}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} unit=" mm" />
                  <Tooltip content={<CustomTooltip />} />
                  <Brush dataKey="date" {...brushProps} />
                  <Bar dataKey="Precip." fill="#76e4f7" radius={[3,3,0,0]} />
                </BarChart>
              </ChartCard>

              {/* 4. Wind Speed + Direction */}
              <ChartCard title="Max Wind Speed & Dominant Direction" icon={<WiStrongWind size={18} color="#68d391" />}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="windG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#68d391" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#68d391" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} yAxisId="left" unit=" km/h" />
                  <YAxis {...axisProps} yAxisId="right" orientation="right" unit="°" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Brush dataKey="date" {...brushProps} />
                  <Area yAxisId="left"  type="monotone" dataKey="Max Wind" stroke="#68d391" strokeWidth={2} fill="url(#windG)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="Wind Dir" stroke="#f6c90e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ChartCard>

              {/* 5. PM10 + PM2.5 */}
              <ChartCard title="Air Quality — PM10 & PM2.5 (µg/m³)" icon={<MdAir size={16} color="#76e4f7" />}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} unit=" µg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Brush dataKey="date" {...brushProps} />
                  <Line type="monotone" dataKey="PM10"  stroke="#f6c90e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="PM2.5" stroke="#fc8181" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartCard>

              {/* 6. CO, NO2, SO2 */}
              <ChartCard title="Pollutants — CO, NO₂ & SO₂ (µg/m³)" icon={<MdAir size={16} color="#b794f4" />}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} unit=" µg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  <Brush dataKey="date" {...brushProps} />
                  <Line type="monotone" dataKey="CO"  stroke="#f6c90e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="NO₂" stroke="#fc8181" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="SO₂" stroke="#b794f4" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartCard>

            </div>
          </>
        )}
      </div>
    </>
  );
}