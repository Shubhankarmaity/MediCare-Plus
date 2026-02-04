import api from './api';

const hospitalService = {
    getAll: async () => {
        const response = await api.get('/api/hospitals');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/hospitals/${id}`);
        return response.data;
    }
};

export default hospitalService;
