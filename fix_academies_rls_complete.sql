-- =============================================
-- COMPLETE FIX FOR ACADEMIES RLS POLICIES
-- =============================================
-- This migration fixes the RLS policy issue preventing admins
-- from viewing academies in the admin dashboard.
-- =============================================

-- Step 1: Update users table to allow admin and super_admin roles
-- First, drop the existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint that includes admin roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'teacher', 'academy_owner', 'admin', 'super_admin'));

-- Step 2: Ensure is_admin() helper function exists
-- This function checks if a user has admin or super_admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure RLS is enabled on academies table
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all academies" ON academies;
DROP POLICY IF EXISTS "Admins can insert academies" ON academies;
DROP POLICY IF EXISTS "Admins can update academies" ON academies;
DROP POLICY IF EXISTS "Admins can delete academies" ON academies;
DROP POLICY IF EXISTS "Academy owners can view their academies" ON academies;
DROP POLICY IF EXISTS "Academy owners can update their academies" ON academies;
DROP POLICY IF EXISTS "Academy owners can manage their academies" ON academies;

-- Step 5: Create RLS policies for academies table

-- Allow admins to view all academies
CREATE POLICY "Admins can view all academies" ON academies
  FOR SELECT USING (is_admin(auth.uid()));

-- Allow admins to insert academies
CREATE POLICY "Admins can insert academies" ON academies
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update academies
CREATE POLICY "Admins can update academies" ON academies
  FOR UPDATE USING (is_admin(auth.uid()));

-- Allow admins to delete academies
CREATE POLICY "Admins can delete academies" ON academies
  FOR DELETE USING (is_admin(auth.uid()));

-- Allow academy owners to view their own academies
CREATE POLICY "Academy owners can view their academies" ON academies
  FOR SELECT USING (owner_id = auth.uid());

-- Allow academy owners to update their own academies
CREATE POLICY "Academy owners can update their academies" ON academies
  FOR UPDATE USING (owner_id = auth.uid());

-- Step 6: Update admin users' roles in the users table
-- This ensures that admin emails have the correct role in the database
UPDATE users 
SET role = 'admin' 
WHERE email IN (
  'admin@unpuzzled.com',
  'unpuzzleclub@gmail.com',
  'neeraj.7always@gmail.com'
) AND (role IS NULL OR role NOT IN ('admin', 'super_admin'));

UPDATE users 
SET role = 'super_admin' 
WHERE email = 'superadmin@unpuzzled.com'
AND (role IS NULL OR role != 'super_admin');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these queries to verify the setup:

-- 1. Check admin users have correct roles:
-- SELECT id, email, role FROM users WHERE email IN (
--   'admin@unpuzzled.com',
--   'superadmin@unpuzzled.com',
--   'unpuzzleclub@gmail.com',
--   'neeraj.7always@gmail.com'
-- );

-- 2. Check if is_admin function works:
-- SELECT is_admin((SELECT id FROM users WHERE email = 'admin@unpuzzled.com' LIMIT 1));

-- 3. Check academies policies:
-- SELECT * FROM pg_policies WHERE tablename = 'academies';

-- =============================================
-- VERIFICATION CHECKLIST
-- =============================================
-- After running this migration, verify that:
-- 1. Admin users have role = 'admin' or 'super_admin' in the users table
-- 2. Admin users can see all academies in the Admin Dashboard
-- 3. Admin users can create, update, and delete academies
-- 4. Academy owners can see and update their own academies
-- 5. The is_admin() function returns true for admin users


