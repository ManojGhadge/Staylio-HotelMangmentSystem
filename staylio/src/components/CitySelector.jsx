import { useState, useEffect } from 'react';
import hotelService from '../services/hotelService';

const CitySelector = ({ selectedCity, onCityChange, className = "" }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      // Get all hotels and extract unique cities
      const hotels = await hotelService.getAllHotels();
      const uniqueCities = [...new Set(hotels.map(hotel => hotel.city).filter(city => city))];
      setCities(uniqueCities.sort());
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-400 mb-2">Select City</label>
        <div className="bg-[#060010] border border-white/20 rounded-xl px-4 py-3 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Select City for Recommendations
      </label>
      <select
        value={selectedCity || ''}
        onChange={(e) => onCityChange(e.target.value || null)}
        className="w-full bg-[#060010] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8400ff] focus:ring-1 focus:ring-[#8400ff] transition-all"
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Choose a city to get location-specific recommendations
      </p>
    </div>
  );
};

export default CitySelector;