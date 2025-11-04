import { supabase } from './supabase';
import { 
  Academy, 
  Location, 
  Skill, 
  AcademyPhoto, 
  AcademySkill, 
  // User,
  Admin,
  ApiResponse,
  PaginatedResponse 
} from '../types/database';

export class AdminApi {
  
  // =============================================
  // ACADEMY MANAGEMENT
  // =============================================

  /**
   * Create a new academy
   */
  static async createAcademy(academyData: {
    name: string;
    phone_number: string;
    owner_id: string;
    location_id: string;
  }): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .insert({
          ...academyData,
          status: 'pending'
        })
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create academy';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete an academy
   */
  static async deleteAcademy(academyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academies')
        .delete()
        .eq('id', academyId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete academy';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update academy status (pending/in_process/approved/rejected/active/suspended/deactivated)
   */
  static async updateAcademyStatus(
    academyId: string, 
    status: 'pending' | 'in_process' | 'approved' | 'rejected' | 'active' | 'suspended' | 'deactivated'
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update({ status })
        .eq('id', academyId)
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy status';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update academy name (admin only)
   */
  static async updateAcademyName(
    academyId: string, 
    name: string
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update({ name })
        .eq('id', academyId)
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy name';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // ACADEMY STATUS WORKFLOW FUNCTIONS
  // =============================================

  /**
   * Start academy review process (pending → in_process)
   */
  static async startAcademyReview(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'in_process');
  }

  /**
   * Approve academy (in_process → approved → active)
   */
  static async approveAcademy(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'approved');
  }

  /**
   * Reject academy (in_process → rejected)
   */
  static async rejectAcademy(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'rejected');
  }

  /**
   * Activate academy (approved → active)
   */
  static async activateAcademy(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'active');
  }

