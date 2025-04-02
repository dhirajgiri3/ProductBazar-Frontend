"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import logger from "../../../Utils/logger";
import { validateImageFile, createImagePreview, prepareFormDataWithFiles } from "../../../Utils/imageUtils";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import toast from "react-hot-toast";
import Image from "next/image";

function CompleteProfileForm({
  profileData,
  setProfileData,
  handleSubmit: parentHandleSubmit,
  authLoading: externalAuthLoading,
  profileSuccess,
  error: externalError,
  user,
}) {
  const { completeProfile, authLoading: contextAuthLoading, error: contextError } = useAuth();
  const fileInputRef = useRef(null);
  
  // Use loading and error states from either props or context
  const authLoading = externalAuthLoading || contextAuthLoading;
  const error = externalError || contextError;

  // Initialize formData with profileData, ensuring products is an array
  const [formData, setFormData] = useState({
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    gender: profileData.gender || "",
    birthDate: profileData.birthDate || "",
    companyName: profileData.companyName || "",
    companyWebsite: profileData.companyWebsite || "",
    companyRole: profileData.companyRole || "",
    industry: profileData.industry || "",
    companySize: profileData.companySize || "1-10",
    fundingStage: profileData.fundingStage || "Bootstrapped",
    numberOfEmployees: profileData.numberOfEmployees || "",
    companyDescription: profileData.companyDescription || "",
    socialLinks: {
      facebook: profileData.socialLinks?.facebook || "",
      twitter: profileData.socialLinks?.twitter || "",
      linkedin: profileData.socialLinks?.linkedin || "",
    },
    products: profileData.products?.map(p => ({ ...p, _tempId: Date.now() + Math.random() })) || [
      { _tempId: Date.now(), name: "", description: "", link: "", status: "Draft", category: "Other", tagline: "" },
    ],
  });

  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(profileData.profilePicture?.url || "");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync formData with profileData if it changes externally
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...profileData,
      products: profileData.products?.map(p => ({ ...p, _tempId: p._tempId || Date.now() + Math.random() })) || prev.products,
      socialLinks: {
        facebook: profileData.socialLinks?.facebook || prev.socialLinks.facebook,
        twitter: profileData.socialLinks?.twitter || prev.socialLinks.twitter,
        linkedin: profileData.socialLinks?.linkedin || prev.socialLinks.linkedin,
      },
    }));
    if (profileData.profilePicture?.url) {
      setProfileImagePreview(profileData.profilePicture.url);
    }
  }, [profileData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value.trim() },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setProfileData(prev => ({ ...prev, [name]: value })); // Update parent state
  };

  // Handle product changes
  const handleProductChangeLocal = (_tempId, field, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product._tempId === _tempId ? { ...product, [field]: value } : product
      ),
    }));
    setProfileData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product._tempId === _tempId ? { ...product, [field]: value } : product
      ),
    }));
  };

  // Add a new product
  const addProduct = () => {
    logger.info("Adding a new product/service.");
    const newProduct = {
      _tempId: Date.now() + Math.random(),
      name: "",
      description: "",
      link: "",
      status: "Draft",
      category: "Other",
      tagline: "",
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    setProfileData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  // Remove a product
  const removeProduct = (_tempId) => {
    if (formData.products.length === 1) {
      logger.warn("Cannot remove the last product/service.");
      toast.error("At least one product is required.");
      return;
    }
    logger.info(`Removing product/service with _tempId: ${_tempId}`);
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product._tempId !== _tempId),
    }));
    setProfileData(prev => ({
      ...prev,
      products: prev.products.filter(product => product._tempId !== _tempId),
    }));
  };

  // Handle profile image click
  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle profile image change
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setProfileImage(file);
    try {
      const previewUrl = await createImagePreview(file);
      setProfileImagePreview(previewUrl);
    } catch (err) {
      toast.error("Failed to generate image preview.");
      logger.error("Image preview error", err);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email && !formData.phone) {
      errors.contact = "At least one contact method (email or phone) is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.products.every(p => p.name && p.description && p.link)) {
      errors.products = "All products must have name, description, and link";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Clean social links
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
        socialLinks: cleanedSocialLinks,
        products: formData.products.map(({ _tempId, ...rest }) => rest), // Remove _tempId
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add profile image if exists
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      // Add user data as JSON
      formDataToSend.append("userData", JSON.stringify(userData));

      // Call the completeProfile method from the updated AuthContext
      const success = await completeProfile(formDataToSend);
      if (success) {
        toast.success("Profile completed successfully!");
        if (parentHandleSubmit) parentHandleSubmit(e);
      }
    } catch (err) {
      toast.error(error || "Failed to complete profile.");
      logger.error("Profile completion failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Complete Your Profile</h2>
        <p className="text-muted-foreground">Fill in your information to complete registration</p>
      </div>

      {profileSuccess && (
        <div className="bg-green-50 text-green-900 rounded-lg p-4" role="alert">
          Profile completed successfully! Redirecting to dashboard...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-900 rounded-lg p-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8" encType="multipart/form-data">
        {/* Profile Image */}
        <div className="space-y-4 text-center">
          <div
            onClick={handleProfileImageClick}
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity mx-auto"
          >
            {profileImagePreview ? (
              <Image
                src={profileImagePreview}
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
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
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Change photo</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          <p className="text-xs text-gray-500">Max size: 2MB (JPG, PNG, GIF, WebP)</p>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div className="text-lg font-semibold">Personal Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                required
                className={`w-full px-3 py-2 rounded-md border ${formErrors.firstName ? "border-red-500" : "border-input"} bg-background text-sm`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {formErrors.firstName && <p className="text-red-500 text-xs">{formErrors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                required
                className={`w-full px-3 py-2 rounded-md border ${formErrors.lastName ? "border-red-500" : "border-input"} bg-background text-sm`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {formErrors.lastName && <p className="text-red-500 text-xs">{formErrors.lastName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email {!formData.phone && "*"}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required={!formData.phone}
                disabled={user?.email && user.isEmailVerified}
                className={`w-full px-3 py-2 rounded-md border ${formErrors.email ? "border-red-500" : "border-input"} bg-background text-sm ${user?.email && user.isEmailVerified ? "cursor-not-allowed bg-gray-50" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email ? (
                <p className="text-red-500 text-xs">{formErrors.email}</p>
              ) : user?.email && user.isEmailVerified ? (
                <p className="text-green-600 text-xs">Email verified</p>
              ) : (
                <p className="text-gray-500 text-xs">Will require verification</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone {!formData.email && "*"}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1234567890"
                required={!formData.email}
                disabled={user?.phone && user.isPhoneVerified}
                className={`w-full px-3 py-2 rounded-md border ${formErrors.phone ? "border-red-500" : "border-input"} bg-background text-sm ${user?.phone && user.isPhoneVerified ? "cursor-not-allowed bg-gray-50" : ""}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {formErrors.phone ? (
                <p className="text-red-500 text-xs">{formErrors.phone}</p>
              ) : user?.phone && user.isPhoneVerified ? (
                <p className="text-green-600 text-xs">Phone verified</p>
              ) : (
                <p className="text-gray-500 text-xs">Will require verification</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">Gender</label>
              <select
                id="gender"
                name="gender"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="birthDate" className="text-sm font-medium">Birth Date</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
            {formErrors.contact && (
              <div className="col-span-2">
                <p className="text-red-500 text-sm">{formErrors.contact}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-6">
          <div className="text-lg font-semibold">Company Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyWebsite" className="text-sm font-medium">Company Website</label>
              <input
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                placeholder="https://yourcompany.com"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.companyWebsite}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyRole" className="text-sm font-medium">Role/Position</label>
              <input
                type="text"
                id="companyRole"
                name="companyRole"
                placeholder="e.g., Founder, CEO"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.companyRole}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="text-sm font-medium">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                placeholder="e.g., Technology"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.industry}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companySize" className="text-sm font-medium">Company Size</label>
              <select
                id="companySize"
                name="companySize"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.companySize}
                onChange={handleChange}
              >
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="501-1000">501-1000 Employees</option>
                <option value="1000+">1000+ Employees</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="fundingStage" className="text-sm font-medium">Funding Stage</label>
              <select
                id="fundingStage"
                name="fundingStage"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.fundingStage}
                onChange={handleChange}
              >
                <option value="Bootstrapped">Bootstrapped</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C+">Series C+</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="numberOfEmployees" className="text-sm font-medium">Number of Employees</label>
            <input
              type="number"
              id="numberOfEmployees"
              name="numberOfEmployees"
              placeholder="Enter number of employees"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="companyDescription" className="text-sm font-medium">Company Description</label>
            <textarea
              id="companyDescription"
              name="companyDescription"
              placeholder="Brief description of your company"
              rows="4"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={formData.companyDescription}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Products/Services */}
        <div className="space-y-6">
          <div className="text-lg font-semibold">Products/Services</div>
          {formErrors.products && <p className="text-red-500 text-sm">{formErrors.products}</p>}
          {formData.products.map((product) => (
            <div key={product._tempId} className="p-4 border rounded-lg space-y-4 relative">
              {formData.products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product._tempId)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  aria-label="Remove Product/Service"
                >
                  <FaMinus />
                </button>
              )}

              <div className="space-y-2">
                <label htmlFor={`productName-${product._tempId}`} className="text-sm font-medium">
                  Product/Service Name *
                </label>
                <input
                  type="text"
                  id={`productName-${product._tempId}`}
                  name="name"
                  placeholder="Enter product name"
                  required
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={product.name}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`productDescription-${product._tempId}`} className="text-sm font-medium">
                  Description *
                </label>
                <textarea
                  id={`productDescription-${product._tempId}`}
                  name="description"
                  placeholder="Product description"
                  required
                  rows="3"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={product.description}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`productLink-${product._tempId}`} className="text-sm font-medium">
                  Product Link *
                </label>
                <input
                  type="url"
                  id={`productLink-${product._tempId}`}
                  name="link"
                  placeholder="https://product.com"
                  required
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={product.link}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "link", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`productStatus-${product._tempId}`} className="text-sm font-medium">
                  Status
                </label>
                <select
                  id={`productStatus-${product._tempId}`}
                  value={product.status}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "status", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="In Development">In Development</option>
                  <option value="Beta">Beta</option>
                  <option value="Launched">Launched</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor={`productCategory-${product._tempId}`} className="text-sm font-medium">
                  Category
                </label>
                <input
                  type="text"
                  id={`productCategory-${product._tempId}`}
                  name="category"
                  placeholder="e.g., Software"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={product.category}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "category", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`productTagline-${product._tempId}`} className="text-sm font-medium">
                  Tagline
                </label>
                <input
                  type="text"
                  id={`productTagline-${product._tempId}`}
                  name="tagline"
                  placeholder="Short catchy phrase"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={product.tagline}
                  onChange={(e) => handleProductChangeLocal(product._tempId, "tagline", e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addProduct}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input hover:bg-accent hover:text-white h-10 px-4 py-2"
            aria-label="Add Product/Service"
          >
            <FaPlus className="mr-2" />
            Add Product/Service
          </button>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <div className="text-lg font-semibold">Social Links</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
              <input
                type="url"
                id="facebook"
                name="socialLinks.facebook"
                placeholder="https://facebook.com/profile"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.socialLinks.facebook}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
              <input
                type="url"
                id="twitter"
                name="socialLinks.twitter"
                placeholder="https://twitter.com/profile"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
              <input
                type="url"
                id="linkedin"
                name="socialLinks.linkedin"
                placeholder="https://linkedin.com/in/profile"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={authLoading || isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {authLoading || isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </form>
    </div>
  );
}

export default CompleteProfileForm;