import { useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { Menu, Bell, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Don't show layout on auth pages
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="hidden lg:block">
                <h1 className="text-2xl font-semibold text-secondary-900">
                  {getPageTitle(router.pathname)}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg">
                <Bell className="h-6 w-6" />
              </button>

              {/* User menu */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-secondary-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {user.department}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="p-4 sm:p-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/assets': 'Assets',
    '/users': 'Users',
    '/allocations': 'Allocations',
    '/reports': 'Reports',
    '/settings': 'Settings',
  };

  return titles[pathname] || 'Dashboard';
}

export default Layout;
