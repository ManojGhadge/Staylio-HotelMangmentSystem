import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RazorpayPayment from '../components/RazorpayPayment';
import hotelService from '../services/hotelService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(''); // 'pay_at_hotel' or 'online'
    const [showPaymentSection, setShowPaymentSection] = useState(false);

    const { checkIn, checkOut, guests, hotel, room } = location.state || {};

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: ''
    });

    useEffect(() => {
        // Pre-fill form data if user is logged in
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }

        const checkHotelClaimStatus = async () => {
            if (!hotel && !id) {
                navigate('/hotels');
                return;
            }

            // Check if hotel is claimed via API
            if (hotel) {
                try {
                    const claimStatus = await hotelService.checkHotelClaimStatus(hotel.id);

                    console.log('BookingPage - Hotel claim status from API:', claimStatus);

                    if (!claimStatus.claimed) {
                        navigate('/hotel-unclaimed', {
                            state: { hotel }
                        });
                    }
                } catch (error) {
                    console.error('Error checking hotel claim status:', error);
                    // If API fails, redirect to hotels page for safety
                    navigate('/hotels');
                }
            }
        };

        checkHotelClaimStatus();
    }, [hotel, id, navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            alert('Please fill in all required fields');
            return;
        }

        // Show payment method selection
        setShowPaymentSection(true);
    };

    const parsePrice = (price) => {
        if (!price) return 0;
        const stringPrice = String(price).replace(/[^0-9.]/g, '');
        const parsed = parseFloat(stringPrice);
        return isNaN(parsed) ? 0 : parsed;
    };

    const handlePaymentMethodSelect = async (method) => {
        setPaymentMethod(method);
        setLoading(true);

        try {
            // Calculate totals
            let nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
            if (nights < 1 || isNaN(nights)) nights = 1;

            const roomPrice = parsePrice(room?.pricePerNight);
            const hotelPrice = parsePrice(hotel.pricePerNight);
            const pricePerNight = roomPrice > 0 ? roomPrice : hotelPrice;

            const subtotal = pricePerNight * nights;
            const taxes = Math.round(subtotal * 0.1);
            const totalAmount = subtotal + taxes;

            // Prepare booking data
            const bookingData = {
                hotelId: hotel.id,
                hotelOwnerId: hotel.hotelOwnerId || null,
                userId: user ? user.id : 1, // Use logged-in user ID, fallback to 1 only for guests
                guestName: `${formData.firstName} ${formData.lastName}`,
                guestEmail: formData.email,
                guestPhone: formData.phone,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests: guests,
                rooms: 1,
                roomType: room.roomType,
                totalNights: nights,
                pricePerNight: pricePerNight,
                totalAmount: totalAmount,
                specialRequests: formData.specialRequests || '',
                paymentMethod: method,
                status: 'PENDING'
            };

            if (method === 'pay_at_hotel') {
                // Create booking directly for pay at hotel
                bookingData.paymentStatus = 'PAY_AT_HOTEL';
                bookingData.status = 'CONFIRMED';

                const response = await bookingService.createBooking(bookingData);

                setLoading(false);

                // Navigate to success page
                navigate('/payment/success', {
                    state: {
                        booking: response.booking,
                        paymentMethod: 'pay_at_hotel'
                    }
                });
            }
            // For online payment, the Razorpay component will handle it
            else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            setLoading(false);
            alert('Failed to create booking. Please try again.');
        }
    };

    const handleRazorpaySuccess = async (paymentId) => {
        setLoading(true);

        try {
            // Calculate totals
            let nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
            if (nights < 1 || isNaN(nights)) nights = 1;

            const roomPrice = parsePrice(room?.pricePerNight);
            const hotelPrice = parsePrice(hotel.pricePerNight);
            const pricePerNight = roomPrice > 0 ? roomPrice : hotelPrice;

            const subtotal = pricePerNight * nights;
            const taxes = Math.round(subtotal * 0.1);
            const totalAmount = subtotal + taxes;

            // Prepare booking data with payment ID
            const bookingData = {
                hotelId: hotel.id,
                hotelOwnerId: hotel.hotelOwnerId || null,
                userId: user ? user.id : 1, // Use logged-in user ID, fallback to 1 only for guests
                guestName: `${formData.firstName} ${formData.lastName}`,
                guestEmail: formData.email,
                guestPhone: formData.phone,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests: guests,
                rooms: 1,
                roomType: room.roomType,
                totalNights: nights,
                pricePerNight: pricePerNight,
                totalAmount: totalAmount,
                specialRequests: formData.specialRequests || '',
                paymentMethod: 'online',
                razorpayPaymentId: paymentId,
                paymentStatus: 'PAID',
                status: 'CONFIRMED'
            };

            const response = await bookingService.createBooking(bookingData);

            setLoading(false);

            // Navigate to success page
            navigate('/payment/success', {
                state: {
                    booking: response.booking,
                    paymentId: paymentId,
                    paymentMethod: 'online'
                }
            });
        } catch (error) {
            console.error('Error creating booking after payment:', error);
            setLoading(false);
            navigate('/payment/failed', {
                state: { error: 'Failed to confirm booking after payment' }
            });
        }
    };

    const handleRazorpayFailure = (error) => {
        console.error('Payment failed:', error);
        setLoading(false);
        navigate('/payment/failed', {
            state: { error: error }
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!hotel) return null;

    let nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (nights < 1 || isNaN(nights)) nights = 1;

    const roomPrice = parsePrice(room?.pricePerNight);
    const hotelPrice = parsePrice(hotel.pricePerNight);
    const pricePerNight = roomPrice > 0 ? roomPrice : hotelPrice;

    const subtotal = pricePerNight * nights;
    const taxes = Math.round(subtotal * 0.1);
    const total = subtotal + taxes;

    return (
        <div className="min-h-screen bg-[#060010]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Complete your booking</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0f172a]/50 rounded-xl shadow-sm p-6 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-6">Guest Information</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            disabled={showPaymentSection}
                                            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            disabled={showPaymentSection}
                                            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={showPaymentSection}
                                            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={showPaymentSection}
                                            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Special Requests (Optional)</label>
                                    <textarea
                                        name="specialRequests"
                                        rows="3"
                                        value={formData.specialRequests}
                                        onChange={handleChange}
                                        disabled={showPaymentSection}
                                        className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none disabled:bg-gray-800 disabled:cursor-not-allowed text-white"
                                    ></textarea>
                                </div>

                                {!showPaymentSection ? (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-[#a855f7]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue to Payment
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="border-t border-white/10 pt-6">
                                            <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>

                                            {/* Payment Method Options */}
                                            <div className="space-y-3">
                                                {/* Pay at Hotel Option */}
                                                <button
                                                    type="button"
                                                    onClick={() => handlePaymentMethodSelect('pay_at_hotel')}
                                                    disabled={loading || paymentMethod === 'online'}
                                                    className="w-full p-4 border-2 border-white/10 rounded-xl hover:border-[#a855f7] hover:bg-[#0f172a] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-semibold text-white">Pay at Hotel</p>
                                                                <p className="text-sm text-gray-400">Pay when you check-in</p>
                                                            </div>
                                                        </div>
                                                        <svg className="w-6 h-6 text-gray-400 group-hover:text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </button>

                                                {/* Online Payment Option */}
                                                <div className="w-full p-4 border-2 border-white/10 rounded-xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-[#8400ff]/10 rounded-full flex items-center justify-center">
                                                                <svg className="w-6 h-6 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-semibold text-white">Online Payment</p>
                                                                <p className="text-sm text-gray-400">Pay securely with Razorpay</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Razorpay Payment Button */}
                                                    <RazorpayPayment
                                                        amount={total}
                                                        user={{
                                                            name: `${formData.firstName} ${formData.lastName}`,
                                                            email: formData.email,
                                                            contact: formData.phone
                                                        }}
                                                        onSuccess={handleRazorpaySuccess}
                                                        onFailure={handleRazorpayFailure}
                                                    />
                                                </div>
                                            </div>

                                            {/* Back Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPaymentSection(false);
                                                    setPaymentMethod('');
                                                }}
                                                disabled={loading}
                                                className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ← Back to Edit Information
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0f172a]/50 rounded-xl shadow-sm p-6 border border-white/10 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>

                            <div className="mb-4">
                                <h3 className="font-semibold text-white">{hotel.name}</h3>
                                <p className="text-sm text-gray-500">{hotel.city}, {hotel.country}</p>
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-4 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Check-in</span>
                                    <span className="font-medium">{checkIn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Check-out</span>
                                    <span className="font-medium">{checkOut}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Guests</span>
                                    <span className="font-medium">{guests}</span>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">₹{pricePerNight} x {nights} nights</span>
                                    <span className="font-medium text-white">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Taxes & Fees (10%)</span>
                                    <span className="font-medium text-white">₹{taxes}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                                    <span className="text-white">Total</span>
                                    <span className="text-[#a855f7]">₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BookingPage;

