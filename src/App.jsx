import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CurrentWeather from './pages/CurrentWeather';
import HistoricalWeather from './pages/HistoricalWeather';
import './index.css';

const DEFAULT_LOCATION = { lat: 30.3165, lon: 78.0322, name: 'Dehradun, India' };

export default function App() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  return (
    <Router>
      <Navbar onLocationChange={setLocation} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"           element={<CurrentWeather    location={location} onLocationChange={setLocation} />} />
          <Route path="/historical" element={<HistoricalWeather location={location} />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}