// src/context/AuthContext.jsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { makePriorityRequest } from '../api/api.js';
import logger from '../utils/logger.js';
import { oauthHandler } from '../utils/oauth.js';
import { runAllCleanup } from '../utils/cleanup-utils.js';
import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  setUserData, 
  getUserData, 
  removeUserData, 
  clearAuthData,
  shouldRefreshToken,
  getAuthState
} from '../utils/auth/auth-utils.js';
import { initializeAuthMigration } from '../utils/auth/auth-migration.js';

const AuthContext = createContext({});

// Default role capabilities based on user role
const getRoleCapabilities = (role, secondaryRoles = []) => ({
  canUploadProducts:
    ['startupOwner'].includes(role) ||
    secondaryRoles.some(r => ['startupOwner'].includes(r)),
  canInvest: role === 'investor' || secondaryRoles.includes('investor'),
  canOfferServices:
    ['agency', 'freelancer'].includes(role) ||
    secondaryRoles.some(r => ['agency', 'freelancer'].includes(r)),
  canApplyToJobs: role === 'jobseeker' || secondaryRoles.includes('jobseeker'),
  canPostJobs:
    ['startupOwner', 'agency'].includes(role) ||
    secondaryRoles.some(r => ['startupOwner', 'agency'].includes(r)),
  canShowcaseProjects:
    ['startupOwner', 'agency', 'freelancer', 'jobseeker'].includes(role) ||
    secondaryRoles.some(r => ['startupOwner', 'agency', 'freelancer', 'jobseeker'].includes(r)),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextStep, setNextStep] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Cache the previous values to compare and prevent unnecessary updates
  const userRef = React.useRef(user);
  const nextStepRef = React.useRef(nextStep);
  
  // Update refs when state changes
  React.useEffect(() => {
    userRef.current = user;
  }, [user]);
  
  React.useEffect(() => {
    nextStepRef.current = nextStep;
  }, [nextStep]);

  // Function to determine the next step based on user data
  const determineNextStep = useCallback(userData => {
    if (!userData || typeof userData !== 'object') return null;

    const {
      isEmailVerified = false,
      isPhoneVerified = false,
      isProfileCompleted = false,
    } = userData;

    if (isEmailVerified && isPhoneVerified && isProfileCompleted) return null;

    const skippedSteps = JSON.parse(localStorage.getItem('skippedSteps') || '[]');
    const allSteps = [
      {
        type: 'email_verification',
        title: 'Verify your email address',
        description: 'Verify your email for account security',
        required: true,
        completed: isEmailVerified,
      },
      {
        type: 'phone_verification',
        title: 'Verify your phone number',
        description: 'Add an extra layer of security',
        required: true,
        completed: isPhoneVerified,
      },
      {
        type: 'profile_completion',
        title: 'Complete your profile',
        description: 'Help others know more about you',
        required: false,
        skippable: true,
        completed: isProfileCompleted,
      },
    ];

    const progress = {
      completed: allSteps.filter(step => step.completed).length,
      total: allSteps.length,
      percentage: Math.round(
        (allSteps.filter(step => step.completed).length / allSteps.length) * 100
      ),
    };

    // Return the first incomplete required step
    if (userData.email && !isEmailVerified) {
      return {
        type: 'email_verification',
        title: 'Verify your email address',
        description: 'Verify your email for account security',
        required: true,
        completed: false,
        progress,
      };
    }

    if (userData.phone && !isPhoneVerified) {
      return {
        type: 'phone_verification',
        title: 'Verify your phone number',
        description: 'Add an extra layer of security',
        required: true,
        completed: false,
        progress,
      };
    }

    if (!isProfileCompleted) {
      return {
        type: 'profile_completion',
        title: 'Complete your profile',
        description: 'Help others know more about you',
        required: false,
        skippable: true,
        completed: false,
        progress,
      };
    }

    return null;
  }, []);

  // Enhanced user data handler with better validation
  const handleUserData = useCallback(
    userData => {
      if (!userData || typeof userData !== 'object') {
        logger.warn('Invalid user data provided to handleUserData');
        return false;
      }

      // Check for significant changes to prevent unnecessary updates
      const hasSignificantChanges = !userRef.current || 
        userRef.current._id !== userData._id ||
        userRef.current.isEmailVerified !== userData.isEmailVerified ||
        userRef.current.isPhoneVerified !== userData.isPhoneVerified ||
        userRef.current.isProfileCompleted !== userData.isProfileCompleted ||
        userRef.current.role !== userData.role ||
        userRef.current.username !== userData.username;

      if (hasSignificantChanges) {
        const userWithCapabilities = {
          ...userData,
          roleCapabilities: getRoleCapabilities(
            userData.role,
            userData.secondaryRoles
          ),
        };
        setUser(userWithCapabilities);
        setUserData(userWithCapabilities); // Store in localStorage using new utility
        
        // Only recalculate nextStep if there are significant changes or no current nextStep
        if (hasSignificantChanges || !nextStep) {
          const nextStepData = determineNextStep(userData);
          
          // Only update nextStep state if it's different from current nextStep
          if (JSON.stringify(nextStepData) !== JSON.stringify(nextStep)) {
            setNextStep(nextStepData);
            nextStepData
              ? localStorage.setItem('nextStep', JSON.stringify(nextStepData))
              : localStorage.removeItem('nextStep');
          }
        }
        return true;
      }
      return false;
    },
    [determineNextStep, nextStep, user]
  );

  // Define the clearAuthState function first since it's used in fetchUserData
  const clearAuthState = useCallback(() => {
    try {
      // Clear state immediately
      setUser(null);
      setAccessToken('');
      setNextStep(null);
      setError('');
      setAuthLoading(false); // Also reset loading state
      
      // Clear all auth data using the new utility
      clearAuthData();
      
    } catch (error) {
      logger.error('Error clearing auth state:', error);
    }
  }, []);

  // Add a ref to track the API call status and prevent duplicate calls
  const fetchingUserDataRef = React.useRef(false);
  const lastFetchTimeRef = React.useRef(0);

  // Clear error function
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Forgot Password function
  const forgotPassword = useCallback(async (email) => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.status === 'success' || response.data.success) {
        return { 
          success: true, 
          message: response.data.message || 'If your email is registered, you will receive password reset instructions shortly.',
          isSecurityResponse: true // Flag to indicate this is a security-focused response
        };
      }

      const errorMessage = response.data.message || 'Failed to send password reset link';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      logger.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send password reset link';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Reset Password function
  const resetPassword = useCallback(async (newPassword, token) => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        password: newPassword,
        token: token
      });

      if (response.data.status === 'success' || response.data.success) {
        return { 
          success: true, 
          message: 'Password reset successfully. You can now login with your new password.' 
        };
      }

      const errorMessage = response.data.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      logger.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Verify Password Reset Token function
  const verifyPasswordResetToken = useCallback(async (token) => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-password-token', { token });

      if (response.data.status === 'success' || response.data.success) {
        return { success: true, valid: true };
      }

      const errorMessage = response.data.message || 'Invalid or expired reset token';
      setError(errorMessage);
      return { success: false, valid: false, message: errorMessage };
    } catch (err) {
      logger.error('Verify password reset token error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid or expired reset token';
      setError(errorMessage);
      return { success: false, valid: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Change Password function (for authenticated users)
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await makePriorityRequest('/auth/change-password', {
        method: 'PUT',
        data: {
          currentPassword,
          newPassword
        }
      });

      if (response.data.status === 'success' || response.data.success) {
        return { 
          success: true, 
          message: 'Password changed successfully.' 
        };
      }

      const errorMessage = response.data.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      logger.error('Change password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Delete Account function (for authenticated users)
  const deleteAccount = useCallback(async () => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await makePriorityRequest('/auth/delete-my-account', {
        method: 'DELETE'
      });

      if (response.data.status === 'success' || response.data.success) {
        // Clear auth state immediately after successful deletion
        clearAuthState();
        
        return { 
          success: true, 
          message: 'Your account has been permanently deleted.' 
        };
      }

      const errorMessage = response.data.message || 'Failed to delete account';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      logger.error('Delete account error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete account';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, [clearAuthState]);

  // Enhanced fetch user data with better error handling
  const fetchUserData = useCallback(
    async token => {
      // Skip if we're already fetching or if the last fetch was less than 1 second ago
      const now = Date.now();
      if (fetchingUserDataRef.current || (now - lastFetchTimeRef.current < 1000)) {
        return false;
      }

      fetchingUserDataRef.current = true;
      lastFetchTimeRef.current = now;

      try {
        const response = await makePriorityRequest('get', '/auth/me', {
          headers: { Authorization: `Bearer ${token || accessToken}` },
          // Use the cache mechanism we implemented
          useCache: false, // Always fetch fresh user data
          params: { _t: now }
        });

        if (response.data.status === 'success') {
          const userData = response.data.data?.user || response.data.data;
          if (!userData) throw new Error('User data is missing from the response');

          const processed = handleUserData(userData);
          if (processed) {
            // Force re-render by updating a timestamp
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:user-refreshed', { 
                detail: { user: userData, timestamp: now } 
              }));
            }
          }
          return processed;
        }
        throw new Error(response.data.message || 'Failed to fetch user data');
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          logger.error('Fetch user data failed:', err);
          if (err.response?.status === 401) {
            clearAuthState();
          }
        }
        return false;
      } finally {
        fetchingUserDataRef.current = false;
      }
    },
    [accessToken, handleUserData, clearAuthState]
  );

  // Define handleAuthSuccess to process successful authentication
  const handleAuthSuccess = useCallback(
    async data => {
      const token = data.data?.accessToken || data.token;
      const userData = data.data?.user || data.user || data.data;

      if (token) {
        // Store token using the new auth utilities
        const tokenStored = setAuthToken(token);
        if (tokenStored) {
          setAccessToken(token);
          
          // Dispatch event for token refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token-refreshed', { 
              detail: { accessToken: token, user: userData } 
            }));
          }
        } else {
          logger.error('Failed to store access token');
          throw new Error('Failed to store authentication token');
        }
      }

      if (userData) {
        // Process user data immediately
        handleUserData(userData);
      }

      // Always fetch fresh user data after successful auth to ensure we have the latest
      if (token) {
        try {
          await fetchUserData(token);
        } catch (error) {
          logger.error('Failed to fetch fresh user data after auth:', error);
          // Don't throw - we still have the userData from login response
        }
      }
    },
    [handleUserData, fetchUserData]
  );

  // Create a promise for initialization to prevent multiple parallel initializations
  const initPromiseRef = React.useRef(null);
  
  // OAuth callback handler using the new utility
  const handleOAuthCallback = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    // Check if this is an OAuth callback
    if (!oauthHandler.isOAuthCallback()) {
      return false;
    }

    logger.info('Processing OAuth callback');
    setAuthLoading(true); // Set loading state immediately
    
    try {
      // Process the callback using the OAuth handler
      const result = oauthHandler.processCallback();
      
      if (!result.success) {
        setError(result.error);
        setAuthLoading(false);
        router.push('/auth/login?error=oauth_failed');
        return true;
      }

      const { token, provider, type } = result;
      logger.info(`Processing ${provider} OAuth ${type} with token`);
      
      // Store the access token using the new auth utilities
      const tokenStored = setAuthToken(token);
      if (!tokenStored) {
        throw new Error('Failed to store OAuth token');
      }
      
      setAccessToken(token);

      // Fetch user data immediately with the new token to ensure we have user data
      const userDataFetched = await fetchUserData(token);
      
      if (userDataFetched) {
        logger.info(`${provider} OAuth ${type} successful - user data loaded`);
        setAuthLoading(false); // Clear loading state
        return true;
      } else {
        // If fetching user data fails, try the handleAuthSuccess approach
        logger.warn('Direct user data fetch failed, trying handleAuthSuccess approach');
        
        // Create a mock auth success payload to trigger handleAuthSuccess
        const mockAuthData = {
          token: token,
          data: {
            accessToken: token
          }
        };

        // Process through handleAuthSuccess to ensure proper state management
        await handleAuthSuccess(mockAuthData);
        
        logger.info(`${provider} OAuth ${type} successful - auth state updated via handleAuthSuccess`);
        setAuthLoading(false); // Clear loading state
        return true;
      }
      
    } catch (error) {
      logger.error('OAuth callback processing failed:', error);
      setError(error.message || 'OAuth authentication failed');
      setAuthLoading(false);
      router.push('/auth/login?error=oauth_failed');
      return true;
    }
  }, [fetchUserData, handleAuthSuccess, router]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const initializeAuth = async () => {
      try {
        // Initialize auth migration first
        initializeAuthMigration();
        
        // Check for OAuth callback parameters first
        const shouldHandleOAuth = await handleOAuthCallback();
        
        // If OAuth was handled, don't continue with normal initialization
        if (shouldHandleOAuth) {
          if (mounted) {
            setIsInitialized(true);
            setAuthLoading(false);
          }
          return;
        }

        // Check if a recent logout occurred (within last 5 seconds)
        const logoutTimestamp = localStorage.getItem('logout_timestamp');
        const recentLogout = logoutTimestamp && (Date.now() - parseInt(logoutTimestamp)) < 5000;
        
        if (recentLogout) {
          logger.info('Recent logout detected, skipping initialization');
          localStorage.removeItem('logout_timestamp');
          return;
        }

        // Get stored data using the new auth utilities
        const storedToken = getAuthToken();
        const storedUser = getUserData();

        let userDataWasProcessed = false;

        if (storedUser) {
          try {
            // Only process user data from localStorage if it's different from current state
            // or if there is no current user state
            if (!user || JSON.stringify(storedUser) !== JSON.stringify(user)) {
              handleUserData(storedUser);
              userDataWasProcessed = true;
            }
          } catch (parseError) {
            logger.error('Error parsing user data from localStorage:', parseError);
            removeUserData();
          }
        }

        // Only fetch user data if we have a token and we didn't process user data from localStorage
        // This prevents multiple API calls during initialization
        if (storedToken && !userDataWasProcessed) {
          setAccessToken(storedToken);
          try {
            await fetchUserData(storedToken);
          } catch (fetchError) {
            // If fetching fails, we still have local data
            logger.error('Error fetching user data:', fetchError);
          }
        }
      } catch (err) {
        logger.error('Auth initialization failed:', err);
        clearAuthState();
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setAuthLoading(false);
        }
      }
    };

    // Only initialize once - use the promise ref
    if (!initPromiseRef.current) {
      initPromiseRef.current = initializeAuth();
    }

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [handleUserData, fetchUserData, clearAuthState, user, isInitialized, handleOAuthCallback]);

  const loginWithEmail = useCallback(
    async ({ email, password }) => {
      setAuthLoading(true);
      setError('');

      try {
        const response = await api.post('/auth/login/email', {
          email,
          password,
        });

        if (response.data.status === 'success' || response.data.success) {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        setError(errorMessage);

        // Enhanced error handling
        if (err.response?.status === 429) {
          return {
            success: false,
            message: 'Too many login attempts. Please try again later.',
            rateLimited: true,
          };
        } else if (err.response?.status === 403) {
          return {
            success: false,
            message:
              'Your account is temporarily locked. Please try again later or reset your password.',
            locked: true,
          };
        } else if (err.response?.status === 401) {
          return {
            success: false,
            message: 'Invalid email or password. Please check your credentials and try again.',
            unauthorized: true,
          };
        } else if (err.response?.status === 500) {
          return {
            success: false,
            message:
              'Server error. Please try again later or contact support if the problem persists.',
            serverError: true,
          };
        }

        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Register with email
  const registerWithEmail = useCallback(
    async ({ email, password, role, roleDetails }) => {
      setAuthLoading(true);
      setError('');

      try {
        const response = await api.post('/auth/register/email', {
          email,
          password,
          role,
          roleDetails: role === 'user' ? undefined : roleDetails, // Only send roleDetails if not "user"
        });

        if (response.data.status === 'success' || response.data.success) {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        setError(errorMessage);

        // Enhanced error handling
        if (err.response?.status === 429) {
          return {
            success: false,
            message: 'Too many registration attempts. Please try again later.',
            rateLimited: true,
          };
        } else if (err.response?.status === 400) {
          return {
            success: false,
            message: errorMessage,
            validation: true,
          };
        } else if (err.response?.status === 409) {
          return {
            success: false,
            message: 'Email already registered. Please try logging in instead.',
            conflict: true,
          };
        } else if (err.response?.status === 500) {
          return {
            success: false,
            message:
              'Server error. Please try again later or contact support if the problem persists.',
            serverError: true,
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
    setError('');
    try {
      const response = await api.post('/auth/register/request-otp', {
        phone,
        role,
        roleDetails: role === 'user' ? undefined : roleDetails, // Only send roleDetails if not "user"
      });
      if (response.data.status === 'success') {
        return { success: true };
      }
      setError(response.data.message || 'Failed to send OTP');
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      if (err.response?.status === 429) {
        return {
          success: false,
          message: 'Rate limit exceeded. Please wait 15 minutes.',
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
      setError('');
      try {
        const response = await api.post('/auth/register/verify-otp', {
          phone,
          code,
          role,
          roleDetails: role === 'user' ? undefined : roleDetails, // Only send roleDetails if not "user"
        });
        if (response.data.status === 'success') {
          handleAuthSuccess(response.data);
          return { success: true };
        }
        setError(response.data.message || 'OTP verification failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'OTP verification failed';
        setError(errorMessage);
        if (err.response?.status === 429) {
          return {
            success: false,
            message: 'Rate limit exceeded. Try again later.',
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

  const loginWithPhone = useCallback(async phone => {
    setAuthLoading(true);
    setError('');
    try {
      // Use the correct endpoint that matches the backend route definition
      const response = await api.post('/auth/login/request-otp', {
        phone,
      });

      if (response.data.status === 'success') {
        return { success: true };
      }
      setError(response.data.message || 'Phone login failed');
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Phone login failed';
      setError(errorMessage);

      // Enhanced error handling
      if (err.response?.status === 429) {
        return { success: false, message: errorMessage, rateLimited: true };
      } else if (err.response?.status === 403) {
        return { success: false, message: errorMessage, locked: true };
      } else if (err.response?.status === 500) {
        return { success: false, message: 'Internal server error' };
      } else if (err.response?.status === 404) {
        return { success: false, message: 'Resource not found' };
      } else if (err.response?.status === 401) {
        return { success: false, message: 'Unauthorized access' };
      } else if (err.response?.status === 408) {
        return { success: false, message: 'Request timed out' };
      } else if (err.response?.status === 400) {
        return { success: false, message: 'Bad request' };
      }
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, [setAuthLoading, setError]);

  // Verify OTP for login
  const verifyOtpForLogin = useCallback(
    async (phone, code) => {
      setAuthLoading(true);
      setError('');
      try {
        // Use the correct endpoint that matches the backend route definition
        const response = await api.post('/auth/login/verify-otp', {
          phone,
          code,
        });
        if (response.data.status === 'success') {
          handleAuthSuccess(response.data);
          return { success: true };
        }
        setError(response.data.message || 'OTP verification failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'OTP verification failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess, setAuthLoading, setError] // Added handleAuthSuccess
  );

  // Logout function
  const logout = useCallback(async () => {
    // Use a ref to prevent multiple concurrent logout attempts
    if (fetchingUserDataRef.current) {
      return { success: false, message: 'Logout already in progress' };
    }

    fetchingUserDataRef.current = true;
    setAuthLoading(true);
    setError('');

    try {
      // Store the current token before clearing state
      const currentToken = accessToken || getAuthToken();

      // Mark as logged out to prevent re-initialization loops
      if (typeof window !== 'undefined') {
        localStorage.setItem('logout_timestamp', Date.now().toString());
      }

      // Immediately clear all local/auth state for snappy UX
      clearAuthState();

      // Fire-and-forget request to inform backend – do NOT await
      if (currentToken) {
        api
          .post(
            '/auth/logout',
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
              timeout: 3000,
            }
          )
          .catch(err => {
            // Backend logout failure should never block the client UX
            console.warn('Server logout failed (ignored):', err?.message || err);
          });
      }

      // Instant resolve so caller can redirect immediately
      return {
        success: true,
        message: 'Logged out successfully',
        fireAndForget: true,
      };
    } catch (error) {
      logger.error('Logout failed:', error);
      return { success: false, message: 'Logout failed' };
    } finally {
      fetchingUserDataRef.current = false;
      setAuthLoading(false);
    }
  }, [accessToken, clearAuthState]);

  const login = useCallback(
    async (email, password) => {
      setAuthLoading(true);
      setError('');

      try {
        const response = await api.post('/auth/login/email', {
          email,
          password,
        });

        if (response.data.status === 'success') {
          await handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (email, password, role, roleDetails) => {
      setAuthLoading(true);
      setError('');

      try {
        const response = await api.post('/auth/register/email', {
          email,
          password,
          role,
          roleDetails,
        });

        if (response.data.status === 'success') {
          await handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const sendOtp = useCallback(
    async (phone, type = 'login', role, roleDetails) => {
      setAuthLoading(true);
      setError('');

      try {
        const payload = { phone };

        // Add role and roleDetails for registration
        if (type === 'register') {
          if (role) payload.role = role;
          if (roleDetails) payload.roleDetails = roleDetails;
        }

        const response = await api.post(`/auth/${type}/request-otp`, payload);

        if (response.data.status === 'success') {
          // Store phone verification step in localStorage
          localStorage.setItem('nextStep', JSON.stringify({ type: 'phone_verification', phone }));
          return { success: true };
        }

        setError(response.data.message || 'OTP request failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'OTP request failed';
        setError(errorMessage);

        // Handle rate limiting
        if (errorMessage.includes('Rate limit exceeded')) {
          // Extract time to reset if available
          const timeMatch = errorMessage.match(/(\d+) seconds/);
          const secondsToWait = timeMatch && timeMatch[1] ? parseInt(timeMatch[1]) : 900; // Default 15 minutes

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
    []
  );

  const verifyOtp = useCallback(
    async (phone, code, type = 'login', role, roleDetails) => {
      setAuthLoading(true);
      setError('');

      try {
        const payload = { phone, code };

        // Add role and roleDetails for registration
        if (type === 'register') {
          if (role) payload.role = role;
          if (roleDetails) payload.roleDetails = roleDetails;
        }

        const response = await api.post(`/auth/${type}/verify-otp`, payload);

        if (response.data.status === 'success') {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'OTP verification failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'OTP verification failed';
        setError(errorMessage);

        // Handle OTP-specific error cases
        if (errorMessage.includes('expired')) {
          return {
            success: false,
            message: errorMessage,
            expired: true,
          };
        } else if (errorMessage.includes('Invalid OTP')) {
          return {
            success: false,
            message: errorMessage,
            invalid: true,
          };
        } else if (errorMessage.includes('Maximum verification attempts')) {
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
    async phone => {
      setAuthLoading(true);
      setError('');

      try {
        // Use the correct endpoint that matches the backend route definition
        const response = await api.post('/auth/send-phone-otp', { phone });

        // Check if the phone is already verified
        if (response.data.status === 'success' && response.data.data?.isVerified) {
          // Update user data if needed
          if (user && !user.isPhoneVerified) {
            setUser(prev => ({
              ...prev,
              isPhoneVerified: true,
              phone: phone,
            }));

            // Update user data using the new utility
            setUserData({
              ...user,
              isPhoneVerified: true,
              phone: phone,
            });
          }

          // Remove phone verification from next steps if it exists
          if (nextStep && nextStep.type === 'phone_verification') {
            setNextStep(null);
            localStorage.removeItem('nextStep');
          }

          return { success: true, isVerified: true };
        }

        return {
          success: response.data.status === 'success',
          message: response.data.message,
          otpSent: true,
        };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send OTP';
        setError(errorMessage);

        // Handle rate limiting
        if (errorMessage.includes('Rate limit exceeded')) {
          const timeMatch = errorMessage.match(/(\d+) seconds/);
          const secondsToWait = timeMatch && timeMatch[1] ? parseInt(timeMatch[1]) : 900;

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
      setError('');

      try {
        // Use the correct endpoint for phone verification (for authenticated users)
        const response = await api.post('/auth/verify-phone-otp', { phone, code });

        if (response.data.status === 'success') {
          // Update user data to reflect phone verification
          if (user) {
            const updatedUser = {
              ...user,
              isPhoneVerified: true,
              phone: phone,
              tempPhone: undefined, // Clear tempPhone if it was set
            };
            
            setUser(updatedUser);
            setUserData(updatedUser); // Use the new utility
          }

          // Remove phone verification from next steps if it exists
          if (nextStep && nextStep.type === 'phone_verification') {
            setNextStep(null);
            localStorage.removeItem('nextStep');
          }

          return { success: true };
        }

        setError(response.data.message || 'Failed to verify OTP');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to verify OTP';
        setError(errorMessage);

        // Handle OTP-specific error cases
        if (errorMessage.includes('expired')) {
          return {
            success: false,
            message: errorMessage,
            expired: true,
          };
        } else if (errorMessage.includes('Invalid OTP')) {
          return {
            success: false,
            message: errorMessage,
            invalid: true,
          };
        } else if (errorMessage.includes('Maximum verification attempts')) {
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
    [handleAuthSuccess, user, nextStep]
  );

  const resendEmailVerification = useCallback(async email => {
    setAuthLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/send-email-verification', {
        email,
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          message: 'Verification email sent successfully',
        };
      }

      setError(response.data.message || 'Failed to resend verification email');
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async token => {
      setAuthLoading(true);
      setError('');

      try {
        const response = await api.get(`/auth/verify-email/${token}`);

        if (response.data.status === 'success') {
          handleAuthSuccess(response.data);
          return { success: true };
        }

        setError(response.data.message || 'Failed to verify email');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          (err.name === 'TokenExpiredError'
            ? 'Verification link has expired'
            : err.name === 'JsonWebTokenError'
            ? 'Invalid verification link'
            : 'Failed to verify email');

        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          expired: err.name === 'TokenExpiredError',
          invalid: err.name === 'JsonWebTokenError',
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const completeProfile = useCallback(
    async formData => {
      setAuthLoading(true);
      setError('');

      try {
        logger.info('Processing profile completion request');

        // Ensure we're working with FormData
        let dataToSend;
        if (formData instanceof FormData) {
          dataToSend = formData;
        } else {
          // Convert object to FormData
          dataToSend = new FormData();
          dataToSend.append('userData', JSON.stringify(formData));

          // Handle file upload for profilePicture if it exists
          if (formData.profilePicture && formData.profilePicture instanceof File) {
            dataToSend.append('profileImage', formData.profilePicture);
            logger.debug('Added profile picture to form data');
          }
        }

        // Basic validation
        try {
          const userData = dataToSend.get('userData');
          const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;

          // Check for required fields
          const requiredFields = ['firstName', 'lastName'];
          const missingFields = requiredFields.filter(field => !parsedUserData[field]);

          if (missingFields.length > 0) {
            logger.warn(`Missing required fields: ${missingFields.join(', ')}`);
            setError(`Please provide the following required fields: ${missingFields.join(', ')}`);
            return {
              success: false,
              message: `Missing required fields: ${missingFields.join(', ')}`,
            };
          }

          // Ensure at least one contact method is provided
          // Check both form data and current user's verified contact methods
          const hasEmailInForm = parsedUserData.email && parsedUserData.email.trim();
          const hasPhoneInForm = parsedUserData.phone && parsedUserData.phone.trim();
          const hasVerifiedEmail = user?.isEmailVerified && user?.email;
          const hasVerifiedPhone = user?.isPhoneVerified && user?.phone;
          
          const hasContactMethod = hasEmailInForm || hasPhoneInForm || hasVerifiedEmail || hasVerifiedPhone;
          
          if (!hasContactMethod) {
            logger.warn('No contact method provided');
            setError('Please provide at least one contact method (email or phone)');
            return {
              success: false,
              message: 'Please provide at least one contact method (email or phone)',
            };
          }
        } catch (e) {
          logger.error('Error validating user data:', e);
        }

        logger.info('Submitting profile completion request to API');
        const response = await api.post('/auth/complete-profile', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.status === 'success') {
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
          window.dispatchEvent(
            new CustomEvent('profile:updated', {
              detail: { user: response.data.data.user },
            })
          );

          return { success: true, user: response.data.data.user };
        }

        logger.error('Profile completion failed:', response.data.message);
        setError(response.data.message || 'Profile completion failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        logger.error('Exception in completeProfile:', err);

        // Enhanced error handling
        let errorMessage = 'Profile completion failed';
        let errorCode = null;

        if (err.response) {
          errorMessage = err.response.data?.message || errorMessage;
          errorCode = err.response.status;

          // Handle specific error codes
          if (errorCode === 400) {
            errorMessage = err.response.data?.message || 'Invalid profile data';
          } else if (errorCode === 401) {
            errorMessage = 'Authentication required. Please log in again.';
            clearAuthState();
          } else if (errorCode === 413) {
            errorMessage = 'Profile image too large. Please use a smaller image.';
          } else if (errorCode === 429) {
            errorMessage = 'Too many requests. Please try again later.';
          } else if (errorCode >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }

        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
          code: errorCode,
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [user, handleAuthSuccess, clearAuthState, setAuthLoading, setError]
  );

  const updateProfile = useCallback(
    async userData => {
      setAuthLoading(true);
      setError('');

      try {
        // Ensure we're sending a proper object, not FormData for this endpoint
        const dataToSend =
          userData instanceof FormData ? JSON.parse(userData.get('userData') || '{}') : userData;

        const response = await api.put('/auth/profile', dataToSend);

        if (response.data.status === 'success') {
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
            localStorage.setItem('nextStep', JSON.stringify(response.data.nextStep));

            // Dispatch a profile:updated event to notify other components
            window.dispatchEvent(
              new CustomEvent('profile:updated', {
                detail: { user: response.data.data.user },
              })
            );

            return {
              success: true,
              user: response.data.data.user,
              nextStep: response.data.nextStep,
            };
          }

          // Dispatch a profile:updated event to notify other components
          window.dispatchEvent(
            new CustomEvent('profile:updated', {
              detail: { user: response.data.data.user },
            })
          );

          return { success: true, user: response.data.data.user };
        }

        setError(response.data.message || 'Profile update failed');
        return { success: false, message: response.data.message };
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Profile update failed';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setAuthLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const updateProfilePicture = useCallback(async fileData => {
    setAuthLoading(true);
    setError('');

    try {
      const formData = new FormData();

      if (fileData instanceof File) {
        formData.append('profileImage', fileData);
      } else if (fileData instanceof FormData) {
        formData.append('profileImage', fileData.get('profileImage'));
      } else {
        return { success: false, message: 'Please provide a valid image file' };
      }

      const response = await api.post('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Check for both success formats (status === "success" or success === true)
      if (response.data.status === 'success' || response.data.success) {
        // Update the local user data with the new profile picture
        setUser(prev => ({
          ...prev,
          profilePicture: response.data.data.user.profilePicture,
        }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            profilePicture: response.data.data.user.profilePicture,
          })
        );

        return {
          success: true,
          message: 'Profile picture updated successfully',
          profilePicture: response.data.data.user.profilePicture,
          url: response.data.data.user.profilePicture?.url, // Add url property for easier access
        };
      }

      setError(response.data.message || 'Failed to update profile picture');
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile picture';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateBannerImage = useCallback(async fileData => {
    setAuthLoading(true);
    setError('');

    try {
      const formData = new FormData();

      if (fileData instanceof File) {
        formData.append('bannerImage', fileData);
      } else if (fileData instanceof FormData) {
        formData.append('bannerImage', fileData.get('bannerImage'));
      } else {
        return { success: false, message: 'Please provide a valid image file' };
      }

      const response = await api.post('/auth/update-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Check for both success formats (status === "success" or success === true)
      if (response.data.status === 'success' || response.data.success) {
        // Update the local user data with the new banner image
        setUser(prev => ({
          ...prev,
          bannerImage: response.data.data.user.bannerImage,
        }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            bannerImage: response.data.data.user.bannerImage,
          })
        );

        return {
          success: true,
          message: 'Banner image updated successfully',
          bannerImage: response.data.data.user.bannerImage,
          url: response.data.data.user.bannerImage?.url, // Add url property for easier access
        };
      }

      setError(response.data.message || 'Failed to update banner image');
      return { success: false, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update banner image';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    // Skip if we're already fetching or if the last fetch was less than 2 seconds ago
    const now = Date.now();
    if (fetchingUserDataRef.current || (now - lastFetchTimeRef.current < 2000)) {
      // If we have a user already, return it instead of making a new API call
      if (user) {
        return { success: true, user };
      }
    }

    fetchingUserDataRef.current = true;
    lastFetchTimeRef.current = now;
    
    try {
      const response = await api.get('/auth/me', {
        // Add cache busting param with timestamp and use cache
        params: { _t: now },
        useCache: true
      });
      if (response.data.status === 'success') {
        const userData = response.data.data?.user || response.data.data;
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message || 'Failed to get user data' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get user data';
      return { success: false, message: errorMessage };
    } finally {
      fetchingUserDataRef.current = false;
    }
  }, [user]);

  // Add skipProfileCompletion function before the return statement
  const skipProfileCompletion = useCallback(() => {
    // Add "profile_completion" to skipped steps in localStorage
    const skippedSteps = JSON.parse(localStorage.getItem('skippedSteps') || '[]');
    if (!skippedSteps.includes('profile_completion')) {
      skippedSteps.push('profile_completion');
      localStorage.setItem('skippedSteps', JSON.stringify(skippedSteps));
    }

    // Reset next step if it was profile completion
    if (nextStep?.type === 'profile_completion') {
      setNextStep(null);
      localStorage.removeItem('nextStep');
    }
  }, [nextStep]);

  // Add refreshNextStep function before the return statement
  const refreshNextStep = useCallback(async () => {
    setAuthLoading(true);
    try {
      // Fetch fresh user data from the server
      const result = await getCurrentUser();
      if (result.success && result.user) {
        // Only update if there are real changes
        const userData = result.user;
        const currentUserData = user || {};
        
        const hasChanges = 
          userData._id !== currentUserData._id ||
          userData.isEmailVerified !== currentUserData.isEmailVerified ||
          userData.isPhoneVerified !== currentUserData.isPhoneVerified ||
          userData.isProfileCompleted !== currentUserData.isProfileCompleted;
          
        if (hasChanges) {
          // Update user data and next step
          handleUserData(result.user);
        }
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (err) {
      logger.error('Failed to refresh next step:', err);
      return { success: false, message: 'Failed to refresh verification status' };
    } finally {
      setAuthLoading(false);
    }
  }, [getCurrentUser, handleUserData, user]);

  // Add refreshUserData function for manual refresh
  const refreshUserData = useCallback(
    async (force = false) => {
      if (!accessToken) return false;
      
      if (force) {
        // Reset the debounce timer to allow immediate fetch
        lastFetchTimeRef.current = 0;
        fetchingUserDataRef.current = false;
      }
      
      return await fetchUserData(accessToken);
    },
    [accessToken, fetchUserData]
  );

  // Helper function to check if the app is being initialized for the first time
  const isFirstInitRef = React.useRef(true);
  
  // Listen for external token refreshes (e.g. from api.js)
  React.useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { accessToken: newToken, user: refreshedUser } = event.detail;
      
      // Only update if there are actual changes
      if (newToken && newToken !== accessToken) {
        setAccessToken(newToken);
      }
      
      if (refreshedUser) {
        handleUserData(refreshedUser);
      }
    };
    
    const handleWaitlistVerificationSuccess = (event) => {
      const { user: verifiedUser, accessToken: newToken, nextStep: waitlistNextStep } = event.detail;
      
      // Update access token if provided using the new utility
      if (newToken && newToken !== accessToken) {
        const tokenStored = setAuthToken(newToken);
        if (tokenStored) {
          setAccessToken(newToken);
        }
      }
      
      // Update user data if provided
      if (verifiedUser) {
        handleUserData(verifiedUser);
      }
      
      // Set next step if profile completion is needed
      if (waitlistNextStep === 'complete-profile') {
        setNextStep({
          type: 'profile_completion',
          title: 'Complete your profile',
          description: 'Complete your profile to access all features',
          required: false,
          skippable: false
        });
      }
    };
    
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:waitlist-verification-success', handleWaitlistVerificationSuccess);
    
    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:waitlist-verification-success', handleWaitlistVerificationSuccess);
    };
  }, [handleUserData, accessToken, setNextStep]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    accessToken,
    authLoading,
    error,
    clearError,
    nextStep,
    isInitialized,
    isAuthenticated: !!user,
    loginWithEmail,
    registerWithEmail,
    registerWithPhone,
    verifyOtpForRegister,
    loginWithPhone,
    verifyOtpForLogin,
    logout,
    sendOtp,
    verifyOtp,
    sendPhoneVerificationOtp,
    verifyPhoneOtp,
    resendEmailVerification,
    verifyEmail,
    completeProfile,
    updateProfile,
    updateProfilePicture,
    updateBannerImage,
    getCurrentUser,
    setNextStep,
    handleUserData,
    fetchUserData,
    refreshUserData,
    skipProfileCompletion,
    refreshNextStep,
    forgotPassword,
    resetPassword,
    verifyPasswordResetToken,
    changePassword,
    deleteAccount,
  }), [
    user, 
    accessToken, 
    authLoading, 
    error,
    clearError,
    nextStep, 
    isInitialized,
    loginWithEmail,
    registerWithEmail,
    registerWithPhone,
    verifyOtpForRegister,
    loginWithPhone,
    verifyOtpForLogin,
    logout,
    sendOtp,
    verifyOtp,
    sendPhoneVerificationOtp,
    verifyPhoneOtp,
    resendEmailVerification,
    verifyEmail,
    completeProfile,
    updateProfile,
    updateProfilePicture,
    updateBannerImage,
    getCurrentUser,
    setNextStep,
    handleUserData,
    fetchUserData,
    refreshUserData,
    skipProfileCompletion,
    refreshNextStep,
    forgotPassword,
    resetPassword,
    verifyPasswordResetToken,
    changePassword,
    deleteAccount,
  ]);

  // Return context value with all functions and state
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
