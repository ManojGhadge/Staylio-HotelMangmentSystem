import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hotelService from '../services/hotelService';

const BookingModal = ({ hotel, room, onClose }) => {
    const navigate = useNavigate();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [checking, setChecking] = useState(false);

    const handleBook = async () => {
        if (!checkIn || !checkOut) {
            alert('Please select check-in and check-out dates');
            return;
        }

        try {
            setChecking(true);

            // Check if hotel is claimed via API
            const claimStatus = await hotelService.checkHotelClaimStatus(hotel.id);

            console.log('Hotel claim status from API:', claimStatus);

            if (!claimStatus.claimed) {
                // Hotel is not claimed, redirect to unclaimed page
                navigate('/hotel-unclaimed', {
                    state: { hotel }
                });
                return;
            }

            // Hotel is claimed, proceed with booking
            navigate(`/hotels/${hotel.id}/book`, {
                state: {
                    checkIn,
                    checkOut,
                    guests,
                    hotel,
                    room
                }
            });
        } catch (error) {
            console.error('Error checking hotel claim status:', error);
            alert('Unable to verify hotel availability. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white">
                    <h3 className="text-xl font-bold">Book {hotel.name}</h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Check-in Date</label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full px-4 py-2 bg-[#060010] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#a855f7] outline-none"
                            style={{ colorScheme: 'dark' }}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Check-out Date</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full px-4 py-2 bg-[#060010] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#a855f7] outline-none"
                            style={{ colorScheme: 'dark' }}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Guests</label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-[#060010] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#a855f7] outline-none"
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-[#060010]/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-transparent border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBook}
                        disabled={checking}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white rounded-lg hover:shadow-lg hover:shadow-[#a855f7]/25 transition-all disabled:opacity-50 font-semibold"
                    >
                        {checking ? 'Checking Availability...' : 'Continue to Book'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
