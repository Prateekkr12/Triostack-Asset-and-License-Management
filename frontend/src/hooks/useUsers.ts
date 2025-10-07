import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { User, UserFilters, UserForm, UserStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const useUsers = (filters: UserFilters = {}) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: userService.getUserStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByRole = (role: string) => {
  return useQuery({
    queryKey: ['users-by-role', role],
    queryFn: () => userService.getUsersByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByDepartment = (department: string) => {
  return useQuery({
    queryKey: ['users-by-department', department],
    queryFn: () => userService.getUsersByDepartment(department),
    enabled: !!department,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserForm) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserForm> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentPassword, newPassword }: { 
      id: string; 
      currentPassword: string; 
      newPassword: string; 
    }) => userService.changePassword(id, currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      userService.resetPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.toggleUserStatus(id),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser._id] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    },
  });
};
