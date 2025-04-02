import React, { useState, useEffect } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import RecommendationTracker from './RecommendationTracker';
import RecommendationError from './RecommendationError';
import RecommendationLoadingState from './RecommendationLoadingState';
import { Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const FilteredRecommendations = ({ maxItems = 12 }) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    getDiversifiedFeed,
    getCollaborativeRecommendations,
    getHistoryBasedRecommendations,
    recommendationTypes,
    recommendationSettings
  } = useRecommendation();

  useEffect(() => {
    loadRecommendations();
  }, [activeFilters, sortBy]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let allRecommendations = [];

      // Fetch recommendations based on active filters
      if (activeFilters.length === 0 || activeFilters.includes('all')) {
        const diversified = await getDiversifiedFeed(maxItems);
        allRecommendations = [...diversified];
      } else {
        const fetchPromises = [];
        
        if (activeFilters.includes('collaborative')) {
          fetchPromises.push(getCollaborativeRecommendations(maxItems / 2));
        }
        
        if (activeFilters.includes('history')) {
          fetchPromises.push(getHistoryBasedRecommendations(maxItems / 2));
        }

        const results = await Promise.all(fetchPromises);
        allRecommendations = results.flat();
      }

      // Apply sorting
      const sortedRecommendations = sortRecommendations(allRecommendations, sortBy);
      
      setRecommendations(sortedRecommendations.slice(0, maxItems));
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortRecommendations = (recs, sortType) => {
    switch (sortType) {
      case 'relevance':
        return [...recs].sort((a, b) => b.score - a.score);
      case 'newest':
        return [...recs].sort((a, b) => 
          new Date(b.product.createdAt) - new Date(a.product.createdAt)
        );
      case 'trending':
        return [...recs].sort((a, b) => 
          (b.product.upvoteCount || 0) - (a.product.upvoteCount || 0)
        );
      default:
        return recs;
    }
  };

  const handleFilterToggle = (filter) => {
    setActiveFilters(prev => {
      if (filter === 'all') {
        return ['all'];
      }
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev.filter(f => f !== 'all'), filter];
      return newFilters.length === 0 ? ['all'] : newFilters;
    });
  };

  if (error) {
    return <RecommendationError error={error} onRetry={loadRecommendations} />;
  }

  if (loading) {
    return <RecommendationLoadingState count={maxItems} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            onClick={() => handleFilterToggle('all')}
            color={activeFilters.includes('all') ? 'primary' : 'default'}
            variant={activeFilters.includes('all') ? 'filled' : 'outlined'}
          />
          {Object.keys(recommendationTypes).map(type => (
            <Chip
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              onClick={() => handleFilterToggle(type)}
              color={activeFilters.includes(type) ? 'primary' : 'default'}
              variant={activeFilters.includes(type) ? 'filled' : 'outlined'}
            />
          ))}
        </div>

        <FormControl size="small" className="min-w-[200px]">
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="trending">Trending</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(recommendation => (
          <RecommendationTracker
            key={recommendation.product._id}
            productId={recommendation.product._id}
            recommendationType={recommendation.reason}
          >
            <div className="bg-white rounded-lg shadow p-4">
              {/* Recommendation content here */}
              <h3 className="font-semibold">{recommendation.product.name}</h3>
              <p className="text-sm text-gray-600">{recommendation.explanationText}</p>
            </div>
          </RecommendationTracker>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No recommendations match your filters
        </div>
      )}
    </div>
  );
};

export default FilteredRecommendations;