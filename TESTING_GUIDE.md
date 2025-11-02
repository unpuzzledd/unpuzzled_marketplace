# 🧪 Teacher Landing Page - Testing Guide

## ✅ Prerequisites

Your dev server is running at: **http://localhost:5174/**

---

## 🎯 STEP-BY-STEP TESTING

### **Step 1: Check Available Teacher Accounts**

First, let's see what teacher accounts exist in your database.

Run this query in Supabase SQL Editor (or check the results below):
```sql
SELECT email, full_name, role 
FROM users 
WHERE role = 'teacher';
```

---

### **Step 2: Sign In as Teacher**

#### **Option A: Use Existing Teacher Account**
1. Go to **http://localhost:5174/signin**
2. Sign in with one of the teacher emails from Step 1
3. You'll be automatically redirected to **/teacher**

#### **Option B: Create New Teacher Account**
1. Go to **http://localhost:5174/signin**
2. Click **"Sign Up"** or create new account
3. After signup, you'll be redirected to **/role-selection**
4. Select **"Teacher"** role
5. You'll be redirected to **/teacher**

---

### **Step 3: Verify Landing Page Loads**

You should see:
- ✅ Your name in the greeting: "Welcome back, [Your Name]!"
- ✅ Statistics showing batches, students, topics counts
- ✅ List of your batches (or empty state if none)
- ✅ Sidebar with navigation (Home, Batches, Students, Attendance)
- ✅ Skill filter dropdown in top right

**Screenshot checkpoint:** Take note of your batch count

---

### **Step 4: Test Batch Filtering**

1. Click on the **"Your Course"** dropdown (top right)
2. Select a different skill
3. Verify: Batch list updates to show only batches for that skill
4. Select **"All Courses"** to see all batches again

---

### **Step 5: Test Batch Detail Modal**

1. Click on any **batch card** in the list
2. A modal should open with 3 tabs: **Overview**, **Topics**, **Students**

#### **Test Overview Tab:**
- ✅ See batch name, skill, dates
- ✅ See max students count
- ✅ See quick statistics (enrolled students, topics)

#### **Test Topics Tab:**
1. Click **"Topics"** tab
2. Click **"+ Create Topic"** button
3. Fill in:
   - Title: "Test Topic"
   - Description: "This is a test topic"
   - Due Date: Pick a future date
4. Click **"Create"**
5. Verify: Topic appears in the list
6. Click **"Edit"** on the topic
7. Change the title to "Updated Test Topic"
8. Click **"Save"**
9. Verify: Title updates
10. Click **"Delete"**
11. Confirm deletion
12. Verify: Topic is removed

#### **Test Students Tab:**
1. Click **"Students"** tab
2. You should see enrolled students (or empty state)
3. If students exist:
   - Note current score (e.g., 1250)
   - Click **"Update Score"** button
   - Modal opens with student info
   - Enter new score: **2500**
   - Select level: **"Advanced"**
   - Click **"Update Score"**
   - Verify: Modal closes, new score shows immediately

---

### **Step 6: Test Sidebar Navigation**

1. Click **"Batches"** in sidebar
   - ✅ Should show grid view of all batches
2. Click **"Students"** in sidebar
   - ✅ Should show placeholder (coming soon)
3. Click **"Attendance"** in sidebar
   - ✅ Should show placeholder (coming soon)
4. Click **"Home"** in sidebar
   - ✅ Returns to main dashboard

---

### **Step 7: Test Sign Out**

1. Click on your **profile avatar** (top right)
2. Should sign you out and redirect to home page

---

## 🔍 DETAILED TEST SCENARIOS

### **Scenario 1: Teacher with No Batches**

**Expected Behavior:**
- ✅ Landing page loads successfully
- ✅ Shows statistics with 0 counts
- ✅ Shows "No batches assigned yet" message
- ✅ Skill dropdown shows "All Courses" only

**To Test:**
1. Create a new teacher account
2. Don't assign any batches
3. Verify empty states display correctly

---

### **Scenario 2: Teacher with Multiple Skills**

**Expected Behavior:**
- ✅ Skill dropdown shows all skills
- ✅ Filtering works correctly
- ✅ Each batch shows correct skill name

**To Test:**
1. Use teacher account with batches in different skills (Chess, Math, etc.)
2. Test filtering by each skill
3. Verify batch counts update

---

### **Scenario 3: Batch with No Students**

**Expected Behavior:**
- ✅ Batch detail opens successfully
- ✅ Overview tab shows 0 enrolled students
- ✅ Students tab shows "No students enrolled yet"

**To Test:**
1. Click on batch with no enrollments
2. Go to Students tab
3. Verify empty state message

---

### **Scenario 4: Batch with No Topics**

**Expected Behavior:**
- ✅ Topics tab shows "No topics created yet"
- ✅ "Create Topic" button still works

**To Test:**
1. Click on batch with no topics
2. Go to Topics tab
3. Try creating first topic

---

### **Scenario 5: Score Update Validation**

**Expected Behavior:**
- ✅ Score must be 0-9999
- ✅ Shows error for invalid scores
- ✅ Required fields validated

**To Test:**
1. Try entering score > 9999 (should show error)
2. Try entering negative score (should show error)
3. Try submitting empty form (should show validation)

---

## 🐛 TROUBLESHOOTING

### **Issue: Teacher not seeing batches**

