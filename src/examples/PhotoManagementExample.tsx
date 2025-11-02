import React, { useState } from 'react';
import { AcademyPhotoSection } from '../components/AcademyPhotoSection';
import { AdminPhotoApproval } from '../components/AdminPhotoApproval';

// Example usage of the photo management system
export const PhotoManagementExample: React.FC = () => {
  const [currentView, setCurrentView] = useState<'academy' | 'admin'>('academy');
  
  // This would typically come from your authentication system
  const mockAcademyId = 'academy-uuid-123';
  // const mockUserId = 'user-uuid-456';

  return (
    <div className="min-h-screen bg-[#F7FCFA] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setCurrentView('academy')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'academy'
                ? 'bg-[#009963] text-white'
                : 'bg-white text-[#0F1717] border border-[#DBE5E0]'
            }`}
          >
            Academy View
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'admin'
                ? 'bg-[#009963] text-white'
                : 'bg-white text-[#0F1717] border border-[#DBE5E0]'
            }`}
          >
            Admin View
          </button>
        </div>

        {/* Academy Photo Management */}
        {currentView === 'academy' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DBE5E0] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0F1717] mb-4">
                Academy Photo Management
              </h2>
              <p className="text-[#5E8C7D] mb-6">
                Academy owners can upload up to 4 photos. Photos require admin approval before being visible to the public.
              </p>
              
              <AcademyPhotoSection
                academyId={mockAcademyId}
                canEdit={true} // Academy owners can edit their photos
              />
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                How to Use Photo Management
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>1. Upload Photos:</strong> Drag and drop images or click to select files</p>
                <p><strong>2. Photo Requirements:</strong> JPEG, PNG, or WebP format, max 5MB each</p>
                <p><strong>3. Approval Process:</strong> Photos start as "pending" and require admin approval</p>
                <p><strong>4. Display Order:</strong> Drag photos to reorder them (1-4)</p>
                <p><strong>5. Status Tracking:</strong> Monitor approval status of your photos</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Photo Approval */}
        {currentView === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DBE5E0] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#0F1717] mb-4">
                Admin Photo Approval
              </h2>
              <p className="text-[#5E8C7D] mb-6">
                Admins can approve, reject, or delete photos uploaded by academy owners.
              </p>
              
              <AdminPhotoApproval
                onApprovalComplete={() => {
                  console.log('Photo approval completed');
                }}
              />
            </div>

            {/* Admin Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                Admin Photo Management
              </h3>
              <div className="text-sm text-green-800 space-y-2">
                <p><strong>Approve:</strong> Makes photos visible to the public</p>
                <p><strong>Reject:</strong> Marks photos as rejected (academy can replace them)</p>
                <p><strong>Delete:</strong> Permanently removes photos from storage</p>
                <p><strong>View:</strong> Click on photos to see full-size preview</p>
              </div>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Technical Implementation
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Storage:</strong> Photos stored in Supabase Storage bucket 'academy-photos'</p>
            <p><strong>Database:</strong> Photo metadata stored in 'academy_photos' table</p>
            <p><strong>Security:</strong> Row Level Security (RLS) policies control access</p>
            <p><strong>CDN:</strong> Photos served via Supabase CDN for fast loading</p>
            <p><strong>File Limits:</strong> Max 4 photos per academy, 5MB per file</p>
          </div>
        </div>
      </div>
    </div>
  );
};
