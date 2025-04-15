"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";
import {
  FiUser,
  FiLink,
  FiBriefcase,
  FiSave,
  FiSettings,
  FiHeart,
  FiMapPin,
  FiInfo
} from "react-icons/fi";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import ProfileBasicsSection from "./Components/ProfileBasicsSection";
import ProfileDetailsSection from "./Components/ProfileDetailsSection";
import SkillsInterestsSection from "./Components/SkillsInterestsSection";
import SocialLinksSection from "./Components/SocialLinksSection";
import LocationSection from "./Components/LocationSection";
import ProfessionalSection from "./Components/ProfessionalSection";
import RoleSpecificSection from "./Components/RoleSpecificSection";
import LoaderComponent from "../../UI/LoaderComponent";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("basics");
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",

    // Profile Details
    bio: "",
    about: "",
    headline: "",
    openToWork: false,
    preferredContact: "",

    // Location
    address: {
      country: "",
      city: "",
      street: ""
    },

    // Skills & Interests
    skills: [],
    interests: [],

    // Professional Info
    companyName: "",
    companyWebsite: "",
    companyRole: "",
    industry: "",
    companySize: "",
    fundingStage: "",
    companyDescription: "",

    // Role-specific details
    roleDetails: {
      // Will be populated based on user role
    },

    // Social Links
    socialLinks: {
      website: "",
      twitter: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: ""
    },

    // Media
    profilePicture: null,
    profileImageFile: null, // Store the actual file for upload
    removeProfilePicture: false, // Flag to indicate if profile picture should be removed
    bannerImage: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      // Format interests properly
      const formattedInterests = Array.isArray(user.interests)
        ? user.interests.map(interest => {
            if (typeof interest === 'string') return { name: interest, strength: 5 };
            return interest;
          })
        : [];

      setFormData({
        // Basic Info
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",

        // Profile Details
        bio: user.bio || "",
        about: user.about || "",
        headline: user.headline || "",
        openToWork: user.openToWork || false,
        preferredContact: user.preferredContact || "",

        // Location
        address: typeof user.address === 'object' ? {
          country: user.address?.country || "",
          city: user.address?.city || "",
          street: user.address?.street || ""
        } : {
          country: "",
          city: "",
          street: user.address || "" // If it's a string, put it in street field for backward compatibility
        },

        // Skills & Interests
        skills: user.skills || [],
        interests: formattedInterests,

        // Professional Info
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companyRole: user.companyRole || "",
        industry: user.industry || "",
        companySize: user.companySize || "",
        fundingStage: user.fundingStage || "",
        companyDescription: user.companyDescription || "",

        // Role-specific details
        roleDetails: user.roleDetails || {},

        // Social Links
        socialLinks: {
          website: user.socialLinks?.website || "",
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          facebook: user.socialLinks?.facebook || "",
          instagram: user.socialLinks?.instagram || ""
        },

        // Media
        profilePicture: user.profilePicture || null,
        profileImageFile: null, // Initialize with null
        removeProfilePicture: false, // Initialize with false
        bannerImage: user.bannerImage || null
      });
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const errors = {};

    // Basic Info validation
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = "Invalid phone format";
    }

    // Date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.birthDate = "Birth date must be in the past";
      }
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        errors.birthDate = "Invalid date format";
      }
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }

    // About length validation
    if (formData.about && formData.about.length > 2000) {
      errors.about = "About must be less than 2000 characters";
    }

    // Validate URLs in social links
    Object.entries(formData.socialLinks).forEach(([key, value]) => {
      if (value && !/^https?:\/\/[^\s]+/.test(value)) {
        errors[`socialLinks.${key}`] = "Invalid URL format";
      }
    });

    // Validate company website if provided
    if (formData.companyWebsite && !/^https?:\/\/[^\s]+/.test(formData.companyWebsite)) {
      errors.companyWebsite = "Invalid URL format";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clean social links before submitting
  const cleanSocialLinks = (links) => {
    const cleaned = {};
    Object.entries(links).forEach(([key, value]) => {
      // Only include non-empty values
      if (value && value.trim()) {
        cleaned[key] = value.trim();
      }
    });
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      const loadingToast = toast.loading("Saving changes...");

      // Format interests properly
      const formattedInterests = formData.interests.map(interest => {
        if (typeof interest === 'string') {
          return { name: interest, strength: 5 };
        }
        return interest;
      });

      // We don't need to handle profile image separately anymore
      // The image is already uploaded to the server when the user selects it
      // We just need to make sure we don't send any blob URLs or file objects to the backend

      // Handle profile picture
      let profilePictureData = formData.profilePicture;

      // Handle profile picture removal or update
      if (formData.removeProfilePicture) {
        // If the removeProfilePicture flag is set, explicitly set profilePicture to null
        // This ensures the backend knows to remove the profile picture
        profilePictureData = null;
      } else if (!profilePictureData) {
        // If profilePictureData is null or undefined but removeProfilePicture is not set,
        // we should exclude profilePicture from the update to avoid overwriting it
        profilePictureData = undefined;
      } else if (profilePictureData && typeof profilePictureData === 'string') {
        // If it's a string URL, ensure it's properly formatted as an object for the backend
        if (profilePictureData.startsWith('blob:')) {
          // Don't send blob URLs to the backend
          profilePictureData = undefined;
        } else {
          // Format as object with url property
          profilePictureData = {
            url: profilePictureData,
            publicId: user?.profilePicture?.publicId || null
          };
        }
      } else if (profilePictureData && typeof profilePictureData === 'object' && !profilePictureData.url) {
        // If it's an object but doesn't have a url property, it might be invalid
        profilePictureData = undefined;
      }

      // Clean the form data
      const cleanedFormData = {
        ...formData,
        interests: formattedInterests,
        socialLinks: cleanSocialLinks(formData.socialLinks),
        // Convert birthDate string to Date object if it exists
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        // Set the properly formatted profilePicture
        profilePicture: profilePictureData,
        // Remove fields that shouldn't be sent to the backend
        profileImageFile: undefined,
        removeProfilePicture: undefined
      };

      // Fix companySize format if it includes "employees"
      if (cleanedFormData.companySize && cleanedFormData.companySize.includes(" employees")) {
        cleanedFormData.companySize = cleanedFormData.companySize.replace(/ employees$/, "");
      }

      // profilePicture is already set in cleanedFormData above
      // We don't need to do anything else with it here

      // Remove any undefined values to prevent issues
      Object.keys(cleanedFormData).forEach(key => {
        // Only remove undefined values
        // Keep null values for fields that should be explicitly cleared (like profilePicture)
        if (cleanedFormData[key] === undefined) {
          delete cleanedFormData[key];
        }
      });

      // We don't need to upload the profile image here anymore
      // It's already uploaded when the user selects it

      await updateProfile(cleanedFormData);
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully");
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
      console.error("Failed to update profile:", error);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const tabs = [
    { id: "basics", label: "Profile Basics", icon: FiUser },
    { id: "details", label: "Profile Details", icon: FiInfo },
    { id: "interests", label: "Skills & Interests", icon: FiHeart },
    { id: "social", label: "Social Links", icon: FiLink },
    { id: "location", label: "Location", icon: FiMapPin },
    { id: "professional", label: "Professional", icon: FiBriefcase },
    { id: "role", label: "Role Details", icon: FiSettings }
  ];

  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => {
    // Everyone sees profile basics, details, interests, social links, and location
    if (['basics', 'details', 'interests', 'social', 'location'].includes(tab.id)) {
      return true;
    }

    // Only show professional tab for relevant roles
    if (tab.id === 'professional') {
      return ['startupOwner', 'investor', 'agency', 'freelancer', 'jobseeker'].includes(user?.role);
    }

    // Only show role details tab for roles that have specific details
    if (tab.id === 'role') {
      return ['startupOwner', 'investor', 'agency', 'freelancer', 'jobseeker'].includes(user?.role);
    }

    return false;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex items-center justify-center min-h-screen w-full px-4 py-8">
            <motion.div
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full opacity-20 -mr-32 -mt-32 z-0"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full opacity-20 -ml-32 -mb-32 z-0"></div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your profile information and preferences</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  aria-label="Close"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="relative z-10 border-b border-gray-100 px-6 bg-white">
                <nav className="flex space-x-1 overflow-x-auto hide-scrollbar" aria-label="Tabs">
                  {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${isActive
                          ? "border-violet-500 text-violet-600 bg-violet-50 bg-opacity-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        <Icon className={`mr-2 ${isActive ? "text-violet-500" : "text-gray-400"}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 max-h-[calc(100vh-20rem)] overflow-y-auto bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence>
                    {activeTab === "basics" && (
                      <ProfileBasicsSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "details" && (
                      <ProfileDetailsSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "interests" && (
                      <SkillsInterestsSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "social" && (
                      <SocialLinksSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "location" && (
                      <LocationSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "professional" && (
                      <ProfessionalSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "role" && (
                      <RoleSpecificSection
                        formData={formData}
                        setFormData={setFormData}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 transition-all duration-200 shadow-sm"
                  disabled={authLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
                  disabled={authLoading || !hasUnsavedChanges}
                >
                  {authLoading ? (
                    <>
                      <LoaderComponent size="small" color="white" text="" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
