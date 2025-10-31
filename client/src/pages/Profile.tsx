import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Save, Mail, User, Edit2 } from 'lucide-react';
import { getProfile, updateProfile, uploadProfileImage } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/api';

export const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const result = await dispatch(uploadProfileImage(file));
    setUploading(false);

    if (uploadProfileImage.fulfilled.match(result)) {
      toast.success('Profile image updated successfully');
      dispatch(getProfile());
    } else {
      toast.error('Failed to upload image');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading && !user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {/* Profile Picture Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <Avatar
                src={user?.avatar ? `${BACKEND_URL}${user.avatar}` : null}
                alt={`${user?.first_name} ${user?.last_name}`}
                size="xl"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  <Camera size={20} className="mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={18} className="mr-2" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
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

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                >
                  <Save size={20} className="mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setFormData({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <p className="text-gray-900 text-lg">{user?.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <p className="text-gray-900 text-lg">{user?.last_name}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <p className="text-gray-900 text-lg">{user?.email}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Account Information */}
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Account ID</span>
              <span className="font-medium text-gray-900">{user?.id}</span>
            </div>
            {user?.created_at && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {user?.updated_at && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};
