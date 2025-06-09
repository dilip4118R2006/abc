import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Clock, 
  Contact, 
  BarChart3, 
  User, 
  Zap,
  Shield,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BorrowForm from './BorrowForm';
import BorrowedItems from './BorrowedItems';
import DueDates from './DueDates';
import AdminContact from './AdminContact';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('borrow');
  const { user } = useAuth();

  const tabs = [
    { id: 'borrow', label: 'Submit Request', icon: Plus, color: 'from-green-500 to-emerald-500' },
    { id: 'items', label: 'My Items', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'due', label: 'Due Dates', icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { id: 'contact', label: 'Admin Contact', icon: Contact, color: 'from-purple-500 to-pink-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'borrow':
        return <BorrowForm />;
      case 'items':
        return <BorrowedItems />;
      case 'due':
        return <DueDates />;
      case 'contact':
        return <AdminContact />;
      default:
        return <BorrowForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-peacock-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-peacock-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-8 border border-peacock-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-peacock-500/10 to-blue-500/10 backdrop-blur-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-peacock-500 to-blue-500 rounded-2xl shadow-lg animate-glow"
                >
                  <User className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome, {user?.name}
                  </h1>
                  <p className="text-peacock-200 text-lg">
                    Advanced robotics laboratory access portal
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    label: 'Cloud Sync', 
                    value: 'Active', 
                    icon: Shield, 
                    color: 'text-green-400',
                    description: 'Data synced across devices'
                  },
                  { 
                    label: 'Response Time', 
                    value: '< 100ms', 
                    icon: Zap, 
                    color: 'text-yellow-400',
                    description: 'Lightning fast performance'
                  },
                  { 
                    label: 'Multi-Device', 
                    value: 'Enabled', 
                    icon: Smartphone, 
                    color: 'text-blue-400',
                    description: 'Access from any device'
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-dark-700/50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-white font-semibold">{stat.label}</span>
                      </div>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-peacock-300 text-sm">{stat.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 bg-dark-800/50 p-4 rounded-2xl backdrop-blur-xl border border-dark-700">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-peacock-300 hover:text-white hover:bg-dark-700/70'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeStudentTab"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="hidden sm:inline relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content with Enhanced Transitions */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {renderContent()}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-peacock-400 text-sm">
            <Monitor className="w-4 h-4" />
            <span>Optimized for all devices</span>
            <span className="mx-2">•</span>
            <Shield className="w-4 h-4" />
            <span>Secure cloud sync</span>
            <span className="mx-2">•</span>
            <Zap className="w-4 h-4" />
            <span>Real-time updates</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;