  /**
   * Suspend academy (active → suspended)
   */
  static async suspendAcademy(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'suspended');
  }

  /**
   * Deactivate academy (any status → deactivated)
   */
  static async deactivateAcademy(academyId: string): Promise<ApiResponse<Academy>> {
    return this.updateAcademyStatus(academyId, 'deactivated');
  }

  /**
   * Get academies by status
   */
  static async getAcademiesByStatus(
    status: 'pending' | 'in_process' | 'approved' | 'rejected' | 'active' | 'suspended' | 'deactivated',
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Academy>> {
    try {
      const { data, error, count } = await supabase
        .from('academies')
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        return { data: [], totalPages: 0, error: error.message, count: 0, page, pageSize: limit };
      }

      const totalPages = Math.ceil((count || 0) / limit);
      return { data: data || [], totalPages, error: null, count: count || 0, page, pageSize: limit };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academies by status';
      return { data: [], totalPages: 0, error: errorMessage, count: 0, page, pageSize: limit };
    }
  }

  /**
   * Get all academies with pagination
   */
  static async getAcademies(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<PaginatedResponse<Academy>> {
    try {
      let query = supabase
        .from('academies')
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch academies';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // LOCATION MANAGEMENT
  // =============================================

  /**
   * Create a new location
   */
  static async createLocation(locationData: {
    name: string;
    city: string;
    state: string;
    country?: string;
  }): Promise<ApiResponse<Location>> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          ...locationData,
          country: locationData.country || 'India'
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update location
   */
  static async updateLocation(
    locationId: string,
    updates: Partial<Location>
  ): Promise<ApiResponse<Location>> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', locationId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if location is being used by any academy
      const { data: academies, error: checkError } = await supabase
        .from('academies')
        .select('id')
        .eq('location_id', locationId)
        .limit(1);

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      if (academies && academies.length > 0) {
        return { data: null, error: 'Cannot delete location that is being used by academies' };
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all locations
   */
  static async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch locations';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // SKILL MANAGEMENT
  // =============================================

  /**
   * Create a new skill
   */
  static async createSkill(skillData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Skill>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert(skillData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update skill
   */
  static async updateSkill(
    skillId: string,
    updates: Partial<Skill>
  ): Promise<ApiResponse<Skill>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete skill
   */
  static async deleteSkill(skillId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if skill is being used by any academy
      const { data: academySkills, error: checkError } = await supabase
        .from('academy_skills')
        .select('id')
        .eq('skill_id', skillId)
        .limit(1);

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      if (academySkills && academySkills.length > 0) {
        return { data: null, error: 'Cannot delete skill that is being used by academies' };
      }

      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all skills
   */
  static async getSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch skills';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // APPROVAL WORKFLOWS
  // =============================================

  /**
   * Get all pending academy photos for approval
   */
  static async getPendingPhotos(): Promise<AcademyPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('academy_photos')
        .select(`
          *,
          academies!inner(name, owner_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending photos';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all pending academy skills for approval
   */
  static async getPendingSkills(): Promise<AcademySkill[]> {
    try {
      const { data, error } = await supabase
        .from('academy_skills')
        .select(`
          *,
          academies!inner(name, owner_id),
          skills!inner(name, description)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending skills';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve academy photo
   */
  static async approvePhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_photos')
        .update({ status: 'approved' })
        .eq('id', photoId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve photo';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject academy photo
   */
  static async rejectPhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_photos')
        .update({ status: 'rejected' })
        .eq('id', photoId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject photo';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Approve academy skill
   */
  static async approveSkill(academySkillId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_skills')
        .update({ status: 'approved' })
        .eq('id', academySkillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject academy skill
   */
  static async rejectSkill(academySkillId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_skills')
        .update({ status: 'rejected' })
        .eq('id', academySkillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject skill';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // USER MANAGEMENT (Super Admin only)
  // =============================================

  /**
   * Create a new admin (Super Admin only)
   */
  static async createAdmin(adminData: {
    user_id: string;
    created_by: string;
  }): Promise<ApiResponse<Admin>> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert(adminData)
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update admin status
   */
  static async updateAdminStatus(
    adminId: string,
    status: 'active' | 'suspended'
  ): Promise<ApiResponse<Admin>> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({ status })
        .eq('id', adminId)
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin status';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete admin
   */
  static async deleteAdmin(adminId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all admins
   */
  static async getAdmins(): Promise<Admin[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admins';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // DASHBOARD DATA AGGREGATION
  // =============================================

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<{
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
  }> {
    try {
      // Get academy counts
      const { count: totalAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      const { count: pendingAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: activeAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: suspendedAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended');

      // Get photo counts
      const { count: totalPhotos } = await supabase
        .from('academy_photos')
        .select('*', { count: 'exact', head: true });

      const { count: pendingPhotos } = await supabase
        .from('academy_photos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get skill counts
      const { count: totalSkills } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });

      const { count: pendingSkills } = await supabase
        .from('academy_skills')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get admin counts
      const { count: totalAdmins } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true });

      const { count: activeAdmins } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalAcademies: totalAcademies || 0,
        pendingAcademies: pendingAcademies || 0,
        activeAcademies: activeAcademies || 0,
        suspendedAcademies: suspendedAcademies || 0,
        totalPhotos: totalPhotos || 0,
        pendingPhotos: pendingPhotos || 0,
        totalSkills: totalSkills || 0,
        pendingSkills: pendingSkills || 0,
        totalAdmins: totalAdmins || 0,
        activeAdmins: activeAdmins || 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get recent activities for admin dashboard
   */
  static async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      // Get recent academy creations
      const { data: recentAcademies } = await supabase
        .from('academies')
        .select(`
          id,
          name,
          status,
          created_at,
          owner:users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent photo uploads
      const { data: recentPhotos } = await supabase
        .from('academy_photos')
        .select(`
          id,
          status,
          created_at,
          academies!inner(name, owner:users(full_name, email))
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and sort by date
      const activities = [
        ...(recentAcademies || []).map(academy => ({
          type: 'academy_created',
          id: academy.id,
          title: `New academy: ${academy.name}`,
          description: `Created by ${(academy as any).owner?.full_name || (academy as any).owner?.email}`,
          status: academy.status,
          created_at: academy.created_at
        })),
        ...(recentPhotos || []).map(photo => ({
          type: 'photo_uploaded',
          id: photo.id,
          title: `Photo uploaded to ${(photo.academies as any)?.name}`,
          description: `Uploaded by ${(photo.academies as any)?.owner?.full_name || (photo.academies as any)?.owner?.email}`,
          status: photo.status,
          created_at: photo.created_at
        }))
      ];

      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent activities';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // ACADEMY-SPECIFIC DATA FOR ACADEMY DASHBOARD
  // =============================================

  /**
   * Get academy details by owner ID
   */
  static async getAcademyByOwnerId(ownerId: string): Promise<ApiResponse<Academy & {
    location: Location;
    owner: any;
  }>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .eq('owner_id', ownerId)
        .maybeSingle(); // Changed to maybeSingle() to handle case when no academy exists

      if (error) {
        // Check if it's the "no rows" error (PGRST116)
        if (error.code === 'PGRST116') {
          // No academy exists - this is expected for new academy owners
          return { data: null, error: null };
        }
        return { data: null, error: error.message };
      }

      // If no data and no error, no academy exists
      if (!data) {
        return { data: null, error: null };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy by owner ID';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get academy statistics (students, teachers, etc.)
   */
  static async getAcademyStatistics(academyId: string): Promise<ApiResponse<{
    totalStudents: number;
    pendingStudents: number;
    activeTeachers: number;
    totalBatches: number;
    totalPhotos: number;
  }>> {
    try {
      // Get total approved students
      const { count: totalStudents, error: studentsError } = await supabase
        .from('student_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'approved');

      if (studentsError) {
        return { data: null, error: studentsError.message };
      }

      // Get pending students
      const { count: pendingStudents, error: pendingError } = await supabase
        .from('student_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'pending');

      if (pendingError) {
        return { data: null, error: pendingError.message };
      }

      // Get active teachers
      const { count: activeTeachers, error: teachersError } = await supabase
        .from('teacher_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId)
        .eq('status', 'approved');

      if (teachersError) {
        return { data: null, error: teachersError.message };
      }

      // Get total batches
      const { count: totalBatches, error: batchesError } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      if (batchesError) {
        return { data: null, error: batchesError.message };
      }

      // Get total photos
      const { count: totalPhotos, error: photosError } = await supabase
        .from('academy_photos')
        .select('*', { count: 'exact', head: true })
        .eq('academy_id', academyId);

      if (photosError) {
        return { data: null, error: photosError.message };
      }

      return {
        data: {
          totalStudents: totalStudents || 0,
          pendingStudents: pendingStudents || 0,
          activeTeachers: activeTeachers || 0,
          totalBatches: totalBatches || 0,
          totalPhotos: totalPhotos || 0,
        },
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy statistics';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get academy skills (activities)
   */
  static async getAcademySkills(academyId: string): Promise<ApiResponse<Skill[]>> {
    try {
      // First get the academy_skills records
      const { data: academySkillsData, error: academySkillsError } = await supabase
        .from('academy_skills')
        .select('skill_id')
        .eq('academy_id', academyId)
        .eq('status', 'approved');

      if (academySkillsError) {
        return { data: null, error: academySkillsError.message };
      }

      if (!academySkillsData || academySkillsData.length === 0) {
        return { data: [], error: null };
      }

      // Get the skill details
      const skillIds = academySkillsData.map(item => item.skill_id);

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .in('id', skillIds);

      if (skillsError) {
        return { data: null, error: skillsError.message };
      }

      return { data: skillsData || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy skills';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get pending student enrollments
   */
  static async getPendingEnrollments(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          student:users(*)
        `)
        .eq('academy_id', academyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get pending enrollments';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all teachers for an academy with details
   */
  static async getAcademyTeachers(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('Fetching teachers for academy:', academyId);
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .limit(1);
      
      console.log('Supabase connection test:', { testData, testError });
      
      // Check current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user?.id);
      
      // Test specific teacher IDs
      const { data: specificTest, error: specificError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', ['5b4d82df-2e8b-49cf-af11-7b611ae95267', 'f6227b7a-9b0d-4ef5-8637-0b5383196531', 'f9dd7193-6225-471b-a424-26a8e62779f8']);
      
      console.log('Specific teacher IDs test:', { specificTest, specificError });
      
      // Test with a single ID first
      const { data: singleTest, error: singleError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', '5b4d82df-2e8b-49cf-af11-7b611ae95267');
      
      console.log('Single teacher ID test:', { singleTest, singleError });
      
      // First get teacher assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      console.log('Teacher assignments:', assignments);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        return { data: null, error: assignmentsError.message };
      }

      if (!assignments || assignments.length === 0) {
        return { data: [], error: null };
      }

      // Get teacher details for each assignment
      const teacherIds = assignments.map(assignment => assignment.teacher_id);
      console.log('Teacher IDs:', teacherIds);
      
      const { data: teachers, error: teachersError } = await supabase
        .from('users')
        .select('*')
        .in('id', teacherIds);

      console.log('Teachers data:', teachers);
      console.log('Teachers data length:', teachers?.length);
      console.log('Teachers error:', teachersError);
      console.log('Query details:', { teacherIds, query: 'users table with IN clause' });
      
      // Log each teacher individually
      if (teachers && teachers.length > 0) {
        teachers.forEach((teacher, index) => {
          console.log(`Teacher ${index}:`, {
            id: teacher.id,
            full_name: teacher.full_name,
            email: teacher.email
          });
        });
      } else {
        console.log('No teachers found in the query result');
      }

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
        return { data: null, error: teachersError.message };
      }

      // Get batch information for each teacher
      const { data: teacherBatches, error: batchesError } = await supabase
        .from('batches')
        .select(`
          id,
          name,
          skill_id,
          teacher_id,
          status,
          skills:skill_id(name)
        `)
        .in('teacher_id', teacherIds)
        .eq('academy_id', academyId);

      if (batchesError) {
        console.error('Error fetching teacher batches:', batchesError);
      }

      // Combine the data
      const combinedData = assignments.map(assignment => {
        const foundTeacher = teachers?.find(teacher => teacher.id === assignment.teacher_id);
        const teacherBatchesData = teacherBatches?.filter(batch => batch.teacher_id === assignment.teacher_id) || [];
        
        console.log(`Looking for teacher ${assignment.teacher_id}:`, foundTeacher ? 'FOUND' : 'NOT FOUND');
        if (foundTeacher) {
          console.log('Found teacher details:', { id: foundTeacher.id, name: foundTeacher.full_name });
        }
        return {
          ...assignment,
          teacher: foundTeacher || null,
          batches: teacherBatchesData
        };
      });

      console.log('Combined teachers data:', JSON.stringify(combinedData, null, 2));

      return { data: combinedData, error: null };
    } catch (error) {
      console.error('Error in getAcademyTeachers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy teachers';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all students for an academy with details
   */
  static async getAcademyStudents(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get student enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (enrollmentsError) {
        return { data: null, error: enrollmentsError.message };
      }

      if (!enrollments || enrollments.length === 0) {
        return { data: [], error: null };
      }

      // Get student details for each enrollment
      const studentIds = enrollments.map(enrollment => enrollment.student_id);
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('*')
        .in('id', studentIds);

      if (studentsError) {
        return { data: null, error: studentsError.message };
      }

      // Get batch enrollments for each student
      const { data: batchEnrollments, error: batchEnrollmentsError } = await supabase
        .from('batch_enrollments')
        .select(`
          id,
          student_id,
          batch_id,
          enrolled_at,
          batches:batch_id(
            id,
            name,
            skill_id,
            status,
            skills:skill_id(name)
          )
        `)
        .in('student_id', studentIds);

      if (batchEnrollmentsError) {
        console.error('Error fetching student batch enrollments:', batchEnrollmentsError);
      }

      // Combine the data
      const combinedData = enrollments.map(enrollment => {
        const student = students?.find(student => student.id === enrollment.student_id);
        const studentBatchEnrollments = batchEnrollments?.filter(be => be.student_id === enrollment.student_id) || [];
        
        return {
          ...enrollment,
          student: student || null,
          batchEnrollments: studentBatchEnrollments
        };
      });

      return { data: combinedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy students';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all batches for an academy
   */
  static async getAcademyBatches(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get batches
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (batchesError) {
        return { data: null, error: batchesError.message };
      }

      if (!batches || batches.length === 0) {
        return { data: [], error: null };
      }

      // Get skills and teachers for each batch
      const skillIds = [...new Set(batches.map(batch => batch.skill_id).filter(Boolean))];
      const teacherIds = [...new Set(batches.map(batch => batch.teacher_id).filter(Boolean))];

      const [skillsResponse, teachersResponse] = await Promise.all([
        skillIds.length > 0 ? supabase.from('skills').select('*').in('id', skillIds) : { data: [], error: null },
        teacherIds.length > 0 ? supabase.from('users').select('*').in('id', teacherIds) : { data: [], error: null }
      ]);

      if (skillsResponse.error) {
        return { data: null, error: skillsResponse.error.message };
      }
      if (teachersResponse.error) {
        return { data: null, error: teachersResponse.error.message };
      }

      // Combine the data
      const combinedData = batches.map(batch => ({
        ...batch,
        skill: skillsResponse.data?.find(skill => skill.id === batch.skill_id) || null,
        teacher: teachersResponse.data?.find(teacher => teacher.id === batch.teacher_id) || null
      }));

      return { data: combinedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy batches';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get batch topics for an academy
   */
  static async getBatchTopics(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          created_by_user:users!topics_created_by_fkey(*)
        `)
        .eq('batch_id', batchId)
        .order('due_date', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch topics';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get student scores for an academy
   */
  static async getAcademyStudentScores(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          *,
          student:users!student_scores_student_id_fkey(*),
          skill:skills(*),
          updated_by_user:users!student_scores_updated_by_fkey(*)
        `)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get student scores';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get batch enrollments for an academy
   */
  static async getAcademyBatchEnrollments(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .select(`
          *,
          student:users!batch_enrollments_student_id_fkey(*),
          batch:batches!batch_enrollments_batch_id_fkey(*)
        `)
        .eq('batch.academy_id', academyId)
        .order('enrolled_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batch enrollments';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // TEACHER MANAGEMENT FUNCTIONS
  // =============================================

  /**
   * Update user information
   */
  static async updateUser(userId: string, updates: { full_name?: string; email?: string }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Remove teacher from academy
   */
  static async removeTeacherFromAcademy(assignmentId: string): Promise<ApiResponse<any>> {
    try {
      const { error } = await supabase
        .from('teacher_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove teacher from academy';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // STUDENT MANAGEMENT FUNCTIONS
  // =============================================

  /**
   * Update student enrollment status
   */
  static async updateStudentEnrollmentStatus(enrollmentId: string, status: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('student_enrollments')
        .update({ status })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student enrollment status';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Assign student to batch
   */
  static async assignStudentToBatch(studentId: string, batchId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .insert({
          student_id: studentId,
          batch_id: batchId,
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign student to batch';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Add student score
   */
  static async addStudentScore(
    studentId: string, 
    academyId: string, 
    skillId: string, 
    score: number, 
    notes?: string
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .insert({
          student_id: studentId,
          academy_id: academyId,
          skill_id: skillId,
          score: score,
          notes: notes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add student score';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // BATCH MANAGEMENT FUNCTIONS
  // =============================================

  /**
   * Create new batch
   */
  static async createBatch(batchData: {
    name: string;
    skill_id: string;
    teacher_id: string;
    academy_id: string;
    max_students?: number;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batches')
        .insert({
          name: batchData.name,
          skill_id: batchData.skill_id,
          teacher_id: batchData.teacher_id,
          academy_id: batchData.academy_id,
          max_students: batchData.max_students || 20,
          status: batchData.status || 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create batch';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update batch
   */
  static async updateBatch(batchId: string, updates: {
    name?: string;
    skill_id?: string;
    teacher_id?: string;
    max_students?: number;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', batchId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update batch';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Remove student from batch
   */
  static async removeStudentFromBatch(enrollmentId: string): Promise<ApiResponse<any>> {
    try {
      const { error } = await supabase
        .from('batch_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove student from batch';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Create batch topic
   */
  static async createBatchTopic(batchId: string, topicData: {
    title: string;
    description?: string;
    due_date?: string;
  }, createdBy?: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: topicData.title,
          description: topicData.description,
          due_date: topicData.due_date,
          batch_id: batchId,
          created_by: createdBy,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create batch topic';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update batch topic
   */
  static async updateBatchTopic(topicId: string, topicData: {
    title?: string;
    description?: string;
    due_date?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .update({
          ...topicData,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update batch topic';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete batch topic
   */
  static async deleteBatchTopic(topicId: string): Promise<ApiResponse<any>> {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete batch topic';
      return { data: null, error: errorMessage };
    }
  }
}
