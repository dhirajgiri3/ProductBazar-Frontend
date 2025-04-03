// File: RecommendationContext.js

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../Auth/AuthContext";
import api from "../../Utils/api";
import logger from "../../Utils/logger";

const RecommendationContext = createContext();

export const RecommendationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState({
    enablePersonalized: true,
    enableTrending: true,
    enableNew: true,
    diversityLevel: "medium",
    refreshInterval: 24 * 60 * 60 * 1000, // 24 hours in ms
  });
  const [cache, setCache] = useState({ data: {}, lastUpdated: {} });

  // Load settings from localStorage
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const savedSettings = localStorage.getItem(
        `recommendation_settings_${user._id}`
      );
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    }
  }, [isAuthenticated, user?._id]);

  // Save settings to localStorage
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      localStorage.setItem(
        `recommendation_settings_${user._id}`,
        JSON.stringify(settings)
      );
    }
  }, [settings, isAuthenticated, user?._id]);

  // Check if cache is valid
  const isCacheValid = useCallback(
    (type, id = null) => {
      const key = id ? `${type}_${id}` : type;
      const lastUpdated = cache.lastUpdated[key];
      return lastUpdated && Date.now() - lastUpdated < settings.refreshInterval;
    },
    [cache.lastUpdated, settings.refreshInterval]
  );

  // Get cached recommendations
  const getCachedRecommendations = useCallback(
    (type, id = null) => {
      const key = id ? `${type}_${id}` : type;
      return cache.data[key] || [];
    },
    [cache.data]
  );

  // Cache recommendations
  const cacheRecommendations = useCallback(
    (type, recommendations, id = null) => {
      const key = id ? `${type}_${id}` : type;
      setCache((prev) => ({
        data: { ...prev.data, [key]: recommendations },
        lastUpdated: { ...prev.lastUpdated, [key]: Date.now() },
      }));
    },
    []
  );

  // Clear cache
  const clearCache = useCallback((type = null, id = null) => {
    if (!type) {
      setCache({ data: {}, lastUpdated: {} });
      return;
    }
    const key = id ? `${type}_${id}` : type;
    setCache((prev) => {
      const newData = { ...prev.data };
      const newLastUpdated = { ...prev.lastUpdated };
      delete newData[key];
      delete newLastUpdated[key];
      return { data: newData, lastUpdated: newLastUpdated };
    });
  }, []);

  // Fetch diversified feed
  const getDiversifiedFeed = useCallback(
    async (
      limit = 20,
      includeTrending = true,
      includeNew = true,
      refresh = false
    ) => {
      if (!settings.enableTrending && includeTrending) includeTrending = false;
      if (!settings.enableNew && includeNew) includeNew = false;

      if (!refresh && isCacheValid("feed"))
        return getCachedRecommendations("feed").slice(0, limit);

      try {
        const response = await api.get("/recommendations/feed", {
          params: {
            limit,
            includeTrending,
            includeNew,
            diversityLevel: settings.diversityLevel,
          },
        });
        if (!response.data.success)
          throw new Error(response.data.message || "Failed to fetch feed");
        const recommendations = response.data.data;
        cacheRecommendations("feed", recommendations);
        return recommendations.slice(0, limit);
      } catch (err) {
        logger.error("Error fetching diversified feed:", err);
        return [];
      }
    },
    [settings, isCacheValid, getCachedRecommendations, cacheRecommendations]
  );

  // Fetch personalized recommendations
  const getUserRecommendations = useCallback(
    async (limit = 10, refresh = false) => {
      if (!isAuthenticated || !settings.enablePersonalized) return [];
      if (!refresh && isCacheValid("personalized"))
        return getCachedRecommendations("personalized").slice(0, limit);

      try {
        const response = await api.get("/recommendations/personalized", {
          params: { limit },
        });
        if (!response.data.success)
          throw new Error(
            response.data.message ||
              "Failed to fetch personalized recommendations"
          );
        const recommendations = response.data.data;
        cacheRecommendations("personalized", recommendations);
        return recommendations.slice(0, limit);
      } catch (err) {
        logger.error("Error fetching personalized recommendations:", err);
        return [];
      }
    },
    [
      isAuthenticated,
      settings,
      isCacheValid,
      getCachedRecommendations,
      cacheRecommendations,
    ]
  );

  // Fetch trending recommendations
  const getTrendingRecommendations = useCallback(
    async (limit = 10, refresh = false) => {
      if (!settings.enableTrending) return [];
      if (!refresh && isCacheValid("trending"))
        return getCachedRecommendations("trending").slice(0, limit);

      try {
        const response = await api.get("/recommendations/trending", {
          params: { limit },
        });
        if (!response.data.success)
          throw new Error(
            response.data.message || "Failed to fetch trending recommendations"
          );
        const recommendations = response.data.data;
        cacheRecommendations("trending", recommendations);
        return recommendations.slice(0, limit);
      } catch (err) {
        logger.error("Error fetching trending recommendations:", err);
        return [];
      }
    },
    [settings, isCacheValid, getCachedRecommendations, cacheRecommendations]
  );

  // Fetch new product recommendations
  const getNewProductRecommendations = useCallback(
    async (limit = 10, refresh = false) => {
      if (!settings.enableNew) return [];
      if (!refresh && isCacheValid("new"))
        return getCachedRecommendations("new").slice(0, limit);

      try {
        const response = await api.get("/recommendations/new", {
          params: { limit },
        });
        if (!response.data.success)
          throw new Error(
            response.data.message ||
              "Failed to fetch new product recommendations"
          );
        const recommendations = response.data.data;
        cacheRecommendations("new", recommendations);
        return recommendations.slice(0, limit);
      } catch (err) {
        logger.error("Error fetching new product recommendations:", err);
        return [];
      }
    },
    [settings, isCacheValid, getCachedRecommendations, cacheRecommendations]
  );

  // Fetch category recommendations
  const getCategoryRecommendations = useCallback(
    async (categoryId, limit = 10, refresh = false) => {
      if (!categoryId) return [];
      if (!refresh && isCacheValid("category", categoryId))
        return getCachedRecommendations("category", categoryId).slice(0, limit);

      try {
        const response = await api.get(
          `/recommendations/category/${categoryId}`,
          { params: { limit } }
        );
        if (!response.data.success)
          throw new Error(
            response.data.message || "Failed to fetch category recommendations"
          );
        const recommendations = response.data.data;
        cacheRecommendations("category", recommendations, categoryId);
        return recommendations.slice(0, limit);
      } catch (err) {
        logger.error("Error fetching category recommendations:", err);
        return [];
      }
    },
    [isCacheValid, getCachedRecommendations, cacheRecommendations]
  );

  // Fetch similar products - updated to use recommendation API endpoint
  const getSimilarProducts = useCallback(
    async (productId, limit = 5, refresh = false) => {
      if (!productId) return { data: [] };
      
      const cacheKey = `similar_${productId}`;
      if (!refresh && isCacheValid("similar", productId)) {
        return {
          data: getCachedRecommendations("similar", productId).slice(0, limit),
          source: "client-cache"
        };
      }

      try {
        // Use the recommendation service endpoint for similar products
        const response = await api.get(
          `/recommendations/similar/${productId}`,
          { params: { limit, similarityType: "mixed" } }
        );
        
        if (response.data.success && response.data.data) {
          cacheRecommendations("similar", response.data.data, productId);
        }
        
        // Return the response data
        return response.data;
      } catch (err) {
        logger.error("Error fetching similar products:", err);
        return { data: [] };
      }
    },
    [isCacheValid, getCachedRecommendations, cacheRecommendations]
  );

  // Record interaction
  const recordInteraction = useCallback(
    async (productId, interactionType, metadata = {}) => {
      if (!isAuthenticated || !productId || !interactionType) return false;
      
      try {
        // First try the dedicated recommendation interaction endpoint
        const response = await api.post("/recommendations/interaction", {
          productId,
          interactionType: interactionType === "impression" ? "view" : interactionType,
          metadata,
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to record interaction");
        }
        
        // Clear appropriate caches based on interaction type
        clearCache("personalized");
        
        if (interactionType === "view") {
          clearCache("history");
        } else if (["upvote", "bookmark"].includes(interactionType)) {
          clearCache("trending");
        }
        
        return true;
      } catch (err) {
        logger.error(`Error recording ${interactionType} interaction:`, err);
        
        // Fallback to product-specific interaction (for upvotes, bookmarks)
        if (["upvote", "bookmark"].includes(interactionType)) {
          try {
            await api.post(`/products/${productId}/${interactionType}`);
            return true;
          } catch (fallbackErr) {
            logger.error(`Fallback ${interactionType} also failed:`, fallbackErr);
          }
        }
        
        return false;
      }
    },
    [isAuthenticated, clearCache]
  );

  const value = {
    settings,
    updateSettings: (newSettings) =>
      setSettings((prev) => ({ ...prev, ...newSettings })),
    getDiversifiedFeed,
    getUserRecommendations,
    getTrendingRecommendations,
    getNewProductRecommendations,
    getCategoryRecommendations,
    getSimilarProducts,
    recordInteraction,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendation = () => {
  const context = useContext(RecommendationContext);
  if (!context)
    throw new Error(
      "useRecommendation must be used within a RecommendationProvider"
    );
  return context;
};
