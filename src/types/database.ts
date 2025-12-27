// Database entity types
export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Academy {
  id: string;
  name: string;
  phone_number: string;
  owner_id: string;
  location_ids: string[]; // Array of location IDs
  skill_ids: string[]; // Array of skill IDs
  photo_urls: string[]; // Array of photo URLs (max 4)
  status: 'pending' | 'in_process' | 'approved' | 'rejected' | 'active' | 'suspended' | 'deactivated';
  status_notes?: string | null; // Admin notes about status changes
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: User;
}

export interface AcademyPhoto {
  id: string;
  academy_id: string;
  photo_url: string;
  display_order: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AcademySkill {
  id: string;
  academy_id: string;
  skill_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined data
  skill?: Skill;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  academy_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  // Joined data
  teacher?: User;
  academy?: Academy;
}

export interface TeacherSkill {
  id: string;
  teacher_id: string;
  academy_id: string;
  skill_id: string;
  created_at: string;
  // Joined data
  skill?: Skill;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  academy_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  notes?: string | null; // Notes from academy owner when approving/rejecting
  created_at: string;
  updated_at: string;
  // Joined data
  student?: User;
  academy?: Academy;
}

export interface WeeklyScheduleEntry {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  from_time: string; // Format: "HH:mm" (24-hour)
  to_time: string;   // Format: "HH:mm" (24-hour)
}

export interface ScheduleException {
  id: string;
  batch_id: string;
  exception_date: string; // ISO date string
  original_day: string;
  action: 'cancelled' | 'time_changed' | 'moved';
  from_time?: string | null;
  to_time?: string | null;
  new_day?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  name: string;
  academy_id: string;
  skill_id: string;
  teacher_id: string | null;
  start_date: string;
  end_date: string;
  max_students: number;
  status: 'active' | 'completed' | 'cancelled';
  weekly_schedule?: WeeklyScheduleEntry[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  academy?: Academy;
  skill?: Skill;
  teacher?: User;
  students?: BatchEnrollment[];
}

export interface BatchEnrollment {
  id: string;
  student_id: string;
  batch_id: string;
  enrolled_at: string;
  status: 'pending' | 'active' | 'completed' | 'dropped' | 'rejected';
  // Joined data
  student?: User;
  batch?: Batch;
}

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  batch_id: string;
  created_by: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  batch?: Batch;
  creator?: User;
}

export interface StudentScore {
  id: string;
  student_id: string;
  academy_id: string;
  skill_id: string;
  score: number | null;
  level: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  student?: User;
  academy?: Academy;
  skill?: Skill;
  updater?: User;
}

export interface Admin {
  id: string;
  user_id: string;
  created_by: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  creator?: User;
}

// Extended User interface with additional fields
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

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string | null;
}

// Photo upload types
export interface PhotoUploadResult {
  success: boolean;
  photo_url?: string;
  error?: string;
}

export interface PhotoUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}
