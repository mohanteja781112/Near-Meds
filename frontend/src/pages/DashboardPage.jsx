import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Search, LogIn, Clock, FileText, Download } from 'lucide-react';
import api, { generateMedicalReport } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/dashboard');
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
        if (response.data.savedReports) {
          setSavedReports(response.data.savedReports);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-zinc-900 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard 
              icon={Search} 
              label="Total Searches" 
              value={stats?.searches || 0} 
              color="bg-cyan-500 text-cyan-500" 
            />
            <StatCard 
              icon={MapPin} 
              label="Saved Locations" 
              value={stats?.locations || 0} 
              color="bg-purple-500 text-purple-500" 
            />
            <StatCard 
              icon={FileText} 
              label="Saved Reports" 
              value={stats?.reports || 0} 
              color="bg-emerald-500 text-emerald-500" 
            />
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-cyan-400" />
            Recent Activity
          </h2>
          
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {recentActivity.map((log) => (
                  <div key={log._id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <Clock className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{log.action.replace('_', ' ')}</p>
                        <p className="text-xs text-zinc-500">
                          {log.details?.method ? `Method: ${log.details.method}` : 
                           log.details?.address ? `Address: ${log.details.address}` : 
                           new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No recent activity found.
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-emerald-400" />
            Saved Medical Reports
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedReports.length > 0 ? (
              savedReports.map((report) => (
                <div key={report._id} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                           report.urgency_level === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                           report.urgency_level === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                           'bg-red-500/10 border-red-500/20 text-red-400'
                         }`}>
                           {report.urgency_level}
                         </div>
                         <span className="text-xs text-zinc-500 font-mono">
                           {new Date(report.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">Generated Report</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                    {report.patient_summary}
                  </p>
                  
                  <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-xs text-zinc-500">ID: {report._id.substring(18)}</span>
                    <button 
                      onClick={async () => {
                         try {
                           const response = await generateMedicalReport(report);
                           if (response.status === 200) {
                             const blob = response.data;
                             const url = window.URL.createObjectURL(blob);
                             const a = document.createElement('a');
                             a.href = url;
                             a.download = `nearmeds-report-${report._id.substring(18)}.pdf`;
                             document.body.appendChild(a);
                             a.click();
                             document.body.removeChild(a);
                           }
                         } catch (err) {}
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl text-zinc-500">
                No medical reports saved yet. Generate one via the Emergency AI assistant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
