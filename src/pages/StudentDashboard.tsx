import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { StudentApi } from '../lib/studentApi'
import { StudentBatchDetailModal } from '../components/student/StudentBatchDetailModal'
import { ViewTopic } from './ViewTopic'
import { mergeScheduleWithExceptions, formatScheduleTime, getDayName } from '../utils/scheduleUtils'

const StudentDashboard = () => {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  
  // UI State
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedActivityBatch, setSelectedActivityBatch] = useState('all')
  const [activeNav, setActiveNav] = useState('Home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Data State
  const [batches, setBatches] = useState<any[]>([])
  const [activitiesWithSchedule, setActivitiesWithSchedule] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [showViewTopic, setShowViewTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  const navItems = [
    {
      name: 'Home',
      icon: (
        <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 8.58086V17.248C18 18.0765 17.3284 18.748 16.5 18.748H12.75C11.9216 18.748 11.25 18.0765 11.25 17.248V13.498C11.25 13.0838 10.9142 12.748 10.5 12.748H7.5C7.08579 12.748 6.75 13.0838 6.75 13.498V17.248C6.75 18.0765 6.07843 18.748 5.25 18.748H1.5C0.671573 18.748 0 18.0765 0 17.248V8.58086C-6.38962e-05 8.16114 0.17573 7.76058 0.484688 7.47648L7.98469 0.400234L7.995 0.389922C8.56719 -0.130452 9.44124 -0.130452 10.0134 0.389922C10.0166 0.39359 10.0201 0.397036 10.0238 0.400234L17.5238 7.47648C17.8296 7.76207 18.0022 8.16242 18 8.58086Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Courses',
      icon: (
        <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M19.5 0H13.5C12.3197 0 11.2082 0.555728 10.5 1.5C9.7918 0.555728 8.68034 0 7.5 0H1.5C0.671573 0 0 0.671573 0 1.5V13.5C0 14.3284 0.671573 15 1.5 15H7.5C8.74264 15 9.75 16.0074 9.75 17.25C9.75 17.6642 10.0858 18 10.5 18C10.9142 18 11.25 17.6642 11.25 17.25C11.25 16.0074 12.2574 15 13.5 15H19.5C20.3284 15 21 14.3284 21 13.5V1.5C21 0.671573 20.3284 0 19.5 0ZM7.5 13.5H1.5V1.5H7.5C8.74264 1.5 9.75 2.50736 9.75 3.75V14.25C9.1015 13.762 8.3116 13.4987 7.5 13.5ZM19.5 13.5H13.5C12.6884 13.4987 11.8985 13.762 11.25 14.25V3.75C11.25 2.50736 12.2574 1.5 13.5 1.5H19.5V13.5Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Attendance',
      comingSoon: true,
      icon: (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M18 2.25H10.5V0.75C10.5 0.335786 10.1642 0 9.75 0C9.33579 0 9 0.335786 9 0.75V2.25H1.5C0.671573 2.25 0 2.92157 0 3.75V15C0 15.8284 0.671573 16.5 1.5 16.5H5.19L3.16406 19.0312C2.90518 19.3549 2.95765 19.8271 3.28125 20.0859C3.60485 20.3448 4.07705 20.2924 4.33594 19.9688L7.11 16.5H12.39L15.1641 19.9688C15.4229 20.2924 15.8951 20.3448 16.2188 20.0859C16.5424 19.8271 16.5948 19.3549 16.3359 19.0312L14.31 16.5H18C18.8284 16.5 19.5 15.8284 19.5 15V3.75C19.5 2.92157 18.8284 2.25 18 2.25ZM18 15H1.5V3.75H18V15ZM7.5 9.75V12C7.5 12.4142 7.16421 12.75 6.75 12.75C6.33579 12.75 6 12.4142 6 12V9.75C6 9.33579 6.33579 9 6.75 9C7.16421 9 7.5 9.33579 7.5 9.75ZM10.5 8.25V12C10.5 12.4142 10.1642 12.75 9.75 12.75C9.33579 12.75 9 12.4142 9 12V8.25C9 7.83579 9.33579 7.5 9.75 7.5C10.1642 7.5 10.5 7.83579 10.5 8.25ZM13.5 6.75V12C13.5 12.4142 13.1642 12.75 12.75 12.75C12.3358 12.75 12 12.4142 12 12V6.75C12 6.33579 12.3358 6 12.75 6C13.1642 6 13.5 6.33579 13.5 6.75Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Settings',
      comingSoon: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M9.81006 5.31055C7.32478 5.31055 5.31006 7.32527 5.31006 9.81055C5.31006 12.2958 7.32478 14.3105 9.81006 14.3105C12.2953 14.3105 14.3101 12.2958 14.3101 9.81055C14.3075 7.32634 12.2943 5.31313 9.81006 5.31055ZM9.81006 12.8105C8.1532 12.8105 6.81006 11.4674 6.81006 9.81055C6.81006 8.15369 8.1532 6.81055 9.81006 6.81055C11.4669 6.81055 12.8101 8.15369 12.8101 9.81055C12.8101 11.4674 11.4669 12.8105 9.81006 12.8105ZM18.0601 10.013C18.0638 9.87805 18.0638 9.74305 18.0601 9.60805L19.4588 7.86055C19.6075 7.67448 19.659 7.42881 19.5976 7.19867C19.3683 6.33674 19.0252 5.50916 18.5776 4.73773C18.4587 4.53304 18.2502 4.39647 18.0151 4.3693L15.7913 4.1218C15.6988 4.0243 15.6051 3.93055 15.5101 3.84055L15.2476 1.61117C15.2202 1.37586 15.0832 1.16731 14.8782 1.04867C14.1065 0.60181 13.279 0.259142 12.4172 0.0296094C12.187 -0.0316167 11.9413 0.0202336 11.7554 0.169297L10.0126 1.56055C9.87756 1.56055 9.74256 1.56055 9.60756 1.56055L7.86006 0.164609C7.67399 0.0158727 7.42832 -0.0356262 7.19818 0.0258594C6.33639 0.255572 5.50886 0.598562 4.73725 1.04586C4.53255 1.16472 4.39598 1.37323 4.36881 1.60836L4.12131 3.83586C4.02381 3.92898 3.93006 4.02273 3.84006 4.11711L1.61068 4.37305C1.37537 4.40042 1.16682 4.53737 1.04818 4.74242C0.601321 5.51414 0.258653 6.34165 0.0291212 7.20336C-0.032105 7.43365 0.0197453 7.67933 0.168809 7.86523L1.56006 9.60805C1.56006 9.74305 1.56006 9.87805 1.56006 10.013L0.164121 11.7605C0.0153844 11.9466 -0.0361145 12.1923 0.0253711 12.4224C0.254674 13.2844 0.597686 14.1119 1.04537 14.8834C1.16423 15.0881 1.37274 15.2246 1.60787 15.2518L3.83162 15.4993C3.92475 15.5968 4.0185 15.6905 4.11287 15.7805L4.37256 18.0099C4.39994 18.2452 4.53688 18.4538 4.74193 18.5724C5.51365 19.0193 6.34116 19.362 7.20287 19.5915C7.43316 19.6527 7.67884 19.6009 7.86475 19.4518L9.60756 18.0605C9.74256 18.0643 9.87756 18.0643 10.0126 18.0605L11.7601 19.4593C11.9461 19.608 12.1918 19.6595 12.4219 19.598C13.2839 19.3687 14.1115 19.0257 14.8829 18.578C15.0876 18.4592 15.2241 18.2507 15.2513 18.0155L15.4988 15.7918C15.5963 15.6993 15.6901 15.6055 15.7801 15.5105L18.0094 15.248C18.2447 15.2207 18.4533 15.0837 18.5719 14.8787C19.0188 14.107 19.3615 13.2794 19.591 12.4177C19.6522 12.1874 19.6004 11.9418 19.4513 11.7559L18.0601 10.013ZM16.5507 9.40367C16.5666 9.67469 16.5666 9.94641 16.5507 10.2174C16.5395 10.403 16.5976 10.5861 16.7138 10.7312L18.0441 12.3934C17.8915 12.8785 17.696 13.3491 17.4601 13.7996L15.3413 14.0396C15.1568 14.0601 14.9864 14.1483 14.8632 14.2871C14.6827 14.4901 14.4905 14.6823 14.2876 14.8627C14.1487 14.986 14.0605 15.1563 14.0401 15.3409L13.8047 17.4577C13.3543 17.6938 12.8837 17.8893 12.3985 18.0418L10.7354 16.7115C10.6023 16.6052 10.437 16.5473 10.2666 16.5474H10.2216C9.95061 16.5634 9.67889 16.5634 9.40787 16.5474C9.22232 16.5363 9.03924 16.5944 8.89412 16.7105L7.22725 18.0418C6.74212 17.8891 6.27152 17.6937 5.821 17.4577L5.581 15.3418C5.56051 15.1573 5.47233 14.9869 5.3335 14.8637C5.13054 14.6832 4.93833 14.491 4.75787 14.288C4.63462 14.1492 4.46426 14.061 4.27975 14.0405L2.16287 13.8043C1.9268 13.3538 1.73134 12.8832 1.57881 12.398L2.90912 10.7349C3.02528 10.5898 3.08342 10.4067 3.07225 10.2212C3.05631 9.95016 3.05631 9.67844 3.07225 9.40742C3.08342 9.22187 3.02528 9.03879 2.90912 8.89367L1.57881 7.22773C1.73146 6.74261 1.92691 6.27201 2.16287 5.82148L4.27881 5.58148C4.46332 5.561 4.63368 5.47282 4.75693 5.33398C4.93739 5.13102 5.1296 4.93882 5.33256 4.75836C5.47194 4.63503 5.56049 4.46428 5.581 4.2793L5.81631 2.16336C6.26678 1.92729 6.73739 1.73183 7.22256 1.5793L8.88568 2.90961C9.0308 3.02577 9.21389 3.0839 9.39943 3.07273C9.67045 3.0568 9.94217 3.0568 10.2132 3.07273C10.3987 3.0839 10.5818 3.02577 10.7269 2.90961L12.3929 1.5793C12.878 1.73195 13.3486 1.9274 13.7991 2.16336L14.0391 4.2793C14.0596 4.46381 14.1478 4.63417 14.2866 4.75742C14.4896 4.93788 14.6818 5.13009 14.8622 5.33305C14.9855 5.47188 15.1559 5.56007 15.3404 5.58055L17.4572 5.81586C17.6933 6.26633 17.8888 6.73694 18.0413 7.22211L16.711 8.88523C16.5937 9.03158 16.5355 9.21654 16.5479 9.40367H16.5507Z" fill="currentColor"/>
        </svg>
      )
    }
  ]

  // Role-based access control
  useEffect(() => {
    // Only run redirects after loading is complete
    if (loading) {
      return
    }

    if (user) {
      if (user.role !== 'student') {
        // Redirect non-students to appropriate page
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role === 'academy_owner') {
          navigate('/academy')
        } else if (user.role === 'teacher') {
          navigate('/teacher')
        } else {
          navigate('/')
        }
      }
    } else {
      // No user - redirect to home
      navigate('/')
    }
  }, [user, loading, navigate])

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || user.role !== 'student') return

      setDataLoading(true)

      try {
        // Parallel fetch for better performance
        const [batchesRes, activitiesRes, statsRes] = await Promise.all([
          StudentApi.getMyBatches(user.id),
          StudentApi.getUpcomingActivities(user.id, 20), // Get more activities to allow filtering
          StudentApi.getMyStatistics(user.id)
        ])

        if (batchesRes.data) setBatches(batchesRes.data)
        if (activitiesRes.data) {
          // Fetch schedule exceptions for each batch and merge schedules
          const enrichedActivities = await Promise.all(
            activitiesRes.data.map(async (activity: any) => {
              if (!activity.batch?.weekly_schedule || !activity.batch.start_date) {
                return { ...activity, scheduleInfo: null }
              }

              try {
                // Get schedule exceptions for this batch
                const exceptionsRes = await StudentApi.getBatchScheduleExceptions(activity.batch.id)
                const exceptions = exceptionsRes.data || []

                // Merge schedule with exceptions
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const nextWeekEnd = new Date(today)
                nextWeekEnd.setDate(today.getDate() + 7)
                
                const endDate = activity.batch.end_date 
                  ? (new Date(activity.batch.end_date) < nextWeekEnd 
                      ? activity.batch.end_date 
                      : nextWeekEnd.toISOString().split('T')[0])
                  : nextWeekEnd.toISOString().split('T')[0]

                const mergedSchedule = mergeScheduleWithExceptions(
                  activity.batch.weekly_schedule,
                  exceptions,
                  activity.batch.start_date,
                  endDate
                )

                // Find the class schedule for the topic's due date
                const topicDate = new Date(activity.due_date)
                topicDate.setHours(0, 0, 0, 0)
                
                const classSchedule = mergedSchedule.find(item => {
                  const itemDate = new Date(item.date)
                  itemDate.setHours(0, 0, 0, 0)
                  return itemDate.getTime() === topicDate.getTime()
                })

                return {
                  ...activity,
                  scheduleInfo: classSchedule || null
                }
              } catch (error) {
                console.error('Error fetching schedule for activity:', error)
                return { ...activity, scheduleInfo: null }
              }
            })
          )

          setActivitiesWithSchedule(enrichedActivities)
        }
        if (statsRes.data) setStatistics(statsRes.data)
      } catch (error) {
        // Silent catch - data loading error
      } finally {
        setDataLoading(false)
      }
    }

    fetchStudentData()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCloseBatchModal = () => {
    setSelectedBatch(null)
  }

  const handleViewTopic = (activity: any) => {
    setSelectedTopic(activity)
    setShowViewTopic(true)
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

  // Loading state
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    )
  }

  // Filter batches by selected course and enrollment status
  // Only show active enrollments in main list
  const activeBatches = batches.filter(b => b.enrollment_status === 'active')
  const filteredBatches = selectedCourse === 'all' 
    ? activeBatches 
    : activeBatches.filter(b => b.skill?.id === selectedCourse)
  
  // Get pending and rejected enrollments separately
  const pendingEnrollments = batches.filter(b => b.enrollment_status === 'pending')
  const rejectedEnrollments = batches.filter(b => b.enrollment_status === 'rejected')
  
  // Show "Browse Academies" if user has no active enrollments OR has pending/rejected enrollments
  const shouldShowBrowseAcademies = activeBatches.length === 0 || pendingEnrollments.length > 0 || rejectedEnrollments.length > 0

  // Filter activities by selected batch
  const filteredActivities = selectedActivityBatch === 'all'
    ? activitiesWithSchedule
    : activitiesWithSchedule.filter((activity: any) => activity.batch?.id === selectedActivityBatch)

  return (
    <div className="flex flex-col w-full min-h-screen bg-white font-lexend">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 md:px-10 py-3 border-b border-[#E5E8EB] bg-white">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-[#0F1717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-col">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.14199e-05 0.000325561H4.44455V4.44479H8.88895V8.88919H13.3334V13.3337H8.14199e-05V0.000325561Z" fill="#0F1717"/>
            </svg>
          </div>
          <div className="font-bold text-base sm:text-lg text-[#0F1717]">Unpuzzle Club</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 flex-1 justify-end">
          <nav className="hidden md:flex items-center gap-6 lg:gap-9 h-10">
            <button 
              onClick={() => setActiveNav('Home')}
              className={`text-sm font-normal ${activeNav === 'Home' ? 'text-[#009963] font-semibold' : 'text-[#0F1717]'}`}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/student/courses')} 
              className="text-[#0F1717] text-sm font-normal hover:text-[#009963] transition-colors"
            >
              Courses
            </button>
            <button 
              onClick={() => navigate('/student/search')} 
              className="text-[#0F1717] text-sm font-normal hover:text-[#009963] transition-colors"
            >
              Browse Academies
            </button>
            <button className="text-[#0F1717] text-sm font-normal">Announcements</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F0F5F2] p-2 sm:p-2.5">
              <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1717]" />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-[#5E8C7D] rounded-full">
                <span className="text-white font-bold text-sm md:text-lg">
                  {user?.full_name?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#0F1717]">{user?.full_name || 'Student'}</p>
                <p className="text-xs text-[#5E8C7D]">Student</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F0F5F2] text-[#0D1C17] font-medium text-xs sm:text-sm rounded-lg hover:bg-[#E5F5F0] transition-colors min-h-[44px]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[800px] bg-[#F7FCFA] relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-[269px] min-h-[700px] bg-white rounded-2xl m-0 md:m-5 p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-[#0F1717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col gap-4">
            {/* User Profile */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#5E8C7D] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {user?.full_name?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="text-base font-normal text-[#0F1717]">
                  {user?.full_name || user?.email || 'Student'}
                </div>
                <div className="text-sm font-normal text-[#5E8C7D]">Student</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveNav(item.name)
                    if (item.name === 'Courses') {
                      navigate('/student/courses')
                    } else if (item.name === 'Settings') {
                      navigate('/student/settings')
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[20px] text-sm font-normal ${
                    activeNav === item.name
                      ? 'bg-[#F0F5F2] text-[#0F1717]'
                      : 'text-[#0F1717]'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                  {item.comingSoon && item.name !== 'Settings' && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-[#FFF4E5] text-[#FF9500] rounded-full font-medium">
                      Coming soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-[960px] flex flex-col w-full">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-3 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:gap-3 w-full sm:min-w-[288px]">
              <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold leading-tight sm:leading-10 text-[#0F1717]">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm font-normal leading-5 sm:leading-[21px] text-[#5E8C7D]">
                {statistics ? (
                  <>You've mastered {statistics.completedTopics} topics and have {statistics.upcomingTopics} upcoming.</>
                ) : (
                  'Loading your progress...'
                )}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
              <div className="text-sm sm:text-base font-bold text-[#121212]">Your Course</div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 h-10 sm:h-8 min-w-[84px] sm:max-w-[480px] rounded-lg bg-[#009963] text-white text-sm font-normal appearance-none cursor-pointer pr-8"
              >
                <option value="all">All Courses</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.skill?.id}>
                    {batch.skill?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="px-3 sm:px-4 md:px-6 mx-2 sm:mx-3">
            <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border border-[#DBE5E0] bg-white min-h-[283px] sm:h-[283px]">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold leading-7 sm:leading-[31px] text-[#121212]">
                    Upcoming Activities
                  </h2>
                  {activeBatches.length > 1 && (
                    <select
                      value={selectedActivityBatch}
                      onChange={(e) => setSelectedActivityBatch(e.target.value)}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#F0F5F2] text-[#5E8C7D] border border-[#DBE5E0] cursor-pointer appearance-none pr-6 sm:pr-8"
                    >
                      <option value="all">All Batches</option>
                      {activeBatches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex flex-col gap-3.5 overflow-y-auto">
                  {/* Show Browse Academies if user has no enrollments or has pending/rejected */}
                  {shouldShowBrowseAcademies && (
                    <div className="flex items-center justify-between px-3 py-2 bg-[#F0F5F2] rounded-lg border border-[#009963]">
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="text-base leading-7 text-[#121212] font-semibold">
                          Browse Academies
                        </div>
                        <div className="text-sm leading-4 text-[#5E8C7D]">
                          {activeBatches.length === 0 
                            ? 'Start your learning journey by exploring available academies'
                            : pendingEnrollments.length > 0
                            ? `${pendingEnrollments.length} enrollment request${pendingEnrollments.length > 1 ? 's' : ''} pending approval`
                            : rejectedEnrollments.length > 0
                            ? `${rejectedEnrollments.length} enrollment${rejectedEnrollments.length > 1 ? 's' : ''} rejected. Browse more academies`
                            : 'Explore more academies and courses'}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/student/search')}
                        className="flex-shrink-0 px-4 py-2 bg-[#009963] text-white text-sm font-medium rounded-lg hover:bg-[#007a4f] transition-colors"
                        title="Browse Academies"
                      >
                        Browse
                      </button>
                    </div>
                  )}
                  
                  {filteredActivities.length === 0 && !shouldShowBrowseAcademies ? (
                    <div className="flex justify-center items-center py-8 text-[#5E8C7D] text-sm">
                      No upcoming activities
                    </div>
                  ) : (
                    filteredActivities.map((activity: any, index: number) => {
                      const scheduleInfo = activity.scheduleInfo
                      const hasScheduleChange = scheduleInfo && scheduleInfo.status !== 'normal'
                      
                      return (
                        <div key={activity.id}>
                          {shouldShowBrowseAcademies && index === 0 && (
                            <div className="w-full h-[1.344px] bg-[#ECECEC] my-3.5" />
                          )}
                          <div className={`flex justify-between items-start px-3 py-2 rounded-lg ${hasScheduleChange ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                            <div className="flex flex-col gap-1 flex-1">
                              <div className="text-base leading-7 text-[#121212] opacity-70">
                                {activity.title}
                              </div>
                              <div className="text-sm leading-4 text-[#41475E] opacity-50">
                                {formatDate(activity.due_date)} • {activity.batch?.skill?.name}
                              </div>
                              {scheduleInfo && (
                                <div className="mt-1 flex flex-col gap-1">
                                  {scheduleInfo.status === 'unavailable' ? (
                                    <div className="text-xs text-red-600 flex items-center gap-1">
                                      <span className="line-through">
                                        {getDayName(scheduleInfo.day)}: {formatScheduleTime(scheduleInfo.from_time)} - {formatScheduleTime(scheduleInfo.to_time)}
                                      </span>
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">Unavailable</span>
                                    </div>
                                  ) : scheduleInfo.status === 'time_changed' ? (
                                    <div className="text-xs text-yellow-700 flex items-center gap-1 flex-wrap">
                                      <span className="font-medium">
                                        {getDayName(scheduleInfo.day)}: {formatScheduleTime(scheduleInfo.from_time)} - {formatScheduleTime(scheduleInfo.to_time)}
                                      </span>
                                      {scheduleInfo.original_time && (
                                        <span className="text-gray-600">
                                          (changed from {scheduleInfo.original_time})
                                        </span>
                                      )}
                                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">Time Changed</span>
                                    </div>
                                  ) : scheduleInfo.status === 'moved' ? (
                                    <div className="text-xs text-blue-700 flex items-center gap-1 flex-wrap">
                                      <span className="font-medium">
                                        {getDayName(scheduleInfo.day)}: {formatScheduleTime(scheduleInfo.from_time)} - {formatScheduleTime(scheduleInfo.to_time)}
                                      </span>
                                      {scheduleInfo.original_time && (
                                        <span className="text-gray-600">
                                          (moved from {scheduleInfo.original_time})
                                        </span>
                                      )}
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">Moved</span>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-[#5E8C7D]">
                                      {getDayName(scheduleInfo.day)}: {formatScheduleTime(scheduleInfo.from_time)} - {formatScheduleTime(scheduleInfo.to_time)}
                                    </div>
                                  )}
                                  {scheduleInfo.exception?.notes && (
                                    <p className="text-xs text-gray-600 italic mt-0.5">{scheduleInfo.exception.notes}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleViewTopic(activity)}
                              className="flex-shrink-0 hover:opacity-70 transition-opacity ml-2"
                              title="View topic"
                            >
                              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 0C13.903 0 17.7363 2.23654 19.8945 6.55273C20.0353 6.83419 20.0353 7.16579 19.8945 7.44727C17.7363 11.7638 13.9031 14 10 14C6.09698 13.9999 2.26363 11.7636 0.105469 7.44727C-0.0351003 7.16585 -0.0352276 6.83411 0.105469 6.55273C2.26364 2.2365 6.09703 0.000127203 10 0ZM10 4C8.34339 4.00021 7.00018 5.34338 7 7C7 8.65677 8.34328 9.99979 10 10C11.6569 10 13 8.6569 13 7C12.9998 5.34326 11.6568 4 10 4Z" fill="#5E8C7D"/>
                              </svg>
                            </button>
                          </div>
                          {index < filteredActivities.length - 1 && (
                            <div className="w-full h-[1.344px] bg-[#ECECEC] my-3.5" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              
              {/* Scrollbar */}
              <div className="w-1.5 h-full bg-[#F2F2F2] rounded-[3px] relative">
                <div className="w-1.5 h-16 bg-[#C4C4C4] rounded-[3px] absolute top-0" />
              </div>
            </div>
          </div>

          {/* Pending Enrollments */}
          {pendingEnrollments.length > 0 && (
            <div className="px-3 sm:px-4 md:px-6 mx-2 sm:mx-3 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-yellow-900 mb-2">
                  Pending Enrollment Requests ({pendingEnrollments.length})
                </h3>
                <div className="space-y-2">
                  {pendingEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      <span className="text-yellow-800 break-words">
                        {enrollment.name} - {enrollment.academy?.name}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full w-fit">
                        Pending Approval
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Batches */}
          <div className="flex flex-col mt-3">
            <div className="flex gap-2 px-2 sm:px-4">
              <div className="flex-1 min-h-[400px] sm:min-h-[524px]">
                <div className="flex flex-col h-full p-4 sm:p-6 md:p-[29px] rounded-xl border border-[#DBE6E0] bg-white">
                  <div className="flex justify-between items-center mb-4 sm:mb-[18px]">
                    <div className="text-base sm:text-lg font-normal text-[#1C1D1D] opacity-80">
                      Enrolled Batches
                    </div>
                    <button className="flex items-center justify-center w-6 h-6 p-1 rounded-full bg-[rgba(28,29,29,0.05)]">
                      <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C1D1D]" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-[18px] overflow-y-auto">
                    {filteredBatches.length === 0 ? (
                      <div className="flex justify-center items-center py-8 text-[#5E8C7D] text-xs sm:text-sm">
                        {batches.length === 0 ? 'No enrolled courses yet' : 'No courses match the filter'}
                      </div>
                    ) : (
                      filteredBatches.map((batch) => (
                          <div
                            key={batch.id}
                            onClick={() => setSelectedBatch(batch)}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-h-[120px] sm:min-h-[92px] p-3 sm:p-4 rounded-xl border border-[#DBE5E0] bg-white cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] p-2 sm:p-2.5 rounded bg-[rgba(28,29,29,0.05)] flex-shrink-0">
                                {/* Skill icon - can be customized based on skill */}
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="32" height="32" rx="4" fill="#5E8C7D"/>
                                  <path d="M16 8L20 14H12L16 8Z" fill="white"/>
                                  <path d="M16 24L12 18H20L16 24Z" fill="white"/>
                                </svg>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
                              <div className="text-base sm:text-lg font-bold text-[#5E8C7D] break-words">
                                {batch.name}
                              </div>
                              <div className="text-xs sm:text-sm font-normal text-[#5E8C7D] break-words">
                                {batch.skill?.name} • {batch.academy?.name}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedBatch(batch)
                              }}
                              className="inline-flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-md bg-[#009963] text-white text-sm sm:text-base font-normal h-10 sm:h-11 w-full sm:w-[70px] hover:bg-[#007a4f] transition-colors min-h-[44px]"
                            >
                              View
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 md:p-10 mt-auto">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              <button className="text-sm sm:text-base text-center text-[#5E8C7D] min-w-[120px] sm:min-w-[160px]">
                About
              </button>
              <button className="text-sm sm:text-base text-center text-[#5E8C7D] min-w-[120px] sm:min-w-[160px]">
                Contact
              </button>
              <button className="text-sm sm:text-base text-center text-[#5E8C7D] min-w-[120px] sm:min-w-[160px]">
                Terms of Service
              </button>
              <button className="text-sm sm:text-base text-center text-[#5E8C7D] min-w-[120px] sm:min-w-[160px]">
                Privacy Policy
              </button>
            </div>
            <div className="text-xs sm:text-sm md:text-base text-center text-[#5E8C7D]">
              @2024 Unpuzzle Club. All rights reserved.
            </div>
          </footer>
        </main>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <StudentBatchDetailModal
          isOpen={!!selectedBatch}
          onClose={handleCloseBatchModal}
          batch={selectedBatch}
          studentId={user?.id || ''}
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
          topic={selectedTopic}
        />
      )}
    </div>
  )
}

export default StudentDashboard
