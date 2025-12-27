import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ProfileCompletion } from '../components/ProfileCompletion'

const ProfileCompletionPage = () => {
  const { user, loading, updateUserProfile, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  const redirectToDashboard = useCallback((role: string) => {
    if (hasRedirectedRef.current) {
      console.log('Redirect already in progress, skipping...')
      return
    }
    hasRedirectedRef.current = true
    console.log('Redirecting to dashboard for role:', role)
    if (role === 'student') {
      navigate('/student')
    } else if (role === 'teacher') {
      navigate('/teacher')
    } else if (role === 'academy_owner') {
      navigate('/academy')
    } else {
      navigate('/dashboard')
    }
  }, [navigate])

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      navigate('/')
      return
    }

    // If user doesn't have a role, redirect to role selection
    if (!user.role) {
      navigate('/role-selection')
      return
    }

    // If profile is already complete, redirect to dashboard
    if (isProfileComplete(user, user.role)) {
      redirectToDashboard(user.role)
      return
    }
  }, [user, loading, navigate, isProfileComplete, redirectToDashboard])

  const handleSubmit = async (data: {
    full_name: string;
    phone_number?: string;
    date_of_birth?: string;
    school_name?: string;
    location?: string;
    teacher_skills?: string[];
    highest_education?: string;
  }) => {
    return await updateUserProfile(data)
  }

  const handleSuccess = useCallback((role: string) => {
    console.log('handleSuccess called with role:', role)
    // Redirect immediately using the role passed from the component
    redirectToDashboard(role)
  }, [redirectToDashboard])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show loading while checking redirect conditions
  if (!user || !user.role || isProfileComplete(user, user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <ProfileCompletion user={user} onSubmit={handleSubmit} onSuccess={handleSuccess} />
}

export default ProfileCompletionPage

