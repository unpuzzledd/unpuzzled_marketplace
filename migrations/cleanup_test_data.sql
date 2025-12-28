-- =============================================
-- DATABASE CLEANUP - REMOVE TEST DATA
-- =============================================
-- This script deletes all student and teacher users and their related data
-- while preserving:
--   - Admin users (role = 'admin' or 'super_admin')
--   - Academy owner users and their academies
--   - Reference data (locations, skills)
--   - Admin table entries
-- =============================================
-- WARNING: This will permanently delete data!
-- Run this script in a transaction and verify before committing.
-- =============================================

BEGIN;

-- =============================================
-- STEP 1: VERIFICATION QUERIES (Before Deletion)
-- =============================================

DO $$
DECLARE
  admin_users_count INTEGER;
  academy_owner_count INTEGER;
  student_count INTEGER;
  teacher_count INTEGER;
  null_role_count INTEGER;
  academies_count INTEGER;
  batches_count INTEGER;
  student_scores_count INTEGER;
  topics_count INTEGER;
  batch_enrollments_count INTEGER;
  teacher_skills_count INTEGER;
  teacher_assignments_count INTEGER;
  student_enrollments_count INTEGER;
BEGIN
  -- Count users by role
  SELECT COUNT(*) INTO admin_users_count FROM users WHERE role IN ('admin', 'super_admin');
  SELECT COUNT(*) INTO academy_owner_count FROM users WHERE role = 'academy_owner';
  SELECT COUNT(*) INTO student_count FROM users WHERE role = 'student';
  SELECT COUNT(*) INTO teacher_count FROM users WHERE role = 'teacher';
  SELECT COUNT(*) INTO null_role_count FROM users WHERE role IS NULL;
  
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
  RAISE NOTICE 'Admin users: % (KEEP)', admin_users_count;
  RAISE NOTICE 'Academy owner users: % (KEEP)', academy_owner_count;
  RAISE NOTICE 'Student users: % (DELETE)', student_count;
  RAISE NOTICE 'Teacher users: % (DELETE)', teacher_count;
  RAISE NOTICE 'Null role users: % (DELETE)', null_role_count;
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
-- STEP 2: PHASE 1 - Handle Non-CASCADE Foreign Keys
-- =============================================
-- Set NULL for foreign keys that don't cascade

-- Set batches.teacher_id = NULL for batches assigned to teachers
UPDATE batches
SET teacher_id = NULL
WHERE teacher_id IN (
  SELECT id FROM users WHERE role IN ('student', 'teacher') OR role IS NULL
);

DO $$
DECLARE
  batches_updated INTEGER;
BEGIN
  GET DIAGNOSTICS batches_updated = ROW_COUNT;
  RAISE NOTICE 'Set teacher_id to NULL for % batches', batches_updated;
END $$;

-- Set topics.created_by = NULL for topics created by students/teachers
UPDATE topics
SET created_by = NULL
WHERE created_by IN (
  SELECT id FROM users WHERE role IN ('student', 'teacher') OR role IS NULL
);

DO $$
DECLARE
  topics_updated INTEGER;
BEGIN
  GET DIAGNOSTICS topics_updated = ROW_COUNT;
  RAISE NOTICE 'Set created_by to NULL for % topics', topics_updated;
END $$;

-- Set student_scores.updated_by = NULL for scores updated by students/teachers
UPDATE student_scores
SET updated_by = NULL
WHERE updated_by IN (
  SELECT id FROM users WHERE role IN ('student', 'teacher') OR role IS NULL
);

DO $$
DECLARE
  scores_updated INTEGER;
BEGIN
  GET DIAGNOSTICS scores_updated = ROW_COUNT;
  RAISE NOTICE 'Set updated_by to NULL for % student scores', scores_updated;
END $$;

-- =============================================
-- STEP 3: PHASE 2 - Delete Child Records
-- =============================================
-- Delete records that reference students/teachers
-- Note: Most will cascade automatically, but we'll be explicit

-- Delete student_scores for students/teachers
DELETE FROM student_scores
WHERE student_id IN (
  SELECT id FROM users WHERE role IN ('student', 'teacher') OR role IS NULL
)
OR updated_by IN (
  SELECT id FROM users WHERE role IN ('student', 'teacher') OR role IS NULL
);

DO $$
DECLARE
  scores_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS scores_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % student scores', scores_deleted;
END $$;

-- Delete batch_enrollments for students
DELETE FROM batch_enrollments
WHERE student_id IN (
  SELECT id FROM users WHERE role = 'student' OR role IS NULL
);

