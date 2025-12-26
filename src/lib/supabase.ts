import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase init - URL exists:', !!supabaseUrl, 'Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Safe localStorage wrapper that handles errors gracefully
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key)
    } catch (e) {
      console.error('🔧 localStorage getItem error:', e)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      console.error('🔧 localStorage setItem error:', e)
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key)
    } catch (e) {
      console.error('🔧 localStorage removeItem error:', e)
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: safeStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'unpuzzled-web'
    }
  }
})

console.log('🔧 Supabase client created successfully')
