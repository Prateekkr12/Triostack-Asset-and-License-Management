import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Database, 
  Clock,
  Save,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function SettingsContent() {
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    expiryAlerts: true,
    expiryDays: 30,
    assetCreationAlerts: true,
    assetUpdateAlerts: true,
    assetDeletionAlerts: true,
    
    // System Settings
    autoExpireAssets: true,
    dataRetentionDays: 365,
    backupFrequency: 'daily',
    
    // Security Settings
    sessionTimeout: 60,
    requireStrongPasswords: true,
    twoFactorAuth: false,
    
    // General Settings
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your settings have been updated successfully.'
      });
    }, 1000);
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      expiryAlerts: true,
      expiryDays: 30,
      assetCreationAlerts: true,
      assetUpdateAlerts: true,
      assetDeletionAlerts: true,
      autoExpireAssets: true,
      dataRetentionDays: 365,
      backupFrequency: 'daily',
      sessionTimeout: 60,
      requireStrongPasswords: true,
      twoFactorAuth: false,
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en'
    });
    
    addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'Settings have been reset to default values.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-600 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            loading={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-secondary-700">Email Notifications</label>
                  <p className="text-xs text-secondary-500">Enable email notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-secondary-700">Expiry Alerts</label>
                  <p className="text-xs text-secondary-500">Get notified when assets are expiring</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.expiryAlerts}
                    onChange={(e) => setSettings({...settings, expiryAlerts: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <Input
                label="Days Before Expiry Alert"
                type="number"
                value={settings.expiryDays}
                onChange={(e) => setSettings({...settings, expiryDays: parseInt(e.target.value)})}
                min="1"
                max="365"
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary-700">Asset Creation Alerts</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.assetCreationAlerts}
                      onChange={(e) => setSettings({...settings, assetCreationAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary-700">Asset Update Alerts</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.assetUpdateAlerts}
                      onChange={(e) => setSettings({...settings, assetUpdateAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary-700">Asset Deletion Alerts</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.assetDeletionAlerts}
                      onChange={(e) => setSettings({...settings, assetDeletionAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">System</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-secondary-700">Auto-Expire Assets</label>
                  <p className="text-xs text-secondary-500">Automatically mark assets as expired</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoExpireAssets}
                    onChange={(e) => setSettings({...settings, autoExpireAssets: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <Input
                label="Data Retention (Days)"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                min="30"
                max="3650"
              />

              <Select
                label="Backup Frequency"
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />

              <Select
                label="Timezone"
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'Eastern Time' },
                  { value: 'America/Chicago', label: 'Central Time' },
                  { value: 'America/Denver', label: 'Mountain Time' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time' },
                  { value: 'Europe/London', label: 'London' },
                  { value: 'Asia/Tokyo', label: 'Tokyo' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">Security</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                min="15"
                max="480"
              />

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-secondary-700">Require Strong Passwords</label>
                  <p className="text-xs text-secondary-500">Enforce complex password requirements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireStrongPasswords}
                    onChange={(e) => setSettings({...settings, requireStrongPasswords: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-secondary-700">Two-Factor Authentication</label>
                  <p className="text-xs text-secondary-500">Enable 2FA for all users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">General</h3>
            </div>
            
            <div className="space-y-4">
              <Select
                label="Date Format"
                value={settings.dateFormat}
                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                options={[
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
              />

              <Select
                label="Currency"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                options={[
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'GBP', label: 'British Pound (£)' },
                  { value: 'INR', label: 'Indian Rupee (₹)' },
                  { value: 'JPY', label: 'Japanese Yen (¥)' },
                ]}
              />

              <Select
                label="Language"
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'hi', label: 'Hindi' },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
