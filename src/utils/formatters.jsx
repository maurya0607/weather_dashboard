// ============================================================
// formatters.js — Helper functions for display formatting
// ============================================================

import React from 'react';
import {
  WiDaySunny, WiDaySunnyOvercast, WiDayCloudy, WiCloudy,
  WiFog, WiDayRain, WiRain, WiSnow, WiThunderstorm,
  WiNightClear, WiNightCloudy, WiSleet,
} from 'react-icons/wi';

// ---- WMO Weather Interpretation Code → label + React Icon ----
const WMO_CODES = {
  0:  { label: 'Clear Sky',            day: (s) => <WiDaySunny  size={s} color="#f6c90e" />,         night: (s) => <WiNightClear  size={s} color="#c0cfe8" /> },
  1:  { label: 'Mostly Clear',         day: (s) => <WiDaySunnyOvercast size={s} color="#63b3ed" />,  night: (s) => <WiNightCloudy size={s} color="#8899bb" /> },
  2:  { label: 'Partly Cloudy',        day: (s) => <WiDayCloudy  size={s} color="#63b3ed" />,        night: (s) => <WiNightCloudy size={s} color="#8899bb" /> },
  3:  { label: 'Overcast',             day: (s) => <WiCloudy     size={s} color="#8899bb" />,        night: (s) => <WiCloudy      size={s} color="#8899bb" /> },
  45: { label: 'Foggy',                day: (s) => <WiFog        size={s} color="#8899bb" />,        night: (s) => <WiFog         size={s} color="#8899bb" /> },
  48: { label: 'Icy Fog',              day: (s) => <WiFog        size={s} color="#c0cfe8" />,        night: (s) => <WiFog         size={s} color="#c0cfe8" /> },
  51: { label: 'Light Drizzle',        day: (s) => <WiDayRain    size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  53: { label: 'Drizzle',              day: (s) => <WiDayRain    size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  55: { label: 'Heavy Drizzle',        day: (s) => <WiRain       size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  61: { label: 'Light Rain',           day: (s) => <WiDayRain    size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  63: { label: 'Rain',                 day: (s) => <WiRain       size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  65: { label: 'Heavy Rain',           day: (s) => <WiRain       size={s} color="#4a90d9" />,        night: (s) => <WiRain        size={s} color="#4a90d9" /> },
  71: { label: 'Light Snow',           day: (s) => <WiSnow       size={s} color="#c0cfe8" />,        night: (s) => <WiSnow        size={s} color="#c0cfe8" /> },
  73: { label: 'Snow',                 day: (s) => <WiSnow       size={s} color="#c0cfe8" />,        night: (s) => <WiSnow        size={s} color="#c0cfe8" /> },
  75: { label: 'Heavy Snow',           day: (s) => <WiSnow       size={s} color="#e8f0ff" />,        night: (s) => <WiSnow        size={s} color="#e8f0ff" /> },
  77: { label: 'Snow Grains',          day: (s) => <WiSleet      size={s} color="#c0cfe8" />,        night: (s) => <WiSleet       size={s} color="#c0cfe8" /> },
  80: { label: 'Light Showers',        day: (s) => <WiDayRain    size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  81: { label: 'Showers',              day: (s) => <WiRain       size={s} color="#63b3ed" />,        night: (s) => <WiRain        size={s} color="#63b3ed" /> },
  82: { label: 'Heavy Showers',        day: (s) => <WiRain       size={s} color="#4a90d9" />,        night: (s) => <WiRain        size={s} color="#4a90d9" /> },
  85: { label: 'Snow Showers',         day: (s) => <WiSnow       size={s} color="#c0cfe8" />,        night: (s) => <WiSnow        size={s} color="#c0cfe8" /> },
  86: { label: 'Heavy Snow Shower',    day: (s) => <WiSnow       size={s} color="#e8f0ff" />,        night: (s) => <WiSnow        size={s} color="#e8f0ff" /> },
  95: { label: 'Thunderstorm',         day: (s) => <WiThunderstorm size={s} color="#f6c90e" />,      night: (s) => <WiThunderstorm size={s} color="#f6c90e" /> },
  96: { label: 'Thunderstorm + Hail',  day: (s) => <WiThunderstorm size={s} color="#f6a90e" />,      night: (s) => <WiThunderstorm size={s} color="#f6a90e" /> },
  99: { label: 'Severe Thunderstorm',  day: (s) => <WiThunderstorm size={s} color="#fc8181" />,      night: (s) => <WiThunderstorm size={s} color="#fc8181" /> },
};

// Returns { label, icon (React element) }
// isDay: 1 = day, 0 = night
// size: icon size in px
export function getWeatherInfo(code, isDay = 1, size = 32) {
  const entry = WMO_CODES[code];
  if (!entry) return {
    label: 'Unknown',
    icon: <WiDayCloudy size={size} color="#63b3ed" />,
  };
  return {
    label: entry.label,
    icon: isDay ? entry.day(size) : entry.night(size),
  };
}

// ---- Temperature ------------------------------------------------
export function formatTemp(val, unit = 'C') {
  if (val == null) return '—';
  const num = Math.round(val);
  return unit === 'F' ? `${Math.round(num * 9 / 5 + 32)}°F` : `${num}°C`;
}

// ---- Wind direction degrees → compass -------------------------
export function windDirection(deg) {
  if (deg == null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ---- Date / time helpers ----------------------------------------
export function formatDate(dateStr, options = {}) {
  const d = new Date(dateStr);
  const defaults = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', { ...defaults, ...options });
}

export function formatHour(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// ---- UV index label ----------------------------------------------
export function uvLabel(uv) {
  if (uv == null) return '—';
  if (uv <= 2)  return 'Low';
  if (uv <= 5)  return 'Moderate';
  if (uv <= 7)  return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// ---- Visibility (metres → km) ------------------------------------
export function formatVisibility(m) {
  if (m == null) return '—';
  return `${(m / 1000).toFixed(1)} km`;
}

// ---- Pressure -------------------------------------------------------
export function formatPressure(hpa) {
  if (hpa == null) return '—';
  return `${Math.round(hpa)} hPa`;
}