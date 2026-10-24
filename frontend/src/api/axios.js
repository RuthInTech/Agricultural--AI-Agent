import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const publicEndpoints = ['/auth/register/', '/auth/login/'];

    const isPublicRoute = publicEndpoints.includes(config.url);
    const token = localStorage.getItem('access_token');
    
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }else{
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;