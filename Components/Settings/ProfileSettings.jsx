"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiCheck, FiX, FiCamera, FiUser } from 'react-icons/fi';
import { useAuth } from '../../Contexts/Auth/AuthContext';
import api from '../../Utils/api';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const ProfileSettings = ({ user }) => {
  const { refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      country: user?.address?.country || ''
    },
    openToWork: user?.openToWork || false,
    companyName: user?.companyName || '',
    companyRole: user?.companyRole || '',
    companyWebsite: user?.companyWebsite || '',
    socialLinks: {
      website: user?.socialLinks?.website || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || '',
      instagram: user?.socialLinks?.instagram || ''
    }
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profilePicture?.url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number with country code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // First update profile data
      const response = await api.put('/auth/profile', formData);

      // Then upload profile image if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);

        await api.post('/auth/update-profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Refresh user data in context
      await refreshUserData();

      setSuccessMessage('Profile updated successfully');
      toast.success('Profile updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center"
        >
          <FiCheck className="mr-2" />
          {successMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Image */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <FiUser size={32} />
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-violet-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-violet-700 transition-colors"
            >
              <FiCamera size={14} />
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-sm text-gray-500">Click the camera icon to change your profile picture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Personal Information</h3>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="openToWork"
                name="openToWork"
                checked={formData.openToWork}
                onChange={handleChange}
                className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
              <label htmlFor="openToWork" className="ml-2 block text-sm text-gray-700">
                Open to Work
              </label>
            </div>
          </div>

          {/* Professional Information & Address */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Professional Information</h3>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="companyRole" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                id="companyRole"
                name="companyRole"
                value={formData.companyRole}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                Company Website
              </label>
              <input
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <h3 className="text-md font-medium text-gray-700 mt-6 mb-2">Address</h3>

            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-700 mb-4">Social Links</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="socialLinks.website" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Website
              </label>
              <input
                type="url"
                id="socialLinks.website"
                name="socialLinks.website"
                value={formData.socialLinks.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                id="socialLinks.linkedin"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="url"
                id="socialLinks.twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="socialLinks.github" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub
              </label>
              <input
                type="url"
                id="socialLinks.github"
                name="socialLinks.github"
                value={formData.socialLinks.github}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                id="socialLinks.instagram"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
