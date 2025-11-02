# Creating Neeraj's Chess Academy - Setup Guide

This guide will help you create "Neeraj's Chess Academy" and assign one student and one teacher to it.

## 📋 Prerequisites

Before running the SQL scripts, ensure you have:
1. Access to your Supabase SQL Editor
2. An active owner account (your email: neeraj.7always@gmail.com)
3. At least one active location in the database
4. Chess skill created in the skills table
5. At least one student and one teacher in the users table

## 🚀 Option 1: Automated Script (Recommended)

This option uses a single script that automatically finds IDs and creates everything.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to: SQL Editor

2. **Open the Script**
   - Open the file: `create_neeraj_academy.sql`

3. **Update Email (if needed)**
   - Line 18: Replace `'neeraj.7always@gmail.com'` with your actual email if different

4. **Run the Script**
   - Copy the entire contents of `create_neeraj_academy.sql`
   - Paste into Supabase SQL Editor
   - Click "RUN"

5. **Check Results**
   - Look for "SUCCESS!" message in the output
   - The script will display:
     - Academy ID
     - Assigned Student ID
     - Assigned Teacher ID
   - Verification queries at the end will show all the details

### What the Script Does:

✅ Finds your user ID based on email
✅ Gets an active location
✅ Gets the Chess skill
✅ Creates "Neeraj's Chess Academy"
✅ Links the academy with Chess skill
✅ Finds and assigns one available student
✅ Finds and assigns one available teacher
✅ Links the teacher with Chess skill
✅ Verifies the creation with detailed queries

## 🔧 Option 2: Step-by-Step Manual Approach

Use this if you want more control or if the automated script fails.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to: SQL Editor

2. **Open the Script**
   - Open the file: `create_neeraj_academy_step_by_step.sql`

3. **Execute Each Step Sequentially**
   - The file has 10 numbered steps
   - Execute each SELECT query first to find IDs
   - Copy the IDs from the results
   - Replace the placeholder IDs in the INSERT queries
   - Execute the INSERT queries

4. **Follow the Instructions**
   - Each step has clear comments explaining what to do
   - Copy the IDs as instructed (e.g., YOUR_OWNER_ID, ACADEMY_ID, etc.)
   - Replace placeholders with actual UUIDs

5. **Run Verification Queries**
   - At the end of the file, there are verification queries
   - Run these to confirm everything was created correctly

## 📊 Verification

After running either option, you should see:

### Academy Details:
- **Name**: Neeraj's Chess Academy
- **Phone**: +1-555-0199
- **Status**: approved (or pending if you changed it)
- **Owner**: Your name and email
- **Location**: An active location from your database
- **Skills**: Chess

### Assigned Student:
- One student enrolled with status "approved"

### Assigned Teacher:
- One teacher assigned with status "approved"
- Teacher linked to Chess skill

## 🎯 What to Do After Creation

1. **Login to Your Application**
   - Use your owner account (neeraj.7always@gmail.com)

2. **View Academy Dashboard**
   - You should now see TWO academies in your dashboard
   - The new "Neeraj's Chess Academy" should be visible

3. **Verify Data**
   - Check the Teachers Management section
   - Check the Students Management section
   - Both should show the assigned teacher and student

4. **Create Batches** (Optional)
   - Navigate to Batch Management
   - Create a new batch for Chess
   - Assign the teacher to the batch
   - Enroll the student in the batch

## 🐛 Troubleshooting

### Issue: "Owner email not found"
**Solution**: Update the email in the script (line 18 in automated script)

### Issue: "No active location found"
**Solution**: Create a location first using Admin Dashboard → Locations → Add Location

### Issue: "Chess skill not found"
**Solution**: Create Chess skill using Admin Dashboard → Skills → Add Skill

### Issue: "No available student/teacher found"
**Solution**: 
- Check if you have users with role 'student' or 'teacher'
- Run: `SELECT * FROM users WHERE role IN ('student', 'teacher');`
- If none exist, create users through the application signup flow

### Issue: Academy created but not visible in dashboard
**Solution**: 
- Refresh the page
- Check the academy status (should be 'approved' not 'pending')
- Check RLS policies for academies table

## 📝 Database Tables Modified

The scripts will insert/update data in these tables:
1. ✅ `academies` - New academy record
2. ✅ `academy_skills` - Link academy to Chess skill
3. ✅ `student_enrollments` - Enroll one student
4. ✅ `teacher_assignments` - Assign one teacher
5. ✅ `teacher_skills` - Link teacher to Chess skill

## 🔒 Security Notes

- All operations respect Row Level Security (RLS) policies
- Only authorized users can view/modify academy data
- Student and teacher data is protected by RLS
- No sensitive data (passwords, auth tokens) is modified

## 📞 Support

If you encounter any issues:
1. Check the console logs in browser (F12)
2. Check Supabase logs for any errors
3. Verify all prerequisite data exists (location, skills, users)
4. Run the verification queries to check what was created

## 🎉 Success Indicators

You'll know everything worked when:
- ✅ No errors in SQL Editor
- ✅ "SUCCESS!" message appears (automated script)
- ✅ Verification queries return data
- ✅ New academy visible in your dashboard
- ✅ Student and teacher appear in management sections
- ✅ All status values are "approved"

---

**Created**: October 19, 2025
**Purpose**: Setup second academy for testing multi-academy scenarios
**Status**: Ready to execute

