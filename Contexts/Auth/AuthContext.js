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
import api from "../../Utils/api.js";
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        const storedNextStep = localStorage.getItem("nextStep");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedNextStep) {
          setNextStep(JSON.parse(storedNextStep));
        }
        
        if (storedToken) {
          setAccessToken(storedToken);
          await fetchUserData(storedToken);
        }
      } catch (err) {
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
  }, []);

  const fetchUserData = useCallback(
    async (token) => {
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token || accessToken}` },
        });

        if (response.data.status === "success") {
          setUser(response.data.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
          setAuthLoading(false);
          return true;
        }
        throw new Error(response.data.message || "Failed to fetch user data");
      } catch (err) {
        logger.error("Fetch user data failed:", err);
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

      setUser(data.data.user);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      if (data.data.accessToken) {
        setAccessToken(data.data.accessToken);
        localStorage.setItem("accessToken", data.data.accessToken);
      }

      if (data.nextStep) {
        setNextStep(data.nextStep);
        localStorage.setItem("nextStep", JSON.stringify(data.nextStep));
      } else {
        setNextStep(null);
        localStorage.removeItem("nextStep");
      }

      setAuthLoading(false);

      if (redirect) {
        if (data.nextStep?.type === "email_verification") {
          router.push("/auth/verify-email");
        } else if (data.nextStep?.type === "phone_verification") {
          router.push("/auth/verify-phone");
        } else if (data.nextStep?.type === "profile_completion") {
          router.push("/complete-profile");
        } else {
          router.push("/user");
        }
      }
    },
    [router]
  );

  // Auth event listeners
  useEffect(() => {
    const handleLogout = () => clearAuthStateAndRedirect();

    const handleVerificationRequired = (event) => {
      setNextStep(event.detail.nextStep);
      localStorage.setItem("nextStep", JSON.stringify(event.detail.nextStep));
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener(
      "auth:verification-required",
      handleVerificationRequired
    );

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener(
        "auth:verification-required",
        handleVerificationRequired
      );
    };
  }, [router]);

  // Utility functions
  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken("");
    setNextStep(null);
    setError("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("nextStep");
  }, []);

  const clearAuthStateAndRedirect = useCallback(() => {
    clearAuthState();
    router.push("/auth/login");
  }, [router, clearAuthState]);

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

        if (response.data.status === "success") {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || "Registration failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Registration failed";
        setError(errorMessage);
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

        if (response.data.status === "success") {
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
          return { success: false, message: errorMessage, rateLimited: true };
        } else if (err.response?.status === 403) {
          return { success: false, message: errorMessage, locked: true };
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
      const response = await api.post("/auth/logout");
      if (response.data.status === "success") {
        clearAuthState();
        router.push("/auth/login");
        return { success: true };
      }
      setError(response.data.message || "Logout failed");
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Logout failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
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
        let dataToSend;

        // Handle FormData object
        if (formData instanceof FormData) {
          // Ensure phone number is properly formatted before submission
          if (formData.has("userData")) {
            const userData = JSON.parse(formData.get("userData"));

            // If user registered with phone, ensure we use that phone number
            if (
              user &&
              user.isPhoneVerified &&
              user.phone &&
              (!userData.phone || userData.phone === "")
            ) {
              userData.phone = user.phone;
            }

            // Replace the form data with updated userData
            formData.set("userData", JSON.stringify(userData));
          }
          dataToSend = formData;
        }
        // Handle direct object submission
        else {
          // If user registered with phone, ensure we use that phone number
          if (
            user &&
            user.isPhoneVerified &&
            user.phone &&
            (!formData.phone || formData.phone === "")
          ) {
            formData.phone = user.phone;
          }

          // Create form data from object
          dataToSend = new FormData();
          dataToSend.append("userData", JSON.stringify(formData));

          // Handle file uploads if present
          if (
            formData.profilePicture &&
            formData.profilePicture instanceof File
          ) {
            dataToSend.append("profilePicture", formData.profilePicture);
          }
        }

        const response = await api.post("/auth/complete-profile", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status === "success") {
          handleAuthSuccess(
            {
              ...response.data,
              data: { ...response.data.data },
            },
            true
          );
          return { success: true, user: response.data.data.user };
        }

        setError(response.data.message || "Profile completion failed");
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Profile completion failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [user, handleAuthSuccess]
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
            return {
              success: true,
              user: response.data.data.user,
              nextStep: response.data.nextStep,
            };
          }

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

      if (response.data.success) {
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

      if (response.data.success || response.data.status === "success") {
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

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  const resetPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/reset-password", { email });

      if (response.data.status === "success") {
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
    refreshUserData: fetchUserData,
    isAuthenticated,
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
