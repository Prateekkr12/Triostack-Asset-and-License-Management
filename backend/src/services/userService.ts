import User from '../models/User';
import { UserFilters, UserRole, IUser } from '../types';
import { PaginatedResponse } from '../types';

/**
 * Get paginated list of users with filters
 */
export const getUsers = async (filters: UserFilters): Promise<PaginatedResponse<IUser>> => {
  const {
    role,
    department,
    isActive,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  // Build query
  const query: any = {};

  if (role) query.role = role;
  if (department) query.department = department;
  if (typeof isActive === 'boolean') query.isActive = isActive;

  // Search in name, email, department
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Create new user
 */
export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = new User(userData);
  await user.save();
  return user;
};

/**
 * Update user
 */
export const updateUser = async (userId: string, updateData: Partial<IUser>): Promise<IUser> => {
  // Check if email already exists (if being updated)
  if (updateData.email) {
    const existingUser = await User.findOne({ 
      email: updateData.email,
      _id: { $ne: userId }
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Delete user (soft delete by deactivating)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Soft delete by deactivating
  user.isActive = false;
  await user.save();
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactiveUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', UserRole.ADMIN] }, 1, 0] }
        },
        hrUsers: {
          $sum: { $cond: [{ $eq: ['$role', UserRole.HR] }, 1, 0] }
        },
        employeeUsers: {
          $sum: { $cond: [{ $eq: ['$role', UserRole.EMPLOYEE] }, 1, 0] }
        }
      }
    }
  ]);

  const departmentStats = await User.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    totalUsers: stats[0]?.totalUsers || 0,
    activeUsers: stats[0]?.activeUsers || 0,
    inactiveUsers: stats[0]?.inactiveUsers || 0,
    adminUsers: stats[0]?.adminUsers || 0,
    hrUsers: stats[0]?.hrUsers || 0,
    employeeUsers: stats[0]?.employeeUsers || 0,
    departmentStats
  };
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole) => {
  return User.find({ role, isActive: true }).select('name email department');
};

/**
 * Get users by department
 */
export const getUsersByDepartment = async (department: string) => {
  return User.find({ department, isActive: true }).select('name email role');
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();
};

/**
 * Reset user password (admin only)
 */
export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();
};

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  return user.toObject({ versionKey: false });
};
