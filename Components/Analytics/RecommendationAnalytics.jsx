import React, { useState, useEffect } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import api from '../../Utils/api';

const RecommendationAnalytics = () => {
    const [metrics, setMetrics] = useState({
        clickThroughRate: 0,
        conversionRate: 0,
        averageEngagement: 0,
        topSources: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { interactionHistory } = useRecommendation();

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/recommendations/analytics');
                if (response.data.success) {
                    setMetrics(response.data.data);
                }
            } catch (err) {
                setError('Failed to load recommendation metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [interactionHistory]);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recommendation Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                    <h3 className="text-sm text-gray-600">Click-through Rate</h3>
                    <p className="text-2xl font-semibold">{(metrics.clickThroughRate * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <h3 className="text-sm text-gray-600">Conversion Rate</h3>
                    <p className="text-2xl font-semibold">{(metrics.conversionRate * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <h3 className="text-sm text-gray-600">Avg. Engagement</h3>
                    <p className="text-2xl font-semibold">{metrics.averageEngagement.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <h3 className="text-sm text-gray-600">Top Sources</h3>
                    <ul className="text-sm">
                        {metrics.topSources.slice(0, 3).map((source, idx) => (
                            <li key={idx}>{source.name}: {source.percentage}%</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RecommendationAnalytics;