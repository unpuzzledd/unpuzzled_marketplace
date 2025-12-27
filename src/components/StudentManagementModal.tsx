import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    student_id: string;
    academy_id: string;
    status: string;
    student: {
      id: string;
      full_name: string;
      email: string;
    } | null;
  };
  onStudentUpdated: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState({
    full_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentBatches, setStudentBatches] = useState<any[]>([]);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [studentScores, setStudentScores] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [newScore, setNewScore] = useState({
    skill_id: '',
    score: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && student.student) {
      setEditedStudent({
        full_name: student.student.full_name,
        email: student.student.email
      });
      loadStudentData();
    }
  }, [isOpen, student]);

  const loadStudentData = async () => {
    try {
      console.log('Loading student data for:', student);
      
      // Load student's batch enrollments
      const batchesResponse = await AdminApi.getAcademyBatchEnrollments(student.academy_id);
      console.log('Batch enrollments response:', batchesResponse);
      if (batchesResponse.data) {
        const studentBatches = batchesResponse.data.filter(
          enrollment => enrollment.student_id === student.student_id
        );
        console.log('Filtered student batches:', studentBatches);
        setStudentBatches(studentBatches);
      }

      // Load available batches for assignment
      const academyBatchesResponse = await AdminApi.getAcademyBatches(student.academy_id);
      console.log('Available batches response:', academyBatchesResponse);
      if (academyBatchesResponse.data) {
        setAvailableBatches(academyBatchesResponse.data);
      }

      // Load student scores
      const scoresResponse = await AdminApi.getAcademyStudentScores(student.academy_id);
      console.log('Student scores response:', scoresResponse);
      if (scoresResponse.data) {
        const studentScores = scoresResponse.data.filter(
          score => score.student_id === student.student_id
        );
        console.log('Filtered student scores:', studentScores);
        setStudentScores(studentScores);
      }

      // Load available skills
      const skillsResponse = await AdminApi.getAcademySkills(student.academy_id);
      console.log('Available skills response:', skillsResponse);
      if (skillsResponse.data) {
        setAvailableSkills(skillsResponse.data);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const handleSave = async () => {
    if (!student.student) return;
    
    setLoading(true);
    setError(null);

    try {
      // Update student information
      const { error } = await AdminApi.updateUser(student.student_id, {
        full_name: editedStudent.full_name,
        email: editedStudent.email
      });

      if (error) {
        setError(error);
        return;
      }

      setIsEditing(false);
      onStudentUpdated();
    } catch (error) {
      setError('Failed to update student information');
      console.error('Error updating student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.updateStudentEnrollmentStatus(student.id, 'approved');
      
      if (error) {
        setError(error);
        return;
      }

      onStudentUpdated();
    } catch (error) {
      setError('Failed to approve student');
      console.error('Error approving student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectStudent = async () => {
    if (!confirm('Are you sure you want to reject this student?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.updateStudentEnrollmentStatus(student.id, 'rejected');
      
      if (error) {
        setError(error);
        return;
      }

      onStudentUpdated();
      onClose();
    } catch (error) {
      setError('Failed to reject student');
      console.error('Error rejecting student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToBatch = async () => {
    if (!selectedBatch) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.assignStudentToBatch(student.student_id, selectedBatch);
      
      if (error) {
        setError(error);
        return;
      }

      setSelectedBatch('');
      loadStudentData();
      onStudentUpdated();
    } catch (error) {
      setError('Failed to assign student to batch');
      console.error('Error assigning student to batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScore = async () => {
    if (!newScore.skill_id || !newScore.score) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.addStudentScore(
        student.student_id,
        student.academy_id,
        newScore.skill_id,
        parseInt(newScore.score),
        newScore.notes
      );
      
      if (error) {
        setError(error);
        return;
      }

      setNewScore({ skill_id: '', score: '', notes: '' });
      loadStudentData();
      onStudentUpdated();
    } catch (error) {
      setError('Failed to add student score');
      console.error('Error adding student score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student.student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0F1717]">Manage Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Student Information</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F1717] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedStudent.full_name}
                    onChange={(e) => setEditedStudent(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F1717] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editedStudent.email}
                    onChange={(e) => setEditedStudent(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#F0F5F2] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#5E8C7D] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {student.student.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F1717]">{student.student.full_name}</h4>
                    <p className="text-sm text-[#5E8C7D]">{student.student.email}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0F1717]">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : student.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  {student.student.date_of_birth && (
                    <div className="text-sm text-[#0F1717]">
                      <span className="font-medium">Date of Birth:</span>{' '}
                      <span className="text-[#5E8C7D]">
                        {new Date(student.student.date_of_birth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {student.student.school_name && (
                    <div className="text-sm text-[#0F1717]">
                      <span className="font-medium">School:</span>{' '}
                      <span className="text-[#5E8C7D]">{student.student.school_name}</span>
                    </div>
                  )}
                  {student.student.location && (
                    <div className="text-sm text-[#0F1717]">
                      <span className="font-medium">Location:</span>{' '}
                      <span className="text-[#5E8C7D]">{student.student.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Actions */}
            {student.status === 'pending' && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-[#0F1717]">Enrollment Actions</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveStudent}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve Student
                  </button>
                  <button
                    onClick={handleRejectStudent}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Reject Student
                  </button>
                </div>
              </div>
            )}

            {/* Batch Assignment */}
            {student.status === 'approved' && (
              <div className="mt-4">
                <h4 className="font-medium text-[#0F1717] mb-2">Assign to Batch</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                  >
                    <option value="">Select a batch</option>
                    {availableBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} - {batch.skill?.name || 'No skill'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignToBatch}
                    disabled={!selectedBatch || loading}
                    className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Batches and Scores */}
          <div>
            {/* Current Batches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Current Batches</h3>
              {studentBatches.length > 0 ? (
                <div className="space-y-2">
                  {studentBatches.map((enrollment, index) => (
                    <div key={index} className="bg-[#F0F5F2] rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-[#0F1717]">{enrollment.batch?.name}</h4>
                          <p className="text-sm text-[#5E8C7D]">
                            {enrollment.batch?.skill?.name || 'No skill assigned'}
                          </p>
                        </div>
                        <span className="text-xs text-[#5E8C7D]">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No batches assigned to this student.</p>
              )}
            </div>

            {/* Student Scores */}
            <div>
              <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Student Scores</h3>
              {studentScores.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {studentScores.map((score, index) => (
                    <div key={index} className="bg-[#F0F5F2] rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-[#0F1717]">{score.skill?.name || 'Unknown Skill'}</h4>
                          <p className="text-sm text-[#5E8C7D]">{score.notes || 'No notes'}</p>
                        </div>
                        <span className="text-lg font-bold text-[#5E8C7D]">{score.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No scores recorded for this student.</p>
              )}

              {/* Add New Score */}
              <div className="bg-[#F0F5F2] rounded-lg p-4">
                <h4 className="font-medium text-[#0F1717] mb-3">Add New Score</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-1">
                      Skill
                    </label>
                    <select
                      value={newScore.skill_id}
                      onChange={(e) => setNewScore(prev => ({ ...prev, skill_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    >
                      <option value="">Select a skill</option>
                      {availableSkills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-1">
                      Score (4-digit)
                    </label>
                    <input
                      type="number"
                      value={newScore.score}
                      onChange={(e) => setNewScore(prev => ({ ...prev, score: e.target.value }))}
                      placeholder="0000"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newScore.notes}
                      onChange={(e) => setNewScore(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about the score..."
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={handleAddScore}
                    disabled={!newScore.skill_id || !newScore.score || loading}
                    className="w-full px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors disabled:opacity-50"
                  >
                    Add Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
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
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors"
            >
              Edit Information
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
