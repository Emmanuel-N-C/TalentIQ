import axios from 'axios';

// Use environment variable for API base URL
// Falls back to localhost if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if:
    // 1. User was authenticated (had a token)
    // 2. Not already on auth pages (login/register)
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || 
                        currentPath === '/register' || 
                        currentPath === '/verify-otp' ||
                        currentPath === '/forgot-password' ||
                        currentPath.startsWith('/reset-password') ||
                        currentPath.startsWith('/auth/callback');
      
      // Only redirect if user had a valid token and it expired
      // Don't redirect if on auth pages or during login/registration
      if (hadToken && !isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;