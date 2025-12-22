import { supabase } from './supabase';
import { 
  Academy, 
  Location, 
  Skill, 
  ApiResponse 
} from '../types/database';
import { PhotoApi } from './photoApi';

export class AcademyApi {
  
  /**
   * Create academy for the authenticated academy owner
   */
  static async createAcademyForOwner(academyData: {
    name: string;
    phone_number: string;
    location_ids: string[];
    skill_ids: string[];
    photos?: File[];
  }): Promise<ApiResponse<Academy>> {
    try {
      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return { data: null, error: 'User not authenticated' };
      }

      // Create academy first (without photos)
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert({
          name: academyData.name,
          phone_number: academyData.phone_number,
          owner_id: authUser.id,
          location_ids: academyData.location_ids,
          skill_ids: academyData.skill_ids,
          photo_urls: [], // Start with empty array
          status: 'pending'
        })
        .select(`
          *,
          owner:users(*)
        `)
        .single();

      if (academyError) {
        return { data: null, error: academyError.message };
      }

      if (!academy) {
        return { data: null, error: 'Failed to create academy' };
      }

      // Upload photos after academy is created (using academy ID)
      let photoUrls: string[] = [];
      if (academyData.photos && academyData.photos.length > 0) {
        const photosToUpload = academyData.photos.slice(0, 4); // Max 4 photos
        
        for (let i = 0; i < photosToUpload.length; i++) {
          const photo = photosToUpload[i];
          
          try {
            const result = await PhotoApi.uploadPhotoToStorage(
              academy.id, // Use academy ID as folder identifier
              photo,
              i + 1
            );
            
            if (result.success && result.photo_url) {
              photoUrls.push(result.photo_url);
            }
          } catch (uploadError) {
            // Continue with next photo
          }
        }

        // Update academy with photo URLs if any were uploaded
        if (photoUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('academies')
            .update({ photo_urls: photoUrls })
            .eq('id', academy.id)
            .select('photo_urls');

          if (!updateError) {
            // Fetch updated academy with photo URLs
            const { data: updatedAcademy } = await supabase
              .from('academies')
              .select(`
                *,
                owner:users(*)
              `)
              .eq('id', academy.id)
              .single();
            
            if (updatedAcademy) {
              return { data: updatedAcademy, error: null };
            }
          }
        }
      }

      return { data: academy, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create academy';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all available locations
   * RLS policies handle permissions - academy owners can view all active locations
   */
  static async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all available skills
   */
  static async getSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if academy owner already has an academy
   */
  static async hasAcademy(): Promise<boolean> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return false;
      }

      const { data, error } = await supabase
        .from('academies')
        .select('id')
        .eq('owner_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update academy profile for the authenticated academy owner
   */
  static async updateAcademyProfile(academyId: string, academyData: {
    name?: string;
    phone_number?: string;
    location_ids?: string[];
    skill_ids?: string[];
    photos?: File[];
    photosToDelete?: string[]; // URLs of photos to delete
  }): Promise<ApiResponse<Academy>> {
    try {
      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return { data: null, error: 'User not authenticated' };
      }

      // Verify the academy belongs to the current user
      const { data: existingAcademy, error: verifyError } = await supabase
        .from('academies')
        .select('id, owner_id, photo_urls')
        .eq('id', academyId)
        .eq('owner_id', authUser.id)
        .single();

      if (verifyError || !existingAcademy) {
        return { data: null, error: 'Academy not found or access denied' };
      }

      // Handle photo deletions first
      let updatedPhotoUrls = [...(existingAcademy.photo_urls || [])];
      if (academyData.photosToDelete && academyData.photosToDelete.length > 0) {
        // Delete photos from storage
        for (const photoUrl of academyData.photosToDelete) {
          try {
            await PhotoApi.deletePhoto(academyId, photoUrl);
          } catch (error) {
            // Continue with deletion
          }
        }
        // Remove deleted URLs from array
        updatedPhotoUrls = updatedPhotoUrls.filter(url => !academyData.photosToDelete!.includes(url));
      }

      // Handle new photo uploads
      if (academyData.photos && academyData.photos.length > 0) {
        const photosToUpload = academyData.photos.slice(0, 4 - updatedPhotoUrls.length); // Max 4 photos total
        
        for (let i = 0; i < photosToUpload.length; i++) {
          const photo = photosToUpload[i];
          try {
            const result = await PhotoApi.uploadPhotoToStorage(
              academyId,
              photo,
              updatedPhotoUrls.length + i + 1
            );
            
            if (result.success && result.photo_url) {
              updatedPhotoUrls.push(result.photo_url);
            }
          } catch (error) {
            // Continue with next photo
          }
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (academyData.name !== undefined) updateData.name = academyData.name;
      if (academyData.phone_number !== undefined) updateData.phone_number = academyData.phone_number;
      if (academyData.location_ids !== undefined) updateData.location_ids = academyData.location_ids;
      if (academyData.skill_ids !== undefined) {
        // Ensure skill_ids is always an array (never null/undefined)
        updateData.skill_ids = Array.isArray(academyData.skill_ids) ? academyData.skill_ids : [];
      }
      if (academyData.photos !== undefined || academyData.photosToDelete !== undefined) {
        updateData.photo_urls = updatedPhotoUrls;
      }

      // Update academy
      const { data: updatedAcademy, error: updateError } = await supabase
        .from('academies')
        .update(updateData)
        .eq('id', academyId)
        .select(`
          *,
          owner:users(*)
        `)
        .single();

      if (updateError) {
        return { data: null, error: updateError.message };
      }

      if (!updatedAcademy) {
        return { data: null, error: 'Failed to update academy' };
      }

      return { data: updatedAcademy, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy profile';
      return { data: null, error: errorMessage };
    }
  }
}
