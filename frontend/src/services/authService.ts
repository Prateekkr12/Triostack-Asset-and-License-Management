import api from '@/utils/api';
import { LoginForm, RegisterForm, AuthResponse, User } from '@/types';

export const authService = {
  // Login user
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  // Register user
  register: async (userData: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  // Logout (client-side only)
  logout: () => {
    // Clear tokens from cookies/localStorage
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },
};
