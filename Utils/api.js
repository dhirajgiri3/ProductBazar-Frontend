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

// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
  api.interceptors.request.use(request => {
    console.log('API Request:', request.method.toUpperCase(), request.url);
    return request;
  });

  api.interceptors.response.use(response => {
    console.log('API Response:', response.status, response.config.method.toUpperCase(), response.config.url);
    return response;
  }, error => {
    console.error('API Error:', error.response?.status || error.message, error.config?.method?.toUpperCase(), error.config?.url);
    return Promise.reject(error);
  });
}

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
  async (config) => {
    // Don't modify Content-Type for multipart/form-data requests
    // This is important for file uploads
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      // For multipart/form-data, let the browser set the Content-Type and boundary
      delete config.headers['Content-Type'];
    }

    // Create a request identifier to prevent duplicates
    // Use our helper function to ignore timestamp parameters
    const requestId = createRequestId(config);

    // Browser-only code
    if (typeof window !== 'undefined') {
      // Check for global rate limiting
      try {
        const globalRateLimitStr = sessionStorage.getItem('global_rate_limit');
        const globalRetryStr = sessionStorage.getItem('global_rate_limit_retry');

        if (globalRateLimitStr && globalRetryStr) {
          const now = Date.now();
          const globalRetry = parseInt(globalRetryStr);

          // If we're in global rate limit and it's not a priority request
          if (now < globalRetry && !config.params?._priority && !config.skipRateLimit) {
            const waitTime = globalRetry - now;
            console.log(`Waiting ${waitTime}ms due to global rate limit`);

            // Wait for the global rate limit to expire
            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
          }
        }

        // Check endpoint-specific rate limiting
        const endpoint = config.url;
        const rateLimitRetryStr = sessionStorage.getItem(`rate_limit_retry_${endpoint}`);

        if (rateLimitRetryStr && !config.params?._priority && !config.skipRateLimit) {
          const now = Date.now();
          const retryTime = parseInt(rateLimitRetryStr);

          if (now < retryTime) {
            const waitTime = retryTime - now;
            console.log(`Waiting ${waitTime}ms due to endpoint rate limit for ${endpoint}`);

            // Wait for the endpoint rate limit to expire
            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
          }
        }
      } catch (e) {
        // Ignore storage errors
      }

      // Add authentication token to requests if available
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Only add timestamp for GET requests if not already present
      // This helps reduce unnecessary cache busting
      if (config.method === 'get' && !config.params?._t) {
        // Use a more stable timestamp that changes less frequently
        // This helps with caching while still preventing stale data
        // Changes every 10 seconds instead of every millisecond
        const stableTimestamp = Math.floor(Date.now() / 10000) * 10000;
        config.params = { ...config.params, _t: stableTimestamp };
      }

      // Check if this is a high priority request that shouldn't be canceled
      // Look for priority in query params instead of headers to avoid CORS issues
      const isPriorityRequest = (config.params && config.params._priority === 'high') || config.skipDuplicateCheck;

      // Handle duplicate requests - cancel previous ones if not priority
      if (pendingRequests.has(requestId) && !config.skipDuplicateCheck) {
        const pendingRequest = pendingRequests.get(requestId);
        const previousController = pendingRequest.controller;

        // If current request is high priority, cancel the previous one
        // If previous request was high priority, don't cancel it unless current is also high priority
        if (isPriorityRequest || !pendingRequest.isPriority) {
          // Only log in development mode and when not a common request pattern
          if (process.env.NODE_ENV === 'development' && !requestId.includes('/products/') && !requestId.includes('/comments')) {
            console.debug(`Canceling previous request: ${requestId}`);
          }
          previousController.abort('Canceled due to duplicate request with higher priority');
          pendingRequests.delete(requestId);
        } else {
          // If previous is priority and current is not, cancel the current one
          // Only log in development mode and when not a common request pattern
          if (process.env.NODE_ENV === 'development' && !requestId.includes('/products/') && !requestId.includes('/comments')) {
            console.debug(`Current request will be canceled in favor of existing priority request: ${requestId}`);
          }

          // Create a controller that we can immediately abort
          const controller = new AbortController();

          // Set a flag to identify this as a canceled request
          // This helps with debugging and error handling
          setTimeout(() => controller.abort('Canceled due to duplicate request with higher priority'), 0);

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
      const reason = error.config?.__cancelReason || 'navigation or component unmount';

      // Only log in development mode and only if it's not a common navigation cancellation
      // Also filter out common product and comment requests
      if (process.env.NODE_ENV === 'development' &&
          error.config?.__cancelRequest &&
          error.config?.url &&
          !error.config.url.includes('/products/') &&
          !error.config.url.includes('/comments')) {
        console.debug(`Request was canceled (${reason}):`, error.config?.url);
      }

      // If this was intentionally canceled due to deduplication, we can
      // make this a silent error by setting a flag
      if (error.config?.__cancelRequest) {
        error.isIntentionalCancel = true;
      }

      // Set a flag to indicate this is a navigation or unmount cancellation
      error.isNavigationCancel = true;
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
        // Check if this is a public endpoint that should work without auth
        const publicEndpoints = [
          '/jobs',
          '/products',
          '/categories',
          '/trending',
          '/search'
        ];

        const url = error.config.url;
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          url === endpoint || url.startsWith(`${endpoint}/`)
        );

        if (isPublicEndpoint && error.config.method === 'get') {
          // For public GET endpoints, we'll retry without auth
          console.warn(`Auth error on public endpoint ${url}, retrying as guest`);
          delete error.config.headers.Authorization;
          return axios(error.config);
        }

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

          // Only redirect to login for non-public pages
          if (!isPublicEndpoint && window.location.pathname !== '/auth/login') {
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
          const now = Date.now();
          sessionStorage.setItem(rateLimitKey, now.toString());

          // Track global rate limit to prevent all requests for a short period
          sessionStorage.setItem('global_rate_limit', now.toString());

          // Get retry-after header if available
          const retryAfter = error.response.headers['retry-after'];
          const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Default to 5 seconds

          // Store when we can retry
          sessionStorage.setItem(`rate_limit_retry_${endpoint}`, (now + retryMs).toString());
          sessionStorage.setItem('global_rate_limit_retry', (now + 2000).toString()); // Global shorter cooldown

          // Dispatch event for components to respond
          window.dispatchEvent(new CustomEvent('api:rate-limited', {
            detail: {
              endpoint,
              timestamp: now,
              retryAfter: retryMs
            }
          }));

          // If this is a priority request, we might want to retry after delay
          if (error.config.params?._priority === 'high') {
            console.log(`Will retry priority request to ${endpoint} after ${retryMs}ms`);

            // For important requests, we can retry automatically after the retry period
            return new Promise(resolve => {
              setTimeout(() => {
                console.log(`Retrying priority request to ${endpoint}`);
                // Remove the rate limit flag before retrying
                delete error.config.params._t; // Remove timestamp to get a fresh one
                resolve(axios(error.config));
              }, retryMs);
            });
          }
        } catch (e) {
          // Ignore storage errors
          console.error('Error handling rate limit:', e);
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
  const { params, data, headers = {}, isFormData = false, timeout, signal, retryCount = 0, delay = 0 } = options;

  // Generate a unique request ID for tracking
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Apply delay if specified to stagger requests
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Use query parameter instead of header for priority
  // This avoids CORS preflight issues
  const requestParams = {
    ...params,
    // Only add timestamp if not already present to avoid cache busting on every request
    _t: params?._t || Date.now(),
    _priority: 'high', // Use query param instead of header
    _reqId: requestId // Add request ID for tracking
  };

  // Create a new AbortController if one wasn't provided
  let localAbortController;
  let compositeSignal = signal;

  if (!signal) {
    localAbortController = new AbortController();
    compositeSignal = localAbortController.signal;
  }

  // Set up request timeout
  const requestTimeout = timeout || 15000; // Default to 15 seconds
  const timeoutId = setTimeout(() => {
    if (localAbortController) {
      console.warn(`Request timeout (${requestId}): ${method.toUpperCase()} ${url}`);
      localAbortController.abort('Request timeout');
    }
  }, requestTimeout);

  // Set up request config
  const config = {
    params: requestParams,
    headers: { ...headers },
    timeout: requestTimeout,
    signal: compositeSignal, // Use our composite signal
    skipDuplicateCheck: true, // Skip the duplicate check for priority requests
    skipRateLimit: true, // Skip rate limit checks for priority requests
    metadata: { requestId } // Add metadata for tracking
  };

  // Handle FormData correctly
  if (isFormData || (data instanceof FormData)) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  // Add exponential backoff for retries
  if (retryCount > 0) {
    const backoffTime = Math.min(Math.pow(2, retryCount) * 100, 10000); // Max 10 seconds
    await new Promise(resolve => setTimeout(resolve, backoffTime));
  }

  // Log the request (only in development and not for common endpoints)
  if (process.env.NODE_ENV === 'development' && !url.includes('/products/') && !url.includes('/comments')) {
    console.log(`Priority request (${requestId}): ${method.toUpperCase()} ${url}`);
  }

  try {
    let response;

    if (method.toLowerCase() === 'get') {
      response = await api.get(url, config);
    } else if (method.toLowerCase() === 'post') {
      response = await api.post(url, data, config);
    } else if (method.toLowerCase() === 'put') {
      response = await api.put(url, data, config);
    } else if (method.toLowerCase() === 'patch') {
      response = await api.patch(url, data, config);
    } else if (method.toLowerCase() === 'delete') {
      response = await api.delete(url, { ...config, data });
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }

    // Clear the timeout since we got a response
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Log successful response (only in development and not for common endpoints)
    if (process.env.NODE_ENV === 'development' && !url.includes('/products/') && !url.includes('/comments')) {
      console.log(`Priority request successful (${requestId}): ${method.toUpperCase()} ${url}`);
    }

    return response;
  } catch (error) {
    // Always clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Add request ID to the error for better debugging
    error.requestId = requestId;

    // Handle canceled requests gracefully
    if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      // Check if it was our timeout that caused the abort
      const isTimeout = error.message?.includes('timeout') || error.message?.includes('Request timeout');

      if (isTimeout) {
        console.warn(`Request timeout (${requestId}): ${method.toUpperCase()} ${url}`);
        error.isTimeout = true;
        error.message = `Request timeout after ${requestTimeout}ms: ${method.toUpperCase()} ${url}`;
      } else {
        // Only log in development mode and for non-common requests
        if (process.env.NODE_ENV === 'development' && !url.includes('/products/') && !url.includes('/comments')) {
          console.debug(`Priority request was canceled (${requestId}):`, url);
        }
      }
    } else if (error.response?.status === 429 && retryCount < 3) {
      // Rate limited - retry with exponential backoff
      console.warn(`Rate limited on ${url} (${requestId}), retrying (attempt ${retryCount + 1}/3)`);

      // Get retry-after header if available
      const retryAfter = error.response.headers['retry-after'];

      // Calculate retry delay with exponential backoff and jitter
      // Base delay increases exponentially with each retry
      const baseDelay = retryAfter ?
        parseInt(retryAfter) * 1000 :
        Math.min(Math.pow(2, retryCount + 1) * 1000, 10000);

      // Add random jitter to prevent thundering herd problem
      const jitter = Math.random() * 1000;
      const retryMs = baseDelay + jitter;

      console.info(`Will retry in ${Math.round(retryMs/1000)} seconds`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryMs));

      // Retry with incremented retry count
      return makePriorityRequest(method, url, {
        ...options,
        retryCount: retryCount + 1,
        params: {
          ...params,
          _t: Date.now() // Fresh timestamp
        }
      });
    } else if (error.response?.status === 401) {
      // For public endpoints, we should still return data even if unauthenticated
      // Check if this is a public endpoint
      const publicEndpoints = [
        '/jobs',
        '/products',
        '/categories',
        '/trending',
        '/search'
      ];

      // Check if the URL starts with any of the public endpoints
      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        url === endpoint || url.startsWith(`${endpoint}/`)
      );

      if (isPublicEndpoint) {
        console.warn(`Auth error on public endpoint ${url}, continuing as guest`);
        // For public endpoints, we'll retry without auth
        delete config.headers.Authorization;

        // Retry the request without auth
        if (method.toLowerCase() === 'get') {
          return await api.get(url, config);
        }
      }
    }

    throw error;
  }
};

// Export as default and named export for flexibility
export { api };
export default api;
