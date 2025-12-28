@echo off
cd /d "c:\Users\neerajv\Documents\Neeraj's Project and Ideas\unpuzzled_mainfolder\Unpuzzled\unpuzzled_Homepagedone_backupv1"

echo Checking git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "feat: Add profile completion form with skills selection for teachers - Added profile completion form for students and teachers - Students: name, date of birth (required), school name (optional), location (optional) - Teachers: name, phone number (required), skills selection (optional) - Added database migrations for new profile fields - Added teacher_skills JSONB field for storing teacher skills - Implemented skills multi-select dropdown using admin-configured skills - Updated TypeScript types and auth hooks - Added redirect logic after profile completion - Mobile responsive design"

echo.
echo Pushing to GitHub...
git push

echo.
echo Done!
pause




