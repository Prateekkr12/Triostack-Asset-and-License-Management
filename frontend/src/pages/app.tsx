import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import { useNotifications } from '@/context/NotificationContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings,
  Bell, 
  Search 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import SearchResults from '@/components/ui/SearchResults';
import NotificationDropdown from '@/components/ui/NotificationDropdown';

// Import page components
import DashboardContent from '@/components/pages/DashboardContent';
import AssetsContent from '@/components/pages/AssetsContent';
import UsersContent from '@/components/pages/UsersContent';
import AllocationsContent from '@/components/pages/AllocationsContent';
import ReportsContent from '@/components/pages/ReportsContent';
import SettingsContent from '@/components/pages/SettingsContent';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  adminOnly?: boolean;
  hrOnly?: boolean;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: DashboardContent,
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Package,
    component: AssetsContent,
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    component: UsersContent,
    adminOnly: true,
  },
  {
    id: 'allocations',
    label: 'Allocations',
    icon: UserCheck,
    component: AllocationsContent,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    component: ReportsContent,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    component: SettingsContent,
    adminOnly: true,
  },
];

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { searchTerm, setSearchTerm, showSearchResults, setShowSearchResults } = useSearch();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle URL tab parameter
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [router.query]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter tabs based on user role
  const availableTabs = tabs.filter(tab => {
    if (tab.adminOnly && user.role !== 'admin') return false;
    if (tab.hrOnly && !['admin', 'hr'].includes(user.role)) return false;
    return true;
  });

  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component || DashboardContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-secondary-200 shadow-sm">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-secondary-900">
                Triostack Asset Manager
              </h1>
              
              {/* Tabs */}
              <nav className="flex space-x-1">
                {availableTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        router.push(`/app?tab=${tab.id}`, undefined, { shallow: true });
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden sm:block" ref={searchRef}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search assets, users, allocations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    className="block w-64 pl-10 pr-3 py-2 border border-secondary-300 rounded-lg text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <SearchResults />
                </div>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>

              {/* User profile */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                    <p className="text-xs text-secondary-500">{user.department}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={activeTab === 'dashboard' ? '' : 'p-4 sm:p-6'}>
        <ActiveComponent />
      </main>
    </div>
  );
}
