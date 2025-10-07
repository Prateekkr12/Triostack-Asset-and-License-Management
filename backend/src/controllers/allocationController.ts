import { Response } from 'express';
import {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  returnAsset,
  getAllocationStats,
  getUserActiveAllocations,
  getAssetActiveAllocation,
  getUserAllocationHistory,
  getAssetAllocationHistory
} from '../services/allocationService';
import { AuthenticatedRequest, ApiResponse, AllocationFilters } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @desc    Get all allocations with filters and pagination
 * @route   GET /api/allocations
 * @access  Private
 */
export const getAllAllocations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: AllocationFilters = {
    status: req.query.status as any,
    assetId: req.query.assetId as string,
    userId: req.query.userId as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: req.query.sortBy as string || 'allocationDate',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
  };

  const result = await getAllocations(filters);

  res.status(200).json(result);
});

/**
 * @desc    Get single allocation by ID
 * @route   GET /api/allocations/:id
 * @access  Private
 */
export const getAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allocation = await getAllocationById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Allocation retrieved successfully',
    data: allocation
  } as ApiResponse);
});

/**
 * @desc    Create new allocation
 * @route   POST /api/allocations
 * @access  Private (Admin/HR)
 */
export const createNewAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    } as ApiResponse);
  }
  const createdBy = req.user._id.toString();
  const allocation = await createAllocation(req.body, createdBy);

  return res.status(201).json({
    success: true,
    message: 'Allocation created successfully',
    data: allocation
  } as ApiResponse);
});

/**
 * @desc    Update allocation
 * @route   PUT /api/allocations/:id
 * @access  Private (Admin/HR)
 */
export const updateExistingAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allocation = await updateAllocation(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Allocation updated successfully',
    data: allocation
  } as ApiResponse);
});

/**
 * @desc    Delete allocation
 * @route   DELETE /api/allocations/:id
 * @access  Private (Admin/HR)
 */
export const deleteExistingAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteAllocation(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Allocation deleted successfully'
  } as ApiResponse);
});

/**
 * @desc    Return asset (end allocation)
 * @route   POST /api/allocations/:id/return
 * @access  Private (Admin/HR)
 */
export const returnAssetFromAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allocation = await returnAsset(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Asset returned successfully',
    data: allocation
  } as ApiResponse);
});

/**
 * @desc    Get allocation statistics
 * @route   GET /api/allocations/stats
 * @access  Private
 */
export const getAllocationStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await getAllocationStats();

  res.status(200).json({
    success: true,
    message: 'Allocation statistics retrieved successfully',
    data: stats
  } as ApiResponse);
});

/**
 * @desc    Get active allocations for a user
 * @route   GET /api/allocations/user/:userId/active
 * @access  Private
 */
export const getUserActiveAllocationsList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allocations = await getUserActiveAllocations(req.params.userId);

  res.status(200).json({
    success: true,
    message: 'User active allocations retrieved successfully',
    data: allocations
  } as ApiResponse);
});

/**
 * @desc    Get active allocation for an asset
 * @route   GET /api/allocations/asset/:assetId/active
 * @access  Private
 */
export const getAssetActiveAllocationHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allocation = await getAssetActiveAllocation(req.params.assetId);

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: 'No active allocation found for this asset'
    } as ApiResponse);
  }

  return res.status(200).json({
    success: true,
    message: 'Asset active allocation retrieved successfully',
    data: allocation
  } as ApiResponse);
});

/**
 * @desc    Get allocation history for a user
 * @route   GET /api/allocations/user/:userId/history
 * @access  Private
 */
export const getUserAllocationHistoryHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getUserAllocationHistory(req.params.userId, page, limit);

  res.status(200).json(result);
});

/**
 * @desc    Get allocation history for an asset
 * @route   GET /api/allocations/asset/:assetId/history
 * @access  Private
 */
export const getAssetAllocationHistoryHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getAssetAllocationHistory(req.params.assetId, page, limit);

  res.status(200).json(result);
});
