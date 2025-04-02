import { useState, useCallback } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import ProductCard from '../Product/ProductCard';
import Skeleton from '../Common/Skeleton';

const PersonalizedRecommendations = ({
  limit = 12,
  showHeader = true,
  className = ''
}) => {
  const { getDiversifiedFeed, recordInteraction } = useRecommendation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDiversifiedFeed(limit);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit, getDiversifiedFeed]);

  // Handle product interaction
  const handleInteraction = useCallback(async (productId, type, position) => {
    await recordInteraction(productId, type, {
      source: 'personalized_feed',
      position,
    });
  }, [recordInteraction]);

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-center py-8 text-red-500`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Recommended for You</h2>
          <p className="text-gray-600">Personalized picks based on your interests</p>
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <ProductCard
              key={rec.product._id}
              product={rec.product}
              reason={rec.reason}
              onInteraction={(type) => handleInteraction(rec.product._id, type, index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No recommendations available yet. Try interacting with more products!
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;