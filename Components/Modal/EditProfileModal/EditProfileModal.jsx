"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import BasicInfoSection from "./Components/BasicInfoSection";
import ProfileImageSection from "./Components/ProfileImageSection";
import SocialLinksSection from "./Components/SocialLinksSection";
import RoleSpecificSection from "./Components/RoleSpecificSection";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    about: "",
    address: "",
    preferredContact: "",
    skills: [],
    companyName: "",
    companyWebsite: "",
    companyRole: "",
    industry: "",
    companySize: "",
    fundingStage: "",
    companyDescription: "",
    socialLinks: {
      website: "",
      twitter: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: ""
    },
    profilePicture: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        about: user.about || "",
        address: user.address || "",
        preferredContact: user.preferredContact || "",
        skills: user.skills || [],
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companyRole: user.companyRole || "",
        industry: user.industry || "",
        companySize: user.companySize || "",
        fundingStage: user.fundingStage || "",
        companyDescription: user.companyDescription || "",
        socialLinks: {
          website: user.socialLinks?.website || "",
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          facebook: user.socialLinks?.facebook || "",
          instagram: user.socialLinks?.instagram || ""
        },
        profilePicture: user.profilePicture || null
      });
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = "Invalid phone format";
    }
    
    // Validate URLs in social links
    Object.entries(formData.socialLinks).forEach(([key, value]) => {
      if (value && !/^https?:\/\/[^\s]+/.test(value)) {
        errors[`socialLinks.${key}`] = "Invalid URL format";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      const loadingToast = toast.loading("Saving changes...");
      await updateProfile(formData);
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully");
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "user" },
    { id: "profile", label: "Profile Picture", icon: "camera" },
    { id: "social", label: "Social Links", icon: "link" },
    { id: "role", label: "Role Details", icon: "briefcase" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your profile information and preferences</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b px-6">
                <nav className="flex space-x-4 overflow-x-auto hide-scrollbar" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "border-violet-500 text-violet-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "basic" && (
                      <BasicInfoSection
                        formData={formData}
                        setFormData={setFormData}
                        validationErrors={validationErrors}
                        setValidationErrors={setValidationErrors}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    )}
                    {activeTab === "profile" && (
                      <ProfileImageSection
                        formData={formData}
                        setFormData={setFormData}
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
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  disabled={authLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={authLoading || !hasUnsavedChanges}
                >
                  {authLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
