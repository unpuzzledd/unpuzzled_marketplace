export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'academy_owner' | 'admin' | 'super_admin' | null;
  phone_number: string | null;
  date_of_birth: string | null;  // ISO date string
  school_name: string | null;
  location: string | null;  // Society name
  teacher_skills: string[] | null;  // Array of skill IDs for teachers
  highest_education: string | null;  // Highest education level for teachers
  status: 'active' | 'suspended' | 'pending';
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
  updateUserRole: (role: 'student' | 'teacher' | 'academy_owner') => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (profileData: {
    full_name?: string;
    phone_number?: string;
    date_of_birth?: string;
    school_name?: string;
    location?: string;
    teacher_skills?: string[];
    highest_education?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  isProfileComplete: (user: User | null, role: string | null) => boolean;
}
