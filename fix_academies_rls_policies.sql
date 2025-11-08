-- =============================================
-- FIX ACADEMIES TABLE RLS POLICIES
-- =============================================
-- This migration fixes the RLS policy issue preventing admins
-- from viewing academies in the admin dashboard.
-- =============================================

-- Step 1: Ensure is_admin() helper function exists
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

-- Step 2: Ensure RLS is enabled on academies table
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all academies" ON academies;
DROP POLICY IF EXISTS "Admins can insert academies" ON academies;
DROP POLICY IF EXISTS "Admins can update academies" ON academies;
DROP POLICY IF EXISTS "Admins can delete academies" ON academies;
DROP POLICY IF EXISTS "Academy owners can manage their academies" ON academies;

-- Step 4: Create RLS policies for academies table

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

-- Step 5: Update admin users' roles in the users table
-- This ensures that admin emails have the correct role in the database
UPDATE users 
SET role = 'admin' 
WHERE email IN (
  'admin@unpuzzled.com',
  'unpuzzleclub@gmail.com',
  'neeraj.7always@gmail.com'
);

UPDATE users 
SET role = 'super_admin' 
WHERE email = 'superadmin@unpuzzled.com';

-- Note: If the role column doesn't allow 'admin' or 'super_admin', 
-- you may need to alter the CHECK constraint first:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check 
--   CHECK (role IN ('student', 'teacher', 'academy_owner', 'admin', 'super_admin'));

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this migration, verify that:
-- 1. Admin users can see all academies in the Admin Dashboard
-- 2. Admin users can create, update, and delete academies
-- 3. Academy owners can see and update their own academies
-- 4. Check that admin users have role = 'admin' or 'super_admin' in the users table

