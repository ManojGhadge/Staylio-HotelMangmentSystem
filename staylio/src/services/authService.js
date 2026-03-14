const API_BASE_URL = 'http://localhost:8080/api/auth';

class AuthService {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('staylio_token');
  }

  // Set auth token in localStorage
  setToken(token) {
    localStorage.setItem('staylio_token', token);
  }

  // Remove auth token from localStorage
  removeToken() {
    localStorage.removeItem('staylio_token');
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user session info
      if (data.user) {
        localStorage.setItem('staylio_user', JSON.stringify(data.user));
      }
      
      return data;

    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async logout() {
    try {
      // Clear local storage
      this.removeToken();
      localStorage.removeItem('staylio_user');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const savedUser = localStorage.getItem('staylio_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async checkEmailExists(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/exists/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check email');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const user = localStorage.getItem('staylio_user');
    return !!user;
  }

  // Validate user session
  async validateSession() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return false;
      }

      // Optionally validate with server
      // const response = await fetch(`${API_BASE_URL}/validate`, {
      //   headers: this.getAuthHeaders()
      // });
      // return response.ok;

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Password Reset Methods
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  async verifyOtp(email, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }
}

export default new AuthService();