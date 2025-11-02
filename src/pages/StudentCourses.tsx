import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { StudentApi } from '../lib/studentApi'
import { StudentBatchDetailModal } from '../components/student/StudentBatchDetailModal'

const StudentCourses = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [batches, setBatches] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [filterSkill, setFilterSkill] = useState<string>('all')

  // Role-based access control
  useEffect(() => {
    // Only run redirects after loading is complete
    if (loading) {
      console.log('StudentCourses: Auth still loading...')
      return
    }

    console.log('StudentCourses: Auth loaded. User:', user?.email, 'Role:', user?.role)

    if (user) {
      if (user.role !== 'student') {
        console.log('StudentCourses: User is not a student, redirecting to home')
        navigate('/')
        } else {
        console.log('StudentCourses: User is a student, staying on page')
      }
    } else {
      console.log('StudentCourses: No user found, redirecting to home')
      navigate('/')
    }
  }, [user, loading, navigate])

  // Fetch student batches
  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || user.role !== 'student') return

      setDataLoading(true)
      try {
        const batchesRes = await StudentApi.getMyBatches(user.id)
        if (batchesRes.data) {
          setBatches(batchesRes.data)
        }
      } catch (error) {
        console.error('Error fetching batches:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchBatches()
  }, [user])

  const handleBatchClick = (batch: any) => {
    setSelectedBatch(batch)
  }

  const handleCloseBatchModal = () => {
    setSelectedBatch(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Get unique skills for filtering
  const skills = [...new Set(batches.map(b => b.skill?.name).filter(Boolean))] as string[]

  // Filter batches by skill
  const filteredBatches = filterSkill === 'all' 
    ? batches 
    : batches.filter(b => b.skill?.name === filterSkill)

  if (loading || dataLoading) {
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
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/student')}
              className="p-2 hover:bg-[#F0F5F2] rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-[#0F1717]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0F1717]">My Courses</h1>
              <p className="text-sm text-[#5E8C7D] mt-1">
                You're enrolled in {batches.length} {batches.length === 1 ? 'course' : 'courses'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#0F1717]">Filter by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterSkill('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterSkill === 'all'
                    ? 'bg-[#009963] text-white'
                    : 'bg-white text-[#5E8C7D] border border-[#DBE5E0] hover:bg-[#F0F5F2]'
                }`}
              >
                All Courses ({batches.length})
              </button>
              {skills.map(skill => (
                  <button
                  key={skill}
                  onClick={() => setFilterSkill(skill)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSkill === skill
                      ? 'bg-[#009963] text-white'
                      : 'bg-white text-[#5E8C7D] border border-[#DBE5E0] hover:bg-[#F0F5F2]'
                  }`}
                >
                  {skill} ({batches.filter(b => b.skill?.name === skill).length})
                  </button>
                ))}
              </div>
            </div>
        </div>

        {/* Courses Grid */}
        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#DBE5E0] p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-[#5E8C7D] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-bold text-[#0F1717] mb-2">No Courses Found</h3>
              <p className="text-sm text-[#5E8C7D]">
                {batches.length === 0 
                  ? "You haven't enrolled in any courses yet." 
                  : "No courses match the selected filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => handleBatchClick(batch)}
                className="bg-white rounded-xl border border-[#DBE5E0] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Course Header with Skill Icon */}
                <div className="bg-gradient-to-br from-[#009963] to-[#007a4f] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14L21 9V16L12 21L3 16V9L12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'active' 
                        ? 'bg-green-400/20 text-white' 
                        : 'bg-gray-400/20 text-white'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-white/80">
                    {batch.skill?.name}
                  </p>
                </div>

                {/* Course Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#5E8C7D]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H12V1C12 0.734784 11.8946 0.48043 11.7071 0.292893C11.5196 0.105357 11.2652 0 11 0C10.7348 0 10.4804 0.105357 10.2929 0.292893C10.1054 0.48043 10 0.734784 10 1V2H6V1C6 0.734784 5.89464 0.48043 5.70711 0.292893C5.51957 0.105357 5.26522 0 5 0C4.73478 0 4.48043 0.105357 4.29289 0.292893C4.10536 0.48043 4 0.734784 4 1V2H2C1.46957 2 0.960859 2.21071 0.585786 2.58579C0.210714 2.96086 0 3.46957 0 4V14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2ZM14 14H2V7H14V14Z" fill="currentColor"/>
                      </svg>
                      <span>{formatDate(batch.start_date)} - {formatDate(batch.end_date)}</span>
          </div>

                    <div className="flex items-center gap-2 text-sm text-[#5E8C7D]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                      </svg>
                      <span>{batch.academy?.name}</span>
                    </div>

                    {batch.teacher && (
                      <div className="flex items-center gap-2 text-sm text-[#5E8C7D]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8Z" fill="currentColor"/>
                          <path d="M8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                        </svg>
                        <span>Instructor: {batch.teacher.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5E8EB]">
                    <button className="w-full px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium">
                      View Course Details
                    </button>
                    </div>
                </div>
                </div>
              ))}
          </div>
        )}
        </main>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <StudentBatchDetailModal
          isOpen={!!selectedBatch}
          onClose={handleCloseBatchModal}
          batch={selectedBatch}
          studentId={user?.id || ''}
        />
      )}
    </div>
  )
}

export default StudentCourses
