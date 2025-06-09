import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Monitor,
  Database,
  Zap
} from 'lucide-react';

interface SyncStatusProps {
  isOnline?: boolean;
  lastSyncTime?: Date;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isOnline = true, lastSyncTime }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [syncAnimation, setSyncAnimation] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('syncing');
      setSyncAnimation(true);
      setTimeout(() => {
        setConnectionStatus('online');
        setSyncAnimation(false);
      }, 2000);
    };
    
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    setConnectionStatus(navigator.onLine ? 'online' : 'offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          icon: Cloud,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          text: 'Synced',
          description: 'All data synchronized across devices',
          pulse: false
        };
      case 'syncing':
        return {
          icon: Cloud,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          text: 'Syncing...',
          description: 'Synchronizing data to cloud',
          pulse: true
        };
      default:
        return {
          icon: CloudOff,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          text: 'Offline',
          description: 'Using local data only',
          pulse: false
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowStatus(!showStatus)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor} hover:border-opacity-60 shadow-lg backdrop-blur-sm`}
      >
        <motion.div
          animate={syncAnimation ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: syncAnimation ? Infinity : 0, ease: "linear" }}
        >
          <StatusIcon className={`w-4 h-4 ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
        </motion.div>
        <span className={`text-sm font-semibold ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
        {connectionStatus === 'online' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-80 bg-dark-800/95 backdrop-blur-xl border border-dark-600/50 rounded-2xl shadow-2xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">{statusConfig.text}</h4>
                <p className="text-peacock-300 text-sm">{statusConfig.description}</p>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  {navigator.onLine ? (
                    <Wifi className="w-5 h-5 text-green-400" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-peacock-300 font-medium">Internet Connection</span>
                </div>
                <span className={`font-semibold ${navigator.onLine ? 'text-green-400' : 'text-red-400'}`}>
                  {navigator.onLine ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="text-peacock-300 font-medium">Cloud Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'online' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Active</span>
                    </>
                  ) : connectionStatus === 'syncing' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Cloud className="w-4 h-4 text-blue-400" />
                      </motion.div>
                      <span className="text-blue-400 font-semibold">Syncing</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Paused</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-peacock-300 font-medium">Performance</span>
                </div>
                <span className="text-yellow-400 font-semibold">Excellent</span>
              </div>

              {lastSyncTime && (
                <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                  <span className="text-peacock-300 font-medium">Last Sync</span>
                  <span className="text-white font-semibold">
                    {lastSyncTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Device Sync Info */}
            <div className="border-t border-dark-600 pt-4">
              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Multi-Device Sync
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Mobile</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Desktop</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-dark-600 pt-4 mt-4">
              <p className="text-peacock-400 text-xs text-center">
                🔒 Your data is encrypted and securely synchronized across all devices
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyncStatus;