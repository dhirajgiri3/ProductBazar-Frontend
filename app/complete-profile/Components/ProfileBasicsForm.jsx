"use client";

import React from "react";
import { FormStep } from "./FormStep"; // Assuming FormStep is still needed
import { FormField } from "./ProfileFormComponents";
import ProfileImageUpload from "./ProfileImageUpload";

export const ProfileBasicsForm = ({
  isActive,
  formData,
  handleChange,
  formErrors,
  user,
  profileImagePreview,
  imageLoading,
  handleProfileImageChange,
  fileInputRef,
  currentStep,
}) => {
  return (
    <>
      {/* Step 1: Basic Information */}
      <FormStep title="Basic Information" isActive={isActive && currentStep === 1}>
        <div className="space-y-6">
          <ProfileImageUpload
            ref={fileInputRef}
            profileImagePreview={profileImagePreview}
            imageLoading={imageLoading}
            handleProfileImageChange={handleProfileImageChange}
            disabled={false} // Or pass a relevant disabled state if needed
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="firstName"
              label="First Name"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              error={formErrors.firstName}
            />
            <FormField
              name="lastName"
              label="Last Name"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              error={formErrors.lastName}
            />
            <div className="relative">
              <FormField
                name="email"
                label="Email"
                type="email"
                required={!formData.phone}
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                placeholder={user?.isEmailVerified ? "" : "your@email.com"}
                disabled={user?.isEmailVerified} // Optionally disable if verified
              />
              {user?.isEmailVerified && (
                <div className="absolute top-0 right-0 mt-1 mr-2 flex items-center text-green-500 text-xs pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </div>
              )}
            </div>
            <div className="relative">
              <FormField
                name="phone"
                label="Phone"
                type="tel"
                required={!formData.email}
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
                placeholder={user?.isPhoneVerified ? "" : "e.g., +12025550123"}
                disabled={user?.isPhoneVerified} // Optionally disable if verified
              />
              {user?.isPhoneVerified && (
                <div className="absolute top-0 right-0 mt-1 mr-2 flex items-center text-green-500 text-xs pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </div>
              )}
            </div>
          </div>
           {formErrors.contact && <p className="text-red-500 text-xs">{formErrors.contact}</p>}
        </div>
      </FormStep>

      {/* Step 2: Personal Information */}
      <FormStep title="Personal Information" isActive={isActive && currentStep === 2}>
        <div className="space-y-6">
          <p className="text-sm text-gray-500 italic">
            Personalize your experience with these details.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="gender"
              label="Gender"
              type="select"
              value={formData.gender}
              onChange={handleChange}
              error={formErrors.gender}
              options={[
                { value: "", label: "Select..." },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ]}
            />
            <FormField
              name="birthDate"
              label="Birth Date"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              error={formErrors.birthDate}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="grid grid-cols-1 gap-3">
              <FormField
                name="address.country"
                label="Country"
                type="text"
                value={formData.address?.country}
                onChange={handleChange}
                error={formErrors["address.country"]}
              />
              <FormField
                name="address.city"
                label="City"
                type="text"
                value={formData.address?.city}
                onChange={handleChange}
                error={formErrors["address.city"]}
              />
              <FormField
                name="address.street"
                label="Street Address (Optional)"
                type="text"
                value={formData.address?.street}
                onChange={handleChange}
                error={formErrors["address.street"]}
              />
            </div>
          </div>
          <FormField
            name="about"
            label="About You (Optional)"
            type="textarea"
            value={formData.about}
            onChange={handleChange}
            error={formErrors.about}
            placeholder="A short introduction about yourself..."
          />
        </div>
      </FormStep>
    </>
  );
};