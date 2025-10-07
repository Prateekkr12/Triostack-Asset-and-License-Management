import { Asset } from '@/types';
import notificationService from './notificationService';

class AssetExpiryService {
  private static instance: AssetExpiryService;
  private checkInterval: NodeJS.Timeout | null = null;
  private checkedAssets: Set<string> = new Set();

  static getInstance(): AssetExpiryService {
    if (!AssetExpiryService.instance) {
      AssetExpiryService.instance = new AssetExpiryService();
    }
    return AssetExpiryService.instance;
  }

  startChecking(assets: Asset[], checkIntervalMinutes: number = 60) {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkExpiringAssets(assets);

    // Set up periodic checking
    this.checkInterval = setInterval(() => {
      this.checkExpiringAssets(assets);
    }, checkIntervalMinutes * 60 * 1000);
  }

  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  checkExpiringAssets(assets: Asset[]) {
    const now = new Date();
    
    assets.forEach(asset => {
      if (!asset.expiryDate) return;

      const expiryDate = new Date(asset.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if asset is expiring soon (within 7 days) or has expired
      if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
        // Only notify once per asset to avoid spam
        const notificationKey = `${asset._id}-expiring-${daysUntilExpiry}`;
        if (!this.checkedAssets.has(notificationKey)) {
          this.checkedAssets.add(notificationKey);
          notificationService.notifyAssetExpiring(asset.name, daysUntilExpiry);
        }
      } else if (daysUntilExpiry < 0) {
        // Asset has expired
        const notificationKey = `${asset._id}-expired`;
        if (!this.checkedAssets.has(notificationKey)) {
          this.checkedAssets.add(notificationKey);
          notificationService.notifyAssetExpired(asset.name);
        }
      }
    });

    // Clean up old checked assets (older than 24 hours)
    this.cleanupOldChecks();
  }

  private cleanupOldChecks() {
    // In a real implementation, you might want to store timestamps
    // For now, we'll just clear the set periodically
    if (this.checkedAssets.size > 1000) {
      this.checkedAssets.clear();
    }
  }

  // Method to manually trigger a check
  triggerCheck(assets: Asset[]) {
    this.checkExpiringAssets(assets);
  }
}

export default AssetExpiryService.getInstance();
