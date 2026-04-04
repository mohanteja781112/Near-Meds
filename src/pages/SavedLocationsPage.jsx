import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Navigation, Loader2 } from 'lucide-react';
import useLocation from '../hooks/useLocation';
import api from '../services/api';

const SavedLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserLocation, loading: locationLoading } = useLocation();

  const fetchLocations = async () => {
    try {
      const response = await api.get('/location/user-locations');
      setLocations(response.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAutoCapture = async () => {
    try {
      const loc = await getUserLocation();
      if (loc) {
        // Automatically save captured location
        await api.post('/location/save', {
          label: 'users current location',
          address: 'users current location',
          coordinates: { lat: loc.lat, lng: loc.lng },
          source: loc.source,
          isDefault: locations.length === 0 // Default if first location
        });
        fetchLocations();
      }
    } catch (err) {
      console.error('Location capture failed', err);
      alert('Could not capture location. Please try manually.');
    }
  };

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState({ label: '', lat: '', lng: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await api.delete(`/location/${id}`);
        setLocations(locations.filter(l => l._id !== id));
      } catch (err) {
        console.error('Failed to delete location', err);
      }
    }
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { label, lat, lng } = manualLocation;
      
      // Perform reverse geocoding to get a real address
      let address = 'Manual Entry';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        address = data.display_name || address;
      } catch (err) {
        console.warn('Reverse geocoding failed for manual entry', err);
      }

      await api.post('/location/save', {
        label: 'users current location',
        address: 'users current location',
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        source: 'MANUAL',
        isDefault: locations.length === 0
      });

      setIsManualModalOpen(false);
      setManualLocation({ label: '', lat: '', lng: '' });
      fetchLocations();
    } catch (err) {
      console.error('Manual save failed', err);
      alert('Failed to save location. please check coordinates.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Saved Locations</h1>
            <p className="text-zinc-400">Manage your delivery and emergency addresses.</p>
          </div>
          
          <button
            onClick={handleAutoCapture}
            disabled={locationLoading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locationLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            <span>Use Current Location</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add New Card */}
            <div 
              onClick={() => setIsManualModalOpen(true)}
              className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-all cursor-pointer min-h-[160px] group"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Add Manual Location</span>
            </div>

            {/* Location Cards */}
            {locations.map((location) => (
              <div key={location._id} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 relative group hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {location.label}
                        {location.isDefault && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Default
                          </span>
                        )}
                        {location.source === 'GPS' && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            GPS
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-2 font-mono">
                        {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1220] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">Add Manual Location</h2>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleManualSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Label (Always set to current location)</label>
                <input
                  readOnly
                  type="text"
                  value="users current location"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="17.6868"
                    value={manualLocation.lat}
                    onChange={(e) => setManualLocation({...manualLocation, lat: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="83.2185"
                    value={manualLocation.lng}
                    onChange={(e) => setManualLocation({...manualLocation, lng: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Location</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedLocationsPage;
