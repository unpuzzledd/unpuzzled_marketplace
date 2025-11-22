-- =============================================
-- DATABASE CLEANUP FOR TESTING
-- =============================================
-- This script deletes all non-admin users and their related data
-- while preserving:
--   - Admin users (role = 'admin' or 'super_admin')
--   - Locations table (admin-created reference data)
--   - Skills table (admin-created reference data)
--   - Admins table entries
-- =============================================
-- WARNING: This will permanently delete data!
-- Run this script in a transaction and verify before committing.
-- =============================================

BEGIN;

-- =============================================
-- STEP 1: VERIFICATION QUERIES (Before Deletion)
-- =============================================

-- Count current data
DO $$
DECLARE
  admin_users_count INTEGER;
  non_admin_users_count INTEGER;
  academies_count INTEGER;
  batches_count INTEGER;
  student_scores_count INTEGER;
  topics_count INTEGER;
  batch_enrollments_count INTEGER;
  teacher_skills_count INTEGER;
  teacher_assignments_count INTEGER;
  student_enrollments_count INTEGER;
BEGIN
  -- Count admin vs non-admin users
  SELECT COUNT(*) INTO admin_users_count FROM users WHERE role IN ('admin', 'super_admin');
  SELECT COUNT(*) INTO non_admin_users_count FROM users WHERE role NOT IN ('admin', 'super_admin');
  
  -- Count related data
  SELECT COUNT(*) INTO academies_count FROM academies;
  SELECT COUNT(*) INTO batches_count FROM batches;
  SELECT COUNT(*) INTO student_scores_count FROM student_scores;
  SELECT COUNT(*) INTO topics_count FROM topics;
  SELECT COUNT(*) INTO batch_enrollments_count FROM batch_enrollments;
  SELECT COUNT(*) INTO teacher_skills_count FROM teacher_skills;
  SELECT COUNT(*) INTO teacher_assignments_count FROM teacher_assignments;
  SELECT COUNT(*) INTO student_enrollments_count FROM student_enrollments;
  
  RAISE NOTICE '=== BEFORE DELETION ===';
  RAISE NOTICE 'Admin users: %', admin_users_count;
  RAISE NOTICE 'Non-admin users: %', non_admin_users_count;
  RAISE NOTICE 'Academies: %', academies_count;
  RAISE NOTICE 'Batches: %', batches_count;
  RAISE NOTICE 'Student scores: %', student_scores_count;
  RAISE NOTICE 'Topics: %', topics_count;
  RAISE NOTICE 'Batch enrollments: %', batch_enrollments_count;
  RAISE NOTICE 'Teacher skills: %', teacher_skills_count;
  RAISE NOTICE 'Teacher assignments: %', teacher_assignments_count;
  RAISE NOTICE 'Student enrollments: %', student_enrollments_count;
END $$;

-- =============================================
-- STEP 2: DELETE CHILD RECORDS
-- =============================================
-- Delete in order of dependencies (most dependent first)

-- 1. Delete student scores (references students, academies, batches, skills, updated_by users)
DELETE FROM student_scores
WHERE student_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
)
OR academy_id IN (
  SELECT id FROM academies WHERE owner_id IN (
    SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
  )
);

-- 2. Delete topics (references batches, created_by users)
DELETE FROM topics
WHERE batch_id IN (
  SELECT id FROM batches WHERE academy_id IN (
    SELECT id FROM academies WHERE owner_id IN (
      SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
    )
  )
)
OR created_by IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
);

-- 3. Delete batch enrollments (references batches, students)
DELETE FROM batch_enrollments
WHERE batch_id IN (
  SELECT id FROM batches WHERE academy_id IN (
    SELECT id FROM academies WHERE owner_id IN (
      SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
    )
  )
)
OR student_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
);

-- 4. Delete teacher skills (references teachers, academies, skills)
DELETE FROM teacher_skills
WHERE teacher_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
)
OR academy_id IN (
  SELECT id FROM academies WHERE owner_id IN (
    SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
  )
);

-- 5. Delete teacher assignments (references teachers, academies)
DELETE FROM teacher_assignments
WHERE teacher_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
)
OR academy_id IN (
  SELECT id FROM academies WHERE owner_id IN (
    SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
  )
);

-- 6. Delete student enrollments (references students, academies)
DELETE FROM student_enrollments
WHERE student_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
)
OR academy_id IN (
  SELECT id FROM academies WHERE owner_id IN (
    SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
  )
);

-- =============================================
-- STEP 3: DELETE PARENT RECORDS
-- =============================================

-- 1. Delete batches (references academies, skills, teachers)
DELETE FROM batches
WHERE academy_id IN (
  SELECT id FROM academies WHERE owner_id IN (
    SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
  )
)
OR teacher_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
);

-- 2. Delete academies (references owners who are non-admin users)
-- Note: This will also clear photo_urls arrays, but storage files need separate cleanup
DELETE FROM academies
WHERE owner_id IN (
  SELECT id FROM users WHERE role NOT IN ('admin', 'super_admin')
);

-- =============================================
-- STEP 4: DELETE NON-ADMIN USERS
-- =============================================

-- Delete from public.users
-- Note: auth.users deletion must be done separately via Supabase Dashboard or Management API
DELETE FROM users
WHERE role NOT IN ('admin', 'super_admin');

-- Log the deletion
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % non-admin users from public.users', deleted_count;
  RAISE NOTICE 'IMPORTANT: You must also delete these users from auth.users manually';
  RAISE NOTICE 'Go to Supabase Dashboard > Authentication > Users and delete non-admin users';
