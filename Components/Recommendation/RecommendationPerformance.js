import React, { useState, useEffect } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import { LineChart } from '@mui/x-charts';

const RecommendationPerformance = () => {
  const { getInteractionStats } = useRecommendation();
  const [performanceData, setPerformanceData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [timeframe, setTimeframe] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeframe]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const stats = await getInteractionStats();
      
      // Process stats into time series data
      if (stats) {
        setPerformanceData({
          daily: stats.dailyPerformance || [],
          weekly: stats.weeklyPerformance || [],
          monthly: stats.monthlyPerformance || []
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading performance data...</div>;

  const data = performanceData[timeframe];
  if (!data.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <LineChart
          series={[
            {
              data: data.map(d => d.clickThroughRate * 100),
              label: 'Click-through Rate (%)'
            },
            {
              data: data.map(d => d.conversionRate * 100),
              label: 'Conversion Rate (%)'
            }
          ]}
          xAxis={[{
            data: data.map(d => new Date(d.timestamp)),
            scaleType: 'time'
          }]}
          height={300}
          margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.slice(-1)[0] && (
          <>
            <MetricCard
              label="Click-through Rate"
              value={`${(data.slice(-1)[0].clickThroughRate * 100).toFixed(1)}%`}
              change={calculateChange(data, 'clickThroughRate')}
            />
            <MetricCard
              label="Conversion Rate"
              value={`${(data.slice(-1)[0].conversionRate * 100).toFixed(1)}%`}
              change={calculateChange(data, 'conversionRate')}
            />
            <MetricCard
              label="Avg. Engagement Time"
              value={`${data.slice(-1)[0].avgEngagementTime}s`}
              change={calculateChange(data, 'avgEngagementTime')}
            />
            <MetricCard
              label="Relevance Score"
              value={`${(data.slice(-1)[0].relevanceScore * 100).toFixed(1)}%`}
              change={calculateChange(data, 'relevanceScore')}
            />
          </>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, change }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    {change !== null && (
      <div className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </div>
    )}
  </div>
);

const calculateChange = (data, metric) => {
  if (data.length < 2) return null;
  const current = data[data.length - 1][metric];
  const previous = data[data.length - 2][metric];
  return ((current - previous) / previous) * 100;
};

export default RecommendationPerformance;