import React, { useState, useCallback, useRef } from 'react';
import { PhotoApi } from '../lib/photoApi';
import { PhotoUploadProgress } from '../types/database';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface PhotoUploadProps {
  academyId: string;
  onUploadComplete: (photoUrl: string) => void;
  onUploadError: (error: string) => void;
  maxPhotos?: number;
  existingPhotos?: number;
  disabled?: boolean;
}

interface UploadingFile extends PhotoUploadProgress {
  id: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  academyId,
  onUploadComplete,
  onUploadError,
  maxPhotos = 4,
  existingPhotos = 0,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSlots = maxPhotos - existingPhotos;
  const canUpload = availableSlots > 0 && !disabled;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canUpload) {
      setIsDragOver(true);
    }
  }, [canUpload]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!canUpload) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [canUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!canUpload || files.length === 0) return;

    const filesToUpload = files.slice(0, availableSlots);
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const uploadId = `${Date.now()}-${i}`;
      const displayOrder = existingPhotos + i + 1;

      // Add to uploading files
      setUploadingFiles(prev => [...prev, {
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        const result = await PhotoApi.uploadPhoto(
          academyId,
          file,
          displayOrder,
          (progress) => {
            setUploadingFiles(prev => 
              prev.map(f => f.id === uploadId ? { ...f, ...progress } : f)
            );
          }
        );

        if (result.success) {
          onUploadComplete(result.photo_url!);
          // Remove from uploading files after a delay
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
          }, 2000);
        } else {
          onUploadError(result.error || 'Upload failed');
          setUploadingFiles(prev => 
            prev.map(f => f.id === uploadId ? { ...f, status: 'error', error: result.error } : f)
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        onUploadError(errorMessage);
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadId ? { ...f, status: 'error', error: errorMessage } : f)
        );
      }
    }
  }, [academyId, canUpload, existingPhotos, availableSlots, onUploadComplete, onUploadError]);

  const removeUploadingFile = useCallback((uploadId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
  }, []);

  const openFileDialog = useCallback(() => {
    if (canUpload) {
      fileInputRef.current?.click();
    }
  }, [canUpload]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-2">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Upload academy photos</p>
              <p className="text-xs">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Up to {availableSlots} more photos allowed (max {maxPhotos} total)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <PhotoIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadingFile.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                
                {uploadingFile.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadingFile.progress}% uploaded
                    </p>
                  </div>
                )}
                
                {uploadingFile.status === 'completed' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Upload completed</span>
                  </div>
                )}
                
                {uploadingFile.status === 'error' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">
                      {uploadingFile.error || 'Upload failed'}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => removeUploadingFile(uploadingFile.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Limit Reached */}
      {!canUpload && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Maximum {maxPhotos} photos allowed per academy
          </p>
        </div>
      )}
    </div>
  );
};
