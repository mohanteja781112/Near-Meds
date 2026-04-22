import { useState, useCallback } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reverse geocode using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name;
    } catch (err) {
      console.error('Reverse Geocoding Error:', err);
      return 'Unknown Location';
    }
  };

  // Get location from IP (Fallback)
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        lat: data.latitude,
        lng: data.longitude,
        address: `${data.city}, ${data.region}, ${data.country_name}`,
        source: 'IP'
      };
    } catch (err) {
      throw new Error('Could not detect location from IP');
    }
  };

  const getUserLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback to IP if geolocation is not supported
        getLocationFromIP()
          .then(data => {
            setLocation(data);
            resolve(data);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
            reject(err);
          });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const address = await reverseGeocode(latitude, longitude);
            
            const locationData = {
              lat: latitude,
              lng: longitude,
              address,
              source: 'GPS'
            };

            setLocation(locationData);
            setLoading(false);
            resolve(locationData);
          } catch (err) {
            setError('Failed to fetch address details');
            setLoading(false);
            reject(err);
          }
        },
        async (err) => {
          // Fallback to IP on permission denied or error
          console.warn('GPS denied/failed, falling back to IP:', err.message);
          try {
            const ipLocation = await getLocationFromIP();
            setLocation(ipLocation);
            setLoading(false);
            resolve(ipLocation);
          } catch (ipErr) {
            setError('Location access denied and IP fallback failed.');
            setLoading(false);
            reject(ipErr);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }, []);

  return { location, loading, error, getUserLocation };
};

export default useLocation;
