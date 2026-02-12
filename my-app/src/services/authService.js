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
    },

    verifyEmail: async (data) => {
        const response = await api.post('/verify-email', data);
        return response.data;
    },

    resendOtp: async (email) => {
        const response = await api.post('/resend-otp', { email });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await api.post('/reset-password', data);
        return response.data;
    }
};

export default authService;
