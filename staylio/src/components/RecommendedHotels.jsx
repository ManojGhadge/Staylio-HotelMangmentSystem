import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recommendationService from '../services/recommendationService';

const RecommendedHotels = ({ userId, selectedCity = null, className = "" }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, selectedCity]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recommendationService.getPersonalizedRecommendations(
        userId, 
        selectedCity, 
        6
      );
      
      setRecommendations(response.recommendations || []);
      setMessage(response.message || '');
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
  };

  if (loading) {
    return (
      <div className={`bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#060010]/50 rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Recommended for You</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchRecommendations}
            className="mt-4 px-4 py-2 bg-[#8400ff] text-white rounded-lg hover:bg-[#7000d6] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 ${className}`}>
        <h3 className="text-xl font-bold text-white mb-4">Recommended for You</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#8400ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#8400ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-white text-lg font-semibold mb-2">No Recommendations Yet</h4>
          <p className="text-gray-400 mb-4">
            Book and review hotels to get personalized recommendations!
          </p>
          <button 
            onClick={() => navigate('/hotels')}
            className="px-6 py-2 bg-[#8400ff] text-white rounded-lg hover:bg-[#7000d6] transition-colors"
          >
            Explore Hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">
          Recommended for You
          {selectedCity && <span className="text-[#8400ff] ml-2">in {selectedCity}</span>}
        </h3>
        <button 
          onClick={fetchRecommendations}
          className="text-sm text-gray-400 hover:text-white transition-colors"
          title="Refresh recommendations"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {message && (
        <p className="text-sm text-gray-400 mb-4">{message}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((hotel) => (
          <div 
            key={hotel.id}
            onClick={() => handleHotelClick(hotel.id)}
            className="bg-[#060010]/50 rounded-xl p-4 cursor-pointer hover:bg-[#060010]/70 transition-all hover:scale-105 border border-white/5 hover:border-[#8400ff]/30"
          >
            {/* Hotel Image */}
            <div className="h-32 bg-gradient-to-br from-[#8400ff]/20 to-[#a855f7]/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {hotel.imageUrl ? (
                <img 
                  src={hotel.imageUrl} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-[#8400ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>

            {/* Hotel Info */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-1 truncate">{hotel.name}</h4>
              <p className="text-gray-400 text-xs mb-2">{hotel.city}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-300">{hotel.rating || 'N/A'}</span>
                </div>
                <span className="text-[#8400ff] font-semibold text-sm">₹{hotel.pricePerNight}</span>
              </div>

              {/* Amenities */}
              {hotel.amenities && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities.split(',').slice(0, 2).map((amenity, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-[#8400ff]/20 text-[#8400ff] px-2 py-1 rounded"
                      >
                        {amenity.trim()}
                      </span>
                    ))}
                    {hotel.amenities.split(',').length > 2 && (
                      <span className="text-xs text-gray-400">+{hotel.amenities.split(',').length - 2} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/hotels')}
            className="text-sm text-[#8400ff] hover:text-white transition-colors"
          >
            View All Hotels →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedHotels;