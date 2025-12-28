# Git Commands to Push Changes to GitHub

## Step-by-Step Commands

### 1. Navigate to your project directory
```powershell
cd "C:\Users\neerajv\Documents\Neeraj's Project and Ideas\unpuzzled_mainfolder\Unpuzzled\unpuzzled_Homepagedone_backupv1"
```

### 2. Check current status
```powershell
git status
```

### 3. Add all changed files
```powershell
git add .
```

Or add specific files:
```powershell
git add src/lib/studentApi.ts
git add src/components/student/StudentAcademyDetailModal.tsx
git add src/components/StudentManagementModal.tsx
git add src/pages/AcademyDashboard.tsx
git add migrations/fix_student_enrollments_rls.sql
```

### 4. Commit the changes
```powershell
git commit -m "Implement student academy enrollment flow - students request academy enrollment first, then academy assigns batches"
```

### 5. Push to GitHub
```powershell
git push origin master
```

Or if your default branch is `main`:
```powershell
git push origin main
```

## Complete Command Sequence

```powershell
# Navigate to project
cd "C:\Users\neerajv\Documents\Neeraj's Project and Ideas\unpuzzled_mainfolder\Unpuzzled\unpuzzled_Homepagedone_backupv1"

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Implement student academy enrollment flow - students request academy enrollment first, then academy assigns batches"

# Push
git push origin master
```

## If you need to check your remote repository

```powershell
git remote -v
```

## If you haven't set up the remote yet

```powershell
git remote add origin <your-github-repo-url>
git push -u origin master
```

## Summary of Changes Being Pushed

1. **StudentApi.ts** - Added academy enrollment methods
2. **StudentAcademyDetailModal.tsx** - Changed to academy-level enrollment flow
3. **StudentManagementModal.tsx** - Added student profile details display
4. **AcademyDashboard.tsx** - Updated to show academy enrollment requests
5. **fix_student_enrollments_rls.sql** - Added RLS policies for student enrollments



