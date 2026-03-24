// import React, { useEffect, useState, useCallback } from 'react';
// import { WiSunrise, WiSunset, WiThermometer, WiRain, WiStrongWind, WiHumidity } from 'react-icons/wi';
// import { TbUvIndex } from 'react-icons/tb';
// import { MdWaterDrop } from 'react-icons/md';
// import { BsCloudRain } from 'react-icons/bs';
// import WeatherCard from '../components/WeatherCard';
// import HourlyChart from '../components/HourlyChart';
// import AirQualityCard from '../components/AirQualityCard';
// import DatePickerBar from '../components/DatePickerBar';
// import Loader from '../components/Loader';
// import { fetchCurrentWeather, fetchWeekForecast } from '../services/weatherApi';
// import { toDateInputValue, formatTemp } from '../utils/formatters';

// const styles = `
//   .current-page {
//     padding: 28px 24px 48px;
//     max-width: 1200px;
//     margin: 0 auto;
//   }

//   .error-box {
//     background: rgba(252,129,129,0.08);
//     border: 1px solid rgba(252,129,129,0.3);
//     border-radius: var(--radius-md);
//     padding: 20px 24px;
//     color: var(--accent-red);
//     font-size: 14px;
//     display: flex;
//     align-items: center;
//     gap: 10px;
//   }

//   /* ── Quick stats bar ── */
//   .quick-stats {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
//     gap: 10px;
//     margin-bottom: 20px;
//     animation: fadeUp 0.45s ease both;
//   }

//   .qs-tile {
//     background: var(--bg-card);
//     border: 1px solid var(--border);
//     border-radius: var(--radius-md);
//     padding: 14px 16px;
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     transition: border-color 0.2s, transform 0.2s;
//   }

//   .qs-tile:hover {
//     border-color: var(--border-accent);
//     transform: translateY(-2px);
//   }

//   .qs-icon {
//     width: 36px; height: 36px;
//     border-radius: 9px;
//     display: flex; align-items: center; justify-content: center;
//     flex-shrink: 0;
//   }

//   .qs-label {
//     font-size: 10px;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: var(--text-muted);
//     margin-bottom: 2px;
//   }

//   .qs-value {
//     font-family: var(--font-display);
//     font-size: 16px;
//     font-weight: 700;
//     color: var(--text-primary);
//   }

//   /* ── Sunrise / Sunset ── */
//   .sunrise-row {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//     margin-top: 20px;
//     animation: fadeUp 0.6s 0.35s ease both;
//   }

//   .sun-card {
//     background: var(--bg-card);
//     border: 1px solid var(--border);
//     border-radius: var(--radius-lg);
//     padding: 20px 24px;
//     display: flex;
//     align-items: center;
//     gap: 16px;
//     transition: border-color 0.2s, transform 0.2s;
//   }

//   .sun-card:hover {
//     border-color: var(--border-accent);
//     transform: translateY(-2px);
//   }

//   .sun-icon {
//     display: flex; align-items: center; justify-content: center;
//     width: 52px; height: 52px;
//     border-radius: 14px;
//     background: rgba(246,201,14,0.08);
//     flex-shrink: 0;
//   }

//   .sun-label {
//     font-size: 11px;
//     text-transform: uppercase;
//     letter-spacing: 0.1em;
//     color: var(--text-muted);
//     margin-bottom: 4px;
//   }

//   .sun-time {
//     font-family: var(--font-display);
//     font-size: 22px;
//     font-weight: 700;
//     color: var(--text-primary);
//   }

//   @media (max-width: 640px) {
//     .current-page { padding: 16px 14px 40px; }
//     .sunrise-row  { grid-template-columns: 1fr; }
//     .quick-stats  { grid-template-columns: repeat(2, 1fr); }
//   }
// `;

// function sunTime(iso) {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
// }

