import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { fetchUserById, deleteUser, clearCurrentUser } from '../store/usersSlice';
import { RootState, AppDispatch } from '../store';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/api';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading } = useSelector((state: RootState) => state.users);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!id) return;
    const result = await dispatch(deleteUser(parseInt(id)));
    if (deleteUser.fulfilled.match(result)) {
      toast.success('User deleted successfully');
      navigate('/users');
    } else {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
          <Button variant="primary" onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Users
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => navigate(`/users/${id}/edit`)}
            >
              <Edit size={20} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={20} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar
              src={currentUser.avatar ? `${BACKEND_URL}${currentUser.avatar}` : null}
              alt={`${currentUser.first_name} ${currentUser.last_name}`}
              size="xl"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentUser.first_name} {currentUser.last_name}
              </h1>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                  <Mail size={18} />
                  <span>{currentUser.email}</span>
                </div>
                {currentUser.created_at && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                    <Calendar size={18} />
                    <span>Joined {new Date(currentUser.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {currentUser.is_external && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    External User (ID: {currentUser.external_id})
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* User Information */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
              <p className="text-gray-900">{currentUser.first_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
              <p className="text-gray-900">{currentUser.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <p className="text-gray-900">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
              <p className="text-gray-900">{currentUser.is_external ? 'External' : 'Internal'}</p>
            </div>
            {currentUser.created_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-900">{new Date(currentUser.created_at).toLocaleString()}</p>
              </div>
            )}
            {currentUser.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-gray-900">{new Date(currentUser.updated_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{currentUser.first_name} {currentUser.last_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
