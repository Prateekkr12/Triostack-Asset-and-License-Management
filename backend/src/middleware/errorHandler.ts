import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { HttpError } from '../utils/HttpError';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Custom HttpError with explicit status
  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      details: (error as any).details
    } as ApiResponse);
    return;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    } as ApiResponse);
    return;
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    res.status(400).json({
      success: false,
      message: `${field} already exists`
    } as ApiResponse);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    } as ApiResponse);
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    } as ApiResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired'
    } as ApiResponse);
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  } as ApiResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  } as ApiResponse);
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
