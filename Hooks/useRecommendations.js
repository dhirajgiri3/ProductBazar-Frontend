import { useCallback, useState, useEffect } from 'react';
import { useRecommendation } from '../Contexts/Recommendation/RecommendationContext';
import { useAuth } from '../Contexts/Auth/AuthContext';

export const useRecommendations = (options = {}) => {
  const {
    limit = 20,
    enableFilters = true,
    autoLoadMore = true,
    defaultFilters = [],
  } = options;

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { isAuthenticated } = useAuth();
  
  const {
    fetchDiversifiedFeed,
    fetchHistoryBasedRecommendations,
    fetchCollaborativeRecommendations,
    recordInteraction,
    recommendationSettings,
    disabledTypes,
  } = useRecommendation();

  // Load initial recommendations
  useEffect(() => {
    loadInitialRecommendations();
  }, [isAuthenticated]);

  const loadInitialRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      let recs = [];
      if (isAuthenticated) {
        recs = await fetchDiversifiedFeed(limit);
      } else {
        // For non-authenticated users, get a mix of trending and new products
        recs = await fetchDiversifiedFeed(limit, true, true);
      }
      setRecommendations(recs);
      setHasMore(recs.length >= limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limit, fetchDiversifiedFeed]);

  // Load more recommendations
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      let newRecs = [];
      const offset = recommendations.length;
      
      if (isAuthenticated) {
        // Get a mix of different recommendation types
        const [diversified, collaborative, history] = await Promise.all([
          fetchDiversifiedFeed(Math.floor(limit/2), true, true),
          fetchCollaborativeRecommendations(Math.floor(limit/4)),
          fetchHistoryBasedRecommendations(Math.floor(limit/4))
        ]);
        
        newRecs = [...diversified, ...collaborative, ...history];
      } else {
        newRecs = await fetchDiversifiedFeed(limit, true, true);
      }
      
      // Filter out duplicates
      const existingIds = new Set(recommendations.map(r => r.product._id));
      const uniqueNewRecs = newRecs.filter(r => !existingIds.has(r.product._id));
      
      if (uniqueNewRecs.length > 0) {
        setRecommendations(prev => [...prev, ...uniqueNewRecs]);
        setHasMore(uniqueNewRecs.length >= limit/2);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, recommendations, isAuthenticated, limit]);

  // Handle user interactions with recommendations
  const handleInteraction = useCallback(async (productId, type, metadata = {}) => {
    try {
      await recordInteraction(productId, type, metadata);
      // Optionally refresh recommendations after significant interactions
      if (['upvote', 'bookmark'].includes(type)) {
        loadInitialRecommendations();
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [recordInteraction, loadInitialRecommendations]);

  return {
    recommendations,
    loading,
    error,
    hasMore,
    loadMore,
    handleInteraction,
    settings: recommendationSettings,
    disabledTypes,
    refresh: loadInitialRecommendations
  };
};