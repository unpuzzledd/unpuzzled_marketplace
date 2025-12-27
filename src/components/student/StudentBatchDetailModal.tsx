import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { StudentApi } from '../../lib/studentApi'
import { ViewTopic } from '../../pages/ViewTopic'

interface StudentBatchDetailModalProps {
  isOpen: boolean
  onClose: () => void
  batch: any
  studentId: string
}

type TabType = 'overview' | 'topics' | 'progress'

export const StudentBatchDetailModal = ({ 
  isOpen, 
  onClose, 
  batch, 
  studentId 
}: StudentBatchDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [batchDetails, setBatchDetails] = useState<any>(null)
  const [topics, setTopics] = useState<any[]>([])
  const [score, setScore] = useState<any>(null)
  const [rank, setRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showViewTopic, setShowViewTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  useEffect(() => {
    const fetchBatchData = async () => {
      if (!isOpen || !batch) return

      setLoading(true)
      try {
        const [detailsRes, topicsRes, scoreRes, rankRes] = await Promise.all([
          StudentApi.getBatchDetails(batch.id, studentId),
          StudentApi.getBatchTopics(batch.id),
          StudentApi.getBatchScore(studentId, batch.id),
          StudentApi.getMyRankInBatch(studentId, batch.id)
        ])

        if (detailsRes.data) setBatchDetails(detailsRes.data)
        if (topicsRes.data) setTopics(topicsRes.data)
        if (scoreRes.data) setScore(scoreRes.data)
        if (rankRes.data) setRank(rankRes.data)

        // Note: Schedule merging is handled in the display component if needed
      } catch (error) {
        console.error('Error fetching batch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBatchData()
  }, [isOpen, batch, studentId])

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const isPastDue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const handleViewTopic = (topic: any) => {
    setSelectedTopic(topic)
    setShowViewTopic(true)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8EB]">
              <div>
                <h2 className="text-2xl font-bold text-[#0F1717]">
                  {batch?.name || 'Batch Details'}
                </h2>
                <p className="text-sm text-[#5E8C7D] mt-1">
                  {batch?.skill?.name} • {batch?.academy?.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F0F5F2] rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-[#0F1717]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E8EB] px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'topics'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'progress'
                    ? 'border-[#009963] text-[#009963]'
                    : 'border-transparent text-[#5E8C7D] hover:text-[#009963]'
                }`}
              >
                Progress
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Batch Info */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-[#5E8C7D] mb-1">
                              Start Date
                            </h3>
                            <p className="text-base text-[#0F1717]">
                              {formatDate(batchDetails?.start_date || batch?.start_date)}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[#5E8C7D] mb-1">
                              Status
                            </h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                              batchDetails?.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {batchDetails?.status || batch?.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-[#5E8C7D] mb-1">
                              End Date
                            </h3>
                            <p className="text-base text-[#0F1717]">
                              {formatDate(batchDetails?.end_date || batch?.end_date)}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[#5E8C7D] mb-1">
                              Class Size
                            </h3>
                            <p className="text-base text-[#0F1717]">
                              {batchDetails?.students_count || 0} / {batchDetails?.max_students || batch?.max_students} students
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Info */}
                      {(batchDetails?.teacher || batch?.teacher) && (
                        <div className="pt-6 border-t border-[#E5E8EB]">
                          <h3 className="text-lg font-bold text-[#0F1717] mb-3">
                            Instructor
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#5E8C7D] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {(batchDetails?.teacher?.full_name || batch?.teacher?.full_name)?.charAt(0).toUpperCase() || 'T'}
                              </span>
                            </div>
                            <div>
                              <p className="text-base font-medium text-[#0F1717]">
                                {batchDetails?.teacher?.full_name || batch?.teacher?.full_name}
                              </p>
                              <p className="text-sm text-[#5E8C7D]">
                                {batchDetails?.teacher?.email || batch?.teacher?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="pt-6 border-t border-[#E5E8EB]">
                        <h3 className="text-lg font-bold text-[#0F1717] mb-4">
                          Quick Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[#F0F5F2] rounded-lg p-4">
                            <p className="text-2xl font-bold text-[#009963]">
                              {batchDetails?.topics_count || topics.length}
                            </p>
                            <p className="text-sm text-[#5E8C7D] mt-1">Total Topics</p>
                          </div>
                          <div className="bg-[#F0F5F2] rounded-lg p-4">
                            <p className="text-2xl font-bold text-[#009963]">
                              {topics.filter(t => isPastDue(t.due_date)).length}
                            </p>
                            <p className="text-sm text-[#5E8C7D] mt-1">Completed</p>
                          </div>
                          <div className="bg-[#F0F5F2] rounded-lg p-4">
                            <p className="text-2xl font-bold text-[#009963]">
                              {score?.score || 0}
                            </p>
                            <p className="text-sm text-[#5E8C7D] mt-1">Your Score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Topics Tab */}
                  {activeTab === 'topics' && (
                    <div className="space-y-4">
                      {topics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#5E8C7D]">
                          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium">No topics yet</p>
                          <p className="text-sm mt-1">Your instructor hasn't added any topics to this batch</p>
                        </div>
                      ) : (
                        topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-start justify-between p-4 rounded-lg border border-[#DBE5E0] hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-[#0F1717] mb-1">
                                {topic.title}
                              </h4>
                              {topic.description && (
                                <p className="text-sm text-[#5E8C7D] mb-2 line-clamp-2">
                                  {topic.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-[#5E8C7D]">
                                  Due: {formatDate(topic.due_date)}
                                </span>
                                {isPastDue(topic.due_date) && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Completed
                                  </span>
                                )}
                                {!isPastDue(topic.due_date) && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    Upcoming
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewTopic(topic)}
                              className="ml-4 px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Progress Tab */}
                  {activeTab === 'progress' && (
                    <div className="space-y-6">
                      {/* Score & Level */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-[#009963] to-[#007a4f] rounded-lg p-6 text-white">
                          <h3 className="text-sm font-medium opacity-90 mb-2">
                            Your Score
                          </h3>
                          <p className="text-4xl font-bold">
                            {score?.score || 0}
                          </p>
                          <p className="text-sm opacity-90 mt-2">
                            Out of 9999 points
                          </p>
                        </div>

                        <div className="bg-[#F0F5F2] rounded-lg p-6">
                          <h3 className="text-sm font-medium text-[#5E8C7D] mb-2">
                            Your Level
                          </h3>
                          <p className="text-3xl font-bold text-[#009963] capitalize">
                            {score?.level || 'beginner'}
                          </p>
                          {rank && rank.total > 0 && (
                            <p className="text-sm text-[#5E8C7D] mt-2">
                              Rank {rank.rank} of {rank.total} students
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-[#5E8C7D]">
                            Topics Completion
                          </h3>
                          <span className="text-sm font-medium text-[#0F1717]">
                            {topics.filter(t => isPastDue(t.due_date)).length} / {topics.length}
                          </span>
                        </div>
                        <div className="w-full bg-[#E5E8EB] rounded-full h-3">
                          <div
                            className="bg-[#009963] h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${topics.length > 0 ? (topics.filter(t => isPastDue(t.due_date)).length / topics.length) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Performance Summary */}
                      <div className="pt-6 border-t border-[#E5E8EB]">
                        <h3 className="text-lg font-bold text-[#0F1717] mb-4">
                          Performance Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-[#DBE5E0] rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#5E8C7D]">Completed Topics</span>
                              <span className="text-2xl font-bold text-[#009963]">
                                {topics.filter(t => isPastDue(t.due_date)).length}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white border border-[#DBE5E0] rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#5E8C7D]">Upcoming Topics</span>
                              <span className="text-2xl font-bold text-[#009963]">
                                {topics.filter(t => !isPastDue(t.due_date)).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Info */}
                      {batchDetails?.enrollment && (
                        <div className="pt-6 border-t border-[#E5E8EB]">
                          <h3 className="text-sm font-medium text-[#5E8C7D] mb-2">
                            Enrolled Since
                          </h3>
                          <p className="text-base text-[#0F1717]">
                            {formatDate(batchDetails.enrollment.enrolled_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E5E8EB]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#5E8C7D] hover:bg-[#F0F5F2] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Topic Modal */}
      {showViewTopic && selectedTopic && (
        <ViewTopic
          isOpen={showViewTopic}
          onClose={() => {
            setShowViewTopic(false)
            setSelectedTopic(null)
          }}
          topic={selectedTopic}
        />
      )}
    </div>
  )
}

