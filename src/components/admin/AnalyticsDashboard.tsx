import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Users,
  Package,
  Clock,
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { BorrowRequest, Component } from '../../types';

interface AnalyticsData {
  totalRequests: number;
  weeklyGrowth: number;
  popularComponents: Array<{ name: string; count: number; percentage: number }>;
  userActivity: Array<{ date: string; requests: number }>;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  averageReturnTime: number;
  peakUsageHours: Array<{ hour: number; count: number }>;
  monthlyTrends: Array<{ month: string; requests: number; returns: number }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const requests = dataService.getRequests();
      const components = dataService.getComponents();

      // Filter by time range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const filteredRequests = requests.filter(r => new Date(r.requestDate) >= startDate);

      // Calculate analytics
      const totalRequests = filteredRequests.length;
      const previousPeriodRequests = requests.filter(r => {
        const requestDate = new Date(r.requestDate);
        const previousStart = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
        return requestDate >= previousStart && requestDate < startDate;
      }).length;

      const weeklyGrowth = previousPeriodRequests > 0 
        ? Math.round(((totalRequests - previousPeriodRequests) / previousPeriodRequests) * 100)
        : 100;

      // Popular components
      const componentCounts = filteredRequests.reduce((acc, req) => {
        acc[req.componentName] = (acc[req.componentName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularComponents = Object.entries(componentCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalRequests) * 100)
        }));

      // Category distribution
      const categoryMap = components.reduce((acc, comp) => {
        acc[comp.id] = comp.category;
        return acc;
      }, {} as Record<string, string>);

      const categoryCounts = filteredRequests.reduce((acc, req) => {
        const category = categoryMap[req.componentId] || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryDistribution = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / totalRequests) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      // Average return time
      const returnedRequests = filteredRequests.filter(r => r.status === 'returned' && r.returnedAt);
      const averageReturnTime = returnedRequests.length > 0
        ? Math.round(returnedRequests.reduce((sum, req) => {
            const requestDate = new Date(req.requestDate);
            const returnDate = new Date(req.returnedAt!);
            return sum + (returnDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / returnedRequests.length)
        : 0;

      // User activity (last 7 days)
      const userActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayRequests = requests.filter(r => {
          const reqDate = new Date(r.requestDate);
          return reqDate.toDateString() === date.toDateString();
        }).length;
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          requests: dayRequests
        };
      }).reverse();

      // Monthly trends (last 6 months)
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthRequests = requests.filter(r => {
          const reqDate = new Date(r.requestDate);
          return reqDate.getMonth() === date.getMonth() && reqDate.getFullYear() === date.getFullYear();
        });
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          requests: monthRequests.length,
          returns: monthRequests.filter(r => r.status === 'returned').length
        };
      }).reverse();

      setAnalytics({
        totalRequests,
        weeklyGrowth,
        popularComponents,
        userActivity,
        categoryDistribution,
        averageReturnTime,
        peakUsageHours: [], // Simplified for demo
        monthlyTrends
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peacock-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Advanced Analytics</h2>
              <p className="text-purple-200">Deep insights into lab usage patterns and trends</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Requests',
            value: analytics.totalRequests,
            change: analytics.weeklyGrowth,
            icon: BarChart3,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
          },
          {
            title: 'Growth Rate',
            value: `${analytics.weeklyGrowth}%`,
            change: analytics.weeklyGrowth > 0 ? analytics.weeklyGrowth : 0,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30'
          },
          {
            title: 'Avg Return Time',
            value: `${analytics.averageReturnTime} days`,
            change: -5,
            icon: Clock,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30'
          },
          {
            title: 'Active Categories',
            value: analytics.categoryDistribution.length,
            change: 2,
            icon: Package,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${metric.bgColor} backdrop-blur-xl rounded-2xl border ${metric.borderColor} p-6 hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <h3 className="text-peacock-300 text-sm font-medium mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Components */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-peacock-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-peacock-400" />
            <h3 className="text-xl font-bold text-white">Most Requested Components</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.popularComponents.map((component, index) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-peacock-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{component.name}</p>
                    <p className="text-peacock-300 text-sm">{component.count} requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{component.percentage}%</p>
                  <div className="w-20 h-2 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${component.percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-peacock-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-peacock-500/20 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-6 h-6 text-peacock-400" />
            <h3 className="text-xl font-bold text-white">Category Distribution</h3>
          </div>
          
          <div className="space-y-3">
            {analytics.categoryDistribution.map((category, index) => {
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-yellow-500 to-orange-500',
                'from-purple-500 to-pink-500',
                'from-red-500 to-rose-500'
              ];
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                    <span className="text-white font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-peacock-300">{category.count}</span>
                    <span className="text-white font-bold">{category.percentage}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-peacock-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-peacock-400" />
          <h3 className="text-xl font-bold text-white">Weekly Activity</h3>
        </div>
        
        <div className="flex items-end justify-between h-40 gap-2">
          {analytics.userActivity.map((day, index) => {
            const maxRequests = Math.max(...analytics.userActivity.map(d => d.requests));
            const height = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
            
            return (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                className="flex-1 bg-gradient-to-t from-peacock-500 to-blue-500 rounded-t-lg min-h-[20px] relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dark-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.requests}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-peacock-300 text-xs">
                  {day.date}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-peacock-500/20 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-peacock-400" />
          <h3 className="text-xl font-bold text-white">Monthly Trends</h3>
        </div>
        
        <div className="grid grid-cols-6 gap-4">
          {analytics.monthlyTrends.map((month, index) => (
            <motion.div
              key={month.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="text-center p-4 bg-dark-700/30 rounded-lg"
            >
              <p className="text-peacock-300 text-sm mb-2">{month.month}</p>
              <p className="text-2xl font-bold text-white mb-1">{month.requests}</p>
              <p className="text-green-400 text-sm">{month.returns} returned</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;