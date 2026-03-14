import axios from 'axios';

const API_URL = 'http://localhost:8080/api/bookings';

const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await axios.post(API_URL, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update payment status after successful payment
  updatePaymentStatus: async (bookingId, paymentId) => {
    try {
      const response = await axios.post(`${API_URL}/${bookingId}/payment`, {
        razorpayPaymentId: paymentId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await axios.get(`${API_URL}/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Get bookings by user ID
  getUserBookings: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Get booking by reference
  getBookingByReference: async (reference) => {
    try {
      const response = await axios.get(`${API_URL}/reference/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking by reference:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.patch(`${API_URL}/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

export default bookingService;
