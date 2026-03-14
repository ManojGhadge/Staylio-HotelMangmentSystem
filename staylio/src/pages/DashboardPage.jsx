import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Particles from '../components/Particles';
import ChatbotIcon from '../components/chatbot/ChatbotIcon';
import ChatbotWindow from '../components/chatbot/ChatbotWindow';
import RecommendedHotels from '../components/RecommendedHotels';
import CitySelector from '../components/CitySelector';
import bookingService from '../services/bookingService';
import hotelService from '../services/hotelService';
import { generateReceipt } from '../utils/receiptGenerator';
import axios from 'axios';

const DashboardPage = () => {
  const { user, logout, updateUser } = useAuth(); // Assuming updateUser exists in context
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleDownloadReceipt = async (bookingId, e) => {
    try {
      setDownloadingReceiptId(bookingId);
      // Fetch full booking details to ensure we have all fields (payment ID, etc)
      const fullBooking = await bookingService.getBookingById(bookingId);
      // Fetch hotel details for address, etc
      const hotel = await hotelService.getHotelById(fullBooking.hotelId);

      generateReceipt(fullBooking, hotel);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Could not generate receipt at this time. Please try again.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // Data States
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || ''
      });
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const data = await bookingService.getUserBookings(user.id);

      const bookingsWithDetails = await Promise.all(
        data.map(async (booking) => {
          try {
            const hotelResponse = await axios.get(`http://localhost:8080/api/hotels/${booking.hotelId}`);
            const hotel = hotelResponse.data;
            const finalName = hotel.name;

            // Fix zero price for display if needed (fallback to hotel price calculation)
            let displayAmount = booking.totalAmount;
            if (!displayAmount || displayAmount === 0) {
              const nights = booking.totalNights || 1;
              const price = booking.pricePerNight && booking.pricePerNight > 0 ? booking.pricePerNight : hotel.pricePerNight;
              let calculated = price * nights * (booking.rooms || 1);
              // Add 10% tax estimate
              displayAmount = Math.round(calculated + (calculated * 0.1));
            }

            return {
              ...booking,
              hotelName: finalName,
              totalAmount: displayAmount
            };
          } catch (e) {
            console.error(`Failed to fetch hotel for booking ${booking.id}`, e);
            return { ...booking, hotelName: `Hotel #${booking.hotelId}` };
          }
        })
      );

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      // API call to update user
      const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        email: user.email, // Keep email same
        password: user.password // Ideally assume backend handles keeping old password if null
      });

      // Update local storage/context if needed
      if (updateUser) updateUser(response.data);

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Update failed', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060010] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <button onClick={() => navigate('/login')} className="bg-[#8400ff] px-6 py-2 rounded-xl text-white font-bold hover:bg-[#7000d6] transition-colors">Go to Login</button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-6 border-l-4 border-l-[#8400ff]">
          <h3 className="text-gray-400 text-sm font-medium">Total Bookings</h3>
          <p className="text-3xl font-bold text-white mt-2">{bookings.length}</p>
        </div>
        <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-6 border-l-4 border-l-green-500">
          <h3 className="text-gray-400 text-sm font-medium">Active Bookings</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {bookings.filter(b => b.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-6 border-l-4 border-l-pink-500">
          <h3 className="text-gray-400 text-sm font-medium">Total Spent</h3>
          <p className="text-3xl font-bold text-white mt-2">
            ₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-400">No recent activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="pb-3 font-medium">Hotel</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {bookings.slice(0, 3).map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4">{booking.hotelName || `Hotel #${booking.hotelId}`}</td>
                    <td className="py-4">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">₹{booking.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setActiveTab('bookings')}
              className="mt-4 text-[#a855f7] hover:text-white text-sm font-medium transition-colors"
            >
              View all bookings →
            </button>
          </div>
        )}
      </div>

      {/* Personalized Recommendations */}
      <div className="space-y-4">
        <CitySelector 
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />
        <RecommendedHotels 
          userId={user?.id}
          selectedCity={selectedCity}
        />
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">My Booking History</h2>
      {bookings.length === 0 ? (
        <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-bold">No bookings found</h3>
          <p className="text-gray-400 mt-2">You haven't made any reservations yet.</p>
          <button onClick={() => navigate('/hotels')} className="mt-6 bg-[#8400ff] px-6 py-3 rounded-xl text-white font-bold hover:bg-[#7000d6] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20">
            Explore Hotels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 hover:border-[#a855f7]/50 transition-all">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{booking.hotelName || `Hotel #${booking.hotelId}`}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Ref: {booking.bookingReference || booking.id}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Check-In</p>
                    <p className="text-white font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-Out</p>
                    <p className="text-white font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests</p>
                    <p className="text-white font-medium">{booking.guests} Guests, {booking.rooms} Rooms</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Paid</p>
                    <p className="text-[#a855f7] font-bold">₹{booking.totalAmount}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                <button
                  onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  View Property
                </button>
                {booking.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={(e) => handleDownloadReceipt(booking.id, e)}
                      disabled={downloadingReceiptId === booking.id}
                      className="px-4 py-2 rounded-xl bg-[#0f172a] border border-[#8400ff]/30 text-gray-300 hover:text-white hover:bg-[#a855f7]/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {downloadingReceiptId === booking.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Prep...</span>
                        </>
                      ) : (
                        'Receipt'
                      )}
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                          try {
                            await bookingService.cancelBooking(booking.id);
                            alert('Booking cancelled successfully. Your refund will be processed within 24 hours.');
                            fetchBookings(); // Refresh list
                          } catch (e) { alert('Cancel failed'); }
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium border border-red-500/30"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Personalized Recommendations</h2>
      
      <CitySelector 
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        className="mb-6"
      />
      
      <RecommendedHotels 
        userId={user?.id}
        selectedCity={selectedCity}
      />
      
      <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">How Recommendations Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#8400ff]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-[#8400ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Collaborative Filtering</h4>
              <p>Based on reviews from users with similar preferences</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#8400ff]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-[#8400ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Content-Based Filtering</h4>
              <p>Matches your preferences for price, amenities, and hotel type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
      <div className="bg-[#0f172a]/60 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl border border-white/10 p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8400ff] to-[#a855f7] rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl">
            {profileData.firstName?.[0]}{profileData.lastName?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{profileData.firstName} {profileData.lastName}</h3>
            <p className="text-gray-400">Personal Information</p>
          </div>
        </div>

        {profileMessage.text && (
          <div className={`p-4 mb-6 rounded-xl border ${profileMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full bg-[#060010] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8400ff] focus:ring-1 focus:ring-[#8400ff] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full bg-[#060010] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8400ff] focus:ring-1 focus:ring-[#8400ff] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              title="Email cannot be changed"
              className="w-full bg-[#060010]/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed border-dashed"
            />
            <p className="text-xs text-gray-500 mt-1">Contact support to change your email address.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full bg-[#060010] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8400ff] focus:ring-1 focus:ring-[#8400ff] transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-[#8400ff] w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold hover:bg-[#7000d6] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060010] relative text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={['#8400ff', '#a855f7']}
          particleCount={100}
          particleSpread={15}
          speed={0.1}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sidebar / Topbar for Mobile */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gradient-to-br from-[#8400ff] to-[#a855f7] rounded-lg"></div>
                <span className="font-bold text-xl tracking-tight">Staylio</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm text-gray-400">Hello, {user.firstName}</span>
                <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-2 sticky top-24 shadow-xl">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-[#8400ff] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'recommendations' ? 'bg-[#8400ff] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  Recommended for You
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'bookings' ? 'bg-[#8400ff] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-[#8400ff] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/kdduutaw.json"
                    trigger="hover"
                    colors={`primary:${activeTab === 'profile' ? '#ffffff' : '#9ca3af'},secondary:${activeTab === 'profile' ? '#ffffff' : '#9ca3af'}`}
                    style={{ width: '24px', height: '24px' }}
                  ></lord-icon>
                  Profile Settings
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'recommendations' && renderRecommendations()}
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'profile' && renderProfile()}
            </div>

          </div>
        </div>
      </div>

      <ChatbotIcon onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />
      <ChatbotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default DashboardPage;
