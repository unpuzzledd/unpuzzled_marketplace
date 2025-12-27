-- Migration: Add notes column to student_enrollments table
-- Date: Student Enrollment Notes Support
-- Purpose: Allow academy owners to add notes when approving/rejecting student enrollments

ALTER TABLE student_enrollments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN student_enrollments.notes IS 'Notes from academy owner when approving/rejecting student enrollment. Visible to students.';

