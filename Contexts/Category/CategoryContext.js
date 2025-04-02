"use client";

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../../Utils/api';
import logger from '../../Utils/logger';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      logger.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subcategories for a specific parent category
  const fetchSubcategories = useCallback(async (parentSlug) => {
    if (!parentSlug) return [];
    
    try {
      // Check if we already have these subcategories cached
      if (subcategories[parentSlug]) {
        return subcategories[parentSlug];
      }
      
      setLoading(true);
      const response = await api.get(`/subcategories/parent/${parentSlug}`);
      
      // Cache the results
      setSubcategories(prev => ({
        ...prev,
        [parentSlug]: response.data.data
      }));
      
      return response.data.data;
    } catch (err) {
      logger.error(`Error fetching subcategories for ${parentSlug}:`, err);
      setError('Failed to fetch subcategories');
      return [];
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
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider value={{
      categories,
      subcategories,
      loading,
      error,
      fetchCategories,
      fetchSubcategories,
      clearSubcategoryCache
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);

export default CategoryContext;
