import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from '../components/LoadingSpinner'

const SmartRedirect = () => {
  const { user, loading, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const [isTakingLong, setIsTakingLong] = useState(false)
  const hasRedirectedRef = useRef(false)

  // Timeout fallback - redirect to home if auth doesn't resolve
  useEffect(() => {
    console.log('🔵 [SmartRedirect] Component mounted')
    
    // Show "taking too long" message after 5 seconds
    const warningTimeout = setTimeout(() => {
      console.log('⏳ [SmartRedirect] Taking longer than expected...')
      setIsTakingLong(true)
    }, 5000)

    // Final fallback - redirect to home after 15 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!hasRedirectedRef.current) {
        console.log('⚠️ [SmartRedirect] Timeout - redirecting to home')
        hasRedirectedRef.current = true
        navigate('/')
      }
    }, 15000)

    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(fallbackTimeout)
    }
  }, [navigate])

  useEffect(() => {
    console.log('🔵 [SmartRedirect] Redirect check', {
      loading,
      hasUser: !!user,
      userRole: user?.role,
      hasRedirected: hasRedirectedRef.current
    })

    if (hasRedirectedRef.current) {
      console.log('⏭️ [SmartRedirect] Already redirected, skipping')
      return
    }

    if (!loading && user) {
      hasRedirectedRef.current = true
      console.log('✅ [SmartRedirect] User authenticated, redirecting based on role:', user.role)
      
      // Check if user is admin
      if (user.role === 'admin' || user.role === 'super_admin') {
        console.log('✅ [SmartRedirect] Redirecting to /admin')
        navigate('/admin')
      } else if (user.role === 'academy_owner') {
        console.log('✅ [SmartRedirect] Redirecting to /academy')
        navigate('/academy')
      } else if (user.role === 'teacher') {
        // Teacher - check if profile is complete
        const profileComplete = isProfileComplete(user, user.role)
        console.log('🔵 [SmartRedirect] Teacher profile complete:', profileComplete)
        if (profileComplete) {
          console.log('✅ [SmartRedirect] Redirecting to /teacher')
          navigate('/teacher')
        } else {
          console.log('✅ [SmartRedirect] Redirecting to /profile-completion')
          navigate('/profile-completion')
        }
      } else if (user.role === 'student') {
        // Student - check if profile is complete
        const profileComplete = isProfileComplete(user, user.role)
        console.log('🔵 [SmartRedirect] Student profile complete:', profileComplete)
        if (profileComplete) {
          console.log('✅ [SmartRedirect] Redirecting to /student')
          navigate('/student')
        } else {
          console.log('✅ [SmartRedirect] Redirecting to /profile-completion')
          navigate('/profile-completion')
        }
      } else if (user.role) {
        console.log('✅ [SmartRedirect] Redirecting to /dashboard')
        navigate('/dashboard')
      } else {
        console.log('✅ [SmartRedirect] No role, redirecting to /role-selection')
        navigate('/role-selection')
      }
    } else if (!loading && !user) {
      console.log('⚠️ [SmartRedirect] No user, redirecting to home')
      hasRedirectedRef.current = true
      navigate('/')
    } else {
      console.log('⏳ [SmartRedirect] Waiting for auth...', { loading, hasUser: !!user })
    }
  }, [user, loading, navigate, isProfileComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner 
          message={isTakingLong 
            ? 'This is taking longer than expected...' 
            : 'Redirecting you to the right place...'}
          size="lg"
        />
        {isTakingLong && (
          <button
            onClick={() => {
              console.log('🔵 [SmartRedirect] User clicked "Go to Home"')
              navigate('/')
            }}
            className="mt-6 px-6 py-3 bg-[#009963] text-white rounded-lg hover:bg-[#007a4d] transition-colors font-medium"
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  )
}

export default SmartRedirect
