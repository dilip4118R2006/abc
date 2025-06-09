import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Users, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Download,
  RotateCcw,
  TrendingUp,
  Activity,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { BorrowRequest, Component } from '../../types';
import RequestManagement from './RequestManagement';
import InventoryManagement from './InventoryManagement';
import BorrowHistory from './BorrowHistory';
import ReturnManagement from './ReturnManagement';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalComponents: 0,
    overdueItems: 0,
    approvedItems: 0,
    returnedItems: 0,
    activeUsers: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const requests = dataService.getRequests();
      const components = dataService.getComponents();
      
      const now = new Date();
      const overdueItems = requests.filter(r => 
        r.status === 'approved' && new Date(r.dueDate) < now
      );

      const activeUsers = new Set(requests.map(r => r.studentId)).size;
      const totalInventory = components.reduce((sum, c) => sum + c.totalQuantity, 0);
      const borrowedItems = components.reduce((sum, c) => sum + (c.totalQuantity - c.availableQuantity), 0);
      const utilizationRate = totalInventory > 0 ? Math.round((borrowedItems / totalInventory) * 100) : 0;

      setStats({
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        totalComponents: components.length,
        overdueItems: overdueItems.length,
        approvedItems: requests.filter(r => r.status === 'approved').length,
        returnedItems: requests.filter(r => r.status === 'returned').length,
        activeUsers,
        utilizationRate,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const exportCSV = async () => {
    try {
      const csvContent = await dataService.exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `isaac-asimov-lab-report-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    { id: 'analytics', label: 'Analytics', icon: Activity, color: 'from-purple-500 to-indigo-500' },
    { id: 'requests', label: 'Requests', icon: CheckSquare, color: 'from-yellow-500 to-orange-500' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, color: 'from-green-500 to-emerald-500' },
    { id: 'inventory', label: 'Inventory', icon: Package, color: 'from-purple-500 to-pink-500' },
    { id: 'history', label: 'History', icon: Clock, color: 'from-indigo-500 to-blue-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'requests':
        return <RequestManagement onUpdate={loadStats} />;
      case 'returns':
        return <ReturnManagement onUpdate={loadStats} />;
      case 'inventory':
        return <InventoryManagement />;
      case 'history':
        return <BorrowHistory />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-peacock-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl p-8 border border-peacock-500/30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-peacock-500/10 to-blue-500/10 backdrop-blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 mb-6"
          >
            <div className="p-4 bg-gradient-to-br from-peacock-500 to-blue-500 rounded-2xl shadow-lg animate-glow">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Lab Control Center</h2>
              <p className="text-peacock-200 text-lg">Advanced robotics laboratory management with real-time insights</p>
            </div>
          </motion.div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-blue-400' },
              { label: 'Utilization', value: `${stats.utilizationRate}%`, icon: Activity, color: 'text-green-400' },
              { label: 'Pending', value: stats.pendingRequests, icon: Clock, color: 'text-yellow-400' },
              { label: 'Overdue', value: stats.overdueItems, icon: AlertTriangle, color: 'text-red-400' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-dark-800/30 backdrop-blur-sm rounded-xl p-4 border border-dark-700/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="text-peacock-300 text-sm">{item.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Total Requests', 
            value: stats.totalRequests, 
            icon: Users, 
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            trend: '+12%',
            trendColor: 'text-green-400'
          },
          { 
            title: 'Pending Requests', 
            value: stats.pendingRequests, 
            icon: Clock, 
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            trend: '-5%',
            trendColor: 'text-green-400'
          },
          { 
            title: 'Approved Items', 
            value: stats.approvedItems, 
            icon: CheckSquare, 
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            trend: '+8%',
            trendColor: 'text-green-400'
          },
          { 
            title: 'Component Types', 
            value: stats.totalComponents, 
            icon: Package, 
            color: 'from-peacock-500 to-blue-500',
            bgColor: 'bg-peacock-500/10',
            borderColor: 'border-peacock-500/30',
            trend: '+2',
            trendColor: 'text-green-400'
          },
          { 
            title: 'Returned Items', 
            value: stats.returnedItems, 
            icon: RotateCcw, 
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            trend: '+15%',
            trendColor: 'text-green-400'
          },
          { 
            title: 'Overdue Items', 
            value: stats.overdueItems, 
            icon: AlertTriangle, 
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            trend: '-3%',
            trendColor: 'text-green-400'
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative overflow-hidden ${stat.bgColor} backdrop-blur-xl rounded-2xl border ${stat.borderColor} p-6 group hover:shadow-2xl transition-all duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:animate-pulse`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="text-3xl font-bold text-white"
                    >
                      {stat.value}
                    </motion.div>
                    <div className={`text-sm font-medium ${stat.trendColor} flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                </div>
                <h3 className="text-peacock-200 font-medium">{stat.title}</h3>
                <div className="mt-3 h-1 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stat.value / 50) * 100, 100)}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'System Health',
            status: 'Optimal',
            icon: Shield,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            description: 'All systems operational'
          },
          {
            title: 'Data Sync',
            status: 'Active',
            icon: Database,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            description: 'Real-time synchronization'
          },
          {
            title: 'Performance',
            status: 'Excellent',
            icon: Zap,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            description: 'Response time: 120ms'
          }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`${item.bgColor} backdrop-blur-xl rounded-2xl border ${item.borderColor} p-6 hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-peacock-300 text-sm">{item.status}</p>
                </div>
              </div>
              <p className="text-peacock-400 text-sm">{item.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 206, 209, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={exportCSV}
          className="group relative overflow-hidden bg-gradient-to-r from-peacock-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-peacock-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Download className="w-5 h-5 group-hover:animate-bounce" />
            Export Comprehensive Report
          </div>
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-peacock-900/50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-peacock-200 to-blue-200 bg-clip-text text-transparent mb-3">
            Administrative Control Center
          </h1>
          <p className="text-peacock-300 text-xl">Advanced laboratory management with enterprise-grade analytics</p>
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
                      layoutId="activeTab"
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
      </div>
    </div>
  );
};

export default AdminDashboard;