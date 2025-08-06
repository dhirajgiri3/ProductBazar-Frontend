import { jwtDecode } from "jwt-decode";
import logger from "../logger";

// Token validation constants
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const MIN_TOKEN_LENGTH = 50; // Minimum valid token length

/**
 * Validate token format and structure
 * @param {string} token - The token to validate
 * @returns {boolean} True if token is valid
 */
const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  if (token.length < MIN_TOKEN_LENGTH) return false;
  
  // Check if it's a valid JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  return true;
};

/**
 * Check if token is about to expire (within threshold)
 * @param {string} token - The token to check
 * @returns {boolean} True if token needs refresh
 */
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() > expiryTime - TOKEN_REFRESH_THRESHOLD;
  } catch (error) {
    logger.error("Error checking token expiry", error);
    return true;
  }
};

/**
 * Get the current access token from sessionStorage (more secure than localStorage)
 * @returns {string|null} The access token or null if not found/invalid
 */
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  
  const token = sessionStorage.getItem("accessToken");
  
  if (!token) return null;
  
  // Validate token format
  if (!isValidTokenFormat(token)) {
    logger.warn("Invalid token format found in sessionStorage, removing");
    sessionStorage.removeItem("accessToken");
    return null;
  }
  
  // Check if token is expired
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      logger.info("Expired token found in sessionStorage, removing");
      sessionStorage.removeItem("accessToken");
      return null;
    }
    return token;
  } catch (error) {
    logger.error("Error decoding token from sessionStorage", error);
    sessionStorage.removeItem("accessToken");
    return null;
  }
};

/**
 * Set the access token in sessionStorage with validation
 * @param {string} token - The access token to store
 * @returns {boolean} True if token was successfully stored
 */
export const setAuthToken = (token) => {
  if (typeof window === "undefined") return false;
  
  // Validate token before storing
  if (!isValidTokenFormat(token)) {
    logger.error("Attempted to store invalid token format");
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      logger.warn("Attempted to store expired token");
      return false;
    }
    
    sessionStorage.setItem("accessToken", token);
    logger.debug("Access token stored successfully");
    return true;
  } catch (error) {
    logger.error("Error storing access token", error);
    return false;
  }
};

/**
 * Remove the access token from sessionStorage
 */
export const removeAuthToken = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  logger.debug("Access token removed from sessionStorage");
};

/**
 * Check if token needs refresh (expiring soon)
 * @returns {boolean} True if token should be refreshed
 */
export const shouldRefreshToken = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  return isTokenExpiringSoon(token);
};

/**
 * Store user data in localStorage (less sensitive than tokens)
 * @param {Object} user - The user object to store
 */
export const setUserData = (user) => {
  if (typeof window === "undefined" || !user) return;
  
  try {
    // Sanitize user data before storing (remove sensitive fields)
    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      secondaryRoles: user.secondaryRoles,
      roleCapabilities: user.roleCapabilities,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isProfileCompleted: user.isProfileCompleted,
      profilePicture: user.profilePicture,
      registrationMethod: user.registrationMethod,
      // Don't store sensitive fields like password, tokens, etc.
    };
    
    localStorage.setItem("user", JSON.stringify(sanitizedUser));
  } catch (error) {
    logger.error("Error storing user data", error);
  }
};

/**
 * Get the current user data from localStorage
 * @returns {Object|null} The user object or null if not found
 */
export const getUserData = () => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logger.error("Error parsing user data from localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
};

/**
 * Check if the access token is expired
 * @returns {boolean} True if token is expired or not found
 */
export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    logger.error("Error decoding token", error);
    return true;
  }
};

/**
 * Check if the current user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserData();
  return !!token && !!user && !isTokenExpired();
};

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user is an admin
 */
export const isAdmin = () => {
  const user = getUserData();
  return user?.role === "admin";
};

/**
 * Check if user's email is verified
 * @returns {boolean} True if email is verified
 */
export const isEmailVerified = () => {
  const user = getUserData();
  return user?.isEmailVerified === true;
};

/**
 * Check if user's phone is verified
 * @returns {boolean} True if phone is verified
 */
export const isPhoneVerified = () => {
  const user = getUserData();
  return user?.isPhoneVerified === true;
};

/**
 * Check if user's profile is completed
 * @returns {boolean} True if profile is completed
 */
