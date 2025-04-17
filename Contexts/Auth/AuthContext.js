// src/context/AuthContext.jsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api, { makePriorityRequest } from "../../Utils/api.js";
import logger from "../../Utils/logger.js";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextStep, setNextStep] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();


  // Function to determine the next step based on user data
  const determineNextStep = useCallback((userData) => {
    if (!userData) {
      console.log('Cannot determine next step: No user data');
      return null;
    }

    console.log('Determining next step from user data:', userData);

    // Check if all required steps are already completed
    if (userData.isEmailVerified && userData.isPhoneVerified && userData.isProfileCompleted) {
      console.log('All steps are completed, no next step needed');
      return null;
    }

    // Check if steps were previously skipped
    const skippedSteps = JSON.parse(localStorage.getItem("skippedSteps") || "[]");

    // Define all possible steps
    const allSteps = [
      {
        type: "email_verification",
        title: "Verify your email address",
        description: "Verify your email for account security",
        required: true,
        completed: userData.isEmailVerified
      },
      {
        type: "phone_verification",
        title: "Verify your phone number",
        description: "Add an extra layer of security",
        required: true,
        completed: userData.isPhoneVerified
      },
      {
        type: "profile_completion",
        title: "Complete your profile",
        description: "Help others know more about you",
        required: false,
        skippable: true,
        completed: userData.isProfileCompleted
      }
    ];

    // Calculate progress
    const totalSteps = allSteps.length;
    const completedSteps = allSteps.filter(step => step.completed).length;
    const progress = {
      completed: completedSteps,
      total: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100)
    };

    // Find the next incomplete required step
    let nextStep = null;

    // First check for email verification
    if (userData.email && !userData.isEmailVerified) {
      nextStep = {
        type: "email_verification",
        title: "Verify your email address",
        description: "Verify your email for account security",
        message: "Required for account security",
        actionLabel: "Verify Now",
        required: true,
        allSteps,
        progress
      };
    }
    // Then check for phone verification
    else if (userData.phone && !userData.isPhoneVerified) {
      nextStep = {
        type: "phone_verification",
        title: "Verify your phone number",
        description: "Add an extra layer of security",
        message: "Required for account security",
        actionLabel: "Verify Now",
        required: true,
        allSteps,
        progress
      };
    }
    // Finally check for profile completion if not skipped
    else if (!userData.isProfileCompleted && !skippedSteps.includes("profile_completion")) {
      nextStep = {
        type: "profile_completion",
        title: "Complete your profile",
        description: "Help others know more about you",
        message: "(Optional) Enhance your experience",
        actionLabel: "Complete Now",
        required: false,
        skippable: true,
        allSteps,
        progress
      };
    }

    console.log('Determined next step:', nextStep);
    return nextStep;
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;

      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        console.log('Auth initialization started');

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Determine the next step based on user data
          const nextStepData = determineNextStep(userData);
          if (nextStepData) {
            console.log('Setting next step from user data during initialization:', nextStepData);
            setNextStep(nextStepData);
            localStorage.setItem("nextStep", JSON.stringify(nextStepData));
          } else {
            console.log('No next step needed during initialization');
            setNextStep(null);
            localStorage.removeItem("nextStep");
          }
        }

        if (storedToken) {
          setAccessToken(storedToken);
          await fetchUserData(storedToken);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        logger.error("Auth initialization failed:", err);
        clearAuthState();
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();
    return () => {
      mounted = false;
    };
  }, [determineNextStep]);

  const fetchUserData = useCallback(
    async (token) => {
      try {
        // Use makePriorityRequest to prevent this request from being canceled
        const response = await makePriorityRequest('get', '/auth/me', {
          headers: { Authorization: `Bearer ${token || accessToken}` },
        });

        if (response.data.status === "success") {
          // Ensure roleCapabilities is present
          const userData = response.data.data.user;
          if (!userData.roleCapabilities) {
            userData.roleCapabilities = {
              canUploadProducts: ['startupOwner', 'maker'].includes(userData.role),
              canInvest: userData.role === 'investor',
              canOfferServices: ['agency', 'freelancer'].includes(userData.role),
              canApplyToJobs: userData.role === 'jobseeker',
              canPostJobs: ['startupOwner', 'agency'].includes(userData.role),
              canShowcaseProjects: ['startupOwner', 'agency', 'freelancer', 'jobseeker'].includes(userData.role),
            };
          }

          // Ensure secondaryRoles is present
          if (!userData.secondaryRoles) {
            userData.secondaryRoles = [];
          }

          // Check if the user data has changed significantly
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const hasSignificantChanges = (
            userData.isEmailVerified !== currentUser.isEmailVerified ||
            userData.isPhoneVerified !== currentUser.isPhoneVerified ||
            userData.isProfileCompleted !== currentUser.isProfileCompleted
          );

          // Update user state and localStorage
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));

          // If there are significant changes or we need to update the next step
          if (hasSignificantChanges || !nextStep) {
            try {
              // Determine the next step based on user data
              const nextStepData = determineNextStep(userData);

              if (nextStepData) {
                // Update the next step
                setNextStep(nextStepData);
                localStorage.setItem("nextStep", JSON.stringify(nextStepData));
                console.log('Updated next step from user data:', nextStepData);
              } else {
                // Clear the next step if none is determined
                setNextStep(null);
                localStorage.removeItem("nextStep");
                console.log('No next step needed, cleared from localStorage');
              }
            } catch (nextStepErr) {
              console.error("Determine next step failed:", nextStepErr);
            }
          }

          setAuthLoading(false);
          return true;
        }
        throw new Error(response.data.message || "Failed to fetch user data");
      } catch (err) {
        // Don't log canceled errors as they're expected during navigation
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          logger.error("Fetch user data failed:", err);
        }

        if (err.response?.status === 401) {
          clearAuthState();
        }
        setAuthLoading(false);
        return false;
      }
    },
    [accessToken]
  );

  const handleAuthSuccess = useCallback(
    async (data, redirect = true) => {
      if (!data || !data.data) {
        logger.error("Invalid auth response data", data);
        setAuthLoading(false);
        return;
      }

      // Ensure roleCapabilities is present
      const userData = data.data.user;
      if (!userData.roleCapabilities) {
        userData.roleCapabilities = {
          canUploadProducts: ['startupOwner', 'maker'].includes(userData.role),
          canInvest: userData.role === 'investor',
          canOfferServices: ['agency', 'freelancer'].includes(userData.role),
          canApplyToJobs: userData.role === 'jobseeker',
          canPostJobs: ['startupOwner', 'agency'].includes(userData.role),
          canShowcaseProjects: ['startupOwner', 'agency', 'freelancer', 'jobseeker'].includes(userData.role),
        };
      }

      // Ensure secondaryRoles is present
      if (!userData.secondaryRoles) {
        userData.secondaryRoles = [];
      }

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Store user ID separately for easier access by other components
      if (userData._id) {
        localStorage.setItem("userId", userData._id);
      }

      if (data.data.accessToken) {
        setAccessToken(data.data.accessToken);
        localStorage.setItem("accessToken", data.data.accessToken);
      }

      // Determine the next step based on user data
      try {
        const nextStepData = determineNextStep(userData);

        if (nextStepData) {
          // Update the next step
          setNextStep(nextStepData);
          localStorage.setItem("nextStep", JSON.stringify(nextStepData));
          console.log('Set next step after auth success:', nextStepData);
        } else {
          // Clear the next step if none is determined
          setNextStep(null);
          localStorage.removeItem("nextStep");
          console.log('No next step needed after auth success');
        }
      } catch (nextStepErr) {
        console.error("Determine next step failed after auth success:", nextStepErr);
      }

      setAuthLoading(false);

      if (redirect) {
        // Get the current next step (which may have been modified above)
        const currentNextStep = nextStep || data.nextStep;

        if (currentNextStep?.type === "email_verification") {
          router.push("/auth/verify-email");
        } else if (currentNextStep?.type === "phone_verification") {
          router.push("/auth/verify-phone");
        } else if (currentNextStep?.type === "profile_completion") {
          // Check if profile completion was skipped
          const skippedSteps = JSON.parse(localStorage.getItem("skippedSteps") || "[]");
          if (skippedSteps.includes("profile_completion")) {
            // Skip to home page if profile completion was skipped
            router.push("/home");
          } else {
            // Ensure user data is fully loaded before redirecting to complete profile
            // This helps prevent the "Authentication Error" when redirecting to complete-profile
            setTimeout(() => {
              router.push("/complete-profile");
            }, 100); // Small delay to ensure state updates are processed
          }
        } else {
          router.push("/home");
        }
      }
    },
    [router, nextStep]
  );

  // Auth event listeners
  useEffect(() => {
    const handleLogout = () => clearAuthStateAndRedirect();

    const handleVerificationRequired = (event) => {
      setNextStep(event.detail.nextStep);
      localStorage.setItem("nextStep", JSON.stringify(event.detail.nextStep));
    };

    const handleProfileUpdated = () => {
      // Refresh user data when profile is updated
      fetchUserData(accessToken);
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener(
      "auth:verification-required",
      handleVerificationRequired
    );
    window.addEventListener("profile:updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener(
        "auth:verification-required",
        handleVerificationRequired
      );
      window.removeEventListener("profile:updated", handleProfileUpdated);
    };
  }, [router, fetchUserData, accessToken]);

  // Periodic refresh of user data
  useEffect(() => {
    // Only set up refresh if user is authenticated
    if (!user || !accessToken) return;

    // Refresh user data every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchUserData(accessToken);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user, accessToken, fetchUserData]);

  // Skip profile completion step with improved handling
  const skipProfileCompletion = useCallback(() => {
    if (nextStep?.type === "profile_completion") {
      // Mark this step as skipped in localStorage to prevent it from reappearing immediately
      const skippedSteps = JSON.parse(localStorage.getItem("skippedSteps") || "[]");
      if (!skippedSteps.includes("profile_completion")) {
        skippedSteps.push("profile_completion");
        localStorage.setItem("skippedSteps", JSON.stringify(skippedSteps));
      }

      // Determine the next step based on user data, excluding profile completion
      if (user) {
        // Check if there are other verification steps needed
        if (!user.isEmailVerified && user.email) {
          // Set email verification as the next step
          const emailStep = determineNextStep({
            ...user,
            isProfileCompleted: true // Pretend profile is completed to skip it
          });

          if (emailStep) {
            setNextStep(emailStep);
            localStorage.setItem("nextStep", JSON.stringify(emailStep));
            console.log('Skipped profile completion, showing email verification instead');
            return true;
          }
        } else if (!user.isPhoneVerified && user.phone) {
          // Set phone verification as the next step
          const phoneStep = determineNextStep({
            ...user,
            isProfileCompleted: true, // Pretend profile is completed to skip it
            isEmailVerified: true // Pretend email is verified to show phone step
          });

          if (phoneStep) {
            setNextStep(phoneStep);
            localStorage.setItem("nextStep", JSON.stringify(phoneStep));
            console.log('Skipped profile completion, showing phone verification instead');
            return true;
          }
        }
      }

      // If no other steps, clear the next step
      setNextStep(null);
      localStorage.removeItem("nextStep");
      console.log('Skipped profile completion, no other steps needed');
      return true;
    }
    return false;
  }, [nextStep, user, determineNextStep]);

  // Utility functions
  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken("");
    setNextStep(null);
    setError("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("nextStep");
    localStorage.removeItem("skippedSteps"); // Also clear skipped steps
  }, []);

  const clearAuthStateAndRedirect = useCallback(() => {
    clearAuthState();
    router.push("/auth/login");
  }, [router, clearAuthState]);


  // Function to manually refresh the next step
  const refreshNextStep = useCallback(() => {
    if (!user) {
      console.log('Cannot refresh next step: No user data');
      return null;
    }

    console.log('Refreshing next step using user data...');
    try {
      // Determine the next step based on user data
      const nextStepData = determineNextStep(user);

      if (nextStepData) {
        // Update the next step
        setNextStep(nextStepData);
        localStorage.setItem("nextStep", JSON.stringify(nextStepData));
        return nextStepData;
      } else {
        // Clear the next step if none is determined
        setNextStep(null);
        localStorage.removeItem("nextStep");
        return null;
      }
    } catch (err) {
      console.error("Refresh next step failed:", err);
      return null;
    }
  }, [user, determineNextStep]);

  // Auth methods
  const registerWithEmail = useCallback(
    async ({ email, password, role, roleDetails }) => {
      setAuthLoading(true);
      setError("");

      try {
        const response = await api.post("/auth/register/email", {
          email,
          password,
          role,
          roleDetails,
        });

        if (response.data.status === "success" || response.data.success) {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "Registration failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Registration failed";
        setError(errorMessage);

        // Enhanced error handling
        if (err.response?.status === 400) {
          return {
            success: false,
            message: errorMessage || "Invalid registration data. Please check your information and try again.",
            validationError: true
          };
        } else if (err.response?.status === 409) {
          return {
            success: false,
            message: errorMessage || "Email already registered. Please use a different email or try logging in.",
            alreadyExists: true
          };
        } else if (err.response?.status === 429) {
          return {
            success: false,
            message: "Too many registration attempts. Please try again later.",
            rateLimited: true
          };
        } else if (err.response?.status === 500) {
          return {
            success: false,
            message: "Server error. Please try again later or contact support if the problem persists.",
            serverError: true
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const loginWithEmail = useCallback(
    async ({ email, password }) => {
      setAuthLoading(true);
      setError("");

      try {
        const response = await api.post("/auth/login/email", {
          email,
          password,
        });

        if (response.data.status === "success" || response.data.success) {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "Login failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Login failed";
        setError(errorMessage);

        // Enhanced error handling
        if (err.response?.status === 429) {
          return {
            success: false,
            message: "Too many login attempts. Please try again later.",
            rateLimited: true
          };
        } else if (err.response?.status === 403) {
          return {
            success: false,
            message: "Your account is temporarily locked. Please try again later or reset your password.",
            locked: true
          };
        } else if (err.response?.status === 401) {
          return {
            success: false,
            message: "Invalid email or password. Please check your credentials and try again.",
            unauthorized: true
          };
        } else if (err.response?.status === 500) {
          return {
            success: false,
            message: "Server error. Please try again later or contact support if the problem persists.",
            serverError: true
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Register with phone
  const registerWithPhone = useCallback(async (phone, role, roleDetails) => {
    setAuthLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/register/request-otp", {
        phone,
        role,
        roleDetails: role === "user" ? undefined : roleDetails, // Only send roleDetails if not "user"
      });
      if (response.data.status === "success") {
        return { success: true };
      }
      setError(response.data.message || "Failed to send OTP");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      setError(errorMessage);
      if (err.response?.status === 429) {
        return {
          success: false,
          message: "Rate limit exceeded. Please wait 15 minutes.",
        };
      } else if (err.response?.status === 400) {
        return { success: false, message: errorMessage };
      }
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Verify OTP for registration (updated to include roleDetails)
  const verifyOtpForRegister = useCallback(
    async (phone, code, role, roleDetails) => {
      setAuthLoading(true);
      setError("");
      try {
        const response = await api.post("/auth/register/verify-otp", {
          phone,
          code,
          role,
          roleDetails: role === "user" ? undefined : roleDetails, // Only send roleDetails if not "user"
        });
        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }
        setError(response.data.message || "OTP verification failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "OTP verification failed";
        setError(errorMessage);
        if (err.response?.status === 429) {
          return {
            success: false,
            message: "Rate limit exceeded. Try again later.",
          };
        } else if (err.response?.status === 400) {
          return { success: false, message: errorMessage };
        }
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const loginWithPhone = useCallback(async (phone, code) => {
    setAuthLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login/phone", {
        phone,
        code,
      });

      if (response.data.status === "success") {
        handleAuthSuccess(response.data);
        return { success: true };
      }
      setError(response.data.message || "Phone login failed");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Phone login failed";
      setError(errorMessage);

      // Enhanced error handling
      if (err.response?.status === 429) {
        return { success: false, message: errorMessage, rateLimited: true };
      } else if (err.response?.status === 403) {
        return { success: false, message: errorMessage, locked: true };
      } else if (err.response?.status === 500) {
        return { success: false, message: "Internal server error" };
      } else if (err.response?.status === 404) {
        return { success: false, message: "Resource not found" };
      } else if (err.response?.status === 401) {
        return { success: false, message: "Unauthorized access" };
      } else if (err.response?.status === 408) {
        return { success: false, message: "Request timed out" };
      } else if (err.response?.status === 400) {
        return { success: false, message: "Bad request" };
      }
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  });

  // Verify OTP for login
  const verifyOtpForLogin = useCallback(
    async (phone, code) => {
      setAuthLoading(true);
      setError("");
      try {
        const response = await api.post("/auth/login/verify-otp", {
          phone,
          code,
        });
        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }
        setError(response.data.message || "OTP verification failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "OTP verification failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthLoading, setError]
  );

  // Logout function
  const logout = useCallback(async () => {
    setAuthLoading(true);
    setError("");

    try {
      // Make sure to include withCredentials to send cookies
      const response = await api.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        clearAuthState();
        router.push("/auth/login");
        return { success: true };
      }
      setError(response.data.message || "Logout failed");
      return { success: false, message: response.data.message };
    } catch (err) {
      // Even if the server request fails, clear local auth state
      // This ensures the user can still log out even if the server is unreachable
      clearAuthState();
      router.push("/auth/login");

      const errorMessage = err.response?.data?.message || "Logout failed";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        localLogoutSuccessful: true,
      };
    } finally {
      setAuthLoading(false);
    }
  }, [clearAuthState, router]);

  const requestOtp = useCallback(async (phone, type = "login") => {
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post(`/auth/${type}/request-otp`, { phone });

      if (response.data.status === "success") {
        setNextStep({ type: "phone_verification", phone });
        localStorage.setItem(
          "nextStep",
          JSON.stringify({ type: "phone_verification", phone })
        );
        return { success: true };
      }

      setError(response.data.message || "OTP request failed");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "OTP request failed";
      setError(errorMessage);

      // Handle rate limiting
      if (errorMessage.includes("Rate limit exceeded")) {
        // Extract time to reset if available
        const timeMatch = errorMessage.match(/(\d+) seconds/);
        const secondsToWait =
          timeMatch && timeMatch[1] ? parseInt(timeMatch[1]) : 900; // Default 15 minutes

        return {
          success: false,
          message: errorMessage,
          rateLimited: true,
          retryAfter: secondsToWait,
        };
      }

      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (phone, code, type = "login", role, roleDetails) => {
      setAuthLoading(true);
      setError("");

      try {
        const payload = { phone, code };

        // Add role and roleDetails for registration
        if (type === "register") {
          if (role) payload.role = role;
          if (roleDetails) payload.roleDetails = roleDetails;
        }

        const response = await api.post(`/auth/${type}/verify-otp`, payload);

        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "OTP verification failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "OTP verification failed";
        setError(errorMessage);

        // Handle OTP-specific error cases
        if (errorMessage.includes("expired")) {
          return {
            success: false,
            message: errorMessage,
            expired: true,
          };
        } else if (errorMessage.includes("Invalid OTP")) {
          return {
            success: false,
            message: errorMessage,
            invalid: true,
          };
        } else if (errorMessage.includes("Maximum verification attempts")) {
          return {
            success: false,
            message: errorMessage,
            maxAttempts: true,
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const sendPhoneVerificationOtp = useCallback(
    async (phone) => {
      setAuthLoading(true);
      setError("");

      try {
        const response = await api.post("/auth/send-otp", { phone });

        // Check if the phone is already verified
        if (
          response.data.status === "success" &&
          response.data.data?.isVerified
        ) {
          // Update user data if needed
          if (user && !user.isPhoneVerified) {
            setUser((prev) => ({
              ...prev,
              isPhoneVerified: true,
              phone: phone,
            }));

            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...storedUser,
                isPhoneVerified: true,
                phone: phone,
              })
            );
          }

          // Remove phone verification from next steps if it exists
          if (nextStep && nextStep.type === "phone_verification") {
            setNextStep(null);
            localStorage.removeItem("nextStep");
          }

          return { success: true, isVerified: true };
        }

        return {
          success: response.data.status === "success",
          message: response.data.message,
          otpSent: true,
        };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send OTP";
        setError(errorMessage);

        // Handle rate limiting
        if (errorMessage.includes("Rate limit exceeded")) {
          const timeMatch = errorMessage.match(/(\d+) seconds/);
          const secondsToWait =
            timeMatch && timeMatch[1] ? parseInt(timeMatch[1]) : 900;

          return {
            success: false,
            message: errorMessage,
            rateLimited: true,
            retryAfter: secondsToWait,
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [user, nextStep]
  );

  const verifyPhoneOtp = useCallback(
    async (phone, code) => {
      setAuthLoading(true);
      setError("");

      try {
        const response = await api.post("/auth/verify-otp", { phone, code });

        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "Failed to verify OTP");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to verify OTP";
        setError(errorMessage);

        // Handle OTP-specific error cases
        if (errorMessage.includes("expired")) {
          return {
            success: false,
            message: errorMessage,
            expired: true,
          };
        } else if (errorMessage.includes("Invalid OTP")) {
          return {
            success: false,
            message: errorMessage,
            invalid: true,
          };
        } else if (errorMessage.includes("Maximum verification attempts")) {
          return {
            success: false,
            message: errorMessage,
            maxAttempts: true,
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const resendEmailVerification = useCallback(async (email) => {
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/send-email-verification", {
        email,
      });

      if (response.data.status === "success") {
        return {
          success: true,
          message: "Verification email sent successfully",
        };
      }

      setError(response.data.message || "Failed to resend verification email");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to resend verification email";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async (token) => {
      setAuthLoading(true);
      setError("");

      try {
        const response = await api.get(`/auth/verify-email/${token}`);

        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "Failed to verify email");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          (err.name === "TokenExpiredError"
            ? "Verification link has expired"
            : err.name === "JsonWebTokenError"
            ? "Invalid verification link"
            : "Failed to verify email");

        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          expired: err.name === "TokenExpiredError",
          invalid: err.name === "JsonWebTokenError",
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const completeProfile = useCallback(
    async (formData) => {
      setAuthLoading(true);
      setError("");

      try {
        logger.info('Processing profile completion request');

        // Ensure we're working with FormData
        let dataToSend;
        if (formData instanceof FormData) {
          dataToSend = formData;
        } else {
          // Convert object to FormData
          dataToSend = new FormData();
          dataToSend.append("userData", JSON.stringify(formData));

          // Handle file upload for profilePicture if it exists
          if (formData.profilePicture && formData.profilePicture instanceof File) {
            dataToSend.append("profileImage", formData.profilePicture);
            logger.debug('Added profile picture to form data');
          }
        }

        // Basic validation
        try {
          const userData = dataToSend.get("userData");
          const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;

          // Check for required fields
          const requiredFields = ['firstName', 'lastName'];
          const missingFields = requiredFields.filter(field => !parsedUserData[field]);

          if (missingFields.length > 0) {
            logger.warn(`Missing required fields: ${missingFields.join(', ')}`);
            setError(`Please provide the following required fields: ${missingFields.join(', ')}`);
            return { success: false, message: `Missing required fields: ${missingFields.join(', ')}` };
          }

          // Ensure at least one contact method is provided
          if (!parsedUserData.email && !parsedUserData.phone) {
            logger.warn('No contact method provided');
            setError('Please provide at least one contact method (email or phone)');
            return { success: false, message: 'Please provide at least one contact method (email or phone)' };
          }
        } catch (e) {
          logger.error('Error validating user data:', e);
        }

        logger.info('Submitting profile completion request to API');
        const response = await api.post("/auth/complete-profile", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status === "success") {
          logger.info('Profile completion successful:', response.data);

          // Update user state with the new data but don't redirect
          handleAuthSuccess(
            {
              ...response.data,
              data: { ...response.data.data },
            },
            false // Don't redirect - let the component handle it after confetti
          );

          // Dispatch a profile:updated event to notify other components
          window.dispatchEvent(new CustomEvent('profile:updated', {
            detail: { user: response.data.data.user }
          }));

          return { success: true, user: response.data.data.user };
        }

        logger.error('Profile completion failed:', response.data.message);
        setError(response.data.message || "Profile completion failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        logger.error('Exception in completeProfile:', err);

        // Enhanced error handling
        let errorMessage = "Profile completion failed";
        let errorCode = null;

        if (err.response) {
          errorMessage = err.response.data?.message || errorMessage;
          errorCode = err.response.status;

          // Handle specific error codes
          if (errorCode === 400) {
            errorMessage = err.response.data?.message || "Invalid profile data";
          } else if (errorCode === 401) {
            errorMessage = "Authentication required. Please log in again.";
            clearAuthState();
          } else if (errorCode === 413) {
            errorMessage = "Profile image too large. Please use a smaller image.";
          } else if (errorCode === 429) {
            errorMessage = "Too many requests. Please try again later.";
          } else if (errorCode >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        }

        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          code: errorCode
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [user, handleAuthSuccess, clearAuthState, setAuthLoading, setError]
  );

  const updateProfile = useCallback(
    async (userData) => {
      setAuthLoading(true);
      setError("");

      try {
        // Ensure we're sending a proper object, not FormData for this endpoint
        const dataToSend =
          userData instanceof FormData
            ? JSON.parse(userData.get("userData") || "{}")
            : userData;

        const response = await api.put("/auth/profile", dataToSend);

        if (response.data.status === "success") {
          handleAuthSuccess(
            {
              ...response.data,
              data: {
                ...response.data.data,
                // Ensure we properly update the user in state
                user: response.data.data.user,
              },
            },
            false
          );

          // Check if a next step is returned (e.g. phone verification needed)
          if (response.data.nextStep) {
            setNextStep(response.data.nextStep);
            localStorage.setItem(
              "nextStep",
              JSON.stringify(response.data.nextStep)
            );

            // Dispatch a profile:updated event to notify other components
            window.dispatchEvent(new CustomEvent('profile:updated', {
              detail: { user: response.data.data.user }
            }));

            return {
              success: true,
              user: response.data.data.user,
              nextStep: response.data.nextStep,
            };
          }

          // Dispatch a profile:updated event to notify other components
          window.dispatchEvent(new CustomEvent('profile:updated', {
            detail: { user: response.data.data.user }
          }));

          return { success: true, user: response.data.data.user };
        }

        setError(response.data.message || "Profile update failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Profile update failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const updateProfilePicture = useCallback(async (fileData) => {
    setAuthLoading(true);
    setError("");

    try {
      const formData = new FormData();

      if (fileData instanceof File) {
        formData.append("profileImage", fileData);
      } else if (fileData instanceof FormData) {
        formData.append("profileImage", fileData.get("profileImage"));
      } else {
        return { success: false, message: "Please provide a valid image file" };
      }

      const response = await api.post("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for both success formats (status === "success" or success === true)
      if (response.data.status === "success" || response.data.success) {
        // Update the local user data with the new profile picture
        setUser((prev) => ({
          ...prev,
          profilePicture: response.data.data.user.profilePicture,
        }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            profilePicture: response.data.data.user.profilePicture,
          })
        );

        return {
          success: true,
          message: "Profile picture updated successfully",
          profilePicture: response.data.data.user.profilePicture,
          url: response.data.data.user.profilePicture?.url, // Add url property for easier access
        };
      }

      setError(response.data.message || "Failed to update profile picture");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile picture";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateBannerImage = useCallback(async (fileData) => {
    setAuthLoading(true);
    setError("");

    try {
      const formData = new FormData();

      if (fileData instanceof File) {
        formData.append("bannerImage", fileData);
      } else if (fileData instanceof FormData) {
        formData.append("bannerImage", fileData.get("bannerImage"));
      } else {
        return { success: false, message: "Please provide a valid image file" };
      }

      const response = await api.post("/auth/update-banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for both success formats (status === "success" or success === true)
      if (response.data.status === "success" || response.data.success) {
        // Update the local user data with the new banner image
        setUser((prev) => ({
          ...prev,
          bannerImage: response.data.data.user.bannerImage,
        }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            bannerImage: response.data.data.user.bannerImage,
          })
        );

        return {
          success: true,
          message: "Banner image updated successfully",
          bannerImage: response.data.data.user.bannerImage,
          url: response.data.data.user.bannerImage?.url, // Add url property for easier access
        };
      }

      setError(response.data.message || "Failed to update banner image");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update banner image";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.status === "success") {
        setUser(response.data.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        return response.data.data.user;
      }
      return null;
    } catch (err) {
      logger.error("Failed to get current user:", err);
      return null;
    }
  }, []);

  // Check if the user's profile is completed
  const isProfileCompleted = useCallback(() => {
    if (!user) return false;

    // Check if the isProfileCompleted flag is set
    if (user.isProfileCompleted === true) return true;

    // If not, check required fields manually
    const requiredFields = ["firstName", "lastName", "email", "phone", "about"];
    const missingFields = requiredFields.filter(field => !user[field]);

    // Allow either email or phone to be missing, but not both
    if (missingFields.includes("email") && missingFields.includes("phone")) {
      return false;
    }

    // Remove email and phone from missing fields for the final check
    const criticalMissingFields = missingFields.filter(field => field !== "email" && field !== "phone");

    return criticalMissingFields.length === 0;
  }, [user]);

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  const resetPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/reset-password", { email });

      if (response.data.status === "success" || response.data.success) {
        return { success: true };
      }

      setError(response.data.message || "Password reset failed");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Password reset failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = {
    user,
    accessToken,
    authLoading,
    error,
    nextStep,
    isInitialized,
    setError,
    clearError: () => setError(""),
    clearAuthState,
    clearAuthStateAndRedirect,
    updateProfile,
    updateProfilePicture,
    updateBannerImage,
    getCurrentUser,
    registerWithEmail,
    loginWithEmail,
    registerWithPhone,
    verifyOtpForRegister,
    loginWithPhone,
    verifyOtpForLogin,
    logout,
    requestOtp,
    verifyOtp,
    sendPhoneVerificationOtp,
    verifyPhoneOtp,
    resendEmailVerification,
    verifyEmail,
    completeProfile,
    skipProfileCompletion,
    refreshUserData: fetchUserData,
    refreshNextStep,
    isAuthenticated,
    isProfileCompleted,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
