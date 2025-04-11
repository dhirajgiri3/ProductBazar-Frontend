/**
 * Client-side rate limiting utility
 * Helps prevent excessive API calls by tracking request times
 */

// Check if a request should be rate limited
export const shouldRateLimit = (key, cooldownMs = 5000) => {
  if (typeof window === 'undefined') return false;

  try {
    const now = Date.now();
    const lastRequestTime = parseInt(sessionStorage.getItem(key) || '0');

    // If the last request was within the cooldown period, rate limit
    return (now - lastRequestTime < cooldownMs);
  } catch (e) {
    // If we can't access sessionStorage, don't rate limit
    return false;
  }
};

// Mark a request as made (updates the timestamp)
export const markRequest = (key) => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(key, Date.now().toString());
  } catch (e) {
    // Ignore storage errors
  }
};

// Get a unique key for a specific request
export const getRequestKey = (endpoint, params = {}) => {
  const paramsString = typeof params === 'object' ?
    JSON.stringify(params) : String(params);

  return `req_${endpoint}_${paramsString}`;
};

// Utility for components to use
export const useRateLimitedRequest = async (endpoint, params = {}, cooldownMs = 5000, callback) => {
  const key = getRequestKey(endpoint, params);

  if (shouldRateLimit(key, cooldownMs)) {
    return { rateLimited: true };
  }

  markRequest(key);

  // Add timestamp to params to make the request unique
  const requestParams = {
    ...params,
    _t: Date.now()
  };

  try {
    return await callback(requestParams);
  } catch (error) {
    if (error.response?.status === 429) {
      // If we get a 429, mark this endpoint as rate limited for a longer period
      markRequest(`rate_limited_${endpoint}`, 60000); // 1 minute cooldown
    }
    throw error;
  }
};

