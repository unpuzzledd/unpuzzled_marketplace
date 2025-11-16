import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { StudentApi } from '../lib/studentApi'
import { AdminApi } from '../lib/adminApi'
import { StudentAcademyDetailModal } from '../components/student/StudentAcademyDetailModal'

const StudentAcademySearch = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [academies, setAcademies] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const locationDropdownRef = useRef<HTMLDivElement>(null)
  const skillDropdownRef = useRef<HTMLDivElement>(null)
  const [academyStatuses, setAcademyStatuses] = useState<Record<string, string>>({})

  // Role-based access control - allow both students and teachers
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'student' && user.role !== 'teacher') {
        navigate('/')
      }
    } else if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(target)) {
        setShowLocationDropdown(false)
      }
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(target)) {
        setShowSkillDropdown(false)
      }
    }

    if (showLocationDropdown || showSkillDropdown) {
      // Use setTimeout to avoid immediate closure on button click
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showLocationDropdown, showSkillDropdown])

  // Load locations and skills (created by admin)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Fetch admin-created locations and skills (only active ones)
        const [locationsData, skillsData] = await Promise.all([
          AdminApi.getLocations(), // Gets all active locations from admin-managed locations table
          AdminApi.getSkills()     // Gets all active skills from admin-managed skills table
        ])
        
        console.log('Loaded locations:', locationsData)
        console.log('Loaded skills:', skillsData)
        
        setLocations(locationsData || [])
        setSkills(skillsData || [])
        
        if (!locationsData || locationsData.length === 0) {
          console.warn('No locations found. Check RLS policies.')
        }
        if (!skillsData || skillsData.length === 0) {
          console.warn('No skills found. Check RLS policies.')
        }
      } catch (error) {
        console.error('Error loading filters:', error)
        // Set empty arrays on error to prevent UI issues
        setLocations([])
        setSkills([])
      }
    }
    loadFilters()
  }, [])

  // Search academies
  useEffect(() => {
    const searchAcademies = async () => {
      if (!user || (user.role !== 'student' && user.role !== 'teacher')) return

      setDataLoading(true)
      try {
        console.log('Searching academies with:', {
          query: searchQuery,
          locationIds: selectedLocations,
          skillIds: selectedSkills
        })
        
        let response
        if (user.role === 'teacher') {
          // Use TeacherApi for teachers
          const { TeacherApi } = await import('../lib/teacherApi')
          response = await TeacherApi.searchAcademies(searchQuery, {
            locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
            skillIds: selectedSkills.length > 0 ? selectedSkills : undefined
          })
        } else {
          // Use StudentApi for students
          response = await StudentApi.searchAcademies(searchQuery, {
            locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
            skillIds: selectedSkills.length > 0 ? selectedSkills : undefined
          })
        }

        console.log('Search response:', response)

        if (response.data) {
          console.log('Academies found:', response.data.length)
          setAcademies(response.data)
          // Fetch statuses for each academy
          fetchAcademyStatuses(response.data)
        } else if (response.error) {
          console.error('Error searching academies:', response.error)
          setAcademies([])
        }
      } catch (error) {
        console.error('Error searching academies:', error)
        setAcademies([])
      } finally {
        setDataLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchAcademies()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedLocations, selectedSkills, user])

  const handleAcademyClick = async (academy: any) => {
    setDataLoading(true)
    try {
      let response
      if (user?.role === 'teacher') {
        // Use TeacherApi for teachers
        const { TeacherApi } = await import('../lib/teacherApi')
        response = await TeacherApi.getAcademyDetails(academy.id)
      } else {
        // Use StudentApi for students
        response = await StudentApi.getAcademyDetails(academy.id)
      }
      
      if (response.data) {
        setSelectedAcademy(response.data)
      }
    } catch (error) {
      console.error('Error loading academy details:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedAcademy(null)
  }

  // Fetch status for each academy (enrollment for students, assignment for teachers)
  const fetchAcademyStatuses = async (academiesList: any[]) => {
    if (!user) return

    const statuses: Record<string, string> = {}

    try {
      if (user.role === 'student') {
        // For students: check batch enrollments
        const { data: enrollments } = await StudentApi.getMyEnrollmentRequests(user.id)
        const { data: activeBatches } = await StudentApi.getMyBatches(user.id)

        for (const academy of academiesList) {
          if (academy.batches && academy.batches.length > 0) {
            // Check if student has any enrollment (pending or active) in any batch of this academy
            const hasPending = enrollments?.some((e: any) => 
              academy.batches.some((b: any) => b.id === e.batch?.id)
            )
            const hasActive = activeBatches?.some((b: any) => 
              academy.batches.some((batch: any) => batch.id === b.id && b.enrollment_status === 'active')
            )
            
            if (hasActive) {
              statuses[academy.id] = 'enrolled'
            } else if (hasPending) {
              statuses[academy.id] = 'pending'
            }
          }
        }
      } else if (user.role === 'teacher') {
        // For teachers: check academy assignments
        const { TeacherApi } = await import('../lib/teacherApi')
        const { data: assignments } = await TeacherApi.getAllMyAssignments(user.id)

        for (const academy of academiesList) {
          const assignment = assignments?.find((a: any) => a.academy_id === academy.id)
          if (assignment) {
            statuses[academy.id] = assignment.status
          }
        }
      }
    } catch (error) {
      console.error('Error fetching academy statuses:', error)
    }

    setAcademyStatuses(statuses)
  }

  const getStatusBadge = (academyId: string) => {
    const status = academyStatuses[academyId]
    if (!status) return null

    if (status === 'enrolled' || status === 'approved') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {user?.role === 'student' ? 'Enrolled' : 'Approved'}
        </span>
      )
    }
    if (status === 'pending') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Pending
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

  const formatLocation = (academy: any) => {
    if (academy.locations && academy.locations.length > 0) {
      const loc = academy.locations[0]
      return `${loc.city}, ${loc.state}`
    }
    return 'Location not specified'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FCFA] font-lexend">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E8EB] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student')}
              className="p-2 hover:bg-[#F0F5F2] rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-[#0F1717]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0F1717]">Browse Academies</h1>
              <p className="text-sm text-[#5E8C7D] mt-1">
                {user?.role === 'teacher' 
                  ? 'Search and request to join academies'
                  : 'Search and enroll in courses from various academies'}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#5E8C7D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by academy name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent"
                />
              </div>
            </div>
            {/* Location Multiselect */}
            <div className="relative" ref={locationDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowLocationDropdown(!showLocationDropdown)
                  setShowSkillDropdown(false)
                }}
                className="w-full px-4 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent bg-white text-left flex items-center justify-between min-w-[200px]"
              >
                <span className="text-sm text-[#0F1717]">
                  {selectedLocations.length === 0 
                    ? 'All Locations' 
                    : selectedLocations.length === 1
                    ? locations.find(l => l.id === selectedLocations[0])?.name || '1 selected'
                    : `${selectedLocations.length} Locations`}
                </span>
                <div className="flex items-center gap-2">
                  {selectedLocations.length > 0 && (
                    <span className="bg-[#009963] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedLocations.length}
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-[#5E8C7D] transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {showLocationDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-[#DBE5E0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-[#F0F5F2] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([])
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#0F1717]">All Locations</span>
                    </label>
                    {locations.map((location) => (
                      <label key={location.id} className="flex items-center p-2 hover:bg-[#F0F5F2] rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            if (e.target.checked) {
                              setSelectedLocations([...selectedLocations, location.id])
                            } else {
                              setSelectedLocations(selectedLocations.filter(id => id !== location.id))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-[#0F1717]">{location.name}, {location.city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Skill Multiselect */}
            <div className="relative" ref={skillDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowSkillDropdown(!showSkillDropdown)
                  setShowLocationDropdown(false)
                }}
                className="w-full px-4 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent bg-white text-left flex items-center justify-between min-w-[200px]"
              >
                <span className="text-sm text-[#0F1717]">
                  {selectedSkills.length === 0 
                    ? 'All Skills' 
                    : selectedSkills.length === 1
                    ? skills.find(s => s.id === selectedSkills[0])?.name || '1 selected'
                    : `${selectedSkills.length} Skills`}
                </span>
                <div className="flex items-center gap-2">
                  {selectedSkills.length > 0 && (
                    <span className="bg-[#009963] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedSkills.length}
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-[#5E8C7D] transition-transform ${showSkillDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {showSkillDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-[#DBE5E0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center p-2 hover:bg-[#F0F5F2] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkills.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([])
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#0F1717]">All Skills</span>
                    </label>
                    {skills.map((skill) => (
                      <label key={skill.id} className="flex items-center p-2 hover:bg-[#F0F5F2] rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            if (e.target.checked) {
                              setSelectedSkills([...selectedSkills, skill.id])
                            } else {
                              setSelectedSkills(selectedSkills.filter(id => id !== skill.id))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-[#0F1717]">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {dataLoading && academies.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
          </div>
        ) : academies.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#DBE5E0] p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-[#5E8C7D] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-bold text-[#0F1717] mb-2">No Academies Found</h3>
              <p className="text-sm text-[#5E8C7D]">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academies.map((academy) => (
              <div
                key={academy.id}
                onClick={() => handleAcademyClick(academy)}
                className="bg-white rounded-xl border border-[#DBE5E0] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Academy Photo */}
                {academy.photo_urls && academy.photo_urls.length > 0 ? (
                  <img
                    src={academy.photo_urls[0]}
                    alt={academy.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#009963] to-[#007a4f] flex items-center justify-center">
                    <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}

                {/* Academy Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#0F1717] flex-1">
                      {academy.name}
                    </h3>
                    {getStatusBadge(academy.id) && (
                      <div className="ml-2">
                        {getStatusBadge(academy.id)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#5E8C7D] mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{formatLocation(academy)}</span>
                  </div>
                  {academy.skills && academy.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {academy.skills.slice(0, 3).map((skill: any) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-[#E5F5F0] text-[#009963] text-xs font-medium rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {academy.skills.length > 3 && (
                        <span className="px-2 py-1 bg-[#E5F5F0] text-[#009963] text-xs font-medium rounded">
                          +{academy.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <button className="w-full px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Academy Detail Modal */}
      {selectedAcademy && user && (
        <StudentAcademyDetailModal
          isOpen={!!selectedAcademy}
          onClose={handleCloseModal}
          academy={selectedAcademy}
          studentId={user.role === 'student' ? user.id : ''}
          teacherId={user.role === 'teacher' ? user.id : ''}
          userRole={user.role}
        />
      )}
    </div>
  )
}

export default StudentAcademySearch

