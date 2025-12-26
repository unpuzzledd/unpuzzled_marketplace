import { useState, useEffect, useRef } from 'react'
import { User } from '../types/auth'
import { AdminApi } from '../lib/adminApi'
import { Skill } from '../types/database'

interface ProfileCompletionProps {
  user: User
  onSubmit: (data: {
    full_name: string;
    phone_number?: string;
    date_of_birth?: string;
    school_name?: string;
    location?: string;
    teacher_skills?: string[];
  }) => Promise<{ success: boolean; error?: string }>
  onSuccess: (role: string) => void
}

export const ProfileCompletion = ({ user, onSubmit, onSuccess }: ProfileCompletionProps) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone_number: user.phone_number || '',
    date_of_birth: user.date_of_birth || '',
    school_name: user.school_name || '',
    location: user.location || ''
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.teacher_skills || [])
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false)
  const skillsDropdownRef = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isStudent = user.role === 'student'
  const isTeacher = user.role === 'teacher'

  // Load skills for teachers
  useEffect(() => {
    if (isTeacher) {
      const loadSkills = async () => {
        try {
          setSkillsLoading(true)
          const skillsData = await AdminApi.getSkills()
          setSkills(skillsData || [])
        } catch (error) {
          console.error('Failed to load skills:', error)
          setSkills([])
        } finally {
          setSkillsLoading(false)
        }
      }
      loadSkills()
    }
  }, [isTeacher])

  // Close skills dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(target)) {
        setShowSkillsDropdown(false)
      }
    }

    if (showSkillsDropdown) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSkillsDropdown])

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Name is required for both
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Name is required'
    }

    if (isStudent) {
      // Date of birth is required for students
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required'
      } else {
        // Validate date is not in the future
        const dob = new Date(formData.date_of_birth)
        const today = new Date()
        if (dob > today) {
          newErrors.date_of_birth = 'Date of birth cannot be in the future'
        }
      }
    }

    if (isTeacher) {
      // Phone number is required for teachers
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'Phone number is required'
      } else {
        // Validate phone number format (at least 10 digits)
        const phoneRegex = /^[0-9]{10,}$/
        const cleanedPhone = formData.phone_number.replace(/\D/g, '')
        if (!phoneRegex.test(cleanedPhone)) {
          newErrors.phone_number = 'Please enter a valid phone number (at least 10 digits)'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        full_name: formData.full_name.trim(),
        phone_number: isTeacher ? formData.phone_number.trim() : undefined,
        date_of_birth: isStudent ? formData.date_of_birth : undefined,
        school_name: isStudent && formData.school_name.trim() ? formData.school_name.trim() : undefined,
        location: isStudent && formData.location.trim() ? formData.location.trim() : undefined,
        teacher_skills: isTeacher ? selectedSkills : undefined
      }
      
      console.log('Submitting profile data:', submitData)
      
      const result = await onSubmit(submitData)

      if (result.success) {
        console.log('Profile update successful, redirecting...')
        // Pass the role to the success callback
        onSuccess(user.role || '')
      } else {
        console.error('Profile update failed:', result.error)
        setSubmitError(result.error || 'Failed to save profile. Please try again.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Please provide the following information to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Field - Required for both */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          {/* Student-specific fields */}
          {isStudent && (
            <>
              {/* Date of Birth - Required for students */}
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                )}
              </div>

              {/* School Name - Optional for students */}
              <div>
                <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-1">
                  School Name <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your school name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Location/Society Name - Optional for students */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Society Name <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your location or society name"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* Teacher-specific fields */}
          {isTeacher && (
            <>
              {/* Phone Number - Required for teachers */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>

              {/* Skills Selection - Optional for teachers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills You Can Teach <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative" ref={skillsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                    disabled={isSubmitting || skillsLoading}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span className="text-gray-700">
                      {selectedSkills.length === 0 
                        ? 'Select skills you can teach' 
                        : selectedSkills.length === 1
                        ? skills.find(s => s.id === selectedSkills[0])?.name || '1 skill selected'
                        : `${selectedSkills.length} skills selected`}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform ${showSkillsDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSkillsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {skillsLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading skills...</div>
                      ) : skills.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No skills available</div>
                      ) : (
                        <div className="p-2">
                          {skills.map((skill) => (
                            <label
                              key={skill.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSkills.includes(skill.id)}
                                onChange={() => toggleSkill(skill.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isSubmitting}
                              />
                              <span className="ml-2 text-sm text-gray-700">{skill.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSkills.map((skillId) => {
                      const skill = skills.find(s => s.id === skillId)
                      return skill ? (
                        <span
                          key={skillId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => toggleSkill(skillId)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                            disabled={isSubmitting}
                          >
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

