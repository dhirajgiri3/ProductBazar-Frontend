"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRouter } from "next/navigation";
import logger from "../../../Utils/logger";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Tag } from "./Tag";
import toast from "react-hot-toast";
import { FormStep } from "./FormStep";
import { optimizeImage } from "../../../Utils/Image/imageUtils";
import LoaderComponent from "../../../Components/UI/LoaderComponent";
import api from "../../../Utils/api";
import SuccessConfetti from "./SuccessConfetti";

const CompleteProfile = () => {
  const {
    user,
    completeProfile,
    updateProfilePicture,
    authLoading,
    error,
    clearError,
  } = useAuth();
  // We're using window.location.href for navigation instead of router
  // but keeping the import for potential future use
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    bio: "",
    address: {
      country: "",
      city: "",
      street: "",
    },
    openToWork: false,
    about: "",
    preferredContact: "",
    skills: [],
    interests: [],
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      github: "",
      website: "",
    },
    profilePicture: "",
    companyName: "",
    companyWebsite: "",
    companyRole: "",
    industry: "",
    roleDetails: {}, // Centralized role-specific data
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps =
    user?.role &&
    ["startupOwner", "investor", "agency", "freelancer", "jobseeker"].includes(
      user.role
    )
      ? 6
      : 5;
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillTags, setSkillTags] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [interestTags, setInterestTags] = useState([]);
  const [roleDataLoaded, setRoleDataLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Fetch role-specific data
  const fetchRoleSpecificData = async (userId, role) => {
    if (!userId || !role || role === "user") {
      setRoleDataLoaded(true);
      return null;
    }
    try {
      const response = await api.get(`/users/${userId}/role-details`, {
        timeout: 10000,
      });
      if (response.data.status === "success" && response.data.data) {
        logger.info(`Fetched role details for ${role}:`, response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      logger.error(`Failed to fetch ${role} details:`, err);
      return null;
    } finally {
      setRoleDataLoaded(true);
    }
  };

  // Initialize form data with user and role-specific details
  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone:
          user.isPhoneVerified && user.phone ? user.phone : user.phone || "",
        gender: user.gender || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        bio: user.bio || "",
        address:
          typeof user.address === "object"
            ? {
                country: user.address?.country || "",
                city: user.address?.city || "",
                street: user.address?.street || "",
              }
            : {
                country: "",
                city: "",
                street: user.address || "", // If it's a string, put it in street field for backward compatibility
              },
        openToWork: user.openToWork || false,
        about: user.about || "",
        preferredContact: user.preferredContact || "",
        skills: user.skills || [],
        interests:
          user.interests?.map((i) => {
            // Handle different possible formats of interests
            if (typeof i === "string") return i;
            if (typeof i === "object" && i !== null) return i.name || "";
            return "";
          }).filter(Boolean) || // Remove any empty strings
          [],
        socialLinks: user.socialLinks || {
          facebook: "",
          twitter: "",
          linkedin: "",
          instagram: "",
          github: "",
          website: "",
        },
        profilePicture: user.profilePicture?.url || "",
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companyRole: user.companyRole || "",
        industry: user.industry || "",
        roleDetails: {},
      };

      // Set initial role-specific defaults based on role
      if (user.role && user.role !== "user") {
        switch (user.role) {
          case "startupOwner":
            initialData.roleDetails.startupOwner = {
              companyName: "",
              industry: "",
              fundingStage: "Pre-seed",
              companySize: "1-10",
              yearFounded: new Date().getFullYear(),
              website: "",
              description: "",
              location: { country: "", city: "" },
              teamSize: 1,
              socialLinks: initialData.socialLinks,
            };
            break;
          case "investor":
            initialData.roleDetails.investor = {
              investorType: "Angel Investor",
              investmentFocus: [],
              investmentRange: { min: 10000, max: 50000, currency: "USD" },
              companyName: "",
              industry: "",
              previousInvestments: [],
              location: { country: "", city: "" },
              website: "",
              investmentCriteria: [],
              preferredStages: [],
            };
            break;
          case "agency":
            initialData.roleDetails.agency = {
              companyName: "",
              industry: "",
              services: [],
              companySize: "1-10",
              yearFounded: new Date().getFullYear(),
              website: "",
              description: "",
              location: { country: "", city: "" },
              clientTypes: [],
              portfolio: [],
              socialLinks: initialData.socialLinks,
            };
            break;
          case "freelancer":
            initialData.roleDetails.freelancer = {
              skills: initialData.skills,
              experience: "Intermediate",
              hourlyRate: { amount: 0, currency: "USD" },
              availability: "Flexible",
              preferredJobTypes: ["Remote"],
              education: [],
              certifications: [],
              languages: [],
            };
            break;
          case "jobseeker":
            initialData.roleDetails.jobseeker = {
              jobTitle: "",
              experience: "Mid-Level",
              skills: initialData.skills,
              education: [],
              workExperience: [],
              certifications: [],
              languages: [],
              preferredJobTypes: ["Full-time"],
              preferredLocations: [],
              expectedSalary: { amount: 0, currency: "USD", period: "Yearly" },
              resumeUrl: "",
            };
            break;
          default:
            break;
        }
      }

      setFormData(initialData);
      setSkillTags(user.skills || []);
      setInterestTags(
        user.interests?.map((i) => {
          // Handle different possible formats of interests
          if (typeof i === "string") return i;
          if (typeof i === "object" && i !== null) return i.name || "";
          return "";
        }).filter(Boolean) || [] // Remove any empty strings
      );
      setProfileImagePreview(user.profilePicture?.url || null);

      // Fetch and merge existing role-specific data
      if (user.role && user.role !== "user" && user._id) {
        fetchRoleSpecificData(user._id, user.role).then((roleData) => {
          if (roleData) {
            setFormData((prev) => ({
              ...prev,
              roleDetails: {
                [user.role]: { ...prev.roleDetails[user.role], ...roleData },
              },
            }));
            logger.info(`Merged role details for ${user.role}`);
          }
        });
      } else {
        setRoleDataLoaded(true);
      }
    }
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parts = name.split(".");

    if (parts.length > 1) {
      if (parts[0] === "roleDetails") {
        const role = parts[1];
        const field = parts.slice(2).join(".");
        setFormData((prev) => {
          const updatedRoleDetails = { ...prev.roleDetails[role] };
          let current = updatedRoleDetails;
          const fieldParts = field.split(".");
          for (let i = 0; i < fieldParts.length - 1; i++) {
            current[fieldParts[i]] = { ...current[fieldParts[i]] };
            current = current[fieldParts[i]];
          }
          current[fieldParts[fieldParts.length - 1]] =
            type === "checkbox"
              ? checked
              : type === "number"
              ? Number(value)
              : value;
          return {
            ...prev,
            roleDetails: { ...prev.roleDetails, [role]: updatedRoleDetails },
          };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]:
              type === "checkbox"
                ? checked
                : type === "number"
                ? Number(value)
                : value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? Number(value)
            : value,
      }));
    }
  };

  // Handle profile image upload with improved error handling and feedback
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    try {
      // Set loading state to true
      setImageLoading(true);

      // Optimize the image
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
      });

      // Create a local preview immediately for better UX
      const localPreview = URL.createObjectURL(optimizedFile);
      setProfileImagePreview(localPreview);
      console.log("Set profileImagePreview to localPreview");

      // Try to upload to server if user is logged in
      if (user && user._id) {
        const uploadData = new FormData();
        uploadData.append("profileImage", optimizedFile);

        try {
          const result = await updateProfilePicture(uploadData);

          if (result && result.url) {
            // Update with server URL if available
            setProfileImagePreview(result.url);
            setFormData((prev) => ({
              ...prev,
              profileImage: optimizedFile, // Keep the file for form submission
              profilePicture: result.url, // Store the URL for display
            }));
            toast.success("Profile picture uploaded successfully");
            console.log("Profile picture uploaded successfully:", result.url);
          } else {
            // Keep local preview if server upload fails
            setFormData((prev) => ({
              ...prev,
              profileImage: optimizedFile,
              profilePicture: URL.createObjectURL(optimizedFile), // Set local URL for preview
            }));
            toast.success("Image ready for submission");
            console.log("Image ready for submission, keeping optimized file");
          }
        } catch (uploadErr) {
          toast.error(
            "Couldn't upload to server, but image is ready for submission"
          );
          logger.error("Upload error:", uploadErr);

          // Still keep the local preview and file for form submission
          setFormData((prev) => ({
            ...prev,
            profileImage: optimizedFile,
            profilePicture: URL.createObjectURL(optimizedFile), // Set local URL for preview
          }));
          console.log("Set profileImage to optimizedFile after upload error");
        }
      } else {
        // No user logged in yet, just keep the file for form submission
        setFormData((prev) => ({
          ...prev,
          profileImage: optimizedFile,
          profilePicture: URL.createObjectURL(optimizedFile), // Set local URL for preview
        }));
        console.log("Set profileImage to optimizedFile (no user logged in)");
        toast.success("Image ready for submission");
      }
    } catch (err) {
      toast.error(
        "Image processing failed: " + (err.message || "Unknown error")
      );
      logger.error("Image processing error:", err);
    } finally {
      // Always set loading state back to false when done
      setImageLoading(false);
    }
  };

  // Handle tag inputs (skills and interests)
  const handleTagInput = (e, type) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const input = type === "skills" ? skillInput : interestInput;
    const tags = type === "skills" ? skillTags : interestTags;
    const newTag = input ? input.trim() : "";
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      if (type === "skills") {
        setSkillTags(updatedTags);
        setFormData((prev) => ({
          ...prev,
          skills: updatedTags,
          ...(user?.role === "freelancer" || user?.role === "jobseeker"
            ? {
                roleDetails: {
                  ...prev.roleDetails,
                  [user.role]: {
                    ...prev.roleDetails[user.role],
                    skills: updatedTags,
                  },
                },
              }
            : {}),
        }));
        setSkillInput("");
      } else {
        setInterestTags(updatedTags);
        // Store interests as objects with name and strength properties in formData
        setFormData((prev) => ({
          ...prev,
          interests: updatedTags.map(tag => ({ name: tag, strength: 5 }))
        }));
        setInterestInput("");
      }
    }
  };

  const removeTag = (tag, type) => {
    const updatedTags = (type === "skills" ? skillTags : interestTags).filter(
      (t) => t !== tag
    );
    if (type === "skills") {
      setSkillTags(updatedTags);
      setFormData((prev) => ({
        ...prev,
        skills: updatedTags,
        ...(user?.role === "freelancer" || user?.role === "jobseeker"
          ? {
              roleDetails: {
                ...prev.roleDetails,
                [user.role]: {
                  ...prev.roleDetails[user.role],
                  skills: updatedTags,
                },
              },
            }
          : {}),
      }));
    } else {
      setInterestTags(updatedTags);
      // Store interests as objects with name and strength properties in formData
      setFormData((prev) => ({
        ...prev,
        interests: updatedTags.map(tag => ({ name: tag, strength: 5 }))
      }));
    }
  };

  // Curated, focused list of predefined options for a cleaner UI
  const predefinedOptions = {
    skills: [
      "JavaScript",
      "React",
      "Python",
      "UI Design",
      "Product Management",
      "Marketing",
      "Data Analysis",
      "Mobile Development",
    ],
    interests: [
      "Technology",
      "AI",
      "Design",
      "E-commerce",
      "SaaS",
      "Fintech",
      "Education",
      "Sustainability",
    ],
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email && !formData.phone)
      errors.contact = "Email or phone required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email";
    if (
      formData.phone &&
      typeof formData.phone === "string" &&
      !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ""))
    )
      errors.phone = "Invalid phone number";

    if (user?.role && formData.roleDetails && formData.roleDetails[user.role]) {
      const roleData = formData.roleDetails[user.role];
      if (roleData) {
        switch (user.role) {
          case "startupOwner":
            if (!roleData.companyName)
              errors["roleDetails.companyName"] = "Company name required";
            if (!roleData.industry)
              errors["roleDetails.industry"] = "Industry required";
            if (
              roleData.yearFounded &&
              (roleData.yearFounded < 1900 ||
                roleData.yearFounded > new Date().getFullYear())
            ) {
              errors[
                "roleDetails.yearFounded"
              ] = `Year must be between 1900 and ${new Date().getFullYear()}`;
            }
            break;
          case "investor":
            if (!roleData.investorType)
              errors["roleDetails.investorType"] = "Investor type required";
            if (roleData.investmentRange?.min > roleData.investmentRange?.max) {
              errors["roleDetails.investmentRange"] =
                "Min investment must be less than max";
            }
            break;
          case "agency":
            if (!roleData.companyName)
              errors["roleDetails.companyName"] = "Company name required";
            if (roleData.services.length === 0)
              errors["roleDetails.services"] = "At least one service required";
            break;
          case "freelancer":
            if (roleData.skills.length === 0)
              errors["roleDetails.skills"] = "At least one skill required";
            if (!roleData.experience)
              errors["roleDetails.experience"] = "Experience level required";
            break;
          case "jobseeker":
            if (!roleData.jobTitle)
              errors["roleDetails.jobTitle"] = "Job title required";
            if (roleData.skills.length === 0)
              errors["roleDetails.skills"] = "At least one skill required";
            break;
          default:
            break;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log("Submit button clicked");
    setIsSubmitting(true);
    clearError();

    // Show a loading toast that will be dismissed on success or error
    const loadingToast = toast.loading("Saving your profile...");

    if (!validateForm()) {
      toast.dismiss(loadingToast);
      toast.error("Please correct the errors in the form");
      setIsSubmitting(false);
      return;
    }

    try {
      const cleanedSocialLinks = Object.fromEntries(
        Object.entries(formData.socialLinks || {}).filter(
          ([_, v]) => v && typeof v === "string" && v.trim()
        )
      );

      // Properly format the address as an object
      const addressObject = {
        country: formData.address?.country || "",
        city: formData.address?.city || "",
        street: formData.address?.street || "",
      };

      // Extract role-specific details - send directly without nesting under role name
      let roleDetailsData = {};
      if (
        user &&
        user.role &&
        user.role !== "user" &&
        formData.roleDetails &&
        formData.roleDetails[user.role]
      ) {
        // Send the role details directly without nesting under the role name
        roleDetailsData = formData.roleDetails[user.role];
        console.log(
          "Extracted role details for role:",
          user.role,
          roleDetailsData
        );
      }

      const userData = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        gender: formData.gender || "",
        birthDate: formData.birthDate || "",
        bio: formData.bio || "",
        address: addressObject, // Send address as an object
        openToWork: Boolean(formData.openToWork),
        about: formData.about || "",
        preferredContact: formData.preferredContact || "",
        skills: skillTags || [],
        // Format interests as objects with name and strength properties
        interests: (interestTags || []).map(tag => ({ name: tag, strength: 5 })),
        socialLinks: cleanedSocialLinks || {},
        profilePicture: formData.profilePicture || undefined,
        companyName: formData.companyName || "",
        companyWebsite: formData.companyWebsite || "",
        companyRole: formData.companyRole || "",
        industry: formData.industry || "",
        roleDetails: roleDetailsData,
      };

      const formDataToSend = new FormData();

      // Handle profile image correctly
      if (formData.profileImage instanceof File) {
        console.log("Appending profile image as File");
        formDataToSend.append("profileImage", formData.profileImage);
      } else if (formData.profileImage instanceof Blob) {
        console.log("Appending profile image as Blob");
        formDataToSend.append(
          "profileImage",
          formData.profileImage,
          "profile-image.jpg"
        );
      } else if (formData.profileImage) {
        console.log(
          "Profile image is not a File or Blob:",
          typeof formData.profileImage
        );
      }

      // If we have a profilePicture URL but no File/Blob, include it in userData
      if (formData.profilePicture && !formData.profileImage) {
        console.log(
          "Using existing profilePicture URL:",
          formData.profilePicture
        );
        // The profilePicture URL is already included in userData
      }

      formDataToSend.append("userData", JSON.stringify(userData));

      console.log(
        "Form data to send:",
        Object.fromEntries(formDataToSend.entries())
      );
      console.log("User data:", userData);

      // Make sure we're sending the right data
      console.log("About to call completeProfile with:", formDataToSend);
      console.log("userData JSON:", formDataToSend.get("userData"));
      console.log(
        "userData parsed:",
        JSON.parse(formDataToSend.get("userData"))
      );

      const result = await completeProfile(formDataToSend);
      console.log("Complete profile result:", result);

      // Log detailed information about the result
      if (result?.success) {
        console.log("Profile completion successful!");
        console.log("User data returned:", result.user);
        if (result.user?.isProfileCompleted) {
          console.log("Profile is marked as completed in the response");
        } else {
          console.warn("Profile is NOT marked as completed in the response");
        }
      } else {
        console.error("Profile completion failed:", result?.message);
      }

      if (result?.success) {
        toast.dismiss(loadingToast);
        toast.success("Profile completed successfully!");
        // Show confetti for 5 seconds
        setShowConfetti(true);

        // Update the user object with the new data
        if (result.user) {
          console.log("Updating user with new data:", result.user);
          // This will ensure the UI reflects the changes immediately
          // even if the AuthContext update hasn't happened yet
          setFormData((prev) => ({
            ...prev,
            ...result.user,
            roleDetails: result.user.roleDetails || prev.roleDetails,
          }));
        }

        // Force a redirect to the user profile page after a short delay
        // This is more reliable than relying on AuthContext's redirect
        setTimeout(() => {
          setShowConfetti(false);
          console.log("Redirecting to /user after profile completion");

          // Force a refresh of the user data before redirecting
          try {
            // This will ensure we have the latest user data
            const refreshUserData = async () => {
              try {
                // Force a refresh of the auth context
                const response = await fetch("/api/v1/auth/me", {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                });

                if (response.ok) {
                  console.log("Successfully refreshed user data");
                  // Wait a moment for the data to be processed
                  setTimeout(() => {
                    window.location.href = "/user"; // Use direct navigation instead of router
                  }, 250);
                } else {
                  console.error(
                    "Error refreshing user data:",
                    response.statusText
                  );
                  window.location.href = "/user"; // Redirect anyway
                }
              } catch (error) {
                console.error("Exception refreshing user data:", error);
                window.location.href = "/user"; // Redirect anyway
              }
            };
            refreshUserData();
          } catch (error) {
            console.error("Error in refresh function:", error);
            // Redirect anyway using direct navigation
            window.location.href = "/user";
          }
        }, 250); // Reduced to 0.25 second for better UX
      } else {
        const errorMessage = result?.message || "Profile update failed";
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
        console.error("Profile update failed:", errorMessage);
      }
    } catch (err) {
      console.error("Complete profile error:", err);
      logger.error("Submission error:", err);

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      // Show more detailed error information
      if (err.response) {
        console.error("Error response:", err.response.data);
        const errorMessage =
          err.response.data.message || "Unknown server error";
        toast.error(`Server error: ${errorMessage}`);
      } else {
        toast.error(err.message || "Failed to complete profile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render tag input for skills or interests with modern minimalistic design
  const renderTagInput = (type, label) => {
    const tags = type === "skills" ? skillTags : interestTags;
    const inputValue = type === "skills" ? skillInput : interestInput;
    const setInputValue = type === "skills" ? setSkillInput : setInterestInput;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <span className="text-xs text-gray-900">{tags.length} selected</span>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {type === "skills" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 pl-10 bg-gray-50 rounded-md transition-all duration-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-900/30 hover:bg-gray-100 min-h-[50px]">
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
                  layout
                >
                  <Tag text={tag} onRemove={() => removeTag(tag, type)} />
                </motion.div>
              ))}
            </AnimatePresence>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleTagInput(e, type)}
              className="flex-grow min-w-[150px] outline-none p-1 text-sm"
              placeholder={
                tags.length === 0
                  ? `Add ${type === "skills" ? "skills" : "interests"}...`
                  : `Add more ${type === "skills" ? "skills" : "interests"}...`
              }
            />
          </div>
        </div>

        <div className="mt-1">
          <p className="text-xs text-gray-500 mb-2">
            {type === "skills"
              ? "Select skills relevant to your expertise"
              : "Select interests to personalize your recommendations"}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {predefinedOptions[type].map((option) => {
              const isSelected = tags.includes(option);
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (!tags.includes(option)) {
                      const updatedTags = [...tags, option];
                      type === "skills"
                        ? setSkillTags(updatedTags)
                        : setInterestTags(updatedTags);
                      setFormData((prev) => {
                        // Handle skills and interests differently
                        if (type === "skills") {
                          return {
                            ...prev,
                            skills: updatedTags,
                            ...(user?.role === "freelancer" || user?.role === "jobseeker"
                              ? {
                                  roleDetails: {
                                    ...prev.roleDetails,
                                    [user.role]: {
                                      ...prev.roleDetails[user.role],
                                      skills: updatedTags,
                                    },
                                  },
                                }
                              : {}),
                          };
                        } else {
                          // For interests, store as objects with name and strength
                          return {
                            ...prev,
                            interests: updatedTags.map(tag => ({ name: tag, strength: 5 }))
                          };
                        }
                      });
                    }
                  }}
                  className={clsx(
                    "px-2 py-0.5 text-xs rounded-md transition-all duration-200 flex items-center",
                    isSelected
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  disabled={isSelected}
                  whileHover={isSelected ? {} : { scale: 1.03, y: -1 }}
                  whileTap={isSelected ? {} : { scale: 0.97 }}
                >
                  {isSelected ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5 mr-1"
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
                      {option}
                    </>
                  ) : (
                    <>
                      <span className="text-xs mr-1">+</span>
                      {option}
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render a generic form field
  const renderFormField = (
    name,
    label,
    type = "text",
    required = false,
    options = null,
    placeholder = ""
  ) => {
    const isError = formErrors[name];
    const value = name.includes(".")
      ? name.split(".").reduce((obj, key) => obj?.[key], formData)
      : formData[name] || "";

    const getIconForField = () => {
      const fieldIcons = {
        email: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
        password: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ),
        tel: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        ),
        date: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        url: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        ),
        number: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        ),
      };

      // Check if the field name contains certain keywords
      if (name.toLowerCase().includes("email")) return fieldIcons.email;
      if (name.toLowerCase().includes("password")) return fieldIcons.password;
      if (name.toLowerCase().includes("phone")) return fieldIcons.tel;
      if (name.toLowerCase().includes("date") || type === "date")
        return fieldIcons.date;
      if (
        name.toLowerCase().includes("website") ||
        name.toLowerCase().includes("url") ||
        type === "url"
      )
        return fieldIcons.url;
      if (type === "number") return fieldIcons.number;

      // Default icon for text fields
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
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
      );
    };

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={name}
          className={clsx(
            "block text-xs font-medium",
            isError ? "text-red-600" : "text-gray-500"
          )}
        >
          {label} {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="relative">
          {type === "select" ? (
            <div className="relative">
              <motion.select
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                className={clsx(
                  "w-full pl-10 pr-3 py-2 rounded-md border-0 bg-gray-50 focus:outline-none transition-all duration-200 text-sm appearance-none",
                  isError
                    ? "ring-1 ring-red-300 focus:ring-2 focus:ring-red-500/50"
                    : "hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-gray-900/30"
                )}
                initial={{ y: 3, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileFocus={{ y: -1 }}
              >
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </motion.select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          ) : type === "textarea" ? (
            <div className="relative">
              <motion.textarea
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows="4"
                className={clsx(
                  "w-full pl-10 pr-3 py-2 rounded-md border-0 bg-gray-50 focus:outline-none transition-all duration-200 text-sm",
                  isError
                    ? "ring-1 ring-red-300 focus:ring-2 focus:ring-red-500/50"
                    : "hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-gray-900/30"
                )}
                initial={{ y: 3, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileFocus={{ y: -1 }}
              />
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className="relative">
              <motion.input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                required={required}
                placeholder={placeholder}
                className={clsx(
                  "w-full pl-10 pr-3 py-2 rounded-md border-0 bg-gray-50 focus:outline-none transition-all duration-200 text-sm",
                  isError
                    ? "ring-1 ring-red-300 focus:ring-2 focus:ring-red-500/50"
                    : "hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-gray-900/30"
                )}
                initial={{ y: 3, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileFocus={{ y: -1 }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIconForField()}
              </div>
            </div>
          )}
        </div>
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="mt-1"
            >
              <p className="text-red-500 text-xs flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>{isError}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render role-specific step
  const renderRoleSpecificStep = () => {
    if (!user?.role || user.role === "user") return null;
    switch (user.role) {
      case "startupOwner":
        return (
          <FormStep title="Startup Details" isActive={currentStep === 5}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Tell us about your startup to connect with the right people.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "roleDetails.startupOwner.companyName",
                  "Company Name",
                  "text",
                  true
                )}
                {renderFormField(
                  "roleDetails.startupOwner.industry",
                  "Industry",
                  "text",
                  true
                )}
                {renderFormField(
                  "roleDetails.startupOwner.fundingStage",
                  "Funding Stage",
                  "select",
                  false,
                  [
                    { value: "Pre-seed", label: "Pre-seed" },
                    { value: "Seed", label: "Seed" },
                    { value: "Series A", label: "Series A" },
                    { value: "Bootstrapped", label: "Bootstrapped" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.startupOwner.companySize",
                  "Company Size",
                  "select",
                  false,
                  [
                    { value: "1-10", label: "1-10" },
                    { value: "11-50", label: "11-50" },
                    { value: "51-200", label: "51-200" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.startupOwner.yearFounded",
                  "Year Founded",
                  "number",
                  false,
                  null,
                  "e.g., 2023"
                )}
                {renderFormField(
                  "roleDetails.startupOwner.website",
                  "Website",
                  "url",
                  false,
                  null,
                  "https://yourstartup.com"
                )}
                {renderFormField(
                  "roleDetails.startupOwner.teamSize",
                  "Team Size",
                  "number",
                  false,
                  null,
                  "e.g., 5"
                )}
                {renderFormField(
                  "roleDetails.startupOwner.location.country",
                  "Country",
                  "text"
                )}
                {renderFormField(
                  "roleDetails.startupOwner.location.city",
                  "City",
                  "text"
                )}
              </div>
              {renderFormField(
                "roleDetails.startupOwner.description",
                "Description",
                "textarea",
                false,
                null,
                "Briefly describe your startup"
              )}
            </div>
          </FormStep>
        );
      case "investor":
        return (
          <FormStep title="Investor Details" isActive={currentStep === 5}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Share your investment preferences to find opportunities.
              </p>
              {renderFormField(
                "roleDetails.investor.investorType",
                "Investor Type",
                "select",
                true,
                [
                  { value: "Angel Investor", label: "Angel Investor" },
                  { value: "Venture Capitalist", label: "Venture Capitalist" },
                  { value: "Individual", label: "Individual" },
                ]
              )}
              {renderFormField(
                "roleDetails.investor.companyName",
                "Company Name (if applicable)",
                "text"
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Investment Focus
                </label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
                  {formData.roleDetails?.investor?.investmentFocus?.map(
                    (tag, i) => (
                      <Tag
                        key={i}
                        text={tag}
                        onRemove={() => {
                          const updatedTags =
                            formData.roleDetails.investor.investmentFocus.filter(
                              (t) => t !== tag
                            );
                          setFormData((prev) => ({
                            ...prev,
                            roleDetails: {
                              ...prev.roleDetails,
                              investor: {
                                ...prev.roleDetails.investor,
                                investmentFocus: updatedTags,
                              },
                            },
                          }));
                        }}
                      />
                    )
                  )}
                  <input
                    type="text"
                    value={formData.investmentFocusInput || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investmentFocusInput: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== ",") return;
                      e.preventDefault();
                      const newTag = formData.investmentFocusInput
                        ? formData.investmentFocusInput.trim()
                        : "";
                      if (
                        newTag &&
                        !formData.roleDetails?.investor?.investmentFocus?.includes(
                          newTag
                        )
                      ) {
                        const updatedTags = [
                          ...(formData.roleDetails?.investor?.investmentFocus ||
                            []),
                          newTag,
                        ];
                        setFormData((prev) => ({
                          ...prev,
                          investmentFocusInput: "",
                          roleDetails: {
                            ...prev.roleDetails,
                            investor: {
                              ...prev.roleDetails.investor,
                              investmentFocus: updatedTags,
                            },
                          },
                        }));
                      }
                    }}
                    className="flex-grow min-w-[150px] outline-none p-1 text-sm"
                    placeholder="Add investment focus and press Enter"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "SaaS",
                    "Fintech",
                    "Health Tech",
                    "AI",
                    "E-commerce",
                    "Mobile Apps",
                    "Enterprise",
                    "Consumer",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (
                          !formData.roleDetails?.investor?.investmentFocus?.includes(
                            option
                          )
                        ) {
                          const updatedTags = [
                            ...(formData.roleDetails?.investor
                              ?.investmentFocus || []),
                            option,
                          ];
                          setFormData((prev) => ({
                            ...prev,
                            roleDetails: {
                              ...prev.roleDetails,
                              investor: {
                                ...prev.roleDetails.investor,
                                investmentFocus: updatedTags,
                              },
                            },
                          }));
                        }
                      }}
                      className={clsx(
                        "px-2 py-1 text-xs rounded-full",
                        formData.roleDetails?.investor?.investmentFocus?.includes(
                          option
                        )
                          ? "bg-violet-100 text-violet-700 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                      disabled={formData.roleDetails?.investor?.investmentFocus?.includes(
                        option
                      )}
                    >
                      + {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "roleDetails.investor.investmentRange.min",
                  "Min Investment ($)",
                  "number"
                )}
                {renderFormField(
                  "roleDetails.investor.investmentRange.max",
                  "Max Investment ($)",
                  "number"
                )}
                {renderFormField(
                  "roleDetails.investor.investmentRange.currency",
                  "Currency",
                  "select",
                  false,
                  [
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.investor.website",
                  "Website",
                  "url",
                  false,
                  null,
                  "https://yourwebsite.com"
                )}
              </div>
            </div>
          </FormStep>
        );
      case "agency":
        return (
          <FormStep title="Agency Details" isActive={currentStep === 5}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Describe your agency to attract clients.
              </p>
              {renderFormField(
                "roleDetails.agency.companyName",
                "Agency Name",
                "text",
                true
              )}
              {renderFormField(
                "roleDetails.agency.industry",
                "Industry",
                "text"
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
                  {formData.roleDetails?.agency?.services?.map((tag, i) => (
                    <Tag
                      key={i}
                      text={tag}
                      onRemove={() => {
                        const updatedTags =
                          formData.roleDetails.agency.services.filter(
                            (t) => t !== tag
                          );
                        setFormData((prev) => ({
                          ...prev,
                          roleDetails: {
                            ...prev.roleDetails,
                            agency: {
                              ...prev.roleDetails.agency,
                              services: updatedTags,
                            },
                          },
                        }));
                      }}
                    />
                  ))}
                  <input
                    type="text"
                    value={formData.servicesInput || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servicesInput: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== ",") return;
                      e.preventDefault();
                      const newTag = formData.servicesInput
                        ? formData.servicesInput.trim()
                        : "";
                      if (
                        newTag &&
                        !formData.roleDetails?.agency?.services?.includes(
                          newTag
                        )
                      ) {
                        const updatedTags = [
                          ...(formData.roleDetails?.agency?.services || []),
                          newTag,
                        ];
                        setFormData((prev) => ({
                          ...prev,
                          servicesInput: "",
                          roleDetails: {
                            ...prev.roleDetails,
                            agency: {
                              ...prev.roleDetails.agency,
                              services: updatedTags,
                            },
                          },
                        }));
                      }
                    }}
                    className="flex-grow min-w-[150px] outline-none p-1 text-sm"
                    placeholder="Add service and press Enter"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Web Development",
                    "Mobile Apps",
                    "UI/UX Design",
                    "Branding",
                    "Digital Marketing",
                    "SEO",
                    "Content Creation",
                    "Consulting",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (
                          !formData.roleDetails?.agency?.services?.includes(
                            option
                          )
                        ) {
                          const updatedTags = [
                            ...(formData.roleDetails?.agency?.services || []),
                            option,
                          ];
                          setFormData((prev) => ({
                            ...prev,
                            roleDetails: {
                              ...prev.roleDetails,
                              agency: {
                                ...prev.roleDetails.agency,
                                services: updatedTags,
                              },
                            },
                          }));
                        }
                      }}
                      className={clsx(
                        "px-2 py-1 text-xs rounded-full",
                        formData.roleDetails?.agency?.services?.includes(option)
                          ? "bg-violet-100 text-violet-700 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                      disabled={formData.roleDetails?.agency?.services?.includes(
                        option
                      )}
                    >
                      + {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "roleDetails.agency.companySize",
                  "Company Size",
                  "select",
                  false,
                  [
                    { value: "1-10", label: "1-10" },
                    { value: "11-50", label: "11-50" },
                    { value: "51-200", label: "51-200" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.agency.yearFounded",
                  "Year Founded",
                  "number",
                  false,
                  null,
                  "e.g., 2023"
                )}
                {renderFormField(
                  "roleDetails.agency.website",
                  "Website",
                  "url",
                  false,
                  null,
                  "https://youragency.com"
                )}
                {renderFormField(
                  "roleDetails.agency.location.country",
                  "Country",
                  "text"
                )}
                {renderFormField(
                  "roleDetails.agency.location.city",
                  "City",
                  "text"
                )}
              </div>
            </div>
          </FormStep>
        );
      case "freelancer":
        return (
          <FormStep title="Freelancer Details" isActive={currentStep === 5}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Showcase your skills to land freelance gigs.
              </p>
              {renderTagInput("skills", "Skills")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "roleDetails.freelancer.experience",
                  "Experience Level",
                  "select",
                  true,
                  [
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Expert", label: "Expert" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.freelancer.availability",
                  "Availability",
                  "select",
                  false,
                  [
                    { value: "Full-time", label: "Full-time" },
                    { value: "Part-time", label: "Part-time" },
                    { value: "Flexible", label: "Flexible" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.freelancer.hourlyRate.amount",
                  "Hourly Rate",
                  "number"
                )}
                {renderFormField(
                  "roleDetails.freelancer.hourlyRate.currency",
                  "Currency",
                  "select",
                  false,
                  [
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]
                )}
              </div>
            </div>
          </FormStep>
        );
      case "jobseeker":
        return (
          <FormStep title="Job Seeker Details" isActive={currentStep === 5}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Help employers find you with your job preferences.
              </p>
              {renderFormField(
                "roleDetails.jobseeker.jobTitle",
                "Desired Job Title",
                "text",
                true
              )}
              {renderTagInput("skills", "Skills")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "roleDetails.jobseeker.experience",
                  "Experience Level",
                  "select",
                  false,
                  [
                    { value: "Entry Level", label: "Entry Level" },
                    { value: "Mid-Level", label: "Mid-Level" },
                    { value: "Senior", label: "Senior" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.jobseeker.expectedSalary.amount",
                  "Expected Salary",
                  "number"
                )}
                {renderFormField(
                  "roleDetails.jobseeker.expectedSalary.currency",
                  "Currency",
                  "select",
                  false,
                  [
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]
                )}
                {renderFormField(
                  "roleDetails.jobseeker.expectedSalary.period",
                  "Period",
                  "select",
                  false,
                  [
                    { value: "Hourly", label: "Hourly" },
                    { value: "Monthly", label: "Monthly" },
                    { value: "Yearly", label: "Yearly" },
                  ]
                )}
              </div>
            </div>
          </FormStep>
        );
      default:
        return null;
    }
  };

  // Render review step with enhanced UI
  const renderReviewStep = () => {
    // Helper function to format role-specific details
    const formatRoleDetails = (details) => {
      if (!details) return [];

      return Object.entries(details)
        .map(([key, value]) => {
          if (
            key === "skills" ||
            !value ||
            (typeof value === "object" && Object.keys(value).length === 0)
          )
            return null;

          // Format the key for display
          const formattedKey = key
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

          // Format the value based on its type
          let formattedValue = value;
          if (typeof value === "object") {
            if (Array.isArray(value)) {
              // Handle arrays of objects specially
              if (value.length > 0 && typeof value[0] === 'object') {
                // For arrays of objects, try to extract meaningful properties
                formattedValue = value.map(item => {
                  if (item.name) return item.name;
                  if (item.title) return item.title;
                  if (item.label) return item.label;
                  // If no meaningful property found, return a placeholder
                  return 'Item';
                }).join(', ');
              } else {
                formattedValue = value.join(", ");
              }
            } else if (key === "location" && value.city && value.country) {
              formattedValue = `${value.city}, ${value.country}`;
            } else if (key === "hourlyRate" && value.amount && value.currency) {
              formattedValue = `${value.amount} ${value.currency}`;
            } else if (key === "expectedSalary" && value.amount && value.currency) {
              formattedValue = `${value.amount} ${value.currency} ${value.period || 'yearly'}`;
            } else if (key === "investmentRange" && (value.min || value.max)) {
              formattedValue = `${value.min || 0} - ${
                value.max || "Unlimited"
              }`;
            } else {
              // For other objects, create a more readable representation
              try {
                formattedValue = Object.entries(value)
                  .filter(([k, v]) => v !== null && v !== undefined && k !== 'id' && k !== '_id')
                  .map(([k, v]) => {
                    // Format nested objects/arrays recursively
                    if (typeof v === 'object') {
                      if (Array.isArray(v)) {
                        return `${k}: ${v.join(', ')}`;
                      } else if (v !== null) {
                        return `${k}: ${Object.values(v).filter(Boolean).join(', ')}`;
                      }
                    }
                    return `${k}: ${v}`;
                  })
                  .join(", ");
              } catch (err) {
                // Fallback if anything goes wrong
                formattedValue = 'Complex data';
              }
            }
          }

          return { key: formattedKey, value: formattedValue };
        })
        .filter(Boolean); // Remove null entries
    };

    const roleDetails =
      user.role !== "user" && formData.roleDetails[user.role]
        ? formatRoleDetails(formData.roleDetails[user.role])
        : [];

    return (
      <FormStep title="Review & Submit" isActive={currentStep === totalSteps}>
        <div className="space-y-8">
          <motion.div
            className="p-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-100 shadow-sm overflow-hidden relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200 rounded-full opacity-20 -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-200 rounded-full opacity-20 -ml-6 -mb-6"></div>

            <div className="flex items-start relative z-10">
              <div className="flex-shrink-0 bg-violet-100 rounded-full p-3 mr-4 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-medium text-violet-800 mb-2">
                  Almost there! Review your profile
                </h4>
                <p className="text-sm text-violet-700 leading-relaxed">
                  Please review your information before submitting. Everything looks good? Great! If you need to make changes, you can go
                  back to any previous step using the navigation above.
                </p>
                <div className="mt-3 flex items-center text-xs text-violet-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <span>Click "Complete Profile" when you're ready to finish</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Image and Basic Info - Enhanced UI */}
          <motion.div
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-violet-200 flex-shrink-0 mx-auto md:mx-0 shadow-md">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-50 text-violet-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </motion.div>

              <div className="flex-grow w-full md:w-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {formData.firstName} {formData.lastName}
                    </h3>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 mr-2">
                        {user?.role
                          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                          : "User"}
                      </span>
                      {formData.headline && (
                        <span className="text-gray-500 text-sm">{formData.headline}</span>
                      )}
                    </div>
                  </div>

                  {/* Verification badges */}
                  <div className="flex mt-2 md:mt-0 space-x-2">
                    {user?.isEmailVerified && (
                      <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>Email Verified</span>
                      </div>
                    )}
                    {user?.isPhoneVerified && (
                      <div className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                        <span>Phone Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                  <motion.div
                    className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    whileHover={{ x: 2 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Email</div>
                      <div className="font-medium">{formData.email || "Email not provided"}</div>
                    </div>
                  </motion.div>

                  {formData.phone && (
                    <motion.div
                      className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                        <div className="font-medium">{formData.phone}</div>
                      </div>
                    </motion.div>
                  )}

                  {formData.address && formData.address.country && (
                    <motion.div
                      className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Location</div>
                        <div className="font-medium">
                          {[formData.address?.street, formData.address?.city, formData.address?.country]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.companyName && (
                    <motion.div
                      className="flex items-center text-sm p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-amber-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Company</div>
                        <div className="font-medium">{formData.companyName}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section - Enhanced UI */}
          {formData.bio && (
            <motion.div
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full opacity-20 -mr-10 -mt-10 z-0"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-md bg-violet-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-gray-800">About Me</h4>
                </div>

                <div className="pl-11">
                  <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                    {formData.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Skills & Interests - Enhanced UI */}
          {(skillTags.length > 0 || interestTags.length > 0) && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {skillTags.length > 0 && (
                <motion.div
                  className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-md bg-violet-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-violet-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-base font-medium text-gray-800">Skills</h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skillTags.map((skill, index) => (
                      <motion.span
                        key={skill}
                        className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-100 hover:bg-violet-100 transition-colors duration-200 flex items-center"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 * index }}
                        whileHover={{ y: -2 }}
                      >
                        <svg className="w-3 h-3 mr-1.5 text-violet-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {interestTags.length > 0 && (
                <motion.div
                  className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-base font-medium text-gray-800">Interests</h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interestTags.map((interest, index) => (
                      <motion.span
                        key={interest}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors duration-200 flex items-center"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 * index }}
                        whileHover={{ y: -2 }}
                      >
                        <svg className="w-3 h-3 mr-1.5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        {interest}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Role-specific details - Enhanced UI */}
          {roleDetails.length > 0 && (
            <motion.div
              className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-violet-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {user.role === "startupOwner" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    ) : user.role === "investor" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : user.role === "freelancer" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    ) : user.role === "jobseeker" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    ) : user.role === "agency" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    )}
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-800">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {roleDetails
                  .filter(({ key }) => !key.toLowerCase().includes("id"))
                  .map(({ key, value }, index) => (
                    <motion.div
                      key={key}
                      className="py-2 px-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 + (index * 0.05) }}
                    >
                      <div className="text-xs text-gray-500 mb-1">{key}</div>
                      <div className="font-medium text-gray-800 break-words">{value}</div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Social Links - Enhanced UI */}
          {formData.socialLinks &&
            Object.values(formData.socialLinks).some((link) => link) && (
              <motion.div
                className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-gray-800">Connect With Me</h4>
                </div>

                <div className="flex flex-wrap gap-3">
                  {formData.socialLinks.twitter && (
                    <motion.a
                      href={formData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                      <span className="text-sm font-medium">Twitter</span>
                    </motion.a>
                  )}
                  {formData.socialLinks.linkedin && (
                    <motion.a
                      href={formData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                      </svg>
                      <span className="text-sm font-medium">LinkedIn</span>
                    </motion.a>
                  )}
                  {formData.socialLinks.github && (
                    <motion.a
                      href={formData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                      </svg>
                      <span className="text-sm font-medium">GitHub</span>
                    </motion.a>
                  )}
                  {formData.socialLinks.website && (
                    <motion.a
                      href={formData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <span className="text-sm font-medium">Website</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )}
        </div>
      </FormStep>
    );
  };

  // Render step indicator with minimalistic design
  const renderStepIndicator = () => {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const getStepLabel = (step) => {
      const labels = ["Basic", "Personal", "Professional", "Social"];
      if (totalSteps === 6) {
        labels.push(
          user.role === "startupOwner"
            ? "Startup"
            : user.role.charAt(0).toUpperCase() + user.role.slice(1)
        );
        labels.push("Review");
      } else {
        labels.push("Review");
      }
      return labels[step - 1];
    };

    return (
      <div className="mb-10">
        <div className="flex justify-between mb-6">
          {steps.map((step) => {
            const isActive = currentStep >= step;
            const isCompleted = currentStep > step;

            return (
              <motion.button
                key={step}
                className="flex flex-col items-center relative"
                onClick={() => isCompleted && setCurrentStep(step)}
                style={{ cursor: isCompleted ? "pointer" : "default" }}
                whileHover={isCompleted ? { y: -2 } : {}}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: step * 0.05 }}
              >
                {/* Step number */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                  ) : (
                    step
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`mt-1.5 text-xs ${
                    isActive ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}
                >
                  {getStepLabel(step)}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="relative h-0.5 bg-gray-100 w-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gray-900"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  };

  // Render profile image upload with fixed hover and click functionality
  const renderProfileImageUpload = () => (
    <motion.div
      className="flex flex-col items-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative w-32 h-32 cursor-pointer"
        onClick={() => !imageLoading && fileInputRef.current?.click()}
      >
        {/* Main image container */}
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 shadow-sm transition-all duration-300">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <LoaderComponent size="small" color="violet" text="" />
            </div>
          ) : profileImagePreview ? (
            <img
              src={profileImagePreview}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Hover overlay - positioned behind the click handler */}
        {!imageLoading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <div className="text-white text-center">
              <svg
                className="w-8 h-8 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs font-medium">
                {profileImagePreview ? "Change" : "Add Photo"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfileImageChange}
        className="hidden"
        accept="image/*"
        disabled={imageLoading}
      />

      {/* Update button - separate from the image for better UX */}
      <button
        type="button"
        onClick={() => !imageLoading && fileInputRef.current?.click()}
        disabled={imageLoading}
        className={`mt-3 text-xs ${imageLoading ? 'text-gray-400 bg-gray-100' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'} px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center space-x-1 border border-gray-200`}
      >
        {imageLoading ? (
          <>
            <div className="h-3.5 w-3.5 mr-1">
              <LoaderComponent size="small" color="gray" text="" />
            </div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            <span>{profileImagePreview ? "Update photo" : "Upload photo"}</span>
          </>
        )}
      </button>
    </motion.div>
  );

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep title="Basic Information" isActive={currentStep === 1}>
            <div className="space-y-6">
              {renderProfileImageUpload()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField("firstName", "First Name", "text", true)}
                {renderFormField("lastName", "Last Name", "text", true)}
                <div className="relative">
                  {renderFormField(
                    "email",
                    "Email",
                    "email",
                    !formData.phone,
                    null,
                    user?.isEmailVerified ? "Verified" : ""
                  )}
                  {user?.isEmailVerified && (
                    <div className="absolute top-0 right-0 mt-1 mr-2 flex items-center text-green-500 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
                <div className="relative">
                  {renderFormField(
                    "phone",
                    "Phone",
                    "tel",
                    !formData.email,
                    null,
                    user?.isPhoneVerified ? "" : "e.g., +12025550123"
                  )}
                  {user?.isPhoneVerified && (
                    <div className="absolute top-0 right-0 mt-1 mr-2 flex items-center text-green-500 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FormStep>
        );
      case 2:
        return (
          <FormStep title="Personal Information" isActive={currentStep === 2}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Personalize your experience with these details.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField("gender", "Gender", "select", false, [
                  { value: "", label: "Select" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ])}
                {renderFormField(
                  "birthDate",
                  "Birth Date",
                  "date",
                  false,
                  null,
                  "YYYY-MM-DD"
                )}
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {renderFormField(
                    "address.country",
                    "Country",
                    "text",
                    false,
                    null,
                    "Country"
                  )}
                  {renderFormField(
                    "address.city",
                    "City",
                    "text",
                    false,
                    null,
                    "City"
                  )}
                  {renderFormField(
                    "address.street",
                    "Street Address",
                    "text",
                    false,
                    null,
                    "Street address"
                  )}
                </div>
              </div>
              {renderFormField(
                "about",
                "About You",
                "textarea",
                false,
                null,
                "Tell us about yourself"
              )}
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
              <p className="text-sm text-gray-500 italic">
                Add your skills and interests to get started.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField("companyName", "Company Name", "text")}
                {renderFormField("companyRole", "Role", "text")}
              </div>
              {renderTagInput("skills", "Skills")}
              {renderTagInput("interests", "Interests")}
              {renderFormField(
                "bio",
                "Short Bio",
                "textarea",
                false,
                null,
                "A brief intro (max 500 chars)"
              )}
            </div>
          </FormStep>
        );
      case 4:
        return (
          <FormStep title="Social Links" isActive={currentStep === 4}>
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic">
                Connect your social profiles for better visibility.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField(
                  "socialLinks.linkedin",
                  "LinkedIn",
                  "url",
                  false,
                  null,
                  "https://linkedin.com/in/..."
                )}
                {renderFormField(
                  "socialLinks.twitter",
                  "Twitter",
                  "url",
                  false,
                  null,
                  "https://twitter.com/..."
                )}
                {renderFormField(
                  "socialLinks.github",
                  "GitHub",
                  "url",
                  false,
                  null,
                  "https://github.com/..."
                )}
                {renderFormField(
                  "socialLinks.website",
                  "Website",
                  "url",
                  false,
                  null,
                  "https://yourwebsite.com"
                )}
              </div>
            </div>
          </FormStep>
        );
      case 5:
        return user.role === "user"
          ? renderReviewStep()
          : renderRoleSpecificStep();
      case 6:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Render navigation buttons with minimalistic design
  const renderNavigationButtons = () => (
    <div className="flex items-center justify-end space-x-3">
      {currentStep > 1 && (
        <motion.button
          type="button"
          onClick={() => setCurrentStep((p) => p - 1)}
          className="px-4 py-2 text-gray-500 text-sm flex items-center space-x-1.5 transition-colors duration-200 hover:text-gray-700"
          whileHover={{ x: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
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
          <span>Back</span>
        </motion.button>
      )}
      {currentStep < totalSteps ? (
        <motion.button
          type="button"
          onClick={() => setCurrentStep((p) => p + 1)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md flex items-center space-x-1.5 transition-colors duration-200 hover:bg-gray-800"
          whileHover={{ x: 1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span>Continue</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
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
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={clsx(
            "px-4 py-2 rounded-md text-white text-sm flex items-center space-x-1.5 transition-colors duration-200",
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-900 hover:bg-gray-800"
          )}
          whileHover={isSubmitting ? {} : { x: 1 }}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="mr-2">
                <LoaderComponent text="" message="" size="small" color="white" />
              </div>
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <span>Complete Profile</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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

  if (authLoading || !roleDataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderComponent text="Loading profile..." size="default" color="violet" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showConfetti && <SuccessConfetti trigger={true} duration={5000} />}
      <div className="max-w-3xl mx-auto">
        {/* Logo and branding - more minimalistic */}
        <div className="flex justify-center mb-10">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-medium text-violet-600">
              ProductBazar
            </span>
          </motion.div>
        </div>

        {/* Main card - fixed height with scrollable content */}
        <motion.div
          className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[75vh] sm:h-[80vh]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Header - Fixed with violet accent for branding */}
          <div className="border-b border-gray-100 flex-shrink-0">
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <motion.h2
                  className="text-xl font-medium text-gray-800 mb-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Complete Your Profile
                </motion.h2>
                <motion.p
                  className="text-gray-500 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Tell us about yourself to personalize your experience
                </motion.p>
              </div>

              {/* Progress indicator with violet accent */}
              <motion.div
                className="flex items-center space-x-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="text-xs text-gray-500 mr-1">Step</div>
                <div className="flex space-x-1">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${
                        i < currentStep ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-8 overflow-y-auto flex-grow">
            {renderStepIndicator()}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 shadow-sm"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </motion.form>
          </div>

          {/* Footer - Fixed with violet accent */}
          <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center flex-shrink-0 bg-white">
            <motion.div
              className="text-xs text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <p>{new Date().getFullYear()} © ProductBazar</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {renderNavigationButtons()}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompleteProfile;
