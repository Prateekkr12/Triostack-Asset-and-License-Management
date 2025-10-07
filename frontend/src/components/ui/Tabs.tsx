import React from 'react';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn('border-b border-secondary-200', className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-secondary-100 text-secondary-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
