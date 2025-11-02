import React, { useState, useEffect } from 'react';
import { PhotoApi } from '../lib/photoApi';
import { AcademyPhoto } from '../types/database';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ClockIcon,
  // ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminPhotoApprovalProps {
  onApprovalComplete?: () => void;
}

export const AdminPhotoApproval: React.FC<AdminPhotoApprovalProps> = ({
  onApprovalComplete
}) => {
  const [pendingPhotos, setPendingPhotos] = useState<AcademyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<AcademyPhoto | null>(null);

  useEffect(() => {
    loadPendingPhotos();
  }, []);

  const loadPendingPhotos = async () => {
    try {
      setLoading(true);
      const photos = await PhotoApi.getPendingPhotos();
      setPendingPhotos(photos);
    } catch (error) {
      console.error('Error loading pending photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (photoId: string) => {
    try {
      setProcessing(photoId);
      const result = await PhotoApi.updatePhotoStatus(photoId, 'approved');
      
      if (result.success) {
        setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
        onApprovalComplete?.();
      } else {
        alert(`Failed to approve photo: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving photo:', error);
      alert('Failed to approve photo');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to reject this photo?')) {
      return;
    }

    try {
      setProcessing(photoId);
      const result = await PhotoApi.updatePhotoStatus(photoId, 'rejected');
      
      if (result.success) {
        setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
        onApprovalComplete?.();
      } else {
        alert(`Failed to reject photo: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting photo:', error);
      alert('Failed to reject photo');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(photoId);
      const result = await PhotoApi.deletePhoto(photoId);
      
      if (result.success) {
        setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
        onApprovalComplete?.();
      } else {
        alert(`Failed to delete photo: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pending photos...</span>
      </div>
    );
  }

  if (pendingPhotos.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600">No photos are pending approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Photo Approvals</h2>
          <p className="text-gray-600">
            {pendingPhotos.length} photo{pendingPhotos.length !== 1 ? 's' : ''} pending approval
          </p>
        </div>
        
        <button
          onClick={loadPendingPhotos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingPhotos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              <img
                src={photo.photo_url}
                alt={`Academy photo ${photo.display_order}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              />
              
              <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <ClockIcon className="h-3 w-3" />
                <span>Pending</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Photo {photo.display_order}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Academy: {(photo as any).academies?.name || 'Unknown'}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View full size"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(photo.id)}
                  disabled={processing === photo.id}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                
                <button
                  onClick={() => handleReject(photo.id)}
                  disabled={processing === photo.id}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircleIcon className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(photo.id)}
                disabled={processing === photo.id}
                className="w-full mt-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Photo
              </button>

              {processing === photo.id && (
                <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XCircleIcon className="h-8 w-8" />
            </button>
            
            <img
              src={selectedPhoto.photo_url}
              alt={`Academy photo ${selectedPhoto.display_order}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Photo {selectedPhoto.display_order}</p>
                  <p className="text-sm text-gray-300">
                    Academy: {(selectedPhoto as any).academies?.name || 'Unknown'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      handleApprove(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                    disabled={processing === selectedPhoto.id}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleReject(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                    disabled={processing === selectedPhoto.id}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
