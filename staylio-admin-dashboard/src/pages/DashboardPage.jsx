import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Hotel,
  IndianRupee,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { adminAPI, bookingAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalHotels: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeBookings: 0,
    platformOverview: {
      userGrowth: 0,
      hostApprovalRate: 0,
      bookingCompletion: 0,
      revenueTarget: 0,
    },
    recentActivity: [],
    trends: {
      users: 0,
      hosts: 0,
      hotels: 0,
      revenue: 0,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const adminToken = localStorage.getItem('adminToken');
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

      const [hostsRes, hotelsRes, pendingRes, usersRes, bookingsRes] = await Promise.all([
        adminAPI.getAllHosts().catch(() => ({ data: [] })),
        adminAPI.getAllHotels().catch(() => ({ data: [] })),
        adminAPI.getPendingHosts().catch(() => ({ data: [] })),
        adminAPI.getAllUsers().catch(() => ({ data: [] })),
        bookingAPI.getAllBookings().catch(() => ({ data: [] })),
      ]);

      const hosts = hostsRes.data || [];
      const hotels = hotelsRes.data || [];
      const users = usersRes.data || [];
      const bookings = bookingsRes.data || [];
      const pendingHosts = pendingRes.data || [];

      // --- Helper Functions for Growth ---
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const calculateCountGrowth = (items) => {
        const currentCount = items.filter(i => new Date(i.createdAt) >= thirtyDaysAgo).length;
        const prevCount = items.filter(i => {
          const d = new Date(i.createdAt);
          return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        }).length;

        if (prevCount === 0) return currentCount > 0 ? 100 : 0;
        return ((currentCount - prevCount) / prevCount) * 100;
      };

      const calculateRevenueGrowth = (bookingsList) => {
        const validBookings = bookingsList.filter(b => b.status !== 'CANCELLED');

        const currentRevenue = validBookings
          .filter(b => new Date(b.createdAt) >= thirtyDaysAgo)
          .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

        const prevRevenue = validBookings
          .filter(b => {
            const d = new Date(b.createdAt);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
          })
          .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

        if (prevRevenue === 0) return currentRevenue > 0 ? 100 : 0;
        return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      };

      // --- Calculations ---

      // 1. Total Revenue
      const totalRevenue = bookings
        .filter(b => b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

      // 2. Active Bookings
      const activeBookings = bookings.filter(b =>
        (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
        new Date(b.checkOutDate) >= new Date()
      ).length;

      // 3. Platform Overview
      // User Growth (New users in last 30 days / Total users) - simplified for overview chart
      const userGrowth = 0;

      // Host Approval Rate
      const hostApprovalRate = 0;

      // Booking Completion
      const bookingCompletion = 0;

      // Revenue Target
      const revenueTarget = 0;

      // 4. Recent Activity
      const activities = [
        ...users.map(u => ({ type: 'user', title: 'New user registered', time: u.createdAt, color: 'blue', icon: Users })),
        ...hosts.map(h => ({ type: 'host', title: 'New host registered', time: h.createdAt, color: 'green', icon: Building2 })),
        ...hotels.map(h => ({ type: 'hotel', title: 'New hotel listed', time: h.createdAt, color: 'purple', icon: Hotel })),
        ...bookings.map(b => ({ type: 'booking', title: 'New booking created', time: b.createdAt, color: 'yellow', icon: Calendar })),
      ];

      const recentActivity = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 4);

      setStats({
        totalUsers: users.length,
        totalHosts: hosts.length,
        totalHotels: hotels.length,
        totalRevenue,
        pendingApprovals: pendingHosts.length,
        activeBookings,
        platformOverview: {
          userGrowth,
          hostApprovalRate,
          bookingCompletion,
          revenueTarget,
        },
        recentActivity,
        trends: {
          users: calculateCountGrowth(users),
          hosts: calculateCountGrowth(hosts),
          hotels: calculateCountGrowth(hotels),
          revenue: calculateRevenueGrowth(bookings),
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-blue-500/20 rounded-2xl p-8 text-white shadow-xl backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, Admin! 👋</h1>
        <p className="text-blue-200">Here's what's happening with your platform today.</p>
      </motion.div>




      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
          variants={itemVariants}
        />
        <StatCard
          title="Total Hosts"
          value={stats.totalHosts}
          icon={Building2}
          color="green"
          variants={itemVariants}
        />
        <StatCard
          title="Total Hotels"
          value={stats.totalHotels}
          icon={Hotel}
          color="purple"
          variants={itemVariants}
        />

      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Platform Overview
          </h3>
          <div className="space-y-4">
            <ProgressBar label="User Growth (30d)" value={stats.platformOverview.userGrowth} color="blue" />
            <ProgressBar label="Host Approval Rate" value={stats.platformOverview.hostApprovalRate} color="green" />
            <ProgressBar label="Booking Completion" value={stats.platformOverview.bookingCompletion} color="purple" />
            <ProgressBar label="Revenue Target (500k)" value={stats.platformOverview.revenueTarget} color="yellow" />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  time={getTimeAgo(activity.time)}
                  color={activity.color}
                />
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Building2}
            color="yellow"
          />
          <QuickActionCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={Calendar}
            color="blue"
          />
          <QuickActionCard
            title="Support Tickets"
            value={8}
            icon={Activity}
            color="red"
          />
        </div>
      </motion.div>
    </div >
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, variants }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <motion.div variants={variants} className="card hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
};

const ProgressBar = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2 rounded-full ${colorClasses[color]} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
        />
      </div>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, title, time, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  return (
    <div className="p-4 rounded-xl bg-[#0f172a]/30 border border-white/5 hover:border-white/10 hover:bg-[#0f172a]/50 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value}
        </span>
      </div>
      <p className="text-sm text-slate-300 font-medium">{title}</p>
    </div>
  );
};

export default DashboardPage;

