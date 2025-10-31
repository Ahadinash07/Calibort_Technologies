import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchUsers, deleteUser, fetchExternalUsers } from '../store/usersSlice';
import { RootState, AppDispatch } from '../store';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { UserForm } from '../components/UserForm';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/api';

export const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading, pagination } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10, search: searchQuery }));
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchUsers({ page: 1, limit: 10, search: searchQuery }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchUsers({ page: newPage, limit: pagination.limit, search: searchQuery }));
  };

  const handleDelete = async (id: number) => {
    const result = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(result)) {
      toast.success('User deleted successfully');
      dispatch(fetchUsers({ page: pagination.page, limit: pagination.limit, search: searchQuery }));
    } else {
      toast.error('Failed to delete user');
    }
    setDeleteConfirmId(null);
  };

  const handleFetchExternal = async () => {
    const loadingToast = toast.loading('Importing users from external API...');
    const result = await dispatch(fetchExternalUsers(1));
    toast.dismiss(loadingToast);
    
    if (fetchExternalUsers.fulfilled.match(result)) {
      const data = result.payload as any;
      if (data.imported > 0) {
        toast.success(`Successfully imported ${data.imported} users! ${data.skipped > 0 ? `(${data.skipped} already existed)` : ''}`);
      } else if (data.skipped > 0) {
        toast.success(`All ${data.skipped} users already exist in the database`);
      } else {
        toast.success('External users processed successfully');
      }
      dispatch(fetchUsers({ page: pagination.page, limit: pagination.limit, search: searchQuery }));
    } else {
      toast.error('Failed to import external users');
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    dispatch(fetchUsers({ page: pagination.page, limit: pagination.limit, search: searchQuery }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage and view all users in the system</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={handleFetchExternal}
              isLoading={loading}
            >
              <Download size={20} className="mr-2" />
              Import from API
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={20} className="text-gray-400" />}
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </Card>

        {/* Users Table */}
        <Card className="flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <p className="text-gray-600">No users found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table with Fixed Header and Scrollable Body */}
              <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
                {/* Fixed Header */}
                <div className="flex-shrink-0 overflow-x-auto border-b border-gray-200 bg-gray-50">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap" style={{ width: '30%', minWidth: '180px' }}>User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap" style={{ width: '35%', minWidth: '200px' }}>Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap" style={{ width: '15%', minWidth: '100px' }}>Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 whitespace-nowrap" style={{ width: '20%', minWidth: '140px' }}>Actions</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full min-w-[600px]">
                    <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4" style={{ width: '30%', minWidth: '180px' }}>
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={user.avatar ? `${BACKEND_URL}${user.avatar}` : null}
                              alt={`${user.first_name} {user.last_name}`}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600" style={{ width: '35%', minWidth: '200px' }}>
                          <span className="truncate block">{user.email}</span>
                        </td>
                        <td className="py-3 px-4" style={{ width: '15%', minWidth: '100px' }}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            user.is_external
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.is_external ? 'External' : 'Internal'}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ width: '20%', minWidth: '140px' }}>
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/users/${user.id}`)}
                              title="View details"
                            >
                              <Eye size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                              title="Edit user"
                            >
                              <Edit size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(user.id)}
                              className="text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards with Scroll */}
              <div className="sm:hidden flex-1 overflow-y-auto space-y-3 p-1">
                {users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Avatar
                          src={user.avatar ? `${BACKEND_URL}${user.avatar}` : null}
                          alt={`${user.first_name} ${user.last_name}`}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                        user.is_external
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.is_external ? 'Ext' : 'Int'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirmId(user.id)}
                        className="px-3"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <UserForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
