import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { AcademyPhoto, AcademySkill } from '../types/database';

interface AdminApprovalWorkflowsProps {
  onApprovalComplete?: () => void;
}

export const AdminApprovalWorkflows: React.FC<AdminApprovalWorkflowsProps> = ({
  onApprovalComplete
}) => {
  const [pendingPhotos, setPendingPhotos] = useState<AcademyPhoto[]>([]);
  const [pendingSkills, setPendingSkills] = useState<AcademySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'skills'>('photos');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const [photos, skills] = await Promise.all([
        AdminApi.getPendingPhotos(),
        AdminApi.getPendingSkills()
      ]);
      setPendingPhotos(photos);
      setPendingSkills(skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePhoto = async (photoId: string) => {
    try {
      setProcessing(photoId);
      const result = await AdminApi.approvePhoto(photoId);
      if (result.data) {
        setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
        onApprovalComplete?.();
      } else {
        setError(result.error || 'Failed to approve photo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve photo');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectPhoto = async (photoId: string) => {
    try {
      setProcessing(photoId);
      const result = await AdminApi.rejectPhoto(photoId);
      if (result.data) {
        setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
        onApprovalComplete?.();
      } else {
        setError(result.error || 'Failed to reject photo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject photo');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveSkill = async (academySkillId: string) => {
    try {
      setProcessing(academySkillId);
      const result = await AdminApi.approveSkill(academySkillId);
      if (result.data) {
        setPendingSkills(prev => prev.filter(s => s.id !== academySkillId));
        onApprovalComplete?.();
      } else {
        setError(result.error || 'Failed to approve skill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve skill');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectSkill = async (academySkillId: string) => {
    try {
      setProcessing(academySkillId);
      const result = await AdminApi.rejectSkill(academySkillId);
      if (result.data) {
        setPendingSkills(prev => prev.filter(s => s.id !== academySkillId));
        onApprovalComplete?.();
      } else {
        setError(result.error || 'Failed to reject skill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject skill');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div>Loading pending approvals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Approval Workflows</h2>
          <p className="text-gray-600">Review and approve academy updates</p>
        </div>
        <button
          onClick={loadPendingItems}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'photos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Photos ({pendingPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Skills ({pendingSkills.length})
          </button>
        </nav>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {pendingPhotos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No photos pending approval</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={photo.photo_url}
                      alt={`Academy photo ${photo.display_order}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Pending
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">
                        Photo {photo.display_order}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Academy: {(photo as any).academies?.name || 'Unknown'}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprovePhoto(photo.id)}
                        disabled={processing === photo.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleRejectPhoto(photo.id)}
                        disabled={processing === photo.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Reject</span>
                      </button>
                    </div>

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
          )}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {pendingSkills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No skills pending approval</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skill
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingSkills.map((academySkill) => (
                      <tr key={academySkill.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {(academySkill as any).academies?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(academySkill as any).skills?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(academySkill as any).skills?.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(academySkill.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleApproveSkill(academySkill.id)}
                            disabled={processing === academySkill.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectSkill(academySkill.id)}
                            disabled={processing === academySkill.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
