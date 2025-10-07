import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableColumn } from '@/types';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

function Table<T>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  sortBy,
  sortOrder,
  className,
}: TableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const getTotalPages = () => {
    if (!pagination) return 0;
    return Math.ceil(pagination.total / pagination.limit);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const totalPages = getTotalPages();
    const currentPage = pagination.page;

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-secondary-200 bg-secondary-50">
        <div className="text-sm text-secondary-700">
          Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
          {pagination.total} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => pagination.onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={cn(
                    'px-3 py-1 text-sm border rounded-md',
                    pageNum === currentPage
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-secondary-300 hover:bg-secondary-50'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => pagination.onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-secondary-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-secondary-100 select-none'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'h-3 w-3',
                            sortBy === column.key && sortOrder === 'asc'
                              ? 'text-primary-600'
                              : 'text-secondary-400'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'h-3 w-3 -mt-1',
                            sortBy === column.key && sortOrder === 'desc'
                              ? 'text-primary-600'
                              : 'text-secondary-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-secondary-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-secondary-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
}

export default Table;
