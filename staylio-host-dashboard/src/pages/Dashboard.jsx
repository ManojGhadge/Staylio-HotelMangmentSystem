import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  TrendingUp,
  Calendar,
  IndianRupee,
  ArrowUpRight,
} from 'lucide-react';
import { hotelAPI, bookingAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let hotelsRes;
      let bookingsRes;

      if (user?.id) {
        hotelsRes = await hotelAPI.getHotelsByOwnerId(user.id).catch(() => ({ data: [] }));
        bookingsRes = await bookingAPI.getBookingsByHostClaimedHotels(user.id).catch(() => ({ data: [] }));
      } else {
        hotelsRes = { data: [] };
        bookingsRes = { data: [] };
      }

      const bookingsData = bookingsRes.data || [];
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      setStats({
        totalHotels: hotelsRes.data?.length || 0,
        totalBookings: bookingsData.length,
        revenue: totalRevenue,
      });

      const sortedBookings = [...bookingsData].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sortedBookings.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const bookingDate = new Date(date);
    const diffMs = now - bookingDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#8400ff] to-[#6366f1] rounded-xl p-8 text-white shadow-lg border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's what's happening with your properties today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Hotels"
          value={stats.totalHotels}
          icon={Building2}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={IndianRupee}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#8400ff]" />
              Performance Overview
            </h3>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <PerformanceItem
              label="Total Hotels"
              value={stats.totalHotels}
              color="blue"
            />
            <PerformanceItem
              label="Total Bookings"
              value={stats.totalBookings}
              color="green"
            />
            <PerformanceItem
              label="Total Revenue"
              value={formatCurrency(stats.revenue)}
              color="purple"
              highlight
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bento-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#a855f7]" />
              Recent Bookings
            </h3>
            <span className="px-3 py-1 bg-[#8400ff]/20 text-[#a855f7] rounded-full text-xs font-semibold border border-[#8400ff]/30">
              Latest
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <ActivityItem
                  key={booking.id}
                  text={`${booking.guestName} - ${booking.status}`}
                  time={getTimeAgo(booking.createdAt)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, loading }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };

  const bgColors = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    purple: 'bg-purple-500/10',
  };

  return (
    <div className="bento-card p-6 hover:shadow-[0_0_30px_rgba(132,0,255,0.2)] transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">
            {loading ? (
              <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${bgColors[color]}`}>
          <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

const PerformanceItem = ({ label, value, color, highlight }) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${highlight ? `border ${colors[color]}` : 'bg-white/5 hover:bg-white/10'
      }`}>
      <span className="text-gray-300 font-medium">{label}</span>
      <span className={`font-bold text-lg px-3 py-1 rounded-lg ${highlight ? colors[color] : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
};

const ActivityItem = ({ text, time }) => (
  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
    <div className="p-2 bg-gradient-to-br from-[#8400ff] to-[#6366f1] rounded-lg">
      <Calendar className="h-4 w-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{text}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </div>
);

export default Dashboard;