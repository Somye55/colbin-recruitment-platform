import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { profileService, UserProfile, UpdateProfileData } from '../services/profile';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    designation: profile.designation || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    country: profile.country || '',
    phone: profile.phone || '',
    gender: profile.gender || '',
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
    totalExperience: profile.totalExperience || 0,
    currentCTC: profile.currentCTC || 0,
    expectedCTC: profile.expectedCTC || 0,
    noticePeriod: profile.noticePeriod || '',
    noticePeriodDays: profile.noticePeriodDays || 0,
    bio: profile.bio || '',
    skills: profile.skills || [],
    experience: profile.experience || '',
    resumeUrl: profile.resumeUrl || '',
    avatar: profile.avatar || '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when profile prop changes
  useEffect(() => {
    setFormData({
      designation: profile.designation || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      country: profile.country || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
      totalExperience: profile.totalExperience || 0,
      currentCTC: profile.currentCTC || 0,
      expectedCTC: profile.expectedCTC || 0,
      noticePeriod: profile.noticePeriod || '',
      noticePeriodDays: profile.noticePeriodDays || 0,
      bio: profile.bio || '',
      skills: profile.skills || [],
      experience: profile.experience || '',
      resumeUrl: profile.resumeUrl || '',
      avatar: profile.avatar || '',
    });
  }, [profile]);

  const designationOptions = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
  const noticePeriodOptions = ['Yes', 'No'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (formData.totalExperience === undefined || formData.totalExperience === null) {
      newErrors.totalExperience = 'Total experience is required';
    }
    if (formData.currentCTC === undefined || formData.currentCTC === null) {
      newErrors.currentCTC = 'Current CTC is required';
    }
    if (formData.expectedCTC === undefined || formData.expectedCTC === null) {
      newErrors.expectedCTC = 'Expected CTC is required';
    }
    if (!formData.noticePeriod) newErrors.noticePeriod = 'Notice period status is required';

    // Conditional validation
    if (formData.noticePeriod === 'Yes' && (!formData.noticePeriodDays || formData.noticePeriodDays <= 0)) {
      newErrors.noticePeriodDays = 'Notice period days is required when notice period is Yes';
    }

    // Business logic validations
    if (formData.expectedCTC !== undefined && formData.currentCTC !== undefined && formData.expectedCTC < formData.currentCTC) {
      newErrors.expectedCTC = 'Expected CTC must be greater than or equal to current CTC';
    }

    // Date validation
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18 || age > 100) {
        newErrors.dob = 'Age must be between 18 and 100 years';
      }
    }

    // Experience validation
    if (formData.totalExperience !== undefined && (formData.totalExperience < 0 || formData.totalExperience > 50)) {
      newErrors.totalExperience = 'Total experience must be between 0 and 50 years';
    }

    // CTC validation
    if (formData.currentCTC !== undefined && (formData.currentCTC < 0 || formData.currentCTC > 10000000)) {
      newErrors.currentCTC = 'Current CTC must be between 0 and 10,000,000';
    }

    if (formData.expectedCTC !== undefined && (formData.expectedCTC < 0 || formData.expectedCTC > 10000000)) {
      newErrors.expectedCTC = 'Expected CTC must be between 0 and 10,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await profileService.updateProfile(formData);

      if (response.success && response.data) {
        toast.success('Profile updated successfully!');
        onSave(response.data);
      } else {
        toast.error(response.message || 'Failed to update profile');
        if (response.errors) {
          const newErrors: Record<string, string> = {};
          response.errors.forEach((error: any) => {
            if (error.field && error.message) {
              newErrors[error.field] = error.message;
            }
          });
          setErrors(newErrors);
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation *
            </label>
            <select
              value={formData.designation || ''}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.designation ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Designation</option>
              {designationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Gender</option>
              {genderOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your country"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.dob || ''}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.dob ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Experience (Years) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={formData.totalExperience || ''}
              onChange={(e) => handleInputChange('totalExperience', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.totalExperience ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 5.5"
            />
            {errors.totalExperience && <p className="text-red-500 text-sm mt-1">{errors.totalExperience}</p>}
          </div>
        </div>

        {/* CTC Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current CTC *
            </label>
            <input
              type="number"
              min="0"
              max="10000000"
              value={formData.currentCTC || ''}
              onChange={(e) => handleInputChange('currentCTC', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.currentCTC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter current CTC"
            />
            {errors.currentCTC && <p className="text-red-500 text-sm mt-1">{errors.currentCTC}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected CTC *
            </label>
            <input
              type="number"
              min="0"
              max="10000000"
              value={formData.expectedCTC || ''}
              onChange={(e) => handleInputChange('expectedCTC', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.expectedCTC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter expected CTC"
            />
            {errors.expectedCTC && <p className="text-red-500 text-sm mt-1">{errors.expectedCTC}</p>}
          </div>
        </div>

        {/* Notice Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice Period *
            </label>
            <select
              value={formData.noticePeriod || ''}
              onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.noticePeriod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Notice Period</option>
              {noticePeriodOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.noticePeriod && <p className="text-red-500 text-sm mt-1">{errors.noticePeriod}</p>}
          </div>

          {formData.noticePeriod === 'Yes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Period Days *
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={formData.noticePeriodDays || ''}
                onChange={(e) => handleInputChange('noticePeriodDays', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.noticePeriodDays ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter notice period days"
              />
              {errors.noticePeriodDays && <p className="text-red-500 text-sm mt-1">{errors.noticePeriodDays}</p>}
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
          <p className="text-sm text-gray-500 mt-1">Optional - Maximum 500 characters</p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            >
              Add
            </button>
          </div>
          {formData.skills && formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Experience Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Description
          </label>
          <textarea
            value={formData.experience || ''}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe your work experience..."
          />
          <p className="text-sm text-gray-500 mt-1">Optional - Maximum 1000 characters</p>
        </div>

        {/* Resume URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume URL
          </label>
          <input
            type="url"
            value={formData.resumeUrl || ''}
            onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/resume.pdf"
          />
          <p className="text-sm text-gray-500 mt-1">Optional - Link to your resume</p>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            value={formData.avatar || ''}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-sm text-gray-500 mt-1">Optional - Link to your profile picture</p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;