import React, { useState, useEffect } from 'react';
import { Menu, X, Cross } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './Auth/AuthModal';
import UserAvatar from './Auth/UserAvatar';
import ProfileDropdown from './Auth/ProfileDropdown';
import { createEmergencyReport } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged in user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setRole(localStorage.getItem('role'));

    // Listen for storage events (login/logout from other tabs or components)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
      setRole(localStorage.getItem('role'));
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for immediate updates within the same window
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('role');
    setRole(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const openAuthModal = (view) => {
    setAuthView(view);
    setIsAuthModalOpen(true);
    setIsOpen(false); // Close mobile menu if open
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Hospitals', href: '/find-meds' }
  ];

  if (role === 'hospital') {
    navLinks.push({ name: 'Hospital Portal', href: '/hospital-dashboard' });
  } else if (role === 'admin') {
    navLinks.push({ name: 'Admin Dashboard', href: '/admin-dashboard' });
  } else if (!user) {
    navLinks.push({ name: 'Hospital Portal', href: '/hospital-login' });
    navLinks.push({ name: 'Admin Login', href: '/admin-login' });
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-black rounded-full p-2 border border-cyan-500/50">
                  <Cross className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">
                Near<span className="text-cyan-400">Meds</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <button 
                  onClick={async () => {
                    try {
                      // 1. Send the background API request
                      await createEmergencyReport({
                           report: {
                             patient_summary: "[Apple Watch Series 9 API] Severe Irregular Rhythm and SpO2 drop detected. Patient unresponsive.",
                             possible_conditions: "Cardiac Arrest / Myocardial Infarction",
                             urgency_level: "Critical",
                             recommendations: "Dispatch ambulance immediately.",
                             precautions: "Patient is alone. Monitor vitals on arrival."
                           },
                           severity: 'Critical',
                           location: window.__lastUserLocation || { lat: 20.5937, lng: 78.9629 },
                           patientSocketId: "wearable_mock_" + Date.now()
                      });
                      
                      // 2. Play Web Audio API alarm sound immediately
                      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                      const oscillator = audioCtx.createOscillator();
                      const gainNode = audioCtx.createGain();
                      oscillator.type = 'square';
                      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.2);
                      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.4);
                      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.6);
                      
                      oscillator.connect(gainNode);
                      gainNode.connect(audioCtx.destination);
                      oscillator.start();
                      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1.0);
                      setTimeout(() => oscillator.stop(), 1000);

                      // 3. Navigate directly to the dashboard to see the emergency popup
                      navigate('/hospital-dashboard');
                      
                    } catch(e) { console.error(e); }
                  }}
                  className="text-rose-400 hover:text-rose-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  IoT Webhook Test
                </button>

                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium relative group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
                
                <div className="ml-4 relative">
                  {user && (
                    <div className="relative">
                      <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <UserAvatar fullName={user.fullName || user.name} />
                      </div>
                      <ProfileDropdown 
                        user={user} 
                        isOpen={isDropdownOpen} 
                        onClose={() => setIsDropdownOpen(false)}
                        onLogout={handleLogout}
                      />
                    </div>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={handleAdminLogout}
                      className="text-purple-400 hover:text-purple-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 ml-2"
                    >
                      Admin Logout
                    </button>
                  )}
                  {role === 'hospital' && (
                    <button
                      onClick={handleAdminLogout}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors duration-300 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 ml-2"
                    >
                      Hospital Logout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-300 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {role === 'admin' && (
                  <div className="pt-4 pb-2 space-y-3 px-3 border-t border-zinc-800 mt-2">
                    <button
                      onClick={handleAdminLogout}
                      className="w-full text-left px-2 py-2 text-purple-400 hover:text-purple-300 transition-colors font-bold uppercase tracking-wider text-sm"
                    >
                      Admin Logout
                    </button>
                  </div>
                )}
                {role === 'hospital' && (
                  <div className="pt-4 pb-2 space-y-3 px-3 border-t border-zinc-800 mt-2">
                    <button
                      onClick={handleAdminLogout}
                      className="w-full text-left px-2 py-2 text-emerald-400 hover:text-emerald-300 transition-colors font-bold uppercase tracking-wider text-sm"
                    >
                      Hospital Logout
                    </button>
                  </div>
                )}
                
                {user && (
                  <div className="pt-4 pb-2 space-y-3 px-3 border-t border-zinc-800 mt-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-2">
                        <UserAvatar fullName={user.fullName || user.name} />
                        <div>
                          <p className="text-white font-medium">{user.fullName || user.name}</p>
                          <p className="text-xs text-zinc-400">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authView} 
      />
    </>
  );
};

export default Navbar;

