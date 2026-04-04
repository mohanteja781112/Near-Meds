import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// CSS imported in main.jsx to avoid reloading issues
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in React Leaflet with Vite
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Green Icon for Random Locations
const GreenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});



// Component to recenter map when user location changes
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const MapComponent = ({ userLocation, pharmacies, onPharmacySelect, nearbyLocations = [] }) => {
  // Default to a central location if user location is not yet available
  // Ensure we have valid coordinates numbers
  const centerLat = userLocation?.lat ? parseFloat(userLocation.lat) : 20.5937;
  const centerLng = userLocation?.lng ? parseFloat(userLocation.lng) : 78.9629;
  const center = [centerLat, centerLng];

  // Defensive check for pharmacies array
  const safePharmacies = Array.isArray(pharmacies) ? pharmacies : [];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-2xl border border-cyan-500/30">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full z-0"
        scrollWheelZoom={true}
        // Removed key prop to prevent unmounting/remounting issues
      >
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/intl/en_US/help/terms_maps/">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          className="dark-map-tiles"
        />
        
        {/* User Marker */}
        {userLocation && !isNaN(centerLat) && !isNaN(centerLng) && (
          <>
            <Marker position={[centerLat, centerLng]}>
              <Popup>
                <div className="text-gray-900 font-semibold text-sm">
                  users current location
                </div>
              </Popup>
            </Marker>
            <RecenterMap lat={centerLat} lng={centerLng} />
          </>
        )}

        {/* Pharmacy Markers */}
        {safePharmacies.map((pharmacy) => {
            // Defensive check for valid coordinates
            const lat = pharmacy?.location?.coordinates?.[1];
            const lng = pharmacy?.location?.coordinates?.[0];
            
            if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker 
                key={pharmacy._id || Math.random()} 
                position={[lat, lng]} // [lat, lng]
                eventHandlers={{
                  click: () => onPharmacySelect && onPharmacySelect(pharmacy),
                }}
              >
                <Popup>
                  <div className="text-gray-900">
                    <h3 className="font-bold text-lg">{pharmacy.name || 'Pharmacy'}</h3>
                    <p className="text-sm">{pharmacy?.address?.fullAddress || 'Address unavailable'}</p>
                    <p className="text-xs mt-1 font-semibold text-green-600">
                      {pharmacy?.operatingHours?.is24Hours ? "Open 24/7" : `Open: ${pharmacy?.operatingHours?.open || 'N/A'} - ${pharmacy?.operatingHours?.close || 'N/A'}`}
                    </p>
                    <button 
                      className="mt-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 transition"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent map click
                        onPharmacySelect && onPharmacySelect(pharmacy);
                      }}
                    >
                      Navigate
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
        })}
        {/* Random Nearby Markers */}
        {nearbyLocations.map((loc, index) => (
          <Marker 
            key={`random-${index}-${loc.lat}-${loc.lng}`} 
            position={[loc.lat, loc.lng]}
            icon={GreenIcon}
          >
            <Popup>
              <div className="text-gray-900">
                <h3 className="font-bold text-sm text-emerald-600">{loc.name}</h3>
                <p className="text-xs text-gray-500 mt-1">AI Generated Prototype</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};

export default MapComponent;

