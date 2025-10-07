import { Request, Response } from 'express';
import { loginUser, registerUser, refreshAccessToken, getUserProfile } from '../services/authService';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  } as ApiResponse);
});

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, department } = req.body;

  const result = await registerUser({
    name,
    email,
    password,
    role,
    department
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  } as ApiResponse);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    } as ApiResponse);
  }

  const result = await refreshAccessToken(refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  } as ApiResponse);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    } as ApiResponse);
  }
  const user = await getUserProfile(req.user._id.toString());

  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: user
  } as ApiResponse);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    } as ApiResponse);
  }
  const { name, department } = req.body;
  const userId = req.user._id.toString();

  const updatedUser = await updateUser(userId, { name, department });

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  } as ApiResponse);
});

// Import updateUser from userService
import { updateUser } from '../services/userService';
