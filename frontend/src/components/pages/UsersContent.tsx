import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus } from '@/hooks/useUsers';
import { useAssetNotifications } from '@/hooks/useAssetNotifications';
import { 
  Plus, 
  Users, 
  Search,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { User, UserForm, TableColumn, UserRole } from '@/types';

export default function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<UserForm>>({});

  const { data: usersData, isLoading } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    role: roleFilter !== 'all' ? roleFilter as UserRole : undefined,
  });

  const users = usersData?.data || [];
  const totalPages = usersData?.pagination?.totalPages || 0;

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();
  
  // Notifications
  const { notifyUserAction } = useAssetNotifications();

  // Handlers
  const handleCreateUser = async () => {
    try {
      const createdUser = await createUserMutation.mutateAsync(userForm as UserForm);
      setShowAddModal(false);
      setUserForm({});
      
      // Notify about user creation
      if (createdUser?.name) {
        notifyUserAction('created user', createdUser.name);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const updatedUser = await updateUserMutation.mutateAsync({ id: selectedUser._id, data: userForm });
      setShowEditModal(false);
      setSelectedUser(null);
      setUserForm({});
      
      // Notify about user update
      if (updatedUser?.name) {
        notifyUserAction('updated user', updatedUser.name);
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteUserMutation.mutateAsync(user._id);
        
        // Notify about user deletion
        notifyUserAction('deleted user', user.name);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updatedUser = await toggleStatusMutation.mutateAsync(user._id);
      
      // Notify about status change
      const action = updatedUser?.isActive ? 'activated' : 'deactivated';
      notifyUserAction(`${action} user`, user.name);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setShowEditModal(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Users className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-900">{user.name}</p>
            <p className="text-sm text-secondary-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value, user) => (
        <Badge variant="secondary">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (value, user) => user.department || 'N/A',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value, user) => (
        <Badge 
          variant="secondary"
          className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewUser(user)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="View User"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleEditUser(user)}
            className="p-1 text-secondary-400 hover:text-secondary-600"
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleToggleStatus(user)}
            className={`p-1 ${user.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}
            title={user.isActive ? 'Deactivate User' : 'Activate User'}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => handleDeleteUser(user)}
            className="p-1 text-red-400 hover:text-red-600"
            title="Delete User"
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
          <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
          <p className="text-secondary-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              data={users}
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              loading={createUserMutation.isPending}
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
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
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              loading={updateUserMutation.isPending}
            >
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                <p className="text-secondary-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                <p className="text-secondary-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                <Badge variant="secondary">
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Department</label>
                <p className="text-secondary-900">{selectedUser.department || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
                <Badge 
                  variant="secondary"
                  className={selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
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
