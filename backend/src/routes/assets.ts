import { Router } from 'express';
import {
  getAllAssets,
  getAsset,
  createNewAsset,
  updateExistingAsset,
  deleteExistingAsset,
  getAssetStatistics,
  getExpiringAssetsList,
  getExpiredAssetsList,
  updateExpiredAssetsStatus,
  getAssetsByAssetType,
  getAvailableAssetsList,
  assignAssetToUser,
  unassignAssetFromUser
} from '../controllers/assetController';
import {
  authenticateToken,
  requireAdminOrHR,
  requireAdmin
} from '../middleware/auth';
import {
  validateAsset,
  validateAssetUpdate,
  validateAssetFilters,
  validateObjectId
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', validateAssetFilters, getAllAssets);
router.get('/stats', getAssetStatistics);
router.get('/expiring', getExpiringAssetsList);
router.get('/expired', getExpiredAssetsList);
router.get('/type/:type', getAssetsByAssetType);
router.get('/available', getAvailableAssetsList);
router.get('/:id', validateObjectId, getAsset);

// Admin/HR routes
router.post('/', requireAdminOrHR, validateAsset, createNewAsset);
router.put('/:id', requireAdminOrHR, validateObjectId, validateAssetUpdate, updateExistingAsset);
router.post('/:id/assign', requireAdminOrHR, validateObjectId, assignAssetToUser);
router.post('/:id/unassign', requireAdminOrHR, validateObjectId, unassignAssetFromUser);
router.post('/update-expired', requireAdminOrHR, updateExpiredAssetsStatus);

// Admin only routes
router.delete('/:id', requireAdmin, validateObjectId, deleteExistingAsset);

export default router;
