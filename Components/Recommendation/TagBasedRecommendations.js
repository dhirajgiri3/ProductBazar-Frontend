import { useState, useCallback } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import ProductCard from '../Product/ProductCard';
import Skeleton from '../Common/Skeleton';

const TagBasedRecommendations = ({ 
  initialTags = [], 
  limit = 12,
  showHeader = true,
  className = ''
}) => {
  const { fetchTagRecommendations, recordInteraction } = useRecommendation();
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recommendations when tags change
  const fetchRecommendations = useCallback(async () => {
    if (!tags.length) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTagRecommendations(tags, { limit });
      setRecommendations(data);
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tags, limit, fetchTagRecommendations]);

  // Handle tag addition
  const handleAddTag = useCallback((tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
      setTagInput('');
      fetchRecommendations();
    }
  }, [tags, fetchRecommendations]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Handle tag input submission
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Handle product interaction
  const handleInteraction = useCallback(async (productId, type, position) => {
    await recordInteraction(productId, type, {
      tags,
      position,
      source: 'tag_based'
    });
  }, [tags, recordInteraction]);

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Discover by Tags</h2>
          <p className="text-gray-600">Find products based on your interests</p>
        </div>
      )}

      {/* Tag Input */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span 
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Enter tags (comma or enter to add)"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
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
      ) : tags.length > 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found matching these tags
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Add some tags to discover products
        </div>
      )}
    </div>
  );
};

export default TagBasedRecommendations;