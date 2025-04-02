"use client";

import { motion } from "framer-motion";
import { useAuth } from "../../../../Contexts/Auth/AuthContext";
import Link from "next/link";
import { FiAlertCircle, FiCheck } from "react-icons/fi";

const BasicInfoSection = ({ formData, setFormData, validationErrors, setValidationErrors, setHasUnsavedChanges }) => {
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    setHasUnsavedChanges(true);
  };

  const getInputStatus = (fieldName) => {
    if (validationErrors[fieldName]) return "error";
    if (formData[fieldName]?.length > 0) return "success";
    return "normal";
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "error":
        return "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500";
      case "success":
        return "border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500";
      default:
        return "border-gray-200 focus:ring-violet-500 focus:border-violet-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              First Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm transition-colors
                  ${getStatusStyles(getInputStatus("firstName"))}`}
                maxLength={50}
              />
              {getInputStatus("firstName") === "success" && (
                <FiCheck className="absolute right-3 top-3 text-green-500 w-4 h-4" />
              )}
            </div>
            {validationErrors.firstName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {validationErrors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              Last Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm transition-colors
                  ${getStatusStyles(getInputStatus("lastName"))}`}
                maxLength={50}
              />
              {getInputStatus("lastName") === "success" && (
                <FiCheck className="absolute right-3 top-3 text-green-500 w-4 h-4" />
              )}
            </div>
            {validationErrors.lastName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              Email
              <span className={`text-xs px-2 py-0.5 rounded-full 
                ${user?.isEmailVerified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"}`}
              >
                {user?.isEmailVerified ? "Verified" : "Unverified"}
              </span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm transition-colors
                  ${getStatusStyles(getInputStatus("email"))}`}
              />
              {!user?.isEmailVerified && formData.email && (
                <Link 
                  href="/auth/verify-email"
                  className="absolute right-3 top-2.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Verify Now
                </Link>
              )}
            </div>
            {validationErrors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              Phone
              <span className={`text-xs px-2 py-0.5 rounded-full 
                ${user?.isPhoneVerified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"}`}
              >
                {user?.isPhoneVerified ? "Verified" : "Unverified"}
              </span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm transition-colors
                  ${getStatusStyles(getInputStatus("phone"))}`}
              />
              {!user?.isPhoneVerified && formData.phone && (
                <Link 
                  href="/auth/verify-phone"
                  className="absolute right-3 top-2.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Verify Now
                </Link>
              )}
            </div>
            {validationErrors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {validationErrors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h4>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              rows="3"
              maxLength={500}
              placeholder="Write a short bio about yourself..."
            />
            <p className="text-xs text-gray-400 text-right">{formData.bio.length}/500</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                maxLength={100}
                placeholder="Your location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Contact Method</label>
              <input
                type="text"
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-gray-900 text-sm border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                maxLength={100}
                placeholder="e.g., Email, Phone, LinkedIn"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BasicInfoSection;