import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User } from 'lucide-react';
import { createUser } from '../store/usersSlice';
import { AppDispatch } from '../store';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await dispatch(createUser(formData));
    setLoading(false);

    if (createUser.fulfilled.match(result)) {
      toast.success('User created successfully');
      onSuccess();
    } else {
      toast.error('Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        label="Password"
        placeholder="At least 6 characters"
        value={formData.password}
        onChange={handleChange}
        icon={<Lock size={20} className="text-gray-400" />}
        required
      />

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={loading}
        >
          Create User
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
