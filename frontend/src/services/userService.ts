import api from '@/utils/api';
import { 
  User, 
  UserFilters, 
  UserStats, 
  PaginatedResponse, 
  UserForm 
} from '@/types';

export const userService = {
  // Get all users with filters and pagination
  getUsers: async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  // Get single user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  createUser: async (data: UserForm): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  // Update user
  updateUser: async (id: string, data: Partial<UserForm>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  // Delete user (soft delete)
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats');
    return response.data.data;
  },

  // Get users by role
  getUsersByRole: async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/role/${role}`);
    return response.data.data;
  },

  // Get users by department
  getUsersByDepartment: async (department: string): Promise<User[]> => {
    const response = await api.get(`/users/department/${department}`);
    return response.data.data;
  },

  // Change user password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  },

  // Reset user password (admin only)
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, { newPassword });
  },

  // Toggle user active status
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data.data;
  },
};
