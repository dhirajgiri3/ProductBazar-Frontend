"use client";

import { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import api, { makePriorityRequest } from '../api/api';
import logger from '../utils/logger';

const CategoryContext = createContext();

// Request deduplication cache
const requestCache = new Map();
const inFlightRequests = new Map();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Fetch all categories with improved caching and deduplication
  const fetchCategories = useCallback(async (force = false) => {
    // Check if we have recent data and don't need to force refresh
    const now = Date.now();
    const cacheAge = now - lastFetchTime;
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes cache

    if (categories.length > 0 && !force && cacheValid) {
      logger.debug('Using cached categories, age:', cacheAge);
      return categories;
    }

    // Check for in-flight request
    const requestId = 'fetch-categories';
    if (inFlightRequests.has(requestId)) {
      logger.debug('Categories request already in flight, waiting for result');
      return inFlightRequests.get(requestId);
    }

    try {
      setLoading(true);
      setError(null);

      // Create the request promise
      const requestPromise = makePriorityRequest('get', '/categories', {
        timeout: 15000, // Reduced timeout
        retryCount: 1, // Reduced retry count
        useCache: true // Enable caching
      });

      // Store the promise for deduplication
      inFlightRequests.set(requestId, requestPromise);

      const response = await requestPromise;
      const fetchedCategories = response.data.data;
      
      setCategories(fetchedCategories);
      setLastFetchTime(now);
      setError(null);
      
      // Cache the result
      requestCache.set('categories', {
        data: fetchedCategories,
        timestamp: now
      });

      logger.info('Categories fetched successfully:', fetchedCategories.length);
      return fetchedCategories;
    } catch (err) {
      // Check if this is a canceled request and handle it gracefully
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        if (err.isIntentionalCancel) {
          logger.debug('Categories request was intentionally canceled (duplicate request)');
        } else {
          logger.warn('Categories request was canceled');
        }

        // If we already have categories, just use them
        if (categories.length > 0) {
          return categories;
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        logger.error('Categories request timed out:', err.message);
        setError('Request timed out. Please check your connection and try again.');
      } else {
        logger.error('Error fetching categories:', err);
        setError('Failed to fetch categories. Please try again.');
      }
      return categories; // Return existing categories even on error
    } finally {
      setLoading(false);
      inFlightRequests.delete(requestId);
    }
  }, [categories, lastFetchTime]);

  // Fetch subcategories for a specific parent category with improved caching
  const fetchSubcategories = useCallback(async (parentSlug, force = false) => {
    if (!parentSlug) return [];

    // Check cache first
    const cacheKey = `subcategories-${parentSlug}`;
    const cached = requestCache.get(cacheKey);
    const now = Date.now();
    
    if (!force && cached && (now - cached.timestamp) < 10 * 60 * 1000) { // 10 minutes cache
      logger.debug('Using cached subcategories for:', parentSlug);
      return cached.data;
    }

    // Check for in-flight request
    const requestId = `fetch-subcategories-${parentSlug}`;
    if (inFlightRequests.has(requestId)) {
      logger.debug('Subcategories request already in flight for:', parentSlug);
      return inFlightRequests.get(requestId);
    }

    try {
      setLoading(true);
      setError(null);
      
      const requestPromise = makePriorityRequest('get', `/subcategories/parent/${parentSlug}`, {
        timeout: 15000,
        retryCount: 1,
        useCache: true
      });

      inFlightRequests.set(requestId, requestPromise);

      const response = await requestPromise;
      const fetchedSubcategories = response.data.data;

      // Cache the results
      requestCache.set(cacheKey, {
        data: fetchedSubcategories,
        timestamp: now
      });

      setSubcategories(prev => ({
        ...prev,
        [parentSlug]: fetchedSubcategories
      }));

      return fetchedSubcategories;
    } catch (err) {
      // Check if this is a canceled request and handle it gracefully
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        if (err.isIntentionalCancel) {
          logger.debug(`Subcategories request for ${parentSlug} was intentionally canceled`);
        } else {
          logger.warn(`Subcategories request for ${parentSlug} was canceled`);
        }

        if (subcategories[parentSlug]) {
          return subcategories[parentSlug];
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        logger.error(`Subcategories request for ${parentSlug} timed out:`, err.message);
        setError('Request timed out. Please check your connection and try again.');
      } else {
        logger.error(`Error fetching subcategories for ${parentSlug}:`, err);
        setError('Failed to fetch subcategories. Please try again.');
      }

      return subcategories[parentSlug] || [];
    } finally {
      setLoading(false);
      inFlightRequests.delete(requestId);
    }
  }, [subcategories]);

  // Clear any cached subcategories
  const clearSubcategoryCache = useCallback(() => {
    setSubcategories({});
    // Clear from request cache too
    for (const key of requestCache.keys()) {
      if (key.startsWith('subcategories-')) {
        requestCache.delete(key);
      }
    }
  }, []);

  // Load categories on mount with reduced frequency
  useEffect(() => {
    // Only fetch if we don't already have categories or if cache is stale
    const now = Date.now();
    const cacheAge = now - lastFetchTime;
    const needsRefresh = categories.length === 0 || cacheAge > 5 * 60 * 1000;

    if (needsRefresh) {
      // Add a small random delay to prevent multiple simultaneous requests
      const timer = setTimeout(() => {
        fetchCategories();
      }, Math.random() * 200); // Reduced random delay

      return () => clearTimeout(timer);
    }
  }, [fetchCategories, categories.length, lastFetchTime]);

  // Set up a refresh interval for categories with reduced frequency
  useEffect(() => {
    // Only set up refresh if we have categories already
    if (categories.length === 0) return;

    // Set up a refresh interval for categories (every 10 minutes instead of 5)
    const refreshInterval = setInterval(() => {
      // Only refresh if the user is active (not if the tab is in the background)
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchCategories(true); // Force refresh
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [fetchCategories, categories.length]);

  // Fetch products by category slug with improved caching
  const fetchProductsByCategory = useCallback(async (slug, page = 1, limit = 12, sort = 'newest', force = false, additionalParams = {}) => {
    if (!slug) return { products: [], pagination: { total: 0 } };

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: sort
    });

    // Add any additional filter parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
    }

    // Create a cache key based on all parameters
    const cacheKey = `${slug}:${queryParams.toString()}`;

    // Check if we already have these products cached and not forcing refresh
    if (!force && categoryProducts[cacheKey]) {
      const cacheAge = Date.now() - (categoryProducts[cacheKey].timestamp || 0);
      if (cacheAge < 5 * 60 * 1000) { // 5 minutes cache
        logger.info(`Using cached products for ${slug} with params: ${queryParams.toString()}`);
        return categoryProducts[cacheKey];
      }
    }

    // Check if we're already loading products for this category
    if (productsLoading) {
      logger.info(`Already loading products for a category, using cached data if available`);
      if (categoryProducts[cacheKey]) {
        return categoryProducts[cacheKey];
      }

      // If we don't have cached data for this specific query but have data for this category,
      // return the most recent data we have for this category as a fallback
      const fallbackData = Object.keys(categoryProducts)
        .filter(key => key.startsWith(`${slug}:`))
        .map(key => categoryProducts[key])
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

      if (fallbackData) {
        logger.info(`Using fallback cached data for ${slug}`);
        return fallbackData;
      }
    }

    try {
      setProductsLoading(true);

      const response = await makePriorityRequest(
        'get',
        `/products/category/${slug}?${queryParams.toString()}`,
        {
          timeout: 15000, // Reduced timeout
          retryCount: 1, // Reduced retry count
          useCache: true // Enable caching
        }
      );

      // Extract the data
      const { data: products, pagination, category, relatedCategories } = response.data;

      // Normalize the products to ensure all interaction data is properly initialized
      const normalizedProducts = products.map(product => ({
        ...product,
        // Ensure upvote count is properly initialized
        upvoteCount: product.upvoteCount ?? product.upvotes?.count ?? 0,
        // Ensure bookmark count is properly initialized
        bookmarkCount: product.bookmarkCount ?? product.bookmarks?.count ?? 0,
        // Ensure nested structures are properly initialized
        upvotes: {
          ...(product.upvotes || {}),
          count: product.upvoteCount ?? product.upvotes?.count ?? 0,
          userHasUpvoted: product.upvoted ?? product.upvotes?.userHasUpvoted ?? product.userInteractions?.hasUpvoted ?? false
        },
        bookmarks: {
          ...(product.bookmarks || {}),
          count: product.bookmarkCount ?? product.bookmarks?.count ?? 0,
          userHasBookmarked: product.bookmarked ?? product.bookmarks?.userHasBookmarked ?? product.userInteractions?.hasBookmarked ?? false
        },
        // Ensure user interactions are properly initialized
        userInteractions: {
          ...(product.userInteractions || {}),
          hasUpvoted: product.upvoted ?? product.upvotes?.userHasUpvoted ?? product.userInteractions?.hasUpvoted ?? false,
          hasBookmarked: product.bookmarked ?? product.bookmarks?.userHasBookmarked ?? product.userInteractions?.hasBookmarked ?? false
        }
      }));

      // Create a result object with all the data
      const result = {
        products: normalizedProducts,
        pagination,
        category,
        relatedCategories,
        sort,
        timestamp: Date.now() // Add timestamp for cache freshness tracking
      };

      // Cache the results
      setCategoryProducts(prev => ({
        ...prev,
        [cacheKey]: result
      }));

      return result;
    } catch (err) {
      // Check if this is a canceled request and handle it gracefully
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        if (err.isIntentionalCancel) {
          logger.debug(`Products request for category ${slug} was intentionally canceled`);
        } else {
          logger.warn(`Products request for category ${slug} was canceled`);
        }

        if (categoryProducts[cacheKey]) {
          return categoryProducts[cacheKey];
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        logger.error(`Products request for category ${slug} timed out:`, err.message);
        setError('Request timed out. Please check your connection and try again.');
      } else {
        logger.error(`Error fetching products for category ${slug}:`, err);
        setError(`Failed to fetch products for category ${slug}. Please try again.`);
      }

      return { products: [], pagination: { total: 0 } };
    } finally {
      setProductsLoading(false);
    }
  }, [categoryProducts, productsLoading]);

  // Clear product cache for a specific category or all categories
  const clearProductCache = useCallback((slug = null) => {
    if (slug) {
      // Clear only products for this category
      const newCache = {};
      Object.keys(categoryProducts).forEach(key => {
        if (!key.startsWith(`${slug}:`)) {
          newCache[key] = categoryProducts[key];
        }
      });
      setCategoryProducts(newCache);
    } else {
      // Clear all product cache
      setCategoryProducts({});
    }
  }, [categoryProducts]);

  // Add a function to retry fetching categories if there was an error
  const retryFetchCategories = useCallback(() => {
    setError(null);
    return fetchCategories(true); // Force refresh
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider value={{
      categories,
      subcategories,
      categoryProducts,
      loading,
      productsLoading,
      error,
      fetchCategories,
      fetchSubcategories,
      fetchProductsByCategory,
      clearSubcategoryCache,
      clearProductCache,
      retryFetchCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);

export default CategoryContext;
