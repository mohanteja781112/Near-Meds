import React from 'react';
import { Sparkles, Activity, CheckCircle2 } from 'lucide-react';

const HospitalScanList = ({ 
  pharmacies = [], 
  randomLocations = [], 
  selectedPharmacy, 
  onPharmacySelect, 
  loading,
  reportStatus, // 'idle', 'broadcasting', 'accepted', 'routing'
  destinationHospital
}) => {
  const allLocations = [...randomLocations, ...pharmacies];

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800 h-full flex flex-col">
      <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2 shrink-0">
        Scanning Results ({allLocations.length})
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : allLocations.length > 0 ? (
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {allLocations.map((pharmacy) => {
            const isDestination = destinationHospital?._id === pharmacy._id;
            const isPrototype = pharmacy.isPrototype;
            const isSelected = selectedPharmacy?._id === pharmacy._id;

            return (
              <div 
                key={pharmacy._id}
                onClick={() => onPharmacySelect && onPharmacySelect(pharmacy)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 transform-gpu ${
                  isDestination 
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.03] z-10'
                    : isSelected 
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : isPrototype 
                        ? 'bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                        : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${isDestination ? 'text-emerald-400' : 'text-white'}`}>
                    {pharmacy.name}
                  </h4>
                  {isPrototype && !isDestination && (
                     <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-bold">
                       <Sparkles className="w-2.5 h-2.5" />
                       Prototype
                     </span>
                  )}
                </div>
                
                <p className="text-sm text-zinc-400 mt-1">{pharmacy.address?.street}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isDestination ? (
                       <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                         <CheckCircle2 className="w-3 h-3" />
                         Accepted – Preparing
                       </span>
                    ) : (reportStatus === 'broadcasting' && isPrototype) ? (
                       <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                         <Activity className="w-3 h-3 animate-pulse" />
                         Waiting for response...
                       </span>
                    ) : (reportStatus === 'accepted' || reportStatus === 'routing') && isPrototype ? (
                       <span className="text-xs px-2 py-1 rounded-full bg-zinc-700/50 text-zinc-500">
                         No response
                       </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pharmacy.isAvailable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {pharmacy.isAvailable ? 'Available' : 'Closed'}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-cyan-400 font-medium whitespace-nowrap">
                    {pharmacy.distance ? `${pharmacy.distance} km away` : "1.2 km away"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          No medical centers found in this area.
        </div>
      )}
    </div>
  );
};

export default HospitalScanList;
