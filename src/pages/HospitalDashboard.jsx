import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, FileText, CheckCircle, XCircle, LogIn, Lock, Mail, Users, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const HospitalDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loginData, setLoginData] = useState({ email: 'demo@hospital.com', password: 'password123' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [reports, setReports] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  // Authentication Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/hospital/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setHospitalInfo(data);
        setIsAuthenticated(true);
        fetchPendingReports();
        initializeSocket();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server Error. Ensure backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hospital/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch initial reports:', err);
    }
  };

  const initializeSocket = () => {
    const newSocket = io(SOCKET_SERVER_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server as Hospital');
      newSocket.emit('join_hospital_room');
    });

    // Listen for new incoming emergencies
    newSocket.on('new_emergency_report', (report) => {
      console.log('New Emergency Received:', report);
      setReports((prev) => [report, ...prev]);
      
      // Attempt generic browser notification
      if (Notification.permission === 'granted') {
         new Notification("🚨 NEW EMERGENCY", { body: "A new case requires immediate response!" });
      } else if (Notification.permission !== 'denied') {
         Notification.requestPermission();
      }
    });

    // Listen for when another hospital claims a report
    newSocket.on('report_claimed', ({ reportId }) => {
      setReports((prev) => prev.filter(r => r._id !== reportId));
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    // Cleanup socket on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const handleAction = async (reportId, responseType) => {
    try {
      const response = await fetch('http://localhost:5000/api/hospital/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          hospitalId: hospitalInfo._id,
          responseType
        })
      });

      const data = await response.json();
      if (response.ok) {
        // If accepted or rejected, we can remove it from local pending list
        setReports((prev) => prev.filter(r => r._id !== reportId));
      } else {
        alert(data.error || 'Failed to update case.');
        // Case might have been claimed, refresh board
        fetchPendingReports();
      }
    } catch (err) {
      alert('Error updating response.');
    }
  };

  const handleDownloadPDF = async (report) => {
     if (!report.patientData) {
         alert("No patient data available for this case.");
         return;
     }
     
     setDownloadingReportId(report._id);
     try {
       const response = await fetch('http://localhost:5000/api/chat/generate-report', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ report: report.patientData })
       });
       
       if (response.ok) {
           const blob = await response.blob();
           const url = window.URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `emergency-report-${report._id}.pdf`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           window.URL.revokeObjectURL(url);
       } else {
           const errData = await response.json();
           alert(errData.error || "Failed to generate PDF");
       }
     } catch (err) {
       console.error("PDF generation error:", err);
       alert("Network error generating PDF.");
     } finally {
       setDownloadingReportId(null);
     }
  };

  {/* UI Rendering section */}
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Hospital Portal</h1>
            <p className="text-zinc-400">Sign in to coordinate emergency cases.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Hospital Admin Email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
            <p className="text-center text-xs text-zinc-500 mt-4">Demo credentials pre-filled automatically for testing.</p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-400" />
              Live Emergency Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Logged in as: <span className="text-emerald-400 font-medium">{hospitalInfo.name}</span></p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-xl">
             <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium text-sm tracking-wide uppercase">Socket Connected</span>
             </div>
             <div className="h-4 w-px bg-zinc-700" />
             <div className="flex items-center gap-2 text-zinc-300 font-medium font-mono text-sm">
                <Bell className="w-4 h-4 text-zinc-400" />
                {reports.length} Pending
             </div>
          </div>
        </div>

        {/* Live Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence>
              {reports.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full py-20 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl border-dashed flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Emergencies</h3>
                  <p className="text-zinc-400 max-w-sm">All operations stable. Incoming broadcasts will appear here in real-time instantly.</p>
                </motion.div>
              ) : (
                 reports.map((report) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, duration: 0.2 }}
                      className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors shadow-lg"
                    >
                       <div className={`p-1 ${report.severity === 'Critical' ? 'bg-red-500' : report.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                       
                       <div className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                               report.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                               report.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                               'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                               {report.severity} SEVERITY
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">
                               {new Date(report.createdAt).toLocaleTimeString()}
                            </span>
                         </div>

                         <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                            {report.patientData?.patient_summary?.chief_complaint?.split('(')[0] || 'Medical Emergency'}
                         </h3>
                         <p className="text-zinc-400 text-sm mb-6 line-clamp-2">
                            {report.patientData?.patient_summary?.chief_complaint || 'No summary provided.'}
                         </p>

                         <div className="space-y-3">
                            <button 
                               onClick={() => handleDownloadPDF(report)}
                               disabled={downloadingReportId === report._id}
                               className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-zinc-700 disabled:opacity-50"
                            >
                               {downloadingReportId === report._id ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               ) : (
                                  <FileText className="w-4 h-4" /> 
                               )}
                               {downloadingReportId === report._id ? "Generating PDF..." : "View Patient PDF"}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                               <button 
                                  onClick={() => handleAction(report._id, 'Accepted')}
                                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                               >
                                  <CheckCircle className="w-4 h-4" /> ACCEPT
                               </button>
                               <button 
                                  onClick={() => handleAction(report._id, 'Rejected')}
                                  className="py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                               >
                                  <XCircle className="w-4 h-4" /> REJECT
                               </button>
                            </div>
                         </div>
                       </div>
                    </motion.div>
                 ))
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
