import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/context/AuthContext';
import { Asset, AssetFilters, AssetType, AssetStatus, UserRole } from '@/types';
import { formatDate, formatAssetType, formatAssetStatus, getAssetStatusColor } from '@/utils/formatters';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AssetsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AssetFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: assetsData, isLoading } = useAssets(filters);

  const handleSort = (key: keyof Asset, order: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy: key as string,
      sortOrder: order,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof AssetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const columns = [
    {
      key: 'name' as keyof Asset,
      label: 'Name',
      sortable: true,
      render: (value: string, row: Asset) => (
        <div>
          <Link 
            href={`/assets/${row._id}`}
            className="font-medium text-primary-600 hover:text-primary-800"
          >
            {value}
          </Link>
          {row.serialNumber && (
            <p className="text-sm text-secondary-500">SN: {row.serialNumber}</p>
          )}
        </div>
      )
    },
    {
      key: 'type' as keyof Asset,
      label: 'Type',
      sortable: true,
      render: (value: AssetType) => (
        <Badge variant="primary">{formatAssetType(value)}</Badge>
      )
    },
    {
      key: 'category' as keyof Asset,
      label: 'Category',
      sortable: true
    },
    {
      key: 'status' as keyof Asset,
      label: 'Status',
      sortable: true,
      render: (value: AssetStatus) => (
        <Badge className={getAssetStatusColor(value)}>
          {formatAssetStatus(value)}
        </Badge>
      )
    },
    {
      key: 'assignedTo' as keyof Asset,
      label: 'Assigned To',
      render: (value: any) => (
        value ? (
          <div>
            <p className="font-medium">{value.name}</p>
            <p className="text-sm text-secondary-500">{value.department}</p>
          </div>
        ) : (
          <span className="text-secondary-500">Unassigned</span>
        )
      )
    },
    {
      key: 'expiryDate' as keyof Asset,
      label: 'Expiry Date',
      sortable: true,
      render: (value: string) => (
        value ? formatDate(value) : <span className="text-secondary-500">No expiry</span>
      )
    },
    {
      key: 'createdAt' as keyof Asset,
      label: 'Created',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const canCreateAsset = user?.role === UserRole.ADMIN || user?.role === UserRole.HR;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Assets</h1>
            <p className="text-secondary-600">
              Manage and track all company assets
            </p>
          </div>
          {canCreateAsset && (
            <Link href="/assets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <Select
                placeholder="All Types"
                options={[
                  { value: '', label: 'All Types' },
                  { value: AssetType.HARDWARE, label: 'Hardware' },
                  { value: AssetType.SOFTWARE, label: 'Software' },
                  { value: AssetType.DOMAIN, label: 'Domain' },
                  { value: AssetType.HOSTING, label: 'Hosting' },
                ]}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              />
              
              <Select
                placeholder="All Status"
                options={[
                  { value: '', label: 'All Status' },
                  { value: AssetStatus.AVAILABLE, label: 'Available' },
                  { value: AssetStatus.ASSIGNED, label: 'Assigned' },
                  { value: AssetStatus.EXPIRED, label: 'Expired' },
                ]}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              />
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Assets Table */}
        <Card>
          <Table
            data={assetsData?.data || []}
            columns={columns}
            loading={isLoading}
            pagination={assetsData?.pagination ? {
              page: assetsData.pagination.page,
              limit: assetsData.pagination.limit,
              total: assetsData.pagination.total,
              onPageChange: handlePageChange
            } : undefined}
            onSort={handleSort}
            sortBy={filters.sortBy as keyof Asset}
            sortOrder={filters.sortOrder}
          />
        </Card>
      </div>
    </Layout>
  );
}
