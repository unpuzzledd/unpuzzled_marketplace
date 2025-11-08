import React, { useState, useEffect } from 'react';
import { PhotoApi } from '../lib/photoApi';
import { PhotoUpload } from './PhotoUpload';
import { PhotoGallery } from './PhotoGallery';
import { 
  PhotoIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AcademyPhotoManagerProps {
  academyId: string;
  canEdit?: boolean;
  showStatus?: boolean;
  onPhotosChange?: (photos: string[]) => void;
}

export const AcademyPhotoManager: React.FC<AcademyPhotoManagerProps> = ({
  academyId,
  canEdit = false,
  showStatus = false,
  onPhotosChange
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [academyId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const photoUrls = await PhotoApi.getAcademyPhotos(academyId);
      setPhotos(photoUrls);
      onPhotosChange?.(photoUrls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load photos';
      setError(errorMessage);
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (_photoUrl: string) => {
    // Reload photos to get the new photo
    loadPhotos();
  };

  const handleUploadError = (error: string) => {
    setError(error);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const result = await PhotoApi.deletePhoto(academyId, photoUrl);
      if (result.success) {
        setPhotos(prev => prev.filter(url => url !== photoUrl));
        onPhotosChange?.(photos.filter(url => url !== photoUrl));
      } else {
        setError(result.error || 'Failed to delete photo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(errorMessage);
    }
  };

  const handleReorderPhotos = async (photoUrls: string[]) => {
    try {
      const result = await PhotoApi.updatePhotoOrder(academyId, photoUrls);
      if (result.success) {
        // Reload photos to get updated order
        loadPhotos();
      } else {
        setError(result.error || 'Failed to reorder photos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder photos';
      setError(errorMessage);
    }
  };

  const getStatusSummary = () => {
    // Photos are now just URLs, no status tracking
    // Return empty summary since status is no longer tracked per photo
    return { approved: photos.length, pending: 0, rejected: 0 };
  };

  const statusSummary = getStatusSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading photos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <PhotoIcon className="h-5 w-5" />
            <span>Academy Photos</span>
          </h3>
          <p className="text-sm text-gray-600">
            {photos.length} of 4 photos uploaded
          </p>
        </div>

        {showStatus && photos.length > 0 && (
          <div className="flex items-center space-x-4 text-sm">
            {statusSummary.approved > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{statusSummary.approved} approved</span>
              </div>
            )}
            {statusSummary.pending > 0 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <ClockIcon className="h-4 w-4" />
                <span>{statusSummary.pending} pending</span>
              </div>
            )}
            {statusSummary.rejected > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{statusSummary.rejected} rejected</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      <PhotoGallery
        photos={photos}
        onDeletePhoto={canEdit ? handleDeletePhoto : undefined}
        onReorderPhotos={canEdit ? handleReorderPhotos : undefined}
        canEdit={canEdit}
        showStatus={showStatus}
      />

      {/* Upload Section */}
      {canEdit && (
        <div className="border-t pt-6">
          <PhotoUpload
            academyId={academyId}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxPhotos={4}
            existingPhotos={photos.length}
          />
        </div>
      )}

      {/* Status Information */}
      {showStatus && photos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Photo Status Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Approved:</strong> Photos are visible to the public</p>
            <p>• <strong>Pending:</strong> Photos are awaiting admin approval</p>
            <p>• <strong>Rejected:</strong> Photos were rejected and need to be replaced</p>
          </div>
        </div>
      )}
    </div>
  );
};
