import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAllocations, useCreateAllocation, useUpdateAllocation, useDeleteAllocation, useReturnAsset } from '@/hooks/useAllocations';
import { useAssets } from '@/hooks/useAssets';
import { useUsers } from '@/hooks/useUsers';
import { 
  Plus, 
  UserCheck, 
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Package,
  Users
} from 'lucide-react';
import { Allocation, AllocationForm, TableColumn, AllocationStatus } from '@/types';
import { formatDate } from '@/utils/formatters';

export default function AllocationsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [allocationForm, setAllocationForm] = useState<Partial<AllocationForm>>({});

  const { data: allocationsData, isLoading } = useAllocations({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter as AllocationStatus : undefined,
  });

  const { data: assetsData } = useAssets({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });

  const allocations = allocationsData?.data || [];
  const totalPages = allocationsData?.pagination?.totalPages || 0;
  const assets = assetsData?.data || [];
  const users = usersData?.data || [];

  // Mutations
  const createAllocationMutation = useCreateAllocation();
  const updateAllocationMutation = useUpdateAllocation();
  const deleteAllocationMutation = useDeleteAllocation();
  const returnAssetMutation = useReturnAsset();

  // Handlers
  const handleCreateAllocation = async () => {
    try {
      await createAllocationMutation.mutateAsync(allocationForm as AllocationForm);
      setShowAddModal(false);
      setAllocationForm({});
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleUpdateAllocation = async () => {
    if (!selectedAllocation) return;
    try {
      await updateAllocationMutation.mutateAsync({ id: selectedAllocation._id, data: allocationForm });
      setShowEditModal(false);
      setSelectedAllocation(null);
      setAllocationForm({});
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteAllocation = async (allocation: Allocation) => {
    if (window.confirm(`Are you sure you want to delete this allocation?`)) {
      try {
        await deleteAllocationMutation.mutateAsync(allocation._id);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleReturnAsset = async (allocation: Allocation) => {
    if (window.confirm(`Are you sure you want to return this asset?`)) {
      try {
        await returnAssetMutation.mutateAsync(allocation._id);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleEditAllocation = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setAllocationForm({
      assetId: allocation.assetId._id,
      userId: allocation.userId._id,
      notes: allocation.notes,
    });
    setShowEditModal(true);
  };

  const handleViewAllocation = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setShowViewModal(true);
  };

  const getStatusColor = (status: AllocationStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: TableColumn<Allocation>[] = [
    {
      key: 'assetId',
      label: 'Asset',
      render: (value, allocation) => {
        const asset = allocation.assetId;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">{asset?.name || 'Unknown Asset'}</p>
              <p className="text-sm text-secondary-500">{asset?.serialNumber || 'N/A'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'userId',
      label: 'User',
      render: (value, allocation) => {
        const user = allocation.userId;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-secondary-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">{user?.name || 'Unknown User'}</p>
              <p className="text-sm text-secondary-500">{user?.department || 'N/A'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'allocationDate',
      label: 'Allocation Date',
      render: (value, allocation) => formatDate(allocation.allocationDate),
    },
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (value, allocation) => allocation.returnDate ? formatDate(allocation.returnDate) : 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, allocation) => (
        <Badge 
          variant="secondary"
          className={getStatusColor(allocation.status)}
        >
          {allocation.status.charAt(0).toUpperCase() + allocation.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (value, allocation) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewAllocation(allocation)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="View Allocation"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleEditAllocation(allocation)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="Edit Allocation"
          >
            <Edit className="h-4 w-4" />
          </button>
          {allocation.status === 'active' && (
            <button 
              onClick={() => handleReturnAsset(allocation)}
              className="p-1 text-green-400 hover:text-green-600"
              title="Return Asset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={() => handleDeleteAllocation(allocation)}
            className="p-1 text-red-400 hover:text-red-600"
            title="Delete Allocation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Allocations</h1>
          <p className="text-secondary-600 mt-1">Manage asset allocations and assignments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Allocation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search allocations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={allocations}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Allocation Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Allocation"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Select Asset"
            value={allocationForm.assetId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, assetId: e.target.value })}
            options={assets.map(asset => ({
              value: asset._id,
              label: `${asset.name} - ${asset.serialNumber}`
            }))}
          />
          <Select
            label="Select User"
            value={allocationForm.userId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, userId: e.target.value })}
            options={users.map(user => ({
              value: user._id,
              label: `${user.name} (${user.department})`
            }))}
          />
          <Input
            label="Notes"
            placeholder="Enter any notes (optional)"
            value={allocationForm.notes || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAllocation}
              loading={createAllocationMutation.isPending}
            >
              Create Allocation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Allocation Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Allocation"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Select Asset"
            value={allocationForm.assetId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, assetId: e.target.value })}
            options={assets.map(asset => ({
              value: asset._id,
              label: `${asset.name} - ${asset.serialNumber}`
            }))}
          />
          <Select
            label="Select User"
            value={allocationForm.userId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, userId: e.target.value })}
            options={users.map(user => ({
              value: user._id,
              label: `${user.name} (${user.department})`
            }))}
          />
          <Input
            label="Notes"
            placeholder="Enter any notes (optional)"
            value={allocationForm.notes || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAllocation}
              loading={updateAllocationMutation.isPending}
            >
              Update Allocation
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Allocation Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Allocation Details"
        size="lg"
      >
        {selectedAllocation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Asset</label>
                <p className="text-secondary-900">
                  {selectedAllocation.assetId.name || 'Unknown Asset'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">User</label>
                <p className="text-secondary-900">
                  {selectedAllocation.userId.name || 'Unknown User'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Assigned Date</label>
                <p className="text-secondary-900">{formatDate(selectedAllocation.allocationDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Expected Return</label>
                <p className="text-secondary-900">
                  {selectedAllocation.returnDate ? formatDate(selectedAllocation.returnDate) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
                <Badge 
                  variant="secondary"
                  className={getStatusColor(selectedAllocation.status)}
                >
                  {selectedAllocation.status.charAt(0).toUpperCase() + selectedAllocation.status.slice(1)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
                <p className="text-secondary-900">{selectedAllocation.notes || 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