**Possible Causes:**
1. Teacher not assigned to any academy
2. No batches assigned to teacher
3. Batches status is not 'active'

**Solution:**
```sql
-- Check teacher assignments
SELECT * FROM teacher_assignments 
WHERE teacher_id = '[your-teacher-id]';

-- Check batches
SELECT * FROM batches 
WHERE teacher_id = '[your-teacher-id]';
```

---

### **Issue: Can't update scores**

**Possible Causes:**
1. Student not enrolled in batch
2. Batch missing skill_id or academy_id
3. Network/Supabase connection issue

**Solution:**
- Check browser console for errors
- Verify batch_enrollments table has records
- Check batch has skill_id set

---

### **Issue: Topics not showing**

**Possible Causes:**
1. Topics belong to different batch
2. Topics table is empty

**Solution:**
```sql
-- Check topics for batch
SELECT * FROM topics 
WHERE batch_id = '[batch-id]';
```

---

### **Issue: Redirected to wrong page**

**Possible Causes:**
1. User role is not 'teacher'
2. Not authenticated

**Solution:**
```sql
-- Check user role
SELECT email, role FROM users 
WHERE email = '[your-email]';
```

---

## 📝 TESTING CHECKLIST

Use this checklist to verify all features:

### **Basic Functionality:**
- [ ] Dev server running on http://localhost:5174/
- [ ] Can access /signin page
- [ ] Can sign in as teacher
- [ ] Redirected to /teacher automatically
- [ ] Landing page loads without errors

### **Dashboard:**
- [ ] See personalized greeting with name
- [ ] See statistics (batches, students, topics)
- [ ] See list of batches
- [ ] Batches show correct skill names
- [ ] Batches show correct dates

### **Filtering:**
- [ ] Skill dropdown appears
- [ ] Can select different skills
- [ ] Batch list filters correctly
- [ ] "All Courses" shows all batches

### **Batch Modal:**
- [ ] Click batch opens modal
- [ ] Modal shows batch name
- [ ] Three tabs visible (Overview, Topics, Students)

### **Overview Tab:**
- [ ] Shows batch information
- [ ] Shows skill name
- [ ] Shows start/end dates
- [ ] Shows max students
- [ ] Shows status badge
- [ ] Shows quick statistics

### **Topics Tab:**
- [ ] Shows existing topics or empty state
- [ ] "Create Topic" button works
- [ ] Can create new topic
- [ ] Topic appears in list immediately
- [ ] Can view topic details
- [ ] Can edit topic
- [ ] Changes save correctly
- [ ] Can delete topic
- [ ] Confirmation dialog appears
- [ ] Topic removed after confirmation

### **Students Tab:**
- [ ] Shows enrolled students or empty state
- [ ] Students show current scores
- [ ] Students show levels
- [ ] "Update Score" button works
- [ ] Score modal opens
- [ ] Can enter new score (0-9999)
- [ ] Can select new level
- [ ] Form validation works
- [ ] Score updates successfully
- [ ] New score shows immediately

### **Navigation:**
- [ ] Sidebar navigation works
- [ ] "Home" shows dashboard
- [ ] "Batches" shows grid view
- [ ] "Students" shows placeholder
- [ ] "Attendance" shows placeholder
- [ ] Active state highlights correctly

### **UI/UX:**
- [ ] Loading spinners appear during fetch
- [ ] Hover effects work on buttons
- [ ] Transitions are smooth
- [ ] Modals close correctly
- [ ] No visual glitches
- [ ] Responsive on different screen sizes

### **Error Handling:**
- [ ] Invalid scores show error message
- [ ] Network errors handled gracefully
- [ ] Empty states display correctly
- [ ] Console has no errors

### **Security:**
- [ ] Non-teachers redirected away
- [ ] Teachers only see their batches
- [ ] Sign out works correctly

---

## 🎉 SUCCESS CRITERIA

Your implementation is working if:

1. ✅ Teacher can sign in and see /teacher page
2. ✅ Teacher sees their batches with real data
3. ✅ Can create, edit, delete topics
4. ✅ Can update student scores
5. ✅ Navigation works smoothly
6. ✅ No console errors
7. ✅ All modals open and close correctly
8. ✅ Data persists after refresh

---

## 📊 BROWSER CONSOLE CHECKS

### **Expected Console Output:**
```
✅ No red errors
✅ Successful Supabase queries
✅ Component mounting messages (if any)
```

### **To Check Console:**
1. Open browser Dev Tools (F12)
2. Go to "Console" tab
3. Look for errors (red text)
4. Check "Network" tab for failed requests

---

## 🚀 NEXT STEPS AFTER TESTING

Once testing is complete:

1. **Document any bugs found**
2. **Test on different browsers** (Chrome, Firefox, Edge)
3. **Test on mobile devices** (responsive design)
4. **Get user feedback** from real teachers
5. **Deploy to staging environment**

---

## 📞 SUPPORT

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs
3. Verify database records exist
4. Review documentation:
   - `TEACHER_QUICK_START.md`
   - `TEACHER_FEATURE_MAP.md`
   - `TEACHER_IMPLEMENTATION_COMPLETE.md`

---

**Happy Testing!** 🎉

---

**Last Updated:** October 20, 2025  
**Server:** http://localhost:5174/  
**Status:** Ready for Testing

