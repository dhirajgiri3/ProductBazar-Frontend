"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRouter } from "next/navigation";
import logger from "../../../Utils/logger";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Tag } from "./Tag";
import toast from "react-hot-toast";
import Image from "next/image";
import { FormStep } from "./FormStep";
import { optimizeImage } from "../../../Utils/Image/imageUtils";

const CompleteProfile = () => {
  const {
    user,
    completeProfile,
    updateProfilePicture,
    authLoading,
    error,
    clearError,
    updateProfile,
  } = useAuth();
  const router = useRouter();
  const accentColor = "violet";
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    bio: "",
    address: "", // Changed from location to address to match user model
    openToWork: false,
    about: "",
    preferredContact: "",
    skills: [],
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      github: "",
      website: "",
    },
    companyName: "",
    companyWebsite: "",
    companyRole: "",
    industry: "",
    companySize: "1-10",
    fundingStage: "Pre-seed",
    numberOfEmployees: "",
    companyDescription: "",
    companyLogo: "",
    products: [],
    profilePicture: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillTags, setSkillTags] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        // Ensure we use the phone number from the user if it's verified
        phone: user.isPhoneVerified && user.phone ? user.phone : user.phone || "",
        gender: user.gender || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        bio: user.bio || "",
        address: user.address || "", // Changed from location to address
        openToWork: user.openToWork || false,
        about: user.about || "",
        preferredContact: user.preferredContact || "",
        skills: user.skills || [],
        socialLinks: {
          facebook: user.socialLinks?.facebook || "",
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          instagram: user.socialLinks?.instagram || "",
          github: user.socialLinks?.github || "",
          website: user.socialLinks?.website || "",
        },
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companyRole: user.companyRole || "",
        industry: user.industry || "",
        companySize: user.companySize || "1-10",
        fundingStage: user.fundingStage || "Pre-seed",
        numberOfEmployees: user.numberOfEmployees || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
        products: user.products || [],
        profilePicture: user.profilePicture?.url || "",
      });
      setSkillTags(user.skills || []);
      setProfileImagePreview(user.profilePicture?.url || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value.trim() },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic initial validation
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for input
      toast.error("Image is too large (max 10MB). Please select a smaller image.");
      return;
    }

    try {
      // Show loading toast during optimization
      const loadingToast = toast.loading("Optimizing image...");
      
      // Use the same image optimization approach as EditProfileModal
      const optimizedFile = await optimizeImage(file, 1200, 2); // Max width 1200px, max size 2MB
      
      // Clean up previous preview URL if it exists
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
      
      // Create FormData for immediate upload
      const formData = new FormData();
      formData.append("profileImage", optimizedFile);
      
      // Display processing toast
      toast.dismiss(loadingToast);
      const uploadingToast = toast.loading("Uploading profile picture...");

      // Check if updateProfilePicture function exists before calling it
      if (typeof updateProfilePicture === 'function') {
        const uploadResult = await updateProfilePicture(formData);
        toast.dismiss(uploadingToast);
        
        if (uploadResult) {
          setProfileImage(null); // No need to keep the image in state since it's uploaded
          if (user?.profilePicture?.url) {
            setProfileImagePreview(user.profilePicture.url);
          } else {
            // Fallback to local preview if the user object hasn't updated yet
            const reader = new FileReader();
            reader.onloadend = () => setProfileImagePreview(reader.result);
            reader.readAsDataURL(optimizedFile);
          }
          toast.success("Profile picture updated successfully");
        } else {
          toast.error("Failed to update profile picture");
        }
      } else {
        // If updateProfilePicture is not available, store the image for later submission
        toast.dismiss(uploadingToast);
        setProfileImage(optimizedFile);
        
        // Create a local preview
        const reader = new FileReader();
        reader.onloadend = () => setProfileImagePreview(reader.result);
        reader.readAsDataURL(optimizedFile);
        
        toast.success("Image ready for submission");
      }
    } catch (err) {
      toast.error("Failed to process image: " + err.message);
      logger.error("Image optimization error:", err);
    }
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !skillTags.includes(newSkill)) {
        setSkillTags([...skillTags, newSkill]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkillTags(skillTags.filter((skill) => skill !== skillToRemove));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email && !formData.phone) {
      errors.contact =
        "At least one contact method (email or phone) is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionToast = toast.loading("Completing profile...");
      
      const cleanedSocialLinks = Object.entries(formData.socialLinks).reduce(
        (acc, [key, value]) => {
          if (value.trim()) acc[key] = value.trim();
          return acc;
        },
        {}
      );

      // Prepare user data
      const userData = {
        ...formData,
        // If phone is verified, ensure we use the original phone number
        phone: user?.isPhoneVerified ? user.phone : formData.phone,
        skills: skillTags,
        socialLinks: cleanedSocialLinks,
        // Structure the profilePicture data correctly
        profilePicture: formData.profilePicture ? {
          url: formData.profilePicture,
          publicId: '' // This should be set from the cloudinary response
        } : undefined
      };

      // We don't need to include the profile picture if it was already uploaded
      // using updateProfilePicture
      const formDataToSend = new FormData();
      
      // Only add profile image if it exists AND wasn't already uploaded
      if (profileImage) {
        formDataToSend.append("profilePicture", profileImage);
      }
      
      // Add JSON user data to FormData
      formDataToSend.append("userData", JSON.stringify(userData));

      // Submit the form data
      const result = await completeProfile(formDataToSend);
      
      if (result && result.success) {
        toast.dismiss(submissionToast);
        toast.success("Profile completed successfully!");
        
        // Update the profile data in context for consistency
        await updateProfile(userData);
        
        // Redirect to user profile
        router.push("/user");
      } else {
        toast.dismiss(submissionToast);
        toast.error("Profile update failed. Please try again.");
      }
    } catch (err) {
      logger.error("Profile completion error:", err);
      toast.error(err.message || "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const errors = {};
    if (currentStep === 1) {
      if (!formData.firstName) errors.firstName = "First name is required";
      if (!formData.lastName) errors.lastName = "Last name is required";
      if (!formData.email && !formData.phone) {
        errors.contact = "At least one contact method is required";
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please complete all required fields");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderSkillsInput = () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
        {skillTags.map((skill, index) => (
          <Tag key={index} text={skill} onRemove={() => removeSkill(skill)} />
        ))}
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleSkillInputKeyDown}
          className="flex-grow min-w-[150px] outline-none p-1 text-sm"
          placeholder="Type skill and press Enter"
        />
      </div>
      <p className="text-xs text-gray-500">
        Add skills relevant to product development (e.g., UI/UX, React,
        Marketing)
      </p>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="relative mb-10">
      <div className="relative flex justify-between mb-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center z-10">
            <button
              onClick={() => setCurrentStep(step)}
              disabled={currentStep < step}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                currentStep === step
                  ? `bg-${accentColor}-600 text-white shadow-lg shadow-${accentColor}-200`
                  : currentStep > step
                  ? `bg-${accentColor}-500 text-white`
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {currentStep > step ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step
              )}
            </button>
            <span
              className={clsx(
                "mt-2 text-xs font-medium transition-colors",
                currentStep >= step
                  ? `text-${accentColor}-700`
                  : "text-gray-400"
              )}
            >
              {step === 1 && "Basic"}
              {step === 2 && "Personal"}
              {step === 3 && "Professional"}
              {step === 4 && "Company"}
              {step === 5 && "Products"}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-0 transform -translate-y-1/2 h-1 bg-gray-200 w-full z-0" />
      <div
        className={`absolute top-5 left-0 transform -translate-y-1/2 h-1 bg-${accentColor}-500 transition-all duration-500 z-0`}
        style={{ width: `${(currentStep - 1) * 25}%` }}
      />
    </div>
  );

  const renderProfileImageUpload = () => (
    <div className="flex flex-col items-center mb-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "relative w-32 h-32 overflow-hidden cursor-pointer group transition-all duration-300",
          "rounded-full border-4",
          profileImagePreview ? `border-${accentColor}-200` : "border-gray-100"
        )}
      >
        {profileImagePreview ? (
          <div className="relative w-full h-full">
            <Image
              src={profileImagePreview}
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm font-medium">
                Change photo
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-${accentColor}-50 to-${accentColor}-100`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-12 w-12 text-${accentColor}-300`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfileImageChange}
        className="hidden"
        accept="image/jpeg, image/png, image/gif, image/webp"
      />
      <p className="mt-2 text-sm text-gray-500">
        {profileImagePreview
          ? "Click to change profile photo"
          : "Add profile photo"}
      </p>
    </div>
  );

  const renderFormField = (
    name,
    label,
    type = "text",
    required = false,
    options = null,
    disabled = false,
    placeholder = ""
  ) => {
    const isError = formErrors[name];
    const value = name.includes(".")
      ? name.split(".").reduce((obj, key) => obj && obj[key], formData)
      : formData[name];

    return (
      <div className="space-y-1">
        <label
          htmlFor={name}
          className={clsx(
            "block text-sm font-medium",
            isError ? "text-red-600" : "text-gray-700"
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={clsx(
              "w-full px-3 py-2 rounded-lg text-gray-800 transition-all duration-200",
              "border focus:ring focus:outline-none",
              isError
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : `border-gray-200 focus:border-${accentColor}-500 focus:ring-${accentColor}-100`,
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
            )}
          >
            {options &&
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            rows="4"
            className={clsx(
              "w-full px-3 py-2 rounded-lg text-gray-800 transition-all duration-200",
              "border focus:ring focus:outline-none",
              isError
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : `border-gray-200 focus:border-${accentColor}-500 focus:ring-${accentColor}-100`,
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
            )}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ""}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className={clsx(
              "w-full px-3 py-2 rounded-lg text-gray-800 transition-all duration-200",
              "border focus:ring focus:outline-none",
              isError
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : `border-gray-200 focus:border-${accentColor}-500 focus:ring-${accentColor}-100`,
              disabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
            )}
          />
        )}

        {isError && <p className="text-red-500 text-xs mt-1">{isError}</p>}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep title="Basic Information" isActive={currentStep === 1}>
            {renderProfileImageUpload()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderFormField("firstName", "First Name", "text", true)}
              {renderFormField("lastName", "Last Name", "text", true)}
              {renderFormField(
                "email",
                "Email Address",
                "email",
                !formData.phone,
                null,
                user?.email && user.isEmailVerified
              )}
              {renderFormField(
                "phone",
                "Phone Number",
                "tel",
                !formData.email,
                null,
                // Disable the field if the phone is already verified
                user?.isPhoneVerified
              )}

              {formErrors.contact && (
                <div className="col-span-2">
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.contact}
                  </p>
                </div>
              )}
            </div>
          </FormStep>
        );

      case 2:
        return (
          <FormStep title="Personal Information" isActive={currentStep === 2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderFormField("gender", "Gender", "select", false, [
                { value: "", label: "Select Gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ])}
              {renderFormField("birthDate", "Date of Birth", "date")}
              {renderFormField("address", "Address", "text")} {/* Changed from location to address */}
            </div>

            <div className="mt-6">
              {renderFormField("about", "About You", "textarea")}
            </div>
          </FormStep>
        );

      case 3:
        return (
          <FormStep
            title="Professional Information"
            isActive={currentStep === 3}
          >
            <div className="space-y-6">
              <div className="mt-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="openToWork"
                    name="openToWork"
                    checked={formData.openToWork}
                    onChange={handleChange}
                    className={`w-5 h-5 text-${accentColor}-600 rounded focus:ring-${accentColor}-500`}
                  />
                  <label
                    htmlFor="openToWork"
                    className="ml-3 text-sm text-gray-700 font-medium"
                  >
                    I am open to product collaboration opportunities
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {renderFormField(
                  "companyRole",
                  "Your Role",
                  "text",
                  false,
                  null,
                  false,
                  "e.g., Product Designer, Developer, Founder"
                )}
                {renderFormField(
                  "industry",
                  "Industry",
                  "text",
                  false,
                  null,
                  false,
                  "e.g., SaaS, FinTech, E-commerce"
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Your Skills
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  Add skills that showcase your expertise (product management,
                  design, coding, etc.)
                </p>
                {renderSkillsInput()}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Social Profiles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField("socialLinks.linkedin", "LinkedIn", "url")}
                  {renderFormField("socialLinks.github", "GitHub", "url")}
                  {renderFormField("socialLinks.twitter", "Twitter/X", "url")}
                  {renderFormField(
                    "socialLinks.website",
                    "Personal Website",
                    "url"
                  )}
                </div>
              </div>
            </div>
          </FormStep>
        );

      case 4:
        return (
          <FormStep title="Company Information" isActive={currentStep === 4}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                If you're launching products as part of a company or startup,
                please provide the following details. This helps users
                understand the team behind your products.
              </p>

              <div className="space-y-4">
                {renderFormField("companyName", "Company/Startup Name", "text")}
                {renderFormField("companyWebsite", "Company Website", "url")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "companySize",
                  "Company Size",
                  "select",
                  false,
                  [
                    { value: "1-10", label: "1-10 employees" },
                    { value: "11-50", label: "11-50 employees" },
                    { value: "51-200", label: "51-200 employees" },
                    { value: "201-500", label: "201-500 employees" },
                    { value: "501-1000", label: "501-1000 employees" },
                    { value: "1000+", label: "1000+ employees" },
                  ]
                )}
                {renderFormField(
                  "fundingStage",
                  "Funding Stage",
                  "select",
                  false,
                  [
                    { value: "Bootstrapped", label: "Bootstrapped" },
                    { value: "Pre-seed", label: "Pre-seed" },
                    { value: "Seed", label: "Seed" },
                    { value: "Series A", label: "Series A" },
                    { value: "Series B", label: "Series B" },
                    { value: "Series C+", label: "Series C+" },
                    { value: "Other", label: "Other" },
                  ]
                )}
              </div>

              {renderFormField(
                "companyDescription",
                "Company Description",
                "textarea",
                false,
                null,
                false,
                "Brief description of your company and its mission"
              )}
            </div>
          </FormStep>
        );

      case 5:
        return (
          <FormStep title="Review & Submit" isActive={currentStep === 5}>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                <p>
                  Please review your information before submitting. Make sure
                  all required fields are complete.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Profile Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.firstName} {formData.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.email || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {formData.phone || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>{" "}
                      {formData.companyRole || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>{" "}
                      {formData.companyName || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">Skills:</span>{" "}
                      {skillTags.length > 0
                        ? skillTags.join(", ")
                        : "None provided"}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                  <p className="text-sm">
                    By completing your profile, you agree to our Terms of
                    Service and Privacy Policy. Your profile information helps
                    us recommend relevant products and connect you with
                    like-minded makers.
                  </p>
                </div>
              </div>
            </div>
          </FormStep>
        );

      default:
        return null;
    }
  };

  const renderNavigationButtons = () => (
    <div className="flex justify-between pt-8">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handlePrevious}
          className={clsx(
            "px-6 py-2.5 border rounded-lg text-gray-600 transition-all duration-200",
            "hover:bg-gray-50 hover:text-gray-900 flex items-center"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
      )}
      {currentStep < totalSteps ? (
        <motion.button
          type="button"
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            "ml-auto px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200",
            `bg-${accentColor}-600 hover:bg-${accentColor}-700`,
            "flex items-center shadow-md shadow-${accentColor}-100"
          )}
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      ) : (
        <motion.button
          type="submit"
          disabled={authLoading || isSubmitting}
          whileHover={{ scale: authLoading || isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: authLoading || isSubmitting ? 1 : 0.98 }}
          className={clsx(
            "ml-auto px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200",
            `bg-${accentColor}-600`,
            authLoading || isSubmitting
              ? "opacity-70 cursor-not-allowed"
              : `hover:bg-${accentColor}-700`,
            "flex items-center shadow-md shadow-${accentColor}-100"
          )}
        >
          {authLoading || isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Complete Profile
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </motion.button>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-${accentColor}-500`}
          ></div>
          <p className={`mt-4 text-${accentColor}-600 text-lg font-medium`}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-8">
            <h2 className={`text-3xl font-bold text-gray-900 mb-2 text-center`}>
              Complete Your Profile
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Let's get to know you better to provide a personalized experience
            </p>

            {renderStepIndicator()}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              encType="multipart/form-data"
            >
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

              {renderNavigationButtons()}
            </form>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Need help?{" "}
            <a href="#" className={`text-${accentColor}-600 hover:underline`}>
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
