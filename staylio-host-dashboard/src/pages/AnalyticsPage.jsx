import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, hotelAPI } from '../services/api';
import {
    TrendingUp,
    IndianRupee,
    Calendar,
    Users,
    Building2,
    BarChart3,
    PieChart,
    Activity,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalHotels: 0,
        averageBookingValue: 0,
        monthlyRevenue: [],
        bookingsByStatus: {},
        revenueByHotel: [],
        recentTrends: {},
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        fetchAnalytics();
    }, [user?.id, timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                return;
            }

            // Fetch bookings and hotels
            const [bookingsRes, hotelsRes] = await Promise.all([
                bookingAPI.getBookingsByHostClaimedHotels(user.id).catch(() => ({ data: [] })),
                hotelAPI.getHotelsByOwnerId(user.id).catch(() => ({ data: [] })),
            ]);

            const bookings = bookingsRes.data || [];
            const hotels = hotelsRes.data || [];

            // Calculate analytics
            const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            const totalBookings = bookings.length;
            const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            // Bookings by status
            const bookingsByStatus = {
                CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
                PENDING: bookings.filter(b => b.status === 'PENDING').length,
                CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
                COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
            };

            // Revenue by hotel
            const revenueByHotel = hotels.map(hotel => {
                const hotelBookings = bookings.filter(b => b.hotelId === hotel.id);
                const revenue = hotelBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                return {
                    hotelName: hotel.name,
                    revenue,
                    bookings: hotelBookings.length,
                };
            }).sort((a, b) => b.revenue - a.revenue);

            // Monthly revenue (last 6 months)
            const monthlyRevenue = calculateMonthlyRevenue(bookings);

            // Recent trends (compare with previous period)
            const recentTrends = calculateTrends(bookings, parseInt(timeRange));

            setAnalytics({
                totalRevenue,
                totalBookings,
                totalHotels: hotels.length,
                averageBookingValue,
                monthlyRevenue,
                bookingsByStatus,
                revenueByHotel,
                recentTrends,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMonthlyRevenue = (bookings) => {
        const months = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            months[key] = 0;
        }

        // Calculate revenue for each month
        bookings.forEach(booking => {
            if (booking.createdAt) {
                const date = new Date(booking.createdAt);
                const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (months.hasOwnProperty(key)) {
                    months[key] += booking.totalAmount || 0;
                }
            }
        });

        return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
    };

    const calculateTrends = (bookings, days) => {
        const now = new Date();
        const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

        const currentPeriod = bookings.filter(b =>
            new Date(b.createdAt) >= periodStart && new Date(b.createdAt) <= now
        );
        const previousPeriod = bookings.filter(b =>
            new Date(b.createdAt) >= previousPeriodStart && new Date(b.createdAt) < periodStart
        );

        const currentRevenue = currentPeriod.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const previousRevenue = previousPeriod.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const revenueChange = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        const bookingsChange = previousPeriod.length > 0
            ? ((currentPeriod.length - previousPeriod.length) / previousPeriod.length) * 100
            : 0;

        return {
            revenueChange,
            bookingsChange,
            currentRevenue,
            previousRevenue,
            currentBookings: currentPeriod.length,
            previousBookings: previousPeriod.length,
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatPercent = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                    <p className="text-gray-400 mt-1">Track your performance and insights</p>
                </div>

                {/* Time Range Selector */}
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="input-magic px-4 py-2 rounded-lg"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff] mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(analytics.totalRevenue)}
                            icon={IndianRupee}
                            trend={analytics.recentTrends.revenueChange}
                            trendLabel={`vs previous ${timeRange} days`}
                            color="green"
                        />
                        <MetricCard
                            title="Total Bookings"
                            value={analytics.totalBookings}
                            icon={Calendar}
                            trend={analytics.recentTrends.bookingsChange}
                            trendLabel={`vs previous ${timeRange} days`}
                            color="blue"
                        />
                        <MetricCard
                            title="Average Booking Value"
                            value={formatCurrency(analytics.averageBookingValue)}
                            icon={TrendingUp}
                            color="purple"
                        />
                        <MetricCard
                            title="Total Hotels"
                            value={analytics.totalHotels}
                            icon={Building2}
                            color="orange"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Revenue Chart */}
                        <div className="bento-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
                                <BarChart3 className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                {analytics.monthlyRevenue.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">{item.month}</span>
                                            <span className="font-semibold text-white">
                                                {formatCurrency(item.revenue)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-[#8400ff] h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((item.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bookings by Status */}
                        <div className="bento-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Bookings by Status</h3>
                                <PieChart className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-4">
                                <StatusBar
                                    label="Confirmed"
                                    value={analytics.bookingsByStatus.CONFIRMED || 0}
                                    total={analytics.totalBookings}
                                    color="bg-green-500"
                                />
                                <StatusBar
                                    label="Pending"
                                    value={analytics.bookingsByStatus.PENDING || 0}
                                    total={analytics.totalBookings}
                                    color="bg-yellow-500"
                                />
                                <StatusBar
                                    label="Completed"
                                    value={analytics.bookingsByStatus.COMPLETED || 0}
                                    total={analytics.totalBookings}
                                    color="bg-blue-500"
                                />
                                <StatusBar
                                    label="Cancelled"
                                    value={analytics.bookingsByStatus.CANCELLED || 0}
                                    total={analytics.totalBookings}
                                    color="bg-red-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Revenue by Hotel */}
                    <div className="bento-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Revenue by Hotel</h3>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        {analytics.revenueByHotel.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Hotel Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Bookings
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Revenue
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Avg. per Booking
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {analytics.revenueByHotel.map((hotel, index) => (
                                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Building2 className="h-5 w-5 text-[#a855f7] mr-3" />
                                                        <span className="text-sm font-medium text-white">
                                                            {hotel.hotelName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    {hotel.bookings}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                                    {formatCurrency(hotel.revenue)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                    {formatCurrency(hotel.bookings > 0 ? hotel.revenue / hotel.bookings : 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, color }) => {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-400 border border-green-500/30',
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
        orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    };

    return (
        <div className="bento-card p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-2">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center mt-2">
                            {trend >= 0 ? (
                                <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-red-400 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-500 ml-2">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
};

const StatusBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-white">
                    {value} ({percentage.toFixed(1)}%)
                </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
