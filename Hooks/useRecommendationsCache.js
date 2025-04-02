import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/Auth/AuthContext';

/**
 * Custom hook for caching recommendation data to improve performance and UX
 * Stores recommendations locally and handles cache invalidation
 */
const useRecommendationsCache = () => {
  const { isAuthenticated, user } = useAuth();
  const [cache, setCache] = useState({
    personalized: [],
    trending: [],
    category: {},
    similar: {},
    new: [],
    feed: [],
    lastUpdated: {}
  });
  
  // Initialize cache from localStorage on mount
  useEffect(() => {
    try {
      const storedCache = localStorage.getItem('recommendationsCache');
      if (storedCache) {
        setCache(JSON.parse(storedCache));
      }
    } catch (error) {
      console.error('Error loading recommendations cache:', error);
      // If there's an error, clear the corrupted cache
      localStorage.removeItem('recommendationsCache');
    }
  }, []);
  
  // Save cache to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('recommendationsCache', JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving recommendations cache:', error);
    }
  }, [cache]);
  
  // Clear cache when user changes
  useEffect(() => {
    if (isAuthenticated) {
      // Only keep non-personalized recommendations when user changes
      setCache(prevCache => ({
        ...prevCache,
        personalized: [],
        feed: [],
        category: {},
        similar: {},
        lastUpdated: {
          ...prevCache.lastUpdated,
          personalized: null,
          feed: null
        }
      }));
    }
  }, [isAuthenticated, user?._id]);
  
  // Check if cached data is still valid
  const isCacheValid = useCallback((type, id = null, maxAge = 5 * 60 * 1000) => {
    const lastUpdated = id 
      ? cache.lastUpdated[`${type}_${id}`]
      : cache.lastUpdated[type];
      
    if (!lastUpdated) return false;
    
    const age = Date.now() - lastUpdated;
    return age < maxAge;
  }, [cache.lastUpdated]);
  
  // Get cached recommendations
  const getCachedRecommendations = useCallback((type, id = null) => {
    if (type === 'category' && id) {
      return cache.category[id] || [];
    } else if (type === 'similar' && id) {
      return cache.similar[id] || [];
    } else {
      return cache[type] || [];
    }
  }, [cache]);
  
  // Store recommendations in cache
  const cacheRecommendations = useCallback((type, recommendations, id = null) => {
    setCache(prevCache => {
      if (type === 'category' && id) {
        return {
          ...prevCache,
          category: {
            ...prevCache.category,
            [id]: recommendations
          },
          lastUpdated: {
            ...prevCache.lastUpdated,
            [`${type}_${id}`]: Date.now()
          }
        };
      } else if (type === 'similar' && id) {
        return {
          ...prevCache,
          similar: {
            ...prevCache.similar,
            [id]: recommendations
          },
          lastUpdated: {
            ...prevCache.lastUpdated,
            [`${type}_${id}`]: Date.now()
          }
        };
      } else {
        return {
          ...prevCache,
          [type]: recommendations,
          lastUpdated: {
            ...prevCache.lastUpdated,
            [type]: Date.now()
          }
        };
      }
    });
  }, []);
  
  // Clear specific cache entries
  const clearCache = useCallback((type = null, id = null) => {
    if (!type) {
      // Clear entire cache
      setCache({
        personalized: [],
        trending: [],
        category: {},
        similar: {},
        new: [],
        feed: [],
        lastUpdated: {}
      });
      return;
    }
    
    setCache(prevCache => {
      if (type === 'category' && id) {
        const newCategory = { ...prevCache.category };
        delete newCategory[id];
        
        const newLastUpdated = { ...prevCache.lastUpdated };
        delete newLastUpdated[`${type}_${id}`];
        
        return {
          ...prevCache,
          category: newCategory,
          lastUpdated: newLastUpdated
        };
      } else if (type === 'similar' && id) {
        const newSimilar = { ...prevCache.similar };
        delete newSimilar[id];
        
        const newLastUpdated = { ...prevCache.lastUpdated };
        delete newLastUpdated[`${type}_${id}`];
        
        return {
          ...prevCache,
          similar: newSimilar,
          lastUpdated: newLastUpdated
        };
      } else {
        const newLastUpdated = { ...prevCache.lastUpdated };
        delete newLastUpdated[type];
        
        return {
          ...prevCache,
          [type]: [],
          lastUpdated: newLastUpdated
        };
      }
    });
  }, []);
  
  // Invalidate cache after user interactions
  const invalidateAfterInteraction = useCallback((productId, interactionType) => {
    // Always invalidate personalized and feed recommendations
    clearCache('personalized');
    clearCache('feed');
    
    // For upvotes and bookmarks, also invalidate trending
    if (['upvote', 'bookmark'].includes(interactionType)) {
      clearCache('trending');
    }
    
    // Clear similar product cache for this product
    clearCache('similar', productId);
    
    // For all product interactions, find and clear related category cache
    setCache(prevCache => {
      // Find which categories this product is in
      const categoriesWithProduct = Object.entries(prevCache.category)
        .filter(([_, categoryProducts]) => 
          categoryProducts.some(rec => rec.product?._id === productId)
        )
        .map(([categoryId]) => categoryId);
      
      // Clear those category caches
      const newCategory = { ...prevCache.category };
      const newLastUpdated = { ...prevCache.lastUpdated };
      
      categoriesWithProduct.forEach(categoryId => {
        delete newCategory[categoryId];
        delete newLastUpdated[`category_${categoryId}`];
      });
      
      return {
        ...prevCache,
        category: newCategory,
        lastUpdated: newLastUpdated
      };
    });
  }, [clearCache]);
  
  return {
    isCacheValid,
    getCachedRecommendations,
    cacheRecommendations,
    clearCache,
    invalidateAfterInteraction
  };
};

export default useRecommendationsCache;