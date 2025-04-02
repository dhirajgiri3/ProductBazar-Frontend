import React, { useState, useEffect } from 'react';
import { api } from '../../Utils/api';
import { Card, Table, Spin, Alert, Row, Col, Statistic } from 'antd';

const RecommendationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/recommendations/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        setError('Failed to load recommendation statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Cache Hit Rate" value={stats.cacheHitRate} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Active Users" value={stats.activeUsers} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Recommendations" value={stats.totalRecommendations} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Avg Response Time" value={stats.avgResponseTime} suffix="ms" />
          </Card>
        </Col>
      </Row>

      <Card title="Cache Statistics" style={{ marginTop: 16 }}>
        <Table
          dataSource={[{
            type: 'Cache Size',
            value: `${stats.cacheSize} MB`,
            keys: stats.cacheKeys,
            hitRate: `${stats.typeHitRates.all}%`
          },
          ...Object.entries(stats.typeHitRates).filter(([type]) => type !== 'all').map(([type, rate]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            value: `${stats.typeCounts[type] || 0} items`,
            keys: stats.typeKeys[type] || 0,
            hitRate: `${rate}%`
          }))]}
          columns={[
            { title: 'Type', dataIndex: 'type' },
            { title: 'Value', dataIndex: 'value' },
            { title: 'Keys', dataIndex: 'keys' },
            { title: 'Hit Rate', dataIndex: 'hitRate' }
          ]}
          pagination={false}
        />
      </Card>

      <Card title="Performance Metrics" style={{ marginTop: 16 }}>
        <Table
          dataSource={stats.performanceMetrics}
          columns={[
            { title: 'Metric', dataIndex: 'name' },
            { title: 'Last Hour', dataIndex: 'lastHour' },
            { title: 'Last Day', dataIndex: 'lastDay' },
            { title: 'Last Week', dataIndex: 'lastWeek' }
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default RecommendationStats;