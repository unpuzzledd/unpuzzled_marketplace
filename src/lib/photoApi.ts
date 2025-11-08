import { supabase } from './supabase';
import { PhotoUploadResult, PhotoUploadProgress } from '../types/database';

export class PhotoApi {
  private static readonly BUCKET_NAME = 'academy-photos';
  private static readonly MAX_PHOTOS_PER_ACADEMY = 4;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload photo to storage only (returns URL, doesn't save to database)
   * Used when creating academy - photos are stored in academies.photo_urls array
   */
  static async uploadPhotoToStorage(
    identifier: string, // academyId or ownerId
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

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `photo_${displayOrder}_${Date.now()}.${fileExt}`;
      const filePath = `${identifier}/${fileName}`;

      // Report progress
      onProgress?.({
        file,
        progress: 0,
        status: 'uploading'
      });

      console.log(`Uploading to storage: bucket=${this.BUCKET_NAME}, path=${filePath}`);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Storage upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Storage upload error:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error
        });
        onProgress?.({
          file,
          progress: 0,
          status: 'error',
          error: uploadError.message
        });
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;
      console.log('Generated public URL:', publicUrl);

      if (!publicUrl) {
        console.error('Failed to generate public URL for:', filePath);
        return { success: false, error: 'Failed to generate public URL' };
      }

      // Report completion
      onProgress?.({
        file,
        progress: 100,
        status: 'completed'
      });

      console.log('Photo upload successful, returning URL:', publicUrl);
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
   * Upload a photo for an academy and update academies.photo_urls array
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
      const { data: academy, error: fetchError } = await supabase
        .from('academies')
        .select('photo_urls')
        .eq('id', academyId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const existingPhotos = academy?.photo_urls || [];
      if (existingPhotos.length >= this.MAX_PHOTOS_PER_ACADEMY) {
        return { success: false, error: 'Maximum 4 photos allowed per academy' };
      }

      // Upload to storage
      const uploadResult = await this.uploadPhotoToStorage(academyId, file, displayOrder, onProgress);
      
      if (!uploadResult.success || !uploadResult.photo_url) {
        return uploadResult;
      }

      // Add photo URL to academies.photo_urls array
      const updatedPhotoUrls = [...existingPhotos, uploadResult.photo_url];
      const { error: updateError } = await supabase
        .from('academies')
        .update({ photo_urls: updatedPhotoUrls })
        .eq('id', academyId);

      if (updateError) {
        // Clean up uploaded file if database update fails
        const url = new URL(uploadResult.photo_url);
        const filePath = url.pathname.split('/').slice(-2).join('/');
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);

        return { success: false, error: updateError.message };
      }

      return { success: true, photo_url: uploadResult.photo_url };

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
   * Get all photos for an academy (from academies.photo_urls array)
   */
  static async getAcademyPhotos(academyId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('academies')
      .select('photo_urls')
      .eq('id', academyId)
      .single();

    if (error) {
      console.error('Error fetching academy photos:', error);
      return [];
    }

    return data?.photo_urls || [];
  }

  /**
   * Delete a photo from academy (removes URL from array and deletes from storage)
   */
  static async deletePhoto(academyId: string, photoUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current photo URLs
      const { data: academy, error: fetchError } = await supabase
        .from('academies')
        .select('photo_urls')
        .eq('id', academyId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const photoUrls = academy?.photo_urls || [];
      if (!photoUrls.includes(photoUrl)) {
        return { success: false, error: 'Photo not found' };
      }

      // Extract file path from URL
      const url = new URL(photoUrl);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get academy_id/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Remove URL from array
      const updatedPhotoUrls = photoUrls.filter(url => url !== photoUrl);
      const { error: updateError } = await supabase
        .from('academies')
        .update({ photo_urls: updatedPhotoUrls })
        .eq('id', academyId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update photo order (reorder photo_urls array)
   */
  static async updatePhotoOrder(
    academyId: string,
    photoUrls: string[]
  ): Promise<{ success: boolean; error?: string }> {
    // Validate max 4 photos
    if (photoUrls.length > this.MAX_PHOTOS_PER_ACADEMY) {
      return { success: false, error: `Maximum ${this.MAX_PHOTOS_PER_ACADEMY} photos allowed` };
    }

    const { error } = await supabase
      .from('academies')
      .update({ photo_urls: photoUrls })
      .eq('id', academyId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
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
