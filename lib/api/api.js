// src/utils/api.js
import axios from 'axios';
import { getAuthToken, setAuthToken, removeAuthToken, shouldRefreshToken } from '../utils/auth/auth-utils.js';

// Constants for token refresh
const REFRESH_COOLDOWN = 5000; // 5 seconds between refresh attempts
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const NO_RETRY_ERROR_CODES = ['INVALID_REFRESH_TOKEN', 'REFRESH_TOKEN_EXPIRED', 'USER_NOT_FOUND'];

// Track refresh attempts to prevent spam
let refreshAttemptTimestamp = 0;

// Implement a simple request cache
const cache = {
  data: new Map(),
  get(key) {
    const cachedItem = this.data.get(key);
    if (!cachedItem) return null;
    
    // Check if cache entry is still valid (2 seconds)
    if (Date.now() - cachedItem.timestamp < 2000) {
      return cachedItem.data;
    }
    
    // Remove expired cache entry
    this.data.delete(key);
    return null;
  },
  set(key, data) {
    this.data.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  invalidate(url) {
    // Delete specific URL or pattern
    if (url) {
      for (const key of this.data.keys()) {
        if (key.includes(url)) {
          this.data.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.data.clear();
    }
  }
};

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to automatically add Authorization header
api.interceptors.request.use(
  (config) => {
    // Support for caching (check if the request should use cache)
    if (config.useCache && config.method?.toLowerCase() === 'get') {
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.headers)}`;
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse) {
        // This flag is used in the response interceptor
        config.cachedResponse = cachedResponse;
      }
    }
    
    // Get token using the new auth utilities
    const token = getAuthToken();
    if (token) {
      // Ensure we're setting the header correctly with Bearer prefix
      config.headers['Authorization'] = `Bearer ${token}`;

      // Log token presence for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Request with auth token:', config.url);
      }
    } else {
      // Log missing token for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Request without auth token:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Check if we should attempt to refresh the token
 */
const shouldAttemptRefresh = () => {
  const now = Date.now();
  if (now - refreshAttemptTimestamp < REFRESH_COOLDOWN) {
    return false;
  }
  
  // Check if token is expiring soon using the new utility
  return shouldRefreshToken();
};

/**
 * Handle unauthorized errors consistently
 */
const handleUnauthorizedError = (message, status, errorCode) => {
  // Clear tokens using the new auth utilities
  removeAuthToken();

  window.dispatchEvent(new CustomEvent('auth:unauthorized', {
    detail: {
      message: message || 'Your session has expired. Please log in again to continue.',
      code: status,
      errorCode
    }
  }));
};

// Add response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => {
    // If this was a cached response, return it directly
    if (response.config.cachedResponse) {
      return response.config.cachedResponse;
    }
    
    // Cache successful GET requests if requested
    if (response.config.useCache && response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}:${JSON.stringify(response.config.headers)}`;
      cache.set(cacheKey, response);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration with refresh
    if (!originalRequest._retry && error.response?.status === 401 && shouldAttemptRefresh()) {
      // Check for specific error codes that indicate we shouldn't retry
      const errorCode = error.response.data?.code || '';

      if (NO_RETRY_ERROR_CODES.includes(errorCode)) {
        // Clear tokens and trigger logout
        handleUnauthorizedError(error.response.data?.message, error.response.status, errorCode);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttemptTimestamp = Date.now();

      try {
        console.debug('API Interceptor: Access token expired. Attempting to refresh token...');
        const { data } = await api.post('/auth/refresh-token', {}, { withCredentials: true });

        if (data.success && data.data.accessToken) {
          const newAccessToken = data.data.accessToken;
          const refreshedUser = data.data.user; // Assuming user data is also returned

          // Store the new token using the new auth utilities
          const tokenStored = setAuthToken(newAccessToken);
          if (!tokenStored) {
            console.warn('Failed to store refreshed token');
            handleUnauthorizedError('Failed to store refreshed token', 401, 'TOKEN_STORE_FAILED');
            return Promise.reject(error);
          }

          console.debug('API Interceptor: Token refresh successful. Updating Authorization header and retrying original request.');
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // Dispatch an event so AuthContext can update its state
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
            detail: { accessToken: newAccessToken, user: refreshedUser },
          }));

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return api(originalRequest); // Retry the original request with the new token
        } else {
          // Refresh token failed (e.g., refresh token invalid)
          console.warn('API Interceptor: Token refresh was not successful.', data.message);
          handleUnauthorizedError('Refresh token failed', 401, 'REFRESH_FAILED');
          processQueue(new Error('Refresh token failed'));
          isRefreshing = false;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('API Interceptor: Token refresh failed:', refreshError);
        handleUnauthorizedError('Token refresh failed', 401, 'REFRESH_ERROR');
        processQueue(refreshError);
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Notify about token refresh (for backward compatibility)
 */
const notifyTokenRefreshed = (token, userData) => {
  window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
    detail: { accessToken: token, user: userData }
  }));
};

export const makePriorityRequest = async (method, url, options = {}) => {
  const { 
    params, 
    data, 
    headers = {}, 
    isFormData = false, 
    timeout = 15000, 
    retryCount = 0, 
    _isRetry = false,
    useCache = false  // New option to enable caching
  } = options;

  // User authentication endpoints should use caching to prevent duplicate calls
  const shouldUseCache = useCache || url.includes('/auth/me');
  
  // Check cache first for GET requests that should use cache
  let cacheKey;
  if (method.toLowerCase() === 'get' && shouldUseCache) {
    cacheKey = `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(headers)}`;
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.debug('Returning cached response for:', cacheKey);
      return cachedResponse;
    }
  }

  // Get token using the new auth utilities
  const token = getAuthToken();

  const config = {
    params: { ...params, _t: Date.now() },
    headers: {
      ...headers,
      // Add Authorization header if token exists
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    timeout,
    withCredentials: true,
  };

  if (isFormData || (data instanceof FormData)) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  if (data && !isFormData) {
    config.data = data;
  }

  try {
    const response = await api({
      method,
      url,
      ...config,
      useCache: shouldUseCache
    });

    return response;
  } catch (error) {
    // Handle token expiration with refresh
    if (!_isRetry && error.response?.status === 401 && shouldAttemptRefresh()) {
      // Check for specific error codes that indicate we shouldn't retry
      const errorCode = error.response.data?.code || '';

      if (NO_RETRY_ERROR_CODES.includes(errorCode)) {
        // Clear tokens and trigger logout
        handleUnauthorizedError(error.response.data?.message, error.response.status, errorCode);
        throw error;
      }

      try {
        // Try to refresh the token - use api instance instead of axios directly
        const refreshResponse = await api.post(
          '/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          // Update token using the new auth utilities
          const newToken = refreshResponse.data.data.accessToken;
          const tokenStored = setAuthToken(newToken);
          
          if (!tokenStored) {
            console.warn('Failed to store refreshed token');
            handleUnauthorizedError('Failed to store refreshed token', 401, 'TOKEN_STORE_FAILED');
            throw error;
          }

          // Get user data if available
          const userData = refreshResponse.data.data.user;

          // Update user data in localStorage if available
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }

          // Notify the application about the token refresh
          notifyTokenRefreshed(newToken, userData);

          // Retry the original request with the new token
          return makePriorityRequest(method, url, {
            ...options,
            _isRetry: true // Mark as a retry to prevent infinite loops
          });
        } else {
          // Handle unsuccessful refresh
          handleUnauthorizedError(
            refreshResponse.data.message,
            error.response.status,
            refreshResponse.data.code
          );
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        handleUnauthorizedError('Token refresh failed', 401, 'REFRESH_ERROR');
        throw error;
      }
    }

    throw error;
  }
};

export default api;