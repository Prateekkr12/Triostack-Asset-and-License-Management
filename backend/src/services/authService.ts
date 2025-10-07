import User from '../models/User';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { UserRole } from '../types';
import { createHttpError } from '../utils/HttpError';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    isActive: boolean;
  };
  token: string;
  refreshToken: string;
}

/**
 * Authenticate user with email and password
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { email, password } = credentials;

  // Find user by email with password
  const user = await User.findByEmailWithPassword(email);
  if (!user) {
    throw createHttpError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw createHttpError.forbidden('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createHttpError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken(user._id.toString());

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    },
    token,
    refreshToken
  };
};

/**
 * Register a new user
 */
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const { name, email, password, role = UserRole.EMPLOYEE, department } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role,
    department
  });

  await user.save();

  // Generate tokens
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken(user._id.toString());

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    },
    token,
    refreshToken
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ token: string }> => {
  const { verifyRefreshToken } = await import('../utils/jwt');
  const { userId } = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError.unauthorized('Invalid refresh token');
  }
  if (!user.isActive) {
    throw createHttpError.forbidden('Account is deactivated');
  }

  // Generate new access token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  return { token };
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
