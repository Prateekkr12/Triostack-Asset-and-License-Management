import React from 'react';
import { useRouter } from 'next/router';
import { Package, Users, UserCheck, Search, X } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

const iconMap = {
  Package,
  Users,
  UserCheck,
};

export default function SearchResults() {
  const { 
    searchTerm, 
    searchResults, 
    isSearching, 
    showSearchResults, 
    setShowSearchResults,
    clearSearch 
  } = useSearch();
  const router = useRouter();

  const handleResultClick = (url: string) => {
    setShowSearchResults(false);
    router.push(url);
  };

  if (!showSearchResults || !searchTerm) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-secondary-700">
            Search Results for "{searchTerm}"
          </span>
          <button
            onClick={clearSearch}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isSearching ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-secondary-600 mt-2">Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="py-2">
          {searchResults.map((result) => {
            const IconComponent = iconMap[result.icon as keyof typeof iconMap] || Search;
            return (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.url)}
                className="w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-sm text-secondary-500 truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {result.type}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center">
          <Search className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-sm text-secondary-600">No results found</p>
          <p className="text-xs text-secondary-500 mt-1">
            Try searching for assets, users, or allocations
          </p>
        </div>
      )}
    </div>
  );
}
