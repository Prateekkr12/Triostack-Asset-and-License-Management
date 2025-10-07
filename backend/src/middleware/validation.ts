import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AssetType, AssetStatus, UserRole, AllocationStatus } from '../types';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Query params:', req.query);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// User validation rules
export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Asset validation rules
export const validateAsset = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Asset name must be between 2 and 100 characters'),
  body('type')
    .isIn(Object.values(AssetType))
    .withMessage('Invalid asset type'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('status')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('Invalid asset status'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('vendor')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Vendor name cannot exceed 100 characters'),
  handleValidationErrors
];

export const validateAssetUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Asset name must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isIn(Object.values(AssetType))
    .withMessage('Invalid asset type'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('status')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('Invalid asset status'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('vendor')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Vendor name cannot exceed 100 characters'),
  handleValidationErrors
];

// Allocation validation rules
export const validateAllocation = [
  body('assetId')
    .isMongoId()
    .withMessage('Asset ID must be a valid MongoDB ObjectId'),
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('allocationDate')
    .optional()
    .isISO8601()
    .withMessage('Allocation date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

export const validateAllocationUpdate = [
  body('returnDate')
    .optional()
    .isISO8601()
    .withMessage('Return date must be a valid date'),
  body('status')
    .optional()
    .isIn(Object.values(AllocationStatus))
    .withMessage('Invalid allocation status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

// Parameter validation rules
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation rules
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('sortBy')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Sort by field cannot be empty'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

export const validateAssetFilters = [
  query('type')
    .optional()
    .isIn(Object.values(AssetType))
    .withMessage('Invalid asset type filter'),
  query('status')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('Invalid asset status filter'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category filter cannot exceed 50 characters'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  ...validatePagination
];

export const validateUserFilters = [
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role filter'),
  query('department')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department filter cannot exceed 50 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  ...validatePagination
];
