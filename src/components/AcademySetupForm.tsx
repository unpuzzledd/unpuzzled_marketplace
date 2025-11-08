import React, { useState, useEffect } from 'react';
import { AcademyApi } from '../lib/academyApi';
import { Location, Skill } from '../types/database';
import { PhotoApi } from '../lib/photoApi';

interface AcademySetupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AcademySetupForm: React.FC<AcademySetupFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location_ids: [] as string[],
    skill_ids: [] as string[]
  });
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [locationsData, skillsData] = await Promise.all([
        AcademyApi.getLocations(),
        AcademyApi.getSkills()
      ]);
      console.log('Loaded locations:', locationsData);
      console.log('Loaded skills:', skillsData);
      setLocations(locationsData || []);
      setSkills(skillsData || []);
      
      if (!locationsData || locationsData.length === 0) {
        console.warn('No locations found');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationToggle = (locationId: string) => {
    setFormData(prev => {
      const locationIds = prev.location_ids.includes(locationId)
        ? prev.location_ids.filter(id => id !== locationId)
        : [...prev.location_ids, locationId];
      return { ...prev, location_ids: locationIds };
    });
  };

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => {
      const skillIds = prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter(id => id !== skillId)
        : [...prev.skill_ids, skillId];
      return { ...prev, skill_ids: skillIds };
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, 4 - photos.length); // Max 4 photos total
    
    if (validFiles.length === 0) return;

    // Validate file types and sizes
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    const invalidFiles = validFiles.filter(file => 
      !allowedTypes.includes(file.type) || file.size > MAX_SIZE
    );

    if (invalidFiles.length > 0) {
      setError('Please select valid image files (JPEG, PNG, WebP) under 5MB');
      return;
    }

    setPhotos(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Academy name is required');
      return;
    }

    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return;
    }

    if (formData.location_ids.length === 0) {
      setError('Please select at least one location');
      return;
    }

    if (formData.skill_ids.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting academy form with data:', {
        name: formData.name,
        phone_number: formData.phone_number,
        location_ids: formData.location_ids,
        skill_ids: formData.skill_ids,
        photos_count: photos.length
      });

      const result = await AcademyApi.createAcademyForOwner({
        name: formData.name,
        phone_number: formData.phone_number,
        location_ids: formData.location_ids,
        skill_ids: formData.skill_ids,
        photos: photos.length > 0 ? photos : undefined
      });

      console.log('Academy creation result:', result);

      if (result.data) {
        console.log('Academy created successfully:', result.data);
        setShowThankYou(true);
      } else {
        console.error('Failed to create academy:', result.error);
        setError(result.error || 'Failed to create academy');
      }
    } catch (err) {
      console.error('Error creating academy:', err);
      setError(err instanceof Error ? err.message : 'Failed to create academy');
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

  // Show thank you message after successful creation
  if (showThankYou) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Thank You Message */}
          <h2 className="text-2xl font-bold text-[#0F1717] mb-4">
            Thank you! Your academy has been created successfully.
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Admin will contact you for further status approval.
          </p>

          {/* Go to Dashboard Button */}
          <button
            onClick={() => {
              setShowThankYou(false); // Reset state so parent can show loading/dashboard
              onSuccess?.(); // Trigger fetchAcademyData in parent
            }}
            className="bg-[#009963] text-white py-3 px-8 rounded-lg hover:bg-[#007a4d] transition-colors font-medium text-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#0F1717] mb-6">Create Your Academy Profile</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academy Name */}
        <div>
          <label className="block text-sm font-medium text-[#0F1717] mb-2">
            Academy Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
            placeholder="Enter academy name"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-[#0F1717] mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009963] focus:border-transparent"
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-[#0F1717] mb-2">
            Locations <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 font-normal ml-2">(Select at least one)</span>
          </label>
          {locations.length === 0 ? (
            <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">No locations available. Please contact an administrator to add locations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {locations.map(location => (
                <label
                  key={location.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.location_ids.includes(location.id)
                      ? 'border-[#009963] bg-[#F0F5F2]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.location_ids.includes(location.id)}
                    onChange={() => handleLocationToggle(location.id)}
                    className="mr-2 h-4 w-4 text-[#009963] focus:ring-[#009963]"
                  />
                  <span className="text-sm text-[#0F1717]">
                    {location.name} - {location.city}, {location.state}
                  </span>
                </label>
              ))}
            </div>
          )}
          {formData.location_ids.length === 0 && locations.length > 0 && (
            <p className="mt-2 text-sm text-red-500">Please select at least one location</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-[#0F1717] mb-2">
            Skills <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 font-normal ml-2">(Select at least one)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {skills.map(skill => (
              <label
                key={skill.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.skill_ids.includes(skill.id)
                    ? 'border-[#009963] bg-[#F0F5F2]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.skill_ids.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  className="mr-2 h-4 w-4 text-[#009963] focus:ring-[#009963]"
                />
                <span className="text-sm text-[#0F1717]">{skill.name}</span>
              </label>
            ))}
          </div>
          {formData.skill_ids.length === 0 && (
            <p className="mt-2 text-sm text-red-500">Please select at least one skill</p>
          )}
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-[#0F1717] mb-2">
            Photos <span className="text-sm text-gray-500 font-normal">(Optional, up to 4)</span>
          </label>
          
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 4 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload photos (JPEG, PNG, WebP - Max 5MB each)
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {photos.length}/4 photos selected
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={submitting || locations.length === 0}
            onClick={(e) => {
              e.preventDefault();
              console.log('Create Academy button clicked');
              handleSubmit(e);
            }}
            className="flex-1 bg-[#009963] text-white py-3 px-6 rounded-lg hover:bg-[#007a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Creating Academy...' : 'Create Academy'}
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

        <p className="text-sm text-gray-500 text-center">
          Your academy will be submitted for admin approval. You'll be notified once it's approved.
        </p>
      </form>
    </div>
  );
};

