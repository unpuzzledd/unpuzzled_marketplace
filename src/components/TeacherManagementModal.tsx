import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';

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

  useEffect(() => {
    if (isOpen && teacher.teacher) {
      setEditedTeacher({
        full_name: teacher.teacher.full_name,
        email: teacher.teacher.email
      });
      loadTeacherBatches();
    }
  }, [isOpen, teacher]);

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

  const handleSave = async () => {
    if (!teacher.teacher) return;
    
    setLoading(true);
    setError(null);

    try {
      // Update teacher information
      const { data, error } = await AdminApi.updateUser(teacher.teacher_id, {
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#5E8C7D] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {teacher.teacher.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0F1717]">{teacher.teacher.full_name}</h4>
                  <p className="text-sm text-[#5E8C7D]">{teacher.teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#0F1717]">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  teacher.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {teacher.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Batches */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Assigned Batches</h3>
          {teacherBatches.length > 0 ? (
            <div className="space-y-2">
              {teacherBatches.map((batch, index) => {
                const enrolledCount = batchEnrollments.filter(enrollment => enrollment.batch_id === batch.id).length;
                return (
                <div key={index} className="bg-[#F0F5F2] rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-[#0F1717]">{batch.name}</h4>
                      <p className="text-sm text-[#5E8C7D]">
                        {batch.skill?.name || batch.skills?.name || 'No skill assigned'} • {enrolledCount}/{batch.max_students || 'N/A'} students
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No batches assigned to this teacher.</p>
          )}
        </div>

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
        </div>
      </div>
    </div>
  );
};
