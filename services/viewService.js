import api from '../Utils/api';
import { useEffect } from 'react';

/**
 * Record a product view 
 * @param {string} productId - The ID of the product being viewed
 * @param {Object} viewData - Data about the view (source, referrer, etc.)
 * @returns {Promise} Promise object representing the API response
 */
export const recordProductView = async (productId, viewData = {}) => {
  try {
    // Get referrer information
    const referrer = typeof document !== 'undefined' ? (document.referrer || window.location.pathname) : '';
    
    // Merge provided data with automatically detected data
    const viewPayload = {
      source: viewData.source || 'direct',
      referrer: viewData.referrer || referrer,
      recommendationType: viewData.recommendationType || null,
      position: viewData.position || null,
      ...viewData,
    };
    
    const response = await api.post(`/views/product/${productId}`, viewPayload);
    return response.data;
  } catch (error) {
    console.error('Error recording product view:', error);
    // Don't throw the error - recording a view shouldn't break the user experience
    return { success: false, error: error.message };
  }
};

/**
 * Update view duration for a product
 * @param {string} productId - The ID of the product being viewed
 * @param {number} viewDuration - Duration of the view in seconds
 * @param {string} exitPage - Where the user navigated to after viewing
 * @returns {Promise} Promise object representing the API response
 */
export const updateViewDuration = async (productId, viewDuration, exitPage = null) => {
  try {
    // Avoid updating for very short views
    if (viewDuration < 2) return;
    
    const payload = { viewDuration, exitPage };
    
    // Use sendBeacon for reliability if this is called during page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api/v1';
        const url = `${baseUrl}/views/product/${productId}`;
        navigator.sendBeacon(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        return { success: true };
      } catch (e) {
        // Fallback to regular API call if sendBeacon fails
        console.error('SendBeacon failed:', e);
      }
    }
    
    // Regular API call
    const response = await api.put(`/views/product/${productId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating view duration:', error);
    // Don't throw the error - this shouldn't break the user experience
    return { success: false, error: error.message };
  }
};

/**
 * Record view duration when user leaves the page
 * @param {string} productId - The ID of the product being viewed
 * @param {number} startTime - Timestamp when view started
 * @param {string} exitPage - The page the user is navigating to
 */
export const recordViewDuration = async (productId, startTime, exitPage = null) => {
  try {
    const viewDuration = Math.floor((Date.now() - startTime) / 1000); // duration in seconds
    
    if (viewDuration < 1) return; // Ignore very short views
    
    const viewPayload = {
      viewDuration,
      exitPage: exitPage || (typeof window !== 'undefined' ? window.location.pathname : ''),
    };
    
    // Use a beacon for reliability during page unload if in browser
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(viewPayload)], { type: 'application/json' });
      navigator.sendBeacon(`/api/views/product/${productId}/duration`, blob);
    } else {
      // Fallback to standard request
      await api.post(`/views/product/${productId}/duration`, viewPayload);
    }
  } catch (error) {
    console.error('Error recording view duration:', error);
    // Silent fail - this happens during page unload
  }
};

/**
 * Get user's view history
 * @param {number} page - The page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} Promise object representing the API response
 */
export const getUserViewHistory = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/views/history?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching view history:', error);
    throw error;
  }
};

/**
 * Get product view statistics (for product owners)
 * @param {string} productId - The ID of the product
 * @param {Object} options - Options for fetching stats
 * @param {number} options.days - Number of days to include in the stats
 * @returns {Promise} Promise object representing the API response
 */
export const getProductViewStats = async (productId, options = {}) => {
  try {
    // Validate the product ID before making the request
    if (!productId || typeof productId !== 'string') {
      console.error('Invalid product ID provided to getProductViewStats:', productId);
      throw new Error('Invalid product ID');
    }

    // Format the days parameter properly
    const days = options.days || 7;
    
    const response = await api.get(`/views/product/${productId}/stats?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product view stats:', error);
    
    // Check for specific error types and provide more helpful messages
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Product not found or you may not have permission to view these statistics');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view these statistics');
      }
    }
    
    throw error;
  }
};

/**
 * Get product device analytics (for product owners)
 * @param {string} productId - The ID of the product
 * @param {number} days - Number of days to include in the analytics
 * @returns {Promise} Promise object representing the API response
 */
export const getProductDeviceAnalytics = async (productId, days = 30) => {
  try {
    const response = await api.get(`/views/product/${productId}/devices?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product device analytics:', error);
    throw error;
  }
};

/**
 * Get user engagement metrics
 * @param {string} userId - The ID of the user (optional, uses current user if not provided)
 * @param {number} days - Number of days to include in the metrics
 * @returns {Promise} Promise object representing the API response
 */
export const getUserEngagementMetrics = async (userId = null, days = 30) => {
  try {
    const url = userId 
      ? `/views/user/${userId}/engagement?days=${days}`
      : `/views/user/engagement?days=${days}`;
      
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw error;
  }
};

/**
 * Clear user's view history
 * @returns {Promise} Promise object representing the API response
 */
export const clearUserViewHistory = async () => {
  try {
    const response = await api.delete(`/views/history`);
    return response.data;
  } catch (error) {
    console.error('Error clearing view history:', error);
    throw error;
  }
};

/**
 * Get popular products
 * @param {number} limit - Number of products to return
 * @param {string} period - Time period for popularity (day, week, month, year)
 * @returns {Promise} Promise object representing the API response
 */
export const getPopularProducts = async (limit = 10, period = 'week') => {
  try {
    const response = await api.get(`/views/popular?limit=${limit}&period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

/**
 * Get related products based on view history
 * @param {string} productId - The ID of the product to find related items for
 * @param {number} limit - Number of related products to return
 * @returns {Promise} Promise object representing the API response
 */
export const getRelatedProducts = async (productId, limit = 5) => {
  try {
    const response = await api.get(`/views/related/${productId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
};

/**
 * Get admin daily analytics
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Promise object representing the API response
 */
export const getAdminDailyAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/views/analytics/daily?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    throw error;
  }
};

/**
 * Calculate engagement metrics for a product
 * @param {string} productId - The ID of the product
 * @param {number} days - Number of days to include in the metrics
 * @returns {Promise} Promise object representing the API response
 */
export const getProductEngagementMetrics = async (productId, days = 30) => {
  try {
    const response = await api.get(`/views/product/${productId}/engagement?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product engagement metrics:', error);
    throw error;
  }
};

/**
 * React hook for tracking product views
 * @param {string} productId - The ID of the product being viewed
 * @param {Object} viewData - Additional data about the view
 * @returns {void}
 */
export const useProductView = (productId, viewData = {}) => {
  useEffect(() => {
    if (!productId) return;
    
    const startTime = Date.now();
    
    // Record the initial view
    recordProductView(productId, viewData);
    
    // Return cleanup function to record view duration when component unmounts
    return () => {
      if (productId) {
        recordViewDuration(productId, startTime);
      }
    };
  }, [productId]); // Only re-run if productId changes
};

export default {
  recordProductView,
  updateViewDuration,
  recordViewDuration,
  getUserViewHistory,
  getProductViewStats,
  getProductDeviceAnalytics,
  getUserEngagementMetrics,
  clearUserViewHistory,
  getPopularProducts,
  getRelatedProducts,
  getAdminDailyAnalytics,
  getProductEngagementMetrics,
  useProductView
};