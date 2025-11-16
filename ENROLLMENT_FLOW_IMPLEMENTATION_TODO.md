# Enrollment Flow Implementation - To-Do List

## Overview
This document tracks the implementation of student and teacher enrollment flows with academy search functionality, including public search on the home page.

---

## Phase 1: Database Schema Updates

### 1.1 Update batch_enrollments table
- [ ] Create SQL migration file: `migrations/add_pending_rejected_to_batch_enrollments.sql`
- [ ] Drop existing status constraint
- [ ] Add new constraint with 'pending' and 'rejected' statuses
- [ ] Test migration in development database
- [ ] Verify constraint allows: 'pending', 'active', 'completed', 'dropped', 'rejected'

**SQL to execute:**
```sql
ALTER TABLE batch_enrollments 
DROP CONSTRAINT IF EXISTS batch_enrollments_status_check;

ALTER TABLE batch_enrollments 
ADD CONSTRAINT batch_enrollments_status_check 
CHECK (status IN ('pending', 'active', 'completed', 'dropped', 'rejected'));
```

---

## Phase 2: TypeScript Type Updates

### 2.1 Update database types
- [ ] Open `src/types/database.ts`
- [ ] Find `BatchEnrollment` interface (around line 112)
- [ ] Update `status` type from `'active' | 'completed' | 'dropped'` to `'pending' | 'active' | 'completed' | 'dropped' | 'rejected'`
- [ ] Save and verify no TypeScript errors

---

## Phase 3: API Layer Updates

### 3.1 Create Public API methods
- [ ] Open `src/lib/adminApi.ts` or create `src/lib/publicApi.ts`
- [ ] Add `searchAcademiesPublic(query: string, filters?: { locationId?: string, skillId?: string })` method
  - [ ] Query only academies with status 'approved' or 'active'
  - [ ] Support name search, location filter, skill filter
  - [ ] Return academy list with basic info
- [ ] Add `getAcademyDetailsPublic(academyId: string)` method
  - [ ] Get academy details (no sensitive data)
  - [ ] Include location, skills, photos
  - [ ] Include available batches (if any)

### 3.2 Update StudentApi
- [ ] Open `src/lib/studentApi.ts`
- [ ] Update `enrollInBatch()` method:
  - [ ] Change default status from `'active'` to `'pending'`
  - [ ] Add validation to check for existing enrollments (any status)
  - [ ] Return appropriate error if already enrolled
- [ ] Add `searchAcademies(query: string, filters?: { locationId?: string, skillId?: string })` method
  - [ ] Reuse logic from public API
- [ ] Add `getAcademyDetails(academyId: string)` method
  - [ ] Get academy with available batches
  - [ ] Include batch details (name, teacher, schedule, slots)
- [ ] Add `getMyEnrollmentRequests(studentId: string)` method
  - [ ] Get all batch enrollments with status 'pending'
  - [ ] Include batch and academy info

### 3.3 Update TeacherApi
- [ ] Open `src/lib/teacherApi.ts`
- [ ] Add `searchAcademies(query: string, filters?: { locationId?: string, skillId?: string })` method
  - [ ] Same as student search
- [ ] Add `getAcademyDetails(academyId: string)` method
  - [ ] Get academy details with skills
- [ ] Add `requestToJoinAcademy(teacherId: string, academyId: string)` method
  - [ ] Create `teacher_assignments` record with status 'pending'
  - [ ] Check for existing assignment first
- [ ] Add `getMyAcademyRequests(teacherId: string)` method
  - [ ] Get all teacher_assignments with status 'pending'
  - [ ] Include academy info

### 3.4 Update AdminApi (for academy owners)
- [ ] Open `src/lib/adminApi.ts`
- [ ] Add `getPendingBatchEnrollments(academyId: string)` method
  - [ ] Get all batch_enrollments with status 'pending' for academy's batches
  - [ ] Include student and batch info
- [ ] Add `approveBatchEnrollment(enrollmentId: string)` method
  - [ ] Update status to 'active'
- [ ] Add `rejectBatchEnrollment(enrollmentId: string)` method
  - [ ] Update status to 'rejected'
- [ ] Verify `getPendingTeacherRequests()` exists (may already be implemented)
  - [ ] If not, add method to get pending teacher_assignments

---

## Phase 4: Public Search (Home Page)

### 4.1 Make Home page search functional
- [ ] Open `src/pages/Home.tsx`
- [ ] Add state for search filters (location, skill)
- [ ] Add `handleSearch()` function
  - [ ] Navigate to `/search` with query params
