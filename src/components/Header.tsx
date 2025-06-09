import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Cpu, Settings, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import SyncStatus from './SyncStatus';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-dark-800/95 backdrop-blur-xl border-b border-dark-700/50 sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-peacock-500 to-blue-500 rounded-xl shadow-lg">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-800 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl bg-gradient-to-r from-white to-peacock-200 bg-clip-text text-transparent">
                Isaac Asimov Laboratory
              </h1>
              <p className="text-peacock-300 text-sm font-medium">
                {user.role === 'admin' ? 'Administrative Control Center' : 'Student Access Portal'}
              </p>
            </div>
          </motion.div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Sync Status */}
            <SyncStatus />
            
            {/* Notifications */}
            <NotificationBell />
            
            {/* User Profile Section */}
            <div className="flex items-center gap-4 pl-4 border-l border-dark-600">
              {/* User Avatar and Info */}
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-peacock-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-800 ${
                    user.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-peacock-300 text-xs capitalize">
                    {user.role} • {user.email.split('@')[0]}
                  </p>
                </div>
              </motion.div>
              
              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-peacock-300 hover:text-peacock-200 hover:bg-dark-700/50 rounded-lg transition-all duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="group relative overflow-hidden p-2 text-peacock-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;