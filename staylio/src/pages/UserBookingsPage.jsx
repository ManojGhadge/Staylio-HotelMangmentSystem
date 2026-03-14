import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import hotelService from '../services/hotelService';
import { generateReceipt } from '../utils/receiptGenerator';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserBookingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                // Assuming user object has an id field. If not, might need to use a default or handle it.
                // For now, using user.id or a fallback if testing without real auth
                const userId = user.id || 1;
                const data = await bookingService.getUserBookings(userId);
                setBookings(data);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
                setError('Failed to load your bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Awaiting Confirmation';
            case 'CONFIRMED': return 'Booking Confirmed';
            case 'CANCELLED': return 'Booking Cancelled';
            case 'COMPLETED': return 'Stay Completed';
            default: return status;
        }
    };

    const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

    const handleDownloadReceipt = async (bookingId, e) => {
        try {
            setDownloadingReceiptId(bookingId);
            // Fetch full booking details to ensure we have all fields (payment ID, etc)
            const fullBooking = await bookingService.getBookingById(bookingId);
            // Fetch hotel details for address, etc
            const hotel = await hotelService.getHotelById(fullBooking.hotelId);

            generateReceipt(fullBooking, hotel);
        } catch (error) {
            console.error('Error generating receipt:', error);
            // Fallback: try using the booking object purely if fetch fails? 
            // Better to show error.
            alert('Could not generate receipt at this time. Please try again.');
        } finally {
            setDownloadingReceiptId(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#060010] flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-white text-xl mb-4">Please log in to view your bookings.</p>
                        <button onClick={() => navigate('/login')} className="btn-magic">
                            Log In
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060010] flex flex-col">
            <Navbar />

            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bento-card h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-400 bg-red-900/20 backdrop-blur-md rounded-xl border border-red-800/50">
                        {error}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16 bento-card">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h2 className="text-xl font-bold text-white mb-2">No bookings yet</h2>
                        <p className="text-gray-400 mb-6">You haven't made any bookings yet. Start exploring our hotels!</p>
                        <button onClick={() => navigate('/hotels')} className="btn-magic">
                            Explore Hotels
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bento-card p-6 flex flex-col md:flex-row gap-6 hover:border-[#a855f7]/50 transition-colors">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {booking.hotelName || `Hotel #${booking.hotelId}`}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Booking ID: <span className="font-mono text-[#a855f7]">{booking.id}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                            booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                                'bg-red-500/10 text-red-400 border-red-500/30'
                                            }`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider">Check-in</p>
                                            <p className="text-white font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider">Check-out</p>
                                            <p className="text-white font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider">Guests</p>
                                            <p className="text-white font-medium">{booking.guests}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider">Total</p>
                                            <p className="text-[#a855f7] font-bold">₹{booking.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 min-w-[150px]">
                                    <button
                                        onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                                        className="btn-outline-magic text-sm py-2"
                                    >
                                        View Hotel
                                    </button>
                                    {booking.status === 'CONFIRMED' && (
                                        <button
                                            onClick={(e) => handleDownloadReceipt(booking.id, e)}
                                            disabled={downloadingReceiptId === booking.id}
                                            className="px-4 py-2 rounded-lg bg-[#0f172a] border border-[#8400ff]/30 text-gray-300 hover:text-white hover:bg-[#a855f7]/10 transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            {downloadingReceiptId === booking.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Preparing...</span>
                                                </>
                                            ) : (
                                                'Download Receipt'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default UserBookingsPage;
