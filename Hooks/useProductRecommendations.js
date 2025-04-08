// import { useCallback, useState, useEffect } from 'react';
// import { useAuth } from '../Contexts/Auth/AuthContext';
// import api from '../Utils/api';
// import logger from '../Utils/logger';

// /**
//  * Custom hook for handling product recommendations
//  * Provides methods for fetching personalized product recommendations
//  */
// const useProductRecommendations = (options = {}) => {
//   const {
//     limit = 10,
//     loadOnMount = true,
//     type = 'personalized',
//     categoryId = null,
//     productId = null
//   } = options;
  
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
  
//   const { isAuthenticated, user } = useAuth();

//   // Fetch personalized recommendations for the user
//   const fetchPersonalizedRecommendations = useCallback(async (params = {}) => {
//     try {
//       setLoading(true);
      
//       // For non-authenticated users, fetch trending recommendations
//       const endpoint = isAuthenticated
//         ? '/recommendations/personalized'
//         : '/recommendations/trending';
      
//       const response = await api.get(endpoint, {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch recommendations');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching personalized recommendations:', err);
//       setError('Failed to load recommendations');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, limit]);

//   // Fetch diversified feed of recommendations
//   const fetchDiversifiedFeed = useCallback(async (params = {}) => {
//     try {
//       setLoading(true);
      
//       const response = await api.get('/recommendations/feed', {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch recommendations');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching diversified recommendations:', err);
//       setError('Failed to load recommendations');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   // Fetch category-based recommendations
//   const fetchCategoryRecommendations = useCallback(async (categoryId, params = {}) => {
//     if (!categoryId) {
//       setError('Category ID is required');
//       return [];
//     }
    
//     try {
//       setLoading(true);
      
//       const response = await api.get(`/recommendations/category/${categoryId}`, {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch category recommendations');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching category recommendations:', err);
//       setError('Failed to load recommendations');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   // Fetch similar products
//   const fetchSimilarProducts = useCallback(async (productId, params = {}) => {
//     if (!productId) {
//       setError('Product ID is required');
//       return [];
//     }
    
//     try {
//       setLoading(true);
      
//       const response = await api.get(`/recommendations/similar/${productId}`, {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch similar products');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching similar products:', err);
//       setError('Failed to load similar products');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   // Fetch trending recommendations
//   const fetchTrendingRecommendations = useCallback(async (params = {}) => {
//     try {
//       setLoading(true);
      
//       const response = await api.get('/recommendations/trending', {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch trending recommendations');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching trending recommendations:', err);
//       setError('Failed to load recommendations');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   // Fetch new product recommendations
//   const fetchNewProductRecommendations = useCallback(async (params = {}) => {
//     try {
//       setLoading(true);
      
//       const response = await api.get('/recommendations/new', {
//         params: {
//           limit: params.limit || limit,
//           ...params
//         }
//       });
      
//       if (response.data.success) {
//         const recs = response.data.data || [];
//         setRecommendations(recs);
//         setHasMore(recs.length >= (params.limit || limit));
//         return recs;
//       } else {
//         setError(response.data.message || 'Failed to fetch new product recommendations');
//         return [];
//       }
//     } catch (err) {
//       logger.error('Error fetching new product recommendations:', err);
//       setError('Failed to load recommendations');
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [limit]);

//   // Record a product interaction to improve recommendations
//   const recordInteraction = useCallback(async (productId, interactionType, metadata = {}) => {
//     if (!productId || !interactionType) {
//       return false;
//     }
    
//     if (!isAuthenticated) {
//       // Silently ignore for non-logged in users
//       return false;
//     }
    
//     try {
//       const response = await api.post('/recommendations/interaction', {
//         productId,
//         interactionType,
//         metadata
//       });
      
//       return response.data.success;
//     } catch (err) {
//       logger.error(`Error recording ${interactionType} interaction:`, err);
//       return false;
//     }
//   }, [isAuthenticated]);

//   // Clear recommendations error
//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   // Load recommendations based on the specified type when component mounts
//   useEffect(() => {
//     if (loadOnMount) {
//       const loadRecommendations = async () => {
//         switch (type) {
//           case 'personalized':
//             await fetchPersonalizedRecommendations();
//             break;
//           case 'feed':
//             await fetchDiversifiedFeed();
//             break;
//           case 'category':
//             if (categoryId) {
//               await fetchCategoryRecommendations(categoryId);
//             }
//             break;
//           case 'similar':
//             if (productId) {
//               await fetchSimilarProducts(productId);
//             }
//             break;
//           case 'trending':
//             await fetchTrendingRecommendations();
//             break;
//           case 'new':
//             await fetchNewProductRecommendations();
//             break;
//           default:
//             await fetchPersonalizedRecommendations();
//         }
//       };
      
//       loadRecommendations();
//     }
//   }, [
//     loadOnMount,
//     type,
//     categoryId,
//     productId,
//     fetchPersonalizedRecommendations,
//     fetchDiversifiedFeed,
//     fetchCategoryRecommendations,
//     fetchSimilarProducts,
//     fetchTrendingRecommendations,
//     fetchNewProductRecommendations
//   ]);

//   return {
//     recommendations,
//     loading,
//     error,
//     hasMore,
//     clearError,
//     fetchPersonalizedRecommendations,
//     fetchDiversifiedFeed,
//     fetchCategoryRecommendations,
//     fetchSimilarProducts,
//     fetchTrendingRecommendations,
//     fetchNewProductRecommendations,
//     recordInteraction
//   };
// };

// export default useProductRecommendations;