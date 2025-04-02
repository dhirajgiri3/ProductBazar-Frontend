import { useState, useEffect, useCallback } from 'react';
import { useRecommendation } from '../Contexts/Recommendation/RecommendationContext';
import useDebounce from './useDebounce';

export const useRecommendationData = (type, options = {}) => {
  const {
    fetchDiversifiedFeed,
    fetchTrendingProducts,
    fetchNewProducts,
    fetchCategoryRecommendations,
    fetchCollaborativeRecommendations,
    fetchHistoryBasedRecommendations,
    fetchSimilarProducts,
    loading,
    errors
  } = useRecommendation();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedOptions = useDebounce(options, 300);

  const fetchData = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      let result = [];
      switch (type) {
        case 'feed':
          result = await fetchDiversifiedFeed(options.limit, options.includeNew, options.includeTrending, force);
          break;
        case 'trending':
          result = await fetchTrendingProducts(options.limit, force);
          break;
        case 'new':
          result = await fetchNewProducts(options.limit, options.days, force);
          break;
        case 'category':
          result = await fetchCategoryRecommendations(options.categoryId, options.limit, force);
          break;
        case 'collaborative':
          result = await fetchCollaborativeRecommendations(options.limit, force);
          break;
        case 'history':
          result = await fetchHistoryBasedRecommendations(options.limit, options.timeframe, force);
          break;
        case 'similar':
          result = await fetchSimilarProducts(options.productId, options.limit, options.similarityType, force);
          break;
        default:
          setError('Invalid recommendation type');
          return;
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [type, debouncedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading: isLoading || loading[type],
    error: error || errors[type],
    refresh
  };
};