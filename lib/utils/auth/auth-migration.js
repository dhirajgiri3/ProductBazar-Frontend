/**
 * Migration utility for transitioning from localStorage to sessionStorage for access tokens
 * This ensures a smooth transition for existing users
 */

import { setAuthToken, removeAuthToken } from './auth-utils.js';
import logger from '../logger.js';

/**
 * Migrate access token from localStorage to sessionStorage
 * This should be called during app initialization
 */
export const migrateAccessToken = () => {
  if (typeof window === 'undefined') return;

  try {
    // Check if token exists in localStorage (old storage)
    const oldToken = localStorage.getItem('accessToken');
    
    if (oldToken) {
      // Validate the old token
      const isValidToken = (token) => {
        if (!token || typeof token !== 'string') return false;
        if (token.length < 50) return false; // Minimum JWT length
        
        // Check if it's a valid JWT format (3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        return true;
      };

      if (isValidToken(oldToken)) {
        // Try to store in sessionStorage using the new utility
        const stored = setAuthToken(oldToken);
        
        if (stored) {
          // Remove from localStorage after successful migration
          localStorage.removeItem('accessToken');
          logger.info('Successfully migrated access token from localStorage to sessionStorage');
        } else {
          logger.warn('Failed to migrate access token - token validation failed');
          // Remove invalid token from localStorage
          localStorage.removeItem('accessToken');
        }
      } else {
        logger.warn('Invalid access token found in localStorage, removing');
        localStorage.removeItem('accessToken');
      }
    }
  } catch (error) {
    logger.error('Error during access token migration:', error);
  }
};

/**
 * Clean up any remaining auth-related localStorage items
 * This removes any legacy auth data that should be in sessionStorage
 */
export const cleanupLegacyAuthData = () => {
  if (typeof window === 'undefined') return;

  try {
    const legacyKeys = [
      'accessToken', // Should be in sessionStorage now
      'auth_token', // Alternative naming
      'token', // Generic token key
    ];

    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        logger.info(`Removing legacy auth key from localStorage: ${key}`);
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    logger.error('Error during legacy auth data cleanup:', error);
  }
};

/**
 * Initialize auth migration
 * Call this during app startup
 */
export const initializeAuthMigration = () => {
  if (typeof window === 'undefined') return;

  try {
    // Migrate access token
    migrateAccessToken();
    
    // Clean up legacy data
    cleanupLegacyAuthData();
    
    logger.info('Auth migration completed successfully');
  } catch (error) {
    logger.error('Error during auth migration initialization:', error);
  }
};

export default {
  migrateAccessToken,
  cleanupLegacyAuthData,
  initializeAuthMigration,
}; 