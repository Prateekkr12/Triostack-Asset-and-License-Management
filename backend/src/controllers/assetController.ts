import { Response } from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  getExpiringAssets,
  getExpiredAssets,
  updateExpiredAssets,
  getAssetsByType,
  getAvailableAssets,
  assignAsset,
  unassignAsset
} from '../services/assetService';
import { AuthenticatedRequest, ApiResponse, AssetFilters } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @desc    Get all assets with filters and pagination
 * @route   GET /api/assets
 * @access  Private
 */
export const getAllAssets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: AssetFilters = {
    type: req.query.type as any,
    status: req.query.status as any,
    classification: req.query.classification as any,
    category: req.query.category as string,
    assignedTo: req.query.assignedTo as string,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
  };

  const result = await getAssets(filters);

  res.status(200).json(result);
});

/**
 * @desc    Get single asset by ID
 * @route   GET /api/assets/:id
 * @access  Private
 */
export const getAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await getAssetById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Asset retrieved successfully',
    data: asset
  } as ApiResponse);
});

/**
 * @desc    Create new asset
 * @route   POST /api/assets
 * @access  Private (Admin/HR)
 */
export const createNewAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    } as ApiResponse);
  }
  const createdBy = req.user._id.toString();
  const asset = await createAsset(req.body, createdBy);

  return res.status(201).json({
    success: true,
    message: 'Asset created successfully',
    data: asset
  } as ApiResponse);
});

/**
 * @desc    Update asset
 * @route   PUT /api/assets/:id
 * @access  Private (Admin/HR)
 */
export const updateExistingAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await updateAsset(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Asset updated successfully',
    data: asset
  } as ApiResponse);
});

/**
 * @desc    Delete asset
 * @route   DELETE /api/assets/:id
 * @access  Private (Admin only)
 */
export const deleteExistingAsset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteAsset(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Asset deleted successfully'
  } as ApiResponse);
});

/**
 * @desc    Get asset statistics
 * @route   GET /api/assets/stats
 * @access  Private
 */
export const getAssetStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await getAssetStats();

  res.status(200).json({
    success: true,
    message: 'Asset statistics retrieved successfully',
    data: stats
  } as ApiResponse);
});

/**
 * @desc    Get expiring assets
 * @route   GET /api/assets/expiring
 * @access  Private
 */
export const getExpiringAssetsList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const assets = await getExpiringAssets(days);

  res.status(200).json({
    success: true,
    message: 'Expiring assets retrieved successfully',
    data: assets
  } as ApiResponse);
});

/**
 * @desc    Get expired assets
 * @route   GET /api/assets/expired
 * @access  Private
 */
export const getExpiredAssetsList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assets = await getExpiredAssets();

  res.status(200).json({
    success: true,
    message: 'Expired assets retrieved successfully',
    data: assets
  } as ApiResponse);
});

/**
 * @desc    Update expired assets status
 * @route   POST /api/assets/update-expired
 * @access  Private (Admin/HR)
 */
export const updateExpiredAssetsStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await updateExpiredAssets();

  res.status(200).json({
    success: true,
    message: 'Expired assets updated successfully',
    data: result
  } as ApiResponse);
});

/**
 * @desc    Get assets by type
 * @route   GET /api/assets/type/:type
 * @access  Private
 */
export const getAssetsByAssetType = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assets = await getAssetsByType(req.params.type as any);

  res.status(200).json({
    success: true,
    message: 'Assets by type retrieved successfully',
    data: assets
  } as ApiResponse);
});

/**
 * @desc    Get available assets
 * @route   GET /api/assets/available
 * @access  Private
 */
export const getAvailableAssetsList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assets = await getAvailableAssets();

  res.status(200).json({
    success: true,
    message: 'Available assets retrieved successfully',
    data: assets
  } as ApiResponse);
});

/**
 * @desc    Assign asset to user
 * @route   POST /api/assets/:id/assign
 * @access  Private (Admin/HR)
 */
export const assignAssetToUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  const asset = await assignAsset(req.params.id, userId);

  res.status(200).json({
    success: true,
    message: 'Asset assigned successfully',
    data: asset
  } as ApiResponse);
});

/**
 * @desc    Unassign asset from user
 * @route   POST /api/assets/:id/unassign
 * @access  Private (Admin/HR)
 */
export const unassignAssetFromUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const asset = await unassignAsset(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Asset unassigned successfully',
    data: asset
  } as ApiResponse);
});
