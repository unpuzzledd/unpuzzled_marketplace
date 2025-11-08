import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const RoleSelection = () => {
  const { user, loading, updateUserRole, smartLoginWithGoogle } = useAuth()
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'academy_owner' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const navigate = useNavigate()

  // Check if user already has a role (user already exists)
  useEffect(() => {
    if (!loading && user && user.role) {
      // User already has a role, they should sign in instead
      // This will be handled in the render
    }
  }, [user, loading])

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await smartLoginWithGoogle()
    } catch (error) {
      console.error('Error signing in:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleRoleSubmit = async () => {
    if (!selectedRole) return

    try {
      setIsSubmitting(true)
      await updateUserRole(selectedRole)
      
      // Redirect based on selected role
      if (selectedRole === 'academy_owner') {
        navigate('/academy')
      } else if (selectedRole === 'teacher') {
        navigate('/teacher')
      } else if (selectedRole === 'student') {
        navigate('/student')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roles = [
    {
      id: 'student' as const,
      title: 'Student',
      description: 'I want to learn and take courses',
      icon: '🎓',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'teacher' as const,
      title: 'Teacher',
      description: 'I want to teach and create courses',
      icon: '👨‍🏫',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'academy_owner' as const,
      title: 'Academy Owner',
      description: 'I want to manage an educational institution',
      icon: '🏫',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user already exists (has a role)
  if (user && user.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            {/* Info Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Account Already Exists
            </h1>
            <p className="text-gray-600 mb-4">
              The email <span className="font-semibold text-gray-900">{user.email}</span> is already registered.
            </p>
            <p className="text-gray-600 mb-6">
              Please sign in to access your account.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSigningIn ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Proceed to Sign In'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.full_name || user?.email}! Please select your role to continue.
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === role.id
                  ? `${role.color} border-current ring-2 ring-current ring-opacity-50`
                  : `${role.color} border-transparent`
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{role.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {role.title}
                  </h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>
                <div className="ml-auto">
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    selectedRole === role.id
                      ? 'bg-current border-current'
                      : 'border-gray-300'
                  }`}>
                    {selectedRole === role.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRoleSubmit}
          disabled={!selectedRole || isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Setting up your account...
            </div>
          ) : (
            'Continue to Dashboard'
          )}
        </button>
      </div>
    </div>
  )
}

export default RoleSelection
