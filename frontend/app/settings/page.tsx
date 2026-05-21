'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Input, Select, Badge, Table } from '@/components/shared';
import { useAuthStore } from '@/store';
import { useUsers, useCreateUser } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Save, AlertCircle, CheckCircle, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    darkMode: false,
  });
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // User management state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STAFF',
  });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // User management hooks
  const { data: usersData, isPending: isLoadingUsers, refetch: refetchUsers } = useUsers(1, 100);
  const { mutate: createUser, isPending: isCreatingUser } = useCreateUser();
  
  const { mutate: deleteUserMutation, isPending: isDeletingUser } = useMutation({
    mutationFn: (userId: string) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
      refetchUsers();
    },
  });

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    // Save to localStorage for demo
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddUser = () => {
    setUserError('');
    setUserSuccess('');

    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password) {
      setUserError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      setUserError('Please enter a valid email address');
      return;
    }

    if (newUserData.password.length < 6) {
      setUserError('Password must be at least 6 characters');
      return;
    }

    createUser(newUserData, {
      onSuccess: () => {
        setUserSuccess('User created successfully!');
        setNewUserData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'STAFF',
        });
        setIsAddingUser(false);
        refetchUsers();
        setTimeout(() => setUserSuccess(''), 3000);
      },
      onError: (error: any) => {
        setUserError(error.response?.data?.error?.message || 'Failed to create user');
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation(userId, {
        onSuccess: () => {
          setUserSuccess('User deleted successfully!');
          setTimeout(() => setUserSuccess(''), 3000);
        },
        onError: (error: any) => {
          setUserError(error.response?.data?.error?.message || 'Failed to delete user');
        },
      });
    }
  };

  const userTableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v: string) => <Badge status={v === 'ADMIN' ? 'APPROVED' : 'PENDING'}>{v}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (v: any, row: any) => (
        <button
          onClick={() => handleDeleteUser(row.id)}
          disabled={isDeletingUser || row.email === user?.email}
          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title={row.email === user?.email ? 'Cannot delete your own account' : 'Delete user'}
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and notifications</p>
        </div>

        {/* Account Settings */}
        <Card title="Account Information" className="rounded-xl shadow-sm border">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  type="text"
                  value={user?.firstName || ''}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  type="text"
                  value={user?.lastName || ''}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Badge status={user?.role === 'ADMIN' ? 'APPROVED' : 'PENDING'}>
                {user?.role || 'N/A'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* User Management (Admin Only) */}
        {isAdmin && (
          <Card title="User Management" className="rounded-xl shadow-sm border">
            <div className="space-y-4">
              {/* Add User Form */}
              {isAddingUser && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                  <h3 className="font-semibold text-gray-900">Add New User</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="First Name"
                      placeholder="John"
                      value={newUserData.firstName}
                      onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    />
                    <Input
                      type="text"
                      label="Last Name"
                      placeholder="Doe"
                      value={newUserData.lastName}
                      onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    />
                  </div>
                  <Input
                    type="email"
                    label="Email"
                    placeholder="user@example.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  />
                  <Input
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  />
                  <Select
                    label="Role"
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    options={[
                      { value: 'STAFF', label: 'Staff' },
                      { value: 'MANAGER', label: 'Manager' },
                      { value: 'ADMIN', label: 'Admin' },
                    ]}
                  />
                  {userError && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                      <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{userError}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleAddUser}
                      isLoading={isCreatingUser}
                      disabled={isCreatingUser}
                    >
                      Create User
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAddingUser(false);
                        setUserError('');
                        setNewUserData({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          role: 'STAFF',
                        });
                      }}
                      disabled={isCreatingUser}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* User List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Users ({usersData?.data?.data?.length || 0})</h4>
                  {!isAddingUser && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddingUser(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} /> Add User
                    </Button>
                  )}
                </div>

                {usersData?.data?.data?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Role</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.data.data.map((u: any, index: number) => (
                          <tr key={u._id || u.id || `user-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">{u.firstName} {u.lastName}</td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <Badge status={u.role === 'ADMIN' ? 'APPROVED' : 'PENDING'}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteUser(u._id || u.id)}
                                disabled={isDeletingUser || u.email === user?.email}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={u.email === user?.email ? 'Cannot delete your own account' : 'Delete user'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 p-4 text-center">No users found</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card title="Notification Preferences" className="rounded-xl shadow-sm border">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates for important events</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive SMS alerts for critical updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications')}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-600">Get a weekly summary of your bookings</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyReport}
                onChange={() => handleSettingChange('weeklyReport')}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            <Save size={20} /> Save Settings
          </Button>
        </div>

        {saved && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-sm text-green-800">Settings saved successfully!</p>
          </div>
        )}

        {userSuccess && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-sm text-green-800">{userSuccess}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
