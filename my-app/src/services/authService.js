import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/profile');
        return response.data;
    }
};

export default authService;
