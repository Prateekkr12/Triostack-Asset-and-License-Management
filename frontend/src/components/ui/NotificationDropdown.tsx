import React from 'react';
import { useRouter } from 'next/router';
import { Bell, Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications 
  } = useNotifications();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-secondary-600" />
            <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-secondary-500 hover:text-secondary-700"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="py-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.read ? 'bg-secondary-50' : ''
                } hover:bg-secondary-100 transition-colors cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-secondary-900' : 'text-secondary-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-secondary-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="flex-shrink-0 text-secondary-400 hover:text-secondary-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-sm text-secondary-600">No notifications yet</p>
            <p className="text-xs text-secondary-500 mt-1">
              You'll see important updates here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-secondary-200">
          <button
            onClick={() => {
              router.push('/app?tab=settings');
              onClose();
            }}
            className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
