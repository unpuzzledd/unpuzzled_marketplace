import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { AdminApi } from '../lib/adminApi'
import { AdminAcademyManagement } from '../components/AdminAcademyManagement'
import { AdminLocationManagement } from '../components/AdminLocationManagement'
import { AdminSkillManagement } from '../components/AdminSkillManagement'
import { AdminPhotoApproval } from '../components/AdminPhotoApproval'

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { adminUser, isAuthenticated, loading, adminSignOut } = useAdminAuth()
  const navigate = useNavigate()
  
  // Real data state
  const [stats, setStats] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    // Always check localStorage directly for most up-to-date state
    const adminSessionFromStorage = localStorage.getItem('admin_session')
    const hasAdminSession = !!adminSessionFromStorage
    
    // Never redirect while loading - wait for authentication to complete
    if (loading) {
      return
    }
    
    // Check if this is an OAuth callback (has code parameter)
    const isOAuthCallback = window.location.search.includes('code=')
    
    // If we have admin session in localStorage, we're authenticated
    // This is the source of truth since localStorage updates synchronously
    if (hasAdminSession) {
      // If React state hasn't caught up yet, wait a bit for it to sync
      if (!isAuthenticated || !adminUser) {
        const syncTimer = setTimeout(() => {
          // Re-check after a brief delay
          const stillHasSession = localStorage.getItem('admin_session')
          if (!stillHasSession && !isAuthenticated) {
            navigate('/admin/signin')
          }
        }, 500)
        return () => clearTimeout(syncTimer)
      }
      
      // Clean OAuth code from URL if present
      if (isOAuthCallback) {
        window.history.replaceState({}, '', window.location.pathname)
      }
      return // Authenticated, no redirect needed
    }
    
    // No admin session - check if we're processing OAuth callback
    if (isOAuthCallback) {
      const redirectTimer = setTimeout(() => {
        // Final check - re-read localStorage (source of truth)
        const finalCheckSession = localStorage.getItem('admin_session')
        if (!finalCheckSession) {
          navigate('/admin/signin')
        }
      }, 6000) // 6 seconds to give callback plenty of time
      
      return () => clearTimeout(redirectTimer)
    }
    
    // Not loading, not authenticated, and not OAuth callback - redirect to signin
    if (!isAuthenticated && !hasAdminSession) {
      navigate('/admin/signin')
    }
    
    // Redirect from approvals page if user is on it (since we removed the tab)
    if (currentPage === 'approvals') {
      setCurrentPage('dashboard')
    }
  }, [isAuthenticated, loading, navigate, currentPage, adminUser])

  // Load dashboard data when authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadDashboardData()
    }
  }, [isAuthenticated, loading])

  const loadDashboardData = async () => {
    try {
      setDataLoading(true)
      setDataError(null)
      const [statsData, activitiesData] = await Promise.all([
        AdminApi.getDashboardStats(),
        AdminApi.getRecentActivities(10)
      ])
      setStats(statsData)
      setRecentActivities(activitiesData)
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setDataLoading(false)
    }
  }

  const handleDataUpdate = () => {
    loadDashboardData()
  }

  const handleLogout = () => {
    adminSignOut()
    // adminSignOut already redirects to homepage, so no need for navigate
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }


  const renderDashboard = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )
    }

    if (dataError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{dataError}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Total Academies</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalAcademies || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Pending Academies</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingAcademies || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Active Academies</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activeAcademies || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Pending Photos</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.pendingPhotos || 0}</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Suspended Academies</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.suspendedAcademies || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Total Photos</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalPhotos || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Pending Skills</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.pendingSkills || 0}</p>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">Total Admins</h3>
            <p className="text-3xl font-bold text-teal-600">{stats?.totalAdmins || 0}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border rounded shadow-sm">
          <h3 className="text-lg font-semibold p-4 border-b">Recent Activities</h3>
          <div className="divide-y divide-gray-200">
            {recentActivities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No recent activities
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.status === 'active' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderAcademies = () => (
    <AdminAcademyManagement onAcademyUpdate={handleDataUpdate} />
  )

  const renderLocations = () => (
    <AdminLocationManagement onLocationUpdate={handleDataUpdate} />
  )

  const renderSkills = () => (
    <AdminSkillManagement onSkillUpdate={handleDataUpdate} />
  )

  const renderPhotos = () => (
    <AdminPhotoApproval onApprovalComplete={handleDataUpdate} />
  )

  const renderContent = () => {
    switch(currentPage) {
      case 'dashboard': return renderDashboard()
      case 'academies': return renderAcademies()
      case 'locations': return renderLocations()
      case 'skills': return renderSkills()
      case 'photos': return renderPhotos()
      default: return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{adminUser?.name} ({adminUser?.role})</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPage === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('academies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPage === 'academies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Academies
            </button>
            <button
              onClick={() => setCurrentPage('locations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPage === 'locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Locations
            </button>
            <button
              onClick={() => setCurrentPage('skills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPage === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setCurrentPage('photos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentPage === 'photos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Photos
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
