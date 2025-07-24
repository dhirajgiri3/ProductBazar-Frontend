"use client";

import React from "react";
import { FormStep } from "./FormStep";
import { FormField, TagInput } from "./ProfileFormComponents";

export const ProfileDetailsForm = ({
  isActive,
  formData,
  handleChange,
  formErrors = {},
  skillTags,
  interestTags,
  skillInput,
  setSkillInput,
  interestInput,
  setInterestInput,
  handleTagInput,
  removeTag,
  addPredefinedTag,
  predefinedOptions,
  currentStep,
}) => {
  return (
    <FormStep title="Professional Information" isActive={isActive && currentStep === 2}>
      <div className="space-y-6">
        <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
          <p className="text-sm text-violet-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Add your professional details, skills and interests to help others understand your expertise.
          </p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            Professional Details
          </h4>
          
          <FormField
            name="headline"
            label="Professional Headline"
            type="text"
            value={formData.headline}
            placeholder="e.g., CEO at X Company, Software Developer at Y"
            onChange={handleChange}
            error={formErrors.headline}
            maxLength={100}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="companyName"
              label="Company Name (Optional)"
              type="text"
              value={formData.companyName}
              placeholder="Company Name"
              onChange={handleChange}
              error={formErrors.companyName}
            />
            <FormField
              name="companyRole"
              label="Your Role (Optional)"
              type="text"
              value={formData.companyRole}
              placeholder="Your Role"
              onChange={handleChange}
              error={formErrors.companyRole}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Skills & Interests
          </h4>
          
          <TagInput
            type="skills"
            label="Skills"
            tags={skillTags}
            inputValue={skillInput}
            onInputChange={(e) => setSkillInput(e.target.value)}
            onInputKeyDown={(e) => handleTagInput(e, "skills")}
            onRemoveTag={removeTag}
            onAddPredefined={addPredefinedTag}
            predefinedOptions={predefinedOptions.skills}
            placeholder={skillTags.length === 0 ? "Add skills..." : "Add more skills..."}
          />
          <TagInput
            type="interests"
            label="Interests"
            tags={interestTags}
            inputValue={interestInput}
            onInputChange={(e) => setInterestInput(e.target.value)}
            onInputKeyDown={(e) => handleTagInput(e, "interests")}
            onRemoveTag={removeTag}
            onAddPredefined={addPredefinedTag}
            predefinedOptions={predefinedOptions.interests}
            placeholder={interestTags.length === 0 ? "Add interests..." : "Add more interests..."}
          />
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-medium text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            About You
          </h4>
          
          <FormField
            name="bio"
            label="Short Bio (Optional)"
            type="textarea"
            value={formData.bio}
            onChange={handleChange}
            error={formErrors.bio}
            placeholder="A brief intro about your professional background (max 500 chars)"
          />
        </div>
      </div>
    </FormStep>
  );
};