DO $$
DECLARE
  enrollments_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS enrollments_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % batch enrollments', enrollments_deleted;
END $$;

-- Delete teacher_skills for teachers
DELETE FROM teacher_skills
WHERE teacher_id IN (
  SELECT id FROM users WHERE role = 'teacher' OR role IS NULL
);

DO $$
DECLARE
  teacher_skills_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS teacher_skills_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % teacher skills', teacher_skills_deleted;
END $$;

-- Delete teacher_assignments for teachers
DELETE FROM teacher_assignments
WHERE teacher_id IN (
  SELECT id FROM users WHERE role = 'teacher' OR role IS NULL
);

DO $$
DECLARE
  assignments_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS assignments_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % teacher assignments', assignments_deleted;
END $$;

-- Delete student_enrollments for students
DELETE FROM student_enrollments
WHERE student_id IN (
  SELECT id FROM users WHERE role = 'student' OR role IS NULL
);

DO $$
DECLARE
  student_enrollments_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS student_enrollments_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % student enrollments', student_enrollments_deleted;
END $$;

-- =============================================
-- STEP 4: PHASE 3 - Clean Up Batches
-- =============================================
-- Batches are already handled in Phase 1 (teacher_id set to NULL)
-- Keep batches owned by academy_owners (they remain intact)

-- =============================================
-- STEP 5: PHASE 4 - Delete Users
-- =============================================

-- Delete from public.users
-- Note: auth.users deletion must be done separately via Supabase Dashboard
DELETE FROM users
WHERE role IN ('student', 'teacher') OR role IS NULL;

DO $$
DECLARE
  users_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS users_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % users from public.users', users_deleted;
  RAISE NOTICE 'IMPORTANT: You must also delete these users from auth.users manually';
  RAISE NOTICE 'Go to Supabase Dashboard > Authentication > Users and delete non-admin/academy_owner users';
END $$;

-- =============================================
-- STEP 6: VERIFICATION QUERIES (After Deletion)
-- =============================================

DO $$
DECLARE
  admin_users_count INTEGER;
  academy_owner_count INTEGER;
  student_count INTEGER;
  teacher_count INTEGER;
  null_role_count INTEGER;
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
  -- Count remaining users
  SELECT COUNT(*) INTO admin_users_count FROM users WHERE role IN ('admin', 'super_admin');
  SELECT COUNT(*) INTO academy_owner_count FROM users WHERE role = 'academy_owner';
  SELECT COUNT(*) INTO student_count FROM users WHERE role = 'student';
  SELECT COUNT(*) INTO teacher_count FROM users WHERE role = 'teacher';
  SELECT COUNT(*) INTO null_role_count FROM users WHERE role IS NULL;
  
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
  RAISE NOTICE 'Academy owner users: % (preserved)', academy_owner_count;
  RAISE NOTICE 'Student users: % (should be 0)', student_count;
  RAISE NOTICE 'Teacher users: % (should be 0)', teacher_count;
  RAISE NOTICE 'Null role users: % (should be 0)', null_role_count;
  RAISE NOTICE 'Academies: % (preserved)', academies_count;
  RAISE NOTICE 'Batches: % (preserved, teacher_id set to NULL)', batches_count;
  RAISE NOTICE 'Student scores: % (should be 0)', student_scores_count;
  RAISE NOTICE 'Topics: % (preserved, created_by set to NULL)', topics_count;
  RAISE NOTICE 'Batch enrollments: % (should be 0)', batch_enrollments_count;
  RAISE NOTICE 'Teacher skills: % (should be 0)', teacher_skills_count;
  RAISE NOTICE 'Teacher assignments: % (should be 0)', teacher_assignments_count;
  RAISE NOTICE 'Student enrollments: % (should be 0)', student_enrollments_count;
  RAISE NOTICE 'Locations: % (preserved)', locations_count;
  RAISE NOTICE 'Skills: % (preserved)', skills_count;
  RAISE NOTICE 'Admins table entries: % (preserved)', admins_count;
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
-- 1. Delete users from auth.users
--    - Go to Supabase Dashboard > Authentication > Users
--    - Delete all users with role 'student', 'teacher', or NULL role
--    - Keep admin and academy_owner users
--
-- 2. Verify all deletions were successful
--    - Check each table to ensure only admin/academy_owner data remains
--    - Verify locations and skills are preserved
--    - Verify admins table entries are preserved
--    - Verify academies owned by academy_owners are preserved



