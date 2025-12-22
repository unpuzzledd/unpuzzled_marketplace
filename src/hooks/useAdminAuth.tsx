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
      // Don't return - wait a bit and check if admin session was set by the other call
      // This handles the case where multiple calls happen but one completes
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const adminSession = localStorage.getItem('admin_session')
          if (adminSession || !processingCallbackRef.current) {
            clearInterval(checkInterval)
            // If session was set, update state
            if (adminSession) {
              try {
                const user = JSON.parse(adminSession)
                setAdminUser(user)
                setLoading(false)
              } catch (error) {
                console.error('Error parsing admin session:', error)
              }
            }
            resolve()
          }
        }, 100)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          resolve()
        }, 5000)
      })
    }

    try {
      processingCallbackRef.current = true
      setLoading(true) // Ensure loading is true while processing
      console.log('🟢 [AdminAuth] Handling Google callback...')
      console.log('🟢 [AdminAuth] Current pathname:', window.location.pathname)
      
      console.log('🟢 [AdminAuth] About to call getSession()...')
      const sessionStartTime = Date.now()
      
      // Get session with timeout to prevent hanging
      let sessionResult: Awaited<ReturnType<typeof supabase.auth.getSession>> | null = null
      try {
        console.log('🟢 [AdminAuth] Calling supabase.auth.getSession()...')
        
        // Use Promise.race with timeout to prevent hanging
        const getSessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout after 5 seconds')), 5000)
        )
        
        sessionResult = await Promise.race([getSessionPromise, timeoutPromise])
        const sessionEndTime = Date.now()
        console.log(`🟢 [AdminAuth] getSession() completed in ${sessionEndTime - sessionStartTime}ms`)
        console.log('🟢 [AdminAuth] getSession result:', {
          hasData: !!sessionResult?.data,
          hasSession: !!sessionResult?.data?.session,
          hasError: !!sessionResult?.error,
          errorMessage: sessionResult?.error?.message
        })
        
        if (!sessionResult) {
          throw new Error('getSession returned undefined')
        }
      } catch (error) {
        console.error('❌ [AdminAuth] getSession failed:', error)
        console.error('❌ [AdminAuth] Error details:', error instanceof Error ? error.message : String(error))
        console.error('❌ [AdminAuth] Error stack:', error instanceof Error ? error.stack : 'No stack')
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const { data: { session }, error: sessionError } = sessionResult || {}
      
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
      const userId = session.user.id
      console.log('🟢 [AdminAuth] User email:', email)
      console.log('🟢 [AdminAuth] User ID:', userId)
      console.log('🟢 [AdminAuth] Checking if admin...')
      
      // Check if user is admin by checking database admins table or users role
      const isAdmin = await checkAdminStatus(userId, email)
      console.log('🟢 [AdminAuth] Is admin:', isAdmin)
      
      if (isAdmin.isAdmin) {
          const adminRole = isAdmin.role || (email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin')
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
          // Store admin session FIRST (synchronous, immediate)
          localStorage.setItem('admin_session', JSON.stringify(adminUser))
          console.log('✅ [AdminAuth] Stored in localStorage, setting state...')
          
          // Set state - this will trigger re-render
          setAdminUser(adminUser)
          
          // Set loading to false AFTER state is set
          // Use requestAnimationFrame to ensure state update is processed
          requestAnimationFrame(() => {
            setLoading(false)
            processingCallbackRef.current = false
            console.log('✅ [AdminAuth] Admin authentication complete!')
          })
        } else {
          // Not an admin email, sign out
          console.log('❌ [AdminAuth] Not an admin email, signing out...')
          console.log('❌ [AdminAuth] Email was:', email)
          console.log('❌ [AdminAuth] Admin emails list:', [
            'admin@unpuzzled.com',
            'superadmin@unpuzzled.com',
            'unpuzzleclub@gmail.com',
            'neeraj.7always@gmail.com',
            'mjinesh40@gmail.com'
          ])
          await supabase.auth.signOut()
          alert(`Access denied. Email "${email}" is not authorized for admin access.`)
          setLoading(false)
          processingCallbackRef.current = false
        }
    } catch (error) {
      console.error('❌ [AdminAuth] Error handling Google callback:', error)
      console.error('❌ [AdminAuth] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      setLoading(false)
      processingCallbackRef.current = false
    }
    // Note: processingCallbackRef is reset in each code path above
    // No finally block needed - we want explicit control over when the flag is reset
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
        
        if (session?.user && (window.location.pathname === '/admin' || window.location.pathname === '/admin/signin' || window.location.search.includes('code='))) {
          console.log('🟢 [AdminAuth] Found Supabase session on admin page, processing admin callback')
          // Ensure loading is true before processing callback
          if (mounted) {
            setLoading(true)
          }
          try {
            await handleGoogleCallback()
            // After callback completes, verify admin session was set
            const adminSessionAfterCallback = localStorage.getItem('admin_session')
            if (!adminSessionAfterCallback && mounted) {
              console.warn('⚠️ [AdminAuth] Callback completed but no admin session found')
              // Don't set loading to false - let the auth state change handler or timeout handle it
            }
          } catch (error) {
            console.error('❌ [AdminAuth] Error in handleGoogleCallback from checkAdminSession:', error)
            if (mounted) {
              setLoading(false)
            }
          }
          if (timeoutId) clearTimeout(timeoutId)
        } else {
          console.log('🟢 [AdminAuth] No Supabase session or not on admin page', {
            hasSession: !!session,
            hasUser: !!session?.user,
            pathname: window.location.pathname,
            isAdminPage: window.location.pathname === '/admin' || window.location.pathname === '/admin/signin',
            hasCodeParam: window.location.search.includes('code=')
          })
          // Check if OAuth callback is in progress
          const isOAuthCallback = window.location.search.includes('code=')
          const isProcessingCallback = processingCallbackRef.current
          
          // Only set loading to false if we're definitely not processing anything
          if (mounted && !isOAuthCallback && !isProcessingCallback) {
            setLoading(false)
          } else {
            // OAuth callback or processing in progress, keep loading true
            console.log('🟢 [AdminAuth] OAuth callback or processing detected, keeping loading true', {
              isOAuthCallback,
              isProcessingCallback
            })
            if (mounted) {
              setLoading(true)
            }
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

  // Check if user is admin by email (fallback for hardcoded emails)
  const isAdminEmail = (email: string): boolean => {
    const adminEmails = [
      'admin@unpuzzled.com',
      'superadmin@unpuzzled.com',
      'unpuzzleclub@gmail.com', // Admin email
      'neeraj.7always@gmail.com', // Admin email
      'mjinesh40@gmail.com', // Admin email
      // Add more admin emails here as needed
    ]
    return adminEmails.includes(email.toLowerCase())
  }

  // Check admin status from database (admins table or users role)
  const checkAdminStatus = async (userId: string, email: string): Promise<{ isAdmin: boolean; role?: 'admin' | 'super_admin' }> => {
    try {
      // First check if user exists in admins table with active status
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select(`
          status,
          user:users!admins_user_id_fkey(role)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (!adminError && adminData) {
        console.log('✅ [AdminAuth] Found in admins table:', adminData)
        // Get role from users table
        const userRole = (adminData.user as any)?.role
        return { 
          isAdmin: true, 
          role: userRole === 'super_admin' ? 'super_admin' : 'admin' 
        }
      }

      // Check users table for admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (!userError && userData && (userData.role === 'admin' || userData.role === 'super_admin')) {
        console.log('✅ [AdminAuth] Found admin role in users table:', userData.role)
        return { 
          isAdmin: true, 
          role: userData.role as 'admin' | 'super_admin' 
        }
      }

      // Fallback to hardcoded email check
      if (isAdminEmail(email)) {
        console.log('✅ [AdminAuth] Found in hardcoded admin emails list')
        return { 
          isAdmin: true, 
          role: email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin' 
        }
      }

      console.log('❌ [AdminAuth] User is not an admin')
      return { isAdmin: false }
    } catch (error) {
      console.error('❌ [AdminAuth] Error checking admin status:', error)
      // Fallback to email check on error
      if (isAdminEmail(email)) {
        return { 
          isAdmin: true, 
          role: email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin' 
        }
      }
      return { isAdmin: false }
    }
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
      // Don't set loading to false here - the redirect will happen
      // and loading will be managed by the callback handler
      // This prevents the AdminDashboard from redirecting prematurely
    } catch (error) {
      console.error('Admin Google sign in error:', error)
      alert('Error signing in with Google. Please try again.')
      setLoading(false)
    }
    // Note: We don't set loading to false in finally because
    // the OAuth flow will redirect, and loading state will be
    // managed by the callback handlers
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
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // Handle admin callback for both admin signin page and admin dashboard
          // Also check if we're on admin routes or if there's an OAuth code in URL
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin' ||
                             window.location.search.includes('code=')
          
          // For INITIAL_SESSION, only process if we don't already have an admin session
          // This prevents duplicate processing
          const hasAdminSession = localStorage.getItem('admin_session')
          
          // Skip if callback is already processing to prevent race conditions
          if (processingCallbackRef.current) {
            console.log('⚠️ [AdminAuth] Callback already processing, skipping auth state change handler')
            // But ensure loading stays true while callback is processing
            if (!hasAdminSession) {
              setLoading(true)
            }
            return
          }
          
          if (isAdminRoute && (!hasAdminSession || event === 'SIGNED_IN')) {
            console.log('🟢 [AdminAuth] Calling handleGoogleCallback from auth state change', { event })
            // Set loading to true while processing - this prevents premature redirects
            setLoading(true)
            try {
              await handleGoogleCallback()
              // Loading will be set to false inside handleGoogleCallback when done
              // But verify admin session was set
              const sessionSet = localStorage.getItem('admin_session')
              if (!sessionSet) {
                console.warn('⚠️ [AdminAuth] Callback completed but no admin session found')
                // Don't set loading to false here - let the timeout or next check handle it
              }
            } catch (error) {
              console.error('❌ [AdminAuth] Error in handleGoogleCallback from auth state change:', error)
              setLoading(false)
            }
          } else if (isAdminRoute && hasAdminSession && event === 'INITIAL_SESSION') {
            // We have a session but it's INITIAL_SESSION - verify it's still valid
            console.log('🟢 [AdminAuth] Admin session exists, verifying...')
            try {
              const storedSession = JSON.parse(hasAdminSession)
              setAdminUser(storedSession)
              setLoading(false)
            } catch (error) {
              console.error('❌ [AdminAuth] Error parsing stored admin session:', error)
              localStorage.removeItem('admin_session')
              setLoading(true)
              await handleGoogleCallback()
            }
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
          const hasAdminSession = localStorage.getItem('admin_session')
          if (isAdminRoute && !hasAdminSession && !processingCallbackRef.current) {
            console.log('🟢 [AdminAuth] Token refreshed, checking admin status')
            setLoading(true)
            await handleGoogleCallback()
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // Remove adminUser dependency to prevent re-subscription on every state change

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
