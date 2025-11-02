import React, { useState } from 'react';
import { AcademyPhoto } from '../types/database';
import { 
  EyeIcon, 
  TrashIcon, 
  // PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface PhotoGalleryProps {
  photos: AcademyPhoto[];
  onDeletePhoto?: (photoId: string) => void;
  onReorderPhotos?: (photoId: string, newOrder: number) => void;
  canEdit?: boolean;
  showStatus?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDeletePhoto,
  onReorderPhotos,
  canEdit = false,
  showStatus = false
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<AcademyPhoto | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);

  // Sort photos by display order
  const sortedPhotos = [...photos].sort((a, b) => a.display_order - b.display_order);

  const getStatusIcon = (status: AcademyPhoto['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: AcademyPhoto['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return '';
    }
  };

  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    if (!canEdit || !onReorderPhotos) return;
    setDraggedPhoto(photoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPhotoId: string) => {
    e.preventDefault();
    if (!draggedPhoto || !onReorderPhotos || draggedPhoto === targetPhotoId) return;

    const draggedIndex = sortedPhotos.findIndex(p => p.id === draggedPhoto);
    const targetIndex = sortedPhotos.findIndex(p => p.id === targetPhotoId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = targetIndex + 1;
    onReorderPhotos(draggedPhoto, newOrder);
    setDraggedPhoto(null);
  };

  const handleDelete = (photoId: string) => {
    if (onDeletePhoto && window.confirm('Are you sure you want to delete this photo?')) {
      onDeletePhoto(photoId);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.id}
            className={`
              relative group rounded-lg overflow-hidden bg-gray-100 aspect-square
              ${canEdit && onReorderPhotos ? 'cursor-move' : 'cursor-pointer'}
              ${draggedPhoto === photo.id ? 'opacity-50' : ''}
            `}
            draggable={canEdit && !!onReorderPhotos}
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, photo.id)}
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.photo_url}
              alt={`Academy photo ${photo.display_order}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                  className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  title="View photo"
                >
                  <EyeIcon className="h-4 w-4 text-gray-700" />
                </button>
                
                {canEdit && onDeletePhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Delete photo"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Badge */}
            {showStatus && (
              <div className="absolute top-2 left-2 flex items-center space-x-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                {getStatusIcon(photo.status)}
                <span className="text-xs font-medium text-gray-700">
                  {getStatusText(photo.status)}
                </span>
              </div>
            )}

            {/* Order Badge */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {photo.display_order}
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
                  {showStatus && (
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedPhoto.status)}
                      <span className="text-sm">{getStatusText(selectedPhoto.status)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {canEdit && onDeletePhoto && (
                    <button
                      onClick={() => {
                        handleDelete(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
