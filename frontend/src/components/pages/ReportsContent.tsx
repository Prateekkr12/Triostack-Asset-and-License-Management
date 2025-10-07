import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  UserCheck,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAssetStats, useExpiredAssets } from '@/hooks/useAssets';
import { useUserStats } from '@/hooks/useUsers';
import { useAllocationStats } from '@/hooks/useAllocations';
import { useAssets } from '@/hooks/useAssets';
import { useUsers } from '@/hooks/useUsers';
import { useAllocations } from '@/hooks/useAllocations';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ReportData {
  period: string;
  assets: number;
  users: number;
  allocations: number;
  value: number;
}

export default function ReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch data for reports
  const { data: assetStats } = useAssetStats();
  const { data: userStats } = useUserStats();
  const { data: allocationStats } = useAllocationStats();
  const { data: assetsData } = useAssets({ limit: 1000 });
  const { data: usersData } = useUsers({ limit: 1000 });
  const { data: allocationsData } = useAllocations({ limit: 1000 });
  const { data: expiredAssets } = useExpiredAssets();

  const assets = assetsData?.data || [];
  const users = usersData?.data || [];
  const allocations = allocationsData?.data || [];

  // Calculate report data
  const calculateAssetValue = () => {
    return assets.reduce((total, asset) => {
      const price = typeof asset.cost === 'number' ? asset.cost : 0;
      return total + price;
    }, 0);
  };

  const getAssetTypeDistribution = () => {
    const distribution: { [key: string]: number } = {};
    assets.forEach(asset => {
      const type = asset.type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  };

  const getAssetStatusDistribution = () => {
    const distribution: { [key: string]: number } = {};
    assets.forEach(asset => {
      const status = asset.status || 'Unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  };

  const getUserRoleDistribution = () => {
    const distribution: { [key: string]: number } = {};
    users.forEach(user => {
      const role = user.role || 'Unknown';
      distribution[role] = (distribution[role] || 0) + 1;
    });
    return distribution;
  };

  const getAllocationStatusDistribution = () => {
    const distribution: { [key: string]: number } = {};
    allocations.forEach(allocation => {
      const status = allocation.status || 'Unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  };

  const getExpiringAssets = (days: number = 30) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return assets.filter(asset => {
      if (!asset.expiryDate) return false;
      const expiryDate = new Date(asset.expiryDate);
      return expiryDate <= futureDate && expiryDate >= now;
    });
  };

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // In a real implementation, this would generate and download a PDF/Excel report
    alert('Report generated successfully! (This would download a file in a real implementation)');
  };

  const assetTypeDistribution = getAssetTypeDistribution();
  const assetStatusDistribution = getAssetStatusDistribution();
  const userRoleDistribution = getUserRoleDistribution();
  const allocationStatusDistribution = getAllocationStatusDistribution();
  const expiringAssets = getExpiringAssets(parseInt(selectedPeriod));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reports & Analytics</h1>
          <p className="text-secondary-600 mt-1">Generate comprehensive reports and view analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' },
            ]}
          />
          <Button
            onClick={generateReport}
            loading={isGenerating}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Assets</p>
                <p className="text-2xl font-bold text-secondary-900">{assetStats?.totalAssets || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-secondary-600">
                Total Value: {formatCurrency(calculateAssetValue() || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Users</p>
                <p className="text-2xl font-bold text-secondary-900">{userStats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-secondary-600">
                Active: {userStats?.activeUsers || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Allocations</p>
                <p className="text-2xl font-bold text-secondary-900">{allocationStats?.activeAllocations || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-secondary-600">
                Total: {allocationStats?.totalAllocations || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Expiring Assets</p>
                <p className="text-2xl font-bold text-secondary-900">{expiringAssets.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-secondary-600">
                Next {selectedPeriod} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Expired Assets</p>
                <p className="text-2xl font-bold text-secondary-900">{expiredAssets?.length || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-secondary-600">
                Past expiry date
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Type Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Asset Types</h3>
            <div className="space-y-3">
              {Object.entries(assetTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 capitalize">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / assets.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Status Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Asset Status</h3>
            <div className="space-y-3">
              {Object.entries(assetStatusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / assets.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">User Roles</h3>
            <div className="space-y-3">
              {Object.entries(userRoleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 capitalize">{role}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / users.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Status Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Allocation Status</h3>
            <div className="space-y-3">
              {Object.entries(allocationStatusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600 capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${(count / allocations.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Assets Report */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Assets Expiring in Next {selectedPeriod} Days
          </h3>
          {expiringAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Days Until Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {expiringAssets.map((asset) => {
                    const daysUntilExpiry = Math.ceil((new Date(asset.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={asset._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {asset.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 capitalize">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatDate(asset.expiryDate!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            daysUntilExpiry <= 7 ? 'bg-red-100 text-red-800' :
                            daysUntilExpiry <= 14 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysUntilExpiry} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatCurrency(asset.cost || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No assets expiring in the next {selectedPeriod} days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Assets Report */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Expired Assets
          </h3>
          {expiredAssets && expiredAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Days Since Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {expiredAssets.map((asset) => {
                    const daysSinceExpiry = Math.ceil((new Date().getTime() - new Date(asset.expiryDate!).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={asset._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {asset.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 capitalize">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatDate(asset.expiryDate!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {daysSinceExpiry} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatCurrency(asset.cost || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No expired assets found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}