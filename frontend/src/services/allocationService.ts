import api from '@/utils/api';
import { 
  Allocation, 
  AllocationFilters, 
  AllocationStats, 
  PaginatedResponse, 
  AllocationForm 
} from '@/types';

export const allocationService = {
  // Get all allocations with filters and pagination
  getAllocations: async (filters: AllocationFilters = {}): Promise<PaginatedResponse<Allocation>> => {
    const response = await api.get('/allocations', { params: filters });
    return response.data;
  },

  // Get single allocation by ID
  getAllocation: async (id: string): Promise<Allocation> => {
    const response = await api.get(`/allocations/${id}`);
    return response.data.data;
  },

  // Create new allocation
  createAllocation: async (data: AllocationForm): Promise<Allocation> => {
    const response = await api.post('/allocations', data);
    return response.data.data;
  },

  // Update allocation
  updateAllocation: async (id: string, data: Partial<AllocationForm>): Promise<Allocation> => {
    const response = await api.put(`/allocations/${id}`, data);
    return response.data.data;
  },

  // Delete allocation
  deleteAllocation: async (id: string): Promise<void> => {
    await api.delete(`/allocations/${id}`);
  },

  // Return asset (end allocation)
  returnAsset: async (id: string): Promise<Allocation> => {
    const response = await api.post(`/allocations/${id}/return`);
    return response.data.data;
  },

  // Get allocation statistics
  getAllocationStats: async (): Promise<AllocationStats> => {
    const response = await api.get('/allocations/stats');
    return response.data.data;
  },

  // Get active allocations for a user
  getUserActiveAllocations: async (userId: string): Promise<Allocation[]> => {
    const response = await api.get(`/allocations/user/${userId}/active`);
    return response.data.data;
  },

  // Get active allocation for an asset
  getAssetActiveAllocation: async (assetId: string): Promise<Allocation | null> => {
    try {
      const response = await api.get(`/allocations/asset/${assetId}/active`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get allocation history for a user
  getUserAllocationHistory: async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Allocation>> => {
    const response = await api.get(`/allocations/user/${userId}/history`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get allocation history for an asset
  getAssetAllocationHistory: async (assetId: string, page = 1, limit = 10): Promise<PaginatedResponse<Allocation>> => {
    const response = await api.get(`/allocations/asset/${assetId}/history`, {
      params: { page, limit },
    });
    return response.data;
  },
};
