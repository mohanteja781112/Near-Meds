import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@nearmeds.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@nearmeds.com' && password === 'admin123') {
        localStorage.setItem('role', 'admin');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/hospital-dashboard');
      } else {
        setError('Invalid admin credentials. Please try again.');
        setIsLoggingIn(false);
      }
    }, 800); // Simulate network delay
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Hospital Admin Portal</h1>
          <p className="text-zinc-400">Sign in to access the emergency dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="admin@nearmeds.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Verifying Access...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Access Dashboard
              </>
            )}
          </button>
          <p className="text-center text-xs text-zinc-500 mt-4">
            Prototype credentials pre-filled for testing.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
