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
    // Prevent multiple simultaneous calls
    if (processingCallbackRef.current) {
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const adminSession = localStorage.getItem('admin_session')
          if (adminSession || !processingCallbackRef.current) {
            clearInterval(checkInterval)
            if (adminSession) {
              try {
                const user = JSON.parse(adminSession)
                setAdminUser(user)
                setLoading(false)
              } catch (error) {
                // Silent catch
              }
            }
            resolve()
          }
        }, 100)
        
        setTimeout(() => {
          clearInterval(checkInterval)
          resolve()
        }, 5000)
      })
    }

    try {
      processingCallbackRef.current = true
      setLoading(true)
      
      // Get session with timeout - 2 seconds for faster feedback
      const getSessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout')), 2000)
      )
      
      const sessionResult = await Promise.race([getSessionPromise, timeoutPromise])
      
      if (!sessionResult) {
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const { data: { session }, error: sessionError } = sessionResult
      
      if (sessionError || !session?.user) {
        setLoading(false)
        processingCallbackRef.current = false
        return
      }
      
      const email = session.user.email || ''
      const userId = session.user.id
      
      // Check if user is admin
      const isAdmin = await checkAdminStatus(userId, email)
      
      if (isAdmin.isAdmin) {
        const adminRole = isAdmin.role || (email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin')
        
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

        localStorage.setItem('admin_session', JSON.stringify(adminUser))
        setAdminUser(adminUser)
        
        requestAnimationFrame(() => {
          setLoading(false)
          processingCallbackRef.current = false
        })
      } else {
        await supabase.auth.signOut()
        alert(`Access denied. Email "${email}" is not authorized for admin access.`)
        setLoading(false)
        processingCallbackRef.current = false
      }
    } catch (error) {
      setLoading(false)
      processingCallbackRef.current = false
    }
  }

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    // Safety timeout - reduced to 3 seconds for faster feedback
    timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
        processingCallbackRef.current = false
      }
    }, 3000)
    
    const checkAdminSession = async () => {
      try {
        const adminSession = localStorage.getItem('admin_session')
        if (adminSession) {
          try {
            const user = JSON.parse(adminSession)
            if (mounted) {
              setAdminUser(user)
              setLoading(false)
            }
            if (timeoutId) clearTimeout(timeoutId)
            return
          } catch (error) {
            localStorage.removeItem('admin_session')
            if (mounted) setLoading(false)
            if (timeoutId) clearTimeout(timeoutId)
            return
          }
        }
        
        // Check Supabase session
        let sessionResult
        try {
          sessionResult = await supabase.auth.getSession()
        } catch (error) {
          if (mounted) setLoading(false)
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        if (sessionResult.error) {
          if (mounted) setLoading(false)
          if (timeoutId) clearTimeout(timeoutId)
          return
        }
        
        const { session } = sessionResult.data || {}
        
        if (session?.user && (window.location.pathname === '/admin' || window.location.pathname === '/admin/signin' || window.location.search.includes('code='))) {
          if (mounted) setLoading(true)
          try {
            await handleGoogleCallback()
          } catch (error) {
            if (mounted) setLoading(false)
          }
          if (timeoutId) clearTimeout(timeoutId)
        } else {
          const isOAuthCallback = window.location.search.includes('code=')
          const isProcessingCallback = processingCallbackRef.current
          
          if (mounted && !isOAuthCallback && !isProcessingCallback) {
            setLoading(false)
          } else if (mounted) {
            setLoading(true)
          }
          if (timeoutId) clearTimeout(timeoutId)
        }
      } catch (error) {
        if (mounted) setLoading(false)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    checkAdminSession()
    
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

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
      alert('Error signing in with Google. Please try again.')
      setLoading(false)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle SIGNED_OUT first - always clear state
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('admin_session')
          setAdminUser(null)
          setLoading(false)
          processingCallbackRef.current = false // Reset for next sign in
          return
        }
        
        // Handle SIGNED_IN - user just logged in, process immediately
        if (event === 'SIGNED_IN' && session?.user) {
          const isAdminRoute = window.location.pathname === '/admin/signin' || 
                             window.location.pathname === '/admin' ||
                             window.location.search.includes('code=')
          
          if (isAdminRoute) {
            processingCallbackRef.current = false // Reset to allow processing
            setLoading(true)
            try {
              await handleGoogleCallback()
            } catch (error) {
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
          
          // Skip if already processing
          if (processingCallbackRef.current) {
            return
          }
          
          if (isAdminRoute && hasAdminSession) {
            try {
              const storedSession = JSON.parse(hasAdminSession)
              setAdminUser(storedSession)
              setLoading(false)
            } catch (error) {
              localStorage.removeItem('admin_session')
              setLoading(true)
              await handleGoogleCallback()
            }
          } else if (isAdminRoute) {
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
          if (isAdminRoute && !hasAdminSession && !processingCallbackRef.current) {
            setLoading(true)
            await handleGoogleCallback()
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const adminSignOut = async () => {
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
