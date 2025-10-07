import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { AssetType, AssetStatus, UserRole, AllocationStatus, AssetClassification } from '@/types';

// Date formatters
export const formatDate = (date: string | Date, formatString = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid Date';
  }
};

// Currency formatter
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Number formatter
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Text formatters
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatAssetType = (type: AssetType): string => {
  const typeMap: Record<AssetType, string> = {
    [AssetType.HARDWARE]: 'Hardware',
    [AssetType.SOFTWARE]: 'Software',
    [AssetType.DOMAIN]: 'Domain',
    [AssetType.HOSTING]: 'Hosting',
    [AssetType.LICENSE]: 'License',
    [AssetType.EQUIPMENT]: 'Equipment',
    [AssetType.VEHICLE]: 'Vehicle',
  };
  return typeMap[type] || type;
};

export const formatAssetStatus = (status: AssetStatus): string => {
  const statusMap: Record<AssetStatus, string> = {
    [AssetStatus.AVAILABLE]: 'Available',
    [AssetStatus.ASSIGNED]: 'Assigned',
    [AssetStatus.EXPIRED]: 'Expired',
  };
  return statusMap[status] || status;
};

export const formatUserRole = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.HR]: 'HR Manager',
    [UserRole.EMPLOYEE]: 'Employee',
  };
  return roleMap[role] || role;
};

export const formatAllocationStatus = (status: AllocationStatus): string => {
  const statusMap: Record<AllocationStatus, string> = {
    [AllocationStatus.ACTIVE]: 'Active',
    [AllocationStatus.RETURNED]: 'Returned',
    [AllocationStatus.PENDING]: 'Pending',
    [AllocationStatus.OVERDUE]: 'Overdue',
  };
  return statusMap[status] || status;
};

// Status color helpers
export const getAssetStatusColor = (status: AssetStatus): string => {
  const colorMap: Record<AssetStatus, string> = {
    [AssetStatus.AVAILABLE]: 'text-success-600 bg-success-50',
    [AssetStatus.ASSIGNED]: 'text-primary-600 bg-primary-50',
    [AssetStatus.EXPIRED]: 'text-danger-600 bg-danger-50',
  };
  return colorMap[status] || 'text-secondary-600 bg-secondary-50';
};

export const getAllocationStatusColor = (status: AllocationStatus): string => {
  const colorMap: Record<AllocationStatus, string> = {
    [AllocationStatus.ACTIVE]: 'text-success-600 bg-success-50',        
    [AllocationStatus.RETURNED]: 'text-secondary-600 bg-secondary-50',  
    [AllocationStatus.PENDING]: 'text-warning-600 bg-warning-50',       
    [AllocationStatus.OVERDUE]: 'text-danger-600 bg-danger-50',       
  };
  return colorMap[status] || 'text-secondary-600 bg-secondary-50';
};

export const getUserRoleColor = (role: UserRole): string => {
  const colorMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'text-danger-600 bg-danger-50',
    [UserRole.HR]: 'text-primary-600 bg-primary-50',
    [UserRole.EMPLOYEE]: 'text-secondary-600 bg-secondary-50',
  };
  return colorMap[role] || 'text-secondary-600 bg-secondary-50';
};

// Expiry helpers
export const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  
  const expiry = parseISO(expiryDate);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate?: string): 'expired' | 'expiring-soon' | 'expiring-later' | 'no-expiry' => {
  if (!expiryDate) return 'no-expiry';
  
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  if (daysUntilExpiry === null) return 'no-expiry';
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  if (daysUntilExpiry <= 90) return 'expiring-later';
  return 'no-expiry';
};

export const getExpiryStatusColor = (expiryStatus: string): string => {
  const colorMap: Record<string, string> = {
    'expired': 'text-danger-600 bg-danger-50',
    'expiring-soon': 'text-warning-600 bg-warning-50',
    'expiring-later': 'text-primary-600 bg-primary-50',
    'no-expiry': 'text-secondary-600 bg-secondary-50',
  };
  return colorMap[expiryStatus] || 'text-secondary-600 bg-secondary-50';
};

// Asset classification helpers
export const getAssetClassification = (purchaseDate?: string, expiryDate?: string, status?: AssetStatus): AssetClassification => {
  const now = new Date();
  
  // Parse dates
  const purchase = purchaseDate ? parseISO(purchaseDate) : null;
  const expiry = expiryDate ? parseISO(expiryDate) : null;
  
  // If no purchase date, we can't classify properly
  if (!purchase) {
    return AssetClassification.ONGOING;
  }
  
  // EXPIRED: End date has crossed current day
  if (expiry && expiry < now) {
    return AssetClassification.EXPIRED;
  }
  
  // UPCOMING: Start date is in the future
  if (purchase > now) {
    return AssetClassification.UPCOMING;
  }
  
  // ONGOING: Current day is between start date and end date (inclusive)
  // If no expiry date, consider it ongoing if purchase date has passed
  if (!expiry || (purchase <= now && (expiry >= now || !expiry))) {
    return AssetClassification.ONGOING;
  }
  
  // Default fallback
  return AssetClassification.ONGOING;
};

export const formatAssetClassification = (classification: AssetClassification): string => {
  const classificationMap: Record<AssetClassification, string> = {
    [AssetClassification.UPCOMING]: 'Upcoming',
    [AssetClassification.ONGOING]: 'Ongoing',
    [AssetClassification.EXPIRED]: 'Expired',
  };
  return classificationMap[classification] || classification;
};

export const getAssetClassificationColor = (classification: AssetClassification): string => {
  const colorMap: Record<AssetClassification, string> = {
    [AssetClassification.UPCOMING]: 'text-warning-600 bg-warning-50',
    [AssetClassification.ONGOING]: 'text-success-600 bg-success-50',
    [AssetClassification.EXPIRED]: 'text-danger-600 bg-danger-50',
  };
  return colorMap[classification] || 'text-secondary-600 bg-secondary-50';
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
