import { Router } from 'express';
import {
  getAllAllocations,
  getAllocation,
  createNewAllocation,
  updateExistingAllocation,
  deleteExistingAllocation,
  returnAssetFromAllocation,
  getAllocationStatistics,
  getUserActiveAllocationsList,
  getAssetActiveAllocationHandler,
  getUserAllocationHistoryHandler,
  getAssetAllocationHistoryHandler
} from '../controllers/allocationController';
import {
  authenticateToken,
  requireAdminOrHR
} from '../middleware/auth';
import {
  validateAllocation,
  validateAllocationUpdate,
  validateObjectId
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', getAllAllocations);
router.get('/stats', getAllocationStatistics);
router.get('/user/:userId/active', getUserActiveAllocationsList);
router.get('/asset/:assetId/active', getAssetActiveAllocationHandler);
router.get('/user/:userId/history', getUserAllocationHistoryHandler);
router.get('/asset/:assetId/history', getAssetAllocationHistoryHandler);
router.get('/:id', validateObjectId, getAllocation);

// Admin/HR routes
router.post('/', requireAdminOrHR, validateAllocation, createNewAllocation);
router.put('/:id', requireAdminOrHR, validateObjectId, validateAllocationUpdate, updateExistingAllocation);
router.post('/:id/return', requireAdminOrHR, validateObjectId, returnAssetFromAllocation);
router.delete('/:id', requireAdminOrHR, validateObjectId, deleteExistingAllocation);

export default router;
