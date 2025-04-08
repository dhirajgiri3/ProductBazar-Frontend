import api from '../Utils/api';
import logger from '../Utils/logger';

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
    // Silent fail - don't interrupt user experience for tracking errors
    return { success: false, error: error.message };
  }
};

/**
 * Update view duration and engagement metrics after a user leaves the page
 * @param {string} productId - The ID of the product viewed
 * @param {number} startTime - The timestamp when the view started
 * @param {Object} engagementData - Additional engagement data
 * @returns {Promise} Promise object representing the API response
 */
export const updateViewDuration = async (productId, startTime, engagementData = {}) => {
  try {
    if (!productId || !startTime) return;
    
    const viewDuration = Math.floor((Date.now() - startTime) / 1000); // duration in seconds
    if (viewDuration < 1) return; // Ignore very short views
    
    const payload = {
      viewDuration,
      ...engagementData
    };
    
    const response = await api.post(`/views/product/${productId}/duration`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating view duration:', error);
    // Silent fail - likely happens during page unload
    return { success: false, error: error.message };
  }
};

/**
 * Record view duration when user leaves the page
 * @param {string} productId - The ID of the product
 * @param {number} startTime - The timestamp when the view started
 * @param {string} exitPage - The page the user navigated to
 * @returns {Promise} Promise object representing the API response
 */
export const recordViewDuration = async (productId, startTime, exitPage = null) => {
  try {
    if (!productId || !startTime) return;
    
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
    
    // Build query string for options
    const params = new URLSearchParams();
    if (options.days) params.append('days', options.days);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/views/product/${productId}/stats${queryString}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch view statistics');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching view stats for product ${productId}:`, error);
    // Return a structured error response instead of throwing
    return {
      success: false,
      error: error.message || 'Failed to fetch view statistics',
      stats: {
        // Provide fallback empty data structure
        totals: { totalViews: 0, uniqueViewers: 0 },
        dailyViews: [],
        devices: [],
        sources: [],
        referrers: [],
        engagementMetrics: {
          totalViews: 0,
          uniqueViewers: 0,
          averageViewDuration: 0
        },
        insights: {
          summary: ['No data available.'],
          recommendations: []
        }
      }
    };
  }
};

/**
 * Get device analytics for a product
 * @param {string} productId - The ID of the product
 * @param {Object} options - Options for fetching analytics
 * @param {number} options.days - Number of days to include in the analytics
 * @returns {Promise} Promise object representing the API response
 */
export const getProductDeviceAnalytics = async (productId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.days) params.append('days', options.days);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/views/product/${productId}/devices${queryString}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching device analytics for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get user engagement metrics
 * @param {string} userId - The ID of the user (optional - defaults to current user)
 * @param {number} days - Number of days to include in the metrics
 * @returns {Promise} Promise object representing the API response
 */
export const getUserEngagementMetrics = async (userId = null, days = 30) => {
  try {
    const endpoint = userId ? `/views/user/${userId}/engagement` : '/views/engagement';
    const response = await api.get(`${endpoint}?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw error;
  }
};

/**
 * Clear user view history
 * @returns {Promise} Promise object representing the API response
 */
export const clearUserViewHistory = async () => {
  try {
    const response = await api.delete('/views/history');
    return response.data;
  } catch (error) {
    console.error('Error clearing view history:', error);
    throw error;
  }
};

/**
 * Get popular products based on views
 * @param {number} limit - Number of products to return
 * @param {string} period - Time period ('day', 'week', 'month', 'year')
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
 * Get related products based on co-viewing patterns
 * @param {string} productId - The ID of the product
 * @param {number} limit - Number of products to return
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
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
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
 * Get product engagement metrics
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