- [ ] Update "Find Your Class" button to call `handleSearch()`
- [ ] Add location dropdown filter
- [ ] Add skill dropdown filter
- [ ] Load locations and skills on component mount

### 4.2 Create Public Search Results Page
- [ ] Create `src/pages/PublicAcademySearch.tsx`
- [ ] Read query params from URL (search query, location, skill)
- [ ] Call `searchAcademiesPublic()` API
- [ ] Display academy cards in grid
- [ ] Each card shows: name, location, skills, photo
- [ ] Add "View Details" button on each card
- [ ] Handle loading and empty states
- [ ] Add search bar and filters at top

### 4.3 Create Public Academy Detail Modal
- [ ] Create `src/components/public/AcademyDetailModal.tsx`
- [ ] Display academy name, location, photos, skills
- [ ] Show available batches (if any) - read-only
- [ ] Add "Sign Up to Enroll" button
- [ ] Add "Sign In" link for existing users
- [ ] Handle modal open/close
- [ ] Navigate to sign up/sign in on button click

### 4.4 Add route for public search
- [ ] Open `src/App.tsx`
- [ ] Add route: `<Route path="/search" element={<PublicAcademySearch />} />`
- [ ] Import `PublicAcademySearch` component

---

## Phase 5: Student Search & Enrollment

### 5.1 Create Student Academy Search Page
- [ ] Create `src/pages/StudentAcademySearch.tsx`
- [ ] Reuse search UI from public search (or create shared component)
- [ ] Call `StudentApi.searchAcademies()`
- [ ] Display academy cards
- [ ] Click academy → open student academy detail modal
- [ ] Add "Back to Dashboard" button

### 5.2 Create Student Academy Detail Modal
- [ ] Create `src/components/student/AcademyDetailModal.tsx`
- [ ] Display academy details
- [ ] Show available batches grouped by skill
- [ ] Each batch shows: name, skill, teacher, schedule, available slots
- [ ] Add "Request Enrollment" button per batch
- [ ] Handle enrollment request:
  - [ ] Call `StudentApi.enrollInBatch()`
  - [ ] Show success message
  - [ ] Close modal and refresh data
- [ ] Show status if already enrolled (pending/active/rejected)

### 5.3 Update Student Dashboard
- [ ] Open `src/pages/StudentDashboard.tsx`
- [ ] Add "Browse Academies" button in header or sidebar
- [ ] Navigate to `/student/search` on click
- [ ] Update batch display to show enrollment status:
  - [ ] Active: Green badge "Active" - full access
  - [ ] Pending: Yellow badge "Pending" - no access yet
  - [ ] Rejected: Red badge "Rejected" - no access
- [ ] Filter out pending/rejected enrollments from main course list (or show separately)
- [ ] Add section for "Pending Enrollments" if any exist

### 5.4 Update Student Courses Page
- [ ] Open `src/pages/StudentCourses.tsx`
- [ ] Show enrollment status for each batch
- [ ] Disable access for pending/rejected enrollments
- [ ] Show status message: "Enrollment Pending" or "Enrollment Rejected"
- [ ] Only allow viewing details for active enrollments

### 5.5 Update Student Batch Detail Modal
- [ ] Open `src/components/student/StudentBatchDetailModal.tsx`
- [ ] Check enrollment status
- [ ] If pending: Show "Your enrollment request is pending approval"
- [ ] If rejected: Show "Your enrollment was rejected"
- [ ] If active: Show normal batch details
- [ ] Disable topic access for non-active enrollments

### 5.6 Add route for student search
- [ ] Open `src/App.tsx`
- [ ] Add route: `<Route path="/student/search" element={<StudentAcademySearch />} />`
- [ ] Import `StudentAcademySearch` component

---

## Phase 6: Teacher Search & Academy Join

### 6.1 Create Teacher Academy Search Page
- [ ] Create `src/pages/TeacherAcademySearch.tsx`
- [ ] Reuse search UI (same as student)
- [ ] Call `TeacherApi.searchAcademies()`
- [ ] Display academy cards
- [ ] Click academy → open teacher academy detail modal
- [ ] Add "Back to Dashboard" button

### 6.2 Create Teacher Academy Detail Modal
- [ ] Create `src/components/teacher/AcademyDetailModal.tsx`
- [ ] Display academy details
- [ ] Show skills offered
- [ ] Add "Request to Join" button
- [ ] Handle join request:
  - [ ] Call `TeacherApi.requestToJoinAcademy()`
  - [ ] Show success message
  - [ ] Close modal
- [ ] Show status if already requested (pending/approved/rejected)

