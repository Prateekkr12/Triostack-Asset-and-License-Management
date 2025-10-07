import { Request } from 'express';
import mongoose, { Document, Types } from 'mongoose';

// User Types
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Model Static Methods
export interface IUserModel extends mongoose.Model<IUserDocument> {
  findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  EMPLOYEE = 'employee'
}

// Asset Types
export interface IAsset {
  _id?: Types.ObjectId;
  name: string;
  type: AssetType;
  category: string;
  purchaseDate: Date;
  expiryDate?: Date;
  status: AssetStatus;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  description?: string;
  serialNumber?: string;
  cost?: number;
  vendor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssetDocument extends IAsset, Document {
  _id: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssetType {
  HARDWARE = 'hardware',
  SOFTWARE = 'software',
  DOMAIN = 'domain',
  HOSTING = 'hosting',
  LICENSE = 'license',
  EQUIPMENT = 'equipment',
  VEHICLE = 'vehicle'
}

export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  EXPIRED = 'expired'
}

// Asset Model Static Methods
export interface IAssetModel extends mongoose.Model<IAssetDocument> {
  findExpiringAssets(days?: number): Promise<IAssetDocument[]>;
  findExpiredAssets(): Promise<IAssetDocument[]>;
  updateExpiredAssets(): Promise<any>;
  getAssetStats(): Promise<any[]>;
}

// Allocation Types
export interface IAllocation {
  _id?: Types.ObjectId;
  assetId: Types.ObjectId;
  userId: Types.ObjectId;
  allocationDate: Date;
  returnDate?: Date;
  status: AllocationStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAllocationDocument extends IAllocation, Document {
  _id: Types.ObjectId;
  assetId: Types.ObjectId;
  userId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum AllocationStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  PENDING = 'pending'
}

// Asset Classification
export enum AssetClassification {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  EXPIRED = 'expired'
}

// Allocation Model Static Methods
export interface IAllocationModel extends mongoose.Model<IAllocationDocument> {
  findActiveByUser(userId: string): Promise<IAllocationDocument[]>;
  findActiveByAsset(assetId: string): Promise<IAllocationDocument | null>;
  getAllocationStats(): Promise<any[]>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types with User
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Dashboard Types
export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  expiringAssets: number;
  totalUsers: number;
  activeAllocations: number;
}

export interface ExpiringAsset {
  _id: string;
  name: string;
  type: AssetType;
  expiryDate: Date;
  daysUntilExpiry: number;
  assignedTo?: string;
}

// Filter and Query Types
export interface AssetFilters {
  type?: AssetType;
  status?: AssetStatus;
  classification?: AssetClassification;
  category?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AllocationFilters {
  status?: AllocationStatus;
  assetId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Email Types
export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
