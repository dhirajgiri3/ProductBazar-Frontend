"use client";

import React, { useState } from "react";
import { FormStep } from "./FormStep";
import { FormField, TagComponent } from "./ProfileFormComponents"; // Assuming TagInput is handled within container
import clsx from "clsx";

// Helper for multi-input fields like investment focus, services etc.
const MultiInput = React.memo(({ label, tags, onRemove, inputPlaceholder, onKeyDown, value, onChange }) => {
    const inputRef = React.useRef(null);
    
    // Prevent unnecessary re-renders by using useCallback for handlers
    const handleChange = React.useCallback((e) => {
        onChange(e);
    }, [onChange]);
    
    const handleKeyDown = React.useCallback((e) => {
        onKeyDown(e);
    }, [onKeyDown]);
    
    const handleRemove = React.useCallback((tag) => {
        onRemove(tag);
    }, [onRemove]);
    
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
                {(tags || [])?.map((tag, i) => {
                    // Handle both string and object tags
                    const tagText = typeof tag === 'string' ? tag : tag.name || tag.text || JSON.stringify(tag);
                    const tagKey = typeof tag === 'string' ? `${tag}-${i}` : `${tag._id || tag.id || i}-${i}`;
                    
                    return (
                        <TagComponent 
                            key={tagKey} 
                            text={tagText} 
                            onRemove={() => handleRemove(tag)} 
                        />
                    );
                })}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow min-w-[150px] outline-none p-1 text-sm bg-transparent"
                    placeholder={inputPlaceholder}
                />
            </div>
        </div>
    );
});

MultiInput.displayName = 'MultiInput';

const PredefinedButtons = React.memo(({ options, selectedTags, onAdd }) => {
    const handleAdd = React.useCallback((option) => {
        onAdd(option);
    }, [onAdd]);
    
    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {options.map((option) => {
                const isSelected = (selectedTags || [])?.some(tag => {
                    if (typeof tag === 'string') {
                        return tag === option;
                    } else {
                        return tag.name === option || tag.text === option;
                    }
                });
                
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleAdd(option)}
                        className={clsx(
                            "px-2 py-1 text-xs rounded-full",
                            isSelected
                                ? "bg-violet-100 text-violet-700 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                        disabled={isSelected}
                    >
                        + {option}
                    </button>
                );
            })}
        </div>
    );
});

PredefinedButtons.displayName = 'PredefinedButtons';

const StartupOwnerForm = React.memo(({ renderFormFields, role, formErrors }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-500 italic">Tell us about your startup.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormFields([
                { name: "companyName", label: "Company Name", required: true },
                { name: "industry", label: "Industry", required: true },
                { name: "fundingStage", label: "Funding Stage", type: 'select', options: [{ value: "Pre-seed", label: "Pre-seed" }, { value: "Seed", label: "Seed" }, { value: "Series A", label: "Series A" },{ value: "Series B+", label: "Series B+" }, { value: "Bootstrapped", label: "Bootstrapped" }, { value: "Other", label: "Other" }] },
                { name: "companySize", label: "Company Size", type: 'select', options: [{ value: "1-10", label: "1-10 employees" }, { value: "11-50", label: "11-50 employees" }, { value: "51-200", label: "51-200 employees" }, { value: "201+", label: "201+ employees" }] },
                { name: "yearFounded", label: "Year Founded", type: 'number', placeholder: "e.g., 2023" },
                { name: "website", label: "Website", type: 'url', placeholder: "https://yourstartup.com" },
                { name: "teamSize", label: "Team Size", type: 'number', placeholder: "e.g., 5" },
                { name: "location.country", label: "Country" },
                { name: "location.city", label: "City" },
            ])}
        </div>
         {renderFormFields([
            { name: "description", label: "Description", type: 'textarea', placeholder:"Briefly describe your startup" },
        ])}
    </div>
));

StartupOwnerForm.displayName = 'StartupOwnerForm';

