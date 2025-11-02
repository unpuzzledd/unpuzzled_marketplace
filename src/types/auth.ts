export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'academy_owner' | 'admin' | 'super_admin' | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithGoogle: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  smartLoginWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'student' | 'teacher' | 'academy_owner') => Promise<void>;
}
