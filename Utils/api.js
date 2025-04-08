// src/Utils/api.js
import axios from "axios";
import logger from "./logger";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5004/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', {
      url: request.url,
      method: request.method,
      data: request.data
    });
  }
  return request;
});

export const getAccessToken = () => {
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/send-email-verification",
      "/auth/verify-password-token",
      "/auth/refresh-token",
    ];
    const isPublic = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    if (!isPublic) {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        logger.debug("Added Authorization header", { url: config.url });
      }
    }
    return config;
  },
  (error) => {
    logger.error("Request interceptor error:", {
      message: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    logger.debug("API request successful", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        logger.info("Attempting to refresh access token", {
          url: originalRequest.url,
        });
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        if (
          refreshResponse.data.status === "success" &&
          refreshResponse.data.data.accessToken
        ) {
          const newToken = refreshResponse.data.data.accessToken;
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          logger.info("Token refreshed successfully");
          return api(originalRequest);
        }
      } catch (refreshErr) {
        logger.error("Token refresh failed:", {
          message: refreshErr.message,
          stack: refreshErr.stack,
          url: originalRequest.url,
        });
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshErr);
      }
    }

    // Handle 403 Forbidden with verification required
    if (error.response?.status === 403 && error.response.data?.nextStep) {
      logger.warn("Verification required", {
        url: originalRequest.url,
        nextStep: error.response.data.nextStep,
      });
      window.dispatchEvent(
        new CustomEvent("auth:verification-required", {
          detail: error.response.data,
        })
      );
    }

    // Detailed error logging
    if (error.response) {
      logger.error("API request failed:", {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data,
        timestamp: new Date().toISOString(),
      });
    } else if (error.request) {
      logger.error("No response received from API:", {
        url: originalRequest.url,
        method: originalRequest.method,
        error: error.message,
      });
    } else {
      logger.error("Error setting up API request:", {
        message: error.message,
        stack: error.stack,
      });
    }

    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

/**
 * Upload form data to an endpoint
 * @param {string} endpoint - The API endpoint
 * @param {FormData} formData - The form data to upload
 * @returns {Promise<object>} - The API response
 * @throws {Error} - If the upload fails
 */
export const uploadFormData = async (endpoint, formData) => {
  const token = getAccessToken();
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  logger.debug("Uploading form data", { endpoint });

  try {
    const response = await api.post(endpoint, formData, config);
    logger.debug("Form data uploaded successfully", { endpoint });
    return response.data; // Return data instead of full response for consistency
  } catch (error) {
    logger.error("Error uploading form data:", {
      endpoint,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

api.uploadFormData = uploadFormData;

export default api;
