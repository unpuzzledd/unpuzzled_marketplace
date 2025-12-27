import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { supabase } from '../lib/supabase';

interface TeacherManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    id: string;
    teacher_id: string;
    academy_id: string;
    status: string;
    teacher: {
      id: string;
      full_name: string;
      email: string;
      phone_number?: string | null;
      highest_education?: string | null;
      location?: string | null;
      teacher_skills?: string[] | null;
      [key: string]: any; // Allow additional properties from API
    } | null;
  };
  onTeacherUpdated: () => void;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onTeacherUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeacher, setEditedTeacher] = useState({
    full_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherBatches, setTeacherBatches] = useState<any[]>([]);
  const [batchEnrollments, setBatchEnrollments] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [isAssigningBatches, setIsAssigningBatches] = useState(false);
  const [teacherSkills, setTeacherSkills] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && teacher.teacher) {
      setEditedTeacher({
        full_name: teacher.teacher.full_name,
        email: teacher.teacher.email
      });
      loadTeacherBatches();
      loadAllBatches();
      loadTeacherSkills();
    }
  }, [isOpen, teacher]);

  const loadTeacherSkills = async () => {
    if (!teacher.teacher?.teacher_skills || teacher.teacher.teacher_skills.length === 0) {
      setTeacherSkills([]);
      return;
    }

    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', teacher.teacher.teacher_skills);

      if (error) {
        console.error('Error loading teacher skills:', error);
        setTeacherSkills([]);
        return;
      }

      setTeacherSkills(skills || []);
    } catch (error) {
      console.error('Error loading teacher skills:', error);
      setTeacherSkills([]);
    }
  };

  const loadTeacherBatches = async () => {
    try {
      console.log('Loading batches for teacher:', teacher);
      console.log('Teacher ID to filter by:', teacher.teacher_id);
      
      // Always fetch fresh batch data with complete skill information
      const response = await AdminApi.getAcademyBatches(teacher.academy_id);
      console.log('All academy batches:', response.data);
      
      if (response.data) {
        // The teacher object might have a nested structure, so let's check both possibilities
        const teacherId = teacher.teacher_id || teacher.teacher?.id;
        console.log('Using teacher ID:', teacherId);
        
        const teacherBatches = response.data.filter(batch => batch.teacher_id === teacherId);
        console.log('Filtered teacher batches:', teacherBatches);
        console.log('First batch with skills:', teacherBatches[0]);
        setTeacherBatches(teacherBatches);
        
        // Get batch enrollments to show actual student count
        const enrollmentsResponse = await AdminApi.getAcademyBatchEnrollments(teacher.academy_id);
        if (enrollmentsResponse.data) {
          setBatchEnrollments(enrollmentsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading teacher batches:', error);
    }
  };

  const loadAllBatches = async () => {
    try {
      const response = await AdminApi.getAcademyBatches(teacher.academy_id);
      if (response.data) {
        setAllBatches(response.data);
      }
    } catch (error) {
      console.error('Error loading all batches:', error);
    }
  };

  const handleSave = async () => {
    if (!teacher.teacher) return;
    
    setLoading(true);
    setError(null);

    try {
      // Update teacher information
      const { error } = await AdminApi.updateUser(teacher.teacher_id, {
        full_name: editedTeacher.full_name,
        email: editedTeacher.email
      });

      if (error) {
        setError(error);
        return;
      }

      setIsEditing(false);
      onTeacherUpdated();
    } catch (error) {
      setError('Failed to update teacher information');
      console.error('Error updating teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.approveTeacherAssignment(teacher.id);
      
      if (error) {
        setError(error);
        return;
      }

      onTeacherUpdated();
    } catch (error) {
      setError('Failed to approve teacher');
      console.error('Error approving teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTeacher = async () => {
    const confirmMessage = teacher.status === 'approved' 
      ? 'Are you sure you want to suspend this teacher? They will no longer be able to access academy resources.'
      : 'Are you sure you want to reject this teacher request?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If teacher is approved, we suspend them (set status to rejected)
      // If teacher is pending, we reject them
      const { error } = await AdminApi.rejectTeacherAssignment(teacher.id);
      
      if (error) {
        setError(error);
        return;
      }

      onTeacherUpdated();
    } catch (error) {
      setError(teacher.status === 'approved' ? 'Failed to suspend teacher' : 'Failed to reject teacher');
      console.error('Error rejecting/suspending teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBatches = async () => {
    if (selectedBatchIds.length === 0) {
      setError('Please select at least one batch to assign');
      return;
    }

    setIsAssigningBatches(true);
    setError(null);

    try {
      const teacherId = teacher.teacher_id || teacher.teacher?.id;
      
      // Update each selected batch to assign the teacher
      const updatePromises = selectedBatchIds.map(batchId => 
        AdminApi.updateBatch(batchId, { teacher_id: teacherId })
      );

      await Promise.all(updatePromises);
      
      // Reload batches
      await loadTeacherBatches();
      await loadAllBatches();
      setSelectedBatchIds([]);
      setIsAssigningBatches(false);
      onTeacherUpdated();
    } catch (error) {
      setError('Failed to assign batches');
      console.error('Error assigning batches:', error);
      setIsAssigningBatches(false);
    }
  };

  const handleRemoveFromBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`Are you sure you want to remove this teacher from the batch "${batchName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set teacher_id to null to unassign the teacher
      const { error } = await AdminApi.updateBatch(batchId, { teacher_id: '' });
      
      if (error) {
        setError(error);
        return;
      }

      // Reload batches
      await loadTeacherBatches();
      await loadAllBatches();
      onTeacherUpdated();
    } catch (error) {
      setError('Failed to remove teacher from batch');
      console.error('Error removing teacher from batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!confirm('Are you sure you want to remove this teacher from the academy?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.removeTeacherFromAcademy(teacher.id);
      
      if (error) {
        setError(error);
        return;
      }

      onTeacherUpdated();
      onClose();
    } catch (error) {
      setError('Failed to remove teacher from academy');
      console.error('Error removing teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher.teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0F1717]">Manage Teacher</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Teacher Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Teacher Information</h3>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F1717] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editedTeacher.full_name}
                  onChange={(e) => setEditedTeacher(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F1717] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editedTeacher.email}
                  onChange={(e) => setEditedTeacher(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#F0F5F2] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#5E8C7D] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {teacher.teacher.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0F1717]">{teacher.teacher.full_name}</h4>
                  <p className="text-sm text-[#5E8C7D]">{teacher.teacher.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 border-t border-[#DBE5E0] pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    teacher.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : teacher.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {teacher.status}
                  </span>
                </div>

                {teacher.teacher.phone_number && (
                  <div className="text-sm text-[#0F1717]">
                    <span className="font-medium">Phone:</span>{' '}
                    <span className="text-[#5E8C7D]">{teacher.teacher.phone_number}</span>
                  </div>
                )}

                {teacher.teacher.highest_education && (
                  <div className="text-sm text-[#0F1717]">
                    <span className="font-medium">Highest Education:</span>{' '}
                    <span className="text-[#5E8C7D]">{teacher.teacher.highest_education}</span>
                  </div>
                )}

                {teacher.teacher.location && (
                  <div className="text-sm text-[#0F1717]">
                    <span className="font-medium">Location:</span>{' '}
                    <span className="text-[#5E8C7D]">{teacher.teacher.location}</span>
                  </div>
                )}

                {teacherSkills.length > 0 && (
                  <div className="text-sm text-[#0F1717]">
                    <span className="font-medium">Skills:</span>{' '}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacherSkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-[#009963] text-white rounded-full text-xs font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {teacherSkills.length === 0 && teacher.teacher.teacher_skills && teacher.teacher.teacher_skills.length > 0 && (
                  <div className="text-sm text-[#5E8C7D] italic">
                    Skills loading...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Approval Section - Show if pending or rejected */}
        {(teacher.status === 'pending' || teacher.status === 'rejected') && (
          <div className={`mb-6 p-4 border rounded-lg ${
            teacher.status === 'pending' 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="text-lg font-semibold text-[#0F1717] mb-2">
              {teacher.status === 'pending' 
                ? 'Teacher Request Pending Approval' 
                : 'Teacher Request Rejected'}
            </h3>
            <p className="text-sm text-[#5E8C7D] mb-4">
              {teacher.status === 'pending'
                ? 'This teacher has requested to join your academy. Please review and approve or reject their request.'
                : 'This teacher was previously rejected. You can now approve them if you change your mind.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleApproveTeacher}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Approving...' : teacher.status === 'rejected' ? 'Approve Now' : 'Approve'}
              </button>
              {teacher.status === 'pending' && (
                <button
                  onClick={handleRejectTeacher}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Assign Batches Section - Show if approved */}
        {teacher.status === 'approved' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Assign Batches</h3>
            <div className="bg-[#F7FCFA] border border-[#DBE5E0] rounded-lg p-4">
              <p className="text-sm text-[#5E8C7D] mb-4">
                Select batches to assign to this teacher. Batches already assigned to this teacher are shown but cannot be selected again.
              </p>
              {allBatches.filter(batch => {
                const teacherId = teacher.teacher_id || teacher.teacher?.id;
                return !batch.teacher_id || batch.teacher_id === teacherId;
              }).length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                  {allBatches
                    .filter(batch => {
                      const teacherId = teacher.teacher_id || teacher.teacher?.id;
                      return !batch.teacher_id || batch.teacher_id === teacherId;
                    })
                    .map((batch) => {
                      const isAssigned = batch.teacher_id === (teacher.teacher_id || teacher.teacher?.id);
                      const isSelected = selectedBatchIds.includes(batch.id);
                      const enrolledCount = batchEnrollments.filter(enrollment => enrollment.batch_id === batch.id).length;
                      
                      return (
                        <label
                          key={batch.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                            isAssigned
                              ? 'bg-green-50 border-green-200'
                              : isSelected
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-[#DBE5E0] hover:bg-[#F0F5F2]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned || isSelected}
                            disabled={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBatchIds([...selectedBatchIds, batch.id]);
                              } else {
                                setSelectedBatchIds(selectedBatchIds.filter(id => id !== batch.id));
                              }
                            }}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-[#0F1717]">{batch.name}</h4>
                              {isAssigned && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Already Assigned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#5E8C7D]">
                              {batch.skill?.name || batch.skills?.name || 'No skill assigned'} • {enrolledCount}/{batch.max_students || 'N/A'} students
                            </p>
                          </div>
                        </label>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No unassigned batches available.</p>
              )}
              {selectedBatchIds.length > 0 && (
                <button
                  onClick={handleAssignBatches}
                  disabled={isAssigningBatches}
                  className="w-full px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors disabled:opacity-50"
                >
                  {isAssigningBatches ? 'Assigning...' : `Assign ${selectedBatchIds.length} Batch${selectedBatchIds.length > 1 ? 'es' : ''}`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Assigned Batches */}
        {teacher.status === 'approved' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Currently Assigned Batches ({teacherBatches.length})</h3>
            {teacherBatches.length > 0 ? (
              <div className="space-y-2">
                {teacherBatches.map((batch, index) => {
                  const enrolledCount = batchEnrollments.filter(enrollment => enrollment.batch_id === batch.id).length;
                  return (
                    <div key={index} className="bg-[#F0F5F2] rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-[#0F1717]">{batch.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#5E8C7D] mb-2">
                            {batch.skill?.name || batch.skills?.name || 'No skill assigned'} • {enrolledCount}/{batch.max_students || 'N/A'} students
                          </p>
                          {batch.start_date && batch.end_date && (
                            <p className="text-xs text-[#5E8C7D]">
                              {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFromBatch(batch.id, batch.name)}
                          disabled={loading}
                          className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Remove from batch"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No batches assigned to this teacher yet.</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              {teacher.status === 'approved' && (
                <>
                  <button
                    onClick={handleRejectTeacher}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Suspending...' : 'Suspend Teacher'}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors"
                  >
                    Edit Information
                  </button>
                  <button
                    onClick={handleRemoveTeacher}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Removing...' : 'Remove Teacher'}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
