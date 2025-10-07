import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { name: 'Assets', href: '/assets', icon: Package, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { name: 'Users', href: '/users', icon: Users, roles: [UserRole.ADMIN, UserRole.HR] },
    { name: 'Allocations', href: '/allocations', icon: UserCheck, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.HR] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div>
              <h1 className="text-xl font-bold text-secondary-900">
                Triostack
              </h1>
              <p className="text-sm text-secondary-600">Asset Manager</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-secondary-500 truncate">
                    {user.role === UserRole.ADMIN ? 'Administrator' :
                     user.role === UserRole.HR ? 'HR Manager' : 'Employee'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
