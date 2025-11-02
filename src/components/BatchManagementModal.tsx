import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { CreateTopic } from './CreateTopic';
import { UpdateTopic } from './UpdateTopic';
import { ViewTopic } from '../pages/ViewTopic';
import { useAuth } from '../hooks/useAuth';

interface BatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: {
    id: string;
    name: string;
    skill_id: string;
    teacher_id: string;
    academy_id: string;
    max_students?: number;
    status: string;
    skill?: {
      id: string;
      name: string;
    };
    teacher?: {
      id: string;
      full_name: string;
    };
  } | null;
  academyId: string;
  onBatchUpdated: () => void;
}

export const BatchManagementModal: React.FC<BatchManagementModalProps> = ({
  isOpen,
  onClose,
  batch,
  academyId,
  onBatchUpdated
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(!batch);
  const [editedBatch, setEditedBatch] = useState({
    name: '',
    skill_id: '',
    teacher_id: '',
    max_students: 20,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  
  // Topic modal states
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [showUpdateTopic, setShowUpdateTopic] = useState(false);
  const [showViewTopic, setShowViewTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (batch) {
        setEditedBatch({
          name: batch.name,
          skill_id: batch.skill_id,
          teacher_id: batch.teacher_id,
          max_students: batch.max_students || 20,
          status: batch.status
        });
        setIsCreating(false);
        setIsEditing(false);
      } else {
        setIsCreating(true);
        setEditedBatch({
          name: '',
          skill_id: '',
          teacher_id: '',
          max_students: 20,
          status: 'active'
        });
      }
      loadBatchData();
    }
  }, [isOpen, batch]);

  const loadBatchData = async () => {
    try {
      // Load available teachers
      const teachersResponse = await AdminApi.getAcademyTeachers(academyId);
      if (teachersResponse.data) {
        setAvailableTeachers(teachersResponse.data);
      }

      // Load available skills
      const skillsResponse = await AdminApi.getAcademySkills(academyId);
      if (skillsResponse.data) {
        setAvailableSkills(skillsResponse.data);
      }

      // Load available students (approved only)
      const studentsResponse = await AdminApi.getAcademyStudents(academyId);
      if (studentsResponse.data) {
        const approvedStudents = studentsResponse.data.filter(
          student => student.status === 'approved'
        );
        setAvailableStudents(approvedStudents);
      }

      // Load batch students if editing existing batch
      if (batch) {
        const enrollmentsResponse = await AdminApi.getAcademyBatchEnrollments(academyId);
        if (enrollmentsResponse.data) {
          const batchStudents = enrollmentsResponse.data.filter(
            enrollment => enrollment.batch_id === batch.id
          );
          setBatchStudents(batchStudents);
        }

        // Load batch topics
        const topicsResponse = await AdminApi.getBatchTopics(batch.id);
        if (topicsResponse.data) {
          setTopics(topicsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isCreating) {
        // Create new batch
        const { error } = await AdminApi.createBatch({
          name: editedBatch.name,
          skill_id: editedBatch.skill_id,
          teacher_id: editedBatch.teacher_id,
          academy_id: academyId,
          max_students: editedBatch.max_students,
          status: editedBatch.status
        });

        if (error) {
          setError(error);
          return;
        }
      } else {
        // Update existing batch
        const { error } = await AdminApi.updateBatch(batch!.id, {
          name: editedBatch.name,
          skill_id: editedBatch.skill_id,
          teacher_id: editedBatch.teacher_id,
          max_students: editedBatch.max_students,
          status: editedBatch.status
        });

        if (error) {
          setError(error);
          return;
        }
      }

      setIsEditing(false);
      setIsCreating(false);
      onBatchUpdated();
    } catch (error) {
      setError(`Failed to ${isCreating ? 'create' : 'update'} batch`);
      console.error('Error saving batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent || !batch) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.assignStudentToBatch(selectedStudent, batch.id);
      
      if (error) {
        setError(error);
        return;
      }

      setSelectedStudent('');
      loadBatchData();
      onBatchUpdated();
    } catch (error) {
      setError('Failed to add student to batch');
      console.error('Error adding student to batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the batch?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.removeStudentFromBatch(enrollmentId);
      
      if (error) {
        setError(error);
        return;
      }

      loadBatchData();
      onBatchUpdated();
    } catch (error) {
      setError('Failed to remove student from batch');
      console.error('Error removing student from batch:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await AdminApi.deleteBatchTopic(topicId);
      
      if (error) {
        setError(error);
        return;
      }

      loadBatchData();
      onBatchUpdated();
    } catch (error) {
      setError('Failed to delete topic');
      console.error('Error deleting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal-based topic handlers
  const handleCreateTopicModal = async (topicData: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => {
    if (!batch) return;

    try {
      const { error } = await AdminApi.createBatchTopic(
        batch.id,
        {
          title: topicData.title,
          description: topicData.description,
          due_date: topicData.dueDate
        },
        user?.id // Pass the current user's ID as created_by
        // Note: File attachments not implemented yet in backend
      );

      if (error) {
        alert('Failed to create topic: ' + error);
        return;
      }

      await loadBatchData();
      setShowCreateTopic(false);
      onBatchUpdated();
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic');
    }
  };

  const handleUpdateTopicModal = async (topicData: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => {
    if (!selectedTopic) return;

    try {
      const { error } = await AdminApi.updateBatchTopic(selectedTopic.id, {
        title: topicData.title,
        description: topicData.description,
        due_date: topicData.dueDate
      });

      if (error) {
        alert('Failed to update topic: ' + error);
        return;
      }

      await loadBatchData();
      setShowUpdateTopic(false);
      setSelectedTopic(null);
      onBatchUpdated();
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Failed to update topic');
    }
  };

  const handleViewTopic = (topic: any) => {
    setSelectedTopic(topic);
    setShowViewTopic(true);
  };

  const handleEditTopic = (topic: any) => {
    setSelectedTopic(topic);
    setShowUpdateTopic(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0F1717]">
            {isCreating ? 'Create New Batch' : 'Manage Batch'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Batch Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Batch Information</h3>
            
            {isEditing || isCreating ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F1717] mb-2">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    value={editedBatch.name}
                    onChange={(e) => setEditedBatch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    placeholder="Enter batch name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-2">
                      Skill *
                    </label>
                    <select
                      value={editedBatch.skill_id}
                      onChange={(e) => setEditedBatch(prev => ({ ...prev, skill_id: e.target.value }))}
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
                    <label className="block text-sm font-medium text-[#0F1717] mb-2">
                      Teacher *
                    </label>
                    <select
                      value={editedBatch.teacher_id}
                      onChange={(e) => setEditedBatch(prev => ({ ...prev, teacher_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    >
                      <option value="">Select a teacher</option>
                      {availableTeachers.map((teacher) => (
                        <option key={teacher.teacher_id} value={teacher.teacher_id}>
                          {teacher.teacher?.full_name || 'Unknown Teacher'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-2">
                      Max Students
                    </label>
                    <input
                      type="number"
                      value={editedBatch.max_students}
                      onChange={(e) => setEditedBatch(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F1717] mb-2">
                      Status
                    </label>
                    <select
                      value={editedBatch.status}
                      onChange={(e) => setEditedBatch(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F0F5F2] rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-bold text-[#0F1717] text-lg">{batch?.name}</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-[#0F1717]">Skill:</span>
                    <p className="text-[#5E8C7D]">{batch?.skill?.name || 'No skill assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#0F1717]">Teacher:</span>
                    <p className="text-[#5E8C7D]">{batch?.teacher?.full_name || 'No teacher assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#0F1717]">Max Students:</span>
                    <p className="text-[#5E8C7D]">{batch?.max_students || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#0F1717]">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : batch?.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {batch?.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Students and Topics */}
          <div>
            {/* Students Management */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Students ({batchStudents.length})</h3>
              
              {/* Add Student */}
              {batch && (
                <div className="mb-4 p-3 bg-[#F0F5F2] rounded-lg">
                  <h4 className="font-medium text-[#0F1717] mb-2">Add Student to Batch</h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E8C7D]"
                    >
                      <option value="">Select a student</option>
                      {availableStudents
                        .filter(student => !batchStudents.some(bs => bs.student_id === student.student_id))
                        .map((student) => (
                        <option key={student.student_id} value={student.student_id}>
                          {student.student?.full_name || 'Unknown Student'}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddStudent}
                      disabled={!selectedStudent || loading}
                      className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Current Students */}
              {batchStudents.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {batchStudents.map((enrollment, index) => (
                    <div key={index} className="bg-[#F0F5F2] rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-[#0F1717]">
                            {enrollment.student?.full_name || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-[#5E8C7D]">
                            {enrollment.student?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(enrollment.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No students enrolled in this batch.</p>
              )}
            </div>

            {/* Topics Management */}
            {batch && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#0F1717]">Topics ({topics.length})</h3>
                  <button
                    onClick={() => setShowCreateTopic(true)}
                    className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Create Topic
                  </button>
                </div>

                {/* Current Topics */}
                {topics.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {topics.map((topic, index) => (
                      <div key={topic.id || index} className="bg-white border border-[#DBE5E0] rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 cursor-pointer" onClick={() => handleViewTopic(topic)}>
                            <h4 className="font-semibold text-[#0F1717] mb-1">{topic.title}</h4>
                            <p className="text-sm text-[#5E8C7D] mb-2 line-clamp-2">{topic.description}</p>
                            {topic.due_date && (
                              <p className="text-xs text-[#5E8C7D]">
                                📅 Due: {new Date(topic.due_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTopic(topic)}
                              disabled={loading}
                              className="p-2 text-[#009963] hover:bg-[#F0F5F2] rounded-lg transition-colors disabled:opacity-50"
                              title="Edit topic"
                            >
                              <svg width="18" height="18" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.50004 15.8095L9.50007 15.8094L15.6633 9.64623C14.8245 9.29711 13.831 8.72363 12.8914 7.78403C11.9516 6.84428 11.3781 5.85061 11.029 5.01171L4.86568 11.175L4.86567 11.1751C4.38471 11.656 4.14422 11.8965 3.9374 12.1617C3.69344 12.4744 3.48427 12.8129 3.31361 13.171C3.16893 13.4746 3.06139 13.7972 2.84629 14.4425L1.71203 17.8453C1.60618 18.1628 1.68883 18.5129 1.92552 18.7496C2.1622 18.9863 2.51231 19.0689 2.82986 18.9631L6.23264 17.8288C6.87792 17.6137 7.20057 17.5062 7.50414 17.3615C7.86223 17.1909 8.20067 16.9817 8.51346 16.7377C8.77861 16.5309 9.01911 16.2904 9.50004 15.8095Z" fill="currentColor"/>
                                <path d="M17.3735 7.93601C18.6533 6.65626 18.6533 4.58137 17.3735 3.30161C16.0938 2.02186 14.0189 2.02186 12.7391 3.30161L11.9999 4.04081C12.01 4.07138 12.0205 4.10237 12.0314 4.13376C12.3024 4.91471 12.8136 5.93847 13.7753 6.90015C14.7369 7.86183 15.7607 8.37303 16.5416 8.64398C16.5729 8.65482 16.6037 8.66527 16.6342 8.67535L17.3735 7.93601Z" fill="currentColor"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete topic"
                            >
                              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.33333 9.16667V14.1667M11.6667 9.16667V14.1667M3.33333 5.83333H16.6667M15.8333 5.83333L15.1105 15.9521C15.0482 16.8243 14.3225 17.5 13.4481 17.5H6.55188C5.67751 17.5 4.95176 16.8243 4.88951 15.9521L4.16667 5.83333M7.5 5.83333V3.33333C7.5 2.8731 7.8731 2.5 8.33333 2.5H11.6667C12.1269 2.5 12.5 2.8731 12.5 3.33333V5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#F0F5F2] rounded-lg">
                    <p className="text-[#5E8C7D] mb-3">No topics created for this batch yet.</p>
                    <button
                      onClick={() => setShowCreateTopic(true)}
                      className="text-sm text-[#009963] hover:underline"
                    >
                      Create your first topic →
                    </button>
                  </div>
                )}
              </div>
            )}
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
          {isEditing || isCreating ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !editedBatch.name || !editedBatch.skill_id || !editedBatch.teacher_id}
                className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (isCreating ? 'Create Batch' : 'Save Changes')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#5E8C7D] text-white rounded-lg hover:bg-[#4a6b5d] transition-colors"
            >
              Edit Batch
            </button>
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopic && (
        <CreateTopic
          isOpen={showCreateTopic}
          onClose={() => setShowCreateTopic(false)}
          onSubmit={handleCreateTopicModal}
        />
      )}

      {/* Update Topic Modal */}
      {showUpdateTopic && selectedTopic && (
        <UpdateTopic
          isOpen={showUpdateTopic}
          onClose={() => {
            setShowUpdateTopic(false);
            setSelectedTopic(null);
          }}
          onSubmit={handleUpdateTopicModal}
          initialData={{
            title: selectedTopic.title,
            description: selectedTopic.description,
            dueDate: selectedTopic.due_date
          }}
        />
      )}

      {/* View Topic Modal */}
      {showViewTopic && selectedTopic && (
        <ViewTopic
          isOpen={showViewTopic}
          onClose={() => {
            setShowViewTopic(false);
            setSelectedTopic(null);
          }}
        />
      )}
    </div>
  );
};
