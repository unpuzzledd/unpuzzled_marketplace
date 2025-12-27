-- =============================================
-- FIX RLS POLICIES FOR student_enrollments TABLE
-- =============================================
-- This migration adds RLS policies to allow:
-- 1. Students to create their own enrollment requests
-- 2. Students to view their own enrollments
-- 3. Academy owners to view and manage enrollments for their academies
-- 4. Admins to manage all enrollments
-- =============================================

-- Step 1: Ensure RLS is enabled on student_enrollments table
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can create their own enrollment requests" ON student_enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Academy owners can view enrollments for their academies" ON student_enrollments;
DROP POLICY IF EXISTS "Academy owners can update enrollments for their academies" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON student_enrollments;

-- Step 3: Create RLS policies for student_enrollments table

-- Allow students to create their own enrollment requests (with status='pending')
CREATE POLICY "Students can create their own enrollment requests" ON student_enrollments
  FOR INSERT
  WITH CHECK (
    auth.uid() = student_id 
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

-- Allow students to view their own enrollments
CREATE POLICY "Students can view their own enrollments" ON student_enrollments
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM academies 
      WHERE academies.id = student_enrollments.academy_id 
      AND academies.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow academy owners to view enrollments for their academies
CREATE POLICY "Academy owners can view enrollments for their academies" ON student_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM academies 
      WHERE academies.id = student_enrollments.academy_id 
      AND academies.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow academy owners to update enrollments for their academies
CREATE POLICY "Academy owners can update enrollments for their academies" ON student_enrollments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM academies 
      WHERE academies.id = student_enrollments.academy_id 
      AND academies.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM academies 
      WHERE academies.id = student_enrollments.academy_id 
      AND academies.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON student_enrollments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this migration, verify:
-- 1. Students can INSERT enrollment requests with status='pending'
-- 2. Students can SELECT their own enrollments
-- 3. Academy owners can SELECT and UPDATE enrollments for their academies
-- 4. Admins can do everything
-- =============================================

