import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh state to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          console.log('401 error received, attempting token refresh');
          // Create a new axios instance to avoid interceptor loops
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const { token } = refreshResponse.data.data;
          Cookies.set('token', token, { expires: 7, path: '/' });
          
          // Update the original request headers
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Process queued requests
          processQueue(null, token);
          isRefreshing = false;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          processQueue(refreshError, null);
          isRefreshing = false;
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        isRefreshing = false;
        Cookies.remove('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
