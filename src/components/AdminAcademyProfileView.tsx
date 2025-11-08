import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { Academy, Location, Skill } from '../types/database';

interface AdminAcademyProfileViewProps {
  academy: Academy;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type TabType = 'profile' | 'students' | 'teachers' | 'batches';

export const AdminAcademyProfileView: React.FC<AdminAcademyProfileViewProps> = ({
  academy,
  onSuccess,
  onCancel
}) => {
  const [status, setStatus] = useState<Academy['status']>(academy.status || 'pending');
  const [statusNotes, setStatusNotes] = useState<string>(academy.status_notes || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Data for tabs
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Check if academy is approved or active
  const isOperational = academy.status === 'approved' || academy.status === 'active';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isOperational && activeTab !== 'profile') {
      loadTabData();
    }
  }, [activeTab, isOperational, academy.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load locations and skills to display academy details
      const [locationsData, skillsData] = await Promise.all([
        AdminApi.getLocations(),
        AdminApi.getSkills()
      ]);
      setLocations(locationsData || []);
      setSkills(skillsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (!isOperational) return;
    
    setDataLoading(true);
    setDataError(null);
    
    try {
      switch (activeTab) {
        case 'students': {
          const response = await AdminApi.getAcademyStudents(academy.id);
          if (response.error) {
            setDataError(response.error);
            setStudents([]);
          } else {
            setStudents(response.data || []);
          }
          break;
        }
        case 'teachers': {
          const response = await AdminApi.getAcademyTeachers(academy.id);
          if (response.error) {
            setDataError(response.error);
            setTeachers([]);
          } else {
            setTeachers(response.data || []);
          }
          break;
        }
        case 'batches': {
          const response = await AdminApi.getAcademyBatches(academy.id);
          if (response.error) {
            setDataError(response.error);
            setBatches([]);
          } else {
            setBatches(response.data || []);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
      setDataError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const result = await AdminApi.updateAcademyStatusWithNotes(
        academy.id,
        status,
        statusNotes.trim() || null
      );

      if (result.data) {
        setSuccess('Academy status updated successfully');
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update academy status');
      }
    } catch (err) {
      console.error('Error updating academy status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update academy status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    );
  }

  // Get selected locations and skills
  const selectedLocations = locations.filter(loc => academy.location_ids?.includes(loc.id));
  const selectedSkills = skills.filter(skill => academy.skill_ids?.includes(skill.id));

  // Render functions for tabs
  const renderProfileTab = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Academy Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2">Academy Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Academy Name</label>
            <p className="text-base text-[#0F1717]">{academy.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <p className="text-base text-[#0F1717]">{academy.phone_number}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Owner</label>
            <p className="text-base text-[#0F1717]">{academy.owner?.full_name || academy.owner?.email || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
            <p className="text-base text-[#0F1717]">
              {new Date(academy.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Locations & Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2">Locations & Skills</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Locations</label>
            {selectedLocations.length > 0 ? (
              <div className="space-y-1">
                {selectedLocations.map(location => (
                  <div key={location.id} className="text-sm text-[#0F1717] bg-gray-50 p-2 rounded">
                    {location.name} - {location.city}, {location.state}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No locations selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Skills</label>
            {selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="text-sm text-[#0F1717] bg-[#F0F5F2] px-3 py-1 rounded-full">
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Photos */}
      {academy.photo_urls && academy.photo_urls.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2 mb-4">Academy Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {academy.photo_urls.map((photoUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={photoUrl}
                  alt={`Academy photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Management Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Status Management</h3>
        
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F1717] mb-2">
              Current Status: <span className="font-normal text-gray-600">{academy.status}</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Academy['status'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_process">In Process</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1717] mb-2">
              Status Notes <span className="text-gray-500 font-normal">(Optional - visible to academy owner)</span>
            </label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
              placeholder="Add notes about the status change (e.g., reason for approval, rejection, or suspension)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be visible to the academy owner in their dashboard.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#009963] text-white py-3 px-6 rounded-lg hover:bg-[#007a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Updating Status...' : 'Update Status'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const renderStudentsTab = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{dataError}</p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No students found</p>
          <p className="text-gray-400 text-sm mt-2">This academy has no enrolled students yet.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batches</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {enrollment.student?.full_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{enrollment.student?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    enrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {enrollment.batchEnrollments && enrollment.batchEnrollments.length > 0 ? (
                      <div className="space-y-1">
                        {enrollment.batchEnrollments.slice(0, 3).map((be: any) => {
                          const batch = be.batches || be.batch;
                          const skill = batch?.skills || batch?.skill;
                          return (
                            <div key={be.id} className="text-xs">
                              {batch?.name || 'N/A'} ({skill?.name || 'N/A'})
                            </div>
                          );
                        })}
                        {enrollment.batchEnrollments.length > 3 && (
                          <div className="text-xs text-gray-500">+{enrollment.batchEnrollments.length - 3} more</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No batches</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(enrollment.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTeachersTab = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{dataError}</p>
        </div>
      );
    }

    if (teachers.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No teachers found</p>
          <p className="text-gray-400 text-sm mt-2">This academy has no assigned teachers yet.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batches</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.teacher?.full_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{assignment.teacher?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    assignment.status === 'approved' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    assignment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    assignment.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {assignment.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {assignment.batches && assignment.batches.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-xs font-medium">{assignment.batches.length} batch(es)</div>
                        {assignment.batches.slice(0, 2).map((batch: any) => {
                          const skill = batch.skills || batch.skill;
                          return (
                            <div key={batch.id} className="text-xs text-gray-600">
                              {batch.name} ({skill?.name || 'N/A'})
                            </div>
                          );
                        })}
                        {assignment.batches.length > 2 && (
                          <div className="text-xs text-gray-500">+{assignment.batches.length - 2} more</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No batches</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(assignment.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBatchesTab = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{dataError}</p>
        </div>
      );
    }

    if (batches.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No batches found</p>
          <p className="text-gray-400 text-sm mt-2">This academy has no batches yet.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{batch.skill?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{batch.teacher?.full_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{batch.teacher?.email || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{batch.student_count || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    batch.status === 'active' ? 'bg-green-100 text-green-800' :
                    batch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    batch.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {batch.status || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0F1717]">Academy Profile - {academy.name}</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-[#009963] text-[#009963]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          {isOperational && (
            <>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'teachers'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Teachers
              </button>
              <button
                onClick={() => setActiveTab('batches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'batches'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Batches
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {!isOperational && activeTab !== 'profile' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Academy must be approved or active to view operational data (students, teachers, batches).
            Current status: <span className="font-semibold">{academy.status}</span>
          </p>
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'students' && isOperational && renderStudentsTab()}
        {activeTab === 'teachers' && isOperational && renderTeachersTab()}
        {activeTab === 'batches' && isOperational && renderBatchesTab()}
      </div>
    </div>
  );
};

