# Database Migration Instructions

## ⚠️ IMPORTANT: Run This Migration Now

You're seeing errors because the `highest_education` column doesn't exist in your database yet. Follow these steps to fix it:

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**

## Step 2: Run the Migration

Copy and paste the following SQL into the SQL Editor:

```sql
-- Migration: Add highest_education field to users table for teachers
-- Date: Teacher Profile Enhancement

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS highest_education TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.highest_education IS 'Highest education level for teachers (e.g., High School, Bachelor, Master, PhD, etc.)';
```

## Step 3: Execute

1. Click **RUN** (or press Ctrl+Enter)
2. Wait for the success message
3. You should see: "Success. No rows returned"

## Step 4: Verify

Run this query to verify the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'highest_education';
```

You should see one row with `highest_education` and `text` as the data type.

## Step 5: Also Run Student Enrollment Notes Migration

While you're at it, run this migration too (for the notes feature we just added):

```sql
-- Migration: Add notes column to student_enrollments table
-- Purpose: Allow academy owners to add notes when approving/rejecting student enrollments

ALTER TABLE student_enrollments 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN student_enrollments.notes IS 'Notes from academy owner when approving/rejecting student enrollment. Visible to students.';
```

## Troubleshooting

### If you get "permission denied":
- Make sure you're logged in as a project owner/admin
- Check that you have the correct Supabase project selected

### If the column already exists:
- The `IF NOT EXISTS` clause will prevent errors
- You can safely run the migration again

### After running migrations:
- Refresh your browser
- Clear browser cache if needed
- Try the profile completion flow again

## Files Reference

- Migration file: `migrations/add_teacher_education_field.sql`
- Student enrollment notes: `migrations/add_student_enrollment_notes.sql`

