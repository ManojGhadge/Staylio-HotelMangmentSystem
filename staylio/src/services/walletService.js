import axios from 'axios';

const API_URL = 'http://localhost:8080/api/wallet';

const walletService = {
  getUserWallet: async (userId) => {
    return axios.get(`${API_URL}/user/${userId}`);
  }
};

export default walletService;
