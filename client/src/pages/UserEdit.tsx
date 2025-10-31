import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, User, Save } from 'lucide-react';
import { fetchUserById, updateUser, clearCurrentUser } from '../store/usersSlice';
import { RootState, AppDispatch } from '../store';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading } = useSelector((state: RootState) => state.users);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        password: '',
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    const updateData: any = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    const result = await dispatch(updateUser({ id: parseInt(id!), data: updateData }));
    setSaving(false);

    if (updateUser.fulfilled.match(result)) {
      toast.success('User updated successfully');
      navigate(`/users/${id}`);
    } else {
      toast.error('Failed to update user');
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
            onClick={() => navigate(`/users/${id}`)}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to User Details
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                name="first_name"
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                icon={<User size={20} className="text-gray-400" />}
                required
              />

              <Input
                type="text"
                name="last_name"
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                icon={<User size={20} className="text-gray-400" />}
                required
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={20} className="text-gray-400" />}
              required
            />

            <Input
              type="password"
              name="password"
              label="New Password (optional)"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
              >
                <Save size={20} className="mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/users/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