export const isProfileCompleted = () => {
  const user = getUserData();
  return user?.isProfileCompleted === true;
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  // Clear sessionStorage (tokens)
  sessionStorage.removeItem("accessToken");
  
  // Clear localStorage (user data and other settings)
  localStorage.removeItem("user");
  localStorage.removeItem("nextStep");
  localStorage.removeItem("skippedSteps");
  
  // Clear any user-specific settings
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('recommendation_settings_') || 
        key.startsWith('user_') || 
        key.startsWith('auth_')) {
      localStorage.removeItem(key);
    }
  });
  
  logger.debug("All authentication data cleared");
};

/**
 * Get authentication next step data
 * @returns {Object|null} The next step object or null
 */
export const getNextStep = () => {
  if (typeof window === "undefined") return null;

  try {
    const nextStep = localStorage.getItem("nextStep");
    return nextStep ? JSON.parse(nextStep) : null;
  } catch (error) {
    logger.error("Error parsing nextStep data from localStorage", error);
    localStorage.removeItem("nextStep");
    return null;
  }
};

/**
 * Set authentication next step data
 * @param {Object} nextStep - The next step object
 */
export const setNextStep = (nextStep) => {
  if (typeof window === "undefined" || !nextStep) return;
  localStorage.setItem("nextStep", JSON.stringify(nextStep));
};

/**
 * Get authentication state for the current user
 * @returns {Object} Object containing various auth state flags
 */
export const getAuthState = () => {
  const user = getUserData();
  const token = getAuthToken();
  const isExpired = isTokenExpired();
  
  return {
    isAuthenticated: !!token && !!user && !isExpired,
    isEmailVerified: isEmailVerified(),
    isPhoneVerified: isPhoneVerified(),
    isProfileCompleted: isProfileCompleted(),
    isAdmin: isAdmin(),
    nextStep: getNextStep(),
    user,
    tokenExists: !!token,
    tokenExpired: isExpired,
    needsRefresh: shouldRefreshToken(),
  };
};

/**
 * Check if user needs verification (email or phone)
 * @returns {Object} Object with needsEmailVerification and needsPhoneVerification flags
 */
export const getVerificationNeeds = () => {
  const user = getUserData();
  return {
    needsEmailVerification: user?.email && !user?.isEmailVerified,
    needsPhoneVerification: user?.phone && !user?.isPhoneVerified,
  };
};

/**
 * Get appropriate redirect path based on current auth state
 * @param {string} defaultPath - Default path to redirect to if fully authenticated
 * @returns {string} The path to redirect to
 */
export const getAuthRedirectPath = (defaultPath = null) => {
  const user = getUserData();
  const { needsEmailVerification, needsPhoneVerification } =
    getVerificationNeeds();

  if (!user) return "/auth/login";
  if (!user.isProfileCompleted) return "/complete-profile";
  if (needsEmailVerification && needsPhoneVerification)
    return "/auth/verify-both";
  if (needsEmailVerification) return "/auth/verify-email";
  if (needsPhoneVerification) return "/auth/verify-phone";

  // If user has a username, redirect to their profile page
  if (user.username && !defaultPath) {
    return `/user/${user.username}`;
  }

  // If defaultPath is provided, use it, otherwise redirect to home
  return defaultPath || "/products";
};

/**
 * Parse token payload with validation
 * @param {string} token - The JWT token to parse
 * @returns {Object|null} Decoded token payload or null
 */
export const parseToken = (token) => {
  if (!token || !isValidTokenFormat(token)) return null;

  try {
    const decoded = jwtDecode(token);
    
    // Validate required fields
    if (!decoded.id || !decoded.exp) {
      logger.warn("Token missing required fields");
      return null;
    }
    
    return decoded;
  } catch (error) {
    logger.error("Error decoding token", error);
    return null;
  }
};

/**
 * Get token expiry time in milliseconds
 * @returns {number|null} Expiry time in milliseconds or null if no valid token
 */
export const getTokenExpiry = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    logger.error("Error getting token expiry", error);
    return null;
  }
};

/**
 * Get time until token expires in seconds
 * @returns {number|null} Seconds until expiry or null if no valid token
 */
export const getTimeUntilExpiry = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return null;
  
  const timeLeft = Math.floor((expiry - Date.now()) / 1000);
  return timeLeft > 0 ? timeLeft : 0;
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  shouldRefreshToken,
  getUserData,
  setUserData,
  removeUserData,
  isAuthenticated,
  isAdmin,
  isEmailVerified,
  isPhoneVerified,
  isProfileCompleted,
  clearAuthData,
  getNextStep,
  setNextStep,
  getAuthState,
  getVerificationNeeds,
  getAuthRedirectPath,
  parseToken,
  getTokenExpiry,
  getTimeUntilExpiry,
};
