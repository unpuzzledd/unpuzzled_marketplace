# Unpuzzled Academy Management System - API Reference

This document provides a comprehensive reference for all available APIs in the Unpuzzled Academy Management System.

## Table of Contents

1. [AdminApi - Academy Management](#adminapi---academy-management)
2. [AdminApi - Location Management](#adminapi---location-management)
3. [AdminApi - Skill Management](#adminapi---skill-management)
4. [AdminApi - Approval Workflows](#adminapi---approval-workflows)
5. [AdminApi - User Management](#adminapi---user-management)
6. [AdminApi - Dashboard Data](#adminapi---dashboard-data)
7. [PhotoApi - Photo Management](#photoapi---photo-management)
8. [Data Types](#data-types)
9. [Usage Examples](#usage-examples)

---

## AdminApi - Academy Management

### `createAcademy(academyData)`
Creates a new academy.

**Parameters:**
```typescript
{
  name: string;
  phone_number: string;
  owner_id: string;
  location_id: string;
}
```

**Returns:** `Promise<ApiResponse<Academy>>`

**Example:**
```typescript
const result = await AdminApi.createAcademy({
  name: "Chess Academy",
  phone_number: "+1234567890",
  owner_id: "user-uuid",
  location_id: "location-uuid"
});
```

### `getAcademyByOwnerId(ownerId)`
Gets academy details by owner ID for academy dashboard.

**Parameters:**
```typescript
ownerId: string
```

**Returns:** `Promise<ApiResponse<Academy & { location: Location; owner: any }>>`

**Example:**
```typescript
const result = await AdminApi.getAcademyByOwnerId("user-uuid");
```

### `getAcademyStatistics(academyId)`
Gets academy statistics including student counts, teacher counts, etc.

**Parameters:**
```typescript
academyId: string
```

**Returns:** `Promise<ApiResponse<{
  totalStudents: number;
  pendingStudents: number;
  activeTeachers: number;
  totalBatches: number;
  totalPhotos: number;
}>>`

**Example:**
```typescript
const stats = await AdminApi.getAcademyStatistics("academy-uuid");
console.log(stats.data.totalStudents); // 125
```

### `getAcademySkills(academyId)`
Gets approved skills/activities for an academy.

**Parameters:**
```typescript
academyId: string
```

**Returns:** `Promise<ApiResponse<Skill[]>>`

**Example:**
```typescript
const skills = await AdminApi.getAcademySkills("academy-uuid");
// Returns array of approved skills for the academy
```

### `getPendingEnrollments(academyId)`
Gets pending student enrollments for an academy.

**Parameters:**
```typescript
academyId: string
```

**Returns:** `Promise<ApiResponse<any[]>>`

**Example:**
```typescript
const pending = await AdminApi.getPendingEnrollments("academy-uuid");
// Returns array of pending student enrollments
```

---

### `getAcademies(page?, pageSize?, status?)`
Gets all academies with pagination and optional status filtering.

**Parameters:**
- `page: number = 1` - Page number
- `pageSize: number = 20` - Items per page
- `status?: string` - Filter by status ('pending', 'active', 'suspended')

**Returns:** `Promise<PaginatedResponse<Academy>>`

**Example:**
```typescript
// Get all academies
const allAcademies = await AdminApi.getAcademies();

// Get pending academies only
const pendingAcademies = await AdminApi.getAcademies(1, 20, 'pending');

// Get academy for specific owner (for academy dashboard)
const response = await AdminApi.getAcademies(1, 1);
const userAcademy = response.data.find(a => a.owner_id === user.id);
```

---

### `updateAcademyStatus(academyId, status)`
Updates academy status (admin only).

**Parameters:**
- `academyId: string` - Academy ID
- `status: 'pending' | 'active' | 'suspended'` - New status

**Returns:** `Promise<ApiResponse<Academy>>`

**Example:**
```typescript
const result = await AdminApi.updateAcademyStatus('academy-uuid', 'active');
```

---

### `updateAcademyName(academyId, name)`
Updates academy name (admin only).

**Parameters:**
- `academyId: string` - Academy ID
- `name: string` - New academy name

**Returns:** `Promise<ApiResponse<Academy>>`

**Example:**
```typescript
const result = await AdminApi.updateAcademyName('academy-uuid', 'New Academy Name');
```

---

### `deleteAcademy(academyId)`
Deletes an academy.

**Parameters:**
- `academyId: string` - Academy ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.deleteAcademy('academy-uuid');
```

---

## AdminApi - Location Management

### `createLocation(locationData)`
Creates a new location.

**Parameters:**
```typescript
{
  name: string;
  city: string;
  state: string;
  country?: string; // Defaults to 'India'
}
```

**Returns:** `Promise<ApiResponse<Location>>`

**Example:**
```typescript
const result = await AdminApi.createLocation({
  name: "Downtown Center",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India"
});
```

---

### `getLocations()`
Gets all active locations.

**Returns:** `Promise<Location[]>`

**Example:**
```typescript
const locations = await AdminApi.getLocations();
```

---

### `updateLocation(locationId, updates)`
Updates location information.

**Parameters:**
- `locationId: string` - Location ID
- `updates: Partial<Location>` - Fields to update

**Returns:** `Promise<ApiResponse<Location>>`

**Example:**
```typescript
const result = await AdminApi.updateLocation('location-uuid', {
  name: 'Updated Location Name',
  city: 'New City'
});
```

---

### `deleteLocation(locationId)`
Deletes a location (only if not used by any academy).

**Parameters:**
- `locationId: string` - Location ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.deleteLocation('location-uuid');
```

---

## AdminApi - Skill Management

### `createSkill(skillData)`
Creates a new skill.

**Parameters:**
```typescript
{
  name: string;
  description?: string;
}
```

**Returns:** `Promise<ApiResponse<Skill>>`

**Example:**
```typescript
const result = await AdminApi.createSkill({
  name: "Chess",
  description: "Strategic board game"
});
```

---

### `getSkills()`
Gets all active skills.

**Returns:** `Promise<Skill[]>`

**Example:**
```typescript
const skills = await AdminApi.getSkills();
```

---

### `updateSkill(skillId, updates)`
Updates skill information.

**Parameters:**
- `skillId: string` - Skill ID
- `updates: Partial<Skill>` - Fields to update

**Returns:** `Promise<ApiResponse<Skill>>`

**Example:**
```typescript
const result = await AdminApi.updateSkill('skill-uuid', {
  name: 'Advanced Chess',
  description: 'Advanced strategic board game'
});
```

---

### `deleteSkill(skillId)`
Deletes a skill (only if not used by any academy).

**Parameters:**
- `skillId: string` - Skill ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.deleteSkill('skill-uuid');
```

---

## AdminApi - Approval Workflows

### `getPendingPhotos()`
Gets all pending academy photos for admin approval.

**Returns:** `Promise<AcademyPhoto[]>`

**Example:**
```typescript
const pendingPhotos = await AdminApi.getPendingPhotos();
```

---

### `getPendingSkills()`
Gets all pending academy skills for admin approval.

**Returns:** `Promise<AcademySkill[]>`

**Example:**
```typescript
const pendingSkills = await AdminApi.getPendingSkills();
```

---

### `approvePhoto(photoId)`
Approves an academy photo.

**Parameters:**
- `photoId: string` - Photo ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.approvePhoto('photo-uuid');
```

---

### `rejectPhoto(photoId)`
Rejects an academy photo.

**Parameters:**
- `photoId: string` - Photo ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.rejectPhoto('photo-uuid');
```

---

### `approveSkill(academySkillId)`
Approves an academy skill.

**Parameters:**
- `academySkillId: string` - Academy Skill ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.approveSkill('academy-skill-uuid');
```

---

### `rejectSkill(academySkillId)`
Rejects an academy skill.

**Parameters:**
- `academySkillId: string` - Academy Skill ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.rejectSkill('academy-skill-uuid');
```

---

## AdminApi - User Management

### `createAdmin(adminData)`
Creates a new admin (Super Admin only).

**Parameters:**
```typescript
{
  user_id: string;
  created_by: string;
}
```

**Returns:** `Promise<ApiResponse<Admin>>`

**Example:**
```typescript
const result = await AdminApi.createAdmin({
  user_id: 'user-uuid',
  created_by: 'super-admin-uuid'
});
```

---

### `getAdmins()`
Gets all admins.

**Returns:** `Promise<Admin[]>`

**Example:**
```typescript
const admins = await AdminApi.getAdmins();
```

---

### `updateAdminStatus(adminId, status)`
Updates admin status.

**Parameters:**
- `adminId: string` - Admin ID
- `status: 'active' | 'suspended'` - New status

**Returns:** `Promise<ApiResponse<Admin>>`

**Example:**
```typescript
const result = await AdminApi.updateAdminStatus('admin-uuid', 'suspended');
```

---

### `deleteAdmin(adminId)`
Deletes an admin.

**Parameters:**
- `adminId: string` - Admin ID

**Returns:** `Promise<ApiResponse<boolean>>`

**Example:**
```typescript
const result = await AdminApi.deleteAdmin('admin-uuid');
```

---

## AdminApi - Dashboard Data

### `getDashboardStats()`
Gets comprehensive dashboard statistics.

**Returns:** `Promise<DashboardStats>`

**DashboardStats Type:**
```typescript
{
  totalAcademies: number;
  pendingAcademies: number;
  activeAcademies: number;
  suspendedAcademies: number;
  totalPhotos: number;
  pendingPhotos: number;
  totalSkills: number;
  pendingSkills: number;
  totalAdmins: number;
  activeAdmins: number;
}
```

**Example:**
```typescript
const stats = await AdminApi.getDashboardStats();
console.log(`Total Academies: ${stats.totalAcademies}`);
console.log(`Pending Photos: ${stats.pendingPhotos}`);
```

---

### `getRecentActivities(limit?)`
Gets recent activities for admin dashboard.

**Parameters:**
- `limit: number = 10` - Number of activities to return

**Returns:** `Promise<Activity[]>`

**Activity Type:**
```typescript
{
  type: 'academy_created' | 'photo_uploaded';
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}
```

**Example:**
```typescript
const activities = await AdminApi.getRecentActivities(20);
```

---

## PhotoApi - Photo Management

### `uploadPhoto(academyId, file, displayOrder, onProgress?)`
Uploads a photo for an academy.

**Parameters:**
- `academyId: string` - Academy ID
- `file: File` - Photo file
- `displayOrder: number` - Display order (1-4)
- `onProgress?: (progress: PhotoUploadProgress) => void` - Progress callback

**Returns:** `Promise<PhotoUploadResult>`

**PhotoUploadResult Type:**
```typescript
{
  success: boolean;
  photo_url?: string;
  error?: string;
}
```

**Example:**
```typescript
const result = await PhotoApi.uploadPhoto(
  'academy-uuid',
  file,
  1,
  (progress) => console.log(`Upload: ${progress.progress}%`)
);
```

---

### `getAcademyPhotos(academyId)`
Gets all photos for an academy.

**Parameters:**
- `academyId: string` - Academy ID

**Returns:** `Promise<AcademyPhoto[]>`

**Example:**
```typescript
const photos = await PhotoApi.getAcademyPhotos('academy-uuid');
```

---

### `updatePhotoStatus(photoId, status)`
Updates photo status (admin approval).

**Parameters:**
- `photoId: string` - Photo ID
- `status: 'approved' | 'rejected'` - New status

**Returns:** `Promise<{ success: boolean; error?: string }>`

**Example:**
```typescript
const result = await PhotoApi.updatePhotoStatus('photo-uuid', 'approved');
```

---

### `deletePhoto(photoId)`
Deletes a photo (removes from storage and database).

**Parameters:**
- `photoId: string` - Photo ID

**Returns:** `Promise<{ success: boolean; error?: string }>`

**Example:**
```typescript
const result = await PhotoApi.deletePhoto('photo-uuid');
```

---

### `updatePhotoOrder(photoId, displayOrder)`
Updates photo display order.

**Parameters:**
- `photoId: string` - Photo ID
- `displayOrder: number` - New display order

**Returns:** `Promise<{ success: boolean; error?: string }>`

**Example:**
```typescript
const result = await PhotoApi.updatePhotoOrder('photo-uuid', 2);
```

---

### `getPendingPhotos()`
Gets all pending photos for admin approval.

**Returns:** `Promise<AcademyPhoto[]>`

**Example:**
```typescript
const pendingPhotos = await PhotoApi.getPendingPhotos();
```

---

### `getUploadUrl(academyId, fileName)`
Gets a signed upload URL for direct file upload.

**Parameters:**
- `academyId: string` - Academy ID
- `fileName: string` - File name

**Returns:** `Promise<string | null>`

**Example:**
```typescript
const uploadUrl = await PhotoApi.getUploadUrl('academy-uuid', 'photo.jpg');
```

---

## Data Types

### Core Entity Types

```typescript
interface Academy {
  id: string;
  name: string;
  phone_number: string;
  owner_id: string;
  location_id: string | null;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  // Joined data
  location?: Location;
  owner?: User;
  photos?: AcademyPhoto[];
  skills?: AcademySkill[];
}

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Skill {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AcademyPhoto {
  id: string;
  academy_id: string;
  photo_url: string;
  display_order: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AcademySkill {
  id: string;
  academy_id: string;
  skill_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined data
  skill?: Skill;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'academy_owner' | 'admin' | 'super_admin' | null;
  phone_number: string | null;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PhotoUploadResult {
  success: boolean;
  photo_url?: string;
  error?: string;
}

interface PhotoUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}
```

---

## Usage Examples

### Academy Dashboard Implementation

```typescript
// Get academy data for logged-in owner
const loadAcademyData = async (userId: string) => {
  try {
    const response = await AdminApi.getAcademies(1, 1);
    const userAcademy = response.data.find(a => a.owner_id === userId);
    return userAcademy;
  } catch (error) {
    console.error('Failed to load academy data:', error);
    return null;
  }
};

// Get academy photos
const loadAcademyPhotos = async (academyId: string) => {
  try {
    const photos = await PhotoApi.getAcademyPhotos(academyId);
    return photos;
  } catch (error) {
    console.error('Failed to load photos:', error);
    return [];
  }
};
```

### Admin Dashboard Implementation

```typescript
// Load admin dashboard data
const loadDashboardData = async () => {
  try {
    const [stats, activities, pendingPhotos, pendingSkills] = await Promise.all([
      AdminApi.getDashboardStats(),
      AdminApi.getRecentActivities(10),
      AdminApi.getPendingPhotos(),
      AdminApi.getPendingSkills()
    ]);
    
    return { stats, activities, pendingPhotos, pendingSkills };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return null;
  }
};
```

### Photo Management Implementation

```typescript
// Upload photo with progress tracking
const handlePhotoUpload = async (academyId: string, file: File) => {
  const result = await PhotoApi.uploadPhoto(
    academyId,
    file,
    1, // display order
    (progress) => {
      console.log(`Upload progress: ${progress.progress}%`);
      if (progress.status === 'completed') {
        console.log('Upload completed!');
      }
    }
  );
  
  if (result.success) {
    console.log('Photo uploaded:', result.photo_url);
  } else {
    console.error('Upload failed:', result.error);
  }
};
```

---

## Error Handling

All API functions return consistent error responses:

```typescript
// Check for errors
const result = await AdminApi.createAcademy(academyData);
if (result.error) {
  console.error('API Error:', result.error);
  // Handle error
} else {
  console.log('Success:', result.data);
  // Use data
}
```

---

## File Upload Constraints

### Photo Upload Limits
- **Maximum photos per academy:** 4
- **Maximum file size:** 5MB
- **Allowed file types:** JPEG, PNG, WebP
- **Storage bucket:** `academy-photos`

### File Naming Convention
- Format: `{academyId}/photo_{displayOrder}_{timestamp}.{extension}`
- Example: `academy-123/photo_1_1703123456789.jpg`

---

## Authentication & Authorization

All API calls require proper authentication through Supabase. The system uses role-based access control:

- **Super Admin:** Full access to all APIs
- **Admin:** Access to academy, location, skill, and approval APIs
- **Academy Owner:** Access to their own academy data and photo management
- **Teacher/Student:** Limited access (not covered in this API reference)

---

## Database Schema Reference

The APIs interact with the following database tables:
- `academies` - Academy information
- `locations` - Location data
- `skills` - Available skills
- `academy_photos` - Academy photo records
- `academy_skills` - Academy-skill relationships
- `admins` - Admin user records
- `users` - User accounts

---

*This API reference is generated from the current codebase and should be updated as new APIs are added or existing ones are modified.*
