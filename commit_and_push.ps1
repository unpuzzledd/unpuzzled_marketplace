# Git commit and push script
cd "c:\Users\neerajv\Documents\Neeraj's Project and Ideas\unpuzzled_mainfolder\Unpuzzled\unpuzzled_Homepagedone_backupv1"

Write-Host "Checking git status..."
git status

Write-Host "`nAdding all changes..."
git add .

Write-Host "`nCommitting changes..."
git commit -m "feat: Add profile completion form with skills selection for teachers

- Added profile completion form for students and teachers
- Students: name, date of birth (required), school name (optional), location (optional)
- Teachers: name, phone number (required), skills selection (optional)
- Added database migrations for new profile fields
- Added teacher_skills JSONB field for storing teacher skills
- Implemented skills multi-select dropdown using admin-configured skills
- Updated TypeScript types and auth hooks
- Added redirect logic after profile completion
- Mobile responsive design"

Write-Host "`nPushing to GitHub..."
git push

Write-Host "`nDone!"


