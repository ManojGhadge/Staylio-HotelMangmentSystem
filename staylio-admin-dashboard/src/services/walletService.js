import axios from 'axios';

const API_URL = 'http://localhost:8080/api/wallet';

const walletService = {
  getAdminWallet: async () => {
    return await axios.get(`${API_URL}/admin`);
  },
  
  getHostWallet: async (hostId) => {
    return await axios.get(`${API_URL}/host/${hostId}`);
  },
  
  getUserWallet: async (userId) => {
    return await axios.get(`${API_URL}/user/${userId}`);
  }
};

export default walletService;
