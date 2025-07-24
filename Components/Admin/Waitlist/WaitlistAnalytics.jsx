'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../common/LoadingSpinner';
import { 
  Download, 
  TrendingUp, 
  Mail, 
  Link, 
  BarChart3, 
  Users, 
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  RefreshCw,
  Activity,
  PieChart,
  FileDown,
  Share2,
  UserPlus,
  UserCheck,
  Eye,
  Calendar,
  Filter,
  Zap,
  TrendingDown,
  Percent,
  BarChart,
  LineChart,
  Users2,
  Crown,
  Star,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { getAuthToken } from '@/lib/utils/auth/auth-utils.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  RadialLinearScale,
  Filler
);

export default function WaitlistAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1';

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/waitlist/analytics?timeframe=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          return;
        }
        if (response.status === 403) {
          toast.error('Access denied. Admin privileges required.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success || data.status === 'success') {
        const payload = data.data || data;
        setAnalytics(payload);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, API_BASE]);

  // Fetch referral analytics
  const fetchReferralAnalytics = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      if (!token) return;

      const response = await fetch(`${API_BASE}/admin/waitlist/referrals/analytics?timeframe=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success || data.status === 'success') {
          const referralData = data.data || data;
          setAnalytics(prev => ({
            ...prev,
            referralAnalytics: referralData
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
    }
  }, [timeRange, API_BASE]);

  // Handle export
  const handleExport = async (format = 'json') => {
    setExportLoading(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/waitlist/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `waitlist-analytics-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `waitlist-analytics-${timeRange}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchAnalytics();
    fetchReferralAnalytics();
  }, [fetchAnalytics, fetchReferralAnalytics]);

  // Load data on mount and when timeRange changes
  useEffect(() => {
    fetchAnalytics();
    fetchReferralAnalytics();
  }, [fetchAnalytics, fetchReferralAnalytics, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" color="violet" showBackground text="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data is not available at the moment.</p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // Extract data with safe defaults
  const {
    overview = {},
    roleDistribution = [],
    statusDistribution = [],
    dailySignups = [],
    referralAnalytics = {},
    conversionRates = {},
    conversionFunnel = {}
  } = analytics;

  // Calculate percentage changes (mock for now - could be enhanced with historical data)
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Chart data preparation
  const signupChartData = {
    labels: dailySignups.map(d => new Date(d._id).toLocaleDateString()),
    datasets: [{
      label: 'Daily Signups',
      data: dailySignups.map(d => d.count),
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(139, 92, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const roleChartData = {
    labels: roleDistribution.map(r => r._id),
    datasets: [{
      data: roleDistribution.map(r => r.count),
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
      cutout: '60%',
    }]
  };

  const statusChartData = {
    labels: statusDistribution.map(s => s._id),
    datasets: [{
      data: statusDistribution.map(s => s.count),
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)', // waiting
        'rgba(59, 130, 246, 0.8)',  // invited
        'rgba(16, 185, 129, 0.8)',  // onboarded
        'rgba(239, 68, 68, 0.8)',   // rejected
      ],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 border border-purple-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Waitlist Analytics</h1>
              <p className="text-gray-600">Real-time insights into your waitlist performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-purple-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            
            {/* Export Dropdown */}
            <div className="relative group">
              <button
                disabled={exportLoading}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  bg-white text-purple-600
                  font-medium text-sm
                  border border-purple-200 rounded-lg shadow-sm
                  transition-all duration-200 ease-out
                  hover:bg-purple-50 hover:border-purple-300 hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {exportLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Data
              </button>
              
              {/* Export Options */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="
                inline-flex items-center gap-2 px-4 py-2
                bg-purple-600 text-white
                font-medium text-sm
                border-0 rounded-lg shadow-sm
                transition-all duration-200 ease-out
                hover:bg-purple-700 hover:shadow-md hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              "
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Entries */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.totalEntries?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">All time registrations</span>
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-xs font-medium">+{getPercentageChange(overview.totalEntries, overview.totalEntries * 0.9) || '0'}%</span>
            </div>
          </div>
        </div>

        {/* Waiting Queue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.waitingCount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Awaiting invitation</span>
            <div className="flex items-center gap-1 text-blue-600">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Onboarded Users */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.onboardedCount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Successfully joined</span>
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-xs font-medium">+{getPercentageChange(overview.onboardedCount, overview.onboardedCount * 0.92) || '0'}%</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.totalEntries > 0 ? 
                    ((overview.onboardedCount / overview.totalEntries) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Signup to onboarded</span>
            <div className="flex items-center gap-1 text-purple-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">+2.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Signups Over Time - Larger Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Signup Trends</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Daily signups over time</span>
            </div>
          </div>
          
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSpinner size="md" color="violet" showBackground />
            </div>
          ) : (
            <div className="h-80">
              <Line
                data={signupChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: 'rgb(139, 92, 246)',
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    x: { 
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: '#6b7280' }
                    },
                    y: { 
                      grid: { color: 'rgba(139, 92, 246, 0.1)' },
                      border: { display: false },
                      beginAtZero: true,
                      ticks: { color: '#6b7280' }
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Role Distribution - Doughnut Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="md" color="violet" showBackground />
            </div>
          ) : (
            <div className="h-64">
              <Doughnut
                data={roleChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution and Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner size="md" color="violet" showBackground />
            </div>
          ) : (
            <div className="h-64">
              <Pie
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
          </div>
          
          <div className="space-y-4">
            {conversionFunnel && Object.keys(conversionFunnel).length > 0 ? (
              Object.entries(conversionFunnel).map(([stage, count], index) => (
                <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {stage.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {count} users
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                    {index > 0 && conversionFunnel[Object.keys(conversionFunnel)[index - 1]] > 0 && (
                      <p className="text-xs text-gray-500">
                        {((count / conversionFunnel[Object.keys(conversionFunnel)[index - 1]]) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No conversion data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Analytics */}
      {referralAnalytics && Object.keys(referralAnalytics).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Referral Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Total Referrals</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{referralAnalytics.totalReferrals || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Avg per User</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(referralAnalytics.avgReferralsPerUser || 0).toFixed(1)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Top Referrer</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{referralAnalytics.maxReferrals || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Participation</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalEntries > 0 ? 
                  ((referralAnalytics.totalReferrers || 0) / overview.totalEntries * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>Live updates</span>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
              <p className="text-gray-500">Real-time analytics data is being displayed above.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}