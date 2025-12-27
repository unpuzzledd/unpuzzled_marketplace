import React, { useState, useEffect } from 'react'
import { TeacherApi } from '../../lib/teacherApi'
import { CreateTopic } from '../CreateTopic'
import { UpdateTopic } from '../UpdateTopic'
import { ViewTopic } from '../../pages/ViewTopic'
import { StudentScoreModal } from './StudentScoreModal'
import { AdminApi } from '../../lib/adminApi'
import { mergeScheduleWithExceptions, formatScheduleTime, getDayName } from '../../utils/scheduleUtils'

interface TeacherBatchDetailModalProps {
  isOpen: boolean
  onClose: () => void
  batch: any
  teacherId: string
  onRefresh?: () => void
}

export const TeacherBatchDetailModal: React.FC<TeacherBatchDetailModalProps> = ({
  isOpen,
  onClose,
  batch,
  teacherId,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'students'>('overview')
  const [students, setStudents] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mergedSchedule, setMergedSchedule] = useState<any[]>([])
  
  // Modal states for topic management
  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [showViewTopic, setShowViewTopic] = useState(false)
  const [showUpdateTopic, setShowUpdateTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  
  // Student score modal state
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    if (isOpen && batch) {
      loadBatchData()
    }
  }, [isOpen, batch])

  const loadBatchData = async () => {
    if (!batch?.id) {
      console.error('No batch ID provided')
      setError('Invalid batch data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading batch data for batch ID:', batch.id)

      // Load students with scores
      const studentsResponse = await TeacherApi.getBatchStudentsWithScores(batch.id, teacherId)
      console.log('Students response:', studentsResponse)
      
      if (studentsResponse.error) {
        console.error('Students error:', studentsResponse.error)
        setError(studentsResponse.error)
      } else if (studentsResponse.data) {
        setStudents(studentsResponse.data)
      }

      // Load topics
      const topicsResponse = await TeacherApi.getBatchTopics(batch.id)
      console.log('Topics response:', topicsResponse)
      
      if (topicsResponse.error) {
        console.error('Topics error:', topicsResponse.error)
        setError(topicsResponse.error)
      } else if (topicsResponse.data) {
        setTopics(topicsResponse.data)
      }

      // Load schedule exceptions and merge with schedule
      if (batch.weekly_schedule && batch.weekly_schedule.length > 0 && batch.start_date && batch.end_date) {
        const exceptionsResponse = await AdminApi.getBatchScheduleExceptions(batch.id)
        const merged = mergeScheduleWithExceptions(
          batch.weekly_schedule,
          exceptionsResponse.data || [],
          batch.start_date,
          batch.end_date
        )
        setMergedSchedule(merged)
      } else {
        setMergedSchedule([])
      }
    } catch (error) {
      console.error('Error loading batch data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load batch data')
    } finally {
      setLoading(false)
      console.log('Loading complete. Students:', students.length, 'Topics:', topics.length)
    }
  }

  const handleCreateTopic = async (topicData: {
    title: string
    description: string
    dueDate?: string
    attachments: File[]
  }) => {
    try {
      const { error } = await TeacherApi.createTopic(
        batch.id,
        {
          title: topicData.title,
          description: topicData.description,
          due_date: topicData.dueDate
        },
        teacherId
      )

      if (error) {
        alert('Failed to create topic: ' + error)
        return
      }

      // Refresh topics list
      await loadBatchData()
      setShowCreateTopic(false)
      
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Error creating topic:', error)
      alert('Failed to create topic')
    }
  }

  const handleUpdateTopic = async (topicData: {
    title: string
    description: string
    dueDate?: string
    attachments: File[]
  }) => {
    if (!selectedTopic) return

    try {
      const { error } = await TeacherApi.updateTopic(selectedTopic.id, {
        title: topicData.title,
        description: topicData.description,
        due_date: topicData.dueDate
      })

      if (error) {
        alert('Failed to update topic: ' + error)
        return
      }

      // Refresh topics list
      await loadBatchData()
      setShowUpdateTopic(false)
      setSelectedTopic(null)
      
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Error updating topic:', error)
      alert('Failed to update topic')
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return
    }

    try {
      const { error } = await TeacherApi.deleteTopic(topicId)

      if (error) {
        alert('Failed to delete topic: ' + error)
        return
      }

      // Refresh topics list
      await loadBatchData()
      
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Failed to delete topic')
    }
  }

  const handleViewTopic = (topic: any) => {
    setSelectedTopic(topic)
    setShowViewTopic(true)
  }

  const handleEditTopic = (topic: any) => {
    setSelectedTopic(topic)
    setShowUpdateTopic(true)
  }

  const handleUpdateScore = (student: any) => {
    setSelectedStudent(student)
    setShowScoreModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#DBE5E0] px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#0F1717]">{batch?.name}</h2>
              <p className="text-sm text-[#5E8C7D]">
                {batch?.skill?.name} • {batch?.academy?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#DBE5E0] px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#009963] text-[#009963] font-semibold'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'topics'
                    ? 'border-[#009963] text-[#009963] font-semibold'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Topics ({topics.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-[#009963] text-[#009963] font-semibold'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Students ({students.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009963]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#F0F5F2] rounded-lg p-4">
                      <h3 className="font-bold text-[#0F1717] mb-3">Batch Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Skill:</span>
                          <span className="text-[#0F1717] font-medium">{batch?.skill?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Start Date:</span>
                          <span className="text-[#0F1717] font-medium">{formatDate(batch?.start_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">End Date:</span>
                          <span className="text-[#0F1717] font-medium">{formatDate(batch?.end_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Max Students:</span>
                          <span className="text-[#0F1717] font-medium">{batch?.max_students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            batch?.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {batch?.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F0F5F2] rounded-lg p-4">
                      <h3 className="font-bold text-[#0F1717] mb-3">Quick Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Enrolled Students:</span>
                          <span className="text-[#0F1717] font-medium">
                            {students.length} / {batch?.max_students}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Total Topics:</span>
                          <span className="text-[#0F1717] font-medium">{topics.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5E8C7D]">Upcoming Topics:</span>
                          <span className="text-[#0F1717] font-medium">
                            {topics.filter(t => t.due_date && new Date(t.due_date) > new Date()).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    {batch?.weekly_schedule && batch.weekly_schedule.length > 0 && (
                      <div className="bg-[#F0F5F2] rounded-lg p-4 mt-6">
                        <h3 className="text-base font-semibold text-[#0F1717] mb-3">Weekly Schedule</h3>
                        {mergedSchedule.length > 0 ? (
                          <div className="space-y-2">
                            {mergedSchedule.slice(0, 10).map((scheduleItem, index) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPast = scheduleItem.date < today;
                              if (isPast) return null;

                              return (
                                <div key={index} className="bg-white rounded-lg p-3 border border-[#DBE5E0]">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-[#0F1717] text-sm">
                                        {getDayName(scheduleItem.day)}, {scheduleItem.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                      {scheduleItem.status === 'cancelled' ? (
                                        <div className="text-sm text-red-600 line-through">
                                          {formatScheduleTime(scheduleItem.from_time)} - {formatScheduleTime(scheduleItem.to_time)}
                                          <span className="ml-2 text-xs">(Unavailable)</span>
                                        </div>
                                      ) : scheduleItem.status === 'time_changed' ? (
                                        <div className="text-sm text-[#5E8C7D]">
                                          {formatScheduleTime(scheduleItem.from_time)} - {formatScheduleTime(scheduleItem.to_time)}
                                          {scheduleItem.original_time && (
                                            <span className="ml-2 text-xs text-gray-500">
                                              (changed from {scheduleItem.original_time})
                                            </span>
                                          )}
                                        </div>
                                      ) : scheduleItem.status === 'moved' ? (
                                        <div className="text-sm text-[#5E8C7D]">
                                          {getDayName(scheduleItem.day)}: {formatScheduleTime(scheduleItem.from_time)} - {formatScheduleTime(scheduleItem.to_time)}
                                          {scheduleItem.original_time && (
                                            <span className="ml-2 text-xs text-gray-500">
                                              (moved from {scheduleItem.original_time})
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-[#5E8C7D]">
                                          {formatScheduleTime(scheduleItem.from_time)} - {formatScheduleTime(scheduleItem.to_time)}
                                        </div>
                                      )}
                                      {scheduleItem.exception?.notes && (
                                        <p className="text-xs text-gray-600 mt-1 italic">{scheduleItem.exception.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {mergedSchedule.length > 10 && (
                              <p className="text-xs text-[#5E8C7D] text-center mt-2">
                                Showing next 10 classes. {mergedSchedule.length - 10} more upcoming.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-[#5E8C7D]">
                            {batch.weekly_schedule.map((entry: any, idx: number) => (
                              <div key={idx} className="mb-1">
                                {getDayName(entry.day)}: {formatScheduleTime(entry.from_time)} - {formatScheduleTime(entry.to_time)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Topics Tab */}
                {activeTab === 'topics' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-[#0F1717]">Topics</h3>
                      <button
                        onClick={() => setShowCreateTopic(true)}
                        className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors"
                      >
                        + Create Topic
                      </button>
                    </div>

                    {topics.length === 0 ? (
                      <div className="text-center py-12 text-[#5E8C7D]">
                        No topics created yet. Click "Create Topic" to add one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topics.map(topic => (
                          <div
                            key={topic.id}
                            className="bg-[#F0F5F2] rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-bold text-[#0F1717] mb-1">{topic.title}</h4>
                                <p className="text-sm text-[#5E8C7D] mb-2">{topic.description}</p>
                                <p className="text-xs text-[#5E8C7D]">
                                  Due: {formatDate(topic.due_date)}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleViewTopic(topic)}
                                  className="px-3 py-1 text-sm bg-white text-[#009963] rounded hover:bg-[#E0E8E5] transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditTopic(topic)}
                                  className="px-3 py-1 text-sm bg-[#009963] text-white rounded hover:bg-[#007a4f] transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTopic(topic.id)}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-[#0F1717]">Students</h3>
                    </div>

                    {students.length === 0 ? (
                      <div className="text-center py-12 text-[#5E8C7D]">
                        No students enrolled in this batch yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {students.map(student => (
                          <div
                            key={student.id}
                            className="bg-[#F0F5F2] rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#5E8C7D] rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {student.student?.full_name?.charAt(0).toUpperCase() || 'S'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-[#0F1717]">
                                    {student.student?.full_name || 'Unknown Student'}
                                  </h4>
                                  <p className="text-sm text-[#5E8C7D]">{student.student?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-[#5E8C7D]">Score</p>
                                  <p className="text-lg font-bold text-[#0F1717]">{student.score}</p>
                                  <p className="text-xs text-[#5E8C7D] capitalize">{student.level}</p>
                                </div>
                                <button
                                  onClick={() => handleUpdateScore(student)}
                                  className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors"
                                >
                                  Update Score
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Close Button */}
          <div className="sticky bottom-0 bg-white border-t border-[#DBE5E0] px-6 py-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[#F0F5F2] text-[#0F1717] rounded-lg hover:bg-[#E0E8E5] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopic && (
        <CreateTopic
          isOpen={showCreateTopic}
          onClose={() => setShowCreateTopic(false)}
          onSubmit={handleCreateTopic}
        />
      )}

      {/* Update Topic Modal */}
      {showUpdateTopic && selectedTopic && (
        <UpdateTopic
          isOpen={showUpdateTopic}
          onClose={() => {
            setShowUpdateTopic(false)
            setSelectedTopic(null)
          }}
          onSubmit={handleUpdateTopic}
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
            setShowViewTopic(false)
            setSelectedTopic(null)
          }}
        />
      )}

      {/* Student Score Modal */}
      {showScoreModal && selectedStudent && (
        <StudentScoreModal
          isOpen={showScoreModal}
          onClose={() => {
            setShowScoreModal(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          batch={batch}
          teacherId={teacherId}
          onScoreUpdated={() => {
            loadBatchData()
            if (onRefresh) onRefresh()
          }}
        />
      )}
    </>
  )
}

