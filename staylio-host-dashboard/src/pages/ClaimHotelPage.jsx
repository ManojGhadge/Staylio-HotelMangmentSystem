import { useState, useEffect } from 'react';
import { hotelClaimAPI } from '../services/api';
import { Search, Building2, MapPin, X } from 'lucide-react';

const ClaimHotelPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    claimReason: '',
    associationDetails: '',
    contactDetails: '',
    documentUrls: '',
    governmentIdUrl: '',
    additionalProof: '',
  });

  const hostId = JSON.parse(localStorage.getItem('staylio_user') || '{}').id;

  useEffect(() => {
    loadUnclaimedHotels();
  }, []);

  const loadUnclaimedHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelClaimAPI.getUnclaimedHotels();
      console.log('Unclaimed hotels response:', response.data);
      if (response.data.success) {
        const hotelData = response.data.data || [];
        console.log('Found unclaimed hotels:', hotelData.length);
        setHotels(hotelData);
      } else {
        console.log('No success in response');
        setHotels([]);
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
      console.error('Error details:', error.response?.data);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadUnclaimedHotels();
      return;
    }

    try {
      setLoading(true);
      const response = await hotelClaimAPI.searchHotelsForClaiming(searchTerm);
      if (response.data.success) {
        setHotels(response.data.data || []);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('Error searching hotels:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setShowClaimForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.claimReason.trim()) {
      alert('Please provide a reason for claiming this hotel');
      return;
    }
    if (!formData.associationDetails.trim()) {
      alert('Please explain your association with this hotel');
      return;
    }
    if (!formData.contactDetails.trim()) {
      alert('Please provide contact details');
      return;
    }

    try {
      const claimData = {
        hostId: hostId,
        hotelId: selectedHotel.id,
        ...formData,
      };

      const response = await hotelClaimAPI.submitClaim(claimData);
      if (response.data.success) {
        alert('Hotel claim submitted successfully! Please wait for admin approval.');
        setShowClaimForm(false);
        setSelectedHotel(null);
        setFormData({
          businessName: '',
          claimReason: '',
          associationDetails: '',
          contactDetails: '',
          documentUrls: '',
          governmentIdUrl: '',
          additionalProof: '',
        });
        loadUnclaimedHotels();
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert(error.response?.data?.message || 'Failed to submit claim');
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.id?.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Claim a Hotel</h1>
        <p className="text-gray-400">
          Search and claim ownership of hotels in our system
          {!loading && hotels.length > 0 && (
            <span className="ml-2 text-[#a855f7] font-semibold">
              ({hotels.length} hotel{hotels.length !== 1 ? 's' : ''} available)
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bento-card p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by hotel name, city, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-magic w-full pl-10 pr-4 py-2 rounded-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 btn-magic text-white rounded-lg hover:shadow-lg transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bento-card p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Unclaimed Hotels Available</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm
              ? 'Try searching with different keywords or clear your search to see all available hotels.'
              : 'All hotels in the system currently have owners. Check back later or contact admin to add new hotels.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                loadUnclaimedHotels();
              }}
              className="px-6 py-2 btn-magic text-white rounded-lg transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bento-card overflow-hidden hover:shadow-xl transition-shadow flex flex-col group">
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
              <div className="p-5 flex flex-col flex-grow relative">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#a855f7] transition-colors" title={hotel.name}>
                  {hotel.name}
                </h3>
                <div className="flex items-start text-gray-400 text-sm mb-4 flex-grow">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-[#8400ff]" />
                  <span className="line-clamp-2 break-words">
                    {hotel.city}, {hotel.state ? hotel.state + ', ' : ''}{hotel.country}
                  </span>
                </div>
                <button
                  onClick={() => handleSelectHotel(hotel)}
                  className="w-full btn-magic text-white py-2 rounded-lg hover:shadow-lg transition-all mt-auto"
                >
                  Claim This Hotel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimForm && selectedHotel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bento-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Claim Hotel: {selectedHotel.name}</h2>
              <button onClick={() => setShowClaimForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Claim *
                </label>
                <textarea
                  name="claimReason"
                  value={formData.claimReason}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="Why are you claiming this hotel?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Association Details *
                </label>
                <textarea
                  name="associationDetails"
                  value={formData.associationDetails}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="How are you associated with this hotel?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Details *
                </label>
                <input
                  type="text"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleInputChange}
                  required
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="Phone, email, or other contact information"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Supporting Document URLs
                </label>
                <textarea
                  name="documentUrls"
                  value={formData.documentUrls}
                  onChange={handleInputChange}
                  rows="2"
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="URLs to supporting documents (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Government ID / License URL
                </label>
                <input
                  type="text"
                  name="governmentIdUrl"
                  value={formData.governmentIdUrl}
                  onChange={handleInputChange}
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="URL to government ID or business license"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Proof
                </label>
                <textarea
                  name="additionalProof"
                  value={formData.additionalProof}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-magic w-full px-4 py-2 rounded-lg"
                  placeholder="Any additional information or proof"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-magic text-white py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Submit Claim
                </button>
                <button
                  type="button"
                  onClick={() => setShowClaimForm(false)}
                  className="flex-1 bg-white/5 text-gray-300 py-3 rounded-lg hover:bg-white/10 border border-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimHotelPage;
