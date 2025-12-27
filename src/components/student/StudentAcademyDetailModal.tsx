import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { StudentApi } from '../../lib/studentApi'
import { TeacherApi } from '../../lib/teacherApi'

interface StudentAcademyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  academy: any
  studentId?: string
  teacherId?: string
  userRole?: 'student' | 'teacher'
}

export const StudentAcademyDetailModal: React.FC<StudentAcademyDetailModalProps> = ({
  isOpen,
  onClose,
  academy,
  studentId = '',
  teacherId = '',
  userRole = 'student'
}) => {
  const navigate = useNavigate()
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, string>>({})
  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null)
  const [academyEnrollmentStatus, setAcademyEnrollmentStatus] = useState<string | null>(null)
  const [academyEnrollmentNotes, setAcademyEnrollmentNotes] = useState<string | null>(null)
  const [requestingJoin, setRequestingJoin] = useState(false)
  const [requestingAcademyJoin, setRequestingAcademyJoin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && academy) {
      if (userRole === 'student' && studentId) {
        // Check academy enrollment status first
        checkAcademyEnrollmentStatus()
        // If approved, also check batch enrollment statuses
        if (academyEnrollmentStatus === 'approved') {
          checkEnrollmentStatuses()
        }
      } else if (userRole === 'teacher' && teacherId) {
        // Check assignment status for teacher
        checkAssignmentStatus()
      }
    }
  }, [isOpen, academy, studentId, teacherId, userRole])

  // Re-check batch statuses when academy enrollment becomes approved
  useEffect(() => {
    if (academyEnrollmentStatus === 'approved' && userRole === 'student' && studentId) {
      checkEnrollmentStatuses()
    }
  }, [academyEnrollmentStatus])

  const checkAcademyEnrollmentStatus = async () => {
    if (!academy?.id || !studentId) return

    try {
      const response = await StudentApi.getAcademyEnrollmentStatus(studentId, academy.id)
      if (response.data) {
        setAcademyEnrollmentStatus(response.data.status)
        setAcademyEnrollmentNotes(response.data.notes || null)
      } else {
        setAcademyEnrollmentStatus(null)
        setAcademyEnrollmentNotes(null)
      }
    } catch (error) {
      console.error('Error checking academy enrollment status:', error)
      setAcademyEnrollmentStatus(null)
      setAcademyEnrollmentNotes(null)
    }
  }

  const checkEnrollmentStatuses = async () => {
    if (!academy?.batches || !studentId) return

    const statuses: Record<string, string> = {}
    
    try {
      // Get all batch enrollments (including pending) for this student
      const { data: enrollments } = await StudentApi.getMyEnrollmentRequests(studentId)
      const { data: activeBatches } = await StudentApi.getMyBatches(studentId)
      
      // Check each batch in the academy
      for (const batch of academy.batches) {
        // First check pending enrollments
        const pendingEnrollment = enrollments?.find((e: any) => e.batch?.id === batch.id)
        if (pendingEnrollment) {
          statuses[batch.id] = pendingEnrollment.status
          continue
        }
        
        // Then check active enrollments
        const activeEnrollment = activeBatches?.find((b: any) => b.id === batch.id)
        if (activeEnrollment && activeEnrollment.enrollment_status === 'active') {
          statuses[batch.id] = 'active'
        }
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error)
    }

    setEnrollmentStatuses(statuses)
  }

  const checkAssignmentStatus = async () => {
    if (!academy?.id || !teacherId) return

    try {
      const { data: assignments } = await TeacherApi.getAllMyAssignments(teacherId)
      const assignment = assignments?.find((a: any) => a.academy_id === academy.id)
      if (assignment) {
        setAssignmentStatus(assignment.status)
      } else {
        setAssignmentStatus(null)
      }
    } catch (error) {
      console.error('Error checking assignment status:', error)
    }
  }

  const handleRequestToJoin = async () => {
    if (!teacherId || !academy?.id) {
      setError('Teacher ID or Academy ID not found')
      return
    }

    setRequestingJoin(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await TeacherApi.requestToJoinAcademy(teacherId, academy.id)
      
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess('Join request submitted successfully!')
        setAssignmentStatus('pending')
        // Refresh assignment status after a delay
        setTimeout(() => {
          checkAssignmentStatus()
        }, 1000)
      }
    } catch (error) {
      setError('Failed to submit join request. Please try again.')
      console.error('Error requesting to join academy:', error)
    } finally {
      setRequestingJoin(false)
    }
  }

  const handleRequestToJoinAcademy = async () => {
    if (!studentId || !academy?.id) {
      setError('Student ID or Academy ID not found')
      return
    }

    setRequestingAcademyJoin(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await StudentApi.requestToJoinAcademy(studentId, academy.id)
      
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess('Academy enrollment request submitted successfully!')
        setAcademyEnrollmentStatus('pending')
        // Refresh enrollment status after a delay
        setTimeout(() => {
          checkAcademyEnrollmentStatus()
        }, 1000)
      }
    } catch (error) {
      setError('Failed to submit enrollment request. Please try again.')
      console.error('Error requesting to join academy:', error)
    } finally {
      setRequestingAcademyJoin(false)
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getStatusBadge = (batchId: string) => {
    const status = enrollmentStatuses[batchId]
    if (!status) return null

    if (status === 'pending') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Pending Approval
        </span>
      )
    }
    if (status === 'active') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Enrolled
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          Rejected
        </span>
      )
    }
    return null
  }

  if (!isOpen || !academy) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-[#E5E8EB] flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0F1717]">{academy.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Academy Photos */}
            {academy.photo_urls && academy.photo_urls.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {academy.photo_urls.slice(0, 4).map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${academy.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Academy Info */}
            <div className="mb-6">
              {/* Owner Name */}
              {(academy.owner?.full_name || academy.owner?.email) && (
                <div className="flex items-center gap-2 text-[#5E8C7D] mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Owner:</span>
                  <span>{academy.owner?.full_name || academy.owner?.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#5E8C7D] mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {academy.locations && academy.locations.length > 0
                    ? `${academy.locations[0].city}, ${academy.locations[0].state}`
                    : 'Location not specified'}
                </span>
              </div>

              {academy.skills && academy.skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#0F1717] mb-2">Skills Offered:</h3>
                  <div className="flex flex-wrap gap-2">
                    {academy.skills.map((skill: any) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-[#E5F5F0] text-[#009963] text-sm font-medium rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}

            {/* Teacher: Request to Join Academy */}
            {userRole === 'teacher' && (
              <div className="mb-6">
                <div className="border border-[#DBE5E0] rounded-lg p-6 bg-[#F7FCFA]">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Join This Academy</h3>
                  <p className="text-sm text-[#5E8C7D] mb-4">
                    Request to join this academy as a teacher. The academy owner will review your request.
                  </p>
                  
                  {assignmentStatus === 'pending' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your request is pending approval from the academy owner.
                      </p>
                    </div>
                  )}
                  
                  {assignmentStatus === 'approved' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        You are approved for this academy!
                      </p>
                    </div>
                  )}
                  
                  {assignmentStatus === 'rejected' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        Your request was rejected. Please contact the academy for more information.
                      </p>
                    </div>
                  )}
                  
                  {!assignmentStatus && (
                    <button
                      onClick={handleRequestToJoin}
                      disabled={requestingJoin}
                      className="w-full px-4 py-3 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestingJoin ? 'Submitting Request...' : 'Request to Join Academy'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Student: Request to Join Academy */}
            {userRole === 'student' && (
              <div className="mb-6">
                <div className="border border-[#DBE5E0] rounded-lg p-6 bg-[#F7FCFA]">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Join This Academy</h3>
                  <p className="text-sm text-[#5E8C7D] mb-4">
                    Request to join this academy as a student. The academy owner will review your request and assign you to appropriate batches.
                  </p>
                  
                  {academyEnrollmentStatus === 'pending' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your request is pending approval from the academy owner.
                      </p>
                    </div>
                  )}
                  
                  {academyEnrollmentStatus === 'approved' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium mb-2">
                        ✅ You are approved for this academy! The academy will assign you to batches.
                      </p>
                      {academyEnrollmentNotes && (
                        <div className="mt-2 pt-2 border-t border-green-300">
                          <p className="text-xs font-semibold text-green-900 mb-1">Academy Message:</p>
                          <p className="text-sm text-green-800 whitespace-pre-wrap">{academyEnrollmentNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {academyEnrollmentStatus === 'rejected' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-2">
                        ❌ Your request was rejected.
                      </p>
                      {academyEnrollmentNotes ? (
                        <div className="mt-2 pt-2 border-t border-red-300">
                          <p className="text-xs font-semibold text-red-900 mb-1">Reason:</p>
                          <p className="text-sm text-red-800 whitespace-pre-wrap">{academyEnrollmentNotes}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-700">
                          Please contact the academy for more information.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!academyEnrollmentStatus && (
                    <button
                      onClick={handleRequestToJoinAcademy}
                      disabled={requestingAcademyJoin}
                      className="w-full px-4 py-3 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestingAcademyJoin ? 'Submitting Request...' : 'Request to Join Academy'}
                    </button>
                  )}
                </div>

                {/* Show batches only if student is approved */}
                {academyEnrollmentStatus === 'approved' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-[#0F1717] mb-4">Your Assigned Batches</h3>
                    {academy.batches && academy.batches.length > 0 ? (
                      <div className="space-y-4">
                        {academy.batches.map((batch: any) => {
                          const status = enrollmentStatuses[batch.id]
                          const isActive = status === 'active'

                          return (
                            <div
                              key={batch.id}
                              className="border border-[#DBE5E0] rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="text-base font-bold text-[#0F1717] mb-1">
                                    {batch.name}
                                  </h4>
                                  {batch.skill && (
                                    <p className="text-sm text-[#5E8C7D] mb-2">
                                      Skill: {batch.skill.name}
                                    </p>
                                  )}
                                  {batch.teacher && (
                                    <p className="text-sm text-[#5E8C7D] mb-2">
                                      Teacher: {batch.teacher.full_name}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-[#5E8C7D]">
                                    <span>
                                      {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                                    </span>
                                    <span>
                                      {batch.available_slots} slots available
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  {getStatusBadge(batch.id)}
                                </div>
                              </div>
                              {isActive && (
                                <p className="text-sm text-green-600 text-center">
                                  You are enrolled in this batch
                                </p>
                              )}
                              {!isActive && (
                                <p className="text-sm text-gray-500 text-center">
                                  Waiting for batch assignment from academy
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[#5E8C7D]">
                        <p>No batches available at this time. The academy will assign you to batches after approval.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-[#E5E8EB] flex justify-between items-center">
            <button
              onClick={() => {
                const dashboardPath = userRole === 'teacher' ? '/teacher' : '/student'
                navigate(dashboardPath)
              }}
              className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#DBE5E0] text-[#0F1717] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

