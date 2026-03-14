import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API
export const adminAPI = {
  // Authentication
  login: (email, password) => api.post('/admin/login', { email, password }),
  
  // Host Management
  getAllHosts: () => api.get('/admin/hosts'),
  getPendingHosts: () => api.get('/admin/hosts/pending'),
  getHostById: (id) => api.get(`/admin/hosts/${id}`),
  approveHost: (id) => api.put(`/admin/hosts/${id}/approve`),
  rejectHost: (id, reason) => api.put(`/admin/hosts/${id}/reject`, { reason }),
  updateHost: (id, hostData) => api.put(`/admin/hosts/${id}`, hostData),
  deleteHost: (id) => api.delete(`/admin/hosts/${id}`),
  
  // Hotel Management
  getAllHotels: () => api.get('/admin/hotels'),
  getHotelById: (id) => api.get(`/admin/hotels/${id}`),
  createHotel: (hotelData) => api.post('/admin/hotels', hotelData),
  updateHotel: (id, hotelData) => api.put(`/admin/hotels/${id}`, hotelData),
  deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),
  
  // User Management
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Hotel API
export const hotelAPI = {
  getAllHotels: () => api.get('/hotels'),
  getHotelById: (id) => api.get(`/hotels/${id}`),
  createHotel: (hotelData) => api.post('/hotels', hotelData),
  updateHotel: (id, hotelData) => api.put(`/hotels/${id}`, hotelData),
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
  searchHotels: (keyword) => api.get(`/hotels/search?keyword=${keyword}`),
  getHotelsByHost: (hostId) => api.get(`/hotels/host/${hostId}`),
  getActiveHotels: () => api.get('/hotels/active'),
  getFeaturedHotels: () => api.get('/hotels/featured'),
};

// Host API (for general operations)
export const hostAPI = {
  getAllHosts: () => api.get('/hosts'),
  getHostById: (id) => api.get(`/hosts/${id}`),
  createHost: (hostData) => api.post('/hosts', hostData),
  updateHost: (id, hostData) => api.put(`/hosts/${id}`, hostData),
  deleteHost: (id) => api.delete(`/hosts/${id}`),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Booking API
export const bookingAPI = {
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getBookingsByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getBookingsByHotel: (hotelId) => api.get(`/bookings/hotel/${hotelId}`),
};

// Hotel Claim API
export const hotelClaimAPI = {
  getAllClaims: () => api.get('/hotel-claims/all'),
  getPendingClaims: () => api.get('/hotel-claims/pending'),
  getClaimsByHost: (hostId) => api.get(`/hotel-claims/host/${hostId}`),
  approveClaim: (claimId) => api.put(`/hotel-claims/${claimId}/approve`),
  rejectClaim: (claimId, rejectionMessage) => api.put(`/hotel-claims/${claimId}/reject`, { rejectionMessage }),
};

export default api;
