-- =============================================
-- FIX LOCATIONS TABLE RLS POLICIES
-- =============================================
-- This migration fixes the RLS policy issue preventing admins
-- from inserting, updating, or deleting locations.
-- =============================================

-- Step 1: Create is_admin() helper function
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

-- Step 2: Ensure RLS is enabled on locations table
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for locations table

-- Allow admins to view all locations
CREATE POLICY "Admins can view all locations" ON locations
  FOR SELECT USING (is_admin(auth.uid()));

-- Allow admins to insert locations
CREATE POLICY "Admins can insert locations" ON locations
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update locations
CREATE POLICY "Admins can update locations" ON locations
  FOR UPDATE USING (is_admin(auth.uid()));

-- Allow admins to delete locations
CREATE POLICY "Admins can delete locations" ON locations
  FOR DELETE USING (is_admin(auth.uid()));

-- Optional: Allow everyone to view active locations (for academy selection, etc.)
-- Uncomment the following if you want public read access to active locations:
-- CREATE POLICY "Anyone can view active locations" ON locations
--   FOR SELECT USING (is_active = true);

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this migration, verify that:
-- 1. Admin users can create locations via Admin Dashboard
-- 2. Admin users can update existing locations
-- 3. Admin users can delete locations (if not in use)
-- 4. Admin users can view all locations
-- =============================================

