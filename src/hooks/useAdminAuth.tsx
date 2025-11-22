import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
  adminSignInWithGoogle: () => Promise<void>
  adminSignOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const processingCallbackRef = useRef(false)

  // Handle Google OAuth callback and check if user is admin
  const handleGoogleCallback = async () => {
    // Prevent multiple simultaneous calls
    if (processingCallbackRef.current) {
      console.log('⚠️ [AdminAuth] handleGoogleCallback already processing, skipping...')
      return
    }

    try {
      processingCallbackRef.current = true
      setLoading(true) // Ensure loading is true while processing
      console.log('🟢 [AdminAuth] Handling Google callback...')
      console.log('🟢 [AdminAuth] Current pathname:', window.location.pathname)
      
      console.log('🟢 [AdminAuth] About to call getSession()...')
      const sessionStartTime = Date.now()
      
      // Add timeout to getSession() to prevent hanging
      let sessionResult
      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout after 5 seconds')), 5000)
        )
        
        sessionResult = await Promise.race([sessionPromise, timeoutPromise])
        const sessionEndTime = Date.now()
        console.log(`🟢 [AdminAuth] getSession() completed in ${sessionEndTime - sessionStartTime}ms`)
      } catch (error) {
        console.error('❌ [AdminAuth] getSession failed or timed out:', error)
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const { data: { session }, error: sessionError } = sessionResult
      
      if (sessionError) {
        console.error('❌ [AdminAuth] Error getting session:', sessionError)
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      console.log('🟢 [AdminAuth] Session retrieved:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email,
        userMetadata: session?.user?.user_metadata
      })
      
      // If no session, we're done
      if (!session?.user) {
        console.log('⚠️ [AdminAuth] No session or user found in callback')
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      // Process admin authentication
      const email = session.user.email || ''
      console.log('🟢 [AdminAuth] User email:', email)
      console.log('🟢 [AdminAuth] Checking if admin email...')
      const isAdmin = isAdminEmail(email)
      console.log('🟢 [AdminAuth] Is admin email:', isAdmin)
      
      if (isAdmin) {
          const adminRole = email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin'
          console.log('🟢 [AdminAuth] Admin role determined:', adminRole)
          console.log('🟢 [AdminAuth] About to sync admin role to database...')
          
          // Sync admin role to database
          const dbStartTime = Date.now()
          const { error: updateError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: email,
              full_name: session.user.user_metadata?.full_name || 'Admin User',
              role: adminRole
            }, {
              onConflict: 'id'
            })
          const dbEndTime = Date.now()
          console.log(`🟢 [AdminAuth] Database upsert completed in ${dbEndTime - dbStartTime}ms`)
          
          if (updateError) {
            console.warn('⚠️ [AdminAuth] Could not update admin role in database:', updateError)
            console.warn('⚠️ [AdminAuth] Error details:', {
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              code: updateError.code
            })
          } else {
            console.log('✅ [AdminAuth] Admin role synced to database:', adminRole)
          }
          
          const adminUser: AdminUser = {
            id: session.user.id,
            email: email,
            name: session.user.user_metadata?.full_name || 'Admin User',
            role: adminRole
          }

          console.log('✅ [AdminAuth] Setting admin user:', adminUser)
          console.log('✅ [AdminAuth] About to store in localStorage...')
          // Store admin session
          localStorage.setItem('admin_session', JSON.stringify(adminUser))
          console.log('✅ [AdminAuth] Stored in localStorage, setting state...')
          setAdminUser(adminUser)
          setLoading(false)
          console.log('✅ [AdminAuth] Admin authentication complete!')
        } else {
          // Not an admin email, sign out
          console.log('❌ [AdminAuth] Not an admin email, signing out...')
          console.log('❌ [AdminAuth] Email was:', email)
          console.log('❌ [AdminAuth] Admin emails list:', [
            'admin@unpuzzled.com',
            'superadmin@unpuzzled.com',
            'unpuzzleclub@gmail.com',
            'neeraj.7always@gmail.com'
          ])
          await supabase.auth.signOut()
          alert(`Access denied. Email "${email}" is not authorized for admin access.`)
          setLoading(false)
        }
    } catch (error) {
      console.error('❌ [AdminAuth] Error handling Google callback:', error)
      console.error('❌ [AdminAuth] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      setLoading(false)
    } finally {
      console.log('🟢 [AdminAuth] handleGoogleCallback finally block - resetting processing flag')
      processingCallbackRef.current = false
    }
  }

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.warn('⏰ [AdminAuth] Loading timeout - forcing loading to false')
      if (mounted) {
        setLoading(false)
      }
    }, 10000) // 10 second timeout
    
    // Check if admin is already logged in
    const checkAdminSession = async () => {
      try {
        console.log('🟢 [AdminAuth] Checking admin session...', {
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        })
        
        const adminSession = localStorage.getItem('admin_session')
        if (adminSession) {
          try {
            const user = JSON.parse(adminSession)
            console.log('✅ [AdminAuth] Found existing admin session:', user)
            if (mounted) {
              setAdminUser(user)
              setLoading(false)
            }
            if (timeoutId) clearTimeout(timeoutId)
            return
          } catch (error) {
            console.error('❌ [AdminAuth] Error parsing admin session:', error)
            localStorage.removeItem('admin_session')
            if (mounted) {
              setLoading(false)
            }
            if (timeoutId) clearTimeout(timeoutId)
            return
          }
        }
        
        // No admin session, but check if there's a Supabase session
        // This handles the case where user just completed OAuth but hasn't been processed yet
        console.log('🟢 [AdminAuth] No admin session found, checking Supabase session...')
        
        let sessionResult
        try {
          sessionResult = await supabase.auth.getSession()
          console.log('🟢 [AdminAuth] Supabase session result:', {
            hasSession: !!sessionResult.data?.session,
            hasUser: !!sessionResult.data?.session?.user,
            error: sessionResult.error,
            pathname: window.location.pathname
          })
        } catch (error) {
          console.error('❌ [AdminAuth] Exception getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        if (sessionResult.error) {
          console.error('❌ [AdminAuth] Error getting session:', sessionResult.error)
          if (mounted) {
            setLoading(false)
          }
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        const { session } = sessionResult.data || {}
        
        if (session?.user && (window.location.pathname === '/admin' || window.location.pathname === '/admin/signin')) {
          console.log('🟢 [AdminAuth] Found Supabase session on admin page, processing admin callback')
          await handleGoogleCallback()
          if (timeoutId) clearTimeout(timeoutId)
        } else {
          console.log('🟢 [AdminAuth] No Supabase session or not on admin page', {
            hasSession: !!session,
            hasUser: !!session?.user,
            pathname: window.location.pathname,
            isAdminPage: window.location.pathname === '/admin' || window.location.pathname === '/admin/signin'
          })
          if (mounted) {
            setLoading(false)
          }
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('❌ [AdminAuth] Error in checkAdminSession:', error)
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    checkAdminSession()
    
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Check if user is admin by email
  const isAdminEmail = (email: string): boolean => {
    const adminEmails = [
      'admin@unpuzzled.com',
      'superadmin@unpuzzled.com',
      'unpuzzleclub@gmail.com', // Admin email
      'neeraj.7always@gmail.com', // Admin email
      // Add more admin emails here as needed
    ]
    return adminEmails.includes(email.toLowerCase())
  }

  const adminSignInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Admin Google sign in error:', error)
      alert('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Listen for auth state changes only for admin-specific flows
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟡 [AdminAuth] Auth state change:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email,
          pathname: window.location.pathname,
          hasCodeParam: window.location.search.includes('code=')
        })
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Handle admin callback for both admin signin page and admin dashboard
          // Also check if we're on admin routes or if there's an OAuth code in URL
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin' ||
                             window.location.search.includes('code=')
          
          if (isAdminRoute) {
            console.log('🟢 [AdminAuth] Calling handleGoogleCallback from auth state change')
            // Set loading to true while processing
            setLoading(true)
            await handleGoogleCallback()
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🟡 [AdminAuth] User signed out, clearing admin session')
          localStorage.removeItem('admin_session')
          setAdminUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // If token is refreshed and we're on admin page, check if user is admin
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin'
          if (isAdminRoute && !adminUser) {
            console.log('🟢 [AdminAuth] Token refreshed, checking admin status')
            await handleGoogleCallback()
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [adminUser])

  const adminSignOut = async () => {
    try {
      // Clear admin state immediately for faster UI feedback
      localStorage.removeItem('admin_session')
      setAdminUser(null)
      // Sign out from Supabase
      await supabase.auth.signOut()
      // Redirect to homepage after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated: !!adminUser,
    loading,
    adminSignInWithGoogle,
    adminSignOut
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
