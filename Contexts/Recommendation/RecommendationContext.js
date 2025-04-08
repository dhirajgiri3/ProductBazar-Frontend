"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../Auth/AuthContext";
import api from "../../Utils/api"; // Assuming api is configured for base URL and auth token handling
import logger from "../../Utils/logger"; // Assuming a logger utility exists

const RecommendationContext = createContext();

export const RecommendationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState({
    enablePersonalized: true, // Controls if personalized recommendations are allowed
    diversityLevel: "medium", // Controls diversity in feed (low, medium, high)
    refreshInterval: 15 * 60 * 1000, // Cache refresh interval: 15 minutes in ms
    blend: "standard", // Feed blend strategy (standard, discovery, trending, personalized)
  });
  const [cache, setCache] = useState({ data: {}, lastUpdated: {} });

  // --- Settings Management ---

  // Load settings from localStorage on mount/auth change
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      try {
        const savedSettings = localStorage.getItem(
          `recommendation_settings_${user._id}`
        );
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Merge saved settings with defaults to ensure all keys exist
          setSettings((prev) => ({ ...prev, ...parsedSettings }));
        }
      } catch (error) {
        logger.error("Error loading recommendation settings:", error);
        // Clear potentially corrupted settings
        localStorage.removeItem(`recommendation_settings_${user._id}`);
      }
    } else {
      // Reset to defaults if not authenticated
      setSettings({
        enablePersonalized: true,
        diversityLevel: "medium",
        refreshInterval: 15 * 60 * 1000,
        blend: "standard",
      });
      // Optionally clear cache on logout
      setCache({ data: {}, lastUpdated: {} });
    }
  }, [isAuthenticated, user?._id]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      try {
        localStorage.setItem(
          `recommendation_settings_${user._id}`,
          JSON.stringify(settings)
        );
      } catch (error) {
        logger.error("Error saving recommendation settings:", error);
      }
    }
  }, [settings, isAuthenticated, user?._id]);

  // Function to update specific settings
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // --- Caching Logic ---

  const isCacheValid = useCallback(
    (cacheKey) => {
      const lastUpdated = cache.lastUpdated[cacheKey];
      // Check if lastUpdated exists and is within the refresh interval
      return lastUpdated && Date.now() - lastUpdated < settings.refreshInterval;
    },
    [cache.lastUpdated, settings.refreshInterval]
  );

  const getCachedData = useCallback(
    (cacheKey) => {
      return cache.data[cacheKey] || null; // Return null if not found
    },
    [cache.data]
  );

  const cacheData = useCallback((cacheKey, data) => {
    setCache((prev) => ({
      data: { ...prev.data, [cacheKey]: data },
      lastUpdated: { ...prev.lastUpdated, [cacheKey]: Date.now() },
    }));
  }, []);

  const clearCache = useCallback((cacheKey = null) => {
    if (!cacheKey) {
      // Clear all cache
      setCache({ data: {}, lastUpdated: {} });
      logger.info("Cleared all recommendation cache.");
      return;
    }
    // Clear specific cache key
    setCache((prev) => {
      const newData = { ...prev.data };
      const newLastUpdated = { ...prev.lastUpdated };
      delete newData[cacheKey];
      delete newLastUpdated[cacheKey];
      logger.info(`Cleared recommendation cache for key: ${cacheKey}`);
      return { data: newData, lastUpdated: newLastUpdated };
    });
  }, []);

  // Helper to create cache keys consistently
  const createCacheKey = (type, params = {}) => {
    // Create a consistent cache key based on type and params
    const paramsKey = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}_${value}`)
      .join("_");

    return paramsKey ? `${type}_${paramsKey}` : type;
  };

  // --- Fetch Functions ---

  // Generic fetch helper with caching
  const fetchRecommendations = useCallback(
    async (
      endpoint,
      params,
      cacheType,
      cacheParams = {},
      requiresAuth = false,
      refresh = false
    ) => {
      if (requiresAuth && !isAuthenticated) {
        logger.warn(
          `Attempted to fetch ${cacheType} recommendations without authentication.`
        );
        return []; // Return empty array if auth is required but user is not logged in
      }

      const cacheKey = createCacheKey(cacheType, cacheParams);

      if (!refresh && isCacheValid(cacheKey)) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          logger.info(`Using cached ${cacheType} recommendations`);
          // Return a slice based on limit if provided in params, otherwise return all cached data
          return params.limit ? cached.slice(0, params.limit) : cached;
        }
      }

      try {
        logger.info(
          `Fetching ${cacheType} recommendations from API: ${endpoint}`
        );
        const response = await api.get(endpoint, { params });

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              `Failed to fetch ${cacheType} recommendations`
          );
        }

        const recommendations = response.data.data || []; // Default to empty array
        cacheData(cacheKey, recommendations);

        // Return a slice based on limit if provided in params
        return params.limit
          ? recommendations.slice(0, params.limit)
          : recommendations;
      } catch (err) {
        logger.error(`Error fetching ${cacheType} recommendations:`, err);
        // Optionally return stale cache if available on error
        const staleCache = getCachedData(cacheKey);
        if (staleCache) {
          logger.warn(
            `Returning stale cache for ${cacheType} due to fetch error`
          );
          return params.limit ? staleCache.slice(0, params.limit) : staleCache;
        }
        return []; // Return empty array if no stale cache
      }
    },
    [isAuthenticated, isCacheValid, getCachedData, cacheData]
  );

  // Fetch Feed (Hybrid)
  const getFeedRecommendations = useCallback(
    async (limit = 20, offset = 0, options = {}, refresh = false) => {
      const {
        blend = settings.blend,
        category = null,
        tags = null,
        sortBy = "score",
      } = options;

      const params = {
        limit,
        offset,
        blend,
        ...(category && { category }),
        ...(tags &&
          Array.isArray(tags) &&
          tags.length > 0 && { tags: tags.join(",") }),
        sortBy,
      };

      const cacheParams = {
        limit,
        offset,
        blend,
        category: category || "all",
        tags: tags ? tags.sort().join("_") : "none",
        sortBy,
      };

      return fetchRecommendations(
        "/recommendations/feed",
        params,
        "feed",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [settings.blend, fetchRecommendations]
  );

  // Fetch Personalized
  const getPersonalizedRecommendations = useCallback(
    async (
      limit = 10,
      offset = 0,
      strategy = "personalized",
      refresh = false
    ) => {
      if (!settings.enablePersonalized) {
        logger.info("Personalized recommendations disabled in settings");
        return [];
      }

      const params = {
        limit,
        offset,
        strategy,
      };

      const cacheParams = {
        limit,
        offset,
        strategy,
      };

      return fetchRecommendations(
        "/recommendations/personalized",
        params,
        "personalized",
        cacheParams,
        true, // Requires auth
        refresh
      );
    },
    [settings.enablePersonalized, fetchRecommendations]
  );

  // Fetch Trending
  const getTrendingRecommendations = useCallback(
    async (
      limit = 10,
      offset = 0,
      days = 7,
      categoryId = null,
      refresh = false
    ) => {
      const params = {
        limit,
        offset,
        days,
      };

      if (categoryId) {
        params.categoryId = categoryId;
      }

      const cacheParams = {
        limit,
        offset,
        days,
        categoryId: categoryId || "all",
      };

      return fetchRecommendations(
        "/recommendations/trending",
        params,
        "trending",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch New Products
  const getNewRecommendations = useCallback(
    async (limit = 10, offset = 0, days = 14, refresh = false) => {
      const params = {
        limit,
        offset,
        days,
      };

      const cacheParams = {
        limit,
        offset,
        days,
      };

      return fetchRecommendations(
        "/recommendations/new",
        params,
        "new",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch Similar Products
  const getSimilarRecommendations = useCallback(
    async (productId, limit = 5, refresh = false) => {
      if (!productId) {
        logger.warn(
          "Cannot fetch similar recommendations: productId is required"
        );
        return [];
      }

      const params = { limit };
      const cacheParams = {
        productId,
        limit,
      };

      return fetchRecommendations(
        `/recommendations/similar/${productId}`,
        params,
        "similar",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch Category Recommendations
  const getCategoryRecommendations = useCallback(
    async (categoryId, limit = 10, offset = 0, refresh = false) => {
      if (!categoryId) {
        logger.warn(
          "Cannot fetch category recommendations: categoryId is required"
        );
        return [];
      }

      const params = { limit, offset };
      const cacheParams = {
        categoryId,
        limit,
        offset,
      };

      return fetchRecommendations(
        `/recommendations/category/${categoryId}`,
        params,
        "category",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch Maker Recommendations
  const getMakerRecommendations = useCallback(
    async (makerId, limit = 10, offset = 0, refresh = false) => {
      if (!makerId) {
        logger.warn("Cannot fetch maker recommendations: makerId is required");
        return [];
      }

      const params = { limit, offset };
      const cacheParams = {
        makerId,
        limit,
        offset,
      };

      return fetchRecommendations(
        `/recommendations/maker/${makerId}`,
        params,
        "maker",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch Recommendations by Tags
  const getRecommendationsByTags = useCallback(
    async (tags = [], limit = 10, offset = 0, refresh = false) => {
      if (!Array.isArray(tags) || tags.length === 0) {
        logger.warn("Cannot fetch tag recommendations: tags array is empty");
        return [];
      }

      const tagsParam = tags.join(","); // Convert array to comma-separated string
      const params = { tags: tagsParam, limit, offset };

      // Create cache params with sorted tags for consistency
      const sortedTags = [...tags].sort().join("_");
      const cacheParams = {
        tags: sortedTags,
        limit,
        offset,
      };

      return fetchRecommendations(
        "/recommendations/tags",
        params,
        "tags",
        cacheParams,
        false, // Optional auth
        refresh
      );
    },
    [fetchRecommendations]
  );

  // Fetch Collaborative Filtering Recommendations
  const getCollaborativeRecommendations = useCallback(
    async (limit = 10, offset = 0, refresh = false) => {
      if (!isAuthenticated) {
        logger.warn(
          "Cannot fetch collaborative recommendations: authentication required"
        );
        return [];
      }

      const params = { limit, offset };
      const cacheParams = { limit, offset };

      return fetchRecommendations(
        "/recommendations/collaborative",
        params,
        "collaborative",
        cacheParams,
        true, // Requires auth
        refresh
      );
    },
    [fetchRecommendations, isAuthenticated]
  );

  // Fetch Preferences-Based Recommendations
  const getPreferencesRecommendations = useCallback(
    async (limit = 10, offset = 0, refresh = false) => {
      if (!isAuthenticated) {
        logger.warn(
          "Cannot fetch preferences recommendations: authentication required"
        );
        return [];
      }

      const params = { limit, offset };
      const cacheParams = { limit, offset };

      return fetchRecommendations(
        "/recommendations/preferences",
        params,
        "preferences",
        cacheParams,
        true, // Requires auth
        refresh
      );
    },
    [fetchRecommendations, isAuthenticated]
  );

  // Fetch Interest-Based Recommendations
  const getInterestsRecommendations = useCallback(
    async (limit = 10, offset = 0, refresh = false) => {
      if (!isAuthenticated) {
        logger.warn(
          "Cannot fetch interests recommendations: authentication required"
        );
        return [];
      }

      const params = { limit, offset };
      const cacheParams = { limit, offset };

      return fetchRecommendations(
        "/recommendations/interests",
        params,
        "interests",
        cacheParams,
        true, // Requires auth
        refresh
      );
    },
    [fetchRecommendations, isAuthenticated]
  );

  // --- Interaction & History Functions ---

  // Fetch User History
  const getUserHistory = useCallback(
    async (refresh = false) => {
      if (!isAuthenticated) {
        logger.warn("Cannot fetch user history: authentication required");
        return null;
      }

      const cacheKey = createCacheKey("history");
      if (!refresh && isCacheValid(cacheKey)) {
        return getCachedData(cacheKey);
      }

      try {
        logger.info("Fetching user history from API");
        const response = await api.get("/recommendations/history");
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch history");
        }
        const historyData = response.data.data || null;
        cacheData(cacheKey, historyData);
        return historyData;
      } catch (err) {
        logger.error("Error fetching user history:", err);
        return null; // Return null on error
      }
    },
    [isAuthenticated, isCacheValid, getCachedData, cacheData]
  );

  // Record Interaction
  const recordInteraction = useCallback(
    async (productId, type, metadata = {}) => {
      if (!productId || !type) {
        logger.warn("Missing required parameters for interaction recording");
        return { success: false, error: "Missing required parameters" };
      }

      if (!isAuthenticated) {
        logger.warn("Cannot record interaction: authentication required");
        return { success: false, error: "Authentication required" };
      }

      try {
        const enrichedMetadata = {
          ...metadata,
          timestamp: new Date().toISOString(),
          url: typeof window !== "undefined" ? window.location.href : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
        };

        const response = await api.post("/recommendations/interaction", {
          productId,
          type,
          metadata: enrichedMetadata,
        });

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to record interaction"
          );
        }

        // Clear relevant caches if needed for significant interactions
        if (["upvote", "bookmark", "purchase", "follow"].includes(type)) {
          clearCache(createCacheKey("personalized"));
          clearCache(createCacheKey("feed"));
        }

        return { success: true };
      } catch (error) {
        logger.error(
          `Error recording ${type} interaction for product ${productId}:`,
          error
        );
        // Don't throw - we don't want to break the UI for tracking failures
        return { success: false, error: error.message };
      }
    },
    [isAuthenticated, clearCache]
  );

  // Submit Recommendation Feedback (like, dislike, not_interested)
  const submitRecommendationFeedback = useCallback(
    async (productId, feedbackType, reason = "", source = "") => {
      if (!isAuthenticated || !productId || !feedbackType) {
        logger.warn(
          "Feedback not submitted: Missing auth, productId, or feedbackType."
        );
        return { success: false, error: "Missing required parameters" };
      }

      try {
        logger.info(
          `Submitting feedback: ${feedbackType} for product ${productId}`
        );
        const response = await api.post("/recommendations/feedback", {
          productId,
          action: feedbackType, // Matches backend expectation: 'like', 'dislike', 'not_interested'
          reason,
          source, // Source of the recommendation (e.g., 'feed', 'personalized')
        });

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to submit recommendation feedback"
          );
        }

        // Clear personalized and potentially feed/interest/preference caches
        clearCache(createCacheKey("personalized"));
        clearCache(createCacheKey("feed"));
        clearCache(createCacheKey("interests"));
        clearCache(createCacheKey("preferences"));

        // If feedback implies dismissal, clear similar cache too
        if (feedbackType === "dislike" || feedbackType === "not_interested") {
          clearCache(createCacheKey("similar", { productId }));
        }

        logger.info(`Successfully submitted feedback for product ${productId}`);
        return { success: true };
      } catch (err) {
        logger.error(
          `Error submitting feedback for product ${productId}:`,
          err
        );
        return { success: false, error: err.message };
      }
    },
    [isAuthenticated, clearCache]
  );

  // Dismiss Recommendation
  const dismissRecommendation = useCallback(
    async (productId, reason = "user_dismissed", source = "") => {
      if (!isAuthenticated || !productId) {
        logger.warn("Dismissal not recorded: Missing auth or productId.");
        return { success: false, error: "Missing required parameters" };
      }

      try {
        logger.info(`Dismissing recommendation for product ${productId}`);
        const response = await api.post("/recommendations/dismiss", {
          productId,
          reason,
          source, // Include source where it was dismissed from
        });

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to dismiss recommendation"
          );
        }

        // Clear personalized, feed, interest, preference, and similar caches
        clearCache(createCacheKey("personalized"));
        clearCache(createCacheKey("feed"));
        clearCache(createCacheKey("interests"));
        clearCache(createCacheKey("preferences"));
        clearCache(createCacheKey("similar", { productId }));

        logger.info(
          `Successfully dismissed recommendation for product ${productId}`
        );
        return { success: true };
      } catch (err) {
        logger.error(
          `Error dismissing recommendation for product ${productId}:`,
          err
        );
        return { success: false, error: err.message };
      }
    },
    [isAuthenticated, clearCache]
  );

  // --- Context Value ---

  const value = {
    settings,
    updateSettings,
    clearCache, // Expose cache clearing function

    // Recommendation Fetching Functions
    getFeedRecommendations,
    getPersonalizedRecommendations,
    getTrendingRecommendations,
    getNewRecommendations,
    getSimilarRecommendations,
    getCategoryRecommendations,
    getMakerRecommendations,
    getRecommendationsByTags,
    getCollaborativeRecommendations,
    getPreferencesRecommendations,
    getInterestsRecommendations,

    // History & Interaction Functions
    getUserHistory,
    recordInteraction,
    submitRecommendationFeedback,
    dismissRecommendation,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

// --- Custom Hook ---
export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  }
  return context;
};

export default RecommendationContext;
