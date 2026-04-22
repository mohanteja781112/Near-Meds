import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, MapPin, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const MenuItem = ({ icon: Icon, label, to = "#" }) => (
  <Link to={to} className="flex items-center space-x-3 px-4 py-2 text-zinc-400 hover:bg-zinc-800/50 hover:text-cyan-400 transition-colors cursor-pointer group">
    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const ProfileDropdown = ({ user, isOpen, onClose, onLogout }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <MenuItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
            <MenuItem icon={User} label="My Profile" to="/profile" />
          </div>

          {/* Logout Section */}
          <div className="border-t border-zinc-800 pt-2 pb-1">
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 flex items-center space-x-3 text-red-400 hover:bg-zinc-800/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
