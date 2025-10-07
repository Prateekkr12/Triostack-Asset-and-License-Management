import api from '@/utils/api';
import { 
  Asset, 
  AssetFilters, 
  AssetStats, 
  PaginatedResponse, 
  AssetForm 
} from '@/types';

export const assetService = {
  // Get all assets with filters and pagination
  getAssets: async (filters: AssetFilters = {}): Promise<PaginatedResponse<Asset>> => {
    const response = await api.get('/assets', { params: filters });
    return response.data;
  },

  // Get single asset by ID
  getAsset: async (id: string): Promise<Asset> => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  // Create new asset
  createAsset: async (data: AssetForm): Promise<Asset> => {
    console.log('Creating asset with data:', data);
    console.log('API URL:', api.defaults.baseURL);
    const response = await api.post('/assets', data);
    console.log('Asset creation response:', response.data);
    return response.data.data;
  },

  // Update asset
  updateAsset: async (id: string, data: Partial<AssetForm>): Promise<Asset> => {
    console.log('Updating asset with ID:', id);
    console.log('Update data:', data);
    console.log('API URL:', api.defaults.baseURL);
    const response = await api.put(`/assets/${id}`, data);
    console.log('Asset update response:', response.data);
    return response.data.data;
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  // Get asset statistics
  getAssetStats: async (): Promise<AssetStats> => {
    const response = await api.get('/assets/stats');
    return response.data.data;
  },

  // Get expiring assets
  getExpiringAssets: async (days: number = 30): Promise<Asset[]> => {
    const response = await api.get('/assets/expiring', { params: { days } });
    return response.data.data;
  },

  // Get expired assets
  getExpiredAssets: async (): Promise<Asset[]> => {
    const response = await api.get('/assets/expired');
    return response.data.data;
  },

  // Update expired assets status
  updateExpiredAssets: async (): Promise<any> => {
    const response = await api.post('/assets/update-expired');
    return response.data.data;
  },

  // Get assets by type
  getAssetsByType: async (type: string): Promise<Asset[]> => {
    const response = await api.get(`/assets/type/${type}`);
    return response.data.data;
  },

  // Get available assets
  getAvailableAssets: async (): Promise<Asset[]> => {
    const response = await api.get('/assets/available');
    return response.data.data;
  },

  // Assign asset to user
  assignAsset: async (assetId: string, userId: string): Promise<Asset> => {
    const response = await api.post(`/assets/${assetId}/assign`, { userId });
    return response.data.data;
  },

  // Unassign asset from user
  unassignAsset: async (assetId: string): Promise<Asset> => {
    const response = await api.post(`/assets/${assetId}/unassign`);
    return response.data.data;
  },
};