const InvestorForm = React.memo(({ renderFormFields, role, roleData, multiInputValues, handleMultiInputChange, addMultiInputTag, removeMultiInputTag }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-500 italic">Share your investment preferences.</p>
        {renderFormFields([
            { name: "investorType", label: "Investor Type", type: 'select', required: true, options: [{ value: "Angel Investor", label: "Angel Investor" }, { value: "Venture Capitalist", label: "Venture Capitalist" }, { value: "Family Office", label: "Family Office" }, { value: "Corporate VC", label: "Corporate VC" }, { value: "Individual", label: "Individual" }, { value: "Other", label: "Other" }] },
            { name: "companyName", label: "Company/Fund Name (if applicable)" }
        ])}
         <MultiInput
            label="Investment Focus (Industries/Sectors)"
            tags={roleData?.investmentFocus || []}
            onRemove={(tag) => removeMultiInputTag(role, 'investmentFocus', tag)}
            inputPlaceholder="Add focus area and press Enter"
            value={multiInputValues[`${role}_investmentFocus`] || ''}
            onChange={(e) => handleMultiInputChange(role, 'investmentFocus', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') addMultiInputTag(e, role, 'investmentFocus'); }}
        />
        <PredefinedButtons
             options={["SaaS", "Fintech", "Health Tech", "AI/ML", "E-commerce", "Marketplace", "Deep Tech", "Consumer", "B2B", "Sustainability"]}
             selectedTags={roleData?.investmentFocus || []}
             onAdd={(option) => addMultiInputTag(null, role, 'investmentFocus', option)} // Pass null event, add option directly
         />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {renderFormFields([
                { name: "investmentRange.min", label: "Min Check Size ($)", type: 'number' },
                { name: "investmentRange.max", label: "Max Check Size ($)", type: 'number' },
                { name: "investmentRange.currency", label: "Currency", type: 'select', options: [{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "GBP", label: "GBP" }, { value: "CAD", label: "CAD" }, { value: "Other", label: "Other" } ] },
             ])}
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormFields([
                { name: "website", label: "Website", type: 'url', placeholder: "https://yourwebsite.com" },
                { name: "location.country", label: "Country" },
                { name: "location.city", label: "City" },
            ])}
         </div>
    </div>
));

InvestorForm.displayName = 'InvestorForm';

const AgencyForm = React.memo(({ renderFormFields, role, roleData, multiInputValues, handleMultiInputChange, addMultiInputTag, removeMultiInputTag, formErrors }) => {
    const handleServicesRemove = React.useCallback((tag) => {
        removeMultiInputTag(role, 'services', tag);
    }, [removeMultiInputTag, role]);
    
    const handleServicesChange = React.useCallback((e) => {
        handleMultiInputChange(role, 'services', e.target.value);
    }, [handleMultiInputChange, role]);
    
    const handleServicesKeyDown = React.useCallback((e) => {
        if (e.key === 'Enter' || e.key === ',') {
            addMultiInputTag(e, role, 'services');
        }
    }, [addMultiInputTag, role]);
    
    const handleServicesAdd = React.useCallback((option) => {
        addMultiInputTag(null, role, 'services', option);
    }, [addMultiInputTag, role]);
    
    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 italic">Describe your agency to attract clients.</p>
            {renderFormFields([
                 { name: "companyName", label: "Agency Name", required: true },
                 { name: "industry", label: "Primary Industry Focus (Optional)" },
            ])}
             <MultiInput
                label="Services Offered"
                tags={roleData?.services || []}
                onRemove={handleServicesRemove}
                inputPlaceholder="Add service and press Enter"
                value={multiInputValues[`${role}_services`] || ''}
                onChange={handleServicesChange}
                onKeyDown={handleServicesKeyDown}
            />
            {formErrors[`roleDetails.${role}.services`] && <p className="text-red-500 text-xs">{formErrors[`roleDetails.${role}.services`]}</p>}
             <PredefinedButtons
                 options={["Web Dev", "Mobile Dev", "UI/UX Design", "Branding", "Marketing", "SEO", "Content", "Consulting", "Product Strategy", "AI Integration"]}
                 selectedTags={roleData?.services || []}
                 onAdd={handleServicesAdd}
             />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {renderFormFields([
                    { name: "companySize", label: "Company Size", type: 'select', options: [{ value: "1-10", label: "1-10 employees" }, { value: "11-50", label: "11-50 employees" }, { value: "51-200", label: "51-200 employees" }, { value: "201+", label: "201+ employees" }] },
                    { name: "yearFounded", label: "Year Founded", type: 'number', placeholder: "e.g., 2015" },
                    { name: "website", label: "Website", type: 'url', placeholder: "https://youragency.com" },
                    { name: "location.country", label: "Country" },
                    { name: "location.city", label: "City" },
                 ])}
             </div>
             {renderFormFields([
                { name: "description", label: "Agency Description (Optional)", type: 'textarea', placeholder:"Briefly describe your agency's focus and strengths" },
            ])}
        </div>
    );
});

AgencyForm.displayName = 'AgencyForm';

