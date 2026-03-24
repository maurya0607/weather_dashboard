
// ============================================================
// weatherApi.js — Open-Meteo API
// All weather + air quality from same base URL
// No API key required. Docs: https://open-meteo.com
// ============================================================

import axios from 'axios';

const GEO_BASE   = 'https://geocoding-api.open-meteo.com/v1';
const METEO_BASE = 'https://api.open-meteo.com/v1';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

// ── 1. City search ───────────────────────────────────────────
export async function geocodeCity(city) {
  const { data } = await axios.get(`${GEO_BASE}/search`, {
    params: { name: city, count: 5, language: 'en', format: 'json' },
  });
  if (!data.results?.length) throw new Error(`City "${city}" not found.`);
  return data.results;
}

// ── Helpers ──────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 5); // archive has ~5 day lag
  return d.toISOString().slice(0, 10);
}

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

// ── 2. Current weather (past / today / future) ───────────────
export async function fetchCurrentWeather(lat, lon, date = null) {
  const selDate = date || todayStr();
  const t       = todayStr();

  const weatherHourly = [
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

  if (selDate < t) {
    // PAST → archive endpoint (corrected)
    const { data } = await axios.get(ARCHIVE_URL, {
      params: {
        latitude:   lat,
        longitude:  lon,
        start_date: selDate,
        end_date:   selDate,
        hourly:     weatherHourly,
        daily:      dailyParams,
        timezone:   'auto',
      },
    });

    data.current = buildCurrent(data);
    return data;

  } else if (selDate === t) {
    // TODAY
    const { data } = await axios.get(`${METEO_BASE}/forecast`, {
      params: {
        latitude:  lat,
        longitude: lon,
        current:   'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,visibility,is_day',
        hourly:    weatherHourly,
        daily:     dailyParams,
        timezone:  'auto',
        forecast_days: 1,
      },
    });
    return data;

  } else {
    // FUTURE
    const { data } = await axios.get(`${METEO_BASE}/forecast`, {
      params: {
        latitude:   lat,
        longitude:  lon,
        start_date: selDate,
        end_date:   selDate,
        hourly:     weatherHourly,
        daily:      dailyParams,
        timezone:   'auto',
      },
    });
    data.current = buildCurrent(data);
    return data;
  }
}

// ── 3. 7-day forecast ─────────────────────────────────────────
export async function fetchWeekForecast(lat, lon) {
  const { data } = await axios.get(`${METEO_BASE}/forecast`, {
    params: {
      latitude:      lat,
      longitude:     lon,
      daily:         'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum',
      timezone:      'auto',
      forecast_days: 7,
    },
  });
  return data;
}

// ── 4. Historical weather ─────────────────────────────────────
export async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
  const maxEnd = yesterdayStr();
  const safeEnd = endDate > maxEnd ? maxEnd : endDate;

  // ✔ Correct archive endpoint
  const { data } = await axios.get(ARCHIVE_URL, {
    params: {
      latitude:   lat,
      longitude:  lon,
      start_date: startDate,
      end_date:   safeEnd,
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
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
      ].join(','),
      timezone: 'auto',
    },
  });

  // Aggregate hourly → daily AQ
  if (data.hourly && data.daily?.time) {
    const aqKeys = ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide'];

    aqKeys.forEach(key => {
      const hrs = data.hourly[key] ?? [];
      data.daily[key] = data.daily.time.map((_, di) => {
        const slice = hrs.slice(di * 24, di * 24 + 24).filter(v => v != null);
        return slice.length
          ? +(slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2)
          : null;
      });
    });
  }

  return data;
}