import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import SavedLocationsPage from './pages/SavedLocationsPage';
import FindMedsPage from './pages/FindMedsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HospitalDashboard from './pages/HospitalDashboard';
import EmergencyChatbot from './components/emergency/EmergencyChatbot';

const App = () => {
  return (
    <Router>
      <div className="bg-black min-h-screen text-white overflow-x-hidden selection:bg-cyan-500/30 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/locations" element={<SavedLocationsPage />} />
          <Route path="/find-meds" element={<FindMedsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        </Routes>
        
        {/* Global AI Emergency Assistant */}
        <EmergencyChatbot />
      </div>
    </Router>
  );
};


export default App;
