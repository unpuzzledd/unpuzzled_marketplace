import { useState, useEffect, useRef, createContext, useContext, ReactNode, useMemo, useCallback } from 'react'
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
  const currentAdminUserRef = useRef<AdminUser | null>(null)

  // Sync ref with adminUser state for use in closures
  useEffect(() => {
    currentAdminUserRef.current = adminUser
  }, [adminUser])

  // Check if user is admin by email (fallback for hardcoded emails)
  const isAdminEmail = (email: string): boolean => {
    const adminEmails = [
      'admin@unpuzzled.com',
      'superadmin@unpuzzled.com',
      'unpuzzleclub@gmail.com',
      'neeraj.7always@gmail.com',
      'mjinesh40@gmail.com',
    ]
    return adminEmails.includes(email.toLowerCase())
  }

  // Check admin status from database - optimized single query
  const checkAdminStatus = async (userId: string, email: string): Promise<{ isAdmin: boolean; role?: 'admin' | 'super_admin' }> => {
    try {
      // Single combined query - check users table first (most common case)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (!userError && userData && (userData.role === 'admin' || userData.role === 'super_admin')) {
        return { 
          isAdmin: true, 
          role: userData.role as 'admin' | 'super_admin' 
        }
      }

      // Check admins table as secondary
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (!adminError && adminData) {
        return { isAdmin: true, role: 'admin' }
      }

      // Fallback to hardcoded email check
      if (isAdminEmail(email)) {
        return { 
          isAdmin: true, 
          role: email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin' 
        }
      }

      return { isAdmin: false }
    } catch (error) {
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

  // Handle Google OAuth callback and check if user is admin
  const handleGoogleCallback = async () => {
    console.log('🔵 [AdminAuth] handleGoogleCallback called', {
      processing: processingCallbackRef.current
    })
    
    // Prevent multiple simultaneous calls
    if (processingCallbackRef.current) {
      console.log('⏳ [AdminAuth] Already processing, waiting...')
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const adminSession = localStorage.getItem('admin_session')
          if (adminSession || !processingCallbackRef.current) {
            clearInterval(checkInterval)
            if (adminSession) {
              try {
                const user = JSON.parse(adminSession)
                console.log('✅ [AdminAuth] Found admin session while waiting:', user)
                setAdminUser(user)
                setLoading(false)
              } catch (error) {
                console.error('❌ [AdminAuth] Failed to parse admin session while waiting:', error)
              }
            }
            resolve()
          }
        }, 100)
        
        setTimeout(() => {
          console.log('⏳ [AdminAuth] Wait timeout reached (5s)')
          clearInterval(checkInterval)
          resolve()
        }, 5000)
      })
    }

    try {
      processingCallbackRef.current = true
      setLoading(true)
      
      console.log('🔵 [AdminAuth] Getting session with 2s timeout...')
      
      // Get session with timeout - 2 seconds for faster feedback
      const getSessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout')), 2000)
      )
      
      const sessionResult = await Promise.race([getSessionPromise, timeoutPromise])
      
      if (!sessionResult) {
        console.log('❌ [AdminAuth] No session result')
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const { data: { session }, error: sessionError } = sessionResult
      
      console.log('🔵 [AdminAuth] Session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        email: session?.user?.email,
        error: sessionError
      })
      
      if (sessionError || !session?.user) {
        console.log('❌ [AdminAuth] No valid session or error')
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const email = session.user.email || ''
      const userId = session.user.id
      
      console.log('🔵 [AdminAuth] Checking admin status for:', { userId, email })
      
      // Check if user is admin
      const isAdmin = await checkAdminStatus(userId, email)
      
      console.log('🔵 [AdminAuth] Admin status check result:', isAdmin)
      
      if (isAdmin.isAdmin) {
        const adminRole = isAdmin.role || (email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin')
        
        console.log('✅ [AdminAuth] User is admin, syncing to database...', { adminRole })
        
        // Sync admin role to database
        await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: email,
            full_name: session.user.user_metadata?.full_name || 'Admin User',
            role: adminRole
          }, { onConflict: 'id' })
        
        const adminUser: AdminUser = {
          id: session.user.id,
          email: email,
          name: session.user.user_metadata?.full_name || 'Admin User',
          role: adminRole
        }

        console.log('✅ [AdminAuth] Setting admin_session in localStorage:', adminUser)
        localStorage.setItem('admin_session', JSON.stringify(adminUser))
        setAdminUser(adminUser)
        
        requestAnimationFrame(() => {
          console.log('✅ [AdminAuth] Admin auth complete')
          setLoading(false)
          processingCallbackRef.current = false
        })
      } else {
        console.log('❌ [AdminAuth] User is not admin, denying access')
        await supabase.auth.signOut()
        alert(`Access denied. Email "${email}" is not authorized for admin access.`)
        setLoading(false)
        processingCallbackRef.current = false
      }
    } catch (error) {
      console.error('❌ [AdminAuth] handleGoogleCallback exception:', error)
      setLoading(false)
      processingCallbackRef.current = false
    }
  }

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    console.log('🔵 [AdminAuth] Initial useEffect triggered')
    
    // Safety timeout - reduced to 3 seconds for faster feedback
    timeoutId = setTimeout(() => {
      console.log('⏳ [AdminAuth] Safety timeout triggered after 3s')
      if (mounted) {
        setLoading(false)
        processingCallbackRef.current = false
      }
    }, 3000)
    
    const checkAdminSession = async () => {
      try {
        console.log('🔵 [AdminAuth] checkAdminSession starting...', {
          pathname: window.location.pathname,
          search: window.location.search
        })
        
        const adminSession = localStorage.getItem('admin_session')
        console.log('🔵 [AdminAuth] Checking localStorage admin_session:', { hasSession: !!adminSession })
        
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
            console.error('❌ [AdminAuth] Failed to parse admin session, removing:', error)
            localStorage.removeItem('admin_session')
            if (mounted) setLoading(false)
            if (timeoutId) clearTimeout(timeoutId)
            return
          }
        }
        
        console.log('🔵 [AdminAuth] No admin session found, checking Supabase session...')
        
        // Check Supabase session
        let sessionResult
        try {
          sessionResult = await supabase.auth.getSession()
          console.log('🔵 [AdminAuth] Supabase session check:', { 
            hasSession: !!sessionResult?.data?.session,
            hasUser: !!sessionResult?.data?.session?.user,
            userEmail: sessionResult?.data?.session?.user?.email
          })
        } catch (error) {
          console.error('❌ [AdminAuth] Failed to get Supabase session:', error)
          if (mounted) setLoading(false)
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        if (sessionResult.error) {
          console.error('❌ [AdminAuth] Supabase session error:', sessionResult.error)
          if (mounted) setLoading(false)
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        const { session } = sessionResult.data || {}
        
        if (session?.user && (window.location.pathname === '/admin' || window.location.pathname === '/admin/signin' || window.location.search.includes('code='))) {
          console.log('✅ [AdminAuth] Admin route with session detected, processing callback...')
          if (mounted) setLoading(true)
          try {
            await handleGoogleCallback()
          } catch (error) {
            console.error('❌ [AdminAuth] handleGoogleCallback failed:', error)
            if (mounted) setLoading(false)
          }
          if (timeoutId) clearTimeout(timeoutId)
        } else {
          const isOAuthCallback = window.location.search.includes('code=')
          const isProcessingCallback = processingCallbackRef.current
          
          console.log('🔵 [AdminAuth] Not processing callback:', { isOAuthCallback, isProcessingCallback, hasSession: !!session })
          
          if (mounted && !isOAuthCallback && !isProcessingCallback) {
            console.log('✅ [AdminAuth] Setting loading false (no OAuth callback)')
            setLoading(false)
          } else if (mounted) {
            console.log('⏳ [AdminAuth] Keeping loading true (OAuth callback or processing)')
            setLoading(true)
          }
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('❌ [AdminAuth] checkAdminSession exception:', error)
        if (mounted) setLoading(false)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    checkAdminSession()
    
    return () => {
      console.log('🔵 [AdminAuth] Cleanup - unmounting')
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const adminSignInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      console.log('🔵 [AdminAuth] adminSignInWithGoogle called')
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      })
      
      if (error) {
        console.error('❌ [AdminAuth] OAuth error:', error)
        throw error
      }
      console.log('✅ [AdminAuth] OAuth initiated successfully')
    } catch (error) {
      console.error('❌ [AdminAuth] adminSignInWithGoogle failed:', error)
      alert('Error signing in with Google. Please try again.')
      setLoading(false)
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    console.log('🔵 [AdminAuth] Setting up auth state listener')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟡 [AdminAuth] Auth state change:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          email: session?.user?.email,
          pathname: window.location.pathname
        })
        
        // Handle SIGNED_OUT first - always clear state
        if (event === 'SIGNED_OUT') {
          console.log('🟡 [AdminAuth] SIGNED_OUT - clearing all state')
          localStorage.removeItem('admin_session')
          setAdminUser(null)
          setLoading(false)
          processingCallbackRef.current = false // Reset for next sign in
          return
        }
        
        // Handle SIGNED_IN - user just logged in, process immediately
        // But skip if already authenticated (prevents processing duplicate SIGNED_IN events on tab visibility)
        if (event === 'SIGNED_IN' && session?.user) {
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin' ||
                             window.location.search.includes('code=')
          const isOAuthCallback = window.location.search.includes('code=')
          const alreadyHasAdminUser = currentAdminUserRef.current?.id === session.user.id
          
          // Only process if it's an OAuth callback OR user wasn't authenticated before
          if (!isOAuthCallback && alreadyHasAdminUser) {
            console.log('🟡 [AdminAuth] SIGNED_IN - skipping (already authenticated)')
            return
          }
          
          console.log('🟡 [AdminAuth] SIGNED_IN detected', { isAdminRoute })
          
          if (isAdminRoute) {
            processingCallbackRef.current = false // Reset to allow processing
            setLoading(true)
            try {
              await handleGoogleCallback()
            } catch (error) {
              console.error('❌ [AdminAuth] Error handling SIGNED_IN:', error)
              setLoading(false)
            }
          }
          return
        }
        
        // Handle INITIAL_SESSION
        if (event === 'INITIAL_SESSION' && session?.user) {
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin' ||
                             window.location.search.includes('code=')
          
          const hasAdminSession = localStorage.getItem('admin_session')
          
          console.log('🟡 [AdminAuth] INITIAL_SESSION detected', { 
            isAdminRoute, 
            hasAdminSession: !!hasAdminSession,
            processing: processingCallbackRef.current 
          })
          
          // Skip if already processing
          if (processingCallbackRef.current) {
            console.log('⏳ [AdminAuth] Already processing, skipping INITIAL_SESSION')
            return
          }
          
          if (isAdminRoute && hasAdminSession) {
            try {
              const storedSession = JSON.parse(hasAdminSession)
              console.log('✅ [AdminAuth] Restoring admin session from localStorage:', storedSession)
              setAdminUser(storedSession)
              setLoading(false)
            } catch (error) {
              console.error('❌ [AdminAuth] Failed to parse stored session:', error)
              localStorage.removeItem('admin_session')
              setLoading(true)
              await handleGoogleCallback()
            }
          } else if (isAdminRoute) {
            console.log('🔵 [AdminAuth] Admin route without session, processing callback...')
            setLoading(true)
            await handleGoogleCallback()
          }
          return
        }
        
        // Handle TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin'
          const hasAdminSession = localStorage.getItem('admin_session')
          
          console.log('🟡 [AdminAuth] TOKEN_REFRESHED', { isAdminRoute, hasAdminSession: !!hasAdminSession })
          
          if (isAdminRoute && !hasAdminSession && !processingCallbackRef.current) {
            console.log('🔵 [AdminAuth] Token refreshed on admin route, processing callback...')
            setLoading(true)
            await handleGoogleCallback()
          }
        }
      }
    )

    return () => {
      console.log('🔵 [AdminAuth] Unsubscribing from auth state changes')
      subscription.unsubscribe()
    }
  }, [])

  const adminSignOut = useCallback(async () => {
    try {
      // Clear all state immediately for faster feedback
      localStorage.removeItem('admin_session')
      setAdminUser(null)
      setLoading(false)
      processingCallbackRef.current = false // Reset for next sign in
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      window.location.href = '/'
    }
  }, [])

  // Memoize context value to prevent unnecessary remounts of consumers
  const value: AdminAuthContextType = useMemo(() => ({
    adminUser,
    isAuthenticated: !!adminUser,
    loading,
    adminSignInWithGoogle,
    adminSignOut
  }), [adminUser, loading, adminSignInWithGoogle, adminSignOut])

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
