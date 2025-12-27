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
  const isOAuthInProgressRef = useRef(false)
  const isFetchingProfileRef = useRef(false)
  const lastFetchedUserIdRef = useRef<string | null>(null)
  const currentUserRef = useRef<User | null>(null)

  // Sync ref with user state for use in closures
  useEffect(() => {
    currentUserRef.current = user
  }, [user])

  useEffect(() => {
    mountedRef.current = true
    
    // Prevent double initialization (React Strict Mode issue)
    if (initializingRef.current) {
      return
    }
    
    initializingRef.current = true

    // Safety timeout - 10 seconds to allow for slow connections
    const timeout = setTimeout(() => {
      console.log('⚠️ Safety timeout triggered - auth took too long')
      if (mountedRef.current) {
        setLoading(false)
        initializingRef.current = false
        isFetchingProfileRef.current = false
      }
    }, 10000)

    // Get initial session
    const initializeAuth = async () => {
      console.log('🔵 initializeAuth starting...')
      try {
        console.log('🔵 Calling getSession...')
        
        // Add timeout to getSession to prevent infinite hang
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout after 10s')), 10000)
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
        
        // For SIGNED_IN event, only process if user wasn't already authenticated
        // This prevents processing SIGNED_IN events that fire on tab visibility changes
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user is already authenticated (to avoid processing duplicate SIGNED_IN events)
          const isOAuthCallback = window.location.search.includes('code=')
          const alreadyHasUser = mountedRef.current && currentUserRef.current?.id === session.user.id
          
          // Only process if it's an OAuth callback OR user wasn't authenticated before
          if (!isOAuthCallback && alreadyHasUser) {
            console.log('🟡 SIGNED_IN - skipping (already authenticated)')
            return
          }
          
          console.log('🟡 SIGNED_IN - processing...')
          initializingRef.current = false // Reset for new sign in
          isOAuthInProgressRef.current = false // Reset OAuth flag - auth completed
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
          isOAuthInProgressRef.current = false // Reset OAuth flag
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
          isOAuthInProgressRef.current = false // Reset OAuth flag - auth completed
          await fetchUserProfile(session.user)
        } else {
          console.log('🟡 No session user, clearing state')
          isOAuthInProgressRef.current = false // Reset OAuth flag
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
    
    // Prevent concurrent fetches for the same user
    if (isFetchingProfileRef.current && lastFetchedUserIdRef.current === authUser.id) {
      console.log('🔵 fetchUserProfile already in progress for this user, skipping...')
      return
    }
    
    try {
      isFetchingProfileRef.current = true
      lastFetchedUserIdRef.current = authUser.id
      
      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10s')), 10000)
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
    } finally {
      isFetchingProfileRef.current = false
    }
  }

  const signUpWithGoogle = async () => {
    // Prevent multiple simultaneous OAuth requests
    if (isOAuthInProgressRef.current) {
      console.log('🔵 OAuth already in progress, skipping...')
      return
    }
    
    try {
      isOAuthInProgressRef.current = true
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
      if (error) {
        // Only reset loading on error (redirect didn't happen)
        setLoading(false)
        isOAuthInProgressRef.current = false
        alert('Error signing up with Google. Please try again.')
      }
      // Don't set loading=false here - redirect is happening
    } catch (error) {
      setLoading(false)
      isOAuthInProgressRef.current = false
      alert('Error signing up with Google. Please try again.')
    }
  }

  const signInWithGoogle = async () => {
    // Prevent multiple simultaneous OAuth requests
    if (isOAuthInProgressRef.current) {
      console.log('🔵 OAuth already in progress, skipping...')
      return
    }
    
    try {
      isOAuthInProgressRef.current = true
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        // Only reset loading on error (redirect didn't happen)
        setLoading(false)
        isOAuthInProgressRef.current = false
        alert('Error signing in with Google. Please try again.')
      }
      // Don't set loading=false here - redirect is happening
    } catch (error) {
      setLoading(false)
      isOAuthInProgressRef.current = false
      alert('Error signing in with Google. Please try again.')
    }
  }

  const smartLoginWithGoogle = async () => {
    // Prevent multiple simultaneous OAuth requests
    if (isOAuthInProgressRef.current) {
      console.log('🔵 OAuth already in progress, skipping...')
      return
    }
    
    try {
      isOAuthInProgressRef.current = true
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/smart-redirect`
        }
      })
      if (error) {
        // Only reset loading on error (redirect didn't happen)
        setLoading(false)
        isOAuthInProgressRef.current = false
        alert('Error signing in with Google. Please try again.')
      }
      // Don't set loading=false here - redirect is happening
    } catch (error) {
      setLoading(false)
      isOAuthInProgressRef.current = false
      alert('Error signing in with Google. Please try again.')
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
    highest_education?: string;
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
      // Only include highest_education if it's provided and the column exists
      // This prevents errors if the migration hasn't been run yet
      if (profileData.highest_education !== undefined) {
        // Check if error mentions missing column - if so, skip this field
        updateData.highest_education = profileData.highest_education || null
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
        
        // If error is about missing column, provide helpful message
        if (error.message && error.message.includes('highest_education')) {
          return { 
            success: false, 
            error: 'Database migration required: Please run the migration to add the highest_education column. See migrations/add_teacher_education_field.sql' 
          }
        }
        
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

    // For teachers: require full_name, phone_number, highest_education, and at least one skill
    // Note: highest_education check is optional - if column doesn't exist, we'll skip it
    if (role === 'teacher') {
      const hasBasicInfo = !!(user.full_name && user.phone_number)
      const hasSkills = !!(user.teacher_skills && user.teacher_skills.length > 0)
      // highest_education is required but we check it gracefully - if undefined/null, it means column might not exist
      const hasEducation = user.highest_education !== undefined ? !!user.highest_education : true
      return hasBasicInfo && hasSkills && hasEducation
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
