import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { TeacherApi } from '../lib/teacherApi'
import { TeacherBatchDetailModal } from '../components/teacher/TeacherBatchDetailModal'

type ActiveView = 'home' | 'batches' | 'students' | 'attendance'

const TeacherLanding = () => {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [activeView, setActiveView] = useState<ActiveView>('home')
  const [batches, setBatches] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<string>('all')
  const [skills, setSkills] = useState<string[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([])

  // Role-based access control
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'teacher') {
        // Redirect non-teachers to appropriate page
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role === 'academy_owner') {
          navigate('/academy')
        } else {
          navigate('/dashboard')
        }
      }
    } else if (!loading && !user) {
      // No user - redirect to home
      navigate('/')
    }
  }, [user, loading, navigate])

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user || user.role !== 'teacher') return

      setDataLoading(true)

      try {
        // Fetch batches and assignments in parallel
        const [batchesResponse, assignmentsResponse] = await Promise.all([
          TeacherApi.getMyBatches(user.id),
          TeacherApi.getAllMyAssignments(user.id)
        ])
        
        if (batchesResponse.data) {
          setBatches(batchesResponse.data)
          
          // Extract unique skills
          const uniqueSkills = [
            ...new Set(
              batchesResponse.data
                .map(b => b.skill?.name)
                .filter(Boolean)
            )
          ] as string[]
          setSkills(uniqueSkills)
        }

        if (assignmentsResponse.data) {
          setAssignments(assignmentsResponse.data)
        }

        // Fetch statistics
        const statsResponse = await TeacherApi.getMyStatistics(user.id)
        if (statsResponse.data) {
          setStatistics(statsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchTeacherData()
  }, [user])

  const handleSignOut = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      // Navigation is handled by signOut itself
    } catch (error) {
      setLoggingOut(false)
    }
  }

  const handleBatchClick = (batch: any) => {
    setSelectedBatch(batch)
  }

  const handleCloseBatchModal = () => {
    setSelectedBatch(null)
  }

  // Filter batches by selected skill
  const filteredBatches = selectedSkill === 'all' 
    ? batches 
    : batches.filter(b => b.skill?.name === selectedSkill)
  
  // Get approved, pending, and rejected assignments
  const approvedAssignments = assignments.filter(a => a.status === 'approved')
  const pendingAssignments = assignments.filter(a => a.status === 'pending')
  const rejectedAssignments = assignments.filter(a => a.status === 'rejected')
  
  // Show "Browse Academies" if teacher has no approved assignments OR has pending/rejected assignments
  const shouldShowBrowseAcademies = approvedAssignments.length === 0 || pendingAssignments.length > 0 || rejectedAssignments.length > 0

  // Loading state
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FCFA]">
      {/* Header */}
      <header className="flex px-10 py-3 justify-between items-center border-b border-[#E5E8EB]">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start">
            <div className="w-4 flex-1 relative">
              <svg style={{ width: '16px', height: '16px', fill: '#0F1717' }} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.333333 0.333333H4.7778V4.7778H9.2222V9.2222H13.6667V13.6667H0.333333V0.333333V0.333333Z" fill="#0F1717"/>
              </svg>
            </div>
          </div>
          <h1 className="font-lexend text-lg font-bold leading-[23px] text-[#0F1717]">Unpuzzle Club</h1>
        </div>
        
        <div className="flex justify-end items-start gap-8 flex-1">
          <div className="flex h-10 items-center gap-9">
            <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717] cursor-pointer hover:text-[#009963]">Home</span>
          </div>
          <div className="flex h-10 max-w-[480px] px-[10px] justify-center items-center gap-2 rounded-[20px] bg-[#F0F5F2] cursor-pointer hover:bg-[#E0E8E5]">
            <div className="flex flex-col items-center flex-1">
              <div className="flex-1 self-stretch">
                <svg style={{ width: '20px', height: '20px', fill: '#0F1717' }} width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.3281 12.7453C14.8945 11.9984 14.25 9.88516 14.25 7.125C14.25 3.67322 11.4518 0.875 8 0.875C4.54822 0.875 1.75 3.67322 1.75 7.125C1.75 9.88594 1.10469 11.9984 0.671094 12.7453C0.445722 13.1318 0.444082 13.6092 0.666796 13.9973C0.889509 14.3853 1.30261 14.6247 1.75 14.625H4.93828C5.23556 16.0796 6.51529 17.1243 8 17.1243C9.48471 17.1243 10.7644 16.0796 11.0617 14.625H14.25C14.6972 14.6244 15.1101 14.3849 15.3326 13.9969C15.5551 13.609 15.5534 13.1317 15.3281 12.7453V12.7453ZM8 15.875C7.20562 15.8748 6.49761 15.3739 6.23281 14.625H9.76719C9.50239 15.3739 8.79438 15.8748 8 15.875V15.875ZM1.75 13.375C2.35156 12.3406 3 9.94375 3 7.125C3 4.36358 5.23858 2.125 8 2.125C10.7614 2.125 13 4.36358 13 7.125C13 9.94141 13.6469 12.3383 14.25 13.375H1.75Z" fill="#0F1717"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5E8C7D] rounded-[20px] flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.full_name?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#0F1717]">{user?.full_name || 'Teacher'}</p>
              <p className="text-xs text-[#5E8C7D]">Teacher</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="px-4 py-2 bg-[#F0F5F2] text-[#0D1C17] font-medium text-sm rounded-lg hover:bg-[#E5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loggingOut && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[800px] flex-col items-start flex-shrink-0 self-stretch bg-[#F7FCFA]">
        <div className="flex flex-col items-start self-stretch">
          <div className="flex p-6 justify-center items-start gap-4 flex-1 self-stretch">
            {/* Sidebar */}
            <div className="flex flex-col justify-center items-start gap-[10px]">
              <div className="flex w-[269px] min-h-[700px] h-[760px] p-4 flex-col justify-between items-start rounded-2xl bg-white">
                <div className="flex flex-col items-start gap-4 self-stretch">
                  {/* User Profile */}
                  <div className="flex items-start gap-3 self-stretch">
                    <div className="w-10 h-10 bg-[#5E8C7D] rounded-[20px] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {user?.full_name?.charAt(0).toUpperCase() || 'T'}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex flex-col items-start">
                        <span className="font-lexend text-base font-normal leading-6 text-[#0F1717]">
                          {user?.full_name || 'Teacher'}
                        </span>
                      </div>
                      <div className="flex w-20 flex-col items-start">
                        <span className="font-lexend text-sm font-normal leading-[21px] text-[#5E8C7D]">Teacher</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <div className="flex flex-col items-start gap-2 self-stretch">
                    {/* Home - Active */}
                    <div 
                      onClick={() => setActiveView('home')}
                      className={`flex px-3 py-2 items-center gap-3 self-stretch rounded-[20px] cursor-pointer transition-colors ${
                        activeView === 'home' ? 'bg-[#F0F5F2]' : 'hover:bg-[#F0F5F2]/50'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18 8.83281V17.5C18 18.3284 17.3284 19 16.5 19H12.75C11.9216 19 11.25 18.3284 11.25 17.5V13.75C11.25 13.3358 10.9142 13 10.5 13H7.5C7.08579 13 6.75 13.3358 6.75 13.75V17.5C6.75 18.3284 6.07843 19 5.25 19H1.5C0.671573 19 0 18.3284 0 17.5V8.83281C-6.38024e-05 8.41309 0.17573 8.01254 0.484688 7.72844L7.98469 0.652188L7.995 0.641875C8.56719 0.121501 9.44124 0.121501 10.0134 0.641875C10.0166 0.645543 10.0201 0.648989 10.0238 0.652188L17.5238 7.72844C17.8296 8.01402 18.0022 8.41437 18 8.83281V8.83281Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Home</span>
                      </div>
                    </div>

                    {/* Batches */}
                    <div 
                      onClick={() => setActiveView('batches')}
                      className={`flex px-3 py-2 items-center gap-3 self-stretch rounded-[20px] cursor-pointer transition-colors ${
                        activeView === 'batches' ? 'bg-[#F0F5F2]' : 'hover:bg-[#F0F5F2]/50'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '20px', height: '17px', fill: '#0F1717', position: 'relative', left: '2px', top: '4px' }} width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M1.75 0.75H18.25C19.0784 0.75 19.75 1.42157 19.75 2.25V12.75C19.75 13.5784 19.0784 14.25 18.25 14.25H1.75C0.921573 14.25 0.25 13.5784 0.25 12.75V2.25C0.25 1.42157 0.921573 0.75 1.75 0.75ZM1.75 12.75H18.25V2.25H1.75V12.75ZM19 17.25C19.4142 17.25 19.75 16.9142 19.75 16.5C19.75 16.0858 19.4142 15.75 19 15.75H1C0.585786 15.75 0.25 16.0858 0.25 16.5C0.25 16.9142 0.585786 17.25 1 17.25H19Z" fill="#0F1717"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M13.4163 6.87562L8.91625 3.87563C8.68605 3.72204 8.38998 3.70769 8.14601 3.83831C7.90204 3.96892 7.74982 4.22327 7.75 4.5V10.5C7.74982 10.7767 7.90204 11.0311 8.14601 11.1617C8.38998 11.2923 8.68605 11.278 8.91625 11.1244L13.4163 8.12438C13.6252 7.98533 13.7507 7.75098 13.7507 7.5C13.7507 7.24902 13.6252 7.01467 13.4163 6.87562ZM9.25 5.90625V9.09844L11.6481 7.5L9.25 5.90625Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Batches</span>
                      </div>
                    </div>

                    {/* Students */}
                    <div 
                      onClick={() => setActiveView('students')}
                      className={`flex px-3 py-2 items-center gap-3 self-stretch rounded-[20px] cursor-pointer transition-colors ${
                        activeView === 'students' ? 'bg-[#F0F5F2]' : 'hover:bg-[#F0F5F2]/50'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.9922 10.805C13.0561 9.43099 13.9769 6.86767 13.2592 4.49441C12.5414 2.12114 10.3544 0.497718 7.875 0.497718C5.39558 0.497718 3.20857 2.12114 2.49084 4.49441C1.7731 6.86767 2.69393 9.43099 4.75781 10.805C2.93952 11.4752 1.38666 12.7153 0.330938 14.3403C0.179932 14.5647 0.161484 14.8531 0.28266 15.095C0.403836 15.3368 0.645857 15.4947 0.916031 15.5081C1.18621 15.5215 1.44266 15.3884 1.58719 15.1597C2.97076 13.0317 5.33677 11.7479 7.875 11.7479C10.4132 11.7479 12.7792 13.0317 14.1628 15.1597C14.3917 15.4999 14.8514 15.5932 15.1948 15.3692C15.5382 15.1452 15.6381 14.6869 15.4191 14.3403C14.3633 12.7153 12.8105 11.4752 10.9922 10.805V10.805ZM3.75 6.125C3.75 3.84683 5.59683 2 7.875 2C10.1532 2 12 3.84683 12 6.125C12 8.40317 10.1532 10.25 7.875 10.25C5.5979 10.2474 3.75258 8.4021 3.75 6.125V6.125ZM23.4506 15.3781C23.1037 15.6043 22.6391 15.5066 22.4128 15.1597C21.0308 13.0303 18.6636 11.7466 16.125 11.75C15.7108 11.75 15.375 11.4142 15.375 11C15.375 10.5858 15.7108 10.25 16.125 10.25C17.7863 10.2484 19.2846 9.25042 19.9261 7.71798C20.5677 6.18554 20.2273 4.4178 19.0626 3.23312C17.898 2.04844 16.1363 1.67805 14.5931 2.29344C14.3427 2.40171 14.0531 2.36541 13.8372 2.19864C13.6212 2.03188 13.5128 1.76096 13.5542 1.49125C13.5956 1.22154 13.7802 0.995581 14.0363 0.90125C16.7109 -0.165433 19.7592 0.960006 21.099 3.50883C22.4388 6.05765 21.6374 9.2067 19.2422 10.805C21.0605 11.4752 22.6133 12.7153 23.6691 14.3403C23.8953 14.6872 23.7975 15.1518 23.4506 15.3781V15.3781Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Students</span>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div 
                      onClick={() => setActiveView('attendance')}
                      className={`flex px-3 py-2 items-center gap-3 self-stretch rounded-[20px] cursor-pointer transition-colors ${
                        activeView === 'attendance' ? 'bg-[#F0F5F2]' : 'hover:bg-[#F0F5F2]/50'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.25 2.75H10.75V1.25C10.75 0.835786 10.4142 0.5 10 0.5C9.58579 0.5 9.25 0.835786 9.25 1.25V2.75H1.75C0.921573 2.75 0.25 3.42157 0.25 4.25V15.5C0.25 16.3284 0.921573 17 1.75 17H5.44L3.41406 19.5312C3.15518 19.8549 3.20765 20.3271 3.53125 20.5859C3.85485 20.8448 4.32705 20.7924 4.58594 20.4688L7.36 17H12.64L15.4141 20.4688C15.6729 20.7924 16.1451 20.8448 16.4688 20.5859C16.7924 20.3271 16.8448 19.8549 16.5859 19.5312L14.56 17H18.25C19.0784 17 19.75 16.3284 19.75 15.5V4.25C19.75 3.42157 19.0784 2.75 18.25 2.75V2.75ZM18.25 15.5H1.75V4.25H18.25V15.5V15.5ZM7.75 10.25V12.5C7.75 12.9142 7.41421 13.25 7 13.25C6.58579 13.25 6.25 12.9142 6.25 12.5V10.25C6.25 9.83579 6.58579 9.5 7 9.5C7.41421 9.5 7.75 9.83579 7.75 10.25V10.25ZM10.75 8.75V12.5C10.75 12.9142 10.4142 13.25 10 13.25C9.58579 13.25 9.25 12.9142 9.25 12.5V8.75C9.25 8.33579 9.58579 8 10 8C10.4142 8 10.75 8.33579 10.75 8.75V8.75ZM13.75 7.25V12.5C13.75 12.9142 13.4142 13.25 13 13.25C12.5858 13.25 12.25 12.9142 12.25 12.5V7.25C12.25 6.83579 12.5858 6.5 13 6.5C13.4142 6.5 13.75 6.83579 13.75 7.25V7.25Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Attendance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex max-w-[960px] flex-col items-start gap-4 flex-1">
              {activeView === 'home' && (
                <div className="flex flex-col items-start gap-6 self-stretch">
                  <div className="flex flex-col items-start self-stretch">
                    <div className="flex p-4 justify-between items-start content-start gap-3 self-stretch flex-wrap">
                      {/* Welcome Section */}
                      <div className="flex min-w-[288px] flex-col items-start gap-3">
                        <div className="flex flex-col items-start">
                          <h2 className="font-lexend text-[32px] font-bold leading-10 text-[#0F1717]">
                            Welcome back, {user?.full_name?.split(' ')[0] || 'Teacher'}!
                          </h2>
                        </div>
                        <div className="flex w-[379px] flex-col items-start">
                          <p className="font-lexend text-sm font-normal leading-[21px] text-[#5E8C7D]">
                            {statistics ? (
                              <>You've completed {statistics.completedTopics} topics and have {statistics.upcomingTopics} upcoming.</>
                            ) : (
                              'Loading your statistics...'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Your Course Dropdown */}
                      <div className="flex h-[68px] flex-col items-end gap-1">
                        <span className="font-lexend text-base font-bold leading-[30.916px] tracking-[0.403px] text-[#121212]">Your Course</span>
                        <div className="relative">
                          <select
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            className="flex h-8 min-w-[84px] max-w-[480px] px-4 pr-8 justify-center items-center flex-shrink-0 rounded-lg bg-[#009963] text-white font-lexend text-sm font-normal leading-[21px] appearance-none cursor-pointer"
                          >
                            <option value="all">All Courses</option>
                            {skills.map(skill => (
                              <option key={skill} value={skill}>{skill}</option>
                            ))}
                          </select>
                          <svg 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z" fill="white"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Today's Classes Card */}
                    <div className="flex justify-center items-start gap-4 self-stretch">
                      <div className="flex min-h-[283px] p-4 justify-center items-start gap-4 flex-1 rounded-xl border border-[#DBE5E0] bg-white">
                        <div className="flex flex-col items-start gap-4 flex-1">
                          <div className="flex items-center gap-3 self-stretch">
                            <h3 className="font-lexend text-[20px] font-bold leading-[30.916px] tracking-[0.403px] text-[#121212]">
                              Your Batches
                            </h3>
                          </div>
                          
                          <div className="flex flex-col items-start gap-[14px] self-stretch">
                            {/* Show Browse Academies if teacher has no assignments or has pending/rejected */}
                            {shouldShowBrowseAcademies && (
                              <div className="flex items-center justify-between px-3 py-2 bg-[#F0F5F2] rounded-lg border border-[#009963] self-stretch">
                                <div className="flex flex-col gap-1 flex-1">
                                  <div className="font-lexend text-base font-semibold leading-7 text-[#121212]">
                                    Browse Academies
                                  </div>
                                  <div className="font-lexend text-sm leading-4 text-[#5E8C7D]">
                                    {approvedAssignments.length === 0 
                                      ? 'Start your teaching journey by exploring available academies'
                                      : pendingAssignments.length > 0
                                      ? `${pendingAssignments.length} request${pendingAssignments.length > 1 ? 's' : ''} pending approval`
                                      : rejectedAssignments.length > 0
                                      ? `${rejectedAssignments.length} request${rejectedAssignments.length > 1 ? 's' : ''} rejected. Browse more academies`
                                      : 'Explore more academies and opportunities'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate('/teacher/search')}
                                  className="flex-shrink-0 px-4 py-2 bg-[#009963] text-white text-sm font-medium rounded-lg hover:bg-[#007a4f] transition-colors"
                                  title="Browse Academies"
                                >
                                  Browse
                                </button>
                              </div>
                            )}
                            
                            {filteredBatches.length === 0 && !shouldShowBrowseAcademies ? (
                              <div className="flex px-3 py-4 justify-center items-center self-stretch">
                                <span className="font-lexend text-sm text-[#5E8C7D]">
                                  No batches assigned yet.
                                </span>
                              </div>
                            ) : filteredBatches.length > 0 ? (
                              <>
                                {shouldShowBrowseAcademies && (
                                  <div className="w-full h-[1.344px] bg-[#ECECEC]"></div>
                                )}
                                {filteredBatches.map((batch, index) => (
                                  <div key={batch.id}>
                                    <div className="flex px-3 justify-between items-center self-stretch">
                                      <div className="flex flex-col items-start gap-1 flex-1">
                                        <span className="font-lexend text-base font-normal leading-[28.228px] text-[#121212] opacity-70">
                                          {batch.name}
                                        </span>
                                        <span className="font-lexend text-sm leading-[16.13px] text-[#41475E] opacity-50">
                                          {batch.skill?.name || 'No skill'} • {formatDate(batch.start_date)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div 
                                          className="flex items-center gap-1 cursor-pointer hover:opacity-70"
                                          onClick={() => handleBatchClick(batch)}
                                        >
                                          <svg width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.50004 15.8095L9.50007 15.8094L15.6633 9.64623C14.8245 9.29711 13.831 8.72363 12.8914 7.78403C11.9516 6.84428 11.3781 5.85061 11.029 5.01171L4.86568 11.175L4.86567 11.1751C4.38471 11.656 4.14422 11.8965 3.9374 12.1617C3.69344 12.4744 3.48427 12.8129 3.31361 13.171C3.16893 13.4746 3.06139 13.7972 2.84629 14.4425L1.71203 17.8453C1.60618 18.1628 1.68883 18.5129 1.92552 18.7496C2.1622 18.9863 2.51231 19.0689 2.82986 18.9631L6.23264 17.8288C6.87792 17.6137 7.20057 17.5062 7.50414 17.3615C7.86223 17.1909 8.20067 16.9817 8.51346 16.7377C8.77861 16.5309 9.01911 16.2904 9.50004 15.8095Z" fill="#5E8C7D"/>
                                            <path d="M17.3735 7.93601C18.6533 6.65626 18.6533 4.58137 17.3735 3.30161C16.0938 2.02186 14.0189 2.02186 12.7391 3.30161L11.9999 4.04081C12.01 4.07138 12.0205 4.10237 12.0314 4.13376C12.3024 4.91471 12.8136 5.93847 13.7753 6.90015C14.7369 7.86183 15.7607 8.37303 16.5416 8.64398C16.5729 8.65482 16.6037 8.66527 16.6342 8.67535L17.3735 7.93601Z" fill="#5E8C7D"/>
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    {index < filteredBatches.length - 1 && (
                                      <div className="w-full h-[1.344px] bg-[#ECECEC] my-3"></div>
                                    )}
                                  </div>
                                ))}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Check Student's Attendance */}
                    <div className="flex min-w-[288px] p-4 flex-col justify-center items-start gap-4 self-stretch rounded-xl border border-[#DBE5E0] bg-white mt-4">
                      <div className="flex h-8 justify-between items-center self-stretch">
                        <div className="flex justify-between items-center flex-1">
                          <h3 className="font-lexend text-lg font-bold leading-[23px] text-[#0F1717]">Manage Classes</h3>
                          <button 
                            onClick={() => setActiveView('batches')}
                            className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center rounded-lg bg-[#009963] hover:bg-[#007a4f] transition-colors"
                          >
                            <div className="flex justify-center items-start gap-1">
                              <span className="font-lexend text-sm font-normal leading-[21px] text-white overflow-hidden text-ellipsis line-clamp-1">View All Batches</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'batches' && (
                <div className="flex flex-col items-start gap-4 self-stretch p-4">
                  <h2 className="text-[32px] font-bold text-[#0F1717]">All Batches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {batches.map(batch => (
                      <div 
                        key={batch.id}
                        className="bg-white border border-[#DBE5E0] rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleBatchClick(batch)}
                      >
                        <h3 className="font-bold text-[#0F1717] mb-2">{batch.name}</h3>
                        <p className="text-sm text-[#5E8C7D] mb-1">{batch.skill?.name}</p>
                        <p className="text-xs text-[#5E8C7D]">
                          {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {batch.status}
                          </span>
                          <span className="text-xs text-[#5E8C7D]">Max: {batch.max_students} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'students' && (
                <div className="flex flex-col items-start gap-4 self-stretch p-4">
                  <h2 className="text-[32px] font-bold text-[#0F1717]">Students</h2>
                  <div className="bg-white border border-[#DBE5E0] rounded-xl p-4 w-full">
                    <p className="text-[#5E8C7D]">
                      Select a batch to view students or use the batches view.
                    </p>
                  </div>
                </div>
              )}

              {activeView === 'attendance' && (
                <div className="flex flex-col items-start gap-4 self-stretch p-4">
                  <h2 className="text-[32px] font-bold text-[#0F1717]">Attendance</h2>
                  <div className="bg-white border border-[#DBE5E0] rounded-xl p-4 w-full">
                    <p className="text-[#5E8C7D]">
                      Attendance tracking coming soon...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <TeacherBatchDetailModal
          isOpen={!!selectedBatch}
          onClose={handleCloseBatchModal}
          batch={selectedBatch}
          teacherId={user?.id || ''}
          onRefresh={() => {
            // Refresh teacher data
            if (user) {
              TeacherApi.getMyBatches(user.id).then(response => {
                if (response.data) setBatches(response.data)
              })
            }
          }}
        />
      )}
    </div>
  )
}

export default TeacherLanding
