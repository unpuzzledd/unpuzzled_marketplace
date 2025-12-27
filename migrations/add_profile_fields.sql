-- Migration: Add profile completion fields to users table
-- Date: Profile Completion Form Implementation

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth for students (required for students)';
COMMENT ON COLUMN users.school_name IS 'School name for students (optional)';
COMMENT ON COLUMN users.location IS 'Location/Society name for students (optional)';