// export default function CurrentWeather({ location, onLocationChange }) {
//   const [data,       setData]       = useState(null);
//   const [weekData,   setWeekData]   = useState(null);
//   const [loading,    setLoading]    = useState(true);
//   const [error,      setError]      = useState('');
//   const [selDate,    setSelDate]    = useState(toDateInputValue());
//   const [gpsLoading, setGpsLoading] = useState(false);

//   // ── Fetch weather for selected date ──
//   const load = useCallback(async (lat, lon, date) => {
//     setLoading(true); setError('');
//     try {
//       const [cur, week] = await Promise.all([
//         fetchCurrentWeather(lat, lon, date),
//         fetchWeekForecast(lat, lon),
//       ]);
//       setData(cur);
//       setWeekData(week);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load(location.lat, location.lon, selDate);
//   }, [location.lat, location.lon, selDate]);

//   // ── GPS auto-detect ──
//   function handleGps() {
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser.');
//       return;
//     }
//     setGpsLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude: lat, longitude: lon } = pos.coords;
//         onLocationChange({ lat, lon, name: `My Location (${lat.toFixed(2)}, ${lon.toFixed(2)})` });
//         setGpsLoading(false);
//       },
//       () => {
//         setError('Could not get your location. Please allow location access.');
//         setGpsLoading(false);
//       }
//     );
//   }

//   // ── Quick stat tiles ──
//   function QuickStats({ daily }) {
//     if (!daily) return null;
//     const d = daily;
//     const tiles = [
//       { icon: <WiThermometer size={22} color="#fc8181" />, bg: 'rgba(252,129,129,0.1)', label: 'Max Temp',    value: formatTemp(d.temperature_2m_max?.[0]) },
//       { icon: <WiThermometer size={22} color="#63b3ed" />, bg: 'rgba(99,179,237,0.1)',  label: 'Min Temp',    value: formatTemp(d.temperature_2m_min?.[0]) },
//       { icon: <WiRain size={22} color="#76e4f7" />,        bg: 'rgba(118,228,247,0.1)', label: 'Precip.',     value: `${d.precipitation_sum?.[0] ?? 0} mm` },
//       { icon: <BsCloudRain size={18} color="#63b3ed" />,   bg: 'rgba(99,179,237,0.1)', label: 'Rain Prob.',  value: `${d.precipitation_probability_max?.[0] ?? '—'}%` },
//       { icon: <WiStrongWind size={22} color="#68d391" />,  bg: 'rgba(104,211,145,0.1)',label: 'Max Wind',    value: `${d.wind_speed_10m_max?.[0] ?? '—'} km/h` },
//       { icon: <TbUvIndex size={20} color="#f6c90e" />,     bg: 'rgba(246,201,14,0.1)', label: 'UV Index',    value: d.uv_index_max?.[0] ?? '—' },
//     ];
//     return (
//       <div className="quick-stats">
//         {tiles.map(t => (
//           <div className="qs-tile" key={t.label}>
//             <div className="qs-icon" style={{ background: t.bg }}>{t.icon}</div>
//             <div>
//               <div className="qs-label">{t.label}</div>
//               <div className="qs-value">{t.value}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="current-page page-enter">

//         <DatePickerBar
//           selectedDate={selDate}
//           onDateChange={setSelDate}
//           onGpsClick={handleGps}
//           gpsLoading={gpsLoading}
//         />

//         {loading && <Loader />}

//         {error && <div className="error-box">⚠️ {error}</div>}

//         {!loading && !error && data && (
//           <>
//             {/* Quick daily stats row */}
//             <QuickStats daily={data.daily} />

//             {/* Hero weather card + 7-day forecast */}
//             <WeatherCard data={{ ...data, daily: weekData?.daily ?? data.daily }} locationName={location.name} />

//             {/* Hourly charts — all 6 tabs */}
//             <HourlyChart hourly={data.hourly} />

//             {/* Air Quality section */}
//             <AirQualityCard hourly={data.hourly} />