END $$;

-- =============================================
-- STEP 5: VERIFICATION QUERIES (After Deletion)
-- =============================================

DO $$
DECLARE
  admin_users_count INTEGER;
  non_admin_users_count INTEGER;
  academies_count INTEGER;
  batches_count INTEGER;
  student_scores_count INTEGER;
  topics_count INTEGER;
  batch_enrollments_count INTEGER;
  teacher_skills_count INTEGER;
  teacher_assignments_count INTEGER;
  student_enrollments_count INTEGER;
  locations_count INTEGER;
  skills_count INTEGER;
  admins_count INTEGER;
BEGIN
  -- Count remaining admin users
  SELECT COUNT(*) INTO admin_users_count FROM users WHERE role IN ('admin', 'super_admin');
  SELECT COUNT(*) INTO non_admin_users_count FROM users WHERE role NOT IN ('admin', 'super_admin');
  
  -- Count remaining data
  SELECT COUNT(*) INTO academies_count FROM academies;
  SELECT COUNT(*) INTO batches_count FROM batches;
  SELECT COUNT(*) INTO student_scores_count FROM student_scores;
  SELECT COUNT(*) INTO topics_count FROM topics;
  SELECT COUNT(*) INTO batch_enrollments_count FROM batch_enrollments;
  SELECT COUNT(*) INTO teacher_skills_count FROM teacher_skills;
  SELECT COUNT(*) INTO teacher_assignments_count FROM teacher_assignments;
  SELECT COUNT(*) INTO student_enrollments_count FROM student_enrollments;
  
  -- Count preserved data
  SELECT COUNT(*) INTO locations_count FROM locations;
  SELECT COUNT(*) INTO skills_count FROM skills;
  SELECT COUNT(*) INTO admins_count FROM admins;
  
  RAISE NOTICE '=== AFTER DELETION ===';
  RAISE NOTICE 'Admin users: % (preserved)', admin_users_count;
  RAISE NOTICE 'Non-admin users: % (should be 0)', non_admin_users_count;
  RAISE NOTICE 'Academies: % (should be 0)', academies_count;
  RAISE NOTICE 'Batches: % (should be 0)', batches_count;
  RAISE NOTICE 'Student scores: % (should be 0)', student_scores_count;
  RAISE NOTICE 'Topics: % (should be 0)', topics_count;
  RAISE NOTICE 'Batch enrollments: % (should be 0)', batch_enrollments_count;
  RAISE NOTICE 'Teacher skills: % (should be 0)', teacher_skills_count;
  RAISE NOTICE 'Teacher assignments: % (should be 0)', teacher_assignments_count;
  RAISE NOTICE 'Student enrollments: % (should be 0)', student_enrollments_count;
  RAISE NOTICE 'Locations: % (preserved)', locations_count;
  RAISE NOTICE 'Skills: % (preserved)', skills_count;
  RAISE NOTICE 'Admins table entries: % (preserved)', admins_count;
END $$;

-- =============================================
-- STEP 6: STORAGE CLEANUP INFORMATION
-- =============================================
-- Note: Storage file deletion requires using Supabase Storage API
-- The following query lists all academy photo files that should be deleted
-- You'll need to delete these files using the Storage API or Supabase Dashboard

-- Get list of academy IDs that were deleted (for storage cleanup reference)
-- This is informational - actual deletion must be done via Storage API
DO $$
DECLARE
  deleted_academy_ids UUID[];
BEGIN
  -- Note: This won't work after deletion, but included for reference
  -- In practice, you should run this BEFORE deletion to get the list
  RAISE NOTICE '=== STORAGE CLEANUP REQUIRED ===';
  RAISE NOTICE 'All files in the academy-photos bucket should be deleted.';
  RAISE NOTICE 'Use Supabase Storage API or Dashboard to delete all files from:';
  RAISE NOTICE 'Bucket: academy-photos';
  RAISE NOTICE '';
  RAISE NOTICE 'You can use the following JavaScript/TypeScript code:';
  RAISE NOTICE '';
  RAISE NOTICE 'const { data: files } = await supabase.storage';
  RAISE NOTICE '  .from("academy-photos")';
  RAISE NOTICE '  .list("", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });';
  RAISE NOTICE '';
  RAISE NOTICE 'const filePaths = files.map(file => file.name);';
  RAISE NOTICE 'await supabase.storage.from("academy-photos").remove(filePaths);';
END $$;

-- =============================================
-- COMMIT TRANSACTION
-- =============================================
-- Review the output above before committing!
-- If everything looks correct, uncomment the COMMIT line below.
-- If there are issues, use ROLLBACK instead.

-- COMMIT;
-- ROLLBACK; -- Uncomment this if you want to rollback instead

-- =============================================
-- MANUAL STEPS REQUIRED AFTER SQL EXECUTION
-- =============================================
-- 1. Delete all files from Supabase Storage bucket 'academy-photos'
--    - Go to Supabase Dashboard > Storage > academy-photos
--    - Select all files and delete
--    - OR use the Storage API code provided above
--
-- 2. Verify auth.users cleanup
--    - Check Supabase Dashboard > Authentication > Users
--    - Ensure only admin users remain
--    - If non-admin auth users still exist, delete them manually
--
-- 3. Verify all deletions were successful
--    - Check each table to ensure only admin-related data remains
--    - Verify locations and skills are preserved
--    - Verify admins table entries are preserved

