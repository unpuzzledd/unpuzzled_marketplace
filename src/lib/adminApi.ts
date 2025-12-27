import { supabase } from './supabase';
import { 
  Academy, 
  Location, 
  Skill, 
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
   * Update academy status with notes (admin only)
   */
  static async updateAcademyStatusWithNotes(
    academyId: string, 
    status: 'pending' | 'in_process' | 'approved' | 'rejected' | 'active' | 'suspended' | 'deactivated',
    notes?: string | null
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update({ 
          status,
          status_notes: notes || null
        })
        .eq('id', academyId)
        .select(`
          *,
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

  /**
   * Update academy details (admin only)
   */
  static async updateAcademy(
    academyId: string,
    updates: {
      name?: string;
      phone_number?: string;
      owner_id?: string;
      location_id?: string;
    }
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update(updates)
        .eq('id', academyId)
        .select(`
          *,
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy';
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
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: academiesData, error: academiesError, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (academiesError) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: academiesError.message
        };
      }

      // Now try to get owner info separately if academies exist
      let academiesWithOwners = academiesData || [];
      
      if (academiesWithOwners.length > 0) {
        // Try to fetch owner info for each academy
        const ownerIds = [...new Set(academiesWithOwners.map(a => a.owner_id).filter(Boolean))];
        
        if (ownerIds.length > 0) {
          const { data: ownersData, error: ownersError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('id', ownerIds);

          if (!ownersError && ownersData) {
            // Map owners to academies
            const ownersMap = new Map(ownersData.map(owner => [owner.id, owner]));
            academiesWithOwners = academiesWithOwners.map(academy => ({
              ...academy,
              owner: ownersMap.get(academy.owner_id) || null
            }));
          }
        }
      }

      return {
        data: academiesWithOwners,
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        error: null
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch academies';
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
        error: errorMessage
      };
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
      // Since location_ids is an array, we need to check if the location_id exists in the array
      // Fetch all academies and check if location_id is in their location_ids array
      const { data: allAcademies, error: checkError } = await supabase
        .from('academies')
        .select('id, location_ids');

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      // Check if any academy has this location_id in their location_ids array
      const isLocationInUse = allAcademies?.some(academy => 
        academy.location_ids && Array.isArray(academy.location_ids) && academy.location_ids.includes(locationId)
      );

      if (isLocationInUse) {
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
      // Check if skill is being used by any academy (check skill_ids array)
      // Fetch all academies and check if skill_id is in their skill_ids array
      const { data: allAcademies, error: checkError } = await supabase
        .from('academies')
        .select('id, skill_ids');

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      // Check if any academy has this skill_id in their skill_ids array
      const isSkillInUse = allAcademies?.some(academy => 
        academy.skill_ids && Array.isArray(academy.skill_ids) && academy.skill_ids.includes(skillId)
      );

      if (isSkillInUse) {
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
   * Note: With simplified structure, photos are just URLs in arrays
   * This method returns academies with pending status that have photos
   */
  static async getPendingPhotos(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .select(`
          id,
          name,
          owner_id,
          photo_urls,
          status,
          owner:users(id, email, full_name)
        `)
        .eq('status', 'pending')
        .not('photo_urls', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Transform to match old format for compatibility
      return (data || []).flatMap(academy => 
        (academy.photo_urls || []).map((url: string, index: number) => ({
          id: `${academy.id}-photo-${index}`,
          academy_id: academy.id,
          photo_url: url,
          display_order: index + 1,
          status: 'pending' as const,
          academies: academy
        }))
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending photos';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all pending academy skills for approval
   * Note: With simplified structure, skills are just IDs in arrays
   * This method returns academies with pending status that have skills
   */
  static async getPendingSkills(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .select(`
          id,
          name,
          owner_id,
          skill_ids,
          status,
          owner:users(id, email, full_name)
        `)
        .eq('status', 'pending')
        .not('skill_ids', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Get skill details for all skill IDs
      const allSkillIds = new Set<string>();
      (data || []).forEach((academy: any) => {
        (academy.skill_ids || []).forEach((skillId: string) => allSkillIds.add(skillId));
      });

      const { data: skills } = await supabase
        .from('skills')
        .select('id, name, description')
        .in('id', Array.from(allSkillIds));

      const skillsMap = new Map((skills || []).map(s => [s.id, s]));

      // Transform to match old format for compatibility
      return (data || []).flatMap((academy: any) => 
        (academy.skill_ids || []).map((skillId: string) => ({
          id: `${academy.id}-skill-${skillId}`,
          academy_id: academy.id,
          skill_id: skillId,
          status: 'pending' as const,
          academies: academy,
          skills: skillsMap.get(skillId)
        }))
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending skills';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve academy photo (no-op with simplified structure)
   * Photos are automatically approved when added to array
   */
  static async approvePhoto(_photoId: string): Promise<ApiResponse<boolean>> {
    // With simplified structure, photos don't need approval
    // They're automatically visible when added to photo_urls array
    return { data: true, error: null };
  }

  /**
   * Reject academy photo (removes from array)
   */
  static async rejectPhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      // photoId format: "{academy_id}-photo-{index}"
      const [academyId] = photoId.split('-photo-');
      
      const { data: academy, error: fetchError } = await supabase
        .from('academies')
        .select('photo_urls')
        .eq('id', academyId)
        .single();

      if (fetchError || !academy) {
        return { data: null, error: 'Academy not found' };
      }

      const photoIndex = parseInt(photoId.split('-photo-')[1]);
      const photoUrls = academy.photo_urls || [];
      
      if (photoIndex < 0 || photoIndex >= photoUrls.length) {
        return { data: null, error: 'Photo not found' };
      }

      // Remove photo from array
      const updatedPhotoUrls = photoUrls.filter((_: string, index: number) => index !== photoIndex);
      
      const { error } = await supabase
        .from('academies')
        .update({ photo_urls: updatedPhotoUrls })
        .eq('id', academyId);

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
   * Approve academy skill (no-op with simplified structure)
   * Skills are automatically approved when added to array
   */
  static async approveSkill(_academySkillId: string): Promise<ApiResponse<boolean>> {
    // With simplified structure, skills don't need approval
    // They're automatically visible when added to skill_ids array
    return { data: true, error: null };
  }

  /**
   * Reject academy skill (removes from array)
   */
  static async rejectSkill(academySkillId: string): Promise<ApiResponse<boolean>> {
    try {
      // academySkillId format: "{academy_id}-skill-{skill_id}"
      const [academyId, skillId] = academySkillId.split('-skill-');
      
      const { data: academy, error: fetchError } = await supabase
        .from('academies')
        .select('skill_ids')
        .eq('id', academyId)
        .single();

      if (fetchError || !academy) {
        return { data: null, error: 'Academy not found' };
      }

      const skillIds = academy.skill_ids || [];
      
      if (!skillIds.includes(skillId)) {
        return { data: null, error: 'Skill not found' };
      }

      // Remove skill from array
      const updatedSkillIds = skillIds.filter((id: string) => id !== skillId);
      
      const { error } = await supabase
        .from('academies')
        .update({ skill_ids: updatedSkillIds })
        .eq('id', academyId);

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

      // Get photo counts (from academies.photo_urls arrays)
      const { data: academiesWithPhotos } = await supabase
        .from('academies')
        .select('photo_urls, status');
      
      let totalPhotos = 0;
      let pendingPhotos = 0;
      (academiesWithPhotos || []).forEach((academy: any) => {
        const photoCount = (academy.photo_urls || []).length;
        totalPhotos += photoCount;
        if (academy.status === 'pending') {
          pendingPhotos += photoCount;
        }
      });

      // Get skill counts
      const { count: totalSkills } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });

      // Get pending skills (from academies with pending status that have skills)
      const { data: pendingAcademiesWithSkills } = await supabase
        .from('academies')
        .select('skill_ids')
        .eq('status', 'pending')
        .not('skill_ids', 'is', null);
      
      let pendingSkills = 0;
      (pendingAcademiesWithSkills || []).forEach((academy: any) => {
        pendingSkills += (academy.skill_ids || []).length;
      });

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

      // Get recent photo uploads (from academies with photos)
      const { data: recentAcademiesWithPhotos } = await supabase
        .from('academies')
        .select(`
          id,
          name,
          photo_urls,
          status,
          created_at,
          owner:users(full_name, email)
        `)
        .not('photo_urls', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      const recentPhotos = (recentAcademiesWithPhotos || []).map((academy: any) => ({
        id: `${academy.id}-photo`,
        status: academy.status,
        created_at: academy.created_at,
        academies: {
          name: academy.name,
          owner: academy.owner
        }
      }));

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
    owner: any;
  }>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .select(`
          *,
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

      // Get total photos (from photo_urls array)
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .select('photo_urls')
        .eq('id', academyId)
        .single();

      if (academyError) {
        return { data: null, error: academyError.message };
      }

      const totalPhotos = (academy?.photo_urls || []).length;

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
      // Get academy with skill_ids array
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .select('skill_ids')
        .eq('id', academyId)
        .single();

      if (academyError) {
        return { data: null, error: academyError.message };
      }

      const skillIds = academy?.skill_ids || [];
      
      if (skillIds.length === 0) {
        return { data: [], error: null };
      }

      // Get the skill details
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
      // Get teacher assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        return { data: null, error: assignmentsError.message };
      }

      if (!assignments || assignments.length === 0) {
        return { data: [], error: null };
      }

      // Get teacher details for each assignment
      const teacherIds = assignments.map(assignment => assignment.teacher_id);
      
      const { data: teachers, error: teachersError } = await supabase
        .from('users')
        .select('*')
        .in('id', teacherIds);

      if (teachersError) {
        return { data: null, error: teachersError.message };
      }

      // Get batch information for each teacher
      const { data: teacherBatches } = await supabase
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

      // Combine the data
      const combinedData = assignments.map(assignment => {
        const foundTeacher = teachers?.find(teacher => teacher.id === assignment.teacher_id);
        const teacherBatchesData = teacherBatches?.filter(batch => batch.teacher_id === assignment.teacher_id) || [];
        
        return {
          ...assignment,
          teacher: foundTeacher || null,
          batches: teacherBatchesData
        };
      });

      return { data: combinedData, error: null };
    } catch (error) {
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
      const { data: batchEnrollments } = await supabase
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

      // Get student counts for each batch
      const batchIds = batches.map(batch => batch.id);
      const { data: batchEnrollments } = await supabase
        .from('batch_enrollments')
        .select('batch_id')
        .in('batch_id', batchIds)
        .eq('status', 'active');


      // Count students per batch
      const studentCounts = new Map<string, number>();
      if (batchEnrollments) {
        batchEnrollments.forEach(enrollment => {
          const count = studentCounts.get(enrollment.batch_id) || 0;
          studentCounts.set(enrollment.batch_id, count + 1);
        });
      }

      // Combine the data
      const combinedData = batches.map(batch => ({
        ...batch,
        skill: skillsResponse.data?.find(skill => skill.id === batch.skill_id) || null,
        teacher: teachersResponse.data?.find(teacher => teacher.id === batch.teacher_id) || null,
        student_count: studentCounts.get(batch.id) || 0
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
   * Approve teacher assignment
   */
  static async approveTeacherAssignment(assignmentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .update({ status: 'approved' })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve teacher assignment';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject teacher assignment
   */
  static async rejectTeacherAssignment(assignmentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .update({ status: 'rejected' })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject teacher assignment';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Remove teacher from academy
   * Also unassigns the teacher from all batches in that academy
   */
  static async removeTeacherFromAcademy(assignmentId: string): Promise<ApiResponse<any>> {
    try {
      // First, get the assignment to find the academy_id and teacher_id
      const { data: assignment, error: assignmentError } = await supabase
        .from('teacher_assignments')
        .select('academy_id, teacher_id')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) {
        return { data: null, error: assignmentError.message };
      }

      if (!assignment) {
        return { data: null, error: 'Assignment not found' };
      }

      // Unassign teacher from all batches in this academy
      await supabase
        .from('batches')
        .update({ teacher_id: null })
        .eq('academy_id', assignment.academy_id)
        .eq('teacher_id', assignment.teacher_id);

      // Continue with removal even if batch update fails

      // Delete the teacher assignment
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
  static async updateStudentEnrollmentStatus(
    enrollmentId: string, 
    status: string, 
    notes?: string | null
  ): Promise<ApiResponse<any>> {
    try {
      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.notes = notes || null;
      }

      const { data, error } = await supabase
        .from('student_enrollments')
        .update(updateData)
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

  // =============================================
  // BATCH ENROLLMENT MANAGEMENT
  // =============================================

  /**
   * Get pending batch enrollments for an academy
   */
  static async getPendingBatchEnrollments(academyId: string): Promise<ApiResponse<any[]>> {
    try {
      // First get all batches for this academy
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('id')
        .eq('academy_id', academyId);

      if (batchesError) {
        return { data: null, error: batchesError.message };
      }

      if (!batches || batches.length === 0) {
        return { data: [], error: null };
      }

      const batchIds = batches.map(b => b.id);

      // Get pending enrollments for these batches
      const { data: enrollments, error } = await supabase
        .from('batch_enrollments')
        .select(`
          *,
          student:users!batch_enrollments_student_id_fkey (
            id,
            full_name,
            email
          ),
          batch:batches!batch_enrollments_batch_id_fkey (
            id,
            name,
            skill:skills (
              id,
              name
            )
          )
        `)
        .in('batch_id', batchIds)
        .eq('status', 'pending')
        .order('enrolled_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: enrollments || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get pending batch enrollments';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Approve batch enrollment
   */
  static async approveBatchEnrollment(enrollmentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .update({ status: 'active' })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve batch enrollment';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject batch enrollment
   */
  static async rejectBatchEnrollment(enrollmentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('batch_enrollments')
        .update({ status: 'rejected' })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject batch enrollment';
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
    teacher_id?: string;
    academy_id: string;
    max_students?: number;
    status?: string;
    start_date: string;
    end_date: string;
    weekly_schedule?: WeeklyScheduleEntry[];
  }): Promise<ApiResponse<any>> {
    try {
      // First, check if academy is approved or active
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .select('status')
        .eq('id', batchData.academy_id)
        .single();

      if (academyError) {
        return { data: null, error: `Failed to verify academy status: ${academyError.message}` };
      }

      if (!academy) {
        return { data: null, error: 'Academy not found' };
      }

      // Only allow batch creation if academy is approved or active
      const allowedStatuses = ['approved', 'active']
      if (!allowedStatuses.includes(academy.status)) {
        return { 
          data: null, 
          error: `Cannot create batches. Academy status is "${academy.status}". Please wait for admin approval before creating batches.` 
        };
      }

      const insertData: any = {
        name: batchData.name,
        skill_id: batchData.skill_id,
        academy_id: batchData.academy_id,
        max_students: batchData.max_students || 20,
        status: batchData.status || 'active',
        start_date: batchData.start_date,
        end_date: batchData.end_date,
        created_at: new Date().toISOString()
      };
      
      // Only include teacher_id if it's provided
      if (batchData.teacher_id) {
        insertData.teacher_id = batchData.teacher_id;
      }

      // Include weekly_schedule if provided (filter out empty/invalid entries)
      if (batchData.weekly_schedule && batchData.weekly_schedule.length > 0) {
        const validSchedule = batchData.weekly_schedule.filter(
          entry => entry.day && entry.from_time && entry.to_time
        );
        if (validSchedule.length > 0) {
          insertData.weekly_schedule = validSchedule;
        }
      }
      
      const { data, error } = await supabase
        .from('batches')
        .insert(insertData)
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
    start_date?: string;
    end_date?: string;
    weekly_schedule?: WeeklyScheduleEntry[] | null;
  }): Promise<ApiResponse<any>> {
    try {
      // Prepare update data - convert empty string teacher_id to null
      const updateData: any = { ...updates };
      if (updateData.teacher_id === '') {
        updateData.teacher_id = null;
      } else if (updateData.teacher_id === undefined) {
        // If teacher_id is undefined, don't include it in the update
        delete updateData.teacher_id;
      }

      // Handle weekly_schedule
      if (updates.weekly_schedule !== undefined) {
        if (updates.weekly_schedule === null) {
          // Explicitly set to null to clear schedule
          updateData.weekly_schedule = null;
        } else if (Array.isArray(updates.weekly_schedule) && updates.weekly_schedule.length > 0) {
          // Filter out empty/invalid entries
          const validSchedule = updates.weekly_schedule.filter(
            entry => entry.day && entry.from_time && entry.to_time
          );
          updateData.weekly_schedule = validSchedule.length > 0 ? validSchedule : null;
        } else {
          // Empty array means clear schedule
          updateData.weekly_schedule = null;
        }
      }
      
      const { data, error } = await supabase
        .from('batches')
        .update(updateData)
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

  // =============================================
  // SCHEDULE EXCEPTION MANAGEMENT
  // =============================================

  /**
   * Create a schedule exception
   */
  static async createScheduleException(exceptionData: {
    batch_id: string;
    exception_date: string;
    original_day: string;
    action: 'cancelled' | 'time_changed' | 'moved';
    from_time?: string | null;
    to_time?: string | null;
    new_day?: string | null;
    notes?: string | null;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .insert({
          ...exceptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule exception';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update a schedule exception
   */
  static async updateScheduleException(
    exceptionId: string,
    updates: {
      action?: 'cancelled' | 'time_changed' | 'moved';
      from_time?: string | null;
      to_time?: string | null;
      new_day?: string | null;
      notes?: string | null;
    }
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', exceptionId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update schedule exception';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete a schedule exception
   */
  static async deleteScheduleException(exceptionId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('schedule_exceptions')
        .delete()
        .eq('id', exceptionId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete schedule exception';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all schedule exceptions for a batch
   */
  static async getBatchScheduleExceptions(batchId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .eq('batch_id', batchId)
        .order('exception_date', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get schedule exceptions';
      return { data: null, error: errorMessage };
    }
  }
}
