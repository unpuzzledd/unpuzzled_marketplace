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
    notes?: string | null;
    student: {
      id: string;
      full_name: string;
      email: string;
      date_of_birth?: string | null;
      school_name?: string | null;
      location?: string | null;
      [key: string]: any; // Allow additional properties from API
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
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


  const handleApproveClick = () => {
    setApprovalAction('approve');
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = () => {
    setApprovalAction('reject');
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!approvalAction) return;

    setLoading(true);
    setError(null);

    try {
      const status = approvalAction === 'approve' ? 'approved' : 'rejected';
      const { error } = await AdminApi.updateStudentEnrollmentStatus(
        student.id, 
        status,
        approvalNotes.trim() || null
      );
      
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setShowApprovalModal(false);
      setApprovalAction(null);
      setApprovalNotes('');
      
      if (approvalAction === 'reject') {
        onClose();
      }
      
      onStudentUpdated();
    } catch (error) {
      setError(`Failed to ${approvalAction} student`);
      console.error(`Error ${approvalAction}ing student:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApproval = () => {
    setShowApprovalModal(false);
    setApprovalAction(null);
    setApprovalNotes('');
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
        parseInt(newScore.score)
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
                  {student.student?.date_of_birth && (
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
                  {student.student?.school_name && (
                    <div className="text-sm text-[#0F1717]">
                      <span className="font-medium">School:</span>{' '}
                      <span className="text-[#5E8C7D]">{student.student.school_name}</span>
                    </div>
                  )}
                  {student.student?.location && (
                    <div className="text-sm text-[#0F1717]">
                      <span className="font-medium">Location:</span>{' '}
                      <span className="text-[#5E8C7D]">{student.student.location}</span>
                    </div>
                  )}
                </div>
              </div>

            {/* Approval Actions */}
            {(student.status === 'pending' || student.status === 'rejected') && (
              <div className={`mt-4 space-y-2 p-4 rounded-lg ${
                student.status === 'pending' 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className="font-medium text-[#0F1717]">
                  {student.status === 'pending' 
                    ? 'Enrollment Actions' 
                    : 'Re-enrollment Actions'}
                </h4>
                <p className="text-xs text-[#5E8C7D] mb-3">
                  {student.status === 'pending'
                    ? 'Review and approve or reject this student\'s enrollment request.'
                    : 'This student was previously rejected. You can approve them now if you change your mind.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveClick}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {student.status === 'rejected' ? 'Approve Now' : 'Approve Student'}
                  </button>
                  {student.status === 'pending' && (
                    <button
                      onClick={handleRejectClick}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reject Student
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Show notes if enrollment has been processed */}
            {student.status !== 'pending' && (student as any).notes && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-[#0F1717] mb-1">Academy Notes:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{(student as any).notes}</p>
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
                          <p className="text-sm text-[#5E8C7D] capitalize">{score.level || 'beginner'}</p>
                        </div>
                        <span className="text-lg font-bold text-[#5E8C7D]">{score.score || 0}</span>
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && approvalAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCancelApproval}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {approvalAction === 'approve' ? 'Approve Student' : 'Reject Student'}
                </h3>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  {approvalAction === 'approve' 
                    ? 'Are you sure you want to approve this student enrollment? You can add optional notes below.'
                    : 'Are you sure you want to reject this student enrollment? Please provide a reason (optional but recommended).'}
                </p>
                
                <div className="mb-4">
                  <label htmlFor="approval-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {approvalAction === 'reject' && <span className="text-gray-500">(Optional but recommended)</span>}
                  </label>
                  <textarea
                    id="approval-notes"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={approvalAction === 'approve' 
                      ? 'Add welcome message or instructions for the student...'
                      : 'Provide reason for rejection (this will be visible to the student)...'}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={handleCancelApproval}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApproval}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Processing...' : approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
