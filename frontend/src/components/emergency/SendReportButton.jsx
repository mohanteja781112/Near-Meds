import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

// We can define a local cn utility if it doesn't exist, we'll see.
// Actually, EmergencyChatbot has one defined inline but usually it's in a utils file. We'll define a local one here just in case.
const classNames = (...classes) => classes.filter(Boolean).join(' ');

const SendReportButton = ({ reportData }) => {
  // states: 'idle', 'sending', 'broadcasting', 'accepted'
  const [status, setStatus] = useState('idle');

  const handleSend = () => {
    if (status !== 'idle') return;
    
    setStatus('broadcasting'); // Instantiate broadcast immediately
    // Emit event to global window
    const event = new CustomEvent('emergency-report-sent', { detail: { report: reportData } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleAccepted = (e) => {
      setStatus('accepted');
    };

    const handleFailed = () => {
      setStatus('idle');
    };

    window.addEventListener('hospital-accepted', handleAccepted);
    window.addEventListener('broadcast-failed', handleFailed);
    return () => {
      window.removeEventListener('hospital-accepted', handleAccepted);
      window.removeEventListener('broadcast-failed', handleFailed);
    };
  }, []);

  return (
    <div className="w-full mt-3 border-t border-white/10 pt-3">
      <button
        onClick={handleSend}
        disabled={status !== 'idle'}
        className={classNames(
          "w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all relative overflow-hidden",
          status === 'idle' ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" :
          status === 'sending' ? "bg-red-500/50 text-white/90 cursor-not-allowed" :
          status === 'broadcasting' ? "bg-amber-500 text-white cursor-not-allowed shadow-lg shadow-amber-500/20" :
          "bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-500/20"
        )}
      >
        {status === 'sending' && (
          <motion.div
            className="absolute inset-0 bg-red-400 opacity-20"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        {status === 'idle' && <Send className="w-4 h-4" />}
        {status === 'sending' && <Activity className="w-4 h-4 animate-spin-pulse" />}
        {status === 'broadcasting' && <ShieldAlert className="w-4 h-4 animate-pulse" />}
        {status === 'accepted' && <CheckCircle2 className="w-4 h-4" />}
        
        <span className="relative z-10 tracking-widest uppercase">
          {status === 'idle' && "🔴 Send Report to Nearby Hospitals"}
          {status === 'sending' && "Sending report to nearby hospitals..."}
          {status === 'broadcasting' && "Broadcasting..."}
          {status === 'accepted' && "Report Accepted"}
        </span>
      </button>
    </div>
  );
};

export default SendReportButton;
