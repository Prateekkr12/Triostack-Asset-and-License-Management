import mongoose, { Schema, Types } from 'mongoose';
import { IAsset, IAssetDocument, IAssetModel, AssetType, AssetStatus } from '../types';

const assetSchema = new Schema<IAssetDocument>({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    minlength: [2, 'Asset name must be at least 2 characters long'],
    maxlength: [100, 'Asset name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: Object.values(AssetType),
    required: [true, 'Asset type is required']
  },
  category: {
    type: String,
    required: [true, 'Asset category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: Object.values(AssetStatus),
    default: AssetStatus.AVAILABLE,
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allow multiple null values
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  vendor: {
    type: String,
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
assetSchema.index({ name: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ expiryDate: 1 });

// Compound indexes for common queries
assetSchema.index({ type: 1, status: 1 });
assetSchema.index({ assignedTo: 1, status: 1 });
assetSchema.index({ expiryDate: 1, status: 1 });

// Virtual for days until expiry
assetSchema.virtual('daysUntilExpiry').get(function(this: IAssetDocument) {
  if (!this.expiryDate) return null;
  const today = new Date();
  const timeDiff = this.expiryDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for expiry status
assetSchema.virtual('expiryStatus').get(function(this: IAssetDocument) {
  if (!this.expiryDate) return 'no-expiry';
  const today = new Date();
  const timeDiff = this.expiryDate.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring-soon';
  if (daysUntilExpiry <= 90) return 'expiring-later';
  return 'valid';
});

// Static method to find expiring assets
assetSchema.statics.findExpiringAssets = function(days: number = 30) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  // Include all assets that will expire within the window regardless of assignment status
  // (previously excluded ASSIGNED assets, which hid legitimately expiring items)
  return this.find({
    expiryDate: { $gte: now, $lte: futureDate }
  }).populate('assignedTo', 'name email');
};

// Static method to find expired assets
assetSchema.statics.findExpiredAssets = function() {
  const now = new Date();
  
  return this.find({
    expiryDate: { $lt: now },
    status: { $ne: AssetStatus.EXPIRED }
  }).populate('assignedTo', 'name email');
};

// Static method to update expired assets
assetSchema.statics.updateExpiredAssets = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      expiryDate: { $lt: now },
      status: { $ne: AssetStatus.EXPIRED }
    },
    {
      $set: { status: AssetStatus.EXPIRED }
    }
  );
  
  return result;
};

// Static method to get asset statistics
assetSchema.statics.getAssetStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAssets: { $sum: 1 },
        availableAssets: {
          $sum: { $cond: [{ $eq: ['$status', AssetStatus.AVAILABLE] }, 1, 0] }
        },
        assignedAssets: {
          $sum: { $cond: [{ $eq: ['$status', AssetStatus.ASSIGNED] }, 1, 0] }
        },
      }
    }
  ]);
};

// Pre-update middleware to validate dates and auto-set status
assetSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate() as any;
  
  // Auto-set status based on assignment
  if (update && 'assignedTo' in update) {
    if (update.assignedTo) {
      update.status = AssetStatus.ASSIGNED;
    } else {
      update.status = AssetStatus.AVAILABLE;
    }
  }
  
  if (update && (update.purchaseDate || update.expiryDate)) {
    // Get the current document to check existing values
    this.model.findOne(this.getQuery()).then((doc: any) => {
      if (doc) {
        const purchaseDate = update.purchaseDate ? new Date(update.purchaseDate) : doc.purchaseDate;
        const expiryDate = update.expiryDate ? new Date(update.expiryDate) : doc.expiryDate;
        
        if (expiryDate && purchaseDate && expiryDate <= purchaseDate) {
          next(new Error('Expiry date must be after purchase date'));
          return;
        }
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

// Pre-save middleware to automatically set status based on assignment and expiry
assetSchema.pre<IAssetDocument>('save', function(next) {
  // Validate dates
  if (this.expiryDate && this.purchaseDate && this.expiryDate <= this.purchaseDate) {
    next(new Error('Expiry date must be after purchase date'));
    return;
  }
  
  // Check if asset is expired
  const now = new Date();
  if (this.expiryDate && this.expiryDate < now) {
    this.status = AssetStatus.EXPIRED;
  } else {
    // Automatically set status based on assignment
    if (this.assignedTo) {
      this.status = AssetStatus.ASSIGNED;
    } else {
      this.status = AssetStatus.AVAILABLE;
    }
  }
  
  next();
});

export default mongoose.model<IAssetDocument, IAssetModel>('Asset', assetSchema);
