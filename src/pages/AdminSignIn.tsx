import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { Link } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'

const AdminSignIn = () => {
  const { adminSignInWithGoogle, loading, isAuthenticated, adminUser } = useAdminAuth()
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    // Skip if already redirected
    if (hasRedirectedRef.current) {
      console.log('⏭️ [AdminSignIn] Already redirected, skipping')
      return
    }

    console.log('🔵 [AdminSignIn] useEffect triggered', {
      loading,
      isAuthenticated,
      hasAdminUser: !!adminUser,
      pathname: window.location.pathname,
      search: window.location.search
    })

    // Check localStorage FIRST - this is the source of truth
    const adminSession = localStorage.getItem('admin_session')
    const isOAuthCallback = window.location.search.includes('code=')
    
    console.log('🔵 [AdminSignIn] Session check:', { 
      hasSession: !!adminSession,
      isOAuthCallback,
      loading,
      isAuthenticated,
      hasAdminUser: !!adminUser
    })
    
    // If we have admin session, redirect immediately (don't wait for state sync)
    if (adminSession) {
      console.log('✅ [AdminSignIn] Admin session found, redirecting immediately')
      hasRedirectedRef.current = true
      // Clean URL AFTER redirect is initiated
      if (isOAuthCallback) {
        window.history.replaceState({}, '', window.location.pathname)
      }
      navigate('/admin', { replace: true })
      return
    }
    
    // If OAuth callback is in progress but no session yet, keep showing loading
    if (isOAuthCallback) {
      console.log('⏳ [AdminSignIn] OAuth callback in progress, waiting for session...')
      // Poll for session with shorter intervals
      const checkInterval = setInterval(() => {
        const session = localStorage.getItem('admin_session')
        if (session && !hasRedirectedRef.current) {
          console.log('✅ [AdminSignIn] Session appeared, redirecting')
          clearInterval(checkInterval)
          hasRedirectedRef.current = true
          window.history.replaceState({}, '', window.location.pathname)
          navigate('/admin', { replace: true })
        }
      }, 100)
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
      }, 10000)
      
      return () => clearInterval(checkInterval)
    }
    
    // If authenticated via React state (fallback), redirect
    if (!loading && isAuthenticated && adminUser) {
      console.log('✅ [AdminSignIn] Auth completed via state, redirecting')
      hasRedirectedRef.current = true
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, adminUser, loading, navigate])

  const handleGoogleSignIn = async () => {
    console.log('🔵 [AdminSignIn] handleGoogleSignIn called')
    await adminSignInWithGoogle()
  }

  // Check if OAuth callback is in progress OR if we have a session (redirecting)
  const isOAuthCallback = window.location.search.includes('code=')
  const hasAdminSession = localStorage.getItem('admin_session') !== null

  // Show loading spinner during OAuth callback OR if we're redirecting
  if (isOAuthCallback || loading || hasAdminSession) {
    console.log('🔵 [AdminSignIn] Rendering loading state', { 
      isOAuthCallback, 
      loading, 
      hasAdminSession 
    })
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner 
            message={hasAdminSession ? 'Redirecting...' : isOAuthCallback ? 'Completing sign in...' : 'Signing in...'}
            size="lg"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Sign In
          </h1>
          <p className="text-gray-600">
            Sign in with your Google account to access the admin panel
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Signing In...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Authorized Admin Emails:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• admin@unpuzzled.com</div>
            <div>• superadmin@unpuzzled.com</div>
            <div>• unpuzzleclub@gmail.com</div>
            <div>• neeraj.7always@gmail.com</div>
            <div>• mjinesh40@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSignIn
