import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, LogIn, User } from 'lucide-react';
import MedicalPin from './3d/MedicalPin';
import AuthModal from './Auth/AuthModal';

const Hero = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const isHospitalAdmin = user && user.name;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black z-0 pointer-events-none"></div>
      
      {/* Full Screen 3D Canvas - Prevents clipping */}
      <div className="absolute inset-0 z-10 w-full h-full">
         <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
            <spotLight position={[-10, 0, -5]} intensity={2} color="#06b6d4" angle={0.5} penumbra={1} />
            <pointLight position={[0, -10, 5]} intensity={0.5} color="#ec4899" />
            
            <Suspense fallback={null}>                               
              {/* Map pin positioned to the right to align with layout */}
              <MedicalPin position={[3.5, -1.2, 0]} rotation={[0.1, 0, 0]} scale={[0.9, 0.9, 0.9]} />
              <Environment preset="studio" />
              <ContactShadows position={[3.5, -5.0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
            </Suspense>
         </Canvas>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center h-full pointer-events-none">
        
        {/* Left: Text Content (60%) */}
        <div className="w-full md:w-3/5 text-left pt-20 relative z-30 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">Live Emergency Response</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Critical Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Found Instantly.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Locate open pharmacies, hospitals, and emergency supplies in seconds. Direct real-time navigation when every second counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {!user ? (
                <>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>User Login</span>
                  </button>
                  <button 
                    onClick={() => navigate('/admin-login')}
                    className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold backdrop-blur-md transition-all group"
                  >
                    <ShieldAlert className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span>Admin Login</span>
                  </button>
                </>
              ) : isHospitalAdmin ? (
                <>
                  <button 
                    onClick={() => navigate('/find-meds')}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Hospitals Now</span>
                  </button>
                  <button 
                    onClick={() => navigate('/hospital-dashboard')}
                    className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold backdrop-blur-md transition-all group"
                  >
                    <ShieldAlert className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span>Admin Dashboard</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/find-meds')}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Hospitals Now</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold backdrop-blur-md transition-all group"
                  >
                    <User className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span>User Dashboard</span>
                  </button>
                </>
              )}
            </div>

            {/* Sub-links for About and Contact */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <button 
                onClick={() => navigate('/about')}
                className="hover:text-cyan-400 transition-colors flex items-center gap-1 group"
              >
                About Project
                <span className="w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="hover:text-cyan-400 transition-colors flex items-center gap-1 group"
              >
                Contact Us
                <span className="w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-gray-500 text-sm">Active Monitoring</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-gray-500 text-sm">Verified Pharmacies</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">&lt; 10m</p>
                <p className="text-gray-500 text-sm">Avg. Response</p>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Right: Spacer to keep text left aligned over the background */}
        <div className="w-full md:w-2/5 h-full hidden md:block"></div>

      </div>
      
      {/* Decorative gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
      
      {/* User Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="login"
      />
    </div>
  );
};

export default Hero;
