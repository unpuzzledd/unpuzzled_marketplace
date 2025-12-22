import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User, AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    // Prevent double initialization (React Strict Mode issue)
    if (initializingRef.current) {
      return
    }
    
    initializingRef.current = true

    // Safety timeout - reduced to 3 seconds for faster feedback
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setLoading(false)
        initializingRef.current = false
      }
    }, 3000)

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          if (mountedRef.current) {
            setLoading(false)
            initializingRef.current = false
          }
          return
        }
        
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          if (mountedRef.current) {
            setLoading(false)
          }
        }
        
        if (mountedRef.current) {
          initializingRef.current = false
        }
      } catch (error) {
        if (mountedRef.current) {
          setLoading(false)
          initializingRef.current = false
        }
      } finally {
        clearTimeout(timeout)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // For SIGNED_IN event, always process (user just logged in)
        if (event === 'SIGNED_IN' && session?.user) {
          initializingRef.current = false // Reset for new sign in
          setLoading(true)
          await fetchUserProfile(session.user)
          return
        }
        
        // For SIGNED_OUT, clear state immediately
        if (event === 'SIGNED_OUT') {
          initializingRef.current = false // Reset for next sign in
          if (mountedRef.current) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        // Skip INITIAL_SESSION if still initializing to prevent race condition
        if (initializingRef.current && event === 'INITIAL_SESSION') {
          return
        }

        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          if (mountedRef.current) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        setUser(null)
        setLoading(false)
        return
      }

      // If user not found, try to create the user record (fallback for trigger issues)
      if (!data) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || null
          })
          .select()
          .maybeSingle()

        if (createError || !newUser) {
          setUser(null)
          setLoading(false)
          return
        }

        setUser(newUser)
        setLoading(false)
      } else {
        setUser(data)
        setLoading(false)
      }
    } catch (error) {
      setUser(null)
      setLoading(false)
    }
  }

  const signUpWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/role-selection`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
    } catch (error) {
      alert('Error signing up with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error) {
      alert('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const smartLoginWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/smart-redirect`
        }
      })
      if (error) throw error
    } catch (error) {
      alert('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Clear state immediately for faster UI feedback
      setUser(null)
      setLoading(false)
      initializingRef.current = false // Reset for next sign in
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Use window.location for a clean navigation
      window.location.href = '/'
    } catch (error) {
      alert('Error signing out. Please try again.')
      setLoading(false)
    }
  }

  const updateUserRole = async (role: 'student' | 'teacher' | 'academy_owner'): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Check if user already has a role
    if (user.role) {
      const roleDisplayNames: Record<string, string> = {
        'student': 'Student',
        'teacher': 'Teacher',
        'academy_owner': 'Academy Owner',
        'admin': 'Admin',
        'super_admin': 'Super Admin'
      }
      const existingRole = roleDisplayNames[user.role] || user.role
      return { 
        success: false, 
        error: `This email is already associated with the role: ${existingRole}. Please sign in to access your existing account.` 
      }
    }

    try {
      setLoading(true)
      
      // Double-check in database to ensure role is not set
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        return { success: false, error: 'Failed to verify user account' }
      }

      if (currentUser?.role) {
        const roleDisplayNames: Record<string, string> = {
          'student': 'Student',
          'teacher': 'Teacher',
          'academy_owner': 'Academy Owner',
          'admin': 'Admin',
          'super_admin': 'Super Admin'
        }
        const existingRole = roleDisplayNames[currentUser.role] || currentUser.role
        return { 
          success: false, 
          error: `This email is already associated with the role: ${existingRole}. Please sign in to access your existing account.` 
        }
      }

      // Update role
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      setUser(data)
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating role. Please try again.'
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUpWithGoogle,
    signInWithGoogle,
    smartLoginWithGoogle,
    signOut,
    updateUserRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
