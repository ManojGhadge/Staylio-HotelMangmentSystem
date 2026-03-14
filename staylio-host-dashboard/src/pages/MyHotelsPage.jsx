import { useState, useEffect } from 'react';
import { hotelClaimAPI, hotelAPI } from '../services/api';
import { Building2, MapPin, Edit, Trash2, Plus, DollarSign, Users, Star, X, Save, BedDouble } from 'lucide-react';
import RoomsList from '../components/RoomsList';

const MyHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roomsModalOpen, setRoomsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const hostId = JSON.parse(localStorage.getItem('staylio_user') || '{}').id;

  useEffect(() => {
    loadOwnedHotels();
  }, []);

  const loadOwnedHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelClaimAPI.getOwnedHotels(hostId);
      if (response.data.success) {
        setHotels(response.data.data);
      }
    } catch (error) {
      console.error('Error loading owned hotels:', error);
      alert('Failed to load your hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) {
      setEditingHotel(hotel);
      // Extract main image from comma-separated string if available
      let mainImage = '';
      if (hotel.allPhotoUrls) {
        const urls = hotel.allPhotoUrls.split(',');
        if (urls.length > 0) mainImage = urls[0].trim();
      }

      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        city: hotel.city || '',
        state: hotel.state || '',
        country: hotel.country || '',
        zipCode: hotel.zipCode || '',
        latitude: hotel.latitude || 0,
        longitude: hotel.longitude || 0,
        imageUrl: mainImage,
        allPhotoUrls: hotel.allPhotoUrls || '',
        checkInTime: hotel.checkInTime || '',
        checkOutTime: hotel.checkOutTime || '',
        cancellationPolicy: hotel.cancellationPolicy || '',
        houseRules: hotel.houseRules || '',
        isActive: hotel.isActive || false,
        hostId: hotel.hostId,
        hotelOwnerId: hotel.hotelOwnerId
      });
      setEditModalOpen(true);
    }
  };

  const handleManageRooms = (hotel) => {
    setSelectedHotelForRooms(hotel);
    setRoomsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingHotel(null);
    setFormData({});
  };

  const handleCloseRoomsModal = () => {
    setRoomsModalOpen(false);
    setSelectedHotelForRooms(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: 0,
      longitude: 0,
      imageUrl: '',
      allPhotoUrls: '',
      checkInTime: '',
      checkOutTime: '',
      cancellationPolicy: '',
      houseRules: '',
      isActive: true,
      hotelOwnerId: hostId,
      hostId: hostId // Fix: Required for backend
    });
    setEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!hostId) {
      alert("Host ID is missing. Please log in again.");
      return;
    }

    try {
      setSaving(true);

      // Combine main imageUrl with allPhotoUrls if needed
      let finalPhotoUrls = formData.allPhotoUrls || '';
      if (formData.imageUrl) {
        if (finalPhotoUrls) {
          // Check if it's already in there to avoid duplication
          if (!finalPhotoUrls.includes(formData.imageUrl)) {
            finalPhotoUrls = formData.imageUrl + ',' + finalPhotoUrls;
          }
        } else {
          finalPhotoUrls = formData.imageUrl;
        }
      }

      // Prepare the data with proper types
      // IMPORTANT: Exclude 'imageUrl' as it does not exist in backend entity
      const updateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        cancellationPolicy: formData.cancellationPolicy,
        houseRules: formData.houseRules,
        isActive: formData.isActive,

        // Mapped/Defaulted fields
        allPhotoUrls: finalPhotoUrls,
        pricePerNight: 0,
        totalRooms: 1,
        availableRooms: 1,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
        rating: 0,
        reviewCount: 0,
        propertyType: 'Hotel',
        roomTypes: '',
        amenities: '',
        isFeatured: false,

        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        hotelOwnerId: hostId,
        hostId: hostId
      };

      let response;
      if (editingHotel) {
        response = await hotelAPI.updateHotel(editingHotel.id, updateData);
      } else {
        response = await hotelAPI.createHotel(updateData);
      }

      // Backend returns HotelDTO directly, not wrapped in success object
      if (response.data && response.data.id) {
        alert(editingHotel ? 'Hotel updated successfully' : 'Hotel created successfully');
        handleCloseModal();
        loadOwnedHotels(); // Reload the hotels list
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      const errorMessage = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || 'Failed to save hotel';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      const response = await hotelAPI.deleteHotel(hotelId);
      if (response.data.success) {
        alert('Hotel deleted successfully');
        loadOwnedHotels();
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert(error.response?.data?.message || 'Failed to delete hotel');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Hotels</h1>
          <p className="text-gray-400">Manage your claimed and owned hotels</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 btn-magic text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Hotel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
        </div>
      ) : hotels.length === 0 ? (
        <div className="bento-card p-12 text-center border border-white/10">
          <Building2 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Hotels Yet</h3>
          <p className="text-gray-400 mb-4">You don't own any hotels yet. Start by adding or claiming a hotel!</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAdd}
              className="px-6 py-3 btn-magic text-white rounded-lg transition-all"
            >
              Add New Hotel
            </button>
            <button
              onClick={() => window.location.href = '/claim-hotel'}
              className="px-6 py-3 btn-outline-magic text-white rounded-lg transition-all"
            >
              Claim Existing Hotel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bento-card flex flex-col group border border-white/10 hover:border-[#8400ff]/30 transition-all duration-300">
              {/* Hotel Image */}
              <div className="h-48 bg-[#0f172a]/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {(() => {
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
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null;
                })()}
                <div className="flex items-center justify-center h-full w-full absolute inset-0" style={{ display: hotel.allPhotoUrls || hotel.imageUrl ? 'none' : 'flex' }}>
                  <Building2 className="w-16 h-16 text-gray-600" />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-60"></div>
              </div>

              {/* Hotel Info */}
              <div className="p-5 flex flex-col flex-grow relative">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#a855f7] transition-colors" title={hotel.name}>
                  {hotel.name}
                </h3>

                <div className="mb-4 flex-grow">
                  <div className="flex items-start text-gray-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-[#8400ff]" />
                    <span className="line-clamp-2 break-words">
                      {hotel.city}, {hotel.state ? hotel.state + ', ' : ''}{hotel.country}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4 flex gap-2">
                  {hotel.isActive ? (
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-medium rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => handleManageRooms(hotel)}
                    className="w-full py-2 px-3 bg-[#8400ff]/10 text-[#a855f7] hover:bg-[#8400ff]/20 border border-[#8400ff]/30 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <BedDouble className="w-4 h-4" />
                    Manage Rooms
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(hotel.id)}
                      className="flex-1 py-2 px-3 bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="flex-1 py-2 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bento-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#0f172a] z-10">
              <h2 className="text-2xl font-bold text-white">{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-magic"
                      placeholder="Enter hotel name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-magic resize-none"
                      placeholder="Enter hotel description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-magic"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Latitude</label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="0.0"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Longitude</label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="0.0"
                        step="any"
                      />
                    </div>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Hotel Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Main Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="input-magic"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">All Photo URLs (comma-separated)</label>
                    <textarea
                      name="allPhotoUrls"
                      value={formData.allPhotoUrls}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-magic resize-none"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Check-in Time</label>
                      <input
                        type="text"
                        name="checkInTime"
                        value={formData.checkInTime}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="3:00 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Check-out Time</label>
                      <input
                        type="text"
                        name="checkOutTime"
                        value={formData.checkOutTime}
                        onChange={handleInputChange}
                        className="input-magic"
                        placeholder="11:00 AM"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cancellation Policy</label>
                    <textarea
                      name="cancellationPolicy"
                      value={formData.cancellationPolicy}
                      onChange={handleInputChange}
                      rows={2}
                      className="input-magic resize-none"
                      placeholder="Free cancellation up to 24 hours..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">House Rules</label>
                    <textarea
                      name="houseRules"
                      value={formData.houseRules}
                      onChange={handleInputChange}
                      rows={2}
                      className="input-magic resize-none"
                      placeholder="No smoking, No pets..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#8400ff] focus:ring-[#8400ff] border-gray-600 rounded bg-gray-800"
                      />
                      <label className="ml-2 block text-sm text-gray-300">Active</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-6 py-2 btn-magic text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Management Modal */}
      {
        roomsModalOpen && selectedHotelForRooms && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bento-card rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#0f172a] z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Manage Rooms</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedHotelForRooms.name}
                  </p>
                </div>
                <button
                  onClick={handleCloseRoomsModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <RoomsList
                  hotelId={selectedHotelForRooms.id}
                  hostId={hostId}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default MyHotelsPage;
