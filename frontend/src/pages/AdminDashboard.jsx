import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShieldCheck, Clock, Zap, Server, BarChart3, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/admin-login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) return null;

  const stats = [
    { label: 'Total Users', value: '14,502', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Emergencies Handled', value: '3,841', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { label: 'Critical Cases Saved', value: '942', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  const performanceMetrics = [
    { label: 'Avg Response Time', value: '2.4 mins', icon: Clock, color: 'text-amber-400' },
    { label: 'Hospital Response Rate', value: '98.5%', icon: Zap, color: 'text-cyan-400' },
    { label: 'System Uptime', value: '99.99%', icon: Server, color: 'text-purple-400' },
  ];

  // Mock data for the chart
  const weeklyData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 65 },
    { day: 'Fri', value: 48 },
    { day: 'Sat', value: 85 },
    { day: 'Sun', value: 72 },
  ];

  const maxVal = Math.max(...weeklyData.map(d => d.value));

  const recentActivity = [
    { id: 'EM-9921', hospital: 'City General', status: 'Accepted', time: '2 mins ago', type: 'Cardiac Arrest' },
    { id: 'EM-9920', hospital: 'Metro Care', status: 'Accepted', time: '15 mins ago', type: 'Accident' },
    { id: 'EM-9919', hospital: 'Sunrise Valley', status: 'Resolved', time: '1 hr ago', type: 'Stroke' },
    { id: 'EM-9918', hospital: 'City General', status: 'Resolved', time: '3 hrs ago', type: 'Severe Trauma' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
              Platform Owner Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Global oversight and system analytics</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-xl">
             <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-purple-400 font-medium text-sm tracking-wide uppercase">System Live</span>
             </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-zinc-900/40 border ${stat.border} rounded-2xl p-6 relative overflow-hidden`}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl pointer-events-none`} />
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-400 font-medium">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-4xl font-bold">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Emergency Trends (Last 7 Days)
              </h2>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {weeklyData.map((data, idx) => {
                const heightPercentage = (data.value / maxVal) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-full flex justify-center h-full items-end">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 px-2 py-1 rounded text-xs font-bold pointer-events-none z-10">
                        {data.value} cases
                      </div>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.1), type: 'spring' }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-purple-900/50 to-purple-500 rounded-t-md relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                      </motion.div>
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Platform Performance
            </h2>
            
            <div className="flex-1 flex flex-col justify-between gap-4">
              {performanceMetrics.map((metric, idx) => (
                <div key={idx} className="bg-black/50 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-zinc-800 ${metric.color}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">{metric.label}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Activity Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-6">Recent Activity Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-sm border-b border-zinc-800">
                  <th className="pb-3 font-medium px-4">Case ID</th>
                  <th className="pb-3 font-medium px-4">Condition</th>
                  <th className="pb-3 font-medium px-4">Responding Hospital</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((log, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-zinc-300">{log.id}</td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-2">
                        {log.type === 'Cardiac Arrest' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Activity className="w-4 h-4 text-cyan-400" />}
                        {log.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-300">{log.hospital}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 ${
                        log.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.status === 'Resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-zinc-500">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
