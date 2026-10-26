import axios from 'axios';

// Base URL configurable through environment variable (VITE_API_BASE_URL)
// Default to standard local Django REST server port
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

API.interceptors.request.use(
  (config) => {
    const publicEndpoints = ['/auth/register', '/auth/login'];
    const isPublic = publicEndpoints.some((ep) => config.url?.includes(ep));
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only wipe token on explicit auth verification endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.includes('/auth/me/') || url.includes('/auth/verify/')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;