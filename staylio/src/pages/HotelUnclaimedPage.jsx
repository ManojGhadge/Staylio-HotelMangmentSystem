import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HotelUnclaimedPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hotel } = location.state || {};
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call to save email for notification
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1000);
    };

    if (!hotel) {
        navigate('/hotels');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#060010]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="bg-[#0f172a]/50 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12 border border-white/10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white text-center mb-4">
                        Hotel Not Available for Booking
                    </h1>

                    {/* Hotel Info */}
                    <div className="bg-[#0f172a]/30 rounded-xl p-4 mb-6 border border-white/10">
                        <h2 className="font-semibold text-white text-lg">{hotel.name}</h2>
                        <p className="text-gray-400 text-sm">{hotel.city}, {hotel.country}</p>
                    </div>

                    {/* Message */}
                    <div className="text-center mb-8">
                        <p className="text-gray-300 text-lg mb-4">
                            This hotel is not claimed yet and is currently unavailable for booking.
                        </p>
                        <p className="text-gray-400">
                            We'll notify you as soon as the hotel owner claims this property and it becomes available for reservations.
                        </p>
                    </div>

                    {!submitted ? (
                        <>
                            {/* Email Form */}
                            <form onSubmit={handleSubmit} className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Enter your email to get notified
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        className="flex-1 px-4 py-3 border border-white/10 bg-[#0f172a]/50 text-white rounded-lg focus:ring-2 focus:ring-[#8400ff] outline-none placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white font-semibold rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#a855f7]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {loading ? 'Submitting...' : 'Notify Me'}
                                    </button>
                                </div>
                            </form>

                            <div className="border-t border-white/10 pt-6">
                                <button
                                    onClick={() => navigate('/hotels')}
                                    className="w-full py-3 bg-[#0f172a] text-white font-semibold rounded-lg hover:bg-[#1e293b] transition-colors border border-white/10"
                                >
                                    Explore Other Hotels
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success Message */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-green-400 text-center font-medium">
                                    Thank you! We'll notify you at <span className="font-bold">{email}</span> when this hotel becomes available.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/hotels')}
                                className="w-full py-3 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white font-semibold rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#a855f7]/20"
                            >
                                Explore Other Hotels
                            </button>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HotelUnclaimedPage;
