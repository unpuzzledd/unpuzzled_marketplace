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
      console.log('⚠️ Safety timeout triggered - auth took too long')
      if (mountedRef.current) {
        setLoading(false)
        initializingRef.current = false
      }
    }, 3000)

    // Get initial session
    const initializeAuth = async () => {
      console.log('🔵 initializeAuth starting...')
      try {
        console.log('🔵 Calling getSession...')
        
        // Add timeout to getSession to prevent infinite hang
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout after 5s')), 5000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.getSession>>
        
        console.log('🔵 getSession result:', { hasSession: !!session, hasUser: !!session?.user, error })
        
        if (error) {
          console.error('❌ getSession error:', error)
          if (mountedRef.current) {
            setLoading(false)
            initializingRef.current = false
          }
          return
        }
        
        if (session?.user) {
          console.log('🔵 Session found, fetching user profile...')
          await fetchUserProfile(session.user)
        } else {
          console.log('🔵 No session, setting loading false')
          if (mountedRef.current) {
            setLoading(false)
          }
        }
        
        if (mountedRef.current) {
          initializingRef.current = false
        }
        console.log('✅ initializeAuth complete')
      } catch (error) {
        console.error('❌ initializeAuth exception:', error)
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
        console.log('🟡 Auth state change:', event, { hasSession: !!session, hasUser: !!session?.user })
        
        // For SIGNED_IN event, always process (user just logged in)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🟡 SIGNED_IN - processing...')
          initializingRef.current = false // Reset for new sign in
          if (mountedRef.current) {
            setLoading(true)
          }
          await fetchUserProfile(session.user)
          return
        }
        
        // For SIGNED_OUT, clear state immediately
        if (event === 'SIGNED_OUT') {
          console.log('🟡 SIGNED_OUT - clearing state')
          initializingRef.current = false // Reset for next sign in
          if (mountedRef.current) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        // Skip INITIAL_SESSION if still initializing to prevent race condition
        if (initializingRef.current && event === 'INITIAL_SESSION') {
          console.log('🟡 INITIAL_SESSION skipped (still initializing)')
          return
        }

        if (session?.user) {
          console.log('🟡 Session user found, fetching profile...')
          await fetchUserProfile(session.user)
        } else {
          console.log('🟡 No session user, clearing state')
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
    console.log('🔵 fetchUserProfile called for:', authUser.id, authUser.email)
    try {
      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      )
      
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      console.log('🔵 fetchUserProfile query starting...')
      const result = await Promise.race([queryPromise, timeoutPromise]) as { data: User | null; error: Error | null }
      const { data, error } = result

      console.log('🔵 fetchUserProfile query result:', { data, error })

      if (error) {
        console.error('❌ fetchUserProfile error:', error)
        if (mountedRef.current) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      // If user not found, try to create the user record (fallback for trigger issues)
      if (!data) {
        console.log('🔵 User not found, creating record...')
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || null
          })
          .select()
          .maybeSingle()

        console.log('🔵 Create user result:', { newUser, createError })

        if (createError || !newUser) {
          console.error('❌ Failed to create user:', createError)
          if (mountedRef.current) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mountedRef.current) {
          console.log('✅ User created, setting state:', newUser)
          setUser(newUser)
          setLoading(false)
        }
      } else {
        if (mountedRef.current) {
          console.log('✅ User found, setting state:', data)
          setUser(data)
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('❌ fetchUserProfile exception:', error)
      if (mountedRef.current) {
        setUser(null)
        setLoading(false)
      }
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

  const updateUserProfile = async (profileData: {
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    school_name?: string;
    location?: string;
    teacher_skills?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    try {
      setLoading(true)
      
      // Prepare update data
      const updateData: Record<string, any> = {}
      if (profileData.full_name !== undefined) updateData.full_name = profileData.full_name || null
      if (profileData.phone_number !== undefined) updateData.phone_number = profileData.phone_number || null
      if (profileData.date_of_birth !== undefined) updateData.date_of_birth = profileData.date_of_birth || null
      if (profileData.school_name !== undefined) updateData.school_name = profileData.school_name || null
      if (profileData.location !== undefined) updateData.location = profileData.location || null
      if (profileData.teacher_skills !== undefined) {
        // Store as JSONB array
        updateData.teacher_skills = profileData.teacher_skills.length > 0 ? profileData.teacher_skills : []
      }

      console.log('Updating user profile:', { userId: user.id, updateData })

      // Update user profile
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return { success: false, error: error.message }
      }

      console.log('User profile updated successfully:', data)
      setUser(data)
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating profile. Please try again.'
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const isProfileComplete = (user: User | null, role: string | null): boolean => {
    if (!user || !role) return false

    // For students: require full_name and date_of_birth
    if (role === 'student') {
      return !!(user.full_name && user.date_of_birth)
    }

    // For teachers: require full_name and phone_number
    if (role === 'teacher') {
      return !!(user.full_name && user.phone_number)
    }

    // For academy_owner and other roles, just check full_name
    return !!user.full_name
  }

  const value: AuthContextType = {
    user,
    loading,
    signUpWithGoogle,
    signInWithGoogle,
    smartLoginWithGoogle,
    signOut,
    updateUserRole,
    updateUserProfile,
    isProfileComplete
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
