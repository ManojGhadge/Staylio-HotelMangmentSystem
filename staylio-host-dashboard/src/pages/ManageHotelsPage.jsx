import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hotelAPI } from '../services/api';
import {
  Building2,
  Edit,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';

const ManageHotelsPage = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.id) {
      fetchOwnedHotels();
    }
  }, [user]);

  const fetchOwnedHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getHotelsByOwnerId(user.id);
      setHotels(response.data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      showMessage('error', 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setShowEditModal(true);
  };

  const handleSave = async (hotelData) => {
    try {
      setLoading(true);
      await hotelAPI.updateHotel(editingHotel.id, hotelData);
      showMessage('success', 'Hotel updated successfully!');
      setShowEditModal(false);
      setEditingHotel(null);
      fetchOwnedHotels();
    } catch (error) {
      console.error('Error updating hotel:', error);
      showMessage('error', 'Failed to update hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await hotelAPI.deleteHotel(hotel.id);
      showMessage('success', 'Hotel deleted successfully!');
      fetchOwnedHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      showMessage('error', 'Failed to delete hotel');
    } finally {
      setLoading(false);
    }
  };

  const getHotelImage = (hotel) => {
    if (hotel.imageUrls && hotel.imageUrls.length > 0) {
      return hotel.imageUrls[0];
    }
    if (hotel.allPhotoUrls) {
      const urls = hotel.allPhotoUrls.split(',').map(url => url.trim()).filter(url => url);
      if (urls.length > 0) return urls[0];
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Hotels</h1>
        <p className="text-gray-400">Edit and manage your claimed hotels</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bento-card overflow-hidden group">
            <div className="relative h-48">
              <img
                src={getHotelImage(hotel)}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white truncate">{hotel.name}</h3>
                <p className="text-gray-300 text-sm flex items-center mt-1">
                  <Building2 className="w-4 h-4 mr-1" />
                  {hotel.location || 'No location set'}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{hotel.rating || 'New'}</span>
                </div>
                <span className="text-white font-bold">
                  ₹{hotel.pricePerNight}<span className="text-gray-400 text-sm font-normal">/night</span>
                </span>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex-1 btn-magic py-2 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel)}
                  className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && !loading && (
        <div className="text-center py-12 bento-card">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Hotels Found</h3>
          <p className="text-gray-400">You haven't added any hotels yet.</p>
        </div>
      )}
    </div>
  );
};

export default ManageHotelsPage;