### 6.3 Update Teacher Dashboard
- [ ] Open `src/pages/TeacherLanding.tsx`
- [ ] Add "Browse Academies" button in header or sidebar
- [ ] Navigate to `/teacher/search` on click
- [ ] Update academy display to show assignment status:
  - [ ] Approved: Green badge "Approved" - full access
  - [ ] Pending: Yellow badge "Pending" - no access yet
  - [ ] Rejected: Red badge "Rejected" - no access
- [ ] Show pending requests in separate section

### 6.4 Add route for teacher search
- [ ] Open `src/App.tsx`
- [ ] Add route: `<Route path="/teacher/search" element={<TeacherAcademySearch />} />`
- [ ] Import `TeacherAcademySearch` component

---

## Phase 7: Academy Owner Approval Interface

### 7.1 Update Academy Dashboard - Overview
- [ ] Open `src/pages/AcademyDashboard.tsx`
- [ ] Add "Pending Batch Enrollments" count in statistics
- [ ] Add "Pending Teacher Requests" count in statistics
- [ ] Make counts clickable → navigate to respective sections

### 7.2 Add Batch Enrollment Requests Section
- [ ] Open `src/pages/AcademyDashboard.tsx`
- [ ] Add "Enrollment Requests" section in Batches tab
- [ ] Call `AdminApi.getPendingBatchEnrollments()` on load
- [ ] Display list of pending enrollments:
  - [ ] Student name, email
  - [ ] Batch name, skill
  - [ ] Request date
  - [ ] Approve / Reject buttons
- [ ] Handle approve: Call `AdminApi.approveBatchEnrollment()`
- [ ] Handle reject: Call `AdminApi.rejectBatchEnrollment()`
- [ ] Refresh list after approve/reject

### 7.3 Create Batch Enrollment Requests Modal (Optional)
- [ ] Create `src/components/BatchEnrollmentRequestsModal.tsx`
- [ ] Display pending enrollments in modal
- [ ] Add bulk approve/reject functionality
- [ ] Show enrollment details
- [ ] Integrate with Academy Dashboard

### 7.4 Update Teacher Management Section
- [ ] Open `src/pages/AcademyDashboard.tsx`
- [ ] In Teachers tab, add "Pending Teacher Requests" section
- [ ] Call `AdminApi.getPendingTeacherRequests()` on load
- [ ] Display list of pending requests:
  - [ ] Teacher name, email
  - [ ] Request date
  - [ ] Approve / Reject buttons
- [ ] Handle approve/reject actions
- [ ] Refresh list after actions

### 7.5 Update Student Management Section
- [ ] Verify existing student management shows enrollment status
- [ ] Ensure batch enrollment status is visible
- [ ] Add ability to approve/reject batch enrollments from student modal

---

## Phase 8: Shared Components (Optional - for code reuse)

### 8.1 Create Shared Academy Search Component
- [ ] Create `src/components/AcademySearch.tsx`
- [ ] Accept props: `userRole`, `onAcademySelect`, `searchFunction`
- [ ] Include search bar, location filter, skill filter
- [ ] Display academy cards grid
- [ ] Handle loading and empty states
- [ ] Use in: PublicAcademySearch, StudentAcademySearch, TeacherAcademySearch

### 8.2 Create Shared Academy Card Component
- [ ] Create `src/components/AcademyCard.tsx`
- [ ] Accept academy data as props
- [ ] Display academy info consistently
- [ ] Include "View Details" button
- [ ] Use across all search pages

---

## Phase 9: Testing & Validation

### 9.1 Test Public Search Flow
- [ ] Test home page search with no filters
- [ ] Test search with location filter
- [ ] Test search with skill filter
- [ ] Test search with name query
- [ ] Test academy detail modal opens correctly
- [ ] Test "Sign Up" button redirects correctly
- [ ] Test "Sign In" link works

### 9.2 Test Student Enrollment Flow
- [ ] Test student can search academies
- [ ] Test student can view academy details
- [ ] Test student can request batch enrollment
- [ ] Test duplicate enrollment request is prevented
- [ ] Test enrollment status shows as "Pending"
- [ ] Test student dashboard shows pending enrollments
- [ ] Test student cannot access batch content when pending
- [ ] Test academy owner can approve enrollment
- [ ] Test student sees status change to "Active"
- [ ] Test student can access batch after approval
- [ ] Test academy owner can reject enrollment
- [ ] Test student sees rejection status

