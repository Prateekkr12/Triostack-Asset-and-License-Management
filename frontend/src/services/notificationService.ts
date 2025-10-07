import { useNotifications } from '@/context/NotificationContext';

export interface NotificationEvent {
  type: 'asset_created' | 'asset_updated' | 'asset_deleted' | 'asset_expiring' | 'asset_expired' | 'user_action';
  title: string;
  message: string;
  assetName?: string;
  userName?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

class NotificationService {
  private static instance: NotificationService;
  private notificationContext: any = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setNotificationContext(context: any) {
    this.notificationContext = context;
  }

  private addNotification(event: NotificationEvent) {
    if (this.notificationContext) {
      const notificationType = this.getNotificationType(event.type);
      this.notificationContext.addNotification({
        type: notificationType,
        title: event.title,
        message: event.message,
        actionUrl: event.actionUrl
      });
    }
  }

  private getNotificationType(eventType: string): 'info' | 'success' | 'warning' | 'error' {
    switch (eventType) {
      case 'asset_created':
        return 'success';
      case 'asset_updated':
        return 'info';
      case 'asset_deleted':
        return 'warning';
      case 'asset_expiring':
        return 'warning';
      case 'asset_expired':
        return 'error';
      default:
        return 'info';
    }
  }

  // Asset Events
  notifyAssetCreated(assetName: string, userName: string) {
    this.addNotification({
      type: 'asset_created',
      title: 'Asset Created',
      message: `${userName} created a new asset: ${assetName}`,
      assetName,
      userName,
      actionUrl: '/app?tab=assets',
      priority: 'medium'
    });
  }

  notifyAssetUpdated(assetName: string, userName: string) {
    this.addNotification({
      type: 'asset_updated',
      title: 'Asset Updated',
      message: `${userName} updated asset: ${assetName}`,
      assetName,
      userName,
      actionUrl: '/app?tab=assets',
      priority: 'low'
    });
  }

  notifyAssetDeleted(assetName: string, userName: string) {
    this.addNotification({
      type: 'asset_deleted',
      title: 'Asset Deleted',
      message: `${userName} deleted asset: ${assetName}`,
      assetName,
      userName,
      actionUrl: '/app?tab=assets',
      priority: 'high'
    });
  }

  notifyAssetExpiring(assetName: string, daysUntilExpiry: number) {
    this.addNotification({
      type: 'asset_expiring',
      title: 'Asset Expiring Soon',
      message: `Asset "${assetName}" will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
      assetName,
      actionUrl: '/app?tab=assets',
      priority: 'high'
    });
  }

  notifyAssetExpired(assetName: string) {
    this.addNotification({
      type: 'asset_expired',
      title: 'Asset Expired',
      message: `Asset "${assetName}" has expired`,
      assetName,
      actionUrl: '/app?tab=assets',
      priority: 'high'
    });
  }

  // User Events
  notifyUserAction(action: string, userName: string, details?: string) {
    this.addNotification({
      type: 'user_action',
      title: 'User Action',
      message: `${userName} ${action}${details ? `: ${details}` : ''}`,
      userName,
      priority: 'low'
    });
  }

  // Allocation Events
  notifyAssetAssigned(assetName: string, userName: string, assignedTo: string) {
    this.addNotification({
      type: 'asset_updated',
      title: 'Asset Assigned',
      message: `${userName} assigned "${assetName}" to ${assignedTo}`,
      assetName,
      userName,
      actionUrl: '/app?tab=allocations',
      priority: 'medium'
    });
  }

  notifyAssetUnassigned(assetName: string, userName: string, unassignedFrom: string) {
    this.addNotification({
      type: 'asset_updated',
      title: 'Asset Unassigned',
      message: `${userName} unassigned "${assetName}" from ${unassignedFrom}`,
      assetName,
      userName,
      actionUrl: '/app?tab=allocations',
      priority: 'medium'
    });
  }
}

export default NotificationService.getInstance();
