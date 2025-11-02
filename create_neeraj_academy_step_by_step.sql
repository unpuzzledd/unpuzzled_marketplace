-- =============================================
-- CREATE NEERAJ'S CHESS ACADEMY - STEP BY STEP
-- =============================================
-- Execute these queries one by one in your Supabase SQL Editor
-- Replace the IDs as you find them from the SELECT queries
-- =============================================

-- STEP 1: Find your owner ID
-- Copy the ID from the result and use it in the next queries
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'neeraj.7always@gmail.com';
-- Result: Copy the 'id' value -> Let's call it YOUR_OWNER_ID

-- STEP 2: Find an available location
SELECT id, name, city, state, status 
FROM locations 
WHERE status = 'active' 
LIMIT 5;
-- Result: Copy one 'id' value -> Let's call it YOUR_LOCATION_ID

-- STEP 3: Find the Chess skill
SELECT id, name, category, status 
FROM skills 
WHERE LOWER(name) LIKE '%chess%';
-- Result: Copy the 'id' value -> Let's call it CHESS_SKILL_ID

-- STEP 4: Find available students
SELECT u.id, u.full_name, u.email, u.role
FROM users u
WHERE u.role = 'student'
LIMIT 10;
-- Result: Pick one student 'id' -> Let's call it STUDENT_ID

-- STEP 5: Find available teachers
SELECT u.id, u.full_name, u.email, u.role
FROM users u
WHERE u.role = 'teacher'
LIMIT 10;
-- Result: Pick one teacher 'id' -> Let's call it TEACHER_ID

-- =============================================
-- NOW REPLACE THE IDs BELOW WITH THE ACTUAL VALUES
-- =============================================

-- STEP 6: Create the academy
-- Replace YOUR_OWNER_ID and YOUR_LOCATION_ID below
INSERT INTO academies (
  name,
  phone_number,
  owner_id,
  location_id,
  status
) VALUES (
  'Neeraj''s Chess Academy',
  '+1-555-0199',
  'YOUR_OWNER_ID',  -- Replace this with actual owner ID
  'YOUR_LOCATION_ID',  -- Replace this with actual location ID
  'approved'  -- Change to 'pending' if you want admin approval
)
RETURNING id, name, status;
-- Result: Copy the returned 'id' -> Let's call it ACADEMY_ID

-- STEP 7: Link academy with Chess skill
-- Replace ACADEMY_ID and CHESS_SKILL_ID below
INSERT INTO academy_skills (
  academy_id,
  skill_id
) VALUES (
  'ACADEMY_ID',  -- Replace with academy ID from Step 6
  'CHESS_SKILL_ID'  -- Replace with chess skill ID from Step 3
)
RETURNING *;

-- STEP 8: Enroll the student
-- Replace STUDENT_ID and ACADEMY_ID below
INSERT INTO student_enrollments (
  student_id,
  academy_id,
  status
) VALUES (
  'STUDENT_ID',  -- Replace with student ID from Step 4
  'ACADEMY_ID',  -- Replace with academy ID from Step 6
  'approved'
)
RETURNING *;

-- STEP 9: Assign the teacher
-- Replace TEACHER_ID and ACADEMY_ID below
INSERT INTO teacher_assignments (
  teacher_id,
  academy_id,
  status
) VALUES (
  'TEACHER_ID',  -- Replace with teacher ID from Step 5
  'ACADEMY_ID',  -- Replace with academy ID from Step 6
  'approved'
)
RETURNING *;

-- STEP 10: Link teacher with Chess skill
-- Replace TEACHER_ID, ACADEMY_ID, and CHESS_SKILL_ID below
INSERT INTO teacher_skills (
  teacher_id,
  academy_id,
  skill_id
) VALUES (
  'TEACHER_ID',  -- Replace with teacher ID from Step 5
  'ACADEMY_ID',  -- Replace with academy ID from Step 6
  'CHESS_SKILL_ID'  -- Replace with chess skill ID from Step 3
)
RETURNING *;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- View the new academy
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

-- View assigned students
SELECT 
  a.name as academy_name,
  u.full_name as student_name,
  u.email as student_email,
  se.status as enrollment_status,
  se.created_at
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN academies a ON se.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- View assigned teachers
SELECT 
  a.name as academy_name,
  u.full_name as teacher_name,
  u.email as teacher_email,
  ta.status as assignment_status,
  ta.created_at
FROM teacher_assignments ta
JOIN users u ON ta.teacher_id = u.id
JOIN academies a ON ta.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- View academy skills
SELECT 
  a.name as academy_name,
  s.name as skill_name,
  s.category as skill_category,
  s.status as skill_status
FROM academy_skills acs
JOIN skills s ON acs.skill_id = s.id
JOIN academies a ON acs.academy_id = a.id
WHERE a.name = 'Neeraj''s Chess Academy';

-- View teacher skills
SELECT 
  a.name as academy_name,
  u.full_name as teacher_name,
  s.name as skill_name
FROM teacher_skills ts
JOIN users u ON ts.teacher_id = u.id
JOIN academies a ON ts.academy_id = a.id
JOIN skills s ON ts.skill_id = s.id
WHERE a.name = 'Neeraj''s Chess Academy';