//             {/* Sunrise / Sunset */}
//             {data.daily && (
//               <div className="sunrise-row">
//                 <div className="sun-card">
//                   <div className="sun-icon">
//                     <WiSunrise size={36} color="#f6c90e" />
//                   </div>
//                   <div>
//                     <div className="sun-label">Sunrise</div>
//                     <div className="sun-time">{sunTime(data.daily.sunrise?.[0])}</div>
//                   </div>
//                 </div>
//                 <div className="sun-card">
//                   <div className="sun-icon">
//                     <WiSunset size={36} color="#f6a90e" />
//                   </div>
//                   <div>
//                     <div className="sun-label">Sunset</div>
//                     <div className="sun-time">{sunTime(data.daily.sunset?.[0])}</div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// }

// ============================================================
// CurrentWeather.jsx — Page 1
// Displays weather for a selected date (default: today).
// GPS is handled in App.jsx and passed as `location` prop.
// User can also manually trigger GPS from DatePickerBar.
// ============================================================
 
import React, { useEffect, useState, useCallback } from 'react';
import {
  WiSunrise, WiSunset, WiThermometer,
  WiRain, WiStrongWind, WiHumidity,
} from 'react-icons/wi';
import { TbUvIndex } from 'react-icons/tb';
import { BsCloudRain } from 'react-icons/bs';
 
import WeatherCard    from '../components/WeatherCard';
import HourlyChart    from '../components/HourlyChart';
import AirQualityCard from '../components/AirQualityCard';
import DatePickerBar  from '../components/DatePickerBar';
import Loader         from '../components/Loader';
 
import { fetchCurrentWeather, fetchWeekForecast } from '../services/weatherApi';
import { toDateInputValue, formatTemp } from '../utils/formatters';
 
const styles = `
  .current-page {
    padding: 28px 24px 56px;
    max-width: 1200px;
    margin: 0 auto;
  }
 
  .error-box {
    background: rgba(252,129,129,0.08);
    border: 1px solid rgba(252,129,129,0.3);
    border-radius: var(--radius-md);
    padding: 20px 24px;
    color: var(--accent-red);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
 
  /* Quick daily summary tiles */
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
    animation: fadeUp 0.45s ease both;
  }
 
  .qs-tile {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.2s, transform 0.2s;
  }
 
  .qs-tile:hover {
    border-color: var(--border-accent);
    transform: translateY(-2px);
  }
 
  .qs-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
 
  .qs-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--text-muted);
    margin-bottom: 2px;
  }
 
  .qs-value {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }
 
  /* Sunrise / Sunset row */
  .sunrise-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
    animation: fadeUp 0.6s 0.35s ease both;
  }
 
  .sun-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: border-color 0.2s, transform 0.2s;
  }
 
  .sun-card:hover {
    border-color: var(--border-accent);
    transform: translateY(-2px);
  }
 
  .sun-icon {
    display: flex; align-items: center; justify-content: center;
    width: 52px; height: 52px;
    border-radius: 14px;
    background: rgba(246,201,14,0.08);
    flex-shrink: 0;
  }
 
  .sun-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
 
  .sun-time {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }
 
  @media (max-width: 640px) {
    .current-page { padding: 16px 14px 40px; }
    .sunrise-row  { grid-template-columns: 1fr; }
    .quick-stats  { grid-template-columns: repeat(2, 1fr); }
  }
`;
 
function sunTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}
 
