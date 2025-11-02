import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const SmartRedirect = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      // Check if user is admin
      if (user.role === 'admin' || user.role === 'super_admin') {
        // Redirect to admin dashboard
        navigate('/admin')
      } else if (user.role === 'academy_owner') {
        // Academy owner - go to academy dashboard
        navigate('/academy')
      } else if (user.role === 'teacher') {
        // Teacher - go to teacher landing page
        navigate('/teacher')
      } else if (user.role === 'student') {
        // Student - go to student dashboard
        navigate('/student')
      } else if (user.role) {
        // Other roles - go to dashboard
        navigate('/dashboard')
      } else {
        // User without role - go to role selection
        navigate('/role-selection')
      }
    } else if (!loading && !user) {
      // No user - redirect to home
      navigate('/')
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting you to the right place...</p>
      </div>
    </div>
  )
}

export default SmartRedirect
