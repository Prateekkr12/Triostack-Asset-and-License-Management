import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationService } from '@/services/allocationService';
import { Allocation, AllocationFilters, AllocationForm, AllocationStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const useAllocations = (filters: AllocationFilters = {}) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['allocations', filters],
    queryFn: () => allocationService.getAllocations(filters),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllocation = (id: string) => {
  return useQuery({
    queryKey: ['allocation', id],
    queryFn: () => allocationService.getAllocation(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllocationStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['allocation-stats'],
    queryFn: allocationService.getAllocationStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserActiveAllocations = (userId: string) => {
  return useQuery({
    queryKey: ['user-active-allocations', userId],
    queryFn: () => allocationService.getUserActiveAllocations(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetActiveAllocation = (assetId: string) => {
  return useQuery({
    queryKey: ['asset-active-allocation', assetId],
    queryFn: () => allocationService.getAssetActiveAllocation(assetId),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserAllocationHistory = (userId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['user-allocation-history', userId, page, limit],
    queryFn: () => allocationService.getUserAllocationHistory(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetAllocationHistory = (assetId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['asset-allocation-history', assetId, page, limit],
    queryFn: () => allocationService.getAssetAllocationHistory(assetId, page, limit),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllocationForm) => allocationService.createAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Allocation created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create allocation';
      toast.error(message);
    },
  });
};

export const useUpdateAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AllocationForm> }) =>
      allocationService.updateAllocation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocation', id] });
      queryClient.invalidateQueries({ queryKey: ['allocation-stats'] });
      toast.success('Allocation updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update allocation';
      toast.error(message);
    },
  });
};

export const useDeleteAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationService.deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Allocation deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete allocation';
      toast.error(message);
    },
  });
};

export const useReturnAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allocationId: string) => allocationService.returnAsset(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      queryClient.invalidateQueries({ queryKey: ['allocation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Asset returned successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to return asset';
      toast.error(message);
    },
  });
};
