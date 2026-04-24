import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    setTimeout(() => {
      if (password === 'admin@123') {
        localStorage.setItem('role', 'admin');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/admin-dashboard');
      } else {
        setError('Invalid owner credentials. Access denied.');
        setIsLoggingIn(false);
      }
    }, 800); // Simulate network delay
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Platform Owner Portal</h1>
          <p className="text-zinc-400">Master authentication required.</p>
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
              <Lock className="w-4 h-4" /> Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Authenticating...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Login as Admin
              </>
            )}
          </button>
          <p className="text-center text-xs text-zinc-500 mt-4">
            Prototype password pre-filled for demonstration.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
