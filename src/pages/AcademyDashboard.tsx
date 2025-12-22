import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AdminApi } from '../lib/adminApi'
import { Academy, Skill } from '../types/database'
import { TeacherManagementModal } from '../components/TeacherManagementModal'
import { StudentManagementModal } from '../components/StudentManagementModal'
import { BatchManagementModal } from '../components/BatchManagementModal'
import { AcademySetupForm } from '../components/AcademySetupForm'
import { AcademyProfileManagement } from '../components/AcademyProfileManagement'

const AcademyDashboard = () => {
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>('Karate')
  
  // Academy data state
  const [academyData, setAcademyData] = useState<Academy | null>(null)
  const [statistics, setStatistics] = useState<{
    totalStudents: number;
    pendingStudents: number;
    activeTeachers: number;
    totalBatches: number;
    totalPhotos: number;
  } | null>(null)
  const [academySkills, setAcademySkills] = useState<Skill[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [studentScores, setStudentScores] = useState<any[]>([])
  const [batchEnrollments, setBatchEnrollments] = useState<any[]>([])
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'batches' | 'analytics' | 'profile'>('overview')
  
  // Teacher management modal state
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  
  // Student management modal state
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  
  // Batch management modal state
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  // Role-based access control
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'academy_owner') {
        // Redirect non-academy owners to appropriate page
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role) {
          navigate('/dashboard')
        } else {
          navigate('/role-selection')
        }
      }
    } else if (!loading && !user) {
      // No user - redirect to home
      navigate('/')
    }
  }, [user, loading, navigate])

  // Fetch academy data function
  const fetchAcademyData = useCallback(async () => {
    if (!user || user.role !== 'academy_owner') return

    setDataLoading(true)
    setDataError(null)

    try {
      // Get academy details
      const academyResponse = await AdminApi.getAcademyByOwnerId(user.id)
      
      // Handle case when no academy exists yet (expected for new academy owners)
      if (!academyResponse.data) {
        // No academy exists - this is expected for new academy owners
        setAcademyData(null)
        setStatistics(null)
        setAcademySkills([])
        setTeachers([])
        setStudents([])
        setBatches([])
        setStudentScores([])
        setBatchEnrollments([])
        setDataLoading(false)
        setDataError(null) // Clear any previous errors
        return
      }
      
      if (academyResponse.error) {
        setDataError(academyResponse.error || 'Failed to fetch academy data')
        setDataLoading(false)
        return
      }

      setAcademyData(academyResponse.data)

      // Fetch all data in parallel for better performance
      const [
        statsResponse,
        skillsResponse,
        teachersResponse,
        studentsResponse,
        batchesResponse,
        scoresResponse,
        enrollmentsResponse,
        pendingEnrollmentsResponse
      ] = await Promise.all([
        AdminApi.getAcademyStatistics(academyResponse.data.id),
        AdminApi.getAcademySkills(academyResponse.data.id),
        AdminApi.getAcademyTeachers(academyResponse.data.id),
        AdminApi.getAcademyStudents(academyResponse.data.id),
        AdminApi.getAcademyBatches(academyResponse.data.id),
        AdminApi.getAcademyStudentScores(academyResponse.data.id),
        AdminApi.getAcademyBatchEnrollments(academyResponse.data.id),
        AdminApi.getPendingBatchEnrollments(academyResponse.data.id)
      ])

      // Set data if available (don't fail on individual errors)
      if (statsResponse.data) setStatistics(statsResponse.data)
      if (skillsResponse.data) {
        console.log('🟢 [AcademyDashboard] Fetched academy skills:', {
          academyId: academyResponse.data.id,
          skillsCount: skillsResponse.data.length,
          skills: skillsResponse.data.map(s => ({ id: s.id, name: s.name })),
          skillIds: academyResponse.data.skill_ids
        })
        setAcademySkills(skillsResponse.data)
      } else if (skillsResponse.error) {
        console.error('❌ [AcademyDashboard] Error fetching skills:', skillsResponse.error)
      }
      if (teachersResponse.data) setTeachers(teachersResponse.data)
      if (studentsResponse.data) setStudents(studentsResponse.data)
      if (batchesResponse.data) setBatches(batchesResponse.data)
      if (scoresResponse.data) setStudentScores(scoresResponse.data)
      if (enrollmentsResponse.data) setBatchEnrollments(enrollmentsResponse.data)
      if (pendingEnrollmentsResponse.data) setPendingEnrollments(pendingEnrollmentsResponse.data)

      // Collect errors but don't block the UI
      const errors = [
        statsResponse.error,
        skillsResponse.error,
        teachersResponse.error,
        studentsResponse.error,
        batchesResponse.error,
        scoresResponse.error,
        enrollmentsResponse.error
      ].filter(Boolean)

      if (errors.length > 0) {
        console.warn('Some data failed to load:', errors)
        // Only set error if critical data is missing
        if (!statsResponse.data && !teachersResponse.data && !studentsResponse.data) {
          setDataError(errors[0] || 'Failed to load critical data')
        }
      }
    } catch (error) {
      console.error('Error fetching academy data:', error)
      setDataError(error instanceof Error ? error.message : 'Failed to fetch academy data')
    } finally {
      setDataLoading(false)
    }
  }, [user])

  // Fetch academy data on mount
  useEffect(() => {
    fetchAcademyData()
  }, [fetchAcademyData])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      setLoggingOut(false)
    }
  }

  // Teacher management functions
  const handleManageTeacher = (teacher: any) => {
    setSelectedTeacher(teacher)
    setShowTeacherModal(true)
  }

  const handleTeacherUpdated = () => {
    // Refresh teacher data
    fetchAcademyData()
    setShowTeacherModal(false)
    setSelectedTeacher(null)
  }

  const handleCloseTeacherModal = () => {
    setShowTeacherModal(false)
    setSelectedTeacher(null)
  }

  // Student management functions
  const handleManageStudent = (student: any) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const handleStudentUpdated = () => {
    // Refresh student data
    fetchAcademyData()
    setShowStudentModal(false)
    setSelectedStudent(null)
  }

  const handleCloseStudentModal = () => {
    setShowStudentModal(false)
    setSelectedStudent(null)
  }

  // Batch management functions
  const handleManageBatch = (batch: any) => {
    setSelectedBatch(batch)
    setShowBatchModal(true)
  }

  const handleCreateBatch = () => {
    setSelectedBatch(null)
    setShowBatchModal(true)
  }

  const handleBatchUpdated = () => {
    // Refresh batch data
    fetchAcademyData()
    setShowBatchModal(false)
    setSelectedBatch(null)
  }

  const handleCloseBatchModal = () => {
    setShowBatchModal(false)
    setSelectedBatch(null)
  }

  // Show loading while checking authentication or fetching data
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963] mx-auto mb-4"></div>
          <p className="text-[#5E8C7D]">{loading ? 'Loading...' : 'Loading academy data...'}</p>
        </div>
      </div>
    )
  }

  // Show error if data fetching failed
  if (dataError) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F1717] mb-2">Error Loading Data</h2>
          <p className="text-[#5E8C7D] mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4d] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show access denied if user is not an academy owner
  if (!user || user.role !== 'academy_owner') {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F1717] mb-2">Access Denied</h2>
          <p className="text-[#5E8C7D] mb-4">This page is only accessible to Academy Owners.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4d] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Show academy setup form for new academy owners
  if (!dataLoading && !dataError && !academyData) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] font-[Lexend]">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E8EB]">
          <div className="flex justify-between items-center px-10 py-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start">
                <div className="w-4 h-4 relative">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.333333 0.333333H4.7778V4.7778H9.2222V9.2222H13.6667V13.6667H0.333333V0.333333V0.333333Z" fill="#0F1717"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-lg font-bold text-[#0F1717] leading-[23px]">Unpuzzle Club</h1>
            </div>
            
            <div className="flex justify-end items-center gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#0F1717]">{user?.full_name || 'Academy Owner'}</p>
                  <p className="text-xs text-[#5E8C7D]">Academy Owner</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-3 py-1 bg-[#F0F5F2] text-[#0D1C17] font-medium text-xs rounded-lg hover:bg-[#E5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loggingOut && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="py-8 px-4">
          <AcademySetupForm
            onSuccess={() => {
              // Set loading state immediately to show loading screen
              setDataLoading(true);
              // Reload academy data after successful creation
              fetchAcademyData();
            }}
          />
        </div>
      </div>
    )
  }

  // Use real academy skills instead of hardcoded activities
  const activities = academySkills.map(skill => ({
    id: skill.id,
    name: skill.name,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/4c88c0a5855eb4415bad44ff5c61d4454f8e5509?width=496' // Default image for now
  }))
  
  console.log('🔵 [AcademyDashboard] Activities to display:', {
    activitiesCount: activities.length,
    activities: activities.map(a => ({ id: a.id, name: a.name })),
    academySkillsCount: academySkills.length
  })

  const upcomingActivities = academySkills.map(skill => skill.name)

  return (
    <div className="min-h-screen bg-[#F7FCFA] font-[Lexend]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E8EB]">
        <div className="flex justify-between items-center px-10 py-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start">
              <div className="w-4 h-4 relative">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0.333333 0.333333H4.7778V4.7778H9.2222V9.2222H13.6667V13.6667H0.333333V0.333333V0.333333Z" fill="#0F1717"/>
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-bold text-[#0F1717] leading-[23px]">{academyData?.name || 'Academy'}</h1>
          </div>
          
          <div className="flex justify-end items-center gap-4 flex-1">
            <div className="flex items-center gap-9">
              <span className="text-sm text-[#0F1717] leading-[21px]">Home</span>
            </div>
            
            <div className="flex items-center gap-2 px-2.5 py-0 bg-[#F0F5F2] rounded-[20px] max-w-[480px]">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.3281 12.7453C14.8945 11.9984 14.25 9.88516 14.25 7.125C14.25 3.67322 11.4518 0.875 8 0.875C4.54822 0.875 1.75 3.67322 1.75 7.125C1.75 9.88594 1.10469 11.9984 0.671094 12.7453C0.445722 13.1318 0.444082 13.6092 0.666796 13.9973C0.889509 14.3853 1.30261 14.6247 1.75 14.625H4.93828C5.23556 16.0796 6.51529 17.1243 8 17.1243C9.48471 17.1243 10.7644 16.0796 11.0617 14.625H14.25C14.6972 14.6244 15.1101 14.3849 15.3326 13.9969C15.5551 13.609 15.5534 13.1317 15.3281 12.7453V12.7453ZM8 15.875C7.20562 15.8748 6.49761 15.3739 6.23281 14.625H9.76719C9.50239 15.3739 8.79438 15.8748 8 15.875V15.875ZM1.75 13.375C2.35156 12.3406 3 9.94375 3 7.125C3 4.36358 5.23858 2.125 8 2.125C10.7614 2.125 13 4.36358 13 7.125C13 9.94141 13.6469 12.3383 14.25 13.375H1.75Z" fill="#0F1717"/>
              </svg>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F1717]">{user?.full_name || 'Academy Owner'}</p>
                <p className="text-xs text-[#5E8C7D]">Academy Owner</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-3 py-1 bg-[#F0F5F2] text-[#0D1C17] font-medium text-xs rounded-lg hover:bg-[#E5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loggingOut && (
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
            
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/ec3fd35c54906d1a891fbea1c5010977b18a8366?width=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-[20px]"
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-[800px]">
        {/* Sidebar */}
        <div className="w-80 p-6 flex flex-col justify-center items-start gap-1">
          <div className="bg-white p-4 rounded-none min-h-[700px] flex flex-col justify-between items-start self-stretch">
            <div className="flex flex-col items-start gap-4 self-stretch">
              <div className="flex items-start gap-3 self-stretch">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/03fe4649b6b83549e66e7b59d2cd2df2753843b9?width=80" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-[20px]"
                />
                <div className="flex flex-col items-start h-10">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-[#0F1717] leading-6 self-stretch">{academyData?.name || 'Academy'}</span>
                    {academyData?.status && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        academyData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        (academyData.status as any) === 'in_process' ? 'bg-blue-100 text-blue-800' :
                        (academyData.status as any) === 'approved' ? 'bg-green-100 text-green-800' :
                        (academyData.status as any) === 'rejected' ? 'bg-red-100 text-red-800' :
                        academyData.status === 'active' ? 'bg-green-100 text-green-800' :
                        academyData.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                        (academyData.status as any) === 'deactivated' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {academyData.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status-based messages */}
              {academyData?.status && (
                <div className="w-full px-4">
                  <div className={`p-3 rounded-lg text-sm ${
                    academyData.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                    (academyData.status as any) === 'in_process' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    (academyData.status as any) === 'approved' ? 'bg-green-50 text-green-800 border border-green-200' :
                    (academyData.status as any) === 'rejected' ? 'bg-red-50 text-red-800 border border-red-200' :
                    academyData.status === 'suspended' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                    (academyData.status as any) === 'deactivated' ? 'bg-gray-50 text-gray-800 border border-gray-200' :
                    academyData.status === 'active' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-gray-50 text-gray-800 border border-gray-200'
                  }`}>
                    <div className="mb-2">
                      {academyData.status === 'pending' && '⏳ Your academy is pending admin approval. You can update details but cannot manage students/teachers until approved.'}
                      {(academyData.status as any) === 'in_process' && '🔍 Your academy is currently under review by admin. Please wait for approval.'}
                      {(academyData.status as any) === 'approved' && '✅ Your academy has been approved! You can now manage students and teachers.'}
                      {(academyData.status as any) === 'rejected' && '❌ Your academy application was rejected. Please contact admin for more information.'}
                      {academyData.status === 'suspended' && '⚠️ Your academy is currently suspended. Contact admin for reactivation.'}
                      {(academyData.status as any) === 'deactivated' && '🚫 Your academy has been deactivated. Contact admin for reactivation.'}
                      {academyData.status === 'active' && '✅ Your academy is active and operational.'}
                    </div>
                    {academyData.status_notes && (
                      <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                        <p className="font-semibold mb-1">Admin Notes:</p>
                        <p className="whitespace-pre-wrap">{academyData.status_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-start gap-2 self-stretch">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M18 8.83281V17.5C18 18.3284 17.3284 19 16.5 19H12.75C11.9216 19 11.25 18.3284 11.25 17.5V13.75C11.25 13.3358 10.9142 13 10.5 13H7.5C7.08579 13 6.75 13.3358 6.75 13.75V17.5C6.75 18.3284 6.07843 19 5.25 19H1.5C0.671573 19 0 18.3284 0 17.5V8.83281C-6.38024e-05 8.41309 0.17573 8.01254 0.484688 7.72844L7.98469 0.652188L7.995 0.641875C8.56719 0.121501 9.44124 0.121501 10.0134 0.641875C10.0166 0.645543 10.0201 0.648989 10.0238 0.652188L17.5238 7.72844C17.8296 8.01402 18.0022 8.41437 18 8.83281V8.83281Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Home</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('teachers')}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'teachers' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.9922 10.805C13.0561 9.43099 13.9769 6.86767 13.2592 4.49441C12.5414 2.12114 10.3544 0.497718 7.875 0.497718C5.39558 0.497718 3.20857 2.12114 2.49084 4.49441C1.7731 6.86767 2.69393 9.43099 4.75781 10.805C2.93952 11.4752 1.38666 12.7153 0.330938 14.3403C0.179932 14.5647 0.161484 14.8531 0.28266 15.095C0.403836 15.3368 0.645857 15.4947 0.916031 15.5081C1.18621 15.5215 1.44266 15.3884 1.58719 15.1597C2.97076 13.0317 5.33677 11.7479 7.875 11.7479C10.4132 11.7479 12.7792 13.0317 14.1628 15.1597C14.3917 15.4999 14.8514 15.5932 15.1948 15.3692C15.5382 15.1452 15.6381 14.6869 15.4191 14.3403C14.3633 12.7153 12.8105 11.4752 10.9922 10.805V10.805ZM3.75 6.125C3.75 3.84683 5.59683 2 7.875 2C10.1532 2 12 3.84683 12 6.125C12 8.40317 10.1532 10.25 7.875 10.25C5.5979 10.2474 3.75258 8.4021 3.75 6.125V6.125ZM23.4506 15.3781C23.1037 15.6043 22.6391 15.5066 22.4128 15.1597C21.0308 13.0303 18.6636 11.7466 16.125 11.75C15.7108 11.75 15.375 11.4142 15.375 11C15.375 10.5858 15.7108 10.25 16.125 10.25C17.7863 10.2484 19.2846 9.25042 19.9261 7.71798C20.5677 6.18554 20.2273 4.4178 19.0626 3.23312C17.898 2.04844 16.1363 1.67805 14.5931 2.29344C14.3427 2.40171 14.0531 2.36541 13.8372 2.19864C13.6212 2.03188 13.5128 1.76096 13.5542 1.49125C13.5956 1.22154 13.7802 0.995581 14.0363 0.90125C16.7109 -0.165433 19.7592 0.960006 21.099 3.50883C22.4388 6.05765 21.6374 9.2067 19.2422 10.805C21.0605 11.4752 22.6133 12.7153 23.6691 14.3403C23.8953 14.6872 23.7975 15.1518 23.4506 15.3781V15.3781Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Teachers</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'students' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2005_1137)">
                      <path d="M12.0002 14.2474C9.79087 10.3326 3.71582 12.7219 3.71582 12.7219V21.7719C3.71582 21.7719 9.79091 19.3822 12.0002 23.2969V14.2474Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14.2474C14.2093 10.3326 20.2844 12.7219 20.2844 12.7219V21.7719C20.2844 21.7719 14.2093 19.3822 12 23.2969V14.2474Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.9874 18.1678C8.23314 18.0134 7.4514 18.0071 6.72803 18.0726" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.0127 18.1678C15.767 18.0134 16.5487 18.0071 17.2721 18.0726" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.9874 15.1515C8.23314 14.9971 7.4514 14.9903 6.72803 15.0559" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.0127 15.1515C15.767 14.9971 16.5487 14.9903 17.2721 15.0559" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4.46893 7.8568C5.92471 7.8568 7.10485 6.67666 7.10485 5.22088C7.10485 3.7651 5.92471 2.58496 4.46893 2.58496C3.01315 2.58496 1.83301 3.7651 1.83301 5.22088C1.83301 6.67666 3.01315 7.8568 4.46893 7.8568Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.5314 7.8568C20.9872 7.8568 22.1674 6.67666 22.1674 5.22088C22.1674 3.7651 20.9872 2.58496 19.5314 2.58496C18.0757 2.58496 16.8955 3.7651 16.8955 5.22088C16.8955 6.67666 18.0757 7.8568 19.5314 7.8568Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.0002 5.97497C13.456 5.97497 14.6361 4.79483 14.6361 3.33905C14.6361 1.88327 13.456 0.703125 12.0002 0.703125C10.5444 0.703125 9.36426 1.88327 9.36426 3.33905C9.36426 4.79483 10.5444 5.97497 12.0002 5.97497Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.7656 12.0274V11.1368C15.7656 10.2808 16.2491 9.49873 17.0143 9.11576C18.1105 8.56746 19.5312 7.85693 19.5312 7.85693C19.5312 7.85693 20.9516 8.56676 22.0474 9.11464C22.8134 9.49723 23.2969 10.2797 23.2969 11.1357V14.2593H20.2844V12.7218C20.2844 12.7218 18.0284 11.8346 15.7656 12.0274Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.71564 14.2593V12.7218C3.71564 12.7218 5.97164 11.8346 8.23439 12.0274V11.1357C8.23439 10.2797 7.75087 9.49723 6.98494 9.11464C5.88914 8.56671 4.46873 7.85693 4.46873 7.85693C4.46873 7.85693 3.04795 8.56751 1.95178 9.11576C1.18664 9.49878 0.703125 10.2809 0.703125 11.1368C0.703125 12.4638 0.703125 14.2593 0.703125 14.2593H3.71564Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.23438 12.0276V9.25494C8.23438 8.399 8.71789 7.61689 9.48303 7.2343C10.5792 6.68568 12 5.9751 12 5.9751C12 5.9751 13.4204 6.68493 14.5162 7.2328C15.2821 7.61539 15.7656 8.39788 15.7656 9.25382V12.0276C14.323 12.1504 12.8774 12.7126 12.0128 14.2244L12 14.2474C11.1369 12.7182 9.6845 12.1511 8.23438 12.0276Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_2005_1137">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Students</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('batches')}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'batches' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.4163 6.87562L8.91625 3.87563C8.68605 3.72204 8.38998 3.70769 8.14601 3.83831C7.90204 3.96892 7.74982 4.22327 7.75 4.5V10.5C7.74982 10.7767 7.90204 11.0311 8.14601 11.1617C8.38998 11.2923 8.68605 11.278 8.91625 11.1244L13.4163 8.12438C13.6252 7.98533 13.7507 7.75098 13.7507 7.5C13.7507 7.24902 13.6252 7.01467 13.4163 6.87562V6.87562ZM9.25 9.09844V5.90625L11.6481 7.5L9.25 9.09844ZM18.25 0.75H1.75C0.921573 0.75 0.25 1.42157 0.25 2.25V12.75C0.25 13.5784 0.921573 14.25 1.75 14.25H18.25C19.0784 14.25 19.75 13.5784 19.75 12.75V2.25C19.75 1.42157 19.0784 0.75 18.25 0.75V0.75ZM18.25 12.75H1.75V2.25H18.25V12.75V12.75ZM19.75 16.5C19.75 16.9142 19.4142 17.25 19 17.25H1C0.585786 17.25 0.25 16.9142 0.25 16.5C0.25 16.0858 0.585786 15.75 1 15.75H19C19.4142 15.75 19.75 16.0858 19.75 16.5V16.5Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Batches</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'analytics' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 5.5C7.51472 5.5 5.5 7.51472 5.5 10C5.5 12.4853 7.51472 14.5 10 14.5C12.4853 14.5 14.5 12.4853 14.5 10C14.4974 7.51579 12.4842 5.50258 10 5.5V5.5ZM10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10C13 11.6569 11.6569 13 10 13V13ZM18.25 10.2025C18.2537 10.0675 18.2537 9.9325 18.25 9.7975L19.6488 8.05C19.7975 7.86393 19.849 7.61827 19.7875 7.38813C19.5582 6.52619 19.2152 5.69861 18.7675 4.92719C18.6486 4.72249 18.4401 4.58592 18.205 4.55875L15.9813 4.31125C15.8888 4.21375 15.795 4.12 15.7 4.03L15.4375 1.80063C15.4101 1.56531 15.2732 1.35677 15.0681 1.23813C14.2964 0.791263 13.4689 0.448595 12.6072 0.219063C12.3769 0.157836 12.1312 0.209687 11.9453 0.35875L10.2025 1.75C10.0675 1.75 9.9325 1.75 9.7975 1.75L8.05 0.354063C7.86393 0.205326 7.61827 0.153827 7.38813 0.215312C6.52633 0.445025 5.6988 0.788016 4.92719 1.23531C4.72249 1.35417 4.58592 1.56268 4.55875 1.79781L4.31125 4.02531C4.21375 4.11844 4.12 4.21219 4.03 4.30656L1.80063 4.5625C1.56531 4.58988 1.35677 4.72682 1.23813 4.93188C0.791263 5.70359 0.448595 6.5311 0.219063 7.39281C0.157836 7.6231 0.209687 7.86878 0.35875 8.05469L1.75 9.7975C1.75 9.9325 1.75 10.0675 1.75 10.2025L0.354063 11.95C0.205326 12.1361 0.153827 12.3817 0.215312 12.6119C0.444615 13.4738 0.787627 14.3014 1.23531 15.0728C1.35417 15.2775 1.56268 15.4141 1.79781 15.4412L4.02156 15.6887C4.11469 15.7862 4.20844 15.88 4.30281 15.97L4.5625 18.1994C4.58988 18.4347 4.72682 18.6432 4.93188 18.7619C5.70359 19.2087 6.5311 19.5514 7.39281 19.7809C7.6231 19.8422 7.86878 19.7903 8.05469 19.6413L9.7975 18.25C9.9325 18.2537 10.0675 18.2537 10.2025 18.25L11.95 19.6488C12.1361 19.7975 12.3817 19.849 12.6119 19.7875C13.4738 19.5582 14.3014 19.2152 15.0728 18.7675C15.2775 18.6486 15.4141 18.4401 15.4412 18.205L15.6887 15.9813C15.7862 15.8888 15.88 15.795 15.97 15.7L18.1994 15.4375C18.4347 15.4101 18.6432 15.2732 18.7619 15.0681C19.2087 14.2964 19.5514 13.4689 19.7809 12.6072C19.8422 12.3769 19.7903 12.1312 19.6413 11.9453L18.25 10.2025ZM16.7406 9.59313C16.7566 9.86414 16.7566 10.1359 16.7406 10.4069C16.7295 10.5924 16.7876 10.7755 16.9037 10.9206L18.2341 12.5828C18.0814 13.0679 17.886 13.5385 17.65 13.9891L15.5312 14.2291C15.3467 14.2495 15.1764 14.3377 15.0531 14.4766C14.8727 14.6795 14.6805 14.8717 14.4775 15.0522C14.3387 15.1754 14.2505 15.3458 14.23 15.5303L13.9947 17.6472C13.5442 17.8833 13.0736 18.0787 12.5884 18.2313L10.9253 16.9009C10.7922 16.7946 10.6269 16.7367 10.4566 16.7369H10.4116C10.1405 16.7528 9.86883 16.7528 9.59781 16.7369C9.41226 16.7257 9.22918 16.7838 9.08406 16.9L7.41719 18.2313C6.93206 18.0786 6.46146 17.8831 6.01094 17.6472L5.77094 15.5312C5.75046 15.3467 5.66227 15.1764 5.52344 15.0531C5.32048 14.8727 5.12827 14.6805 4.94781 14.4775C4.82456 14.3387 4.6542 14.2505 4.46969 14.23L2.35281 13.9937C2.11674 13.5433 1.92128 13.0727 1.76875 12.5875L3.09906 10.9244C3.21522 10.7793 3.27336 10.5962 3.26219 10.4106C3.24625 10.1396 3.24625 9.86789 3.26219 9.59688C3.27336 9.41133 3.21522 9.22824 3.09906 9.08313L1.76875 7.41719C1.9214 6.93206 2.11685 6.46146 2.35281 6.01094L4.46875 5.77094C4.65326 5.75046 4.82362 5.66227 4.94688 5.52344C5.12733 5.32048 5.31954 5.12827 5.5225 4.94781C5.66188 4.82448 5.75043 4.65373 5.77094 4.46875L6.00625 2.35281C6.45672 2.11674 6.92733 1.92128 7.4125 1.76875L9.07563 3.09906C9.22074 3.21522 9.40383 3.27336 9.58937 3.26219C9.86039 3.24625 10.1321 3.24625 10.4031 3.26219C10.5887 3.27336 10.7718 3.21522 10.9169 3.09906L12.5828 1.76875C13.0679 1.9214 13.5385 2.11685 13.9891 2.35281L14.2291 4.46875C14.2495 4.65326 14.3377 4.82362 14.4766 4.94688C14.6795 5.12733 14.8717 5.31954 15.0522 5.5225C15.1754 5.66133 15.3458 5.74952 15.5303 5.77L17.6472 6.00531C17.8833 6.45578 18.0787 6.9264 18.2313 7.41156L16.9009 9.07469C16.7837 9.22103 16.7255 9.406 16.7378 9.59313H16.7406Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Analytics</span>
                </button>
                
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                  }}
                  className={`flex items-center gap-3 self-stretch px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-[#F0F5F2]' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9ZM10 11C7.23858 11 5 8.76142 5 6C5 3.23858 7.23858 1 10 1C12.7614 1 15 3.23858 15 6C15 8.76142 12.7614 11 10 11ZM3 19C3 14.5817 6.58172 11 11 11H9C13.4183 11 17 14.5817 17 19C17 19.5523 16.5523 20 16 20H4C3.44772 20 3 19.5523 3 19ZM11 13C7.68629 13 5 15.6863 5 19H15C15 15.6863 12.3137 13 9 13H11Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Profile</span>
                </button>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.25 2.75H10.75V1.25C10.75 0.835786 10.4142 0.5 10 0.5C9.58579 0.5 9.25 0.835786 9.25 1.25V2.75H1.75C0.921573 2.75 0.25 3.42157 0.25 4.25V15.5C0.25 16.3284 0.921573 17 1.75 17H5.44L3.41406 19.5312C3.15518 19.8549 3.20765 20.3271 3.53125 20.5859C3.85485 20.8448 4.32705 20.7924 4.58594 20.4688L7.36 17H12.64L15.4141 20.4688C15.6729 20.7924 16.1451 20.8448 16.4688 20.5859C16.7924 20.3271 16.8448 19.8549 16.5859 19.5312L14.56 17H18.25C19.0784 17 19.75 16.3284 19.75 15.5V4.25C19.75 3.42157 19.0784 2.75 18.25 2.75V2.75ZM18.25 15.5H1.75V4.25H18.25V15.5V15.5ZM7.75 10.25V12.5C7.75 12.9142 7.41421 13.25 7 13.25C6.58579 13.25 6.25 12.9142 6.25 12.5V10.25C6.25 9.83579 6.58579 9.5 7 9.5C7.41421 9.5 7.75 9.83579 7.75 10.25V10.25ZM10.75 8.75V12.5C10.75 12.9142 10.4142 13.25 10 13.25C9.58579 13.25 9.25 12.9142 9.25 12.5V8.75C9.25 8.33579 9.58579 8 10 8C10.4142 8 10.75 8.33579 10.75 8.75V8.75ZM13.75 7.25V12.5C13.75 12.9142 13.4142 13.25 13 13.25C12.5858 13.25 12.25 12.9142 12.25 12.5V7.25C12.25 6.83579 12.5858 6.5 13 6.5C13.4142 6.5 13.75 6.83579 13.75 7.25V7.25Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Attendance</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 5.5C7.51472 5.5 5.5 7.51472 5.5 10C5.5 12.4853 7.51472 14.5 10 14.5C12.4853 14.5 14.5 12.4853 14.5 10C14.4974 7.51579 12.4842 5.50258 10 5.5V5.5ZM10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10C13 11.6569 11.6569 13 10 13V13ZM18.25 10.2025C18.2537 10.0675 18.2537 9.9325 18.25 9.7975L19.6488 8.05C19.7975 7.86393 19.849 7.61827 19.7875 7.38813C19.5582 6.52619 19.2152 5.69861 18.7675 4.92719C18.6486 4.72249 18.4401 4.58592 18.205 4.55875L15.9813 4.31125C15.8888 4.21375 15.795 4.12 15.7 4.03L15.4375 1.80063C15.4101 1.56531 15.2732 1.35677 15.0681 1.23813C14.2964 0.791263 13.4689 0.448595 12.6072 0.219063C12.3769 0.157836 12.1312 0.209687 11.9453 0.35875L10.2025 1.75C10.0675 1.75 9.9325 1.75 9.7975 1.75L8.05 0.354063C7.86393 0.205326 7.61827 0.153827 7.38813 0.215312C6.52633 0.445025 5.6988 0.788016 4.92719 1.23531C4.72249 1.35417 4.58592 1.56268 4.55875 1.79781L4.31125 4.02531C4.21375 4.11844 4.12 4.21219 4.03 4.30656L1.80063 4.5625C1.56531 4.58988 1.35677 4.72682 1.23813 4.93188C0.791263 5.70359 0.448595 6.5311 0.219063 7.39281C0.157836 7.6231 0.209687 7.86878 0.35875 8.05469L1.75 9.7975C1.75 9.9325 1.75 10.0675 1.75 10.2025L0.354063 11.95C0.205326 12.1361 0.153827 12.3817 0.215312 12.6119C0.444615 13.4738 0.787627 14.3014 1.23531 15.0728C1.35417 15.2775 1.56268 15.4141 1.79781 15.4412L4.02156 15.6887C4.11469 15.7862 4.20844 15.88 4.30281 15.97L4.5625 18.1994C4.58988 18.4347 4.72682 18.6432 4.93188 18.7619C5.70359 19.2087 6.5311 19.5514 7.39281 19.7809C7.6231 19.8422 7.86878 19.7903 8.05469 19.6413L9.7975 18.25C9.9325 18.2537 10.0675 18.2537 10.2025 18.25L11.95 19.6488C12.1361 19.7975 12.3817 19.849 12.6119 19.7875C13.4738 19.5582 14.3014 19.2152 15.0728 18.7675C15.2775 18.6486 15.4141 18.4401 15.4412 18.205L15.6887 15.9813C15.7862 15.8888 15.88 15.795 15.97 15.7L18.1994 15.4375C18.4347 15.4101 18.6432 15.2732 18.7619 15.0681C19.2087 14.2964 19.5514 13.4689 19.7809 12.6072C19.8422 12.3769 19.7903 12.1312 19.6413 11.9453L18.25 10.2025ZM16.7406 9.59313C16.7566 9.86414 16.7566 10.1359 16.7406 10.4069C16.7295 10.5924 16.7876 10.7755 16.9037 10.9206L18.2341 12.5828C18.0814 13.0679 17.886 13.5385 17.65 13.9891L15.5312 14.2291C15.3467 14.2495 15.1764 14.3377 15.0531 14.4766C14.8727 14.6795 14.6805 14.8717 14.4775 15.0522C14.3387 15.1754 14.2505 15.3458 14.23 15.5303L13.9947 17.6472C13.5442 17.8833 13.0736 18.0787 12.5884 18.2313L10.9253 16.9009C10.7922 16.7946 10.6269 16.7367 10.4566 16.7369H10.4116C10.1405 16.7528 9.86883 16.7528 9.59781 16.7369C9.41226 16.7257 9.22918 16.7838 9.08406 16.9L7.41719 18.2313C6.93206 18.0786 6.46146 17.8831 6.01094 17.6472L5.77094 15.5312C5.75046 15.3467 5.66227 15.1764 5.52344 15.0531C5.32048 14.8727 5.12827 14.6805 4.94781 14.4775C4.82456 14.3387 4.6542 14.2505 4.46969 14.23L2.35281 13.9937C2.11674 13.5433 1.92128 13.0727 1.76875 12.5875L3.09906 10.9244C3.21522 10.7793 3.27336 10.5962 3.26219 10.4106C3.24625 10.1396 3.24625 9.86789 3.26219 9.59688C3.27336 9.41133 3.21522 9.22824 3.09906 9.08313L1.76875 7.41719C1.9214 6.93206 2.11685 6.46146 2.35281 6.01094L4.46875 5.77094C4.65326 5.75046 4.82362 5.66227 4.94688 5.52344C5.12733 5.32048 5.31954 5.12827 5.5225 4.94781C5.66188 4.82448 5.75043 4.65373 5.77094 4.46875L6.00625 2.35281C6.45672 2.11674 6.92733 1.92128 7.4125 1.76875L9.07563 3.09906C9.22074 3.21522 9.40383 3.27336 9.58937 3.26219C9.86039 3.24625 10.1321 3.24625 10.4031 3.26219C10.5887 3.27336 10.7718 3.21522 10.9169 3.09906L12.5828 1.76875C13.0679 1.9214 13.5385 2.11685 13.9891 2.35281L14.2291 4.46875C14.2495 4.65326 14.3377 4.82362 14.4766 4.94688C14.6795 5.12733 14.8717 5.31954 15.0522 5.5225C15.1754 5.66133 15.3458 5.74952 15.5303 5.77L17.6472 6.00531C17.8833 6.45578 18.0787 6.9264 18.2313 7.41156L16.9009 9.07469C16.7837 9.22103 16.7255 9.406 16.7378 9.59313H16.7406Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[960px] flex flex-col items-start">
          {/* Header */}
          <div className="flex justify-between items-start content-start gap-3 self-stretch flex-wrap p-4">
            <div className="flex min-w-[288px] flex-col items-start gap-3">
              <h1 className="text-[32px] font-bold text-[#0F1717] leading-10 self-stretch">
                {activeTab === 'overview' && 'Academy Dashboard'}
                {activeTab === 'teachers' && 'Teachers Management'}
                {activeTab === 'students' && 'Students Management'}
                {activeTab === 'batches' && 'Batches Management'}
                {activeTab === 'analytics' && 'Analytics & Performance'}
                {activeTab === 'profile' && 'Academy Profile Management'}
              </h1>
              <div className="w-[340px] flex flex-col items-start">
                <p className="text-sm text-[#5E8C7D] leading-[21px] self-stretch">Welcome back, {user?.full_name || 'Academy Owner'}</p>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
          <div className="flex h-[60px] px-4 py-3 flex-col items-start self-stretch">
            <h2 className="text-[22px] font-bold text-[#0F1717] leading-7 self-stretch">Today's Academy Snapshot</h2>
          </div>

          {/* Stats Cards */}
          <div className="flex items-start gap-4 self-stretch p-4">
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Total Students</span>
                  <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">{statistics?.totalStudents || 0}</span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">New/Pending Students</span>
                  <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">{statistics?.pendingStudents || 0}</span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Active Teachers</span>
                  <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">{statistics?.activeTeachers || 0}</span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Pending Batch Enrollments</span>
                  <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">{pendingEnrollments.length}</span>
            </div>
          </div>

          {/* All Activity Section */}
          <div className="flex px-4 flex-col items-start self-stretch">
            <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
              <div className="flex px-4 py-3 justify-between items-center self-stretch">
                <span className="text-[22px] font-bold text-[#0F1717] leading-7">All Activity</span>
                <button 
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center bg-[#F0F5F2] rounded-lg"
                >
                  <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">+ Add Activity</span>
                </button>
              </div>
              
              <div className="flex items-start self-stretch gap-4 overflow-x-auto pb-2">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex w-[280px] px-4 flex-col items-start flex-shrink-0">
                          <div className="flex flex-col justify-center items-center self-stretch rounded-xl">
                            <img 
                              src={activity.image} 
                              alt={activity.name} 
                              className="h-[157px] self-stretch rounded-xl object-cover"
                            />
                            <div className="flex h-[101px] flex-col justify-center items-center gap-4 self-stretch">
                              <span className="text-base font-bold text-[#0F1717] leading-5">{activity.name}</span>
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-shrink-0 bg-[#F0F5F2] rounded-2xl hover:bg-[#E5F5F0] transition-colors"
                              >
                                <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Manage</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex w-[280px] px-4 flex-col items-start flex-shrink-0">
                        <div className="flex flex-col justify-center items-center self-stretch rounded-xl bg-[#F0F5F2] h-[258px]">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📚</div>
                            <p className="text-sm text-[#5E8C7D]">No activities yet</p>
                            <p className="text-xs text-[#5E8C7D] mt-1">Add your first activity</p>
                          </div>
                        </div>
                      </div>
                    )}
                
                <div className="flex w-[280px] px-4 flex-col items-start flex-shrink-0">
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="flex px-[69px] pt-16 pb-20 flex-col items-center gap-[29px] self-stretch bg-[#F0F5F2] rounded-xl relative hover:bg-[#E5F5F0] transition-colors cursor-pointer w-full"
                  >
                    <div className="text-[89px] font-thin text-[#0F1717] text-center overflow-hidden text-ellipsis whitespace-nowrap opacity-50 absolute left-26 top-16 w-[52px] h-16 flex justify-center items-center">+</div>
                    <div className="text-sm text-[#0F1717] leading-[21px] text-center overflow-hidden text-ellipsis absolute left-[82px] top-[157px] w-[97px] h-[21px]">Add Activity</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div className="flex px-4 flex-col items-start self-stretch">
              <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
                <div className="flex px-4 py-3 justify-between items-center self-stretch">
                  <span className="text-[22px] font-bold text-[#0F1717] leading-7">Teachers ({teachers.length})</span>
                  <button className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center bg-[#F0F5F2] rounded-lg">
                    <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">+ Add Teacher</span>
                  </button>
                </div>
                
                <div className="space-y-4 p-4">
                  {teachers.map((teacher, index) => {
                    console.log('Rendering teacher:', JSON.stringify(teacher, null, 2))
                    const assignedBatchesCount = teacher.batches?.length || 0;
                    return (
                      <div key={index} className="bg-white border border-[#DBE5E0] rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-12 bg-[#F0F5F2] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-base font-bold text-[#0F1717]">
                                {teacher.teacher?.full_name?.charAt(0) || 'T'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-[#0F1717] text-lg">{teacher.teacher?.full_name || 'Unknown Teacher'}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  teacher.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {teacher.status}
                                </span>
                              </div>
                              <p className="text-sm text-[#5E8C7D] mb-3">{teacher.teacher?.email}</p>
                              
                              {/* Assigned Batches Section */}
                              {assignedBatchesCount > 0 ? (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-[#0F1717] mb-2">
                                    Assigned Batches ({assignedBatchesCount}):
                                  </p>
                                  <div className="space-y-2">
                                    {teacher.batches.map((batch: any, batchIndex: number) => (
                                      <div key={batchIndex} className="bg-[#F7FCFA] border border-[#DBE5E0] rounded-lg p-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#0F1717] truncate">
                                              {batch.name}
                                            </p>
                                            <p className="text-xs text-[#5E8C7D]">
                                              {batch.skills?.name || batch.skill?.name || 'Unknown Skill'}
                                            </p>
                                          </div>
                                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                            batch.status === 'active' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {batch.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-[#5E8C7D] italic mt-2">
                                  No batches assigned yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-[#DBE5E0]">
                          <button 
                            onClick={() => handleManageTeacher(teacher)}
                            className="px-4 py-2 bg-[#009963] text-white text-sm font-medium rounded-lg hover:bg-[#007a4f] transition-colors"
                          >
                            Manage Teacher
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {teachers.length === 0 && (
                    <div className="text-center py-8 text-[#5E8C7D]">
                      <p>No teachers found. Add teachers to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="flex px-4 flex-col items-start self-stretch">
              <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
                <div className="flex px-4 py-3 justify-between items-center self-stretch">
                  <span className="text-[22px] font-bold text-[#0F1717] leading-7">Students ({students.length})</span>
                  <button className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center bg-[#F0F5F2] rounded-lg">
                    <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">+ Add Student</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {students.map((student, index) => {
                    console.log('Rendering student:', JSON.stringify(student, null, 2))
                    return (
                      <div key={index} className="bg-white border border-[#DBE5E0] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#F0F5F2] rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-[#0F1717]">
                              {student.student?.full_name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#0F1717]">{student.student?.full_name || 'Unknown Student'}</h3>
                            <p className="text-sm text-[#5E8C7D]">{student.student?.email}</p>
                            
                            {/* Batch and Skill Information */}
                            {student.batchEnrollments && student.batchEnrollments.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {student.batchEnrollments.slice(0, 2).map((enrollment: any, enrollmentIndex: number) => (
                                    <span key={enrollmentIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#F0F5F2] text-[#5E8C7D]">
                                      {enrollment.batches?.skills?.name || 'Unknown Skill'} - {enrollment.batches?.name}
                                    </span>
                                  ))}
                                  {student.batchEnrollments.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#E8F0ED] text-[#5E8C7D]">
                                      +{student.batchEnrollments.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                        <button 
                          onClick={() => handleManageStudent(student)}
                          className="text-sm text-[#009963] hover:underline"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Batches Tab */}
          {activeTab === 'batches' && (
            <div className="flex px-4 flex-col items-start self-stretch gap-4">
              {/* Enrollment Requests Section */}
              {pendingEnrollments.length > 0 && (
                <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
                  <div className="flex px-4 py-3 justify-between items-center self-stretch">
                    <span className="text-[22px] font-bold text-[#0F1717] leading-7">
                      Pending Enrollment Requests ({pendingEnrollments.length})
                    </span>
                  </div>
                  <div className="w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Batch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingEnrollments.map((enrollment) => (
                          <tr key={enrollment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {enrollment.student?.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {enrollment.student?.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {enrollment.batch?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {enrollment.batch?.skill?.name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={async () => {
                                    const response = await AdminApi.approveBatchEnrollment(enrollment.id)
                                    if (!response.error) {
                                      fetchAcademyData()
                                    } else {
                                      alert('Failed to approve enrollment: ' + response.error)
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to reject this enrollment request?')) {
                                      const response = await AdminApi.rejectBatchEnrollment(enrollment.id)
                                      if (!response.error) {
                                        fetchAcademyData()
                                      } else {
                                        alert('Failed to reject enrollment: ' + response.error)
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
                <div className="flex px-4 py-3 justify-between items-center self-stretch">
                  <span className="text-[22px] font-bold text-[#0F1717] leading-7">Batches ({batches.length})</span>
                  <button 
                    onClick={handleCreateBatch}
                    className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center bg-[#F0F5F2] rounded-lg hover:bg-[#E8F0ED] transition-colors"
                  >
                    <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">+ Create Batch</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {batches.length > 0 ? batches.map((batch, index) => {
                    const currentBatchEnrollments = batchEnrollments.filter(enrollment => enrollment.batch?.id === batch.id);
                    return (
                      <div key={index} className="bg-white border border-[#DBE5E0] rounded-xl p-4">
                        <div className="mb-3">
                          <h3 className="font-bold text-[#0F1717] mb-1">{batch.name || 'Unnamed Batch'}</h3>
                          <p className="text-sm text-[#5E8C7D]">Skill: {batch.skill?.name || 'Unknown'}</p>
                          <p className="text-sm text-[#5E8C7D]">Teacher: {batch.teacher?.full_name || 'Unassigned'}</p>
                          <p className="text-sm text-[#5E8C7D]">Students: {currentBatchEnrollments.length}/{batch.max_students || 'N/A'}</p>
                          <p className="text-sm text-[#5E8C7D]">Duration: {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            batch.status === 'active' ? 'bg-green-100 text-green-800' : 
                            batch.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {batch.status || 'unknown'}
                          </span>
                          <button 
                            onClick={() => handleManageBatch(batch)}
                            className="text-sm text-[#009963] hover:underline"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full text-center py-8">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-sm text-[#5E8C7D]">No batches created yet</p>
                      <p className="text-xs text-[#5E8C7D] mt-1">Create your first batch to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'profile' && academyData && (
            <div className="flex px-4 py-8 flex-col items-start self-stretch">
              <AcademyProfileManagement
                academy={academyData}
                onSuccess={() => {
                  // Reload academy data after successful update
                  fetchAcademyData();
                  setActiveTab('overview');
                }}
                onCancel={() => {
                  setActiveTab('overview');
                }}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="flex px-4 flex-col items-start self-stretch">
              <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
                <div className="flex px-4 py-3 justify-between items-center self-stretch">
                  <span className="text-[22px] font-bold text-[#0F1717] leading-7">Student Performance Analytics</span>
                </div>
                
                {/* Student Scores Section */}
                <div className="w-full p-4">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Student Scores & Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentScores.map((score, index) => (
                      <div key={index} className="bg-white border border-[#DBE5E0] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#F0F5F2] rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-[#0F1717]">
                              {score.student?.full_name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0F1717]">{score.student?.full_name || 'Unknown Student'}</h4>
                            <p className="text-sm text-[#5E8C7D]">{score.skill?.name || 'Unknown Skill'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#0F1717]">{score.score}</div>
                            <div className="text-xs text-[#5E8C7D]">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-[#0F1717]">{score.level}</div>
                            <div className="text-xs text-[#5E8C7D]">Level</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[#5E8C7D]">Updated by</div>
                            <div className="text-xs text-[#5E8C7D]">{score.updated_by_user?.full_name || 'Unknown'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch Enrollments Section */}
                <div className="w-full p-4">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Batch Enrollments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {batchEnrollments.map((enrollment, index) => (
                      <div key={index} className="bg-white border border-[#DBE5E0] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#F0F5F2] rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-[#0F1717]">
                              {enrollment.student?.full_name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0F1717]">{enrollment.student?.full_name || 'Unknown Student'}</h4>
                            <p className="text-sm text-[#5E8C7D]">{enrollment.batch?.name || 'Unknown Batch'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 
                            enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status}
                          </span>
                          <span className="text-xs text-[#5E8C7D]">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attendance Tracking - Coming Soon */}
                <div className="w-full p-4">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Attendance Tracking</h3>
                  <div className="bg-gradient-to-r from-[#F0F5F2] to-[#E8F0ED] rounded-xl p-6 text-center border border-[#DBE5E0]">
                    <div className="text-4xl mb-3">📊</div>
                    <h4 className="text-lg font-semibold text-[#0F1717] mb-2">Attendance Management</h4>
                    <p className="text-sm text-[#5E8C7D] mb-4">
                      Track student attendance, generate reports, and monitor class participation.
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-[#5E8C7D] text-white rounded-lg text-sm font-medium">
                      <span className="mr-2">🚀</span>
                      Coming Soon
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="w-full p-4">
                  <h3 className="text-lg font-bold text-[#0F1717] mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#DBE5E0] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#0F1717]">{studentScores.length}</div>
                      <div className="text-sm text-[#5E8C7D]">Total Scores Recorded</div>
                    </div>
                    <div className="bg-white border border-[#DBE5E0] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#0F1717]">
                        {studentScores.length > 0 ? Math.round(studentScores.reduce((sum, score) => sum + score.score, 0) / studentScores.length) : 0}
                      </div>
                      <div className="text-sm text-[#5E8C7D]">Average Score</div>
                    </div>
                    <div className="bg-white border border-[#DBE5E0] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#0F1717]">{batchEnrollments.length}</div>
                      <div className="text-sm text-[#5E8C7D]">Active Enrollments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Activities Sidebar */}
        <div className="w-[142px] pt-[100px] pl-[5px]">
          <div className="flex w-[142px] p-3 flex-col items-start bg-[#F7FCFA] rounded-xl h-[188px]">
            <span className="text-sm font-medium text-[#0D1C17] leading-[21px] mb-3">Upcoming Activities</span>
            {upcomingActivities.map((activity, index) => (
              <div key={index} className="flex p-2.5 px-4 items-center gap-2.5 self-stretch bg-[#F7FCFA]">
                <span className="text-sm text-[#0D1C17] leading-[21px]">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center items-start self-stretch bg-[#F7FCFA]">
        <div className="flex max-w-[960px] flex-1 flex-col items-start">
          <div className="flex px-5 py-10 flex-col items-start gap-6 flex-1 self-stretch">
            <div className="flex justify-between items-center content-center gap-6 self-stretch flex-wrap">
              <div className="flex w-40 min-w-40 flex-col items-center">
                <span className="text-base text-[#5E8C7D] leading-6 self-stretch text-center">About</span>
              </div>
              <div className="flex w-40 min-w-40 flex-col items-center">
                <span className="text-base text-[#5E8C7D] leading-6 self-stretch text-center">Contact</span>
              </div>
              <div className="flex w-40 min-w-40 flex-col items-center">
                <span className="text-base text-[#5E8C7D] leading-6 self-stretch text-center">Terms of Service</span>
              </div>
              <div className="flex w-40 min-w-40 flex-col items-center">
                <span className="text-base text-[#5E8C7D] leading-6 self-stretch text-center">Privacy Policy</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center self-stretch">
              <span className="text-base text-[#5E8C7D] leading-6 self-stretch text-center">@2024 Unpuzzle Club. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[603px] p-16 flex flex-col items-start gap-6 bg-[#F7FCFA] rounded-xl">
            <div className="flex h-[72px] p-4 justify-between items-center self-stretch">
              <span className="w-[288px] text-[32px] font-bold text-[#0F1717] leading-10">Add Activity</span>
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="w-8 h-8"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="flex px-4 flex-col items-start gap-[3px] self-stretch">
              <span className="text-base text-[#0F1717] leading-6 self-stretch">Select Activity Type -</span>
              <div className="flex p-4 py-0 items-start gap-3 self-stretch">
                {activities.map((activity, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedActivity(activity.name)}
                    className={`flex h-32 min-w-[84px] max-w-[480px] px-0 pb-3 flex-col justify-between items-center flex-1 rounded-xl ${
                      selectedActivity === activity.name ? 'bg-[#0F1717]' : 'bg-[#F0F5F2]'
                    }`}
                  >
                    <img 
                      src={activity.image} 
                      alt={activity.name} 
                      className="w-[148px] h-[83px] flex-shrink-0"
                    />
                    <span className={`text-sm font-bold leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center ${
                      selectedActivity === activity.name ? 'text-[#F0F5F2]' : 'text-[#0F1717]'
                    }`}>
                      {activity.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex px-4 items-center gap-4 self-stretch">
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 bg-[#F0F5F2] rounded-xl"
              >
                <span className="text-sm font-bold text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Cancel</span>
              </button>
              <button className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 bg-[#009963] rounded-xl">
                <span className="text-sm font-bold text-white leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Management Modal */}
      {selectedTeacher && (
        <TeacherManagementModal
          isOpen={showTeacherModal}
          onClose={handleCloseTeacherModal}
          teacher={selectedTeacher}
          onTeacherUpdated={handleTeacherUpdated}
        />
      )}

      {/* Student Management Modal */}
      {selectedStudent && (
        <StudentManagementModal
          isOpen={showStudentModal}
          onClose={handleCloseStudentModal}
          student={selectedStudent}
          onStudentUpdated={handleStudentUpdated}
        />
      )}

      {/* Batch Management Modal */}
      <BatchManagementModal
        isOpen={showBatchModal}
        onClose={handleCloseBatchModal}
        batch={selectedBatch}
        academyId={academyData?.id || ''}
        onBatchUpdated={handleBatchUpdated}
      />
    </div>
  )
}

export default AcademyDashboard