export default function CurrentWeather({ location, onLocationChange }) {
  const [data,       setData]       = useState(null);
  const [weekData,   setWeekData]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [selDate,    setSelDate]    = useState(toDateInputValue());
  const [gpsLoading, setGpsLoading] = useState(false);
 
  // ── Fetch data whenever location or date changes ─────────────
  const load = useCallback(async (lat, lon, date) => {
    if (!lat || !lon) return;
    setLoading(true);
    setError('');
    try {
      // Fetch current-day data and 7-day forecast in parallel
      const [cur, week] = await Promise.all([
        fetchCurrentWeather(lat, lon, date),
        fetchWeekForecast(lat, lon),
      ]);
      setData(cur);
      setWeekData(week);
    } catch (e) {
      setError(e.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    if (location?.lat && location?.lon) {
      load(location.lat, location.lon, selDate);
    }
  }, [location?.lat, location?.lon, selDate]);
 
  // ── Manual GPS trigger from DatePickerBar button ─────────────
  function handleGps() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        onLocationChange({
          lat,
          lon,
          name: `My Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        });
        setGpsLoading(false);
      },
      () => {
        setError('Location access denied.');
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }
 
  // ── Quick stats bar (daily summary) ──────────────────────────
  function QuickStats({ daily }) {
    if (!daily) return null;
    const tiles = [
      { icon: <WiThermometer size={22} color="#fc8181" />, bg: 'rgba(252,129,129,0.1)', label: 'Max Temp',   value: formatTemp(daily.temperature_2m_max?.[0]) },
      { icon: <WiThermometer size={22} color="#63b3ed" />, bg: 'rgba(99,179,237,0.1)',  label: 'Min Temp',   value: formatTemp(daily.temperature_2m_min?.[0]) },
      { icon: <WiRain        size={22} color="#76e4f7" />, bg: 'rgba(118,228,247,0.1)', label: 'Precip.',    value: `${daily.precipitation_sum?.[0] ?? 0} mm` },
      { icon: <BsCloudRain   size={18} color="#63b3ed" />, bg: 'rgba(99,179,237,0.1)',  label: 'Rain Prob.', value: `${daily.precipitation_probability_max?.[0] ?? '—'}%` },
      { icon: <WiStrongWind  size={22} color="#68d391" />, bg: 'rgba(104,211,145,0.1)', label: 'Max Wind',   value: `${daily.wind_speed_10m_max?.[0] ?? '—'} km/h` },
      { icon: <TbUvIndex     size={20} color="#f6c90e" />, bg: 'rgba(246,201,14,0.1)',  label: 'UV Index',   value: daily.uv_index_max?.[0] ?? '—' },
    ];
    return (
      <div className="quick-stats">
        {tiles.map(t => (
          <div className="qs-tile" key={t.label}>
            <div className="qs-icon" style={{ background: t.bg }}>{t.icon}</div>
            <div>
              <div className="qs-label">{t.label}</div>
              <div className="qs-value">{t.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
 
  return (
    <>
      <style>{styles}</style>
      <div className="current-page page-enter">
 
        {/* Date picker + GPS button */}
        <DatePickerBar
          selectedDate={selDate}
          onDateChange={setSelDate}
          onGpsClick={handleGps}
          gpsLoading={gpsLoading}
        />
 
        {loading && <Loader />}
        {error   && <div className="error-box">⚠️ {error}</div>}
 
        {!loading && !error && data && (
          <>
            {/* Daily summary stats */}
            <QuickStats daily={data.daily} />
 
            {/* Hero card + 7-day forecast row */}
            <WeatherCard
              data={{ ...data, daily: weekData?.daily ?? data.daily }}
              locationName={location.name}
            />
 
            {/* 6 hourly charts with scroll + zoom */}
            <HourlyChart hourly={data.hourly} />
 
            {/* Air quality tiles: PM10, PM2.5, CO, NO2, SO2 */}
            <AirQualityCard hourly={data.hourly} />
 
            {/* Sunrise & Sunset */}
            {data.daily && (
              <div className="sunrise-row">
                <div className="sun-card">
                  <div className="sun-icon">
                    <WiSunrise size={36} color="#f6c90e" />
                  </div>
                  <div>
                    <div className="sun-label">Sunrise</div>
                    <div className="sun-time">{sunTime(data.daily.sunrise?.[0])}</div>
                  </div>
                </div>
                <div className="sun-card">
                  <div className="sun-icon">
                    <WiSunset size={36} color="#f6a90e" />
                  </div>
                  <div>
                    <div className="sun-label">Sunset</div>
                    <div className="sun-time">{sunTime(data.daily.sunset?.[0])}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}