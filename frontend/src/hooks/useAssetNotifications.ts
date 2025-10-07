import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import notificationService from '@/services/notificationService';

export const useAssetNotifications = () => {
  const { user } = useAuth();
  const notificationContext = useNotifications();

  useEffect(() => {
    // Set the notification context in the service
    notificationService.setNotificationContext(notificationContext);
  }, [notificationContext]);

  const notifyAssetCreated = (assetName: string) => {
    if (user) {
      notificationService.notifyAssetCreated(assetName, user.name);
    }
  };

  const notifyAssetUpdated = (assetName: string) => {
    if (user) {
      notificationService.notifyAssetUpdated(assetName, user.name);
    }
  };

  const notifyAssetDeleted = (assetName: string) => {
    if (user) {
      notificationService.notifyAssetDeleted(assetName, user.name);
    }
  };

  const notifyAssetExpiring = (assetName: string, daysUntilExpiry: number) => {
    notificationService.notifyAssetExpiring(assetName, daysUntilExpiry);
  };

  const notifyAssetExpired = (assetName: string) => {
    notificationService.notifyAssetExpired(assetName);
  };

  const notifyAssetAssigned = (assetName: string, assignedTo: string) => {
    if (user) {
      notificationService.notifyAssetAssigned(assetName, user.name, assignedTo);
    }
  };

  const notifyAssetUnassigned = (assetName: string, unassignedFrom: string) => {
    if (user) {
      notificationService.notifyAssetUnassigned(assetName, user.name, unassignedFrom);
    }
  };

  const notifyUserAction = (action: string, details?: string) => {
    if (user) {
      notificationService.notifyUserAction(action, user.name, details);
    }
  };

  return {
    notifyAssetCreated,
    notifyAssetUpdated,
    notifyAssetDeleted,
    notifyAssetExpiring,
    notifyAssetExpired,
    notifyAssetAssigned,
    notifyAssetUnassigned,
    notifyUserAction,
  };
};
