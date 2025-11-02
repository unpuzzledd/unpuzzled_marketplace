# Complete Academy Management System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Documentation](#api-documentation)
4. [Component Documentation](#component-documentation)
5. [Admin System](#admin-system)
6. [Photo Management](#photo-management)
7. [Usage Examples](#usage-examples)
8. [Security & Permissions](#security--permissions)
9. [Installation & Setup](#installation--setup)
10. [Troubleshooting](#troubleshooting)

## System Overview

The Academy Management System is a comprehensive solution built with React, TypeScript, and Supabase. It provides complete functionality for managing academies, students, teachers, batches, and photos with admin approval workflows.

### Key Features
- ✅ **Complete Academy Management** - Create, update, delete academies
- ✅ **Photo Management** - Upload, approve, and manage academy photos
- ✅ **Admin Dashboard** - Comprehensive admin interface
- ✅ **Approval Workflows** - Photo and skill approval system
- ✅ **User Management** - Role-based access control
- ✅ **Location & Skill Management** - Complete catalog management
- ✅ **Real-time Updates** - Live data refresh and notifications
- ✅ **Responsive Design** - Works on all devices

## Database Schema

### Core Tables

#### 1. Users Table (Enhanced)
```sql
-- Extended users table with additional fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'active';
```

#### 2. Locations Table
```sql
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Skills Table
```sql
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Academies Table
```sql
CREATE TABLE academies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Academy Photos Table
```sql
CREATE TABLE academy_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. Academy Skills Table
```sql
CREATE TABLE academy_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(academy_id, skill_id)
);
```

#### 7. Teacher Assignments Table
```sql
CREATE TABLE teacher_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, academy_id)
);
```

#### 8. Teacher Skills Table
```sql
CREATE TABLE teacher_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, academy_id, skill_id)
);
```

#### 9. Student Enrollments Table
```sql
CREATE TABLE student_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, academy_id)
);
```

#### 10. Batches Table
```sql
CREATE TABLE batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_students INTEGER DEFAULT 20,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 11. Batch Enrollments Table
```sql
CREATE TABLE batch_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
  UNIQUE(student_id, batch_id)
);
```

#### 12. Topics Table
```sql
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 13. Student Scores Table
```sql
CREATE TABLE student_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 9999),
  level TEXT DEFAULT 'beginner',
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, academy_id, skill_id)
);
```

#### 14. Admins Table
```sql
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Setup
```sql
-- Create storage bucket for academy photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('academy-photos', 'academy-photos', true)
ON CONFLICT (id) DO NOTHING;
```

## API Documentation

### PhotoApi Class

#### Constructor
```typescript
import { PhotoApi } from '../lib/photoApi';
```

#### Methods

##### uploadPhoto()
Upload a photo for an academy with progress tracking.

```typescript
static async uploadPhoto(
  academyId: string,
  file: File,
  displayOrder: number,
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<PhotoUploadResult>
```

**Example:**
```typescript
const result = await PhotoApi.uploadPhoto(
  'academy-uuid-123',
  file,
  1,
  (progress) => {
    console.log(`Upload progress: ${progress.progress}%`);
  }
);
```

##### getAcademyPhotos()
Get all photos for an academy.

```typescript
static async getAcademyPhotos(academyId: string): Promise<AcademyPhoto[]>
```

##### updatePhotoStatus()
Update photo status (admin approval).

```typescript
static async updatePhotoStatus(
  photoId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }>
```

##### deletePhoto()
Delete a photo permanently.

```typescript
static async deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }>
```

### AdminApi Class

#### Academy Management
```typescript
// Create a new academy
AdminApi.createAcademy(academyData)

// Delete an academy
AdminApi.deleteAcademy(academyId)

// Update academy status
AdminApi.updateAcademyStatus(academyId, status)

// Update academy name (admin only)
AdminApi.updateAcademyName(academyId, name)

// Get all academies with pagination
AdminApi.getAcademies(page, pageSize, status)
```

#### Location Management
```typescript
// Create a new location
AdminApi.createLocation(locationData)

// Update location
AdminApi.updateLocation(locationId, updates)

// Delete location
AdminApi.deleteLocation(locationId)

// Get all locations
AdminApi.getLocations()
```

#### Skill Management
```typescript
// Create a new skill
AdminApi.createSkill(skillData)

// Update skill
AdminApi.updateSkill(skillId, updates)

// Delete skill
AdminApi.deleteSkill(skillId)

// Get all skills
AdminApi.getSkills()
```

#### Approval Workflows
```typescript
// Get pending items
AdminApi.getPendingPhotos()
AdminApi.getPendingSkills()

// Approve items
AdminApi.approvePhoto(photoId)
AdminApi.approveSkill(academySkillId)

// Reject items
AdminApi.rejectPhoto(photoId)
AdminApi.rejectSkill(academySkillId)
```

#### User Management (Super Admin)
```typescript
// Create a new admin
AdminApi.createAdmin(adminData)

// Update admin status
AdminApi.updateAdminStatus(adminId, status)

// Delete admin
AdminApi.deleteAdmin(adminId)

// Get all admins
AdminApi.getAdmins()
```

#### Dashboard Data
```typescript
// Get dashboard statistics
AdminApi.getDashboardStats()

// Get recent activities
AdminApi.getRecentActivities(limit)
```

## Component Documentation

### Photo Management Components

#### 1. PhotoUpload Component
Drag & drop photo upload component with progress tracking.

```typescript
interface PhotoUploadProps {
  academyId: string;
  onUploadComplete: (photoUrl: string) => void;
  onUploadError: (error: string) => void;
  maxPhotos?: number;
  existingPhotos?: number;
  disabled?: boolean;
}
```

**Example:**
```tsx
<PhotoUpload
  academyId="academy-uuid-123"
  onUploadComplete={(url) => console.log('Uploaded:', url)}
  onUploadError={(error) => console.error('Error:', error)}
  maxPhotos={4}
  existingPhotos={2}
/>
```

#### 2. PhotoGallery Component
Display academy photos with management features.

```typescript
interface PhotoGalleryProps {
  photos: AcademyPhoto[];
  onDeletePhoto?: (photoId: string) => void;
  onReorderPhotos?: (photoId: string, newOrder: number) => void;
  canEdit?: boolean;
  showStatus?: boolean;
}
```

#### 3. AdminPhotoApproval Component
Admin interface for photo approval workflow.

```typescript
interface AdminPhotoApprovalProps {
  onApprovalComplete?: () => void;
}
```

#### 4. AcademyPhotoManager Component
Complete photo management system combining upload and gallery.

```typescript
interface AcademyPhotoManagerProps {
  academyId: string;
  canEdit?: boolean;
  showStatus?: boolean;
  onPhotosChange?: (photos: AcademyPhoto[]) => void;
}
```

#### 5. AcademyPhotoSection Component
Ready-to-use dashboard component for academy photos.

```typescript
interface AcademyPhotoSectionProps {
  academyId: string;
  canEdit?: boolean;
}
```

### Admin Management Components

#### 1. AdminDashboard Component
Main admin dashboard with all management capabilities.

```typescript
interface AdminDashboardProps {
  onDataUpdate?: () => void;
}
```

#### 2. AdminAcademyManagement Component
Academy CRUD operations with pagination and filtering.

```typescript
interface AdminAcademyManagementProps {
  onAcademyUpdate?: () => void;
}
```

#### 3. AdminLocationManagement Component
Location management with full CRUD operations.

```typescript
interface AdminLocationManagementProps {
  onLocationUpdate?: () => void;
}
```

#### 4. AdminSkillManagement Component
Skill management with full CRUD operations.

```typescript
interface AdminSkillManagementProps {
  onSkillUpdate?: () => void;
}
```

#### 5. AdminApprovalWorkflows Component
Approval workflows for photos and skills.

```typescript
interface AdminApprovalWorkflowsProps {
  onApprovalComplete?: () => void;
}
```

## Admin System

### Admin Capabilities

#### 1. Academy Management
- ✅ **Create Academy** - Admin can create new academies
- ✅ **Delete Academy** - Admin can delete academies
- ✅ **Update Academy Status** - Pending/Active/Suspend
- ✅ **Change Academy Name** - Admin-only privilege
- ✅ **View All Academies** - With pagination and filtering

#### 2. Location Management
- ✅ **Create Location** - Add new locations for academies
- ✅ **Update Location** - Edit location details
- ✅ **Delete Location** - Remove unused locations
- ✅ **View All Locations** - Complete location list

#### 3. Skill Management
- ✅ **Create Skill** - Add new skills (Chess, Art, etc.)
- ✅ **Update Skill** - Edit skill details and descriptions
- ✅ **Delete Skill** - Remove unused skills
- ✅ **View All Skills** - Complete skill catalog

#### 4. Approval Workflows
- ✅ **Photo Approvals** - Approve/reject academy photos
- ✅ **Skill Approvals** - Approve/reject academy skill requests
- ✅ **Batch Operations** - Handle multiple approvals
- ✅ **Status Tracking** - Monitor approval progress

#### 5. User Management (Super Admin)
- ✅ **Create Admin** - Super admin can create new admins
- ✅ **Update Admin Status** - Activate/suspend admins
- ✅ **Delete Admin** - Remove admin access
- ✅ **View All Admins** - Complete admin list

#### 6. Dashboard & Analytics
- ✅ **Overview Dashboard** - Key metrics and statistics
- ✅ **Recent Activities** - Latest academy and photo activities
- ✅ **Status Counts** - Pending, active, suspended counts
- ✅ **Real-time Data** - Live updates and refresh

### Admin Workflow Examples

#### Academy Creation Workflow
```typescript
// Admin creates a new academy
const academyData = {
  name: "Chess Masters Academy",
  phone_number: "+91-9876543210",
  owner_id: "user-uuid-123",
  location_id: "location-uuid-456"
};

const result = await AdminApi.createAcademy(academyData);
// Academy is created with 'pending' status
```

#### Academy Approval Workflow
```typescript
// Admin activates an academy
await AdminApi.updateAcademyStatus("academy-uuid-123", "active");
// Academy can now operate and accept students
```

#### Photo Approval Workflow
```typescript
// Get pending photos
const pendingPhotos = await AdminApi.getPendingPhotos();

// Approve a photo
await AdminApi.approvePhoto("photo-uuid-123");
// Photo becomes visible to public
```

## Photo Management

### Photo Storage System

#### File Structure in Supabase Storage
```
academy-photos/
├── {academy-id}/
│   ├── photo_1_1234567890.jpg
│   ├── photo_2_1234567891.jpg
│   ├── photo_3_1234567892.jpg
│   └── photo_4_1234567893.jpg
```

#### File Naming Convention
- Format: `photo_{display_order}_{timestamp}.{extension}`
- Example: `photo_1_1694789123456.jpg`
- Benefits: Unique names, ordered display, timestamp tracking

#### CDN Integration
- **Provider**: Supabase CDN
- **Benefits**: Global distribution, fast loading, automatic optimization
- **URL Format**: `https://{project}.supabase.co/storage/v1/object/public/academy-photos/{path}`

### Photo Management Features

#### For Academy Owners
- ✅ Upload up to 4 photos per academy
- ✅ Drag & drop interface with progress tracking
- ✅ View photo status (pending/approved/rejected)
- ✅ Delete their own photos
- ✅ Reorder photos by dragging
- ✅ Real-time status updates

#### For Admins
- ✅ View all pending photos
- ✅ Approve/reject photos with one click
- ✅ Delete any photo permanently
- ✅ Full-size photo preview
- ✅ Batch approval workflow
- ✅ Real-time updates

#### For Students/Teachers
- ✅ View approved photos only
- ✅ Full-size photo preview
- ✅ Responsive design for all devices

### Photo Requirements
- **Formats**: JPEG, PNG, WebP
- **Size**: Max 5MB per file
- **Limit**: 4 photos per academy
- **Storage**: Supabase Storage with CDN

## Usage Examples

### Basic Academy Dashboard Integration
```tsx
import { AcademyPhotoSection } from './components/AcademyPhotoSection';

<AcademyPhotoSection
  academyId={academy.id}
  canEdit={true}
/>
```

### Admin Dashboard Integration
```tsx
import { AdminDashboard } from './components/AdminDashboard';

<AdminDashboard
  onDataUpdate={() => console.log('Data updated')}
/>
```

### Individual Management Components
```tsx
// Academy management only
<AdminAcademyManagement onAcademyUpdate={handleUpdate} />

// Location management only
<AdminLocationManagement onLocationUpdate={handleUpdate} />

// Skill management only
<AdminSkillManagement onSkillUpdate={handleUpdate} />

// Approval workflows only
<AdminApprovalWorkflows onApprovalComplete={handleUpdate} />
```

### Custom Photo Management
```tsx
import React, { useState, useEffect } from 'react';
import { PhotoApi } from './lib/photoApi';
import { AcademyPhoto } from './types/database';

const CustomPhotoManager = ({ academyId }: { academyId: string }) => {
  const [photos, setPhotos] = useState<AcademyPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, [academyId]);

  const loadPhotos = async () => {
    try {
      const academyPhotos = await PhotoApi.getAcademyPhotos(academyId);
      setPhotos(academyPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const result = await PhotoApi.uploadPhoto(academyId, file, photos.length + 1);
    if (result.success) {
      loadPhotos(); // Reload photos
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Academy Photos ({photos.length}/4)</h3>
      {/* Your custom UI here */}
    </div>
  );
};
```

## Security & Permissions

### Row Level Security (RLS)

#### Policy Categories

1. **User Policies**
   ```sql
   -- Users can view/update their own profile
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);
   ```

2. **Academy Policies**
   ```sql
   -- Academy owners can manage their academies
   CREATE POLICY "Academy owners can manage their academies" ON academies
     FOR ALL USING (owner_id = auth.uid() OR is_admin(auth.uid()));
   ```

3. **Photo Policies**
   ```sql
   -- Academy owners can manage their photos
   CREATE POLICY "Academy owners can manage their photos" ON academy_photos
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM academies 
         WHERE id = academy_photos.academy_id 
         AND (owner_id = auth.uid() OR is_admin(auth.uid()))
       )
     );
   ```

4. **Storage Policies**
   ```sql
   -- Academy owners can upload to their folder
   CREATE POLICY "Academy owners can upload photos" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'academy-photos' AND
       EXISTS (
         SELECT 1 FROM academies 
         WHERE id::text = (storage.foldername(name))[1]
         AND owner_id = auth.uid()
       )
     );
   ```

### Access Control Matrix

| Role | Upload Photos | View Photos | Approve Photos | Delete Photos | Manage Academy |
|------|---------------|-------------|----------------|---------------|----------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Academy Owner | ✅ (own) | ✅ (own) | ❌ | ✅ (own) | ✅ (own) |
| Teacher | ❌ | ✅ (approved) | ❌ | ❌ | ❌ |
| Student | ❌ | ✅ (approved) | ❌ | ❌ | ❌ |

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: RLS policies for data access
- **Input Validation**: Client and server-side validation

### File Security
- **File Type Validation**: Strict MIME type checking
- **File Size Limits**: 5MB maximum per file
- **Virus Scanning**: Supabase handles automatically
- **Access Control**: RLS policies for storage

## Installation & Setup

### 1. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Run all the migration scripts from the database schema section
-- This includes creating tables, policies, and sample data
```

### 2. Environment Variables

Ensure your `.env.local` file contains:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Dependencies

The system uses these dependencies (already in your project):

```json
{
  "@supabase/supabase-js": "^2.x.x",
  "@heroicons/react": "^2.x.x",
  "react": "^18.x.x",
  "typescript": "^5.x.x"
}
```

### 4. Component Import

```tsx
import { AcademyPhotoSection } from './components/AcademyPhotoSection';
import { AdminDashboard } from './components/AdminDashboard';
```

## Troubleshooting

### Common Issues

#### 1. Upload Fails
**Problem**: Photos fail to upload
**Solutions**:
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP only)
- Ensure academy has less than 4 photos
- Check Supabase Storage bucket exists

#### 2. Photos Not Displaying
**Problem**: Photos don't show in gallery
**Solutions**:
- Check photo status (only approved photos show publicly)
- Verify photo URLs are accessible
- Check RLS policies
- Ensure academy ID is correct

#### 3. Permission Denied
**Problem**: Users can't upload/manage photos
**Solutions**:
- Verify user role and permissions
- Check RLS policies are correctly applied
- Ensure user is academy owner for that academy
- Verify authentication is working

#### 4. Storage Errors
**Problem**: Storage operations fail
**Solutions**:
- Check Supabase Storage bucket configuration
- Verify storage policies
- Check file path format
- Ensure bucket is public if needed

#### 5. Admin Functions Not Working
**Problem**: Admin operations fail
**Solutions**:
- Verify user has admin role
- Check RLS policies for admin access
- Ensure proper authentication
- Verify database permissions

### Debug Mode

Enable debug logging:

```typescript
// In photoApi.ts or adminApi.ts, add console.log statements
console.log('Uploading photo:', { academyId, fileName, fileSize });
console.log('Upload result:', result);
```

### Performance Issues

#### Database Optimization
```sql
-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'academy_photos';

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_academy_photos_academy ON academy_photos(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_photos_status ON academy_photos(status);
```

#### Storage Optimization
- Use appropriate image compression
- Implement lazy loading for large galleries
- Consider CDN caching strategies
- Monitor storage usage and costs

## File Structure

```
src/
├── types/
│   ├── auth.ts                 # User authentication types
│   └── database.ts             # Database entity types
├── lib/
│   ├── supabase.ts            # Supabase client configuration
│   ├── photoApi.ts            # Photo management API
│   └── adminApi.ts            # Admin management API
├── components/
│   ├── PhotoUpload.tsx        # Drag & drop upload component
│   ├── PhotoGallery.tsx       # Photo display component
│   ├── AdminPhotoApproval.tsx # Admin approval interface
│   ├── AcademyPhotoManager.tsx # Complete photo management
│   ├── AcademyPhotoSection.tsx # Dashboard-ready component
│   ├── AdminDashboard.tsx     # Main admin dashboard
│   ├── AdminAcademyManagement.tsx # Academy CRUD operations
│   ├── AdminLocationManagement.tsx # Location management
│   ├── AdminSkillManagement.tsx # Skill management
│   └── AdminApprovalWorkflows.tsx # Approval workflows
└── examples/
    └── PhotoManagementExample.tsx # Usage examples
```

## Performance Considerations

### Frontend Optimization
- **Lazy Loading**: Images loaded on demand
- **Virtual Scrolling**: For large photo galleries
- **Memoization**: React.memo for expensive components
- **Debouncing**: Upload progress updates
- **Error Boundaries**: Graceful error handling

### Backend Optimization
- **Database Indexes**: On frequently queried columns
- **Connection Pooling**: Supabase handles automatically
- **CDN Caching**: Automatic with Supabase Storage
- **Image Optimization**: Automatic format conversion

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_academies_owner ON academies(owner_id);
CREATE INDEX idx_academies_status ON academies(status);
CREATE INDEX idx_academy_photos_academy ON academy_photos(academy_id);
CREATE INDEX idx_academy_photos_status ON academy_photos(status);
CREATE INDEX idx_teacher_assignments_academy ON teacher_assignments(academy_id);
CREATE INDEX idx_student_enrollments_academy ON student_enrollments(academy_id);
```

## Future Enhancements

### Planned Features

1. **Image Processing**
   - Automatic image resizing
   - Thumbnail generation
   - Image compression
   - Format conversion

2. **Advanced UI Features**
   - Photo cropping tool
   - Image filters
   - Batch upload
   - Drag & drop reordering

3. **Analytics**
   - Photo view statistics
   - Upload analytics
   - Approval metrics

4. **Notifications**
   - Email notifications for approvals
   - Real-time updates
   - Status change alerts

5. **Mobile Optimization**
   - Camera integration
   - Mobile-specific UI
   - Touch gestures

### Technical Improvements

1. **Performance**
   - Image lazy loading
   - Virtual scrolling for large galleries
   - CDN optimization
   - Caching strategies

2. **Security**
   - Image virus scanning
   - Content moderation
   - Advanced access controls
   - Audit logging

3. **Scalability**
   - Multi-tenant support
   - Horizontal scaling
   - Database optimization
   - Storage partitioning

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Check Supabase logs
4. Verify database permissions
5. Test with sample data

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete academy management system
- ✅ Photo management with approval workflow
- ✅ Admin dashboard with all management capabilities
- ✅ Location and skill management
- ✅ User management (Super Admin)
- ✅ Supabase Storage integration
- ✅ Row Level Security
- ✅ TypeScript support
- ✅ Responsive design

---

**Last Updated**: September 15, 2024
**Version**: 1.0.0
**Author**: AI Assistant
