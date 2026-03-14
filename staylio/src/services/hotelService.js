import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const hotelApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
hotelApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hotel Service
const hotelService = {
  // Get all hotels
  getAllHotels: async () => {
    const response = await hotelApi.get('/hotels');
    return response.data;
  },

  // Get landing page hotels
  getLandingPageHotels: async () => {
    const response = await hotelApi.get('/hotels/landing');
    return response.data;
  },

  // Get hotel by ID
  getHotelById: async (id) => {
    const response = await hotelApi.get(`/hotels/${id}`);
    return response.data;
  },

  // Get active hotels
  getActiveHotels: async () => {
    const response = await hotelApi.get('/hotels/active');
    return response.data;
  },

  // Get featured hotels
  getFeaturedHotels: async () => {
    const response = await hotelApi.get('/hotels/featured');
    return response.data;
  },

  // Search hotels
  searchHotels: async (keyword) => {
    const response = await hotelApi.get('/hotels/search', {
      params: { keyword },
    });
    return response.data;
  },

  // Get hotels by city
  getHotelsByCity: async (city) => {
    const response = await hotelApi.get(`/hotels/city/${city}`);
    return response.data;
  },

  // Get hotels by state
  getHotelsByState: async (state) => {
    const response = await hotelApi.get(`/hotels/state/${state}`);
    return response.data;
  },

  // Get hotels by country
  getHotelsByCountry: async (country) => {
    const response = await hotelApi.get(`/hotels/country/${country}`);
    return response.data;
  },

  // Get hotels by price range
  getHotelsByPriceRange: async (minPrice, maxPrice) => {
    const response = await hotelApi.get('/hotels/price-range', {
      params: { minPrice, maxPrice },
    });
    return response.data;
  },

  // Get hotels by minimum rating
  getHotelsByRating: async (minRating) => {
    const response = await hotelApi.get(`/hotels/rating/${minRating}`);
    return response.data;
  },

  // Get hotels by guest capacity
  getHotelsByGuestCapacity: async (guests) => {
    const response = await hotelApi.get(`/hotels/capacity/${guests}`);
    return response.data;
  },

  // Get hotels with available rooms
  getAvailableHotels: async () => {
    const response = await hotelApi.get('/hotels/available');
    return response.data;
  },

  // Get hotel images by ID
  getHotelImages: async (hotelId) => {
    const response = await hotelApi.get(`/hotel_img/${hotelId}`);
    return response.data;
  },

  // Get nearby hotels
  getNearbyHotels: async (latitude, longitude, radius = 10) => {
    const response = await hotelApi.get('/hotels/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // Create hotel (admin/host only)
  createHotel: async (hotelData) => {
    const response = await hotelApi.post('/hotels', hotelData);
    return response.data;
  },

  // Update hotel (admin/host only)
  updateHotel: async (id, hotelData) => {
    const response = await hotelApi.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // Delete hotel (admin/host only)
  deleteHotel: async (id) => {
    const response = await hotelApi.delete(`/hotels/${id}`);
    return response.data;
  },

  // Check if hotel is claimed
  checkHotelClaimStatus: async (hotelId) => {
    const response = await hotelApi.get(`/hotels/${hotelId}/claim-status`);
    return response.data;
  },

  // Get hotel reviews
  getHotelReviews: async (hotelId) => {
    const response = await hotelApi.get(`/reviews/hotel/${hotelId}`);
    return response.data;
  },

  // Add hotel review
  addHotelReview: async (reviewData) => {
    // Uses new validation endpoint
    const response = await hotelApi.post(`/hotels/${reviewData.hotelId}/reviews`, reviewData);
    return response.data;
  },

  // Check review eligibility
  checkReviewEligibility: async (hotelId, userId) => {
    const response = await hotelApi.get(`/hotels/${hotelId}/review-eligibility`, {
      params: { userId }
    });
    return response.data;
  },

  // Get hotel rooms
  getHotelRooms: async (hotelId) => {
    const response = await hotelApi.get(`/hotels/${hotelId}/hotel-rooms/available`);
    return response.data;
  },
};

export default hotelService;
