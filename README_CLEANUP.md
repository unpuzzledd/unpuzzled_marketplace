# Database Cleanup for Testing

This guide explains how to clean up the database for thorough testing by removing all non-admin users and their related data.

## What Gets Deleted

- All non-admin users (students, teachers, academy owners)
- All academies owned by non-admin users
- All batches, enrollments, topics, scores
- All teacher assignments and skills
- All academy photos from storage

## What Gets Preserved

- Admin users (role = 'admin' or 'super_admin')
- Locations table (admin-created reference data)
- Skills table (admin-created reference data)
- Admins table entries

## Prerequisites

1. Access to Supabase SQL Editor (with appropriate permissions)
2. Supabase Service Role Key (for storage cleanup)
3. Node.js installed (for storage cleanup script)

## Step-by-Step Instructions

### Step 1: Backup (Recommended)

Before running the cleanup, consider backing up your database:
- Go to Supabase Dashboard > Database > Backups
- Create a manual backup

### Step 2: Run SQL Cleanup Script

1. Open Supabase Dashboard > SQL Editor
2. Open the file `cleanup_database_for_testing.sql`
3. Review the script carefully
4. Execute the script
5. **IMPORTANT**: The script ends with `-- COMMIT;` commented out
   - Review the output messages
   - If everything looks correct, uncomment `COMMIT;` and run it
   - If there are issues, use `ROLLBACK;` instead

### Step 3: Clean Up Auth Users

After running the SQL script, you need to manually delete non-admin users from `auth.users`:

1. Go to Supabase Dashboard > Authentication > Users
2. Filter or search for non-admin users
3. Delete each non-admin user manually
   - Or use the Supabase Management API if you have access

### Step 4: Clean Up Storage Files

Delete all academy photos from storage:

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard > Storage > academy-photos
2. Select all files/folders
3. Click Delete

**Option B: Using the Storage Cleanup Script**
1. Set environment variables:
   ```bash
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Run the script:
   ```bash
   node cleanup_storage_files.js
   ```

### Step 5: Verification

After cleanup, verify:

1. **Users table**: Only admin users should remain
   ```sql
   SELECT id, email, role FROM users;
   ```

2. **Academies**: Should be empty
   ```sql
   SELECT COUNT(*) FROM academies;
   ```

3. **Batches**: Should be empty
   ```sql
   SELECT COUNT(*) FROM batches;
   ```

4. **Locations & Skills**: Should be preserved
   ```sql
   SELECT COUNT(*) FROM locations;
   SELECT COUNT(*) FROM skills;
   ```

5. **Admins table**: Should be preserved
   ```sql
   SELECT COUNT(*) FROM admins;
   ```

6. **Storage**: Should be empty
   - Check Supabase Dashboard > Storage > academy-photos

## Troubleshooting

### Foreign Key Constraint Errors

If you encounter foreign key constraint errors:
- The script deletes in the correct order, but if you have custom constraints, you may need to temporarily disable them
- Check the error message to identify which table is causing the issue

### Auth Users Not Deleted

If auth users remain after SQL execution:
- This is expected - auth.users deletion requires manual action or Management API
- Use Supabase Dashboard to delete them manually

### Storage Files Not Deleted

If storage files remain:
- Check that you have the correct bucket name: `academy-photos`
- Verify your service role key has storage admin permissions
- Try deleting files manually through the Dashboard first

## Safety Notes

- **Always backup before cleanup**
- **Test in a development environment first**
- **Review the SQL script output before committing**
- **Double-check what gets preserved vs deleted**

## Files Included

- `cleanup_database_for_testing.sql` - Main SQL cleanup script
- `cleanup_storage_files.js` - Node.js script for storage cleanup
- `README_CLEANUP.md` - This documentation file

## Support

If you encounter issues:
1. Check the error messages in the SQL output
2. Verify your Supabase permissions
3. Ensure you're using the correct project/database
4. Review the foreign key relationships if constraints fail

