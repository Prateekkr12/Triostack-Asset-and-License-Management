import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
  getUserStatistics,
  getUsersByUserRole,
  getUsersByDepartmentName,
  changeUserPasswordHandler,
  resetUserPasswordHandler,
  toggleUserActiveStatus
} from '../controllers/userController';
import {
  authenticateToken,
  requireAdminOrHR,
  requireAdmin,
  requireOwnershipOrAdmin
} from '../middleware/auth';
import {
  validateUser,
  validateUserUpdate,
  validateUserFilters,
  validateObjectId
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users) - for reports
router.get('/', validateUserFilters, getAllUsers);
router.get('/stats', getUserStatistics);
router.get('/role/:role', requireAdminOrHR, getUsersByUserRole);
router.get('/department/:department', requireAdminOrHR, getUsersByDepartmentName);
router.post('/', requireAdminOrHR, validateUser, createNewUser);

// Protected routes (Admin/HR/Owner)
router.get('/:id', validateObjectId, requireOwnershipOrAdmin(), getUser);
router.put('/:id', validateObjectId, requireOwnershipOrAdmin(), validateUserUpdate, updateExistingUser);

// Admin only routes
router.delete('/:id', requireAdmin, validateObjectId, deleteExistingUser);
router.put('/:id/reset-password', requireAdmin, validateObjectId, resetUserPasswordHandler);
router.put('/:id/toggle-status', requireAdmin, validateObjectId, toggleUserActiveStatus);

// Owner only routes (user can change their own password)
router.put('/:id/change-password', validateObjectId, changeUserPasswordHandler);

export default router;
