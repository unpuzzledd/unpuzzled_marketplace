# Academy Creation Files - Quick Reference

## 📁 Files Created

### 1. `create_neeraj_academy.sql` 
**Type**: Automated SQL Script
**Purpose**: Single-click solution to create the academy
**Use When**: You want quick setup with minimal manual work
**Key Features**:
- Automatically finds IDs
- Creates academy
- Assigns student and teacher
- Includes verification queries
- Shows success/error messages

### 2. `create_neeraj_academy_step_by_step.sql`
**Type**: Manual Step-by-Step SQL Script
**Purpose**: Detailed guide for manual execution
**Use When**: 
- You want more control over the process
- The automated script fails
- You want to learn the database structure
**Key Features**:
- 10 clear steps
- SELECT queries to find IDs
- INSERT queries with placeholders
- Detailed comments
- Verification queries

### 3. `NEERAJ_ACADEMY_SETUP_GUIDE.md`
**Type**: Comprehensive Documentation
**Purpose**: Complete guide with troubleshooting
**Includes**:
- Prerequisites checklist
- Two setup options (automated vs manual)
- Verification steps
- Troubleshooting guide
- Success indicators
- Security notes

## 🎯 Quick Start

### For Quick Setup:
1. Open `NEERAJ_ACADEMY_SETUP_GUIDE.md`
2. Follow "Option 1: Automated Script"
3. Run `create_neeraj_academy.sql` in Supabase

### For Detailed Setup:
1. Open `NEERAJ_ACADEMY_SETUP_GUIDE.md`
2. Follow "Option 2: Step-by-Step Manual Approach"
3. Use `create_neeraj_academy_step_by_step.sql`

## 📊 What Gets Created

### Academy:
- **Name**: Neeraj's Chess Academy
- **Phone**: +1-555-0199
- **Status**: approved
- **Skill**: Chess
- **Owner**: You (neeraj.7always@gmail.com)

### Assignments:
- ✅ 1 Student (enrolled with approved status)
- ✅ 1 Teacher (assigned with approved status)
- ✅ Teacher linked to Chess skill

## ⚡ Execute Now

### Supabase SQL Editor Path:
```
Supabase Dashboard → SQL Editor → New Query → Paste Script → Run
```

### Database Connection:
- Project: `rupjlkhrcpgrahrcowpk`
- Ensure you're connected to the correct Supabase project

## 🔍 Verification Commands

After creation, run these in your browser console:

```javascript
// Fetch all your academies
const { data, error } = await supabase
  .from('academies')
  .select('*, location:locations(*)')
  .eq('owner_id', 'YOUR_USER_ID')

console.log('My Academies:', data)
```

Or in Supabase SQL Editor:

```sql
-- View all your academies
SELECT * FROM academies 
WHERE owner_id = (
  SELECT id FROM users 
  WHERE email = 'neeraj.7always@gmail.com'
);
```

## 📋 Prerequisites Checklist

Before running any script, ensure:

- [ ] You have Supabase SQL Editor access
- [ ] Your owner account exists (neeraj.7always@gmail.com)
- [ ] At least 1 active location exists
- [ ] Chess skill exists in skills table
- [ ] At least 1 student exists (role = 'student')
- [ ] At least 1 teacher exists (role = 'teacher')

To check prerequisites, run:

```sql
-- Check your owner account
SELECT id, email, full_name, role FROM users 
WHERE email = 'neeraj.7always@gmail.com';

-- Check locations
SELECT id, name, city, status FROM locations 
WHERE status = 'active' LIMIT 5;

-- Check Chess skill
SELECT id, name, category FROM skills 
WHERE LOWER(name) LIKE '%chess%';

-- Check available students
SELECT id, email, full_name, role FROM users 
WHERE role = 'student' LIMIT 5;

-- Check available teachers
SELECT id, email, full_name, role FROM users 
WHERE role = 'teacher' LIMIT 5;
```

## 🎉 Expected Result

After successful execution:

1. **In Database**: New academy record with all relationships
2. **In Dashboard**: Second academy appears in your academy list
3. **In Management Sections**: Student and teacher are visible
4. **Status**: All records have "approved" status

## 🚨 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| "Owner email not found" | Update email in script line 18 |
| "No active location found" | Create location via Admin Dashboard |
| "Chess skill not found" | Create Chess skill via Admin Dashboard |
| "No available student" | Create student account via signup |
| "No available teacher" | Create teacher account via signup |
| Academy not visible | Refresh page, check status is 'approved' |

---

**Last Updated**: October 19, 2025
**Files Location**: Project root directory
**Ready to Execute**: ✅ Yes

