"use client";

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api, { makePriorityRequest } from '../../Utils/api';
import logger from '../../Utils/logger';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async (force = false) => {
    // If we already have categories and force is not true, don't fetch again
    if (categories.length > 0 && !force) {
      return categories;
    }

    try {
      setLoading(true);

      // Use the makePriorityRequest utility to ensure this request isn't canceled
      const response = await makePriorityRequest('get', '/categories');

      const fetchedCategories = response.data.data;
      setCategories(fetchedCategories);
      setError(null);
      return fetchedCategories;
    } catch (err) {
      // Check if this is a canceled request and handle it gracefully
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // If this was an intentional cancellation (due to deduplication), don't log a warning
        if (err.isIntentionalCancel) {
          logger.debug('Categories request was intentionally canceled (duplicate request)');
        } else {
          logger.warn('Categories request was canceled');
        }

        // If we already have categories, just use them
        if (categories.length > 0) {
          return categories;
        }
      } else {
        // For other errors, log and set error state
        logger.error('Error fetching categories:', err);
        setError('Failed to fetch categories');
      }
      return categories; // Return existing categories even on error
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Fetch subcategories for a specific parent category
  const fetchSubcategories = useCallback(async (parentSlug, force = false) => {
    if (!parentSlug) return [];

    try {
      // Check if we already have these subcategories cached and not forcing refresh
      if (!force && subcategories[parentSlug]) {
        return subcategories[parentSlug];
      }

      setLoading(true);
      // Use the makePriorityRequest utility to ensure this request isn't canceled
      const response = await makePriorityRequest('get', `/subcategories/parent/${parentSlug}`);

      // Cache the results
      const fetchedSubcategories = response.data.data;
      setSubcategories(prev => ({
        ...prev,
        [parentSlug]: fetchedSubcategories
      }));

      return fetchedSubcategories;
    } catch (err) {
      // Check if this is a canceled request and handle it gracefully
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // If this was an intentional cancellation (due to deduplication), don't log a warning
        if (err.isIntentionalCancel) {
          logger.debug(`Subcategories request for ${parentSlug} was intentionally canceled (duplicate request)`);
        } else {
          logger.warn(`Subcategories request for ${parentSlug} was canceled`);
        }

        // If we already have subcategories for this parent, just use them
        if (subcategories[parentSlug]) {
          return subcategories[parentSlug];
        }
      } else {
        // For other errors, log and set error state
        logger.error(`Error fetching subcategories for ${parentSlug}:`, err);
        setError('Failed to fetch subcategories');
      }

      // Return existing subcategories or empty array
      return subcategories[parentSlug] || [];
    } finally {
      setLoading(false);
    }
  }, [subcategories]);

  // Clear any cached subcategories
  const clearSubcategoryCache = useCallback(() => {
    setSubcategories({});
  }, []);

  // Load categories on mount
  useEffect(() => {
    // Only fetch if we don't already have categories
    if (categories.length === 0) {
      // Add a small delay to prevent multiple simultaneous requests on initial load
      const timer = setTimeout(() => {
        fetchCategories();
      }, Math.random() * 500); // Random delay between 0-500ms

      return () => clearTimeout(timer);
    }
  }, [fetchCategories, categories.length]);

  // Set up a refresh interval for categories
  useEffect(() => {
    // Only set up refresh if we have categories already
    if (categories.length === 0) return;

    // Set up a refresh interval for categories (every 5 minutes)
    const refreshInterval = setInterval(() => {
      // Only refresh if the user is active (not if the tab is in the background)
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchCategories(true); // Force refresh
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [fetchCategories, categories.length]);

  // Add a function to retry fetching categories if there was an error
  const retryFetchCategories = useCallback(() => {
    setError(null);
    return fetchCategories(true); // Force refresh
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider value={{
      categories,
      subcategories,
      loading,
      error,
      fetchCategories,
      fetchSubcategories,
      clearSubcategoryCache,
      retryFetchCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);

export default CategoryContext;
