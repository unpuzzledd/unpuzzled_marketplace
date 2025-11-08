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

      console.log('Creating academy with data:', {
        name: academyData.name,
        phone_number: academyData.phone_number,
        owner_id: authUser.id,
        location_ids: academyData.location_ids,
        skill_ids: academyData.skill_ids,
        photos_count: academyData.photos?.length || 0,
        status: 'pending'
      });

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
        console.error('Error creating academy:', academyError);
        console.error('Error details:', {
          message: academyError.message,
          code: academyError.code,
          details: academyError.details,
          hint: academyError.hint
        });
        return { data: null, error: academyError.message };
      }

      if (!academy) {
        console.error('Academy creation returned no data');
        return { data: null, error: 'Failed to create academy' };
      }

      console.log('Academy created successfully with ID:', academy.id);

      // Upload photos after academy is created (using academy ID)
      let photoUrls: string[] = [];
      if (academyData.photos && academyData.photos.length > 0) {
        const photosToUpload = academyData.photos.slice(0, 4); // Max 4 photos
        
        console.log(`Uploading ${photosToUpload.length} photos for academy ${academy.id}`);
        console.log('Photos to upload:', photosToUpload.map(p => ({ name: p.name, size: p.size, type: p.type })));
        
        for (let i = 0; i < photosToUpload.length; i++) {
          const photo = photosToUpload[i];
          console.log(`Uploading photo ${i + 1}/${photosToUpload.length}:`, {
            name: photo.name,
            size: photo.size,
            type: photo.type
          });
          
          try {
            const result = await PhotoApi.uploadPhotoToStorage(
              academy.id, // Use academy ID as folder identifier
              photo,
              i + 1
            );
            
            console.log(`Photo ${i + 1} upload result:`, result);
            
            if (result.success && result.photo_url) {
              photoUrls.push(result.photo_url);
              console.log(`Photo ${i + 1} uploaded successfully:`, result.photo_url);
            } else {
              console.error(`Failed to upload photo ${i + 1}:`, result.error);
            }
          } catch (uploadError) {
            console.error(`Exception uploading photo ${i + 1}:`, uploadError);
          }
        }

        console.log(`Total photo URLs collected: ${photoUrls.length}`, photoUrls);

        // Update academy with photo URLs if any were uploaded
        if (photoUrls.length > 0) {
          console.log(`Updating academy ${academy.id} with ${photoUrls.length} photo URLs:`, photoUrls);
          
          const { data: updateData, error: updateError } = await supabase
            .from('academies')
            .update({ photo_urls: photoUrls })
            .eq('id', academy.id)
            .select('photo_urls');

          console.log('Update result:', { updateData, updateError });

          if (updateError) {
            console.error('Error updating academy with photo URLs:', updateError);
            console.error('Error details:', {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint
            });
            // Still return academy even if photo update fails
          } else {
            console.log('Academy updated successfully, fetching updated record...');
            // Fetch updated academy with photo URLs
            const { data: updatedAcademy, error: fetchError } = await supabase
              .from('academies')
              .select(`
                *,
                owner:users(*)
              `)
              .eq('id', academy.id)
              .single();
            
            console.log('Fetched updated academy:', updatedAcademy);
            console.log('Fetch error:', fetchError);
            
            if (updatedAcademy) {
              console.log('Academy updated with photo URLs:', updatedAcademy.photo_urls);
              return { data: updatedAcademy, error: null };
            } else {
              console.warn('Updated academy not found, returning original academy');
            }
          }
        } else {
          console.warn('No photo URLs were collected, academy created without photos');
        }
      }

      console.log('Academy created successfully:', academy);
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
        console.error('Error fetching locations:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return [];
      }

      console.log('Fetched locations from database:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
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
        console.error('Error fetching skills:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
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
        console.error('Error checking academy:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking academy:', error);
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
            console.error('Error deleting photo:', error);
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
            console.error(`Error uploading photo ${i + 1}:`, error);
          }
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (academyData.name !== undefined) updateData.name = academyData.name;
      if (academyData.phone_number !== undefined) updateData.phone_number = academyData.phone_number;
      if (academyData.location_ids !== undefined) updateData.location_ids = academyData.location_ids;
      if (academyData.skill_ids !== undefined) updateData.skill_ids = academyData.skill_ids;
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
        console.error('Error updating academy:', updateError);
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

