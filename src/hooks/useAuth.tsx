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

  useEffect(() => {
    let mounted = true
    
    // Prevent double initialization (React Strict Mode issue)
    if (initializingRef.current) {
      console.log('⚠️ Already initializing, skipping...')
      return
    }
    
    initializingRef.current = true

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('⏰ Auth loading timeout - forcing loading to false')
      if (mounted) {
        setLoading(false)
        initializingRef.current = false
      }
    }, 10000) // 10 second timeout

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔵 Starting getSession...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          if (mounted) {
            setLoading(false)
            initializingRef.current = false
          }
          return
        }

        console.log('🔵 getSession completed. Session:', session?.user?.id || 'No session')
        
        if (session?.user) {
          console.log('🔵 About to fetch user profile...')
          await fetchUserProfile(session.user)
          console.log('🔵 fetchUserProfile completed!')
        } else {
          console.log('🔵 No session, setting loading to false')
          if (mounted) {
            setLoading(false)
          }
        }
        
        if (mounted) {
          initializingRef.current = false
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error)
        if (mounted) {
          setLoading(false)
          initializingRef.current = false
        }
      } finally {
        clearTimeout(timeout)
      }
    }

    initializeAuth()

    // Listen for auth changes (only after initialization)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟡 Auth state change event:', event)
        // Skip if still initializing to prevent race condition
        if (initializingRef.current) {
          console.log('⚠️ Skipping auth state change - still initializing')
          return
        }

        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching user profile for:', authUser.id)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      console.log('Query result - data:', data, 'error:', error)

      if (error) {
        console.error('Error fetching user profile:', error)
        setUser(null)
        setLoading(false)
        return
      }

      // If user not found, try to create the user record (fallback for trigger issues)
      if (!data) {
        console.log('User not found in public.users, creating record...')
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
          console.error('Error creating user record:', createError)
          setUser(null)
          setLoading(false)
          return
        }

        console.log('User created successfully:', newUser)
        setUser(newUser)
        setLoading(false)
      } else {
        console.log('User profile fetched successfully:', data)
        setUser(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
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
      console.error('Error signing up with Google:', error)
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
      console.error('Error signing in with Google:', error)
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
      console.error('Error signing in with Google:', error)
      alert('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      // Clear user state immediately for faster UI feedback
      setUser(null)
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Use window.location for a clean navigation
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Error signing out. Please try again.')
      setLoading(false)
    }
    // Note: Don't set loading to false in finally as we're navigating away
  }

  const updateUserRole = async (role: 'student' | 'teacher' | 'academy_owner') => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating role. Please try again.')
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
