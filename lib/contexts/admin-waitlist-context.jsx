"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthToken } from '../utils/auth/auth-utils.js';

const AdminWaitlistContext = createContext();

export const useAdminWaitlist = () => {
  const context = useContext(AdminWaitlistContext);
  if (!context) {
    throw new Error("useAdminWaitlist must be used within an AdminWaitlistProvider");
  }
  return context;
};

export const AdminWaitlistProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    waitlist_enabled: false,
    auto_approve_creators: false,
    referral_system_enabled: true
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1';

  // Helper function to make API calls
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = getAuthToken() || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }, [API_BASE]);

  // Helper function to extract the real payload from various API response shapes
  const extractPayload = (response) => {
    // Preferred modern shape { success: true, data: {...} }
    if (response && typeof response.data === 'object') {
      return response.data;
    }
    // Legacy mis-ordered shape where useful payload was placed in `statusCode`
    if (response && typeof response.statusCode === 'object') {
      return response.statusCode.data || response.statusCode;
    }
    return null;
  };

  // Helper to determine if API response is successful
  const isSuccessfulResponse = (response) => {
    if (!response) return false;
    // New style boolean
    if (response.success === true) return true;
    // Older style string status
    if (typeof response.status === 'string' && response.status.toLowerCase() === 'success') return true;
    // Some endpoints misuse message field to carry 'success'
    if (typeof response.message === 'string' && response.message.toLowerCase() === 'success') return true;
    return false;
  };

  // --------------------------------------------
  // Waitlist STATUS Helpers
  // --------------------------------------------

  // Fetch current waitlist enabled status & basic stats
  const fetchWaitlistStatus = useCallback(async () => {
    try {
      const data = await apiCall('/admin/waitlist/status');
      if (isSuccessfulResponse(data)) {
        const payload = extractPayload(data);
        // payload shape: { waitlistEnabled, stats }
        const enabled = payload?.waitlistEnabled;
        if (typeof enabled === 'boolean') {
          setSettings(prev => ({ ...prev, waitlist_enabled: enabled }));
        }
        return payload;
      }
      throw new Error(data.message || 'Failed to fetch waitlist status');
    } catch (error) {
      console.error('Error fetching waitlist status:', error);
      toast.error(error.message || 'Failed to fetch waitlist status');
      return null;
    }
  }, [apiCall]);

  // Toggle waitlist enabled status
  const toggleWaitlistStatus = useCallback(async (enabled, reason = '') => {
    try {
      const data = await apiCall('/admin/waitlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled, reason })
      });
      if (isSuccessfulResponse(data)) {
        const payload = extractPayload(data);
        const resolvedPayload = payload || data.data || {};
        const newEnabledStatus = !!resolvedPayload?.waitlistEnabled;
        // Ensure local state sync
        setSettings(prev => ({ ...prev, waitlist_enabled: newEnabledStatus }));
        toast.success(`Waitlist ${newEnabledStatus ? 'enabled' : 'disabled'} successfully`);
        
        // Dispatch a global event to notify other parts of the app (like the Header)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('waitlist:toggle', { detail: { enabled: newEnabledStatus } }));
        }

        return true;
      }
      throw new Error(data.message || 'Failed to toggle waitlist');
    } catch (error) {
      console.error('Error toggling waitlist:', error);
      toast.error(error.message || 'Failed to toggle waitlist');
      return false;
    }
  }, [apiCall]);

  // Fetch system settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/waitlist/settings');
      
      if (isSuccessfulResponse(data)) {
        // Handle cases where API returns { data: {...} }
        const payload = data.data ? data.data : extractPayload(data);
        
        if (!payload) {
          throw new Error('Invalid response payload');
        }

        const defaultSettings = {
          waitlist_enabled: false,
          auto_approve_creators: false,
          referral_system_enabled: true,
        };

        const mergedSettings = { ...defaultSettings, ...payload };

        // Ensure toggle values are booleans in case the API returns strings
        const toBool = (val) => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') return val.toLowerCase() === 'true';
          if (typeof val === 'number') return val === 1;
          return Boolean(val);
        };

        const sanitizedSettings = {
          ...mergedSettings,
          waitlist_enabled: toBool(mergedSettings.waitlist_enabled),
          auto_approve_creators: toBool(mergedSettings.auto_approve_creators),
          referral_system_enabled: toBool(mergedSettings.referral_system_enabled),
        };

        setSettings(sanitizedSettings);
      } else {
        throw new Error(data.message || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Save system settings
  const saveSettings = useCallback(async (newSettings) => {
    setSaving(true);
    try {
      const data = await apiCall('/admin/waitlist/settings', {
        method: 'PATCH',
        body: JSON.stringify({ settings: newSettings })
      });
      if (isSuccessfulResponse(data)) {
        // Fix: Handle the nested data structure from backend
        // Backend returns: { data: { data: { actual_settings_object } } }
        const payload = data.data?.data || extractPayload(data);
        setSettings(payload); // Update state with the full object from backend
        toast.success('Settings saved successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [apiCall]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await apiCall('/admin/waitlist/analytics');
      
      if (isSuccessfulResponse(data)) {
        const payload = extractPayload(data);
        if (!payload) {
          throw new Error('Invalid analytics payload');
        }
        setAnalytics(payload);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics');
    }
  }, [apiCall]);

  // Update a single setting
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset positions
  const resetPositions = useCallback(async () => {
    if (confirm('Are you sure you want to reset all waitlist positions? This cannot be undone.')) {
      try {
        const data = await apiCall('/admin/waitlist/reset-positions', {
          method: 'POST'
        });
        
        if (isSuccessfulResponse(data)) {
          toast.success(`Successfully reset positions for ${data.data?.resetCount || 0} entries`);
          await fetchSettings();
          return true;
        } else {
          throw new Error(data.message || 'Failed to reset positions');
        }
      } catch (error) {
        console.error('Error resetting positions:', error);
        toast.error(error.message || 'Failed to reset positions');
        return false;
      }
    }
    return false;
  }, [apiCall, fetchSettings]);

  // Clear all data
  const clearData = useCallback(async () => {
    if (confirm('Are you sure you want to clear all waitlist data? This cannot be undone.')) {
      try {
        const data = await apiCall('/admin/waitlist/clear-data', {
          method: 'POST',
          body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' })
        });
        
        if (isSuccessfulResponse(data)) {
          toast.success(`Successfully cleared ${data.data?.deletedCount || 0} entries`);
          await fetchSettings();
          return true;
        } else {
          throw new Error(data.message || 'Failed to clear data');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error(error.message || 'Failed to clear data');
        return false;
      }
    }
    return false;
  }, [apiCall, fetchSettings]);

  // Refresh all data (settings, analytics, status)
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchSettings(),
      fetchAnalytics(),
      fetchWaitlistStatus()
    ]);
  }, [fetchSettings, fetchAnalytics, fetchWaitlistStatus]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = {
    // State
    settings,
    analytics,
    loading,
    saving,
    
    // Actions
    fetchSettings,
    saveSettings,
    fetchAnalytics,
    updateSetting,
    resetPositions,
    clearData,
    refreshData,
    fetchWaitlistStatus,
    toggleWaitlistStatus,
  };

  return (
    <AdminWaitlistContext.Provider value={value}>
      {children}
    </AdminWaitlistContext.Provider>
  );
};

export default AdminWaitlistContext; 