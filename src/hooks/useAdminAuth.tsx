import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
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

  // Handle Google OAuth callback and check if user is admin
  const handleGoogleCallback = async () => {
    try {
      console.log('Handling Google callback...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session data:', session)
      
      if (session?.user) {
        const email = session.user.email || ''
        console.log('User email:', email)
        console.log('Is admin email:', isAdminEmail(email))
        
        if (isAdminEmail(email)) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: email,
            name: session.user.user_metadata?.full_name || 'Admin User',
            role: email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin'
          }

          console.log('Setting admin user:', adminUser)
          // Store admin session
          localStorage.setItem('admin_session', JSON.stringify(adminUser))
          setAdminUser(adminUser)
        } else {
          // Not an admin email, sign out
          console.log('Not an admin email, signing out...')
          await supabase.auth.signOut()
          alert('Access denied. This email is not authorized for admin access.')
        }
      } else {
        console.log('No session or user found')
      }
    } catch (error) {
      console.error('Error handling Google callback:', error)
    }
  }

  useEffect(() => {
    // Check if admin is already logged in
    const checkAdminSession = async () => {
      const adminSession = localStorage.getItem('admin_session')
      if (adminSession) {
        try {
          const user = JSON.parse(adminSession)
          setAdminUser(user)
        } catch (error) {
          localStorage.removeItem('admin_session')
        }
      } else {
        // No admin session, but check if there's a Supabase session
        // This handles the case where user just completed OAuth but hasn't been processed yet
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && (window.location.pathname === '/admin' || window.location.pathname === '/admin/signin')) {
          console.log('Found Supabase session, processing admin callback')
          await handleGoogleCallback()
        }
      }
      setLoading(false)
    }

    checkAdminSession()
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
        console.log('Auth state change:', { event, session: !!session, pathname: window.location.pathname })
        if (event === 'SIGNED_IN' && session?.user) {
          // Handle admin callback for both admin signin page and admin dashboard
          if (window.location.pathname === '/admin/signin' || window.location.pathname === '/admin') {
            console.log('Calling handleGoogleCallback from auth state change')
            await handleGoogleCallback()
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('admin_session')
          setAdminUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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
