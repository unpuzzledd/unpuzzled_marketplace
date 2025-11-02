import { supabase } from './supabase';
import { AcademyPhoto, PhotoUploadResult, PhotoUploadProgress } from '../types/database';

export class PhotoApi {
  private static readonly BUCKET_NAME = 'academy-photos';
  private static readonly MAX_PHOTOS_PER_ACADEMY = 4;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload a photo for an academy
   */
  static async uploadPhoto(
    academyId: string,
    file: File,
    displayOrder: number,
    onProgress?: (progress: PhotoUploadProgress) => void
  ): Promise<PhotoUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if academy already has 4 photos
      const existingPhotos = await this.getAcademyPhotos(academyId);
      if (existingPhotos.length >= this.MAX_PHOTOS_PER_ACADEMY) {
        return { success: false, error: 'Maximum 4 photos allowed per academy' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `photo_${displayOrder}_${Date.now()}.${fileExt}`;
      const filePath = `${academyId}/${fileName}`;

      // Report progress
      onProgress?.({
        file,
        progress: 0,
        status: 'uploading'
      });

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        onProgress?.({
          file,
          progress: 0,
          status: 'error',
          error: uploadError.message
        });
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Report progress
      onProgress?.({
        file,
        progress: 50,
        status: 'uploading'
      });

      // Save photo record in database
      const { error: dbError } = await supabase
        .from('academy_photos')
        .insert({
          academy_id: academyId,
          photo_url: publicUrl,
          display_order: displayOrder,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);

        onProgress?.({
          file,
          progress: 0,
          status: 'error',
          error: dbError.message
        });
        return { success: false, error: dbError.message };
      }

      // Report completion
      onProgress?.({
        file,
        progress: 100,
        status: 'completed'
      });

      return { success: true, photo_url: publicUrl };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress?.({
        file,
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get all photos for an academy
   */
  static async getAcademyPhotos(academyId: string): Promise<AcademyPhoto[]> {
    const { data, error } = await supabase
      .from('academy_photos')
      .select('*')
      .eq('academy_id', academyId)
      .order('display_order');

    if (error) {
      console.error('Error fetching academy photos:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update photo status (admin approval)
   */
  static async updatePhotoStatus(
    photoId: string,
    status: 'approved' | 'rejected'
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('academy_photos')
      .update({ status })
      .eq('id', photoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Delete a photo
   */
  static async deletePhoto(photoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get photo record first
      const { data: photo, error: fetchError } = await supabase
        .from('academy_photos')
        .select('photo_url, academy_id')
        .eq('id', photoId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Extract file path from URL
      const url = new URL(photo.photo_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get academy_id/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('academy_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update photo display order
   */
  static async updatePhotoOrder(
    photoId: string,
    displayOrder: number
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('academy_photos')
      .update({ display_order: displayOrder })
      .eq('id', photoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get pending photos for admin approval
   */
  static async getPendingPhotos(): Promise<AcademyPhoto[]> {
    const { data, error } = await supabase
      .from('academy_photos')
      .select(`
        *,
        academies!inner(name, owner_id)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending photos:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size must be less than 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Get photo upload URL for direct upload (alternative method)
   */
  static async getUploadUrl(academyId: string, fileName: string): Promise<string | null> {
    const filePath = `${academyId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Error creating upload URL:', error);
      return null;
    }

    return data.signedUrl;
  }
}
