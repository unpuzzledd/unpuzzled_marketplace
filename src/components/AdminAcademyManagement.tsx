import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { Academy, Location, User } from '../types/database';
import { AdminAcademyProfileView } from './AdminAcademyProfileView';

interface AdminAcademyManagementProps {
  onAcademyUpdate?: () => void;
}

export const AdminAcademyManagement: React.FC<AdminAcademyManagementProps> = ({
  onAcademyUpdate
}) => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states (only for editing, not creating)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const [viewingAcademy, setViewingAcademy] = useState<Academy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    owner_id: '',
    location_id: ''
  });

  useEffect(() => {
    loadData();
  }, [currentPage, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load academies
      const academyResponse = await AdminApi.getAcademies(
        currentPage, 
        20, 
        selectedStatus === 'all' ? undefined : selectedStatus
      );
      
      console.log('Academy response:', academyResponse);
      
      if (academyResponse.error) {
        console.error('Error loading academies:', academyResponse.error);
        setError(academyResponse.error);
        setAcademies([]);
        setTotalPages(0);
      } else {
        console.log('Academies loaded:', academyResponse.data?.length || 0);
        setAcademies(academyResponse.data || []);
        setTotalPages(academyResponse.totalPages || 0);
      }

      // Load locations and users for forms
      const [locationsData, usersData] = await Promise.all([
        AdminApi.getLocations(),
        loadUsers()
      ]);
      setLocations(locationsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setAcademies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (): Promise<User[]> => {
    // This would typically be a separate API call to get users with academy_owner role
    // For now, we'll return an empty array - you can implement this based on your user management
    return [];
  };

  const handleUpdateAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcademy) return;
    
    try {
      const result = await AdminApi.updateAcademy(editingAcademy.id, formData);
      if (result.data) {
        setShowEditForm(false);
        resetForm();
        loadData();
        onAcademyUpdate?.();
      } else {
        setError(result.error || 'Failed to update academy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update academy');
    }
  };

  const handleUpdateStatus = async (academyId: string, status: 'pending' | 'active' | 'suspended') => {
    try {
      const result = await AdminApi.updateAcademyStatus(academyId, status);
      if (result.data) {
        loadData();
        onAcademyUpdate?.();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };


  const handleDeleteAcademy = async (academyId: string) => {
    if (!window.confirm('Are you sure you want to delete this academy? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await AdminApi.deleteAcademy(academyId);
      if (result.data) {
        loadData();
        onAcademyUpdate?.();
      } else {
        setError(result.error || 'Failed to delete academy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete academy');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone_number: '',
      owner_id: '',
      location_id: ''
    });
    setEditingAcademy(null);
  };

  const startEdit = (academy: Academy) => {
    setEditingAcademy(academy);
    // Note: location_id is deprecated, using location_ids array now
    // For edit form, we'll use the first location_id if available, or empty string
    const firstLocationId = academy.location_ids && academy.location_ids.length > 0 
      ? academy.location_ids[0] 
      : '';
    setFormData({
      name: academy.name,
      phone_number: academy.phone_number,
      owner_id: academy.owner_id,
      location_id: firstLocationId
    });
    setShowEditForm(true);
  };

  if (loading) {
    return <div>Loading academies...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Academy Management</h2>
          <p className="text-gray-600">Manage academies, their status, and details</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_process">In Process</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Academies List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {academies.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No academies found</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedStatus === 'all' 
                ? 'There are no academies in the system yet.' 
                : `No academies with status "${selectedStatus}" found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {academies.map((academy) => (
                <tr key={academy.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{academy.name}</div>
                      <div className="text-sm text-gray-500">{academy.phone_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(academy as any).owner?.full_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(academy as any).owner?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {academy.location_ids && academy.location_ids.length > 0 ? (
                      <div className="space-y-1">
                        {academy.location_ids.slice(0, 2).map((locationId) => {
                          const location = locations.find(loc => loc.id === locationId);
                          return location ? (
                            <div key={locationId}>{location.name}</div>
                          ) : null;
                        })}
                        {academy.location_ids.length > 2 && (
                          <div className="text-gray-500">+{academy.location_ids.length - 2} more</div>
                        )}
                      </div>
                    ) : (
                      'No locations'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      academy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      (academy.status as any) === 'in_process' ? 'bg-blue-100 text-blue-800' :
                      (academy.status as any) === 'approved' ? 'bg-green-100 text-green-800' :
                      (academy.status as any) === 'rejected' ? 'bg-red-100 text-red-800' :
                      academy.status === 'active' ? 'bg-green-100 text-green-800' :
                      academy.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                      (academy.status as any) === 'deactivated' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {academy.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(academy.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setViewingAcademy(academy);
                        setShowProfileView(true);
                      }}
                      className="text-[#009963] hover:text-[#007a4d] font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => startEdit(academy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <select
                      value={academy.status}
                      onChange={(e) => handleUpdateStatus(academy.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_process">In Process</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                    <button
                      onClick={() => handleDeleteAcademy(academy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditForm && editingAcademy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit Academy
            </h3>
            
            <form onSubmit={handleUpdateAcademy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}, {location.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Owner</label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile View Modal */}
      {showProfileView && viewingAcademy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl my-8">
            <AdminAcademyProfileView
              academy={viewingAcademy}
              onSuccess={() => {
                setShowProfileView(false);
                setViewingAcademy(null);
                loadData();
                onAcademyUpdate?.();
              }}
              onCancel={() => {
                setShowProfileView(false);
                setViewingAcademy(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
