import Asset from '../models/Asset';
import { AssetFilters, AssetType, AssetStatus, AssetClassification, IAsset } from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get paginated list of assets with filters
 */
export const getAssets = async (filters: AssetFilters): Promise<PaginatedResponse<IAsset>> => {
  const {
    type,
    status,
    classification,
    category,
    assignedTo,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  // Build query
  const query: any = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;

  // Handle classification filtering based on expiry date
  if (classification) {
    const now = new Date();
    
    switch (classification) {
      case AssetClassification.EXPIRED:
        query.expiryDate = { $lt: now };
        break;
      case AssetClassification.UPCOMING:
        query.expiryDate = { $gte: now };
        break;
      case AssetClassification.ONGOING:
        // Assets without expiry date or with future expiry are ongoing
        query.$or = [
          { expiryDate: { $exists: false } },
          { expiryDate: null }
        ];
        break;
    }
  }

  // Search in name, description, serialNumber, vendor
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { vendor: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Asset.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Assets retrieved successfully',
    data: assets,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Get asset by ID
 */
export const getAssetById = async (assetId: string): Promise<IAsset> => {
  const asset = await Asset.findById(assetId)
    .populate('assignedTo', 'name email department')
    .populate('createdBy', 'name email');

  if (!asset) {
    throw new Error('Asset not found');
  }

  return asset;
};

/**
 * Create new asset
 */
export const createAsset = async (assetData: Partial<IAsset>, createdBy: string): Promise<IAsset> => {
  // Check if serial number already exists (if provided)
  if (assetData.serialNumber) {
    const existingAsset = await Asset.findOne({ serialNumber: assetData.serialNumber });
    if (existingAsset) {
      throw new Error('Asset with this serial number already exists');
    }
  }

  const asset = new Asset({
    ...assetData,
    createdBy
  });

  await asset.save();
  return asset.populate([
    { path: 'assignedTo', select: 'name email department' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Update asset
 */
export const updateAsset = async (assetId: string, updateData: Partial<IAsset>): Promise<IAsset> => {
  // Check if serial number already exists (if provided)
  if (updateData.serialNumber) {
    const existingAsset = await Asset.findOne({ 
      serialNumber: updateData.serialNumber,
      _id: { $ne: assetId }
    });
    if (existingAsset) {
      throw new Error('Asset with this serial number already exists');
    }
  }

  const asset = await Asset.findByIdAndUpdate(
    assetId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email department')
    .populate('createdBy', 'name email');

  if (!asset) {
    throw new Error('Asset not found');
  }

  return asset;
};

/**
 * Delete asset
 */
export const deleteAsset = async (assetId: string): Promise<void> => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  // Check if asset is currently assigned
  if (asset.status === AssetStatus.ASSIGNED) {
    throw new Error('Cannot delete assigned asset. Please return it first.');
  }

  await Asset.findByIdAndDelete(assetId);
};

/**
 * Get asset statistics
 */
export const getAssetStats = async () => {
  const stats = await Asset.getAssetStats();
  const expiringAssets = await Asset.findExpiringAssets(30);

  return {
    totalAssets: stats[0]?.totalAssets || 0,
    availableAssets: stats[0]?.availableAssets || 0,
    assignedAssets: stats[0]?.assignedAssets || 0,
    expiringAssets: expiringAssets.length
  };
};

/**
 * Get expiring assets
 */
export const getExpiringAssets = async (days: number = 30) => {
  return Asset.findExpiringAssets(days);
};

/**
 * Get expired assets
 */
export const getExpiredAssets = async () => {
  return Asset.findExpiredAssets();
};

/**
 * Update expired assets status
 */
export const updateExpiredAssets = async () => {
  return Asset.updateExpiredAssets();
};

/**
 * Get assets by type
 */
export const getAssetsByType = async (type: AssetType) => {
  return Asset.find({ type }).populate('assignedTo', 'name email');
};

/**
 * Get available assets (not assigned)
 */
export const getAvailableAssets = async () => {
  return Asset.find({ 
    status: AssetStatus.AVAILABLE 
  }).populate('createdBy', 'name email');
};

/**
 * Assign asset to user
 */
export const assignAsset = async (assetId: string, userId: string): Promise<IAsset> => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  if (asset.status !== AssetStatus.AVAILABLE) {
    throw new Error('Asset is not available for assignment');
  }

  asset.assignedTo = userId as any;
  // Status will be automatically set to ASSIGNED by the pre-save middleware

  await asset.save();
  return asset.populate([
    { path: 'assignedTo', select: 'name email department' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Unassign asset from user
 */
export const unassignAsset = async (assetId: string): Promise<IAsset> => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  if (asset.status !== AssetStatus.ASSIGNED) {
    throw new Error('Asset is not currently assigned');
  }

  asset.assignedTo = undefined;
  // Status will be automatically set to AVAILABLE by the pre-save middleware

  await asset.save();
  return asset.populate([
    { path: 'assignedTo', select: 'name email department' },
    { path: 'createdBy', select: 'name email' }
  ]);
};
