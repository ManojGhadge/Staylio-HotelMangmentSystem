import React from 'react';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({ hotel, showPrice = true }) => {
    const navigate = useNavigate();

    const getPrimaryImage = (hotel) => {
        if (hotel.images && hotel.images.length > 0) {
            const primary = hotel.images.find(img => img.isPrimary);
            return primary ? primary.imageUrl : hotel.images[0].imageUrl;
        }
        if (hotel.allPhotoUrls) {
            const urls = hotel.allPhotoUrls.split(',');
            return urls[0].trim();
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    };

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
        >
            <div className="relative h-48">
                <img
                    src={getPrimaryImage(hotel)}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    <lord-icon
                        src="https://cdn.lordicon.com/edplgash.json"
                        trigger="hover"
                        colors="primary:#facc15,secondary:#eab308"
                        style={{ width: '16px', height: '16px' }}
                    ></lord-icon>
                    {hotel.rating || 'New'}
                </div>
                {/* Claim Status Badge */}
                {/* Claim Status Badge */}
                {!hotel.hotelOwnerId && (
                    <div className="absolute top-3 left-3 bg-gray-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        Unclaimed
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{hotel.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hotel.city}, {hotel.country}
                </p>
                <div className="flex items-center justify-between mt-4">
                    {showPrice && (
                        <div>
                            <span className="text-xl font-bold text-blue-600">₹{hotel.pricePerNight}</span>
                            <span className="text-sm text-gray-500">/night</span>
                        </div>
                    )}
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelCard;
