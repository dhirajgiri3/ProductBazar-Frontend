"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "./toast-context";
import { debounce } from "lodash";
import { calculatePositionImprovement } from "../utils/waitlist-position.utils.js";
import { getAuthToken, setAuthToken, setUserData } from "../utils/auth/auth-utils.js";

// Create waitlist context
const WaitlistContext = createContext();

// Custom hook to use waitlist context
export const useWaitlist = () => {
  const context = useContext(WaitlistContext);
  if (!context) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
};

// Waitlist provider component
export const WaitlistProvider = ({ children }) => {
  const { showToast } = useToast();
  
  // Consolidated state management
  const [state, setState] = useState({
    // System state
    isWaitlistEnabled: false,
    
    // User waitlist state
    userEntry: null,
    isOnWaitlist: false,
    hasAccess: false,
    
    // UI state - consolidated loading states
    loading: true,
    submitting: false,
    positionChecking: false,
    
    // Form state
    formData: {
      email: "",
      firstName: "",
      lastName: "",
      role: "discoverer",
      companyOrProject: "",
      referralCode: "",
      meta: {},
    },
    
    // Queue statistics
    queueStats: {
      total: 0,
      waiting: 0,
      invited: 0,
      onboarded: 0,
      active: 0,
      referrals: 0,
    },
    
    // Errors
    errors: {},
  });

  // Global verification flag (stable across renders)
  const verificationInProgressRef = useRef(false);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";

  // Optimized API call helper
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = typeof window !== "undefined" ? getAuthToken() : null;
    
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };
    
    const response = await fetch(url, config);
    
    // Check if the response is JSON before parsing
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (e.g., from rate limiters)
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  }, [API_BASE]);

  // Debounced status check
  const checkWaitlistStatus = useCallback(
    debounce(async (forceRefresh = false) => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        let waitlistStatus = null;
        const CACHE_KEY = 'waitlist_status_cache';
        const CACHE_TIMESTAMP_KEY = 'waitlist_status_cache_timestamp';

        if (typeof window !== 'undefined' && !forceRefresh) {
          const cachedData = sessionStorage.getItem(CACHE_KEY);
          const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

          if (cachedData && cachedTimestamp) {
            const now = Date.now();
            const cacheTime = parseInt(cachedTimestamp, 10);
            const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

            if (now - cacheTime < CACHE_DURATION) {
              waitlistStatus = JSON.parse(cachedData);
            }
          }
        }

        if (!waitlistStatus) {
          const response = await apiCall("/api/v1/waitlist/status");
          waitlistStatus = response.data;
          
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(waitlistStatus));
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
          }
        }

        setState(prev => ({
          ...prev,
          isWaitlistEnabled: waitlistStatus?.waitlistEnabled || false,
          queueStats: waitlistStatus?.stats || prev.queueStats,
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to check waitlist status:", error);
        setState(prev => ({ 
          ...prev, 
          loading: false,
        }));
      }
    }, 300),
    [apiCall]
  );

  // Submit application
  const submitApplication = useCallback(async (applicationData) => {
    try {
      setState(prev => ({ ...prev, submitting: true, errors: {} }));
      
      const response = await apiCall("/api/v1/waitlist/submit", {
        method: "POST",
        body: JSON.stringify(applicationData),
      });

      const { position, referralCode, status, estimatedInviteDate, referralCount = 0 } = response.data;

      // Optimistically update queue statistics so the live counter reflects
      // the new entrant immediately without waiting for the next poll.
      setState(prev => ({
        ...prev,
        userEntry: {
          email: applicationData.email,
          position: position || 0,
          referralCode,
          status,
          estimatedInviteDate,
          role: applicationData.role,
          referralCount,
          joinedAt: response.data.joinedAt,
        },
        // Increment waiting count locally (and total if present)
        queueStats: prev.queueStats ? {
          ...prev.queueStats,
          waiting: (prev.queueStats.waiting || 0) + 1,
          total: prev.queueStats.total ? prev.queueStats.total + 1 : undefined,
        } : prev.queueStats,
        isOnWaitlist: true,
        submitting: false,
      }));

      showToast(`Welcome to ProductBazar! You're position #${position}`, "success");

      return { success: true, data: response.data };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        submitting: false,
        errors: { ...prev.errors, submission: error.message }
      }));
      showToast(error.message || "Failed to submit application", "error");
      throw error;
    }
  }, [apiCall, checkWaitlistStatus, showToast]);

  // Check position
  const checkPosition = useCallback(async (email) => {
    try {
      setState(prev => ({ ...prev, positionChecking: true }));
      
      const response = await apiCall("/api/v1/waitlist/position", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.data) {
        setState(prev => ({
          ...prev,
          userEntry: response.data,
          isOnWaitlist: true,
          positionChecking: false,
        }));
        return response.data;
      }
      
      setState(prev => ({ ...prev, positionChecking: false }));
      return null;
    } catch (error) {
      setState(prev => ({ ...prev, positionChecking: false }));
      showToast(error.message || "Failed to check position", "error");
      throw error;
    }
  }, [apiCall, showToast]);

  // Form utilities
  const updateFormData = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      errors: { ...prev.errors },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        email: "",
        firstName: "",
        lastName: "",
        role: "discoverer",
        companyOrProject: "",
        referralCode: "",
        meta: {},
      },
      errors: {},
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Referral utilities
  const generateReferralLink = useCallback((referralCode) => {
    if (!referralCode) return '';
    
    const cleanCode = referralCode.includes('?ref=') 
      ? referralCode.split('?ref=').pop() 
      : referralCode;
      
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/?ref=${cleanCode}`;
  }, []);

  const copyReferralLink = useCallback(async (referralCode) => {
    try {
      const referralLink = generateReferralLink(referralCode);
      await navigator.clipboard.writeText(referralLink);
    } catch (error) {
      showToast("Failed to copy link", "error");
    }
  }, [generateReferralLink, showToast]);

  const shareOnSocial = useCallback(async (platform, referralCode, customMessage = '') => {
    try {
      const response = await apiCall("/api/v1/waitlist/share", {
        method: "POST",
        body: JSON.stringify({ referralCode, platform, customMessage }),
      });
      
      const shareUrl = response.data?.shareUrl;
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Referral link copied!', "success");
      } else if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      showToast('Failed to share', "error");
    }
  }, [apiCall, showToast]);

  // Referral stats and leaderboard
  const getReferralStats = useCallback(async (referralCode) => {
    if (!referralCode || !state.userEntry?.email) return null;
    try {
      const response = await apiCall(`/api/v1/waitlist/referral`, {
        method: 'POST',
        body: JSON.stringify({ 
          referralCode: referralCode,
          email: state.userEntry.email 
        }),
      });
      const data = response.data || {};
      const referrer = data.referrer || {};
      const referralsArray = data.referrals || [];
      const referralCount = referrer.referralCount ?? data.totalReferrals ?? referralsArray.length;

      const statsObj = {
        totalReferrals: referralCount,
        successfulReferrals: referralCount,
        pendingReferrals: 0,
        positionImprovement: calculatePositionImprovement(referralCount, Math.max(1, referrer.position)),
      };

      return {
        stats: statsObj,
        currentTier: referrer.currentTier || null,
        nextTierProgress: referrer.nextTierProgress || null,
        referrals: referralsArray,
        positionImprovement: statsObj.positionImprovement,
        referrer: referrer
      };
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
  }, [apiCall, state.userEntry?.email]);

  const getReferralLeaderboard = useCallback(async () => {
    try {
      const response = await apiCall(`/api/v1/waitlist/leaderboard?email=${state.userEntry?.email}`);
      return {
        leaderboard: response.data.leaderboard,
        currentUserRank: response.data.currentUserRank,
      };
    } catch (error) {
      console.error('Error fetching referral leaderboard:', error);
      return {
        leaderboard: [],
        currentUserRank: null,
      };
    }
  }, [apiCall, state.userEntry?.email]);

  // Verify magic link and obtain access token
  const verifyMagicLink = useCallback(
    async (token) => {
      try {
        if (!token) throw new Error('Invalid token');

        setState(prev => ({ ...prev, loading: true }));

        const response = await apiCall('/api/v1/waitlist/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (response.status !== 'success') {
          throw new Error(response.message || 'Verification failed');
        }

        const { accessToken, user } = response.data;

        if (accessToken) {
          setAuthToken(accessToken);
          // Inform global listeners (e.g., AuthContext & axios interceptor)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
              detail: { accessToken, user }
            }));
          }
        }

        if (user) {
          setUserData(user);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:waitlist-verification-success', {
              detail: {
                accessToken,
                user,
                nextStep: user.needsProfileCompletion ? 'complete-profile' : null,
              },
            }));
          }
        }

        setState(prev => ({ ...prev, loading: false, hasAccess: true }));

        return { success: true, accessToken, user };
      } catch (error) {
        console.error('Verify magic link failed:', error);
        setState(prev => ({ ...prev, loading: false }));
        return { success: false, message: error.message };
      }
    },
    [apiCall]
  );

  // User access check
  const checkUserWaitlistAccess = useCallback(async (userEmail) => {
    try {
      const response = await apiCall("/api/v1/waitlist/position", {
        method: "POST",
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (response.data && response.data.status === 'onboarded') {
        setState(prev => ({
          ...prev,
          hasAccess: true,
          userEntry: {
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            position: response.data.position,
            status: response.data.status,
            estimatedInviteDate: response.data.estimatedInviteDate,
            referralCode: response.data.referralCode,
            referralCount: response.data.referralCount,
            joinedAt: response.data.joinedAt,
          },
          isOnWaitlist: true,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          hasAccess: false,
          userEntry: response.data || null,
          isOnWaitlist: !!response.data,
        }));
        return false;
      }
    } catch (error) {
      console.error("Failed to check user waitlist access:", error);
      setState(prev => ({
        ...prev,
        hasAccess: false,
        userEntry: null,
        isOnWaitlist: false,
      }));
      return false;
    }
  }, [apiCall]);

  // Password management
  const setWaitlistUserPassword = useCallback(async (password) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await apiCall("/api/v1/waitlist/set-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      if (response.status === "success") {
        showToast("Password set successfully! You can now login with email and password.", "success");
        return {
          success: true,
          message: response.message
        };
      } else {
        throw new Error(response.message || 'Failed to set password');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        errors: { ...prev.errors, passwordSetup: error.message }
      }));
      
      showToast(error.message || "Failed to set password", "error");
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [apiCall, showToast]);

  const checkWaitlistUserPassword = useCallback(async () => {
    try {
      // Try multiple sources for the token
      let token = null;
      
      if (typeof window !== 'undefined') {
        // First try localStorage
        token = localStorage.getItem('accessToken');
        
        // If not found, try auth utils
        if (!token) {
          token = getAuthToken();
        }
        
        // If still not found, try sessionStorage
        if (!token) {
          token = sessionStorage.getItem('accessToken');
        }
      }
      
      if (!token) {
        return {
          success: true,
          hasPassword: false,
          needsPasswordSetup: true,
          error: 'No authentication token'
        };
      }

      const response = await apiCall("/api/v1/waitlist/has-password", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === "success") {
        const result = {
          success: true,
          hasPassword: response.data.hasPassword,
          needsPasswordSetup: response.data.needsPasswordSetup
        };
        return result;
      } else {
        throw new Error(response.message || 'Failed to check password status');
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        return {
          success: true,
          hasPassword: false,
          needsPasswordSetup: true,
          error: 'Authentication required'
        };
      }
      
      return {
        success: false,
        hasPassword: false,
        needsPasswordSetup: true,
        error: error.message
      };
    }
  }, [apiCall]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    ...state,
    checkWaitlistStatus,
    submitApplication,
    checkPosition,
    updateFormData,
    resetForm,
    clearErrors,
    generateReferralLink,
    copyReferralLink,
    shareOnSocial,
    getReferralStats,
    getReferralLeaderboard,
    verifyMagicLink,
    checkUserWaitlistAccess,
    setWaitlistUserPassword,
    checkWaitlistUserPassword,
    // Backward compatibility
    submitWaitlistEntry: submitApplication,
    shareReferralLink: shareOnSocial,
    // Computed loading states
    isLoading: state.loading || state.submitting || state.positionChecking,
    isInitialLoading: state.loading,
    isSubmitting: state.submitting,
    isPositionChecking: state.positionChecking,
    isProcessing: state.submitting || state.positionChecking,
  }), [
    state,
    checkWaitlistStatus,
    submitApplication,
    checkPosition,
    updateFormData,
    resetForm,
    clearErrors,
    generateReferralLink,
    copyReferralLink,
    shareOnSocial,
    getReferralStats,
    getReferralLeaderboard,
    verifyMagicLink,
    checkUserWaitlistAccess,
    setWaitlistUserPassword,
    checkWaitlistUserPassword,
  ]);

  // Effects
  useEffect(() => {
    checkWaitlistStatus();
  }, [checkWaitlistStatus]);

  // Simplified polling
  useEffect(() => {
    if (!state.isWaitlistEnabled) return;

    const pollInterval = setInterval(() => {
      checkWaitlistStatus();
    }, 120000); // 2 minutes

    return () => clearInterval(pollInterval);
  }, [state.isWaitlistEnabled, checkWaitlistStatus]);

  // Event listeners
  useEffect(() => {
    const handleWaitlistToggle = (event) => {
      const { enabled } = event.detail;
      setState(prev => ({
        ...prev,
        isWaitlistEnabled: enabled
      }));
      checkWaitlistStatus(true);
    };

    const handleUserStatusUpdate = (event) => {
      const { user } = event.detail;
      if (user && user.registrationMethod === 'waitlist') {
        checkWaitlistStatus(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('waitlist:toggle', handleWaitlistToggle);
      window.addEventListener('waitlist:user-updated', handleUserStatusUpdate);
      
      return () => {
        window.removeEventListener('waitlist:toggle', handleWaitlistToggle);
        window.removeEventListener('waitlist:user-updated', handleUserStatusUpdate);
      };
    }
  }, [checkWaitlistStatus]);

  // Auth context sync
  useEffect(() => {
    const handleAuthUserUpdated = (event) => {
      const { user: authUser } = event.detail;
      
      if (authUser && authUser.registrationMethod === 'waitlist') {
        setState(prev => ({
          ...prev,
          hasAccess: true,
          userEntry: {
            email: authUser.email,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            status: 'onboarded',
            role: authUser.role,
            onboardedAt: new Date().toISOString(),
            position: authUser.waitlistData?.position || prev.userEntry?.position,
            referralCode: authUser.waitlistData?.referralCode || prev.userEntry?.referralCode,
            referralCount: authUser.waitlistData?.referralCount || 0,
          }
        }));
      }
    };

    const handleAuthTokenRefreshed = (event) => {
      const { user: refreshedUser } = event.detail;
      
      if (refreshedUser && refreshedUser.registrationMethod === 'waitlist' && state.userEntry) {
        setState(prev => ({
          ...prev,
          userEntry: {
            ...prev.userEntry,
            email: refreshedUser.email,
            firstName: refreshedUser.firstName,
            lastName: refreshedUser.lastName,
            status: 'onboarded',
            role: refreshedUser.role,
          }
        }));
      }
    };

    const handleAuthLogout = () => {
      setState(prev => ({
        ...prev,
        hasAccess: false,
        userEntry: null,
        isOnWaitlist: false,
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:user-updated', handleAuthUserUpdated);
      window.addEventListener('auth:token-refreshed', handleAuthTokenRefreshed);
      window.addEventListener('auth:logout', handleAuthLogout);
      
      return () => {
        window.removeEventListener('auth:user-updated', handleAuthUserUpdated);
        window.removeEventListener('auth:token-refreshed', handleAuthTokenRefreshed);
        window.removeEventListener('auth:logout', handleAuthLogout);
      };
    }
  }, [state.userEntry]);

  // Referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");
    
    if (referralCode) {
      updateFormData({ referralCode });
      showToast("Referral code applied! You'll get priority access to ProductBazar!", "success");
    }
  }, [updateFormData, showToast]);

  return (
    <WaitlistContext.Provider value={contextValue}>
      {children}
    </WaitlistContext.Provider>
  );
};

export default WaitlistContext; 