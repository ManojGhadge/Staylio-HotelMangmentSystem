import axios from 'axios';

const API_URL = 'http://localhost:8080/api/wallet';

const walletService = {
    getHostWallet: async (hostId) => {
        return axios.get(`${API_URL}/host/${hostId}`);
    }
};

export default walletService;
