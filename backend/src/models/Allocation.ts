import mongoose, { Schema, Types } from 'mongoose';
import { IAllocation, IAllocationDocument, IAllocationModel, AllocationStatus } from '../types';

const allocationSchema = new Schema<IAllocationDocument>({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Asset ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  allocationDate: {
    type: Date,
    required: [true, 'Allocation date is required'],
    default: Date.now
  },
  returnDate: {
    type: Date,
    validate: {
      validator: function(this: IAllocation, value: Date) {
        return !value || value >= this.allocationDate;
      },
      message: 'Return date must be after or equal to allocation date'
    }
  },
  status: {
    type: String,
    enum: Object.values(AllocationStatus),
    default: AllocationStatus.ACTIVE,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
allocationSchema.index({ assetId: 1 });
allocationSchema.index({ userId: 1 });
allocationSchema.index({ status: 1 });
allocationSchema.index({ allocationDate: 1 });
allocationSchema.index({ returnDate: 1 });

// Compound indexes for common queries
allocationSchema.index({ userId: 1, status: 1 });
allocationSchema.index({ assetId: 1, status: 1 });
allocationSchema.index({ createdBy: 1, status: 1 });

// Virtual for allocation duration
allocationSchema.virtual('duration').get(function(this: IAllocationDocument) {
  const endDate = this.returnDate || new Date();
  const startDate = this.allocationDate;
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for is active
allocationSchema.virtual('isActive').get(function(this: IAllocationDocument) {
  return this.status === AllocationStatus.ACTIVE && !this.returnDate;
});

// Static method to find active allocations for a user
allocationSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({
    userId,
    status: AllocationStatus.ACTIVE
  }).populate('assetId', 'name type category status').populate('userId', 'name email');
};

// Static method to find active allocations for an asset
allocationSchema.statics.findActiveByAsset = function(assetId: string) {
  return this.findOne({
    assetId,
    status: AllocationStatus.ACTIVE
  }).populate('assetId', 'name type category status').populate('userId', 'name email');
};

// Static method to get allocation statistics
allocationSchema.statics.getAllocationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAllocations: { $sum: 1 },
        activeAllocations: {
          $sum: { $cond: [{ $eq: ['$status', AllocationStatus.ACTIVE] }, 1, 0] }
        },
        returnedAllocations: {
          $sum: { $cond: [{ $eq: ['$status', AllocationStatus.RETURNED] }, 1, 0] }
        },
        pendingAllocations: {
          $sum: { $cond: [{ $eq: ['$status', AllocationStatus.PENDING] }, 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware to validate allocation
allocationSchema.pre<IAllocationDocument>('save', async function(next) {
  try {
    // If status is RETURNED, set returnDate if not already set
    if (this.status === AllocationStatus.RETURNED && !this.returnDate) {
      this.returnDate = new Date();
    }
    
    // If status is ACTIVE, ensure returnDate is not set
    if (this.status === AllocationStatus.ACTIVE && this.returnDate) {
      this.returnDate = undefined;
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-save middleware to update asset status
allocationSchema.post<IAllocationDocument>('save', async function(doc) {
  try {
    const Asset = mongoose.model('Asset');
    
    if (doc.status === AllocationStatus.ACTIVE) {
      // Update asset status to assigned
      await Asset.findByIdAndUpdate(doc.assetId, {
        status: 'assigned',
        assignedTo: doc.userId
      });
    } else if (doc.status === AllocationStatus.RETURNED) {
      // Update asset status to available
      await Asset.findByIdAndUpdate(doc.assetId, {
        status: 'available',
        assignedTo: null
      });
    }
  } catch (error) {
    console.error('Error updating asset status:', error);
  }
});

export default mongoose.model<IAllocationDocument, IAllocationModel>('Allocation', allocationSchema);