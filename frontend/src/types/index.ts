// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  EMPLOYEE = 'employee'
}

// Asset Types
export interface Asset {
  _id: string;
  name: string;
  type: AssetType;
  category: string;
  purchaseDate: string;
  expiryDate?: string;
  status: AssetStatus;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  description?: string;
  serialNumber?: string;
  cost?: number;
  vendor?: string;
  createdAt: string;
  updatedAt: string;
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

// Allocation Types
export interface Allocation {
  _id: string;
  assetId: {
    _id: string;
    name: string;
    type: AssetType;
    category: string;
    status: AssetStatus;
    serialNumber?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  allocationDate: string;
  returnDate?: string;
  status: AllocationStatus;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export enum AllocationStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  PENDING = 'pending',
  OVERDUE = 'overdue'
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

// Dashboard Types
export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  expiringAssets: number;
  totalUsers: number;
  activeAllocations: number;
}

export interface AssetStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  expiringAssets: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  hrUsers: number;
  employeeUsers: number;
  departmentStats: Array<{
    _id: string;
    count: number;
    activeCount: number;
  }>;
}

export interface AllocationStats {
  totalAllocations: number;
  activeAllocations: number;
  returnedAllocations: number;
  pendingAllocations: number;
}

// Asset Classification
export enum AssetClassification {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing', 
  EXPIRED = 'expired'
}

// Filter Types
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
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department: string;
}

export interface AssetForm {
  name: string;
  type: AssetType;
  category: string;
  purchaseDate: string;
  expiryDate?: string;
  description?: string;
  serialNumber?: string;
  cost?: number;
  vendor?: string;
}

export interface UserForm {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  isActive: boolean;
}

export interface AllocationForm {
  assetId: string;
  userId: string;
  notes?: string;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
