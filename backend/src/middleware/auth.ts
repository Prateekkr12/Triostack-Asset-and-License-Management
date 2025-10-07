import { Response, NextFunction } from 'express';
import User from '../models/User';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticatedRequest, UserRole } from '../types';

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    const payload = verifyToken(token);
    
    // Find user by ID from token
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

/**
 * Middleware to check user role permissions
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole([UserRole.ADMIN]);

/**
 * Middleware to check if user is admin or HR
 */
export const requireAdminOrHR = requireRole([UserRole.ADMIN, UserRole.HR]);

/**
 * Middleware to check if user can access resource (admin, HR, or own resource)
 */
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Admin and HR can access all resources
    if ([UserRole.ADMIN, UserRole.HR].includes(req.user.role)) {
      next();
      return;
    }

    // Employee can only access their own resources
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && req.user?._id && resourceUserId !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = extractTokenFromHeader(authHeader);
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
