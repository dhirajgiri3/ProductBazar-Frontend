'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../lib/contexts/auth-context';
import LoadingSpinner from '../../../Components/common/LoadingSpinner';
import ErrorMessage from '../../../Components/common/ErrorMessage';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  Activity,
  Target,
  PieChart
} from 'lucide-react';
import { getAuthToken } from '@/lib/utils/auth/auth-utils.js';

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1';

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setError('You must be logged in to access this page');
        setLoading(false);
      } else if (user?.role !== 'admin') {
        setError('You do not have permission to access this page');
        setLoading(false);
      } else {
        fetchAnalytics();
      }
    }
  }, [isAuthenticated, user, authLoading]);

  const fetchAnalytics = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/analytics`, {
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
      
      if (data.status === 'success' && data.data) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'waitlist', name: 'Waitlist', icon: <UserCheck size={16} /> },
    { id: 'users', name: 'Users', icon: <Users size={16} /> },
    { id: 'products', name: 'Products', icon: <Target size={16} /> },
    { id: 'growth', name: 'Growth', icon: <TrendingUp size={16} /> }
  ];

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" color="violet" showBackground fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive platform analytics and insights for data-driven decisions.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.users?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Waitlist Entries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.waitlist?.totalEntries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.products?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.sessions?.active || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">New users today</span>
                        <span className="font-medium">{analytics?.recent?.newUsers || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">New products today</span>
                        <span className="font-medium">{analytics?.recent?.newProducts || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Waitlist signups today</span>
                        <span className="font-medium">{analytics?.recent?.waitlistSignups || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Waitlist status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analytics?.waitlist?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {analytics?.waitlist?.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">System health</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Healthy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'waitlist' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Waitlist Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Waiting</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                      {analytics?.waitlist?.waitingCount || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Onboarded</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      {analytics?.waitlist?.onboardedCount || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">Invited</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-2">
                      {analytics?.waitlist?.invitedCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">User analytics data will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Product analytics data will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === 'growth' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Growth metrics and trends will be displayed here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 