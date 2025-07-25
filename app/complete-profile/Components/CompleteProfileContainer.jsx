"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { optimizeImage } from "@/lib/utils/image/image-utils";
import api from "@/lib/api/api";
import LoadingSpinner from "../../../Components/common/LoadingSpinner";
import SuccessConfetti from "./SuccessConfetti";

// Import Child Components
import { ProfileBasicsForm } from "./ProfileBasicsForm";
import { ProfileDetailsForm } from "./ProfileDetailsForm";
import { SocialLinksForm } from "./SocialLinksForm";
import { RoleSpecificForm } from "./RoleSpecificForm";
import { ProfileReview } from "./ProfileReview";
import { StepIndicator, NavigationButtons } from "./ProfileFormComponents";
import { useWaitlist } from "@/lib/contexts/waitlist-context";
import PasswordSetup from "./PasswordSetup.jsx";

const CompleteProfileContainer = () => {
  const { user, completeProfile, updateProfilePicture, authLoading, error: authError, clearError, fetchUserData, skipProfileCompletion } = useAuth();
  const { setWaitlistUserPassword, checkWaitlistUserPassword } = useWaitlist();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", gender: "", birthDate: "",
    bio: "", headline: "", address: { country: "", city: "", street: "" }, openToWork: false,
    about: "", preferredContact: "", skills: [], interests: [],
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "", github: "", website: "" },
    profilePicture: "", // URL from server or local preview
    profileImage: null, // Actual File/Blob for upload
    companyName: "", companyWebsite: "", companyRole: "", industry: "",
    roleDetails: {}, // Populated based on user role
  });
  const [multiInputValues, setMultiInputValues] = useState({}); // State for RoleSpecificForm inputs

  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillTags, setSkillTags] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [interestTags, setInterestTags] = useState([]);
  const [roleDataLoaded, setRoleDataLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Password setup state for waitlist users
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
    needsPasswordSetup: false,
    passwordSet: false,
    isChecking: true
  });

  // Adjust total steps based on user type and password setup needs
  const getTotalSteps = () => {
    // Base steps: Basic, Professional, Social, Review = 4 steps
    let steps = 4;
    
    // Add role-specific step for users with specific roles
    if (user?.role && ["startupOwner", "investor", "agency", "freelancer", "jobseeker"].includes(user.role)) {
      steps += 1; // Total: 5 steps
    }
    
    // Add password setup step for waitlist users who need it AND don't have password set
    const shouldAddPasswordStep = (
      user?.registrationMethod === 'waitlist' && 
      passwordData.needsPasswordSetup && 
      !passwordData.passwordSet && 
      !passwordData.hasPassword &&
      !passwordData.isChecking
    );
    
    if (shouldAddPasswordStep) {
      steps += 1;
    }
    
    return steps;
  };

  const totalSteps = getTotalSteps();

  // Get step label considering password setup
  const getStepLabel = (step) => {
    if (passwordData.isChecking) {
      return "Loading...";
    }
    
    // For waitlist users with password setup, adjust step labels
    if (user?.registrationMethod === 'waitlist' && 
        passwordData.needsPasswordSetup && 
        !passwordData.passwordSet) {
      // Password setup is step 0, so adjust other steps
      switch (step) {
        case 0: return "Password Setup";
        case 1: return "Basic Info";
        case 2: return "Professional";
        case 3: return "Social Links";
        case 4: return user?.role ? "Role Specific" : "Review";
        case 5: return "Review";
        default: return "Step " + (step + 1);
      }
    } else {
      // Normal flow
      switch (step) {
        case 0: return "Basic Info";
        case 1: return "Professional";
        case 2: return "Social Links";
        case 3: return user?.role ? "Role Specific" : "Review";
        case 4: return "Review";
        default: return "Step " + (step + 1);
      }
    }
  };

  const predefinedOptions = {
    skills: ["JavaScript", "React", "Python", "UI/UX Design", "Product Management", "Digital Marketing", "Data Analysis", "Node.js", "Project Management"],
    interests: ["Technology", "AI/ML", "Design", "E-commerce", "SaaS", "Fintech", "Web3", "Sustainability", "Startups", "Investing"],
  };

  // --- Data Fetching & Initialization ---
  const fetchRoleSpecificData = async (userId, role) => {
      if (!userId || !role || role === "user") return null;
      try {
          // Use makePriorityRequest to prevent this request from being canceled during navigation
          try {
              // Use priority request to prevent cancellation during navigation
              const response = await api.get(`/users/${userId}/role-details`, { timeout: 10000 });
              if (response.data.status === "success" && response.data.data) {
                  logger.info(`Fetched role details for ${role}:`, response.data.data);
                  return response.data.data;
              }
          } catch (priorityErr) {
              // If priority request fails, fall back to regular request
              logger.warn(`Priority request failed, falling back to regular request: ${priorityErr.message}`);
              const response = await api.get(`/users/${userId}/role-details`, { timeout: 10000 });
              if (response.data.status === "success" && response.data.data) {
                  logger.info(`Fetched role details for ${role}:`, response.data.data);
                  return response.data.data;
              }
          }
          return null;
      } catch (err) {
          // Don't log canceled errors as they're expected during navigation
          if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
              logger.error(`Failed to fetch ${role} details:`, err);
          }
          return null;
      }
  };

  // Check for access token in useEffect to prevent hydration mismatch
  useEffect(() => {
    // setHasAccessToken(!!localStorage.getItem('accessToken')); // Removed as per edit hint
  }, []);

  // Add a timeout to prevent infinite loading in extreme cases
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        // setLoadingTimeout(true); // Removed as per edit hint
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(timeout);
    } else {
      // setLoadingTimeout(false); // Removed as per edit hint
    }
  }, [authLoading]); // Removed hasAccessToken from dependency array

  // Enhanced OAuth callback handling for complete profile page
  useEffect(() => {
    // Check if this is an OAuth callback and handle it properly
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has('oauth_success') || urlParams.has('token');
    
    if (isOAuthCallback) {
      // If this is an OAuth callback, wait a bit longer for auth context to process
      const oauthTimer = setTimeout(() => {
        // Force a re-check of auth state after OAuth processing
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData && !user) {
          // Auth context might not have processed OAuth yet, try to refresh
          try {
            const parsedUser = JSON.parse(userData);
            console.log('OAuth callback detected, found stored user data:', parsedUser);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
          }
        }
      }, 1000); // Wait 1 second for OAuth processing
      
      return () => clearTimeout(oauthTimer);
    }
  }, [user]);

  useEffect(() => {
    // Reset role data loaded state when auth state changes
    if (authLoading) {
      setRoleDataLoaded(false);
      return;
    }

    // Function to retry loading user data with exponential backoff
    const loadUserDataWithRetry = async (retryCount = 0) => {
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second
      
      try {
        // Use the fetchUserData function from AuthContext
        const success = await fetchUserData();
        if (!success && retryCount < maxRetries) {
          // Retry with exponential backoff
          const delay = baseDelay * Math.pow(2, retryCount);
          setTimeout(() => {
            loadUserDataWithRetry(retryCount + 1);
          }, delay);
        } else if (!success) {
          logger.warn("Failed to load user data after retries, marking as loaded to prevent infinite loading");
          setRoleDataLoaded(true);
        }
        // We don't need to set roleDataLoaded here as this effect will run again when user is updated
      } catch (err) {
        logger.error("Failed to refresh user data:", err);
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          setTimeout(() => {
            loadUserDataWithRetry(retryCount + 1);
          }, delay);
        } else {
          setRoleDataLoaded(true); // Prevent infinite loading
        }
      }
    };

    // Enhanced condition for OAuth scenarios
    // If we have an access token but no user data yet, try to refresh user data
    if (!user && !authLoading) {
      // Check if this might be an OAuth callback scenario
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthCallback = urlParams.has('oauth_success') || urlParams.has('token');
      
      if (isOAuthCallback) {
        // For OAuth callbacks, wait a bit longer before trying to fetch user data
        // as the auth context might still be processing the callback
        const oauthDelay = setTimeout(() => {
          loadUserDataWithRetry();
        }, 500);
        return () => clearTimeout(oauthDelay);
      } else {
        // For normal scenarios, try immediately
        loadUserDataWithRetry();
      }
      return;
    }

    if (user) {
      const initialData = {
        firstName: user.firstName || "", 
        lastName: user.lastName || "", 
        email: user.email || "",
        phone: (user.isPhoneVerified && user.phone) ? user.phone : user.phone || "",
        gender: user.gender || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
        bio: user.bio || "",
        headline: user.headline || "",
        address: typeof user.address === 'object' ? { ...user.address } : { country: '', city: '', street: user.address || '' },
        openToWork: user.openToWork || false, 
        about: user.about || "", 
        preferredContact: user.preferredContact || "",
        skills: user.skills || [],
        interests: user.interests?.map(i => (typeof i === 'string' ? i : i?.name || '')).filter(Boolean) || [],
        socialLinks: user.socialLinks || { facebook: "", twitter: "", linkedin: "", instagram: "", github: "", website: "" },
        profilePicture: user.profilePicture?.url || user.googleProfile?.profilePicture || "", 
        profileImage: null,
        companyName: user.companyName || "", 
        companyWebsite: user.companyWebsite || "",
        companyRole: user.companyRole || "", 
        industry: user.industry || "",
        roleDetails: {}, // Initialize empty, will be populated below
      };

      // Pre-populate with waitlist data if available
      if (user.waitlistData) {
        logger.info('Pre-populating profile with waitlist data:', user.waitlistData);
        // Waitlist data is already populated in the user object from magic link verification
        // Just ensure we handle any role-specific mappings
      }

      // Use centralized role mapping - waitlist roles are already mapped in backend
      let effectiveRole = user.role;
      // No need for manual mapping as backend handles this during user creation

      // Set initial role-specific defaults (important before fetching existing)
      if (effectiveRole && effectiveRole !== "user") {
        initialData.roleDetails[effectiveRole] = getInitialRoleDefaults(effectiveRole, initialData, user);
      }

      setFormData(initialData);
      setSkillTags(user.skills || []);
      setInterestTags(initialData.interests); // Use the processed interests
      setProfileImagePreview(user.profilePicture?.url || user.googleProfile?.profilePicture || null);

      // Fetch and merge existing role-specific data
      if (effectiveRole && effectiveRole !== "user" && user._id) {
        fetchRoleSpecificData(user._id, effectiveRole).then((roleData) => {
          if (roleData) {
            setFormData((prev) => ({
              ...prev,
              roleDetails: {
                ...prev.roleDetails, // Keep other roles if they somehow exist
                [effectiveRole]: { ...prev.roleDetails[effectiveRole], ...roleData }, // Merge fetched over defaults
              },
            }));
            logger.info(`Merged role details for ${effectiveRole}`);
          }
          setRoleDataLoaded(true);
        })
        .catch(err => {
          logger.error(`Error fetching role details: ${err.message}`);
          setRoleDataLoaded(true); // Still mark as loaded even if there's an error
        });
      } else {
        setRoleDataLoaded(true);
      }
    } else {
      // If no user, set roleDataLoaded to true to prevent infinite loading
      if (!authLoading) {
        setRoleDataLoaded(true);
      }
    }
  }, [user, authLoading]); // Removed fetchUserData to prevent unnecessary re-renders

  // Listen for auth token changes to re-check password status
  useEffect(() => {
    const handleTokenRefresh = (event) => {
      const { user: refreshedUser } = event.detail || {};
      
      // If this is a waitlist user, trigger password check
      if (refreshedUser?.registrationMethod === 'waitlist' || user?.registrationMethod === 'waitlist') {
        setTimeout(() => {
          setPasswordData(prev => ({ ...prev, isChecking: true }));
        }, 500);
      }
    };

    const handleWaitlistVerificationSuccess = (event) => {
      const { user: verifiedUser } = event.detail || {};
      
      if (verifiedUser?.registrationMethod === 'waitlist') {
        setTimeout(() => {
          setPasswordData(prev => ({ ...prev, isChecking: true }));
        }, 1000);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:token-refreshed', handleTokenRefresh);
      window.addEventListener('auth:waitlist-verification-success', handleWaitlistVerificationSuccess);
      
      return () => {
        window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
        window.removeEventListener('auth:waitlist-verification-success', handleWaitlistVerificationSuccess);
      };
    }
  }, [user?.registrationMethod, passwordData.isChecking]);

  // Check if waitlist user needs password setup
  useEffect(() => {
    const checkPasswordSetup = async () => {
      if (user?.registrationMethod === 'waitlist' && user?._id) {
        // Set checking state
        setPasswordData(prev => ({ ...prev, isChecking: true }));
        
        // Wait for access token to be available with retries
        let accessToken = localStorage.getItem('accessToken');
        let retryCount = 0;
        const maxRetries = 20;
        
        while (!accessToken && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          accessToken = localStorage.getItem('accessToken');
          
          // Also check for token in other sources
          if (!accessToken && typeof window !== 'undefined') {
            accessToken = sessionStorage.getItem('accessToken') || 
                         localStorage.getItem('token') ||
                         sessionStorage.getItem('token');
          }
          
          retryCount++;
        }
        
        if (!accessToken) {
          setPasswordData(prev => ({
            ...prev,
            needsPasswordSetup: true,
            hasPassword: false,
            passwordSet: false,
            isChecking: false
          }));
          return;
        }
        
        try {
          const result = await checkWaitlistUserPassword();
          
          if (result.success) {
            const hasPassword = result.hasPassword;
            const needsSetup = result.needsPasswordSetup;
            
            setPasswordData(prev => ({
              ...prev,
              needsPasswordSetup: needsSetup,
              hasPassword: hasPassword,
              passwordSet: hasPassword,
              isChecking: false
            }));
          } else {
            setPasswordData(prev => ({
              ...prev,
              needsPasswordSetup: true,
              hasPassword: false,
              passwordSet: false,
              isChecking: false
            }));
          }
        } catch (error) {
          setPasswordData(prev => ({
            ...prev,
            needsPasswordSetup: true,
            hasPassword: false,
            passwordSet: false,
            isChecking: false
          }));
          if (error.message !== 'Authentication required' && error.message !== 'No authentication token') {
            setApiError(error.message);
          }
        }
      } else {
        // Not a waitlist user, no password setup needed
        setPasswordData(prev => ({
          ...prev,
          needsPasswordSetup: false,
          hasPassword: true,
          passwordSet: true,
          isChecking: false
        }));
      }
    };

    if (user && !authLoading && user._id) {
      checkPasswordSetup();
    }
  }, [user, authLoading, checkWaitlistUserPassword]);

  // Initialize currentStep based on user needs - separate effect to avoid circular dependency
  useEffect(() => {
    // Only run this after password check is complete
    if (!passwordData.isChecking && user) {
      if (user?.registrationMethod === 'waitlist') {
        // For waitlist users, check if they need password setup
        if (passwordData.needsPasswordSetup === true && 
            passwordData.passwordSet === false && 
            passwordData.hasPassword === false) {
          // User needs password setup
          setCurrentStep(0);
        } else {
          // User doesn't need password setup (already has password)
          setCurrentStep(1);
        }
      } else {
        // Non-waitlist user, start with profile completion
        setCurrentStep(1);
      }
    }
  }, [user?.registrationMethod, passwordData.needsPasswordSetup, passwordData.passwordSet, passwordData.hasPassword, passwordData.isChecking]);

  // Helper for initial role defaults
  const getInitialRoleDefaults = (role, baseData, user) => {
    // Extract waitlist data if available
    const waitlistMeta = user?.meta || {};
    const companyOrProject = user?.companyName || "";
    
    switch (role) {
      case "startupOwner": 
        return { 
          companyName: companyOrProject || "", 
          industry: waitlistMeta.industry || "", 
          fundingStage: waitlistMeta.stage || "Pre-seed", 
          companySize: "1-10", 
          yearFounded: null, 
          website: "", 
          description: "", 
          location: { country: "", city: "" }, 
          teamSize: 1, 
          socialLinks: baseData.socialLinks 
        };
      case "investor": 
        return { 
          investorType: waitlistMeta.investorType || "Angel Investor", 
          investmentFocus: [], 
          investmentRange: { 
            min: 10000, 
            max: waitlistMeta.ticketSize === "$1k-10k" ? 10000 :
                 waitlistMeta.ticketSize === "$10k-100k" ? 100000 :
                 waitlistMeta.ticketSize === "$100k-1m" ? 1000000 : 50000, 
            currency: "USD" 
          }, 
          companyName: companyOrProject || "", 
          industry: waitlistMeta.industry || "", 
          previousInvestments: [], 
          location: { country: "", city: "" }, 
          website: "", 
          investmentCriteria: [], 
          preferredStages: [] 
        };
      case "agency": 
        return { 
          companyName: companyOrProject || "", 
          industry: waitlistMeta.industry || "", 
          services: waitlistMeta.services ? waitlistMeta.services.map(service => ({
            name: service,
            category: "General",
            description: "",
            expertise: "Advanced"
          })) : [], 
          companySize: "1-10", 
          yearFounded: null, 
          website: "", 
          description: "", 
          location: { country: "", city: "" }, 
          clientTypes: [], 
          portfolio: [], 
          socialLinks: baseData.socialLinks 
        };
      case "freelancer": 
        return { 
          skills: waitlistMeta.services || baseData.skills || [], 
          specializations: waitlistMeta.skills || [],
          experience: "Intermediate", 
          hourlyRate: { amount: 0, currency: "USD" }, 
          availability: "Flexible", 
          preferredJobTypes: ["Remote"], 
          education: [], 
          certifications: [], 
          languages: [] 
        };
      case "jobseeker": 
        return { 
          jobTitle: waitlistMeta.desiredPosition || "", 
          experience: "Mid-Level", 
          skills: waitlistMeta.services || baseData.skills || [], 
          education: [], 
          workExperience: [], 
          certifications: [], 
          languages: [], 
          preferredJobTypes: ["Full-time"], 
          preferredLocations: [], 
          expectedSalary: { amount: 0, currency: "USD", period: "Yearly" }, 
          resumeUrl: "" 
        };
      default: return {};
    }
  };


  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parts = name.split(".");



    setFormData((prev) => {
      let newState = { ...prev };
      let current = newState;

      for (let i = 0; i < parts.length - 1; i++) {
        // Ensure nested objects exist
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
           // If part is roleDetails, initialize with the user's role structure
           if (parts[i] === 'roleDetails' && user?.role && parts[i+1] === user.role) {
               current.roleDetails = { ...current.roleDetails, [user.role]: { ...current.roleDetails?.[user.role] } };
           } else {
               current[parts[i]] = {};
           }
        } else {
             // Clone nested object to avoid mutation
             current[parts[i]] = { ...current[parts[i]] };
        }
        current = current[parts[i]];
      }

      const finalValue = type === "checkbox" ? checked : type === "number" ? (value === "" ? null : Number(value)) : value;
      current[parts[parts.length - 1]] = finalValue;

      return newState;
    });

    // Clear specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };


  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error("Invalid image file type.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Image must be under 10MB.");
      return;
    }

    setImageLoading(true);
    try {
      const optimizedFile = await optimizeImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.8 });
      const localPreview = URL.createObjectURL(optimizedFile);
      setProfileImagePreview(localPreview); // Show local preview immediately

      // Set the optimized file in formData for submission
       setFormData((prev) => ({
        ...prev,
        profileImage: optimizedFile,
        profilePicture: {
          url: localPreview, // Use local preview URL initially
          publicId: undefined // Will be set after upload
        }
      }));

      // Optional: Attempt background upload if user exists, update URL on success
      if (user && user._id) {
        const uploadData = new FormData();
        uploadData.append("profileImage", optimizedFile);
        try {
            // Note: updateProfilePicture should ideally handle the API call
            // and return the URL, not modify auth context directly during this flow.
            // Assuming it returns { success: true, url: '...' } or similar
          const result = await updateProfilePicture(uploadData); // This might update context, be mindful
          if (result?.success) {
             // Use the URL from the result or from the profilePicture object
             const imageUrl = result.url || result.profilePicture?.url;
             const publicId = result.publicId || result.profilePicture?.publicId;
             if (imageUrl) {
               setFormData((prev) => ({
                 ...prev,
                 profilePicture: {
                   url: imageUrl,
                   publicId: publicId
                 }
               })); // Update with server URL
               setProfileImagePreview(imageUrl); // Update preview to server URL
               toast.success("Profile picture updated successfully.");
             } else {
               // Success but no URL returned (shouldn't happen)
               toast.success("Profile picture updated.");
             }
          } else {
            // Keep local preview if background upload fails but file is ready
             toast.success("Image ready for submission.");
          }
        } catch (uploadErr) {
          logger.error("Background profile picture upload failed:", uploadErr);
          toast.error("Couldn't save picture now, will save with profile.");
          // Keep local preview and file for final submission
        }
      } else {
          toast.success("Image ready for submission.");
      }

    } catch (err) {
      toast.error(`Image processing failed: ${err.message}`);
      logger.error("Image processing error:", err);
      setProfileImagePreview(formData.profilePicture || user?.profilePicture?.url || null); // Revert preview on error
       setFormData((prev) => ({ ...prev, profileImage: null })); // Clear the faulty image file
    } finally {
      setImageLoading(false);
       // Clear the file input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const handleTagInput = (e, type) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const inputVal = type === "skills" ? skillInput : interestInput;
    const newTag = inputVal.trim();
    if (!newTag) return;

    if (type === "skills") {
      if (!skillTags.includes(newTag)) {
        const updatedTags = [...skillTags, newTag];
        setSkillTags(updatedTags);
         // Update formData.skills AND roleDetails.skills if applicable
         setFormData(prev => ({
             ...prev,
             skills: updatedTags,
             ...( (prev.roleDetails?.freelancer || prev.roleDetails?.jobseeker) && user?.role && ['freelancer', 'jobseeker'].includes(user.role)
                ? { roleDetails: { ...prev.roleDetails, [user.role]: { ...prev.roleDetails[user.role], skills: updatedTags } } }
                : {} )
         }));
      }
      setSkillInput("");
    } else { // interests
      if (!interestTags.includes(newTag)) {
        const updatedTags = [...interestTags, newTag];
        setInterestTags(updatedTags);
        // Store interests as simple strings in review state, convert on submit
        // setFormData(prev => ({ ...prev, interests: updatedTags })); // Managed by interestTags state
      }
      setInterestInput("");
    }
  };

  const removeTag = (tagToRemove, type) => {
    if (type === "skills") {
      const updatedTags = skillTags.filter(tag => tag !== tagToRemove);
      setSkillTags(updatedTags);
       // Update formData.skills AND roleDetails.skills if applicable
         setFormData(prev => ({
             ...prev,
             skills: updatedTags,
             ...( (prev.roleDetails?.freelancer || prev.roleDetails?.jobseeker) && user?.role && ['freelancer', 'jobseeker'].includes(user.role)
                ? { roleDetails: { ...prev.roleDetails, [user.role]: { ...prev.roleDetails[user.role], skills: updatedTags } } }
                : {} )
         }));
    } else { // interests
      const updatedTags = interestTags.filter(tag => tag !== tagToRemove);
      setInterestTags(updatedTags);
      // setFormData(prev => ({ ...prev, interests: updatedTags })); // Managed by interestTags state
    }
  };

  const addPredefinedTag = (tagToAdd, type) => {
     if (type === "skills") {
      if (!skillTags.includes(tagToAdd)) {
        const updatedTags = [...skillTags, tagToAdd];
        setSkillTags(updatedTags);
         setFormData(prev => ({
             ...prev,
             skills: updatedTags,
              ...( (prev.roleDetails?.freelancer || prev.roleDetails?.jobseeker) && user?.role && ['freelancer', 'jobseeker'].includes(user.role)
                ? { roleDetails: { ...prev.roleDetails, [user.role]: { ...prev.roleDetails[user.role], skills: updatedTags } } }
                : {} )
         }));
      }
    } else { // interests
      if (!interestTags.includes(tagToAdd)) {
        const updatedTags = [...interestTags, tagToAdd];
        setInterestTags(updatedTags);
        // setFormData(prev => ({ ...prev, interests: updatedTags })); // Managed by interestTags state
      }
    }
  };

    // Handlers for RoleSpecificForm's MultiInput
    const handleMultiInputChange = (role, field, value) => {
        setMultiInputValues(prev => ({ ...prev, [`${role}_${field}`]: value }));
    };

    const addMultiInputTag = (e, role, field, directValue = null) => {
        if (e && e.key !== "Enter" && e.key !== ",") return;
        if (e) e.preventDefault();

        const key = `${role}_${field}`;
        const inputVal = directValue ?? multiInputValues[key];
        const newTag = inputVal?.trim();
        if (!newTag) return;

        setFormData(prev => {
            const currentTags = prev.roleDetails?.[role]?.[field] || [];
            if (!currentTags.includes(newTag)) {
                const updatedRoleDetails = {
                    ...prev.roleDetails,
                    [role]: {
                        ...prev.roleDetails?.[role],
                        [field]: [...currentTags, newTag]
                    }
                };
                return { ...prev, roleDetails: updatedRoleDetails };
            }
            return prev; // No change if tag exists
        });

        // Clear the specific input field
        setMultiInputValues(prev => ({ ...prev, [key]: '' }));

    };

    const removeMultiInputTag = (role, field, tagToRemove) => {
         setFormData(prev => {
            const currentTags = prev.roleDetails?.[role]?.[field] || [];
            const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
             const updatedRoleDetails = {
                 ...prev.roleDetails,
                 [role]: {
                     ...prev.roleDetails?.[role],
                     [field]: updatedTags
                 }
             };
             return { ...prev, roleDetails: updatedRoleDetails };
         });
    };


  // --- Validation ---
  const validateForm = () => {
    const errors = {};
    
    // Basic validation
    if (!formData.firstName?.trim()) errors.firstName = "First name required";
    if (!formData.lastName?.trim()) errors.lastName = "Last name required";
    // Skip email field validation if the email is already verified and therefore read-only
    if (!user?.isEmailVerified) {
      if (!formData.email?.trim()) {
        errors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Invalid email";
      }
    }
    // Phone number is now optional - only validate if provided
    if (formData.phone?.trim() && typeof formData.phone === 'string' && !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone.trim())) errors.phone = "Invalid phone number";

    // Role Specific Validation
    if (user?.role && user.role !== 'user' && formData.roleDetails?.[user.role]) {
        const roleData = formData.roleDetails[user.role];
        const roleKey = `roleDetails.${user.role}`;
        
        switch (user.role) {
            case "startupOwner":
                if (!roleData.companyName?.trim()) errors[`${roleKey}.companyName`] = "Company name required";
                if (!roleData.industry?.trim()) errors[`${roleKey}.industry`] = "Industry required";
                if (roleData.yearFounded && (roleData.yearFounded < 1900 || roleData.yearFounded > new Date().getFullYear())) {
                    errors[`${roleKey}.yearFounded`] = `Year must be between 1900 and ${new Date().getFullYear()}`;
                }
                break;
            case "investor":
                if (!roleData.investorType?.trim()) errors[`${roleKey}.investorType`] = "Investor type required";
                if (roleData.investmentRange?.min && roleData.investmentRange?.max && 
                    roleData.investmentRange.min > roleData.investmentRange.max) {
                    errors[`${roleKey}.investmentRange.min`] = "Min investment must be less than max";
                }
                break;
            case "agency":
                if (!roleData.companyName?.trim()) errors[`${roleKey}.companyName`] = "Agency name required";
                if (!roleData.services || roleData.services.length === 0) {
                    errors[`${roleKey}.services`] = "At least one service required";
                }
                break;
             case "freelancer":
                // Use skillTags directly as they reflect UI state, formData.skills might lag
                if (!skillTags || skillTags.length === 0) {
                    errors[`${roleKey}.skills`] = "At least one skill required";
                }
                if (!roleData.experience?.trim()) {
                    errors[`${roleKey}.experience`] = "Experience level required";
                }
                break;
             case "jobseeker":
                if (!roleData.jobTitle?.trim()) {
                    errors[`${roleKey}.jobTitle`] = "Desired job title required";
                }
                if (!skillTags || skillTags.length === 0) {
                    errors[`${roleKey}.skills`] = "At least one skill required";
                }
                break;
            default: break;
        }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submission ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setApiError(null); // Clear previous API errors
    if (clearError) clearError(); // Clear auth context errors


    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      // Find the first error and potentially scroll to it or focus it
      const firstErrorKey = Object.keys(formErrors)[0];
      if (firstErrorKey) {
          const element = document.getElementsByName(firstErrorKey)[0];
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element?.focus();
          // Determine which step the error is on
          // This logic needs refinement based on where fields are located
          // Example: if (firstErrorKey.startsWith('roleDetails')) setCurrentStep(5); else if ...
      }
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving your profile...");

    try {
        // Handle password setup for waitlist users if needed
        if (user?.registrationMethod === 'waitlist' && passwordData.needsPasswordSetup && !passwordData.passwordSet) {
          if (passwordData.password !== passwordData.confirmPassword) {
            setFormErrors({ password: "Passwords do not match" });
            setIsSubmitting(false);
            return;
          }

          if (passwordData.password.length < 8) {
            setFormErrors({ password: "Password must be at least 8 characters long" });
            setIsSubmitting(false);
            return;
          }

          // Set password first
          const passwordResult = await setWaitlistUserPassword(passwordData.password);
          if (passwordResult.success) {
            setPasswordData(prev => ({ ...prev, passwordSet: true }));
          } else {
            setFormErrors({ password: passwordResult.message });
            setIsSubmitting(false);
            return;
          }
        }

        // Prepare data for submission
        const cleanedSocialLinks = Object.fromEntries(
            Object.entries(formData.socialLinks || {}).filter(([, v]) => v && String(v).trim())
        );

        const addressObject = {
            country: formData.address?.country || "", city: formData.address?.city || "", street: formData.address?.street || "",
        };

        // Use skillTags and interestTags from state for submission accuracy
        const interestsFormatted = interestTags.map(tag => ({ name: tag, strength: 5 })); // Format interests correctly

        // Extract final role details, ensuring it's the object itself, not nested under role name
        let roleDetailsPayload = {};
         if (user?.role && user.role !== 'user' && formData.roleDetails?.[user.role]) {
             roleDetailsPayload = { ...formData.roleDetails[user.role] };
             // Ensure skills in roleDetails match the main skillTags if applicable
             if (['freelancer', 'jobseeker'].includes(user.role)) {
                 roleDetailsPayload.skills = skillTags;
             }
         }

        // Prepare user data payload, handling phone number properly
        const userDataPayload = {
            firstName: formData.firstName || "", 
            lastName: formData.lastName || "", 
            email: formData.email || "", 
            gender: formData.gender || "", 
            birthDate: formData.birthDate || null, // Send null if empty
            bio: formData.bio || "", 
            address: addressObject, 
            openToWork: formData.openToWork || false, 
            about: formData.about || "", // Ensure about field is always sent
            preferredContact: formData.preferredContact || "",
            skills: skillTags || [], // Use state variable
            interests: interestsFormatted || [], // Use formatted state variable
            socialLinks: cleanedSocialLinks || {},
            companyName: formData.companyName || "", 
            companyWebsite: formData.companyWebsite || "",
            companyRole: formData.companyRole || "", 
            industry: formData.industry || "",
            // Send roleDetails only if the user has a specific role and data exists
            ...(user?.role && user.role !== 'user' && Object.keys(roleDetailsPayload).length > 0 && { roleDetails: roleDetailsPayload }),
             // Include profilePicture as an object with url property if no new image is being uploaded
            ...(!formData.profileImage && formData.profilePicture && {
                profilePicture: {
                    url: formData.profilePicture,
                    publicId: formData.profilePicture.includes('cloudinary') ? formData.profilePicture.split('/').pop().split('.')[0] : undefined
                }
            }),
        };

        // If the email is already verified (read-only) or looks masked, omit it from the payload to avoid backend validation errors
        if (user?.isEmailVerified || (userDataPayload.email && /\*|•|\.\.\./.test(userDataPayload.email))) {
            delete userDataPayload.email;
        } else if (userDataPayload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDataPayload.email.trim())) {
            // Remove clearly invalid email formats as an extra safeguard
            delete userDataPayload.email;
        }

        // Only include phone if it has a value (to avoid null duplicate key errors)
        if (formData.phone?.trim()) {
            userDataPayload.phone = formData.phone.trim();
        }

        const submissionData = new FormData();
        submissionData.append("userData", JSON.stringify(userDataPayload));

        // Append image file ONLY if it's a File/Blob
        if (formData.profileImage instanceof File || formData.profileImage instanceof Blob) {
            submissionData.append("profileImage", formData.profileImage, `profile-${user._id || 'new'}.jpg`); // Provide a filename
        }

        // Log for debugging
        console.log("Submitting User Data:", userDataPayload);
        console.log("Submitting FormData Keys:", Array.from(submissionData.keys()));

        const result = await completeProfile(submissionData); // Call the context function

        if (result?.success) {
            toast.dismiss(loadingToast);
            toast.success("Profile completed successfully!");
            setShowConfetti(true);

            // Redirect after confetti
            setTimeout(() => {
                setShowConfetti(false);
                 router.push(`/user/${user.username}`); // Use dynamic route for navigation
            }, 2500); // Show confetti longer

        } else {
            const errorMessage = result?.message || authError || "Profile update failed. Please try again.";
            toast.dismiss(loadingToast);
            toast.error(errorMessage);
            setApiError(errorMessage); // Store API error for display
            logger.error("Profile completion failed:", errorMessage, result);
        }
    } catch (err) {
        logger.error("Submission error:", err);
        toast.dismiss(loadingToast);
        let errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
        
        // Handle specific backend validation errors with user-friendly messages
        if (errorMessage.includes("Cannot remove phone number without a verified email address")) {
            errorMessage = "Email address is required. Please ensure your email is provided and verified.";
        } else if (errorMessage.includes("duplicate key error") && errorMessage.includes("phone")) {
            errorMessage = "There was an issue with the phone number. Please try again or leave the phone field empty.";
        } else if (errorMessage.includes("E11000")) {
            errorMessage = "There was a database conflict. Please try again or contact support if the issue persists.";
        }
        
        toast.error(`Error: ${errorMessage}`);
        setApiError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Navigation ---
  const handleNext = () => {
    // Allow advancing while we have not yet reached the final step
    if (currentStep < totalSteps) {
      // For waitlist users, handle step adjustment
      if (user?.registrationMethod === 'waitlist' && 
          passwordData.needsPasswordSetup && 
          !passwordData.passwordSet) {
        // Adjust step for password setup
        const adjustedCurrentStep = currentStep === 0 ? 0 : currentStep - 1;
        
        // If we're at the last step before review and user doesn't have a specific role, skip to review
        if (adjustedCurrentStep === 3 && !user?.role) {
          setCurrentStep(4); // Skip to review step
        } else {
          setCurrentStep(currentStep + 1);
        }
      } else {
        // Normal flow for non-waitlist users or users with password
        if (currentStep === 3 && !user?.role) {
          setCurrentStep(4); // Skip to review step
        } else {
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Render Logic ---
  // hasAccessToken is now managed by state to prevent hydration mismatch

  // Show loading state while authentication is in progress or if we have a token but no user yet
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <LoadingSpinner 
          text="Loading authentication data..." 
          size="md" 
          color="violet" 
        />
      </div>
    );
  }

  // If timeout occurred or we still don't have user data, show error
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Authentication Error
        </h2>
        <p className="text-gray-700 mb-6">
          Could not load user data. You might need to log in again.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()} 
            className="px-6 py-2 border border-violet-600 text-violet-600 rounded-md hover:bg-violet-50 transition-colors mr-4"
          >
            Refresh Page
          </button>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading while role data is being fetched
  if (!roleDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <LoadingSpinner text="Loading profile data..." size="md" color="violet" showBackground fullScreen />
      </div>
    );
  }

  const renderStep = () => {
    // Show loading if still checking password status
    if (passwordData.isChecking) {
      return (
        <LoadingSpinner text="Loading profile data..." size="md" color="violet" showBackground fullScreen />
      );
    }

    // Password setup step for waitlist users (step 0) - only show if actually needed
    const shouldShowPasswordSetup = (
      user?.registrationMethod === 'waitlist' && 
      passwordData.needsPasswordSetup === true && 
      passwordData.passwordSet === false && 
      passwordData.hasPassword === false &&
      currentStep === 0 &&
      !passwordData.isChecking
    );
    
    if (shouldShowPasswordSetup) {
      return (
        <PasswordSetup
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          formErrors={formErrors}
          onSubmit={handlePasswordSetup}
          isSubmitting={isSubmitting}
          isActive={true}
          currentStep={0}
        />
      );
    }

    // Check if user has a specific role that requires role-specific step
    const hasSpecificRole = user?.role && ["startupOwner", "investor", "agency", "freelancer", "jobseeker"].includes(user.role);

    // Adjust step number for waitlist users who had password setup
    const adjustedStep = (user?.registrationMethod === 'waitlist' && 
                         passwordData.needsPasswordSetup && 
                         !passwordData.passwordSet && 
                         !passwordData.isChecking) 
      ? currentStep - 1 
      : currentStep;

    // Regular profile steps
    switch (adjustedStep) {
      case 1:
        return <ProfileBasicsForm 
          formData={formData} 
          handleChange={handleChange} 
          errors={formErrors} 
          user={user} 
          profileImagePreview={profileImagePreview} 
          imageLoading={imageLoading} 
          handleProfileImageChange={handleProfileImageChange} 
          fileInputRef={fileInputRef} 
          currentStep={currentStep} 
          isActive={true} 
        />;
      
      case 2:
        return <ProfileDetailsForm 
          isActive={true}
          formData={formData} 
          handleChange={handleChange}
          formErrors={formErrors}
          skillTags={skillTags}
          interestTags={interestTags}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          interestInput={interestInput}
          setInterestInput={setInterestInput}
          handleTagInput={handleTagInput}
          removeTag={removeTag}
          addPredefinedTag={addPredefinedTag}
          predefinedOptions={predefinedOptions}
          currentStep={currentStep}
        />;
      
      case 3:
        return <SocialLinksForm 
          isActive={true}
          formData={formData} 
          handleChange={handleChange}
          formErrors={formErrors}
          currentStep={currentStep}
        />;
      
      case 4:
        // Show role-specific form only if user has a specific role
        if (hasSpecificRole) {
          return <RoleSpecificForm 
            formData={formData} 
            setFormData={setFormData} 
            multiInputValues={multiInputValues}
            setMultiInputValues={setMultiInputValues}
            errors={formErrors} 
            userRole={user?.role}
          />;
        } else {
          // Skip to review if no specific role
          return <ProfileReview 
            isActive={true}
            formData={formData} 
            user={user}
            profileImagePreview={profileImagePreview}
            skillTags={skillTags}
            interestTags={interestTags}
          />;
        }
      
      case 5:
        // This will only be reached if user has a specific role
        return <ProfileReview 
          isActive={true}
          formData={formData} 
          user={user}
          profileImagePreview={profileImagePreview}
          skillTags={skillTags}
          interestTags={interestTags}
        />;
      
      default:
        return <ProfileBasicsForm 
          formData={formData} 
          handleChange={handleChange} 
          errors={formErrors} 
          user={user} 
          profileImagePreview={profileImagePreview} 
          imageLoading={imageLoading} 
          handleProfileImageChange={handleProfileImageChange} 
          fileInputRef={fileInputRef} 
          currentStep={currentStep} 
          isActive={true} 
        />;
    }
  };

  // Handle password setup separately
  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (passwordData.password !== passwordData.confirmPassword) {
        setFormErrors({ password: "Passwords do not match" });
        return;
      }

      if (passwordData.password.length < 8) {
        setFormErrors({ password: "Password must be at least 8 characters long" });
        return;
      }

      // Set password
      const passwordResult = await setWaitlistUserPassword(passwordData.password);
      if (passwordResult.success) {
        setPasswordData(prev => ({ ...prev, passwordSet: true }));
        // Move to next step (profile completion)
        setCurrentStep(1);
        toast.success("Password set successfully! Now let's complete your profile.");
      } else {
        setFormErrors({ password: passwordResult.message });
      }
    } catch (error) {
      console.error('Password setup error:', error);
      setFormErrors({ password: error.message || "Failed to set password" });
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <div className="min-h-screen bg-white py-12 pt-6 px-4 sm:px-6 lg:px-8">
      {showConfetti && <SuccessConfetti trigger={true} duration={5000} />}
      <div className="max-w-3xl mx-auto">
        {/* Header Logo/Brand */}
         <div className="flex justify-center mb-10">
          <motion.div className="flex items-center space-x-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
            <span className="text-lg font-medium text-violet-600">ProductBazar</span>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-lg overflow-hidden flex flex-col h-[80vh] max-h-[800px] border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Card Header */}
          <div className="border-b border-gray-200 flex-shrink-0 px-6 py-5 bg-gradient-to-r from-violet-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2
                  className="text-xl font-semibold text-gray-800 mb-1 flex items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="w-1.5 h-6 bg-violet-600 rounded-full mr-3"></span>
                  {passwordData.isChecking
                    ? 'Loading Account Information...'
                    : (user?.registrationMethod === 'waitlist' && 
                       passwordData.needsPasswordSetup && 
                       !passwordData.passwordSet && 
                       currentStep === 0)
                      ? 'Set Your Password'
                      : 'Complete Your Profile'
                  }
                </motion.h2>
                <motion.p
                  className="text-gray-600 text-sm ml-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {passwordData.isChecking
                    ? 'Please wait while we check your account status...'
                    : (user?.registrationMethod === 'waitlist' && 
                       passwordData.needsPasswordSetup && 
                       !passwordData.passwordSet && 
                       currentStep === 0)
                      ? `Step 1 of ${totalSteps}: Password Setup`
                      : `Step ${currentStep} of ${totalSteps}: ${getStepLabel(currentStep)}`
                  }
                </motion.p>
              </div>
            </div>
          </div>

          {/* Skip Profile Banner */}
          <div className="bg-violet-50 border-b border-violet-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-violet-800 font-medium">
                  {user?.registrationMethod === 'waitlist' && 
                   passwordData.needsPasswordSetup && 
                   !passwordData.passwordSet && 
                   currentStep === 0
                    ? 'Password setup is required for security'
                    : 'Profile completion is optional'
                  }
                </p>
                <p className="text-xs text-violet-600">
                  You can complete your profile later from settings
                </p>
              </div>
            </div>
            {user?.registrationMethod === 'waitlist' && 
             passwordData.needsPasswordSetup && 
             !passwordData.passwordSet && 
             currentStep === 0 ? (
              <motion.button
                onClick={() => {
                  toast.error("Password setup is required for security. Please set a password to continue.");
                }}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-200 rounded-md cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Required
              </motion.button>
            ) : (
              <motion.button
                onClick={() => {
                  skipProfileCompletion();
                  toast.success("You can complete your profile later from settings");
                  router.push(user.username ? `/user/${user.username}` : "/products");
                }}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Skip & Continue
              </motion.button>
            )}
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 md:p-8 overflow-y-auto flex-grow">
             <StepIndicator currentStep={currentStep} totalSteps={totalSteps} getStepLabel={getStepLabel} />

             <AnimatePresence mode="wait">
                {(authError || apiError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 shadow-sm"
                  >
                    <div className="flex items-start">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                       <div>
                         <h4 className="font-medium text-red-800 mb-1">Error</h4>
                         <p className="text-sm">{apiError || authError}</p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Render Active Step Component */}
            <div>
              {renderStep()}
            </div>
          </div>

          {/* Fixed Footer with Navigation */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0 bg-white">
             <motion.div
               className="text-xs text-gray-500 flex items-center"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.3, delay: 0.2 }}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {new Date().getFullYear()} © ProductBazar
            </motion.div>
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.3, delay: 0.3 }}
               className="flex items-center space-x-3"
             >
               {/* Skip button - more prominent position */}
               {user?.registrationMethod === 'waitlist' && 
                passwordData.needsPasswordSetup && 
                !passwordData.passwordSet && 
                currentStep === 0 ? (
                 <motion.button
                   onClick={() => {
                     toast.error("Password setup is required for security. Please set a password to continue.");
                   }}
                   className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                   Required
                 </motion.button>
               ) : (
                 <motion.button
                   onClick={() => {
                     skipProfileCompletion();
                     toast.success("You can complete your profile later from settings");
                     router.push(user.username ? `/user/${user.username}` : "/products");
                   }}
                   className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-violet-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   Skip for now
                 </motion.button>
               )}
               <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onBack={handleBack}
                  onNext={handleNext}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
               />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompleteProfileContainer;