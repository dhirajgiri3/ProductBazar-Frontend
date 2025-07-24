"use client";

import React from "react";
import { FormStep } from "./FormStep";
import { FormField } from "./ProfileFormComponents";

export const SocialLinksForm = ({
  isActive,
  formData,
  handleChange,
  formErrors = {},
  currentStep,
}) => {
  return (
    <FormStep title="Social Links" isActive={isActive && currentStep === 3}>
      <div className="space-y-6">
        <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
          <p className="text-sm text-violet-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connect your social profiles (optional). This helps others find and connect with you.
          </p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Social Media Links
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="socialLinks.linkedin"
              label="LinkedIn"
              type="url"
              value={formData.socialLinks?.linkedin}
              onChange={handleChange}
              error={formErrors["socialLinks.linkedin"]}
              placeholder="https://linkedin.com/in/..."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>}
            />
            <FormField
              name="socialLinks.twitter"
              label="Twitter / X"
              type="url"
              value={formData.socialLinks?.twitter}
              onChange={handleChange}
              error={formErrors["socialLinks.twitter"]}
              placeholder="https://x.com/..."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>}
            />
            <FormField
              name="socialLinks.github"
              label="GitHub"
              type="url"
              value={formData.socialLinks?.github}
              onChange={handleChange}
              error={formErrors["socialLinks.github"]}
              placeholder="https://github.com/..."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>}
            />
            <FormField
              name="socialLinks.website"
              label="Personal Website / Portfolio"
              type="url"
              value={formData.socialLinks?.website}
              onChange={handleChange}
              error={formErrors["socialLinks.website"]}
              placeholder="https://yourwebsite.com"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>}
            />
            <FormField
              name="socialLinks.facebook"
              label="Facebook (Optional)"
              type="url"
              value={formData.socialLinks?.facebook}
              onChange={handleChange}
              error={formErrors["socialLinks.facebook"]}
              placeholder="https://facebook.com/..."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>}
            />
            <FormField
              name="socialLinks.instagram"
              label="Instagram (Optional)"
              type="url"
              value={formData.socialLinks?.instagram}
              onChange={handleChange}
              error={formErrors["socialLinks.instagram"]}
              placeholder="https://instagram.com/..."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.01m-6.01 0h.01M12 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
            />
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-blue-700 text-xs flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All social links are optional. You can add or update them later from your profile settings.</span>
            </p>
          </div>
        </div>
      </div>
    </FormStep>
  );
}; 