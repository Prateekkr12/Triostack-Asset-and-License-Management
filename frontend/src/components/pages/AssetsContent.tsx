import { useState, useEffect } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { useAssetNotifications } from '@/hooks/useAssetNotifications';
import assetExpiryService from '@/services/assetExpiryService';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatDate, getAssetStatusColor, formatAssetType, formatAssetStatus, getAssetClassification, formatAssetClassification, getAssetClassificationColor } from '@/utils/formatters';
import { AssetType, AssetStatus, AssetClassification, Asset, TableColumn, AssetForm } from '@/types';

export default function AssetsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState<Partial<AssetForm>>({});
  const [dateValidationError, setDateValidationError] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');

  // Helper function to format date for HTML date input
  const formatDateForInput = (date: string | undefined): string => {
    if (!date) return '';
    // If it's already in yyyy-MM-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // If it's an ISO date, convert to yyyy-MM-dd
    if (date.includes('T')) return new Date(date).toISOString().split('T')[0];
    // Otherwise, try to parse and format
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Reset form function
  const resetForm = () => {
    setAssetForm({});
    setDateValidationError('');
    setUpdateError('');
  };

  // Handle date change with validation
  const handleDateChange = (field: 'purchaseDate' | 'expiryDate', value: string) => {
    setAssetForm({ ...assetForm, [field]: value });
    setDateValidationError(''); // Clear previous errors
    
    // Real-time validation
    if (field === 'purchaseDate' && assetForm.expiryDate) {
      const purchaseDate = new Date(value);
      const expiryDate = new Date(assetForm.expiryDate);
      
      if (expiryDate <= purchaseDate) {
        setDateValidationError('Expiry date must be after purchase date');
      }
    } else if (field === 'expiryDate' && assetForm.purchaseDate) {
      const purchaseDate = new Date(assetForm.purchaseDate);
      const expiryDate = new Date(value);
      
      if (expiryDate <= purchaseDate) {
        setDateValidationError('Expiry date must be after purchase date');
      }
    }
  };

  const { data: assetsData, isLoading } = useAssets({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter as AssetStatus : undefined,
    type: typeFilter !== 'all' ? typeFilter as AssetType : undefined,
    classification: classificationFilter !== 'all' ? classificationFilter as AssetClassification : undefined,
  });

  const assets = assetsData?.data || [];
  const totalPages = assetsData?.pagination?.totalPages || 0;

  // Start checking for expiring assets when assets are loaded
  useEffect(() => {
    if (assets.length > 0) {
      assetExpiryService.startChecking(assets, 60); // Check every 60 minutes
    }

    return () => {
      assetExpiryService.stopChecking();
    };
  }, [assets]);

  // Mutations
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();
  
  // Notifications
  const { 
    notifyAssetCreated, 
    notifyAssetUpdated, 
    notifyAssetDeleted 
  } = useAssetNotifications();

  // Handlers
  const handleCreateAsset = async () => {
    // Validate required fields
    if (!assetForm.name?.trim()) {
      alert('Please enter an asset name');
      return;
    }
    if (!assetForm.type || assetForm.type.trim() === '') {
      alert('Please select an asset type');
      return;
    }
    if (!assetForm.category?.trim()) {
      alert('Please enter a category');
      return;
    }
    
    // Validate dates
    if (assetForm.purchaseDate && assetForm.expiryDate) {
      const purchaseDate = new Date(assetForm.purchaseDate);
      const expiryDate = new Date(assetForm.expiryDate);
      
      if (expiryDate <= purchaseDate) {
        alert('Expiry date must be after purchase date');
        return;
      }
    }
    
    // Debug: Log the form data before processing
    console.log('Form data before processing:', assetForm);
    
    // Ensure purchase date is provided (required by backend) and convert to ISO format
    const formData = {
      ...assetForm,
      purchaseDate: assetForm.purchaseDate ? new Date(assetForm.purchaseDate).toISOString() : new Date().toISOString(),
      expiryDate: assetForm.expiryDate ? new Date(assetForm.expiryDate).toISOString() : undefined
    };
    
    console.log('Form data after processing:', formData);
    
    try {
      const createdAsset = await createAssetMutation.mutateAsync(formData as AssetForm);
      setShowAddModal(false);
      resetForm();
      
      // Notify about asset creation
      if (createdAsset?.name) {
        notifyAssetCreated(createdAsset.name);
      }
    } catch (error) {
      console.error('Asset creation error:', error);
      // Error is handled by the mutation
    }
  };

  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;
    
    // Validate required fields
    if (!assetForm.name?.trim()) {
      alert('Please enter an asset name');
      return;
    }
    if (!assetForm.type || assetForm.type.trim() === '') {
      alert('Please select an asset type');
      return;
    }
    if (!assetForm.category?.trim()) {
      alert('Please enter a category');
      return;
    }
    
    // Validate dates
    if (assetForm.purchaseDate && assetForm.expiryDate) {
      const purchaseDate = new Date(assetForm.purchaseDate);
      const expiryDate = new Date(assetForm.expiryDate);
      
      if (expiryDate <= purchaseDate) {
        alert('Expiry date must be after purchase date');
        return;
      }
    }
    
    // Convert dates to ISO format for backend
    // Always include both dates when updating to ensure proper validation
    const formData: Partial<AssetForm> = {
      name: assetForm.name,
      type: assetForm.type,
      category: assetForm.category,
      serialNumber: assetForm.serialNumber,
      cost: assetForm.cost,
      vendor: assetForm.vendor,
      description: assetForm.description,
      // Always include both dates for proper validation
      purchaseDate: assetForm.purchaseDate ? new Date(assetForm.purchaseDate).toISOString() : selectedAsset.purchaseDate,
      expiryDate: assetForm.expiryDate ? new Date(assetForm.expiryDate).toISOString() : selectedAsset.expiryDate
    };
    
    console.log('Updating asset with data:', formData);
    console.log('Selected asset dates:', {
      purchaseDate: selectedAsset.purchaseDate,
      expiryDate: selectedAsset.expiryDate
    });
    console.log('Form dates:', {
      purchaseDate: assetForm.purchaseDate,
      expiryDate: assetForm.expiryDate
    });
    
    try {
      const updatedAsset = await updateAssetMutation.mutateAsync({ id: selectedAsset._id, data: formData });
      setShowEditModal(false);
      setSelectedAsset(null);
      resetForm();
      
      // Notify about asset update
      if (updatedAsset?.name) {
        notifyAssetUpdated(updatedAsset.name);
      }
    } catch (error: any) {
      console.error('Asset update error:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update asset. Please try again.');
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (window.confirm(`Are you sure you want to delete ${asset.name}?`)) {
      try {
        await deleteAssetMutation.mutateAsync(asset._id);
        
        // Notify about asset deletion
        notifyAssetDeleted(asset.name);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetForm({
      name: asset.name,
      serialNumber: asset.serialNumber,
      type: asset.type,
      category: asset.category,
      cost: asset.cost,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      expiryDate: asset.expiryDate ? new Date(asset.expiryDate).toISOString().split('T')[0] : '',
    });
    setUpdateError(''); // Clear any previous errors
    setShowEditModal(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowViewModal(true);
  };

  const columns: TableColumn<Asset>[] = [
    {
      key: 'name',
      label: 'Asset Name',
      render: (value, asset) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-900">{asset.name}</p>
            <p className="text-sm text-secondary-500">{asset.serialNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, asset) => (
        <Badge variant="secondary">
          {formatAssetType(asset.type)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, asset) => (
        <Badge 
          variant="secondary"
          className={getAssetStatusColor(asset.status)}
        >
          {formatAssetStatus(asset.status)}
        </Badge>
      ),
    },
    {
      key: 'vendor',
      label: 'Classification',
      render: (value, asset) => {
        const classification = getAssetClassification(asset.purchaseDate, asset.expiryDate, asset.status);
        return (
          <Badge 
            variant="secondary"
            className={getAssetClassificationColor(classification)}
          >
            {formatAssetClassification(classification)}
          </Badge>
        );
      },
    },
    {
      key: 'purchaseDate',
      label: 'Purchase Date',
      render: (value, asset) => {
        if (!asset.purchaseDate) return 'N/A';
        return formatDate(asset.purchaseDate);
      },
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (value, asset) => {
        if (!asset.expiryDate) return 'N/A';
        return formatDate(asset.expiryDate);
      },
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (value, asset) => {
        if (!asset.cost) return 'N/A';
        return formatCurrency(asset.cost);
      },
    },
    {
      key: '_id',
      label: 'Actions',
      render: (value, asset) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewAsset(asset)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="View Asset"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleEditAsset(asset)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="Edit Asset"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDeleteAsset(asset)}
            className="p-1 text-red-400 hover:text-red-600"
            title="Delete Asset"
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
          <h1 className="text-2xl font-bold text-secondary-900">Assets</h1>
          <p className="text-secondary-600 mt-1">Manage all assets in your organization</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Classification Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Assets', count: assets.length },
              { id: AssetClassification.UPCOMING, label: 'Upcoming Assets', count: assets.filter(asset => getAssetClassification(asset.purchaseDate, asset.expiryDate, asset.status) === AssetClassification.UPCOMING).length },
              { id: AssetClassification.ONGOING, label: 'Ongoing Assets', count: assets.filter(asset => getAssetClassification(asset.purchaseDate, asset.expiryDate, asset.status) === AssetClassification.ONGOING).length },
              { id: AssetClassification.EXPIRED, label: 'Expired Assets', count: assets.filter(asset => getAssetClassification(asset.purchaseDate, asset.expiryDate, asset.status) === AssetClassification.EXPIRED).length },
            ]}
            activeTab={classificationFilter}
            onTabChange={(tabId) => {
              setClassificationFilter(tabId);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

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
                  placeholder="Search assets..."
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
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="license">License</option>
              <option value="equipment">Equipment</option>
              <option value="vehicle">Vehicle</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={assets}
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

      {/* Add Asset Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Asset"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Asset Name"
            placeholder="Enter asset name"
            value={assetForm.name || ''}
            onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
          />
          <Input
            label="Serial Number"
            placeholder="Enter serial number"
            value={assetForm.serialNumber || ''}
            onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
          />
          <Select
            label="Asset Type"
            placeholder="Select Asset Type"
            value={assetForm.type || ''}
            onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value as AssetType })}
            options={[
              { value: 'hardware', label: 'Hardware' },
              { value: 'software', label: 'Software' },
              { value: 'license', label: 'License' },
              { value: 'equipment', label: 'Equipment' },
              { value: 'vehicle', label: 'Vehicle' },
              { value: 'domain', label: 'Domain' },
              { value: 'hosting', label: 'Hosting' },
            ]}
          />
          <Input
            label="Category"
            placeholder="Enter asset category"
            value={assetForm.category || ''}
            onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
          />
          <Input
            label="Cost"
            type="number"
            placeholder="Enter cost"
            value={assetForm.cost || ''}
            onChange={(e) => setAssetForm({ ...assetForm, cost: parseFloat(e.target.value) })}
          />
          <Input
            label="Purchase Date"
            type="date"
            value={formatDateForInput(assetForm.purchaseDate)}
            onChange={(e) => handleDateChange('purchaseDate', e.target.value)}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={formatDateForInput(assetForm.expiryDate)}
            onChange={(e) => handleDateChange('expiryDate', e.target.value)}
          />
          {dateValidationError && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md border border-red-200">
              {dateValidationError}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAsset}
              loading={createAssetMutation.isPending}
            >
              Add Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Asset"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Asset Name"
            placeholder="Enter asset name"
            value={assetForm.name || ''}
            onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
          />
          <Input
            label="Serial Number"
            placeholder="Enter serial number"
            value={assetForm.serialNumber || ''}
            onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
          />
          <Select
            label="Asset Type"
            placeholder="Select Asset Type"
            value={assetForm.type || ''}
            onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value as AssetType })}
            options={[
              { value: 'hardware', label: 'Hardware' },
              { value: 'software', label: 'Software' },
              { value: 'license', label: 'License' },
              { value: 'equipment', label: 'Equipment' },
              { value: 'vehicle', label: 'Vehicle' },
              { value: 'domain', label: 'Domain' },
              { value: 'hosting', label: 'Hosting' },
            ]}
          />
          <Input
            label="Category"
            placeholder="Enter asset category"
            value={assetForm.category || ''}
            onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
          />
          <Input
            label="Cost"
            type="number"
            placeholder="Enter cost"
            value={assetForm.cost || ''}
            onChange={(e) => setAssetForm({ ...assetForm, cost: parseFloat(e.target.value) })}
          />
          <Input
            label="Purchase Date"
            type="date"
            value={formatDateForInput(assetForm.purchaseDate)}
            onChange={(e) => handleDateChange('purchaseDate', e.target.value)}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={formatDateForInput(assetForm.expiryDate)}
            onChange={(e) => handleDateChange('expiryDate', e.target.value)}
          />
          {dateValidationError && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md border border-red-200">
              {dateValidationError}
            </div>
          )}
          {updateError && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md border border-red-200">
              {updateError}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAsset}
              loading={updateAssetMutation.isPending}
            >
              Update Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Asset Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Asset Details"
        size="lg"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                <p className="text-secondary-900">{selectedAsset.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Serial Number</label>
                <p className="text-secondary-900">{selectedAsset.serialNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Type</label>
                <p className="text-secondary-900">{formatAssetType(selectedAsset.type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
                <Badge 
                  variant="secondary"
                  className={getAssetStatusColor(selectedAsset.status)}
                >
                  {formatAssetStatus(selectedAsset.status)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Cost</label>
                <p className="text-secondary-900">{selectedAsset.cost ? formatCurrency(selectedAsset.cost) : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Purchase Date</label>
                <p className="text-secondary-900">{formatDate(selectedAsset.purchaseDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Expiry Date</label>
                <p className="text-secondary-900">{selectedAsset.expiryDate ? formatDate(selectedAsset.expiryDate) : 'N/A'}</p>
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
