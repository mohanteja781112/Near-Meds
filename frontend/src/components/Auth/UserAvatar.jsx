import React from 'react';

const UserAvatar = ({ fullName, className = '' }) => {
  if (!fullName) return null;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center 
      bg-cyan-500/10 backdrop-blur-md border border-cyan-400/80 
      shadow-[0_0_20px_rgba(6,182,212,0.6)] 
      group cursor-pointer overflow-hidden transition-all duration-300
      hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:border-cyan-400
      ${className}`}
    >
      <span className="text-sm md:text-base font-bold text-cyan-400 tracking-wider group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        {initials}
      </span>
      
      {/* Inner soft glow */}
      <div className="absolute inset-0 bg-cyan-400/10 rounded-full pointer-events-none" />
    </div>
  );
};

export default UserAvatar;
