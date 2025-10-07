import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAssets } from '@/hooks/useAssets';
import { useUsers } from '@/hooks/useUsers';
import { useAllocations } from '@/hooks/useAllocations';

interface SearchResult {
  id: string;
  type: 'asset' | 'user' | 'allocation';
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  performSearch: (term: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const router = useRouter();

  // Fetch data for search
  const { data: assetsData } = useAssets({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: allocationsData } = useAllocations({ limit: 100 });

  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];

    // Search assets
    if (assetsData?.data) {
      assetsData.data
        .filter(asset => 
          asset.name?.toLowerCase().includes(term.toLowerCase()) ||
          asset.serialNumber?.toLowerCase().includes(term.toLowerCase()) ||
          asset.type?.toLowerCase().includes(term.toLowerCase())
        )
        .forEach(asset => {
          results.push({
            id: asset._id,
            type: 'asset',
            title: asset.name || 'Unnamed Asset',
            subtitle: `${asset.serialNumber || 'No Serial'} • ${asset.type || 'Unknown Type'}`,
            url: '/app?tab=assets',
            icon: 'Package'
          });
        });
    }

    // Search users
    if (usersData?.data) {
      usersData.data
        .filter(user => 
          user.name?.toLowerCase().includes(term.toLowerCase()) ||
          user.email?.toLowerCase().includes(term.toLowerCase()) ||
          user.department?.toLowerCase().includes(term.toLowerCase())
        )
        .forEach(user => {
          results.push({
            id: user._id,
            type: 'user',
            title: user.name || 'Unnamed User',
            subtitle: `${user.email || 'No Email'} • ${user.department || 'No Department'}`,
            url: '/app?tab=users',
            icon: 'Users'
          });
        });
    }

    // Search allocations
    if (allocationsData?.data) {
      allocationsData.data
        .filter(allocation => {
          const asset = allocation.assetId;
          const user = allocation.userId;
          return (
            asset?.name?.toLowerCase().includes(term.toLowerCase()) ||
            user?.name?.toLowerCase().includes(term.toLowerCase()) ||
            allocation.status?.toLowerCase().includes(term.toLowerCase())
          );
        })
        .forEach(allocation => {
          const asset = allocation.assetId;
          const user = allocation.userId;
          results.push({
            id: allocation._id,
            type: 'allocation',
            title: `${asset?.name || 'Unknown Asset'} → ${user?.name || 'Unknown User'}`,
            subtitle: `Status: ${allocation.status || 'Unknown'}`,
            url: '/app?tab=allocations',
            icon: 'UserCheck'
          });
        });
    }

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setShowSearchResults(true);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const value: SearchContextType = {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    performSearch,
    clearSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
