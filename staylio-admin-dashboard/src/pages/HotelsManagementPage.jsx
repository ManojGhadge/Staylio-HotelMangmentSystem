import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel, Plus, Edit, Trash2, Search, X, Save, MapPin, Building2
} from 'lucide-react';
import { adminAPI, hotelAPI } from '../services/api';

const HotelsManagementPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    pricePerNight: '',
    rating: '',
    totalRooms: '',
    availableRooms: '',
    maxGuests: '',
    amenities: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
    bedrooms: '',
    bathrooms: '',
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllHotels();
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hotelData = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        rating: parseFloat(formData.rating) || 0,
        totalRooms: parseInt(formData.totalRooms) || 0,
        availableRooms: parseInt(formData.availableRooms) || 0,
        maxGuests: parseInt(formData.maxGuests) || 0,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
      };

      if (editingHotel) {
        const response = await hotelAPI.updateHotel(editingHotel.id, hotelData);
        if (response.data.success) {
          alert('Hotel updated successfully!');
        }
      } else {
        const response = await adminAPI.createHotel(hotelData);
        if (response.data.success) {
          alert('Hotel created successfully!');
        }
      }

      fetchHotels();
      closeModal();
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert(error.response?.data?.message || 'Failed to save hotel');
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || '',
      description: hotel.description || '',
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      country: hotel.country || '',
      zipCode: hotel.zipCode || '',
      latitude: hotel.latitude || '',
      longitude: hotel.longitude || '',
      pricePerNight: hotel.pricePerNight || '',
      rating: hotel.rating || '',
      totalRooms: hotel.totalRooms || '',
      availableRooms: hotel.availableRooms || '',
      maxGuests: hotel.maxGuests || '',
      amenities: hotel.amenities || '',
      imageUrl: hotel.imageUrl || '',
      isActive: hotel.isActive !== false,
      isFeatured: hotel.isFeatured || false,
      bedrooms: hotel.bedrooms || 0,
      bathrooms: hotel.bathrooms || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        const response = await adminAPI.deleteHotel(id);
        if (response.data.success) {
          alert('Hotel deleted successfully!');
          fetchHotels();
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert(error.response?.data?.message || 'Failed to delete hotel');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHotel(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: '',
      longitude: '',
      pricePerNight: '',
      rating: '',
      totalRooms: '',
      availableRooms: '',
      maxGuests: '',
      amenities: '',
      imageUrl: '',
      isActive: true,
      isFeatured: false,
    });
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white-900">Hotels Management</h1>
          <p className="text-gray-600 mt-1">Manage all hotel listings</p>
        </div>

      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="hotel-search" className="block mb-2.5 text-sm font-medium text-gray-900 sr-only">
            Search Hotels
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="search"
              id="hotel-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-3 ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder:text-gray-400 transition-all duration-200"
              placeholder="Search hotels by name, city, or country..."
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-white bg-blue-600 hover:bg-blue-700 border border-transparent focus:ring-4 focus:ring-blue-300 shadow-sm font-medium rounded-lg text-xs px-3 py-1.5 focus:outline-none transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
          {searchTerm && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-gray-600"
            >
              Found <span className="font-semibold text-blue-600">{filteredHotels.length}</span> hotel{filteredHotels.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </form>
      </motion.div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Hotel className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hotels Found</h3>
          <p className="text-gray-600">Start by adding your first hotel</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {filteredHotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover-lift flex flex-col w-full max-w-sm"
            >
              {/* Hotel Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 overflow-hidden flex-shrink-0">
                {(() => {
                  // Get the first image from allPhotoUrls or use imageUrl as fallback
                  let imageUrl = hotel.imageUrl;
                  if (hotel.allPhotoUrls) {
                    try {
                      const urls = hotel.allPhotoUrls.split(',').map(url => url.trim()).filter(url => url);
                      if (urls.length > 0) {
                        imageUrl = urls[0];
                      }
                    } catch (e) {
                      console.error('Error parsing photo URLs:', e);
                    }
                  }

                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null;
                })()}
                <div className="flex items-center justify-center h-full" style={{ display: hotel.allPhotoUrls || hotel.imageUrl ? 'none' : 'flex' }}>
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
                {hotel.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}
                {!hotel.isActive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Inactive
                  </div>
                )}
              </div>

              {/* Hotel Info */}
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1" title={hotel.name}>{hotel.name}</h3>

              <div className="mb-4 flex-grow">
                <div className="flex items-start text-white text-sm">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 break-words">{hotel.city}, {hotel.state ? hotel.state + ', ' : ''}{hotel.country}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                >
                  <Edit className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingHotel ? 'Edit Hotel' : 'Hotel Details'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Enter hotel name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="input-field"
                    placeholder="Enter hotel description"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Zip code"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="any"
                      className="input-field"
                      placeholder="0.000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="any"
                      className="input-field"
                      placeholder="0.000000"
                    />
                  </div>
                </div>



                {/* Rating & Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>

                {/* Amenities */}


                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2 accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-300">Active</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelsManagementPage;
