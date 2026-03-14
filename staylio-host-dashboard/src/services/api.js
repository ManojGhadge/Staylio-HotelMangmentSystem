import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const user = JSON.parse(localStorage.getItem('staylio_user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('staylio_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Host API (Admin endpoints)
export const hostAPI = {
  // Get all hosts (admin)
  getAllHosts: () => api.get('/admin/hosts'),

  // Get pending hosts (admin)
  getPendingHosts: () => api.get('/admin/hosts/pending'),

  // Get host by ID (admin)
  getHostById: (id) => api.get(`/admin/hosts/${id}`),

  // Approve host (admin)
  approveHost: (id) => api.put(`/admin/hosts/${id}/approve`),

  // Reject host (admin)
  rejectHost: (id, reason) => api.put(`/admin/hosts/${id}/reject`, { reason }),

  // Create new host (admin)
  createHost: (hostData) => api.post('/hosts', hostData),

  // Update host (admin)
  updateHost: (id, hostData) => api.put(`/hosts/${id}`, hostData),

  // Delete host (admin)
  deleteHost: (id) => api.delete(`/hosts/${id}`),

  // Host profile endpoints
  getHostProfile: (id) => api.get(`/host/profile/${id}`),
  updateHostProfile: (id, hostData) => api.put(`/host/profile/${id}`, hostData),
};

// Admin API
export const adminAPI = {
  // Get all admins
  getAllAdmins: () => api.get('/admins'),

  // Get admin by ID
  getAdminById: (id) => api.get(`/admins/${id}`),

  // Create new admin
  createAdmin: (adminData) => api.post('/admins', adminData),

  // Update admin
  updateAdmin: (id, adminData) => api.put(`/admins/${id}`, adminData),

  // Delete admin
  deleteAdmin: (id) => api.delete(`/admins/${id}`),

  // Check email exists
  checkEmailExists: (email) => api.get(`/admins/exists/email/${email}`),
};

// Hotel API
export const hotelAPI = {
  // Get all hotels (admin only)
  getAllHotels: () => api.get('/hotels'),

  // Get hotels by hostname (host-specific)
  getHotelsByHostname: (hostname) => api.get(`/hotels/host/${hostname}`),

  // Get hotels by host ID
  getHotelsByHostId: (hostId) => api.get(`/hotels/host/${hostId}`),

  // Get hotels by owner ID (hotel_owner_id) - for claimed hotels
  getHotelsByOwnerId: (ownerId) => api.get(`/hotels/owner/${ownerId}`),

  // Get hotel by ID
  getHotelById: (id) => api.get(`/hotels/${id}`),

  // Create new hotel
  createHotel: (hotelData) => api.post('/hotels', hotelData),

  // Update hotel
  updateHotel: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),

  // Delete hotel
  deleteHotel: (id) => api.delete(`/hotels/${id}`),

  // Check if hotel is owned by host
  isHotelOwnedByHost: (hotelId, hostname) => api.get(`/hotels/${hotelId}/owner/${hostname}`),

  // Get hotel count by hostname
  getHotelCountByHostname: (hostname) => api.get(`/hotels/count/host/${hostname}`),

  // Test endpoints
  testHotelAPI: () => api.get('/hotels/test'),
  testCRUDOperations: (testData) => api.post('/hotels/debug/test-crud', testData),
};

// User API
export const userAPI = {
  // Get all users
  getAllUsers: () => api.get('/users'),

  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),

  // Create new user
  createUser: (userData) => api.post('/users', userData),

  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Hotel Claim API
export const hotelClaimAPI = {
  // Search hotels available for claiming
  searchHotelsForClaiming: (keyword) => api.get(`/hotel-claims/search-hotels?keyword=${keyword}`),

  // Get all unclaimed hotels
  getUnclaimedHotels: () => api.get('/hotel-claims/unclaimed-hotels'),

  // Submit a hotel claim
  submitClaim: (claimData) => api.post('/hotel-claims/submit', claimData),

  // Get claims by host
  getClaimsByHost: (hostId) => api.get(`/hotel-claims/host/${hostId}`),

  // Get all claims (Admin)
  getAllClaims: () => api.get('/hotel-claims/all'),

  // Get pending claims (Admin)
  getPendingClaims: () => api.get('/hotel-claims/pending'),

  // Approve claim (Admin)
  approveClaim: (claimId) => api.put(`/hotel-claims/${claimId}/approve`),

  // Reject claim (Admin)
  rejectClaim: (claimId, rejectionMessage) => api.put(`/hotel-claims/${claimId}/reject`, { rejectionMessage }),

  // Get hotels owned by host
  getOwnedHotels: (hostId) => api.get(`/hotel-claims/owned-hotels/${hostId}`),
};

// Booking API
export const bookingAPI = {
  // Get all bookings
  getAllBookings: () => api.get('/bookings'),

  // Get booking by ID
  getBookingById: (id) => api.get(`/bookings/${id}`),

  // Get bookings by user ID
  getBookingsByUserId: (userId) => api.get(`/bookings/user/${userId}`),

  // Get bookings by hotel ID
  getBookingsByHotelId: (hotelId) => api.get(`/bookings/hotel/${hotelId}`),

  // Get bookings for hotels claimed by a specific host
  getBookingsByHostClaimedHotels: (hostId) => api.get(`/bookings/host/${hostId}`),

  // Create new booking
  createBooking: (bookingData) => api.post('/bookings', bookingData),

  // Update booking status
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status?status=${status}`),

  // Update payment status
  updatePaymentStatus: (id, paymentData) => api.post(`/bookings/${id}/payment`, paymentData),

  // Cancel booking
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),

  // Confirm booking
  confirmBooking: (id) => api.patch(`/bookings/${id}/confirm`),

  // Delete booking
  deleteBooking: (id) => api.delete(`/bookings/${id}`),

  // Get booking statistics
  getBookingStats: () => api.get('/bookings/stats'),
};

// Room API
export const roomAPI = {
  // Get all rooms for a hotel
  getRoomsByHotelId: (hotelId) => api.get(`/hotels/${hotelId}/hotel-rooms`),

  // Get room by ID
  getRoomById: (hotelId, roomId) => api.get(`/hotels/${hotelId}/hotel-rooms/${roomId}`),

  // Create new room
  createRoom: (hotelId, roomData, hostId) => api.post(`/hotels/${hotelId}/hotel-rooms?hostId=${hostId}`, roomData),

  // Update room
  updateRoom: (hotelId, roomId, roomData, hostId) => api.put(`/hotels/${hotelId}/hotel-rooms/${roomId}?hostId=${hostId}`, roomData),

  // Delete room
  deleteRoom: (hotelId, roomId, hostId) => api.delete(`/hotels/${hotelId}/hotel-rooms/${roomId}?hostId=${hostId}`),
};

export default api;