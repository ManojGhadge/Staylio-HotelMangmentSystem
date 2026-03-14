import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const recommendationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
recommendationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const recommendationService = {
  // Get personalized recommendations for user
  getPersonalizedRecommendations: async (userId, city = null, limit = 6) => {
    const requestBody = {
      userId: userId,
      limit: limit
    };
    
    if (city) {
      requestBody.city = city;
    }

    const response = await recommendationApi.post('/hotels/recommendations', requestBody);
    return response.data;
  },

  // Get recommendations with city filter
  getRecommendationsForCity: async (userId, city, limit = 6) => {
    return await recommendationService.getPersonalizedRecommendations(userId, city, limit);
  }
};

export default recommendationService;