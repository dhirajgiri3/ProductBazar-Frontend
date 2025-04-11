import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send cookies with requests
});

// Request deduplication to prevent multiple identical calls
const pendingRequests = new Map();

// Helper to create a request ID that ignores timestamp parameters
const createRequestId = (config) => {
  if (!config) return 'unknown';

  // Create a copy of params without timestamp parameters
  const params = { ...(config.params || {}) };

  // Remove timestamp parameters that we add to bust cache
  delete params._t;

  // For priority requests, we want to keep them separate
  const priorityKey = params._priority ? `_priority=${params._priority}` : '';
  delete params._priority;

  // Sort the keys to ensure consistent order regardless of how the object was created
  const sortedParams = {};
  Object.keys(params).sort().forEach(key => {
    sortedParams[key] = params[key];
  });

  return `${config.method || 'unknown'}:${config.url || 'unknown'}:${JSON.stringify(sortedParams)}:${priorityKey}`;
};

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Create a request identifier to prevent duplicates
    // Use our helper function to ignore timestamp parameters
    const requestId = createRequestId(config);

    // Browser-only code
    if (typeof window !== 'undefined') {
      // Add authentication token to requests if available
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Prevent browser caching for GET requests
      if (config.method === 'get') {
        config.params = { ...config.params, _t: Date.now() };
      }

      // Check if this is a high priority request that shouldn't be canceled
      // Look for priority in query params instead of headers to avoid CORS issues
      const isPriorityRequest = config.params && config.params._priority === 'high';

      // Handle duplicate requests - cancel previous ones if not priority
      if (pendingRequests.has(requestId) && !config.skipDuplicateCheck) {
        const pendingRequest = pendingRequests.get(requestId);
        const previousController = pendingRequest.controller;

        // If current request is high priority, cancel the previous one
        // If previous request was high priority, don't cancel it unless current is also high priority
        if (isPriorityRequest || !pendingRequest.isPriority) {
          console.debug(`Canceling previous request: ${requestId}`);
          previousController.abort();
          pendingRequests.delete(requestId);
        } else {
          // If previous is priority and current is not, cancel the current one
          console.debug(`Current request will be canceled in favor of existing priority request: ${requestId}`);

          // Create a controller that we can immediately abort
          const controller = new AbortController();

          // Set a flag to identify this as a canceled request
          // This helps with debugging and error handling
          setTimeout(() => controller.abort(), 0);

          return {
            ...config,
            signal: controller.signal,
            __cancelRequest: true,
            __cancelReason: 'Duplicate request with lower priority'
          };
        }
      }

      // Add the current request to pending
      const controller = new AbortController();

      // If there's an existing signal, create a composite one
      if (config.signal) {
        const originalSignal = config.signal;
        originalSignal.addEventListener('abort', () => controller.abort());
      }

      config.signal = controller.signal;
      pendingRequests.set(requestId, {
        controller,
        isPriority: isPriorityRequest,
        timestamp: Date.now()
      });

      // Clean up after timeout
      setTimeout(() => {
        pendingRequests.delete(requestId);
      }, 30000); // Increased timeout to 30 seconds
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Check if this request was marked for cancellation
    if (response.config.__cancelRequest) {
      // Create a canceled error
      const error = new Error('Request canceled due to duplicate request');
      error.name = 'CanceledError';
      error.code = 'ERR_CANCELED';
      error.config = response.config;
      throw error;
    }

    // Clean up pending request
    // Use our helper function to ignore timestamp parameters
    const requestId = createRequestId(response.config);
    pendingRequests.delete(requestId);
    return response;
  },
  async (error) => {
    // Check if this is a canceled request
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      // For canceled requests, we can add custom handling here
      const reason = error.config?.__cancelReason || 'unknown reason';
      console.debug(`Request was canceled (${reason}):`, error.config?.url);

      // If this was intentionally canceled due to deduplication, we can
      // make this a silent error by setting a flag
      if (error.config?.__cancelRequest) {
        error.isIntentionalCancel = true;
      }
    }

    // Clean up pending request if exists
    if (error.config) {
      // Use our helper function to ignore timestamp parameters
      const requestId = createRequestId(error.config);
      pendingRequests.delete(requestId);
    }

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Skip on refresh token requests to avoid loops
      if (error.config.url !== '/auth/refresh-token') {
        try {
          // Try to refresh the token using HTTP-only cookie
          // The cookie will be automatically sent with the request
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1'}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              // Add cache-busting parameter to avoid cached responses
              params: { _t: Date.now() }
            }
          );

          if (response.data?.data?.accessToken) {
            // Store the new access token
            localStorage.setItem('accessToken', response.data.data.accessToken);

            // Update user data if it's in the response
            if (response.data?.data?.user) {
              localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }

            // Retry original request with new token
            error.config.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return axios(error.config);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);

          // Clear auth state and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken'); // Clean up any old refresh tokens

          // Dispatch logout event for components to respond
          window.dispatchEvent(new Event('auth:logout'));

          // Redirect to login if not already there
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
        }
      }
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      console.warn('Rate limit hit. Please try again later.');

      // Store rate limit info in sessionStorage to help client-side rate limiting
      if (typeof window !== 'undefined') {
        try {
          const endpoint = error.config.url;
          const rateLimitKey = `rate_limited_${endpoint}`;
          sessionStorage.setItem(rateLimitKey, Date.now().toString());

          // Dispatch event for components to respond
          window.dispatchEvent(new CustomEvent('api:rate-limited', {
            detail: { endpoint, timestamp: Date.now() }
          }));
        } catch (e) {
          // Ignore storage errors
        }
      }
    }

    return Promise.reject(error);
  }
);

// Get access token helper
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Debounce utility to prevent rapid API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Utility function to make a request with priority
export const makePriorityRequest = async (method, url, options = {}) => {
  const { params, data, headers = {} } = options;

  // Use query parameter instead of header for priority
  // This avoids CORS preflight issues
  const requestParams = {
    ...params,
    _t: Date.now(),
    _priority: 'high' // Use query param instead of header
  };

  try {
    if (method.toLowerCase() === 'get') {
      return await api.get(url, { params: requestParams, headers });
    } else if (method.toLowerCase() === 'post') {
      return await api.post(url, data, { params: requestParams, headers });
    } else if (method.toLowerCase() === 'put') {
      return await api.put(url, data, { params: requestParams, headers });
    } else if (method.toLowerCase() === 'delete') {
      return await api.delete(url, { params: requestParams, headers, data });
    }
  } catch (error) {
    // Handle canceled requests gracefully
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      console.debug('Priority request was canceled:', url);
    }
    throw error;
  }
};

// Export as default and named export for flexibility
export { api };
export default api;
