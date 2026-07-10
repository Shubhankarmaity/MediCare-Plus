import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cross-origin cookies
});

// ── Request Interceptor: attach token from localStorage ───────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: handle auth errors globally ────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Token expired or invalid — clear local state and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on an auth page
            const authPages = ['/login', '/signup', '/forgot-password'];
            if (!authPages.includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            // Forbidden — user doesn't have the required role
            console.warn('Access forbidden:', error.response?.data?.message);
        } else if (status === 429) {
            // Rate limited
            console.warn('Rate limited. Please slow down your requests.');
        }

        return Promise.reject(error);
    }
);

export default api;
