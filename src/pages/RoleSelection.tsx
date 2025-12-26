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
    // User already has a role - this is handled in render
  }, [user, loading])

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await smartLoginWithGoogle()
    } catch (error) {
      // Silent catch
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleRoleSubmit = async () => {
    if (!selectedRole) return

    // Double-check: Prevent role update if user already has a role
    if (user && user.role) {
      alert(`This email is already associated with the role: ${user.role}. Please sign in instead.`)
      return
    }

    try {
      setIsSubmitting(true)
      const result = await updateUserRole(selectedRole)
      
      // Check if update was successful
      if (!result.success) {
        // Show error message
        if (result.error) {
          alert(result.error)
        } else {
          alert('Failed to update role. Please try again or sign in if you already have an account.')
        }
        return
      }
      
      // After role update, check if profile is complete
      // Note: We need to wait for the user state to update, so we'll check after a brief delay
      // or redirect to profile completion for students and teachers
      if (selectedRole === 'academy_owner') {
        // Academy owners don't need profile completion, go directly to dashboard
        navigate('/academy')
      } else if (selectedRole === 'teacher' || selectedRole === 'student') {
        // Students and teachers need to complete profile
        navigate('/profile-completion')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      alert('Failed to update role. Please try again or sign in if you already have an account.')
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
    const roleDisplayNames: Record<string, string> = {
      'student': 'Student',
      'teacher': 'Teacher',
      'academy_owner': 'Academy Owner',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    }
    
    const roleDisplayName = roleDisplayNames[user.role] || user.role
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Email Already Registered
            </h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2">
                The email <span className="font-semibold text-gray-900">{user.email}</span> is already associated with the role:
              </p>
              <p className="text-lg font-bold text-yellow-800 mb-2">
                {roleDisplayName}
              </p>
              <p className="text-sm text-gray-600">
                You cannot sign up again with this email. Please sign in to access your existing account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
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
                'Sign In to Existing Account'
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Go Back to Home
            </button>
          </div>
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
