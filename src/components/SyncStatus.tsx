import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncStatusProps {
  isOnline?: boolean;
  lastSyncTime?: Date;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isOnline = true, lastSyncTime }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');

  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
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
          description: 'Data is synced across devices'
        };
      case 'syncing':
        return {
          icon: Cloud,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          text: 'Syncing...',
          description: 'Syncing data to cloud'
        };
      default:
        return {
          icon: CloudOff,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          text: 'Offline',
          description: 'Using local data only'
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${statusConfig.bgColor} ${statusConfig.borderColor} hover:border-opacity-60`}
      >
        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
        <span className={`text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
      </motion.button>

      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{statusConfig.text}</h4>
                  <p className="text-peacock-300 text-sm">{statusConfig.description}</p>
                </div>
              </div>

              <div className="border-t border-dark-600 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-peacock-300">Connection:</span>
                  <div className="flex items-center gap-1">
                    {navigator.onLine ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">Offline</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-peacock-300">Cloud Sync:</span>
                  <div className="flex items-center gap-1">
                    {connectionStatus === 'online' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">Paused</span>
                      </>
                    )}
                  </div>
                </div>

                {lastSyncTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-peacock-300">Last Sync:</span>
                    <span className="text-white">
                      {lastSyncTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-dark-600 pt-3">
                <p className="text-peacock-300 text-xs">
                  💡 Your data syncs automatically across all devices using the same email
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyncStatus;