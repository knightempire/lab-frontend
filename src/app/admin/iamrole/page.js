'use client'
import React, { useState } from 'react';
import { Edit, Plus, Save, X, Users, Shield, Settings, Bell, Eye, FileText, Package, RotateCcw, UserCheck, AlertCircle, Check } from 'lucide-react';

const IAMRoleManagement = () => {
  const tempRoles = [
    {
      id: 1,
      name: "Admin",
      userCount: 10,
      permissions: {
        userPage: "full",
        productPage: "write",
        requestPage: "full",
        returnPage: "full",
        notifications: true,
        adminPrivileges: true
      }
    },
    {
      id: 2,
      name: "Viewer",
      userCount: 5,
      permissions: {
        userPage: "view",
        productPage: "view",
        requestPage: "view",
        returnPage: "view",
        notifications: false,
        adminPrivileges: false
      }
    },
    {
      id: 3,
      name: "Manager",
      userCount: 8,
      permissions: {
        userPage: "write",
        productPage: "write",
        requestPage: "edit",
        returnPage: "approve",
        notifications: true,
        adminPrivileges: false
      }
    }
  ];

  const [roles, setRoles] = useState(tempRoles);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    permissions: {
      userPage: 'none',
      productPage: 'view',
      requestPage: 'none',
      returnPage: 'none',
      notifications: false,
      adminPrivileges: false
    }
  });
  const [errors, setErrors] = useState({});

  const permissionOptions = {
    userPage: [
      { value: 'none', label: 'No access to users', description: 'Cannot view or interact with user management' },
      { value: 'view', label: 'View users only', description: 'Can view user list and details' },
      { value: 'write', label: 'Add/edit users', description: 'Can view, add, and edit user information' },
      { value: 'full', label: 'Complete user access', description: 'Full control over user management including deletion' }
    ],
    productPage: [
      { value: 'view', label: 'View products only', description: 'Can view product catalog and details' },
      { value: 'write', label: 'Manage products', description: 'Can view, add, edit, and manage products' }
    ],
    requestPage: [
      { value: 'none', label: 'No request access', description: 'Cannot access request management' },
      { value: 'view', label: 'View requests only', description: 'Can view request list and details' },
      { value: 'accept', label: 'Accept/decline requests', description: 'Can approve or decline incoming requests' },
      { value: 'edit', label: 'Edit and manage requests', description: 'Can modify request details and approve/decline' },
      { value: 'issue', label: 'Issue components', description: 'Can issue components to requesters' },
      { value: 'full', label: 'Complete request access', description: 'Full control over request management' }
    ],
    returnPage: [
      { value: 'none', label: 'No return access', description: 'Cannot access return management' },
      { value: 'view', label: 'View returns only', description: 'Can view return list and details' },
      { value: 'return', label: 'Process returns', description: 'Can process and manage return requests' },
      { value: 'approve', label: 'Approve reissue', description: 'Can approve reissue of returned items' },
      { value: 'full', label: 'Complete return access', description: 'Full control over return management' }
    ]
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      permissions: {
        userPage: 'none',
        productPage: 'view',
        requestPage: 'none',
        returnPage: 'none',
        notifications: false,
        adminPrivileges: false
      }
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: { ...role.permissions }
    });
    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Role name must be at least 2 characters';
    } else if (editingRole?.name !== formData.name && roles.some(role => role.name.toLowerCase() === formData.name.toLowerCase())) {
      newErrors.name = 'Role name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRole = () => {
    if (!validateForm()) return;

    const newRole = {
      id: editingRole ? editingRole.id : Math.max(...roles.map(r => r.id), 0) + 1,
      name: formData.name,
      userCount: editingRole ? editingRole.userCount : 0,
      permissions: { ...formData.permissions }
    };

    if (editingRole) {
      setRoles(roles.map(role => role.id === editingRole.id ? newRole : role));
    } else {
      setRoles([...roles, newRole]);
    }

    setShowForm(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: value
      }
    }));
  };

  const handleToggleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [field]: value
      }
    }));
  };

  const getPermissionLabel = (category, value) => {
    const option = permissionOptions[category]?.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getPermissionColor = (category, value) => {
    const colors = {
      full: 'bg-green-100 text-green-800',
      write: 'bg-blue-100 text-blue-800',
      edit: 'bg-yellow-100 text-yellow-800',
      view: 'bg-gray-100 text-gray-800',
      none: 'bg-red-100 text-red-800',
      accept: 'bg-purple-100 text-purple-800',
      issue: 'bg-indigo-100 text-indigo-800',
      return: 'bg-orange-100 text-orange-800',
      approve: 'bg-teal-100 text-teal-800'
    };
    return colors[value] || 'bg-gray-100 text-gray-800';
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {editingRole ? 'Edit Role' : 'Create New Role'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingRole ? 'Modify permissions and settings for this role' : 'Define permissions and access levels for the new role'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {/* Role Name Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Role Information</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter a descriptive role name (e.g., Content Manager, Financial Analyst)"
                    />
                    {errors.name && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Privileges Section */}
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.adminPrivileges}
                          onChange={(e) => handleToggleChange('adminPrivileges', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Super Admin Access</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Grants complete system access and overrides all permission restrictions. 
                            Use with extreme caution as this provides unlimited access to all features.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Permission Sections */}
                <div className="space-y-6">
                  {/* User Page Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-600">Control access to user accounts and profiles</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {permissionOptions.userPage.map((option) => (
                        <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="userPage"
                            value={option.value}
                            checked={formData.permissions.userPage === option.value}
                            onChange={(e) => handlePermissionChange('userPage', e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          {formData.permissions.userPage === option.value && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Product Page Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
                        <p className="text-sm text-gray-600">Control access to product catalog and inventory</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {permissionOptions.productPage.map((option) => (
                        <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="productPage"
                            value={option.value}
                            checked={formData.permissions.productPage === option.value}
                            onChange={(e) => handlePermissionChange('productPage', e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          {formData.permissions.productPage === option.value && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Request Page Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Request Management</h3>
                        <p className="text-sm text-gray-600">Control access to request processing and approval</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {permissionOptions.requestPage.map((option) => (
                        <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="requestPage"
                            value={option.value}
                            checked={formData.permissions.requestPage === option.value}
                            onChange={(e) => handlePermissionChange('requestPage', e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          {formData.permissions.requestPage === option.value && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                    
                    {/* Notifications toggle */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.permissions.notifications}
                          onChange={(e) => handleToggleChange('notifications', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Enable Request Notifications</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Return Page Permissions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <RotateCcw className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Return Management</h3>
                        <p className="text-sm text-gray-600">Control access to return processing and reissue approval</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {permissionOptions.returnPage.map((option) => (
                        <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="returnPage"
                            value={option.value}
                            checked={formData.permissions.returnPage === option.value}
                            onChange={(e) => handlePermissionChange('returnPage', e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          {formData.permissions.returnPage === option.value && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">IAM Role Management</h1>
            </div>
            <button
              onClick={handleCreateRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Role
            </button>
          </div>

          <div className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User Count</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Permissions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{role.name}</span>
                          {role.permissions.adminPrivileges && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{role.userCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPermissionColor('userPage', role.permissions.userPage)}`}>
                            Users: {role.permissions.userPage}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPermissionColor('productPage', role.permissions.productPage)}`}>
                            Products: {role.permissions.productPage}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPermissionColor('requestPage', role.permissions.requestPage)}`}>
                            Requests: {role.permissions.requestPage}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPermissionColor('returnPage', role.permissions.returnPage)}`}>
                            Returns: {role.permissions.returnPage}
                          </span>
                          {role.permissions.notifications && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              Notifications
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IAMRoleManagement;