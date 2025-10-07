import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AnimatedCard from '@/components/ui/AnimatedCard';
import GradientBackground from '@/components/ui/GradientBackground';
import StatCard from '@/components/ui/StatCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ModernGrid from '@/components/ui/ModernGrid';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useAssetStats, useExpiringAssets, useCreateAsset } from '@/hooks/useAssets';
import { useUserStats, useCreateUser } from '@/hooks/useUsers';
import { useAllocationStats, useCreateAllocation } from '@/hooks/useAllocations';
import { 
  Package, 
  Users, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  BarChart3,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { formatCurrency, formatDate, getExpiryStatus, getExpiryStatusColor, getDaysUntilExpiry } from '@/utils/formatters';
import { AssetType, AssetStatus, UserRole, AssetForm, UserForm, AllocationForm } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: assetStats, isLoading: assetStatsLoading } = useAssetStats();
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: allocationStats, isLoading: allocationStatsLoading } = useAllocationStats();
  const { data: expiringAssets, isLoading: expiringAssetsLoading } = useExpiringAssets(30);

  // Modal states
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignAssetModal, setShowAssignAssetModal] = useState(false);

  // Form states
  const [assetForm, setAssetForm] = useState<Partial<AssetForm>>({});
  const [userForm, setUserForm] = useState<Partial<UserForm>>({});
  const [allocationForm, setAllocationForm] = useState<Partial<AllocationForm>>({});

  // Mutations
  const createAssetMutation = useCreateAsset();
  const createUserMutation = useCreateUser();
  const createAllocationMutation = useCreateAllocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return {
          title: 'Administrator Dashboard',
          description: 'Manage all assets, users, and system settings',
        };
      case UserRole.HR:
        return {
          title: 'HR Manager Dashboard',
          description: 'Manage asset allocations and user assignments',
        };
      default:
        return {
          title: 'Employee Dashboard',
          description: 'View your assigned assets and allocation history',
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  // Form handlers
  const handleCreateAsset = async () => {
    try {
      await createAssetMutation.mutateAsync(assetForm as AssetForm);
      setShowAddAssetModal(false);
      setAssetForm({});
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync(userForm as UserForm);
      setShowAddUserModal(false);
      setUserForm({});
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCreateAllocation = async () => {
    try {
      await createAllocationMutation.mutateAsync(allocationForm as AllocationForm);
      setShowAssignAssetModal(false);
      setAllocationForm({});
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <>
      <GradientBackground variant="primary" intensity="light" className="min-h-screen">
        <ParticleBackground particleCount={30} speed={0.3} />
        
        <div className="relative z-10 space-y-8 p-6">
        {/* Modern Welcome Section */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <div className="relative z-10">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div>
                <motion.h1 
                  className="text-3xl font-bold mb-2"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                >
                  {getGreeting()}, {user?.name}! 👋
                </motion.h1>
                <motion.p 
                  className="text-xl text-primary-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {roleContent.description}
                </motion.p>
              </div>
              
              <motion.div
                className="hidden md:block"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Modern Stats Grid */}
        <ModernGrid columns={4} gap="lg" stagger={true} delay={0.2}>
          <StatCard
            title="Total Assets"
            value={assetStatsLoading ? '...' : assetStats?.totalAssets || 0}
            icon={Package}
            color="primary"
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <StatCard
            title="Available"
            value={assetStatsLoading ? '...' : assetStats?.availableAssets || 0}
            icon={CheckCircle}
            color="success"
            trend={{ value: 8, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Total Users"
            value={userStatsLoading ? '...' : userStats?.totalUsers || 0}
            icon={Users}
            color="secondary"
            trend={{ value: 5, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Active Allocations"
            value={allocationStatsLoading ? '...' : allocationStats?.activeAllocations || 0}
            icon={UserCheck}
            color="warning"
            trend={{ value: 3, isPositive: false }}
            delay={0.3}
          />
        </ModernGrid>

        {/* Modern Content Grid */}
        <ModernGrid columns={2} gap="lg" stagger={true} delay={0.4}>
          {/* Expiring Assets Card */}
          <AnimatedCard
            gradient={true}
            hover={true}
            delay={0.4}
            className="h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h3 
                className="text-2xl font-bold text-secondary-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                Expiring Assets
              </motion.h3>
              <motion.div
                className="p-3 bg-warning-100 rounded-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </motion.div>
            </div>
            
            {expiringAssetsLoading ? (
              <div className="text-center py-8">
                <motion.div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : expiringAssets && expiringAssets.length > 0 ? (
              <div className="space-y-4">
                {expiringAssets.slice(0, 5).map((asset, index) => (
                  <motion.div
                    key={asset._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-white rounded-xl border border-secondary-200/50 hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-semibold text-secondary-900">{asset.name}</p>
                      <p className="text-sm text-secondary-600">
                        Expires: {asset.expiryDate ? formatDate(asset.expiryDate) : 'N/A'}
                      </p>
                    </div>
                    <motion.span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${asset.expiryDate ? getExpiryStatusColor(getExpiryStatus(asset.expiryDate)) : 'text-secondary-600 bg-secondary-50'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {asset.expiryDate ? `${getDaysUntilExpiry(asset.expiryDate)} days` : 'N/A'}
                    </motion.span>
                  </motion.div>
                ))}
                {expiringAssets.length > 5 && (
                  <motion.p 
                    className="text-sm text-secondary-500 text-center py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    +{expiringAssets.length - 5} more assets expiring soon
                  </motion.p>
                )}
              </div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
                <p className="text-secondary-500 text-lg">
                  No assets expiring in the next 30 days
                </p>
              </motion.div>
            )}
          </AnimatedCard>

          {/* Quick Actions Card */}
          <AnimatedCard
            gradient={true}
            hover={true}
            delay={0.5}
            className="h-full"
          >
            <motion.h3 
              className="text-2xl font-bold text-secondary-900 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              Quick Actions
            </motion.h3>
            
            <div className="space-y-4">
              {user?.role === UserRole.ADMIN && (
                <>
                  <motion.button 
                    onClick={() => setShowAddAssetModal(true)}
                    className="w-full group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl transition-all duration-200 border border-primary-200/50">
                      <div className="p-2 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-primary-900">Add New Asset</span>
                      <Plus className="h-4 w-4 text-primary-600 ml-auto" />
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setShowAddUserModal(true)}
                    className="w-full group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-success-50 to-success-100 hover:from-success-100 hover:to-success-200 rounded-xl transition-all duration-200 border border-success-200/50">
                      <div className="p-2 bg-success-600 rounded-lg group-hover:bg-success-700 transition-colors">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-success-900">Add New User</span>
                      <Plus className="h-4 w-4 text-success-600 ml-auto" />
                    </div>
                  </motion.button>
                </>
              )}
              
              <motion.button 
                onClick={() => setShowAssignAssetModal(true)}
                className="w-full group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: user?.role === UserRole.ADMIN ? 1.1 : 0.9 }}
              >
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-warning-50 to-warning-100 hover:from-warning-100 hover:to-warning-200 rounded-xl transition-all duration-200 border border-warning-200/50">
                  <div className="p-2 bg-warning-600 rounded-lg group-hover:bg-warning-700 transition-colors">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-warning-900">Assign Asset</span>
                  <Zap className="h-4 w-4 text-warning-600 ml-auto" />
                </div>
              </motion.button>
              
              <motion.button 
                onClick={() => router.push('/app?tab=reports')}
                className="w-full group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: user?.role === UserRole.ADMIN ? 1.2 : 1.0 }}
              >
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 hover:from-secondary-100 hover:to-secondary-200 rounded-xl transition-all duration-200 border border-secondary-200/50">
                  <div className="p-2 bg-secondary-600 rounded-lg group-hover:bg-secondary-700 transition-colors">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-secondary-900">View Reports</span>
                  <TrendingUp className="h-4 w-4 text-secondary-600 ml-auto" />
                </div>
              </motion.button>
            </div>
          </AnimatedCard>
        </ModernGrid>
      </div>
    </GradientBackground>

    {/* Add Asset Modal */}
    <Modal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
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
            ]}
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
            value={assetForm.purchaseDate || ''}
            onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={assetForm.expiryDate || ''}
            onChange={(e) => setAssetForm({ ...assetForm, expiryDate: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <AnimatedButton
              variant="ghost"
              onClick={() => setShowAddAssetModal(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleCreateAsset}
              loading={createAssetMutation.isPending}
              gradient={true}
              glow={true}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Asset
            </AnimatedButton>
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={userForm.name || ''}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={userForm.email || ''}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={userForm.password || ''}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          <Select
            label="Role"
            value={userForm.role || ''}
            onChange={(value) => setUserForm({ ...userForm, role: value as any })}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'hr', label: 'HR' },
              { value: 'employee', label: 'Employee' },
            ]}
          />
          <Input
            label="Department"
            placeholder="Enter department"
            value={userForm.department || ''}
            onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <AnimatedButton
              variant="ghost"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleCreateUser}
              loading={createUserMutation.isPending}
              gradient={true}
              glow={true}
              icon={<Users className="w-4 h-4" />}
            >
              Add User
            </AnimatedButton>
          </div>
        </div>
      </Modal>

      {/* Assign Asset Modal */}
      <Modal
        isOpen={showAssignAssetModal}
        onClose={() => setShowAssignAssetModal(false)}
        title="Assign Asset"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Select Asset"
            value={allocationForm.assetId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, assetId: e.target.value })}
            options={[
              { value: 'asset1', label: 'Laptop - Dell XPS 13' },
              { value: 'asset2', label: 'Monitor - Samsung 24"' },
              { value: 'asset3', label: 'Software License - Office 365' },
            ]}
          />
          <Select
            label="Select User"
            value={allocationForm.userId || ''}
            onChange={(e) => setAllocationForm({ ...allocationForm, userId: e.target.value })}
            options={[
              { value: 'user1', label: 'John Doe' },
              { value: 'user2', label: 'Jane Smith' },
            ]}
          />
          <div className="flex justify-end space-x-3">
            <AnimatedButton
              variant="ghost"
              onClick={() => setShowAssignAssetModal(false)}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleCreateAllocation}
              loading={createAllocationMutation.isPending}
              gradient={true}
              glow={true}
              icon={<UserCheck className="w-4 h-4" />}
            >
              Assign Asset
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
