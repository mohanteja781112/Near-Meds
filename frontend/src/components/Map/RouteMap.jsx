import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for destination
const RedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter and fit bounds when route is loaded
const FitBounds = ({ routeCoords, startLat, startLng }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      // Let the map do a smooth fly padding so the route fits beautifully on the screen
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    } else if (startLat && startLng) {
      map.flyTo([startLat, startLng], 14, { animate: true, duration: 1 });
    }
  }, [routeCoords, startLat, startLng, map]);
  return null;
};

const RouteMap = ({ userLocation, destination }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [customEta, setCustomEta] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const centerLat = userLocation ? parseFloat(userLocation.lat) : 20.5937;
  const centerLng = userLocation ? parseFloat(userLocation.lng) : 78.9629;
  const center = [centerLat, centerLng];

  useEffect(() => {
    if (!userLocation || !destination) return;

    const fetchRoute = async () => {
      setIsLoading(true);
      try {
        // OSRM expects coordinates as Lng,Lat
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          
          // OSRM returns arrays of [lng, lat], Leaflet needs [lat, lng]
          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          // Force the path to precisely start at the user pin and end at the destination pin
          // This prevents the route from stopping slightly short or overextending due to road mapping variations
          const exactStart = [parseFloat(userLocation.lat), parseFloat(userLocation.lng)];
          const exactEnd = [parseFloat(destination.lat), parseFloat(destination.lng)];
          
          setRouteCoords([exactStart, ...coords, exactEnd]);

          // Use the literal distance passed from destination if available, otherwise fallback to OSRM
          if (destination.distance) {
            setDistance(`${destination.distance} km`);
            // Estimate ETA based on literal distance at 40km/h
            const timeHours = parseFloat(destination.distance) / 40;
            const timeMinutes = Math.max(1, Math.round(timeHours * 60));
            setCustomEta(`${timeMinutes} mins`);
          } else {
            const distKm = route.distance / 1000;
            setDistance(distKm < 1 ? `${(distKm * 1000).toFixed(0)} m` : `${distKm.toFixed(2)} km`);

            const speedKmph = 40; // average driving speed assumption
            const timeHours = distKm / speedKmph;
            const timeMinutes = Math.max(1, Math.round(timeHours * 60)); // at least 1 min
            setCustomEta(`${timeMinutes} mins`);
          }
        } else {
           // Fallback to straight line if OSRM fails
           setRouteCoords([
             [parseFloat(userLocation.lat), parseFloat(userLocation.lng)],
             [parseFloat(destination.lat), parseFloat(destination.lng)]
           ]);
        }
      } catch (error) {
        console.error("Error fetching route from OSRM:", error);
        // Fallback to straight line
        setRouteCoords([
           [parseFloat(userLocation.lat), parseFloat(userLocation.lng)],
           [parseFloat(destination.lat), parseFloat(destination.lng)]
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [userLocation, destination]);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-2xl relative border border-cyan-500/30">
      
      {distance && customEta && (
        <div className="absolute top-4 left-4 z-[500] bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl border border-zinc-700 shadow-xl">
           <h4 className="text-white font-bold mb-1">Emergency Route Active</h4>
           <div className="flex gap-4 text-sm mt-2">
             <div className="flex flex-col">
               <span className="text-zinc-400 text-xs">Distance</span>
               <span className="text-cyan-400 font-bold">{distance}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-zinc-400 text-xs">Est. Arrival</span>
               <span className="text-green-400 font-bold">{customEta}</span>
             </div>
           </div>
        </div>
      )}

      {isLoading && routeCoords.length === 0 && (
         <div className="absolute inset-0 z-[600] flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
           <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      )}

      <MapContainer 
        center={center} 
        zoom={14} 
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/intl/en_US/help/terms_maps/">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          className="dark-map-tiles"
        />
        
        {userLocation && (
          <Marker position={[parseFloat(userLocation.lat), parseFloat(userLocation.lng)]}>
            <Popup>
              <div className="text-gray-900 font-semibold text-sm">Your Location</div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker 
            position={[parseFloat(destination.lat), parseFloat(destination.lng)]}
            icon={RedIcon}
          >
            <Popup>
              <div className="text-gray-900 font-semibold text-sm">
                {destination.name || 'Destination'}
                <p className="text-xs text-green-600 mt-1">Preparing for arrival</p>
              </div>
            </Popup>
          </Marker>
        )}

        {routeCoords.length > 0 && (
           <Polyline 
             positions={routeCoords} 
             color="#00FFFF" // CYAN
             weight={5} 
             opacity={0.8}
           />
        )}

        <FitBounds 
          routeCoords={routeCoords} 
          startLat={centerLat} 
          startLng={centerLng} 
        />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
