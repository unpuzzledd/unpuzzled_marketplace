import React, { useState, useEffect } from 'react';
import { AdminApi } from '../lib/adminApi';
import { Academy, Location, Skill } from '../types/database';

interface AdminAcademyProfileViewProps {
  academy: Academy;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AdminAcademyProfileView: React.FC<AdminAcademyProfileViewProps> = ({
  academy,
  onSuccess,
  onCancel
}) => {
  const [status, setStatus] = useState<Academy['status']>(academy.status || 'pending');
  const [statusNotes, setStatusNotes] = useState<string>(academy.status_notes || '');
  const [locations, setLocations] = useState<Location[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load locations and skills to display academy details
      const [locationsData, skillsData] = await Promise.all([
        AdminApi.getLocations(),
        AdminApi.getSkills()
      ]);
      setLocations(locationsData || []);
      setSkills(skillsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const result = await AdminApi.updateAcademyStatusWithNotes(
        academy.id,
        status,
        statusNotes.trim() || null
      );

      if (result.data) {
        setSuccess('Academy status updated successfully');
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update academy status');
      }
    } catch (err) {
      console.error('Error updating academy status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update academy status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
      </div>
    );
  }

  // Get selected locations and skills
  const selectedLocations = locations.filter(loc => academy.location_ids?.includes(loc.id));
  const selectedSkills = skills.filter(skill => academy.skill_ids?.includes(skill.id));

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0F1717]">Academy Profile - {academy.name}</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Academy Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2">Academy Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Academy Name</label>
            <p className="text-base text-[#0F1717]">{academy.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <p className="text-base text-[#0F1717]">{academy.phone_number}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Owner</label>
            <p className="text-base text-[#0F1717]">{academy.owner?.full_name || academy.owner?.email || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
            <p className="text-base text-[#0F1717]">
              {new Date(academy.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Locations & Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2">Locations & Skills</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Locations</label>
            {selectedLocations.length > 0 ? (
              <div className="space-y-1">
                {selectedLocations.map(location => (
                  <div key={location.id} className="text-sm text-[#0F1717] bg-gray-50 p-2 rounded">
                    {location.name} - {location.city}, {location.state}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No locations selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Skills</label>
            {selectedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <span key={skill.id} className="text-sm text-[#0F1717] bg-[#F0F5F2] px-3 py-1 rounded-full">
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Photos */}
      {academy.photo_urls && academy.photo_urls.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#0F1717] border-b pb-2 mb-4">Academy Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {academy.photo_urls.map((photoUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={photoUrl}
                  alt={`Academy photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Management Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-[#0F1717] mb-4">Status Management</h3>
        
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F1717] mb-2">
              Current Status: <span className="font-normal text-gray-600">{academy.status}</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Academy['status'])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_process">In Process</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1717] mb-2">
              Status Notes <span className="text-gray-500 font-normal">(Optional - visible to academy owner)</span>
            </label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
              placeholder="Add notes about the status change (e.g., reason for approval, rejection, or suspension)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be visible to the academy owner in their dashboard.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#009963] text-white py-3 px-6 rounded-lg hover:bg-[#007a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Updating Status...' : 'Update Status'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

