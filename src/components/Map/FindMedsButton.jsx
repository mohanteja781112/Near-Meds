import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const FindMedsButton = ({ onLocationFound, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleFindMeds = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      onError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound({ 
          lat: latitude, 
          lng: longitude,
          addressName: "users current location" 
        });
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMsg = "Unable to retrieve your location";
        if (error.code === 1) errorMsg = "Location permission denied";
        else if (error.code === 2) errorMsg = "Location unavailable";
        else if (error.code === 3) errorMsg = "Location request timed out";
        
        onError(errorMsg);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: Infinity }
    );
  };

  return (
    <button
      onClick={handleFindMeds}
      disabled={loading}
      className={`
        flex items-center justify-center space-x-2 
        bg-cyan-500 hover:bg-cyan-600 text-black font-bold 
        py-3 px-6 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] 
        transition-all duration-300 transform hover:scale-105 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Locating...</span>
        </>
      ) : (
        <>
          <MapPin className="w-5 h-5" />
          <span>Find Hospitals Near me</span>
        </>
      )}
    </button>
  );
};

export default FindMedsButton;
