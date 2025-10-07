import mongoose, { Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserDocument, IUserModel, UserRole } from '../types';

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.EMPLOYEE,
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  }
});

// Index for better query performance
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Hash password before saving
userSchema.pre<IUserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function(this: IUserDocument) {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Static method to find user by email (including password)
userSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

export default mongoose.model<IUserDocument, IUserModel>('User', userSchema);
