import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    // signOut already redirects to homepage, so no need for navigate
  }

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'student':
        return {
          title: 'Student Dashboard',
          message: 'Welcome to your learning journey!',
          features: ['Browse Courses', 'Track Progress', 'Join Study Groups', 'Access Resources']
        }
      case 'teacher':
        return {
          title: 'Teacher Dashboard',
          message: 'Ready to inspire and educate!',
          features: ['Create Courses', 'Manage Students', 'Track Analytics', 'Upload Materials']
        }
      case 'academy_owner':
        return {
          title: 'Academy Owner Dashboard',
          message: 'Manage your educational institution!',
          features: ['Manage Teachers', 'View Analytics', 'Handle Subscriptions', 'Institution Settings']
        }
      default:
        return {
          title: 'Dashboard',
          message: 'Welcome to your dashboard!',
          features: []
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const content = getRoleSpecificContent()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unpuzzled</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.full_name || user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {content.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {content.message}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Role: <span className="font-medium capitalize">{user?.role}</span></span>
                <span>•</span>
                <span>Email: <span className="font-medium">{user?.email}</span></span>
                <span>•</span>
                <span>Member since: {new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          {content.features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.features.map((feature, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {feature}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Coming soon...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <h4 className="font-medium text-gray-900">Update Profile</h4>
                  <p className="text-sm text-gray-600">Manage your account settings</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <h4 className="font-medium text-gray-900">View Analytics</h4>
                  <p className="text-sm text-gray-600">Track your progress and performance</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <h4 className="font-medium text-gray-900">Help & Support</h4>
                  <p className="text-sm text-gray-600">Get help when you need it</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
