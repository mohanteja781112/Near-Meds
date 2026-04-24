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
import AdminDashboard from './pages/AdminDashboard';
import EmergencyChatbot from './components/emergency/EmergencyChatbot';
import AdminLoginPage from './pages/AdminLoginPage';
import HospitalLoginPage from './pages/HospitalLoginPage';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedHospitalRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role !== 'hospital') {
    return <Navigate to="/" replace />;
  }
  return children;
};

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
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/hospital-login" element={<HospitalLoginPage />} />
          <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/hospital-dashboard" element={<ProtectedHospitalRoute><HospitalDashboard /></ProtectedHospitalRoute>} />
        </Routes>
        
        {/* Global AI Emergency Assistant */}
        <EmergencyChatbot />
      </div>
    </Router>
  );
};


export default App;
