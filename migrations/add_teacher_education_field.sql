-- Migration: Add highest_education field to users table for teachers
-- Date: Teacher Profile Enhancement

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS highest_education TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.highest_education IS 'Highest education level for teachers (e.g., High School, Bachelor, Master, PhD, etc.)';

