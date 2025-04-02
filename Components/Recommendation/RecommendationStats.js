import React, { useState, useEffect } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import api from '../../Utils/api';
import logger from '../../Utils/logger';

const RecommendationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useRecommendation();

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await api.get('/recommendations/stats');
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to fetch recommendation stats');
        }
      } catch (err) {
        logger.error('Error fetching recommendation stats:', err);
        setError('Error loading recommendation statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) return <div>Loading stats...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Recommendation Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Cache Hit Rate"
          value={`${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(1)}%`}
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime.toFixed(0)}ms`}
        />
        <StatCard
          title="Interaction Rate"
          value={`${(stats.interactionRate * 100).toFixed(1)}%`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${(stats.conversionRate * 100).toFixed(1)}%`}
        />
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Top Performing Categories</h3>
        <div className="space-y-2">
          {stats.topCategories.map(category => (
            <div key={category.id} className="flex justify-between">
              <span>{category.name}</span>
              <span className="text-gray-600">{category.score.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Recommendation Types Performance</h3>
        <div className="space-y-2">
          {stats.recommendationTypes.map(type => (
            <div key={type.name} className="flex justify-between">
              <span>{type.name}</span>
              <span className="text-gray-600">{type.accuracy.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <div className="text-sm text-gray-600">{title}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

export default RecommendationStats;