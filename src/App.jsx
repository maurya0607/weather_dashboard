// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import CurrentWeather from './pages/CurrentWeather';
// import HistoricalWeather from './pages/HistoricalWeather';
// import './index.css';

// const DEFAULT_LOCATION = { lat: 30.3165, lon: 78.0322, name: 'Dehradun, India' };

// export default function App() {
//   const [location, setLocation] = useState(DEFAULT_LOCATION);

//   return (
//     <Router>
//       <Navbar onLocationChange={setLocation} />
//       <main style={{ flex: 1 }}>
//         <Routes>
//           <Route path="/"           element={<CurrentWeather    location={location} onLocationChange={setLocation} />} />
//           <Route path="/historical" element={<HistoricalWeather location={location} />} />
//         </Routes>
//       </main>
//       <Footer />
//     </Router>
//   );
// }

// ============================================================
// App.jsx
// Root component — sets up routing and shared location state.
// GPS is auto-detected here on first load so it works across
// both pages without needing user to click anything.
// ============================================================
 
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CurrentWeather from './pages/CurrentWeather';
import HistoricalWeather from './pages/HistoricalWeather';
import Loader from './components/Loader';
import './index.css';
 
// Fallback location if GPS is denied or unavailable
const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' };
 
export default function App() {
  const [location,    setLocation]    = useState(null);   // null = GPS not yet resolved
  const [gpsLoading,  setGpsLoading]  = useState(true);
  const [gpsError,    setGpsError]    = useState('');
 
  // ── Auto-detect GPS on first page load ──────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      // Browser doesn't support GPS — use default
      setLocation(DEFAULT_LOCATION);
      setGpsLoading(false);
      return;
    }
 
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // GPS success — use real coordinates
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({
          lat,
          lon,
          name: `My Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        });
        setGpsLoading(false);
      },
      () => {
        // GPS denied or failed — fall back to default city
        setGpsError('Location access denied. Showing default location.');
        setLocation(DEFAULT_LOCATION);
        setGpsLoading(false);
      },
      {
        timeout:            8000,   // Give up after 8 seconds
        maximumAge:         60000,  // Accept cached GPS up to 1 min old
        enableHighAccuracy: false,  // Faster, less battery drain
      }
    );
  }, []); // Run only once on mount
 
  // ── Show full-screen loader while GPS resolves ───────────────
  if (gpsLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader message="Detecting your location…" />
      </div>
    );
  }
 
  return (
    <Router>
      {/* GPS error banner — shown when permission was denied */}
      {gpsError && (
        <div style={{
          background: 'rgba(246,201,14,0.1)',
          border: '1px solid rgba(246,201,14,0.3)',
          color: '#f6c90e',
          fontSize: 13,
          padding: '8px 20px',
          textAlign: 'center',
        }}>
          ⚠️ {gpsError}
        </div>
      )}
 
      <Navbar onLocationChange={setLocation} />
 
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <CurrentWeather
                location={location}
                onLocationChange={setLocation}
              />
            }
          />
          <Route
            path="/historical"
            element={<HistoricalWeather location={location} />}
          />
        </Routes>
      </main>
 
      <Footer />
    </Router>
  );
}
 