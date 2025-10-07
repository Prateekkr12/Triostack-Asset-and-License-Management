import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { Asset, AssetFilters, AssetForm, AssetStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const useAssets = (filters: AssetFilters = {}) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetService.getAssets(filters),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getAsset(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['asset-stats'],
    queryFn: assetService.getAssetStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpiringAssets = (days: number = 30) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['expiring-assets', days],
    queryFn: () => assetService.getExpiringAssets(days),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExpiredAssets = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['expired-assets'],
    queryFn: () => assetService.getExpiredAssets(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAvailableAssets = () => {
  return useQuery({
    queryKey: ['available-assets'],
    queryFn: assetService.getAvailableAssets,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetsByType = (type: string) => {
  return useQuery({
    queryKey: ['assets-by-type', type],
    queryFn: () => assetService.getAssetsByType(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssetForm) => assetService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Asset created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create asset';
      toast.error(message);
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetForm> }) =>
      assetService.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Asset updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update asset';
      toast.error(message);
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      toast.success('Asset deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete asset';
      toast.error(message);
    },
  });
};

export const useAssignAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, userId }: { assetId: string; userId: string }) =>
      assetService.assignAsset(assetId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Asset assigned successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to assign asset';
      toast.error(message);
    },
  });
};

export const useUnassignAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => assetService.unassignAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Asset unassigned successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unassign asset';
      toast.error(message);
    },
  });
};
