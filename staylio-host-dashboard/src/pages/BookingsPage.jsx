import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, hotelAPI } from '../services/api';
import {
    Calendar,
    User,
    Mail,
    Phone,
    DollarSign,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Filter,
} from 'lucide-react';

const BookingsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [hotels, setHotels] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchBookings();
    }, [user?.id]);

    const fetchBookings = async () => {
        try {
            setLoading(true);

            if (!user?.id) {
                setBookings([]);
                return;
            }

            // Fetch bookings for hotels claimed by this host
            const bookingsRes = await bookingAPI.getBookingsByHostClaimedHotels(user.id);
            const bookingsData = bookingsRes.data || [];

            // Fetch hotel details for each booking
            const hotelIds = [...new Set(bookingsData.map(b => b.hotelId))];
            const hotelsMap = {};

            await Promise.all(
                hotelIds.map(async (hotelId) => {
                    try {
                        const hotelRes = await hotelAPI.getHotelById(hotelId);
                        hotelsMap[hotelId] = hotelRes.data;
                    } catch (error) {
                        console.error(`Error fetching hotel ${hotelId}:`, error);
                    }
                })
            );

            setHotels(hotelsMap);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'PENDING':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'COMPLETED':
                return <CheckCircle className="h-5 w-5 text-blue-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case 'CONFIRMED':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'CANCELLED':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'PENDING':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'COMPLETED':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'ALL') return true;
        return booking.status === filter;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        totalRevenue: bookings.reduce((sum, b) => b.status !== 'CANCELLED' ? sum + (b.totalAmount || 0) : sum, 0),
    };

    const handleMarkPaid = async (bookingId) => {
        if (window.confirm('Are you sure you want to mark this booking as PAID and CONFIRMED?')) {
            try {
                // First update payment status to SUCCESS (Manual override)
                await bookingAPI.updatePaymentStatus(bookingId, { razorpayPaymentId: 'MANUAL_HOST_CONFIRM' });
                // Then confirm (Host Action)
                await bookingAPI.confirmBooking(bookingId);
                fetchBookings(); // Refresh list
            } catch (error) {
                console.error('Error confirming booking', error);
                alert('Failed to confirm booking: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getStatusLabel = (booking) => {
        if (booking.status === 'PENDING') {
            if (booking.paymentStatus === 'SUCCESS' || booking.paymentStatus === 'PAID') {
                return 'Action Required';
            }
            return 'Awaiting Payment'; // or just PENDING
        }
        if (booking.status === 'CONFIRMED') return 'Upcoming Stay';
        if (booking.status === 'COMPLETED') return 'Completed Stay';
        if (booking.status === 'CANCELLED') return 'Cancelled Booking';
        return booking.status;
    };

    const getActionRequired = (booking) => {
        return booking.status === 'PENDING' && (booking.paymentStatus === 'SUCCESS' || booking.paymentStatus === 'PAID');
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
                    <p className="text-gray-400 mt-1">Manage all bookings for your claimed hotels</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Bookings"
                    value={stats.total}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    color="yellow"
                    loading={loading}
                />
                <StatCard
                    title="Confirmed"
                    value={stats.confirmed}
                    color="green"
                    loading={loading}
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    color="purple"
                    loading={loading}
                />
                <StatCard
                    title="Cancelled"
                    value={stats.cancelled}
                    color="red"
                    loading={loading}
                />
                {/* 
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    color="yellow"
                    loading={loading}
                /> 
                */}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
                <FilterButton
                    label="All"
                    count={stats.total}
                    active={filter === 'ALL'}
                    onClick={() => setFilter('ALL')}
                />
                <FilterButton
                    label="Pending"
                    count={stats.pending}
                    active={filter === 'PENDING'}
                    onClick={() => setFilter('PENDING')}
                />
                <FilterButton
                    label="Confirmed"
                    count={stats.confirmed}
                    active={filter === 'CONFIRMED'}
                    onClick={() => setFilter('CONFIRMED')}
                />
                <FilterButton
                    label="Completed"
                    count={stats.completed}
                    active={filter === 'COMPLETED'}
                    onClick={() => setFilter('COMPLETED')}
                />
                <FilterButton
                    label="Cancelled"
                    count={stats.cancelled}
                    active={filter === 'CANCELLED'}
                    onClick={() => setFilter('CANCELLED')}
                />
            </div>

            {/* Bookings List */}
            <div className="bento-card overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff] mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
                        <p className="text-gray-400">
                            {filter === 'ALL' ? 'No bookings found.' : `No ${filter.toLowerCase()} bookings found.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Booking Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Guest Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Hotel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Payment & Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    {getStatusIcon(booking.status)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-white">
                                                        {booking.bookingReference || `BK-${booking.id}`}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {booking.rooms} room{booking.rooms > 1 ? 's' : ''} • {booking.totalNights} night{booking.totalNights > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    {booking.guestName}
                                                </div>
                                                <div className="text-gray-400 flex items-center gap-2 mt-1">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    {booking.guestEmail}
                                                </div>
                                                {booking.guestPhone && (
                                                    <div className="text-gray-400 flex items-center gap-2 mt-1">
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        {booking.guestPhone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-white">
                                                    {hotels[booking.hotelId]?.name || 'Loading...'}
                                                </div>
                                                {hotels[booking.hotelId] && (
                                                    <div className="text-gray-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {hotels[booking.hotelId].city}, {hotels[booking.hotelId].state}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="text-white">
                                                    {formatDate(booking.checkInDate)}
                                                </div>
                                                <div className="text-gray-500">to</div>
                                                <div className="text-white">
                                                    {formatDate(booking.checkOutDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm space-y-1">
                                                <div className="font-bold text-white text-lg">
                                                    {formatCurrency(booking.totalAmount)}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={getStatusBadge(booking.status)}>
                                                        {getStatusLabel(booking)}
                                                    </span>
                                                    {booking.paymentMethod && (
                                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600">
                                                            {booking.paymentMethod.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                {booking.razorpayPaymentId && (
                                                    <div className="text-xs text-green-400 font-mono mt-1 bg-green-900/20 px-2 py-1 rounded border border-green-900/30 inline-block">
                                                        {booking.razorpayPaymentId.includes('MANUAL') ? 'Paid at Hotel' : `TXN: ${booking.razorpayPaymentId}`}
                                                    </div>
                                                )}
                                                {booking.status === 'PENDING' && !booking.razorpayPaymentId && (
                                                    <div className="text-xs text-yellow-500 font-medium">
                                                        ⚠ Payment Pending
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {booking.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleMarkPaid(booking.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition-colors shadow-lg shadow-green-900/20"
                                                >
                                                    Mark Paid & Confirm
                                                </button>
                                            ) : (
                                                <span className="text-gray-500 text-xs">No Actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, loading }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        red: 'bg-red-50 border-red-200',
        purple: 'bg-purple-50 border-purple-200',
    };

    const textColorClasses = {
        blue: 'text-blue-900',
        green: 'text-green-900',
        yellow: 'text-yellow-900',
        red: 'text-red-900',
        purple: 'text-purple-900',
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${textColorClasses[color]} mt-1`}>
                {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                    value
                )}
            </p>
        </div>
    );
};

const FilterButton = ({ label, count, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
                ? 'bg-[#8400ff] text-white shadow-lg shadow-purple-500/20'
                : 'bg-[#1e293b] text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white'
                }`}
        >
            {label} ({count})
        </button>
    );
};

export default BookingsPage;
