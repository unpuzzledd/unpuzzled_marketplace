import React, { useState } from 'react';
import { 
  EyeIcon, 
  TrashIcon, 
  XCircleIcon
} from '@heroicons/react/24/outline';

interface PhotoGalleryProps {
  photos: string[];
  onDeletePhoto?: (photoUrl: string) => void;
  onReorderPhotos?: (photoUrls: string[]) => void;
  canEdit?: boolean;
  showStatus?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDeletePhoto,
  onReorderPhotos,
  canEdit = false
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);

  // Photos are now just URLs, maintain order as-is
  const sortedPhotos = [...photos];

  const handleDragStart = (e: React.DragEvent, photoUrl: string) => {
    if (!canEdit || !onReorderPhotos) return;
    setDraggedPhoto(photoUrl);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPhotoUrl: string) => {
    e.preventDefault();
    if (!draggedPhoto || !onReorderPhotos || draggedPhoto === targetPhotoUrl) return;

    const draggedIndex = sortedPhotos.findIndex(url => url === draggedPhoto);
    const targetIndex = sortedPhotos.findIndex(url => url === targetPhotoUrl);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder array
    const newPhotos = [...sortedPhotos];
    const [removed] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, removed);
    
    onReorderPhotos(newPhotos);
    setDraggedPhoto(null);
  };

  const handleDelete = (photoUrl: string) => {
    if (onDeletePhoto && window.confirm('Are you sure you want to delete this photo?')) {
      onDeletePhoto(photoUrl);
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
        {sortedPhotos.map((photoUrl, index) => (
          <div
            key={photoUrl}
            className={`
              relative group rounded-lg overflow-hidden bg-gray-100 aspect-square
              ${canEdit && onReorderPhotos ? 'cursor-move' : 'cursor-pointer'}
              ${draggedPhoto === photoUrl ? 'opacity-50' : ''}
            `}
            draggable={canEdit && !!onReorderPhotos}
            onDragStart={(e) => handleDragStart(e, photoUrl)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, photoUrl)}
            onClick={() => setSelectedPhoto(photoUrl)}
          >
            <img
              src={photoUrl}
              alt={`Academy photo ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photoUrl);
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
                      handleDelete(photoUrl);
                    }}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    title="Delete photo"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Order Badge */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {index + 1}
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
              src={selectedPhoto}
              alt="Academy photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Photo {sortedPhotos.indexOf(selectedPhoto) + 1}</p>
                </div>
                
                <div className="flex space-x-2">
                  {canEdit && onDeletePhoto && (
                    <button
                      onClick={() => {
                        handleDelete(selectedPhoto);
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
