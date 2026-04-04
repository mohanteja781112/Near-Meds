import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Brain, Activity, MapPin, ShieldAlert, HeartPulse, FileText, Check, UserCircle, Key, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import SendReportButton from './SendReportButton';

/**
 * Utility for tailwind classes merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const EmergencyChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I am your NearMeds AI Assistant. How can I help you today? In case of a life-threatening emergency, please call 102 (Ambulance) or 108 immediately.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const [acceptedHospital, setAcceptedHospital] = useState(null);
  const [showHospitalConfirm, setShowHospitalConfirm] = useState(false);
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef(null);

  // ABHA Prototype States
  const [abhaLoggedIn, setAbhaLoggedIn] = useState(false);
  const [abhaIdInput, setAbhaIdInput] = useState('');
  const [abhaNameInput, setAbhaNameInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [skippedAbha, setSkippedAbha] = useState(false);

  const abhaRecords = {
    bloodGroup: "O+",
    allergies: "Penicillin",
    conditions: "Mild Hypertension",
    medications: "Atenolol",
    lastVisit: "2024"
  };

  const handleAbhaLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (abhaIdInput.trim() === '0') {
      setIsLoggingIn(true);
      setTimeout(() => {
         setIsLoggingIn(false);
         setSkippedAbha(true);
         setAbhaLoggedIn(true);
         setMessages(prev => [...prev, {
           role: 'ai',
           text: "Proceeding without ABHA ID. I will assist you based solely on your current symptoms.",
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }]);
      }, 800);
    } else if (abhaIdInput.trim() === '1258ag') {
      setIsLoggingIn(true);
      setTimeout(() => {
         setIsLoggingIn(false);
         setAbhaLoggedIn(true);
         setMessages(prev => [...prev, {
           role: 'ai',
           text: "ABHA ID verified successfully. Patient records loaded.",
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }]);
      }, 1500);
    } else {
      setLoginError('Invalid ABHA ID');
    }
  };

  // Initialize Socket.io Connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Patient socket connected:', newSocket.id);
    });

    newSocket.on('hospital_accepted', (data) => {
      // Override the backend "Demo" hospital with one of our generated prototype hospitals
      let finalHospital = { ...data.hospital };
      if (window.__prototypeHospitals && window.__prototypeHospitals.length > 0) {
          const luckyHospital = window.__prototypeHospitals[Math.floor(Math.random() * window.__prototypeHospitals.length)];
          finalHospital.name = luckyHospital.name;
          finalHospital.distance = luckyHospital.distance;
      } else {
          const MOCK_NAMES = ["Apollo Emergency Care Center", "LifeLine Super Specialty", "City General Hospital"];
          finalHospital.name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
          finalHospital.distance = (Math.random() * 3 + 1).toFixed(1);
      }

      // Clear any pending timeout since a hospital accepted
      // (This relies on the fact that if it accepted, the user proceeds)
      window.dispatchEvent(new CustomEvent('hospital-accepted', { detail: { hospital: finalHospital } }));
      
      setAcceptedHospital(finalHospital);
      setShowHospitalConfirm(true);
      
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Hospital ${finalHospital.name} has accepted your emergency request. They are tracking your location and preparing for your arrival.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Listen to Send Button Trigger and call backend REST endpoint
  const timeoutRef = useRef(null);
  useEffect(() => {
    const handleReportSent = async (e) => {
      if (socket) {
        try {
          // Fallback Timer
          timeoutRef.current = setTimeout(() => {
             // If this timeout fires, it means no hospital accepted the broadcast.
             setMessages(prev => [...prev, {
               role: 'ai',
               text: '⚠️ Alert: No nearby hospitals responded to the automated broadcast within the required timeframe. Please call emergency services (102 or 108) immediately.',
               timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               isAlert: true
             }]);
             // Dispatch a custom event to change the button status back to idle or failed if necessary
             window.dispatchEvent(new CustomEvent('broadcast-failed'));
          }, 15000); // 15 seconds timeout

          await fetch('http://localhost:5000/api/emergency/create-report', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               report: e.detail.report,
               severity: e.detail.report.urgency_level || 'Critical',
               location: window.__lastUserLocation || {},
               patientSocketId: socket.id
             })
          });
        } catch(err) {
           console.error('Failed to dispatch real-time report', err);
        }
      }
    };
    
    const handleAdopted = () => {
       if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
       }
    };

    window.addEventListener('emergency-report-sent', handleReportSent);
    window.addEventListener('hospital-accepted', handleAdopted);
    return () => {
      window.removeEventListener('emergency-report-sent', handleReportSent);
      window.removeEventListener('hospital-accepted', handleAdopted);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [socket]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showDownloadConfirm, showHospitalConfirm]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setLoadingStep(1);
    setError(null);
    setHasDownloadedPDF(false);

    // Simulate steps for prototype
    const stepInterval = setInterval(() => {
       setLoadingStep(prev => prev < 3 ? prev + 1 : prev);
    }, 1500);

    // Frontend heuristic check
    const symptomKeywords = ['fever', 'pain', 'headache', 'vomiting', 'chest pain', 'breathing', 'symptoms', 'cough', 'injury'];
    const hasSymptoms = symptomKeywords.some(keyword => input.toLowerCase().includes(keyword));

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            text: m.text
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to the AI assistant.');
      }
      
      clearInterval(stepInterval);
      setLoadingStep(0);

      const newAiMessage = {
        role: 'ai',
        text: data.chat_reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAlert: data.chat_reply.toLowerCase().includes('emergency') || data.chat_reply.toLowerCase().includes('call 102'),
        reportAvailable: data.report_ready || hasSymptoms,
        report: data.structured_report
      };

      setMessages(prev => [...prev, newAiMessage]);
      if (data.report_ready || hasSymptoms) {
        const injectedSummary = skippedAbha
          ? `[Current Emergency Summary]\n${data.structured_report?.patient_summary || "Symptoms discussed in chat."}`
          : `[Patient History Analysis (ABHA Records)]
Blood Group: O+
Known Allergy: Penicillin
Existing Condition: Mild Hypertension
Previous Medication: Atenolol
Last Hospital Visit: 2024

AI considered previous medical history while preparing this report.

[Current Emergency Summary]
${data.structured_report?.patient_summary || "Symptoms discussed in chat."}`;

        setReportData({
          ...(data.structured_report || {}),
          patient_summary: injectedSummary,
          possible_conditions: data.structured_report?.possible_conditions || "Please consult a doctor for diagnosis.",
          urgency_level: data.structured_report?.urgency_level || "Moderate",
          recommendations: data.structured_report?.recommendations || "Rest and hydration recommended.",
          precautions: data.structured_report?.precautions || "Avoid strenuous activity.",
          when_to_seek_immediate_care: data.structured_report?.when_to_seek_immediate_care || "Seek help if symptoms worsen rapidly.",
          disclaimer: data.structured_report?.disclaimer || "This report is AI-generated and not a diagnosis."
        });
      }
    } catch (err) {
      clearInterval(stepInterval);
      setLoadingStep(0);
      console.error('Chat Error:', err);
      setError(err.message || 'I am having trouble connecting. Please try again or call emergency services if urgent.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportData) return;
    setIsGeneratingPDF(true);
    try {
      const response = await fetch('http://localhost:5000/api/chat/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: reportData }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/pdf')) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setReportData(prev => ({ ...prev, pdfUrl: url }));
      setShowDownloadConfirm(true);
    } catch (err) {
      console.error('PDF Error:', err);
      setError('Could not generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const triggerDownload = async () => {
    if (!reportData?.pdfUrl) return;
    const a = document.createElement('a');
    a.href = reportData.pdfUrl;
    a.download = `nearmeds-report-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowDownloadConfirm(false);
    setHasDownloadedPDF(true);

    // Save report to database automatically when PDF downloads
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/chat/save-report', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ report: reportData }),
        });
      }
    } catch (err) {
      console.error('Failed to save report to database:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[350px] md:w-[380px] h-[500px] md:h-[550px] flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1220]/80 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-[#08CB00]/10 border-b border-[#08CB00]/20 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#08CB00]/20 border border-[#08CB00]/30 flex items-center justify-center shadow-lg shadow-[#08CB00]/10 backdrop-blur-md">
                    <Brain className="w-6 h-6 text-[#08CB00]" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B1220] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">NearMeds AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!abhaLoggedIn ? (
              <div className="flex-1 flex flex-col p-6 items-center justify-center bg-[#0B1220]/90 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                 
                 <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    <UserCircle className="w-8 h-8 text-cyan-400" />
                 </div>
                 
                 <h2 className="text-white text-lg font-bold mb-8">ABHA Health ID Login</h2>

                 <form onSubmit={handleAbhaLogin} className="w-full max-w-sm space-y-4">
                    <div>
                       <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Health ID</label>
                       <input 
                         type="text" 
                         required
                         value={abhaIdInput}
                         onChange={(e) => setAbhaIdInput(e.target.value)}
                         placeholder="Enter ID (e.g. 1258ag)" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-zinc-600"
                       />
                    </div>
                    
                    {loginError && <p className="text-red-400 text-xs text-center mt-2">{loginError}</p>}
                    
                    <button 
                       type="submit"
                       disabled={isLoggingIn}
                       className="w-full mt-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       {isLoggingIn ? <Activity className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                       {isLoggingIn ? "VERIFYING ID..." : "SECURE LOGIN"}
                    </button>
                 </form>
                 
              </div>
            ) : (
            <>
            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar"
            >
              {!skippedAbha && (
                <div className="mb-4 p-3 rounded-xl bg-cyan-900/20 border border-cyan-500/30 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Patient Medical History</span>
                    </div>
                    <span className="text-[9px] text-amber-500 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">PROTOTYPE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-zinc-500">Blood Group:</span> <span className="text-emerald-400 font-medium">{abhaRecords.bloodGroup}</span></div>
                    <div><span className="text-zinc-500">Allergy:</span> <span className="text-rose-400 font-medium">{abhaRecords.allergies}</span></div>
                    <div><span className="text-zinc-500">Condition:</span> <span className="text-white font-medium">{abhaRecords.conditions}</span></div>
                    <div><span className="text-zinc-500">Medication:</span> <span className="text-white font-medium">{abhaRecords.medications}</span></div>
                    <div className="col-span-2"><span className="text-zinc-500">Last Visit:</span> <span className="text-white font-medium">{abhaRecords.lastVisit}</span></div>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "rounded-2xl text-sm leading-relaxed relative overflow-hidden",
                      msg.role === 'user' 
                        ? "p-3 bg-[#08CB00] text-white rounded-tr-none shadow-lg shadow-[#08CB00]/20" 
                        : "p-[1.5px] rounded-tl-none"
                    )}
                  >
                    {msg.role !== 'user' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#08CB00_360deg)]"
                      />
                    )}
                    <div className={cn(
                      "relative p-3 rounded-[15px] h-full w-full",
                      msg.role === 'user' 
                        ? "" 
                        : "bg-[#0B1220]/90 border border-white/5 text-gray-200 rounded-tl-none backdrop-blur-md"
                    )}>
                      {msg.text}

                    {/* Report Ready Card inside message bubble if available */}
                    {msg.reportAvailable && !isTyping && idx === messages.length - 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-white/70" />
                          <span className="font-semibold text-xs text-white">Medical Report Ready</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-3 line-clamp-2">
                          Based on your symptoms, I have prepared a structured medical summary.
                        </p>
                        <button
                          onClick={handleGeneratePDF}
                          disabled={isGeneratingPDF}
                          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-white/10"
                        >
                          {isGeneratingPDF ? (
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Activity className="w-3 h-3" />
                            </motion.div>
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {isGeneratingPDF ? "PREPARING PDF..." : "GENERATE MEDICAL PDF"}
                        </button>

                        {/* Urgency Status Indicator */}
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-medium">Condition Urgency:</span>
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-wider",
                            msg.report?.urgency_level === 'Low' && "text-gray-400",
                            msg.report?.urgency_level === 'Moderate' && "text-yellow-400",
                            (msg.report?.urgency_level === 'High' || msg.report?.urgency_level === 'Critical') && "text-red-400"
                          )}>
                            <div className={cn(
                              "w-1 h-1 rounded-full animate-pulse",
                              msg.report?.urgency_level === 'Low' && "bg-emerald-400",
                              msg.report?.urgency_level === 'Moderate' && "bg-yellow-400",
                              (msg.report?.urgency_level === 'High' || msg.report?.urgency_level === 'Critical') && "bg-red-400"
                            )} />
                            {msg.report?.urgency_level === 'Low' ? 'Normal' : 
                              msg.report?.urgency_level === 'Moderate' ? 'Moderate' : 'Emergency'}
                          </div>
                        </div>

                        {hasDownloadedPDF && <SendReportButton reportData={msg.report} />}
                      </motion.div>
                    )}
                    </div>
                  </motion.div>
                  <span className={cn(
                    "text-[10px] text-gray-500 mt-1 px-1",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {showDownloadConfirm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto w-[90%] p-4 rounded-xl bg-[#0B1220]/90 border border-white/10 backdrop-blur-xl shadow-2xl z-20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">Report Generated</h4>
                      <p className="text-[10px] text-gray-400">Do you want to download it now?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={triggerDownload}
                      className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold transition-colors"
                    >
                      DOWNLOAD
                    </button>
                    <button 
                      onClick={() => setShowDownloadConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold transition-colors border border-white/10"
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.div>
              )}
              
              {showHospitalConfirm && acceptedHospital && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto w-[90%] p-4 rounded-xl bg-[#0B1220]/90 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] z-20 mt-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">Emergency Accepted</h4>
                      <p className="text-[10px] text-zinc-400">Proceed with this hospital?</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 mb-3">
                     <p className="text-xs text-white font-bold">{acceptedHospital.name}</p>
                     <p className="text-[10px] text-emerald-400">{acceptedHospital.distance || '2.4'} km away</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                         window.dispatchEvent(new CustomEvent('route-to-hospital'));
                         setShowHospitalConfirm(false);
                         setTimeout(() => setIsOpen(false), 2000);
                      }}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors"
                    >
                      PROCEED TO MAP
                    </button>
                    <button 
                      onClick={() => setShowHospitalConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold transition-colors border border-white/10"
                    >
                      DECLINE
                    </button>
                  </div>
                </motion.div>
              )}
              
              {isTyping && (
                <div className="flex items-center gap-2 max-w-[85%] mr-auto">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    </div>
                    <span className="text-[10px] text-cyan-400 font-medium">
                       {skippedAbha 
                        ? "Analyzing current symptoms..."
                        : loadingStep === 1 ? "Accessing patient health records..." :
                          loadingStep === 2 ? "Analyzing historical medical data..." :
                          loadingStep === 3 ? "Combining past records with current symptoms..." :
                          "Thinking..."}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center flex flex-col gap-2">
                  <p>{error}</p>
                  <button 
                    onClick={() => handleSend()}
                    className="text-[10px] font-bold underline hover:text-red-300"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
            </div>

            {/* Emergency Action Overlay */}
            {(messages[messages.length - 1]?.isAlert || error) && !isTyping && !showDownloadConfirm && (
              <div className="px-4 pb-2">
                <a 
                  href="tel:102"
                  className="w-full py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20"
                >
                  <Activity className="w-4 h-4" />
                  CALL MEDICAL EMERGENCY (102)
                </a>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Describe your emergency..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[#08CB00]/50 transition-colors placeholder:text-gray-500"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#08CB00] transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-11 h-11 bg-[#08CB00] rounded-2xl flex items-center justify-center shadow-lg shadow-[#08CB00]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center relative shadow-2xl transition-all duration-300",
            isOpen 
              ? "bg-[#0B1220] border border-white/10" 
              : "bg-gradient-to-br from-[#08CB00] to-[#046600] shadow-[#08CB00]/40"
          )}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-[#08CB00] blur-md"
              />
              <Brain className="w-8 h-8 text-white relative z-10" />
            </>
          )}
        </motion.button>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0B1220]/90 border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
            AI Emergency Assistant
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1220] border-r border-t border-white/10 rotate-45" />
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default EmergencyChatbot;