### 9.3 Test Teacher Academy Join Flow
- [ ] Test teacher can search academies
- [ ] Test teacher can view academy details
- [ ] Test teacher can request to join academy
- [ ] Test duplicate request is prevented
- [ ] Test assignment status shows as "Pending"
- [ ] Test teacher dashboard shows pending requests
- [ ] Test academy owner can approve teacher
- [ ] Test teacher sees status change to "Approved"
- [ ] Test academy owner can reject teacher
- [ ] Test teacher sees rejection status

### 9.4 Test Academy Owner Approval Flow
- [ ] Test pending enrollments appear in dashboard
- [ ] Test pending teacher requests appear in dashboard
- [ ] Test approve batch enrollment works
- [ ] Test reject batch enrollment works
- [ ] Test approve teacher request works
- [ ] Test reject teacher request works
- [ ] Test bulk actions (if implemented)
- [ ] Test counts update after approvals

### 9.5 Edge Cases & Validations
- [ ] Test search with no results
- [ ] Test enrollment when batch is full
- [ ] Test enrollment for past batches (should not show)
- [ ] Test enrollment for cancelled batches (should not show)
- [ ] Test only approved/active academies show in search
- [ ] Test only active batches show for enrollment
- [ ] Test error handling for API failures
- [ ] Test loading states display correctly

---

## Phase 10: UI/UX Polish

### 10.1 Status Badges
- [ ] Ensure consistent badge colors:
  - [ ] Pending: Yellow (#FCD34D or similar)
  - [ ] Active/Approved: Green (#10B981 or similar)
  - [ ] Rejected: Red (#EF4444 or similar)
- [ ] Add status badges to all relevant components
- [ ] Ensure badges are accessible (proper contrast)

### 10.2 Loading States
- [ ] Add loading spinners to search pages
- [ ] Add loading states to enrollment requests
- [ ] Add skeleton loaders for academy cards (optional)

### 10.3 Empty States
- [ ] Add "No academies found" message
- [ ] Add "No pending requests" message
- [ ] Add helpful text for empty states

### 10.4 Error Handling
- [ ] Display user-friendly error messages
- [ ] Handle network errors gracefully
- [ ] Show validation errors for forms

### 10.5 Responsive Design
- [ ] Test search pages on mobile
- [ ] Test modals on mobile
- [ ] Ensure filters work on small screens
- [ ] Test academy cards grid on different screen sizes

---

## Phase 11: Documentation

### 11.1 Update API Documentation
- [ ] Document new API methods in `API_REFERENCE.md` (if exists)
- [ ] Document enrollment flow endpoints
- [ ] Document search endpoints

### 11.2 Update User Guides (if applicable)
- [ ] Document student enrollment process
- [ ] Document teacher academy join process
- [ ] Document academy owner approval process

---

## Notes & Considerations

### Database
- ✅ `teacher_assignments` already supports 'pending' status - no changes needed
- ⚠️ Remember to run migration in production after testing

### Security
- Ensure RLS policies allow:
  - Public users can read approved/active academies
  - Students can create pending batch enrollments
  - Teachers can create pending teacher assignments
  - Academy owners can approve/reject their academy's requests

### Performance
- Consider pagination for search results if many academies
- Consider caching location and skill lists
- Optimize queries to avoid N+1 problems

### Future Enhancements (Not in scope)
- Email notifications for approvals/rejections
- Real-time status updates (WebSockets)
- Advanced search filters
- Search result sorting
- Enrollment request comments/notes

---

## Progress Tracking

**Last Updated:** [Date]
**Current Phase:** [Phase Number]
**Completion:** [X%]

**Completed Items:** [Count] / [Total]
**In Progress:** [Count]
**Blocked:** [Count]

---

## Quick Reference

### Key Files to Modify
- `src/types/database.ts` - Type definitions
- `src/lib/studentApi.ts` - Student API methods
- `src/lib/teacherApi.ts` - Teacher API methods
- `src/lib/adminApi.ts` - Academy owner API methods
- `src/pages/Home.tsx` - Home page search
- `src/pages/StudentDashboard.tsx` - Student dashboard
- `src/pages/TeacherLanding.tsx` - Teacher dashboard
- `src/pages/AcademyDashboard.tsx` - Academy dashboard
- `src/App.tsx` - Routes

### Key Files to Create
- `src/pages/PublicAcademySearch.tsx`
- `src/pages/StudentAcademySearch.tsx`
- `src/pages/TeacherAcademySearch.tsx`
- `src/components/public/AcademyDetailModal.tsx`
- `src/components/student/AcademyDetailModal.tsx`
- `src/components/teacher/AcademyDetailModal.tsx`
- `src/components/BatchEnrollmentRequestsModal.tsx` (optional)

### Database Migration
- `migrations/add_pending_rejected_to_batch_enrollments.sql`

