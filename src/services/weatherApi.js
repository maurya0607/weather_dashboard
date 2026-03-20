
// ============================================================
// weatherApi.js — Open-Meteo API (free, no key required)
// ============================================================

import axios from 'axios';

const GEO_BASE   = 'https://geocoding-api.open-meteo.com/v1';
const METEO_BASE = 'https://api.open-meteo.com/v1';

// ---- 1. Geocoding ----------------------------------------------
export async function geocodeCity(city) {
  const { data } = await axios.get(`${GEO_BASE}/search`, {
    params: { name: city, count: 5, language: 'en', format: 'json' },
  });
  if (!data.results?.length) throw new Error(`City "${city}" not found.`);
  return data.results;
}

// ---- helper ----------------------------------------------------
function today() { return new Date().toISOString().slice(0, 10); }
function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

// ---- 2. Current + Hourly for any date --------------------------
export async function fetchCurrentWeather(lat, lon, date = null) {
  const selDate = date || today();
  const rel     = cmp(selDate, today()); // -1 past | 0 today | 1 future

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'wind_speed_10m',
    'visibility',
    'pm10',
    'pm2_5',
    'carbon_monoxide',
    'nitrogen_dioxide',
    'sulphur_dioxide',
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'sunrise',
    'sunset',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'uv_index_max',
  ].join(',');

  // fake current helper
  function buildCurrent(d) {
    const mid = 12;
    return {
      temperature_2m:       d.hourly?.temperature_2m?.[mid]        ?? d.daily?.temperature_2m_max?.[0] ?? null,
      apparent_temperature: d.hourly?.temperature_2m?.[mid]        ?? null,
      relative_humidity_2m: d.hourly?.relative_humidity_2m?.[mid]  ?? null,
      precipitation:        d.daily?.precipitation_sum?.[0]        ?? 0,
      weather_code:         d.daily?.weather_code?.[0]             ?? 0,
      wind_speed_10m:       d.daily?.wind_speed_10m_max?.[0]       ?? null,
      wind_direction_10m:   0,
      surface_pressure:     null,
      uv_index:             d.daily?.uv_index_max?.[0]             ?? null,
      visibility:           d.hourly?.visibility?.[mid]            ?? null,
      is_day:               1,
    };
  }

  // PAST → archive
  if (rel === -1) {
    const { data } = await axios.get(`${METEO_BASE}/archive`, {
      params: { latitude: lat, longitude: lon, start_date: selDate, end_date: selDate, hourly: hourlyParams, daily: dailyParams, timezone: 'auto' },
    });
    data.current = buildCurrent(data);
    return data;
  }

  // TODAY → forecast + current block
  if (rel === 0) {
    const { data } = await axios.get(`${METEO_BASE}/forecast`, {
      params: {
        latitude: lat, longitude: lon,
        current: ['temperature_2m','relative_humidity_2m','apparent_temperature','precipitation','weather_code','wind_speed_10m','wind_direction_10m','surface_pressure','uv_index','visibility','is_day'].join(','),
        hourly: hourlyParams, daily: dailyParams,
        timezone: 'auto', forecast_days: 1,
      },
    });
    return data;
  }

  // FUTURE → forecast without current block
  const { data } = await axios.get(`${METEO_BASE}/forecast`, {
    params: { latitude: lat, longitude: lon, start_date: selDate, end_date: selDate, hourly: hourlyParams, daily: dailyParams, timezone: 'auto' },
  });
  data.current = buildCurrent(data);
  return data;
}

// ---- 3. 7-day forecast -----------------------------------------
export async function fetchWeekForecast(lat, lon) {
  const { data } = await axios.get(`${METEO_BASE}/forecast`, {
    params: {
      latitude: lat, longitude: lon,
      daily: ['weather_code','temperature_2m_max','temperature_2m_min','sunrise','sunset','precipitation_sum'].join(','),
      timezone: 'auto', forecast_days: 7,
    },
  });
  return data;
}

// ---- 4. Historical (archive) -----------------------------------
// NOTE: pm10/pm2_5 NOT available in daily archive — fetched via hourly instead
export async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
  const { data } = await axios.get(`${METEO_BASE}/archive`, {
    params: {
      latitude:   lat,
      longitude:  lon,
      start_date: startDate,
      end_date:   endDate,
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'sunrise',
        'sunset',
        'precipitation_sum',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
      ].join(','),
      hourly: [
        'pm10',
        'pm2_5',
      ].join(','),
      timezone: 'auto',
    },
  });

  // Aggregate hourly PM to daily mean for charts
  if (data.hourly?.pm10 && data.daily?.time) {
    const pm10Daily  = [];
    const pm25Daily  = [];
    const hoursPerDay = 24;
    data.daily.time.forEach((_, di) => {
      const start = di * hoursPerDay;
      const end   = start + hoursPerDay;
      const pm10Slice  = data.hourly.pm10.slice(start, end).filter(v => v != null);
      const pm25Slice  = data.hourly.pm2_5.slice(start, end).filter(v => v != null);
      pm10Daily.push(pm10Slice.length  ? +(pm10Slice.reduce((a,b)=>a+b,0)  / pm10Slice.length).toFixed(1)  : null);
      pm25Daily.push(pm25Slice.length  ? +(pm25Slice.reduce((a,b)=>a+b,0)  / pm25Slice.length).toFixed(1)  : null);
    });
    data.daily.pm10  = pm10Daily;
    data.daily.pm2_5 = pm25Daily;
  }

  return data;
}