const FreelancerForm = React.memo(({ renderFormFields, role, formErrors }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-500 italic">Showcase your expertise.</p>
        {formErrors[`roleDetails.${role}.skills`] && <p className="text-red-500 text-xs">{formErrors[`roleDetails.${role}.skills`]}</p>}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {renderFormFields([
                { name: "experience", label: "Experience Level", type: 'select', required: true, options: [{ value: "Beginner", label: "Beginner (0-2 yrs)" }, { value: "Intermediate", label: "Intermediate (2-5 yrs)" }, { value: "Expert", label: "Expert (5+ yrs)" }] },
                { name: "availability", label: "Availability", type: 'select', options: [{ value: "Full-time", label: "Full-time (40+ hrs/wk)" }, { value: "Part-time", label: "Part-time (10-30 hrs/wk)" }, { value: "Flexible", label: "Flexible / Project-based" }, { value: "Not Available", label: "Not Available" }] },
                { name: "hourlyRate.amount", label: "Avg. Hourly Rate (Optional)", type: 'number' },
                { name: "hourlyRate.currency", label: "Currency", type: 'select', options: [{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "GBP", label: "GBP" }, { value: "CAD", label: "CAD" }, { value: "Other", label: "Other" }] },
             ])}
         </div>
    </div>
));

FreelancerForm.displayName = 'FreelancerForm';

const JobseekerForm = React.memo(({ renderFormFields, role, formErrors }) => (
    <div className="space-y-6">
        <p className="text-sm text-gray-500 italic">Help employers find you.</p>
        {renderFormFields([
            { name: "jobTitle", label: "Desired Job Title / Role", required: true }
        ])}
        {formErrors[`roleDetails.${role}.skills`] && <p className="text-red-500 text-xs">{formErrors[`roleDetails.${role}.skills`]}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {renderFormFields([
                 { name: "experience", label: "Experience Level", type: 'select', options: [{ value: "Entry Level", label: "Entry Level (0-1 yrs)" }, { value: "Mid-Level", label: "Mid-Level (2-5 yrs)" }, { value: "Senior", label: "Senior (5+ yrs)" }, { value: "Lead/Manager", label: "Lead/Manager" }] },
             ])}
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {renderFormFields([
                { name: "expectedSalary.amount", label: "Expected Salary (Optional)", type: 'number' },
                { name: "expectedSalary.currency", label: "Currency", type: 'select', options: [{ value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "GBP", label: "GBP" }, { value: "CAD", label: "CAD" }, { value: "Other", label: "Other" }] },
                { name: "expectedSalary.period", label: "Period", type: 'select', options: [{ value: "Hourly", label: "Hourly" }, { value: "Monthly", label: "Monthly" }, { value: "Yearly", label: "Yearly" }] },
            ])}
         </div>
    </div>
));

JobseekerForm.displayName = 'JobseekerForm';

export const RoleSpecificForm = React.memo(({
  isActive,
  user,
  formData,
  handleChange,
  formErrors,
  handleMultiInputChange,
  multiInputValues,
  addMultiInputTag,
  removeMultiInputTag,
}) => {
  if (!user?.role || user.role === "user" || !formData.roleDetails || !formData.roleDetails[user.role]) {
    return null;
  }

  const role = user.role;
  const roleData = formData.roleDetails[role];
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  const getNestedValue = React.useCallback((path) => path.split('.').reduce((obj, key) => obj?.[key], roleData), [roleData]);

  const renderFormFields = React.useCallback((fields) => (
      fields.map(field => (
          <FormField
              key={field.name}
              name={`roleDetails.${role}.${field.name}`}
              label={field.label}
              type={field.type || "text"}
              required={field.required}
              value={getNestedValue(field.name) ?? (field.type === 'number' ? 0 : '')}
              onChange={handleChange}
              error={formErrors[`roleDetails.${role}.${field.name}`]}
              options={field.options}
              placeholder={field.placeholder}
          />
      ))
  ), [role, getNestedValue, handleChange, formErrors]);

  const renderRoleForm = () => {
    switch (role) {
      case "startupOwner": return <StartupOwnerForm renderFormFields={renderFormFields} role={role} formErrors={formErrors} />;
      case "investor": return <InvestorForm renderFormFields={renderFormFields} role={role} roleData={roleData} multiInputValues={multiInputValues} handleMultiInputChange={handleMultiInputChange} addMultiInputTag={addMultiInputTag} removeMultiInputTag={removeMultiInputTag} />;
      case "agency": return <AgencyForm renderFormFields={renderFormFields} role={role} roleData={roleData} multiInputValues={multiInputValues} handleMultiInputChange={handleMultiInputChange} addMultiInputTag={addMultiInputTag} removeMultiInputTag={removeMultiInputTag} formErrors={formErrors} />;
      case "freelancer": return <FreelancerForm renderFormFields={renderFormFields} role={role} formErrors={formErrors} />;
      case "jobseeker": return <JobseekerForm renderFormFields={renderFormFields} role={role} formErrors={formErrors} />;
      default: return <p>No specific details required for your role.</p>;
    }
  };

  return (
    <FormStep title={`${roleTitle} Details`} isActive={isActive}>
      {renderRoleForm()}
    </FormStep>
  );
});

RoleSpecificForm.displayName = 'RoleSpecificForm';