import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  onSuccess?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSuccess }) => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateUserProfile({
        full_name: formData.full_name.trim() || null,
        phone_number: formData.phone_number.trim() || null
      });

      if (result.success) {
        setSuccess(true);
        setIsEditing(false);
        if (onSuccess) {
          onSuccess();
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating your profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-[#DBE5E0] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0F1717]">Profile Settings</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors text-sm font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">Profile updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#0F1717] mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009963]"
                  placeholder="Enter your full name"
                  required
                />
              ) : (
                <div className="w-full px-3 py-2 bg-[#F0F5F2] rounded-lg text-[#0F1717]">
                  {user.full_name || 'Not set'}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#0F1717] mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DBE5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009963]"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-[#F0F5F2] rounded-lg text-[#0F1717]">
                  {user.phone_number || 'Not set'}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#0F1717] mb-2">
                Email
              </label>
              <div className="w-full px-3 py-2 bg-[#F0F5F2] rounded-lg text-[#5E8C7D]">
                {user.email}
              </div>
              <p className="text-xs text-[#5E8C7D] mt-1">Email cannot be changed</p>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

