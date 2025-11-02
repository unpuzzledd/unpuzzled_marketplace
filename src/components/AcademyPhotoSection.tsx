import React, { useState } from 'react';
import { AcademyPhotoManager } from './AcademyPhotoManager';
import { PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface AcademyPhotoSectionProps {
  academyId: string;
  canEdit?: boolean;
}

export const AcademyPhotoSection: React.FC<AcademyPhotoSectionProps> = ({
  academyId,
  canEdit = false
}) => {
  const [showPhotoManager, setShowPhotoManager] = useState(false);

  return (
    <div className="bg-white border border-[#DBE5E0] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PhotoIcon className="h-5 w-5 text-[#0F1717]" />
          <h3 className="text-lg font-semibold text-[#0F1717]">Academy Photos</h3>
        </div>
        
        {canEdit && (
          <button
            onClick={() => setShowPhotoManager(!showPhotoManager)}
            className="flex items-center space-x-1 px-3 py-1 bg-[#F0F5F2] text-[#0F1717] rounded-lg hover:bg-[#E5F5F0] transition-colors"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            <span className="text-sm">Manage Photos</span>
          </button>
        )}
      </div>

      <AcademyPhotoManager
        academyId={academyId}
        canEdit={canEdit}
        showStatus={true}
        onPhotosChange={(photos) => {
          console.log('Photos updated:', photos);
        }}
      />
    </div>
  );
};
