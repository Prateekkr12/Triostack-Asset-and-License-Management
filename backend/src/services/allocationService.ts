import Allocation from '../models/Allocation';
import Asset from '../models/Asset';
import User from '../models/User';
import { AllocationFilters, AllocationStatus, IAllocation } from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get paginated list of allocations with filters
 */
export const getAllocations = async (filters: AllocationFilters): Promise<PaginatedResponse<IAllocation>> => {
  const {
    status,
    assetId,
    userId,
    page = 1,
    limit = 10,
    sortBy = 'allocationDate',
    sortOrder = 'desc'
  } = filters;

  // Build query
  const query: any = {};

  if (status) query.status = status;
  if (assetId) query.assetId = assetId;
  if (userId) query.userId = userId;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [allocations, total] = await Promise.all([
    Allocation.find(query)
      .populate('assetId', 'name type category status serialNumber')
      .populate('userId', 'name email department')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Allocation.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Allocations retrieved successfully',
    data: allocations,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Get allocation by ID
 */
export const getAllocationById = async (allocationId: string): Promise<IAllocation> => {
  const allocation = await Allocation.findById(allocationId)
    .populate('assetId', 'name type category status serialNumber')
    .populate('userId', 'name email department')
    .populate('createdBy', 'name email');

  if (!allocation) {
    throw new Error('Allocation not found');
  }

  return allocation;
};

/**
 * Create new allocation
 */
export const createAllocation = async (
  allocationData: Partial<IAllocation>, 
  createdBy: string
): Promise<IAllocation> => {
  const { assetId, userId, notes } = allocationData;

  // Validate asset exists and is available
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  if (asset.status !== 'available') {
    throw new Error('Asset is not available for allocation');
  }

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user already has an active allocation for this asset
  const existingAllocation = await Allocation.findOne({
    assetId,
    userId,
    status: AllocationStatus.ACTIVE
  });

  if (existingAllocation) {
    throw new Error('User already has an active allocation for this asset');
  }

  // Create allocation
  const allocation = new Allocation({
    assetId,
    userId,
    notes,
    createdBy
  });

  await allocation.save();

  // Update asset status
  await Asset.findByIdAndUpdate(assetId, {
    status: 'assigned',
    assignedTo: userId
  });

  return allocation.populate([
    { path: 'assetId', select: 'name type category status serialNumber' },
    { path: 'userId', select: 'name email department' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Update allocation
 */
export const updateAllocation = async (
  allocationId: string, 
  updateData: Partial<IAllocation>
): Promise<IAllocation> => {
  const allocation = await Allocation.findByIdAndUpdate(
    allocationId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('assetId', 'name type category status serialNumber')
    .populate('userId', 'name email department')
    .populate('createdBy', 'name email');

  if (!allocation) {
    throw new Error('Allocation not found');
  }

  return allocation;
};

/**
 * Return asset (end allocation)
 */
export const returnAsset = async (allocationId: string): Promise<IAllocation> => {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) {
    throw new Error('Allocation not found');
  }

  if (allocation.status !== AllocationStatus.ACTIVE) {
    throw new Error('Allocation is not active');
  }

  // Update allocation
  allocation.status = AllocationStatus.RETURNED;
  allocation.returnDate = new Date();

  await allocation.save();

  // Update asset status
  await Asset.findByIdAndUpdate(allocation.assetId, {
    status: 'available',
    assignedTo: null
  });

  return allocation.populate([
    { path: 'assetId', select: 'name type category status serialNumber' },
    { path: 'userId', select: 'name email department' },
    { path: 'createdBy', select: 'name email' }
  ]);
};

/**
 * Delete allocation
 */
export const deleteAllocation = async (allocationId: string): Promise<void> => {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) {
    throw new Error('Allocation not found');
  }

  // If allocation is active, return the asset first
  if (allocation.status === AllocationStatus.ACTIVE) {
    await returnAsset(allocationId);
  }

  await Allocation.findByIdAndDelete(allocationId);
};

/**
 * Get allocation statistics
 */
export const getAllocationStats = async () => {
  const stats = await Allocation.getAllocationStats();
  return {
    totalAllocations: stats[0]?.totalAllocations || 0,
    activeAllocations: stats[0]?.activeAllocations || 0,
    returnedAllocations: stats[0]?.returnedAllocations || 0,
    pendingAllocations: stats[0]?.pendingAllocations || 0
  };
};

/**
 * Get active allocations for a user
 */
export const getUserActiveAllocations = async (userId: string) => {
  return Allocation.findActiveByUser(userId);
};

/**
 * Get active allocation for an asset
 */
export const getAssetActiveAllocation = async (assetId: string) => {
  return Allocation.findActiveByAsset(assetId);
};

/**
 * Get allocation history for a user
 */
export const getUserAllocationHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [allocations, total] = await Promise.all([
    Allocation.find({ userId })
      .populate('assetId', 'name type category serialNumber')
      .populate('createdBy', 'name email')
      .sort({ allocationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Allocation.countDocuments({ userId })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'User allocation history retrieved successfully',
    data: allocations,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Get allocation history for an asset
 */
export const getAssetAllocationHistory = async (assetId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [allocations, total] = await Promise.all([
    Allocation.find({ assetId })
      .populate('userId', 'name email department')
      .populate('createdBy', 'name email')
      .sort({ allocationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Allocation.countDocuments({ assetId })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Asset allocation history retrieved successfully',
    data: allocations,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};
