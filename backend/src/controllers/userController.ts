import { Response } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUsersByRole,
  getUsersByDepartment,
  changeUserPassword,
  resetUserPassword,
  toggleUserStatus
} from '../services/userService';
import { AuthenticatedRequest, ApiResponse, UserFilters } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @desc    Get all users with filters and pagination
 * @route   GET /api/users
 * @access  Private (Admin/HR)
 */
export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters: UserFilters = {
    role: req.query.role as any,
    department: req.query.department as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
  };

  const result = await getUsers(filters);

  res.status(200).json(result);
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin/HR/Owner)
 */
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await getUserById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user
  } as ApiResponse);
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin/HR)
 */
export const createNewUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  } as ApiResponse);
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin/HR/Owner)
 */
export const updateExistingUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  } as ApiResponse);
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteExistingUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  } as ApiResponse);
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private (Admin/HR)
 */
export const getUserStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await getUserStats();

  res.status(200).json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: stats
  } as ApiResponse);
});

/**
 * @desc    Get users by role
 * @route   GET /api/users/role/:role
 * @access  Private (Admin/HR)
 */
export const getUsersByUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await getUsersByRole(req.params.role as any);

  res.status(200).json({
    success: true,
    message: 'Users by role retrieved successfully',
    data: users
  } as ApiResponse);
});

/**
 * @desc    Get users by department
 * @route   GET /api/users/department/:department
 * @access  Private (Admin/HR)
 */
export const getUsersByDepartmentName = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await getUsersByDepartment(req.params.department);

  res.status(200).json({
    success: true,
    message: 'Users by department retrieved successfully',
    data: users
  } as ApiResponse);
});

/**
 * @desc    Change user password
 * @route   PUT /api/users/:id/change-password
 * @access  Private (Owner only)
 */
export const changeUserPasswordHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  // Check if user is changing their own password or if requester is admin
  if (!req.user?._id || (userId !== req.user._id.toString() && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'You can only change your own password'
    } as ApiResponse);
  }

  await changeUserPassword(userId, currentPassword, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  } as ApiResponse);
});

/**
 * @desc    Reset user password (admin only)
 * @route   PUT /api/users/:id/reset-password
 * @access  Private (Admin only)
 */
export const resetUserPasswordHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { newPassword } = req.body;
  await resetUserPassword(req.params.id, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  } as ApiResponse);
});

/**
 * @desc    Toggle user active status
 * @route   PUT /api/users/:id/toggle-status
 * @access  Private (Admin only)
 */
export const toggleUserActiveStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await toggleUserStatus(req.params.id);

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  } as ApiResponse);
});
