"use client";

/**
 * Utility functions to clean up stale data and prevent memory leaks
 */

/**
 * Cleans up stale recommendation data from sessionStorage
 * This helps prevent excessive API calls due to stale rate limiting data
 */
export const cleanupRecommendationData = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Get all keys from sessionStorage
    const keys = Object.keys(sessionStorage);
    
    // Find and remove stale recommendation-related data
    const recommendationKeys = keys.filter(key => 
      key.startsWith('request_count_') || 
      key.startsWith('last_api_request_') ||
      key.startsWith('rate_limit_warning_shown_') ||
      key.startsWith('feed_distribution_')
    );
    
    // Remove stale keys
    recommendationKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    if (recommendationKeys.length > 0 && process.env.NODE_ENV === 'development') {
      console.log(`Cleaned up ${recommendationKeys.length} stale recommendation items from sessionStorage`);
    }
  } catch (error) {
    // Ignore errors in cleanup
    console.error('Error cleaning up recommendation data:', error);
  }
};

/**
 * Cleans up stale socket data from localStorage
 */
export const cleanupSocketData = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Reset socket-related data in localStorage
    const socketKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('socket_') || 
      key.includes('_socket_')
    );
    
    socketKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (socketKeys.length > 0 && process.env.NODE_ENV === 'development') {
      console.log(`Cleaned up ${socketKeys.length} stale socket items from localStorage`);
    }
  } catch (error) {
    // Ignore errors in cleanup
    console.error('Error cleaning up socket data:', error);
  }
};

/**
 * Run all cleanup functions
 * Call this on application startup
 */
export const runAllCleanup = () => {
  cleanupRecommendationData();
  cleanupSocketData();
};

export default runAllCleanup;
