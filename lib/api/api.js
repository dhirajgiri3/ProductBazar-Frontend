// src/utils/api.js
import axios from 'axios';

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
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // If we're in the browser, we could redirect to login or trigger a token refresh
      if (typeof window !== 'undefined') {
        // Optional: Dispatch an event that auth context can listen for
        window.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: { message: error.response.data?.message }
        }));
      }
    }

    return Promise.reject(error);
  }
);

export const makePriorityRequest = async (method, url, options = {}) => {
  const { params, data, headers = {}, isFormData = false, timeout = 15000, retryCount = 0 } = options;

  // Get token from localStorage if available
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

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

  try {
    let response;
    switch (method.toLowerCase()) {
      case 'get':
        response = await api.get(url, config);
        break;
      case 'post':
        response = await api.post(url, data, config);
        break;
      case 'put':
        response = await api.put(url, data, config);
        break;
      case 'patch':
        response = await api.patch(url, data, config);
        break;
      case 'delete':
        response = await api.delete(url, { ...config, data });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return response;
  } catch (error) {
    // If we have retries left and it's a 401 or network error, retry the request
    if (retryCount > 0 && (error.response?.status === 401 || error.code === 'ERR_NETWORK')) {
      console.warn(`Request failed, retrying... (${retryCount} retries left)`);
      return makePriorityRequest(method, url, { ...options, retryCount: retryCount - 1 });
    }

    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw error;
  }
};

export default api;