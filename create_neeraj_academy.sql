-- =============================================
-- CREATE NEERAJ'S CHESS ACADEMY
-- =============================================
-- This script will:
-- 1. Find existing academy owner (you)
-- 2. Get an existing location
-- 3. Get the Chess skill
-- 4. Create the new academy
-- 5. Assign one existing student
-- 6. Assign one existing teacher
-- =============================================

-- Step 1: Find your user ID (academy owner)
-- Replace 'neeraj.7always@gmail.com' with your actual email if different
DO $$
DECLARE
  v_owner_id UUID;
  v_location_id UUID;
  v_chess_skill_id UUID;
  v_academy_id UUID;
  v_student_id UUID;
  v_teacher_id UUID;
BEGIN
  -- Get owner ID
  SELECT id INTO v_owner_id
  FROM users
  WHERE email = 'neeraj.7always@gmail.com'
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Owner email not found. Please update the email in the script.';
  END IF;

  RAISE NOTICE 'Owner ID: %', v_owner_id;

  -- Get a location (using first available location)
  SELECT id INTO v_location_id
  FROM locations
  WHERE status = 'active'
  LIMIT 1;

  IF v_location_id IS NULL THEN
    RAISE EXCEPTION 'No active location found. Please create a location first.';
  END IF;

  RAISE NOTICE 'Location ID: %', v_location_id;

  -- Get Chess skill ID
  SELECT id INTO v_chess_skill_id
  FROM skills
  WHERE LOWER(name) LIKE '%chess%'
  LIMIT 1;

  IF v_chess_skill_id IS NULL THEN
    RAISE EXCEPTION 'Chess skill not found. Please create the Chess skill first.';
  END IF;

  RAISE NOTICE 'Chess Skill ID: %', v_chess_skill_id;

  -- Step 2: Create the academy
  INSERT INTO academies (
    name,
    phone_number,
    owner_id,
    location_id,
    status
  ) VALUES (
    'Neeraj''s Chess Academy',
    '+1-555-0199',
    v_owner_id,
    v_location_id,
    'approved'  -- Set to 'approved' so you can use it immediately, or 'pending' if you want admin approval
  )
  RETURNING id INTO v_academy_id;

  RAISE NOTICE 'Created Academy ID: %', v_academy_id;

  -- Step 3: Link the academy with Chess skill
  INSERT INTO academy_skills (
    academy_id,
    skill_id
  ) VALUES (
    v_academy_id,
    v_chess_skill_id
  );

  RAISE NOTICE 'Linked academy with Chess skill';

  -- Step 4: Find and assign one existing student
  -- Get a student who is NOT already enrolled in this academy
  SELECT s.student_id INTO v_student_id
  FROM student_enrollments s
  WHERE s.student_id NOT IN (
    SELECT student_id FROM student_enrollments WHERE academy_id = v_academy_id
  )
  AND s.status = 'approved'
  LIMIT 1;

  -- If no enrolled student found, try to find any user with student role
  IF v_student_id IS NULL THEN
    SELECT id INTO v_student_id
    FROM users
    WHERE role = 'student'
    LIMIT 1;
  END IF;

  IF v_student_id IS NOT NULL THEN
    -- Enroll the student
    INSERT INTO student_enrollments (
      student_id,
      academy_id,
      status
    ) VALUES (
      v_student_id,
      v_academy_id,
      'approved'
    );

    RAISE NOTICE 'Assigned Student ID: %', v_student_id;
  ELSE
    RAISE WARNING 'No available student found to assign';
  END IF;

  -- Step 5: Find and assign one existing teacher
  -- Get a teacher who is NOT already assigned to this academy
  SELECT t.teacher_id INTO v_teacher_id
  FROM teacher_assignments t
  WHERE t.teacher_id NOT IN (
    SELECT teacher_id FROM teacher_assignments WHERE academy_id = v_academy_id
  )
  AND t.status = 'approved'
  LIMIT 1;

  -- If no assigned teacher found, try to find any user with teacher role
  IF v_teacher_id IS NULL THEN
    SELECT id INTO v_teacher_id
    FROM users
    WHERE role = 'teacher'
    LIMIT 1;
  END IF;

  IF v_teacher_id IS NOT NULL THEN
    -- Assign the teacher
    INSERT INTO teacher_assignments (
      teacher_id,
      academy_id,
      status
    ) VALUES (
      v_teacher_id,
      v_academy_id,
      'approved'
    );

    RAISE NOTICE 'Assigned Teacher ID: %', v_teacher_id;

    -- Link teacher with Chess skill
    INSERT INTO teacher_skills (
      teacher_id,
      academy_id,
      skill_id
    ) VALUES (
      v_teacher_id,
      v_academy_id,
      v_chess_skill_id
    );

    RAISE NOTICE 'Linked teacher with Chess skill';
  ELSE
    RAISE WARNING 'No available teacher found to assign';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCESS! Neeraj''s Chess Academy created!';
  RAISE NOTICE 'Academy ID: %', v_academy_id;
  RAISE NOTICE 'Student ID: %', v_student_id;
  RAISE NOTICE 'Teacher ID: %', v_teacher_id;
  RAISE NOTICE '========================================';

END $$;

-- Verify the creation
SELECT 
  a.id,
  a.name,
  a.phone_number,
  a.status,
  u.full_name as owner_name,
  u.email as owner_email,
  l.name as location_name,
  l.city as location_city
FROM academies a
JOIN users u ON a.owner_id = u.id
JOIN locations l ON a.location_id = l.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- Show assigned students
SELECT 
  u.full_name as student_name,
  u.email as student_email,
  se.status as enrollment_status
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN academies a ON se.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- Show assigned teachers
SELECT 
  u.full_name as teacher_name,
  u.email as teacher_email,
  ta.status as assignment_status
FROM teacher_assignments ta
JOIN users u ON ta.teacher_id = u.id
JOIN academies a ON ta.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- Show academy skills
SELECT 
  s.name as skill_name,
  s.category as skill_category
FROM academy_skills acs
JOIN skills s ON acs.skill_id = s.id
JOIN academies a ON acs.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

