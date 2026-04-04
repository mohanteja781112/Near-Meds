import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/Map/MapComponent';
import FindMedsButton from '../components/Map/FindMedsButton';
import ErrorBoundary from '../components/ErrorBoundary';
import { AlertTriangle, Navigation, Sparkles } from 'lucide-react';

import HospitalScanList from '../components/Map/HospitalScanList';
import RouteMap from '../components/Map/RouteMap';

const MOCK_HOSPITAL_NAMES = [
  "St. Mary's Multi-Specialty Hospital",
  "Apollo Emergency Care Center",
  "City General Hospital",
  "LifeLine Super Specialty",
  "Metro Trauma & Heart Institute",
  "Global Health Multi-Specialty",
  "Sunrise Community Hospital",
  "Zenith Multi-Specialty Care"
];

const FindMedsPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [randomLocations, setRandomLocations] = useState([]);

  // Prototype Flow State
  const [reportStatus, setReportStatus] = useState('idle'); // idle, broadcasting, accepted, routing
  const [destinationHospital, setDestinationHospital] = useState(null);

  useEffect(() => {
    const handleReportSent = () => {
      setReportStatus('broadcasting');
      // Now we wait for the real WebSocket 'hospital-accepted' event to trigger
    };

    const handleHospitalAccepted = (e) => {
       // Merge real dashboard hospital response with local prototype coordinates so routing continues to function seamlessly
       let targetHospital = null;
       
       if (randomLocations.length > 0) {
          // Find the exact hospital chosen by the Chatbot logic
          targetHospital = randomLocations.find(loc => loc.name === e.detail.hospital?.name);
          if (!targetHospital) {
             targetHospital = { ...randomLocations[0] };
          }
       }
       
       if (!targetHospital) {
          // Fallback if the user never generated nearby locations before hitting Chatbot Send
          // 1 deg latitude is ~111km. So 1.0km - 4.0km is roughly 0.009 to 0.036 degrees.
          const randomDistDeg = (Math.random() * (0.036 - 0.009)) + 0.009; 
          const randomLatDeg = (Math.random() > 0.5 ? 1 : -1) * randomDistDeg;
          const randomLngDeg = (Math.random() > 0.5 ? 1 : -1) * randomDistDeg;
          
          targetHospital = {
             name: e.detail.hospital?.name || "Emergency Hospital",
             lat: userLocation ? userLocation.lat + randomLatDeg : 20.5937,
             lng: userLocation ? userLocation.lng + randomLngDeg : 78.9629,
             distance: e.detail.hospital?.distance || (randomDistDeg * 111).toFixed(1) // Approximate km string for UI
          };
       }
       
       setDestinationHospital(targetHospital);
       setReportStatus('accepted');
    };

    const handleRouteCommand = () => {
      setReportStatus('routing');
    };

    window.addEventListener('emergency-report-sent', handleReportSent);
    window.addEventListener('hospital-accepted', handleHospitalAccepted);
    window.addEventListener('route-to-hospital', handleRouteCommand);
    
    return () => {
      window.removeEventListener('emergency-report-sent', handleReportSent);
      window.removeEventListener('hospital-accepted', handleHospitalAccepted);
      window.removeEventListener('route-to-hospital', handleRouteCommand);
    };
  }, [randomLocations]);


  const handleLocationFound = async (location) => {
    setUserLocation(location);
    window.__lastUserLocation = location; // Expose globally for Chatbot socket POST payload
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get(`http://localhost:5000/api/pharmacies/nearest?latitude=${location.lat}&longitude=${location.lng}`, config);
      
      const results = response.data?.data;
      if (Array.isArray(results)) {
        setPharmacies(results);
        if (results.length === 0) {
            setError("No pharmacies found nearby.");
        }
      } else {
        setPharmacies([]);
        setError("Unexpected response from server.");
      }

    } catch (err) {
      setError("Failed to fetch pharmacies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const generateNearbyLocations = async () => {
    if (!userLocation) return;
    
    // Set loading state so user knows we are fetching
    try {
      const btn = document.getElementById('generate-locations-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> Fetching...`;
      }

      const { lat, lng } = userLocation;
      
      // Radius control: ~5000 meters (5km)
      const radius = 5000; 

      // Overpass QL query: find hospitals or clinics or pharmacies near user location
      // Using [out:json][timeout:10];
      const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        );
        out center 15;
      `;

      const response = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      const data = await response.json();
      
      if (!data || !data.elements || data.elements.length === 0) {
        throw new Error("No real hospitals found nearby in map data.");
      }

      // Helper function to calculate distance using Haversine formula
      const getDistanceKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
      };

      // Process elements to get coordinates
      let validLocations = data.elements.map(el => {
        const destLat = el.lat || el.center.lat;
        const destLng = el.lon || el.center.lon;
        const dist = getDistanceKm(lat, lng, destLat, destLng);
        return {
           el,
           lat: destLat,
           lng: destLng,
           dist
        };
      });

      // Filter completely out-of-bounds stuff if any, though OSM around radius shouldn't
      // Ensure distance is within 1 to 4km directly
      validLocations = validLocations.filter(loc => loc.dist >= 1.0 && loc.dist <= 4.0);

      // Sort by distance and remove duplicates that are too close
      validLocations.sort((a, b) => a.dist - b.dist);
      
      // Select 3 unique locations, try to spread them out a bit
      const selected = [];
      for (const loc of validLocations) {
         if (selected.length === 3) break;
         
         // Don't pick points that are virtually exactly the same (less than 100m apart)
         const isTooClose = selected.some(s => getDistanceKm(s.lat, s.lng, loc.lat, loc.lng) < 0.1);
         if (!isTooClose) {
           selected.push(loc);
         }
      }

      // If we couldn't find 3 distinct ones within 1-4km, fallback mechanism below handles 
      // generating strictly forced random ones instead.
      if (selected.length < 3) {
         throw new Error("Not enough varied OSM results within 1-4km, falling back to procedural generation.");
      }

      const newLocations = selected.map((item, i) => {
        const name = item.el.tags?.name || MOCK_HOSPITAL_NAMES[i % MOCK_HOSPITAL_NAMES.length];
        
        return {
          _id: `prototype-${Date.now()}-${i}`,
          name: name,
          address: { 
            street: "Nearby Emergency Center",
            fullAddress: "Generated from OpenStreetMap Data"
          },
          location: {
            coordinates: [item.lng, item.lat]  // GeoJSON format [lng, lat]
          },
          lat: item.lat, 
          lng: item.lng,
          distance: item.dist.toFixed(1), // Actual calculated distance already inside 1-4km
          isAvailable: true,
          isPrototype: true,
          operatingHours: { is24Hours: true, open: "00:00", close: "23:59" }
        };
      });
      
      setRandomLocations(newLocations);
      window.__prototypeHospitals = newLocations;
      
    } catch (err) {
      console.error("Failed to fetch real OSM coordinates, falling back to controlled generic points", err);
      // Fallback: If Overpass fails or no locations found, we apply fixed offsets that guarantee we land somewhere off-center
      // but still reachable. Since we don't know the exact roads, we just create random points 
      // strictly ensuring 1km to 4km distance.
      const newLocations = [];
      const { lat, lng } = userLocation;
      
      // We want to force 3 distinct distances strictly between 1.0 and 4.0
      // 1 deg is ~111km, so 1km is ~0.009 deg, 4km is ~0.036 deg
      const distances = [
        (Math.random() * 1.0 + 1.0).toFixed(1), // 1.0 - 2.0
        (Math.random() * 1.0 + 2.0).toFixed(1), // 2.0 - 3.0
        (Math.random() * 1.0 + 3.0).toFixed(1)  // 3.0 - 4.0
      ].sort((a, b) => a - b);
  
      const shuffledNames = [...MOCK_HOSPITAL_NAMES].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < 3; i++) {
        const distKm = parseFloat(distances[i]);
        const distDeg = distKm / 111.0;
        
        // Random angle for scattered placements
        const angle = Math.random() * Math.PI * 2;
        const randomLat = lat + Math.cos(angle) * distDeg;
        const randomLng = lng + Math.sin(angle) * distDeg;

        newLocations.push({
          _id: `prototype-${Date.now()}-${i}`,
          name: shuffledNames[i],
          address: { street: "Nearby Emergency Hospital", fullAddress: "Generated for demonstration purposes" },
          location: { coordinates: [randomLng, randomLat] },
          lat: randomLat, 
          lng: randomLng,
          distance: distances[i],
          isAvailable: true,
          isPrototype: true,
          operatingHours: { is24Hours: true, open: "00:00", close: "23:59" }
        });
      }
      setRandomLocations(newLocations);
      window.__prototypeHospitals = newLocations;
    } finally {
      // Reset prototype flow states when generating new ones
      setReportStatus('idle');
      setDestinationHospital(null);
      
      const btn = document.getElementById('generate-locations-btn');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="relative flex h-2 w-2 mr-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Generate Nearby Locations`;
      }
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-4xl font-bold text-white mb-4">
          Emergency <span className="text-cyan-400">Response Network</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Locate the nearest open pharmacies and emergency centers instantly. We use your current location to provide the fastest route to essential care.
        </p>
      </div>

      {!userLocation ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 backdrop-blur-sm max-w-xl mx-auto">
          <div className="p-4 bg-cyan-500/10 rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 animate-pulse"></div>
            <Navigation className="w-12 h-12 text-cyan-400 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enable Location Access</h2>
          <p className="text-zinc-400 text-center mb-8">
            To coordinate emergency help, we need access to your current location. 
            Data is only used for routing purposes.
          </p>
          <FindMedsButton onLocationFound={handleLocationFound} onError={setError} />
          
          {error && (
            <div className="mt-6 flex items-center text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex flex-wrap gap-4 justify-between items-center shrink-0">
               <div className="flex flex-col">
                 <span className="text-zinc-300 text-sm font-medium">
                   Current Registered Location
                 </span>
                 <span className="text-zinc-500 text-xs flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mt-0.5"></div>
                   GPS Coordinates Active
                 </span>
               </div>
               
               <div className="flex gap-4">
                 <button 
                   id="generate-locations-btn"
                   onClick={generateNearbyLocations}
                   disabled={reportStatus !== 'idle'}
                   className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   Generate Nearby Locations
                 </button>
                 <button 
                   onClick={() => { 
                     setPharmacies([]); 
                     setRandomLocations([]); 
                     window.__prototypeHospitals = null;
                     setReportStatus('idle'); 
                     setDestinationHospital(null); 
                   }}
                   className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                 >
                   Clear Location
                 </button>
               </div>
            </div>
            
            <ErrorBoundary>
              <div className="flex-1 w-full min-h-[600px] border border-zinc-800/50 rounded-xl relative overflow-hidden bg-zinc-900/30">
                {reportStatus === 'routing' ? (
                  <RouteMap 
                    userLocation={userLocation}
                    destination={destinationHospital}
                  />
                ) : (
                  <MapComponent 
                    userLocation={userLocation} 
                    pharmacies={pharmacies} 
                    onPharmacySelect={handlePharmacySelect} 
                    nearbyLocations={randomLocations}
                  />
                )}
              </div>
            </ErrorBoundary>
          </div>

          <div className="h-[600px] lg:h-auto">
            <HospitalScanList 
              loading={loading}
              pharmacies={pharmacies}
              randomLocations={randomLocations}
              selectedPharmacy={selectedPharmacy}
              onPharmacySelect={handlePharmacySelect}
              reportStatus={reportStatus}
              destinationHospital={destinationHospital}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindMedsPage;

