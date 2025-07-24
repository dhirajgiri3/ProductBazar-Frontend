'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../common/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Users, 
  Package, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  FileText,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  Mail,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Calendar,
  Hash,
  Award,
  TrendingUp,
  AlertTriangle,
  Info,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Settings,
  BarChart3,
  Filter as FilterIcon,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { getAuthToken } from '@/lib/utils/auth/auth-utils.js';

const statusColors = {
  waiting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  invited: 'bg-blue-100 text-blue-800 border-blue-200',
  onboarded: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const roleColors = {
  discoverer: 'bg-purple-100 text-purple-800 border-purple-200',
  maker: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  investor: 'bg-green-100 text-green-800 border-green-200',
  agency: 'bg-orange-100 text-orange-800 border-orange-200',
  freelancer: 'bg-blue-100 text-blue-800 border-blue-200',
  jobseeker: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons = {
  waiting: Clock,
  invited: Mail,
  onboarded: CheckCircle,
  rejected: UserX
};

export default function WaitlistEntries({ onDataChange }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState({ action: '', status: '', notes: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    cohort: '',
    dateRange: ''
  });
  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [loadingStates, setLoadingStates] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    invited: 0,
    onboarded: 0,
    rejected: 0
  });

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5004/api/v1';

  // Fetch entries with enhanced error handling
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE}/admin/waitlist/entries?${params}`, {
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
        const entries = payload.entries || [];
        setEntries(entries);
        setPagination(prev => ({
          ...prev,
          ...(payload.pagination || {})
        }));
        
        // Calculate basic stats from entries if analytics endpoint fails
        if (entries.length > 0) {
          const calculatedStats = {
            total: entries.length,
            waiting: entries.filter(entry => entry.status === 'waiting').length,
            invited: entries.filter(entry => entry.status === 'invited').length,
            onboarded: entries.filter(entry => entry.status === 'onboarded').length,
            rejected: entries.filter(entry => entry.status === 'rejected').length
          };
          console.log('Calculated stats from entries:', calculatedStats); // Debug log
          setStats(calculatedStats);
        } else {
          console.log('No entries found in response'); // Debug log
        }
      } else {
        throw new Error(data.message || 'Failed to load entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error(error.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, sorting, filters, API_BASE]);

  // Fetch statistics separately
  const fetchStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return;
      }

      // Try analytics endpoint first
      const analyticsResponse = await fetch(`${API_BASE}/admin/waitlist/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        console.log('Analytics response:', data); // Debug log
        
        if (data.success || data.status === 'success') {
          const payload = data.data || data;
          if (payload.overview && payload.overview[0]) {
            const overview = payload.overview[0];
            const newStats = {
              total: overview.totalEntries || 0,
              waiting: overview.waitingCount || 0,
              invited: overview.invitedCount || 0,
              onboarded: overview.onboardedCount || 0,
              rejected: overview.rejectedCount || 0
            };
            console.log('Setting stats from analytics:', newStats); // Debug log
            setStats(newStats);
            return; // Success, exit early
          } else {
            console.log('No overview data found in analytics payload:', payload); // Debug log
          }
        } else {
          console.log('Analytics request failed:', data); // Debug log
        }
      } else {
        console.log('Analytics request failed with status:', analyticsResponse.status); // Debug log
      }

      // Fallback to status endpoint
      console.log('Trying status endpoint as fallback...'); // Debug log
      const statusResponse = await fetch(`${API_BASE}/admin/waitlist/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Status response:', statusData); // Debug log
        
        if (statusData.success || statusData.status === 'success') {
          const statusPayload = statusData.data || statusData;
          if (statusPayload.stats) {
            const newStats = {
              total: statusPayload.stats.total || 0,
              waiting: statusPayload.stats.waiting || 0,
              invited: statusPayload.stats.invited || 0,
              onboarded: statusPayload.stats.onboarded || 0,
              rejected: statusPayload.stats.rejected || 0
            };
            console.log('Setting stats from status endpoint:', newStats); // Debug log
            setStats(newStats);
          }
        }
      } else {
        console.log('Status endpoint also failed with status:', statusResponse.status); // Debug log
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [fetchEntries, fetchStats]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (sortBy) => {
    setSorting(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectEntry = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEntries(prev => 
      prev.length === entries.length ? [] : entries.map(entry => entry._id)
    );
  };

  const handleStatusChange = async (entryId, newStatus) => {
    setLoadingStates(prev => ({ ...prev, [entryId]: true }));
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/waitlist/entries/${entryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success || data.status === 'success') {
        toast.success(`Status updated to ${newStatus}`);
        fetchEntries();
        onDataChange?.();
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction.status || selectedEntries.length === 0) {
      toast.error('Please select entries and a status');
      return;
    }

    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const payload = {
        userIds: selectedEntries,
        status: bulkAction.status
      };

      if (bulkAction.notes) {
        payload.reason = bulkAction.notes;
      }

      const response = await fetch(`${API_BASE}/admin/waitlist/batch/set-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success || data.status === 'success') {
        toast.success(`Updated ${selectedEntries.length} entries to ${bulkAction.status}`);
        setShowBulkModal(false);
        setSelectedEntries([]);
        setBulkAction({ action: '', status: '', notes: '' });
        fetchEntries();
        onDataChange?.();
      } else {
        throw new Error(data.message || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error.message || 'Bulk action failed');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/waitlist/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success || data.status === 'success') {
        toast.success('Entry deleted successfully');
        fetchEntries();
        onDataChange?.();
      } else {
        throw new Error(data.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      role: '',
      cohort: '',
      dateRange: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const exportEntries = async (format = 'json') => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_BASE}/admin/waitlist/export?${params}`, {
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
        a.download = 'waitlist-entries.csv';
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
        a.download = 'waitlist-entries.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Entries exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Waitlist Entries</h1>
              <p className="text-gray-600">Manage and monitor all waitlist registrations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-medium text-sm border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200"
            >
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => {
                fetchEntries();
                fetchStats();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium text-sm border-0 rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting</p>
                <p className="text-xl font-bold text-gray-900">{stats.waiting}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Invited</p>
                <p className="text-xl font-bold text-gray-900">{stats.invited}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarded</p>
                <p className="text-xl font-bold text-gray-900">{stats.onboarded}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email, name, company..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="invited">Invited</option>
                <option value="onboarded">Onboarded</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Roles</option>
                <option value="discoverer">Discoverer</option>
                <option value="maker">Maker</option>
                <option value="investor">Investor</option>
                <option value="agency">Agency</option>
                <option value="freelancer">Freelancer</option>
                <option value="jobseeker">Job Seeker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cohort</label>
              <input
                type="text"
                placeholder="Filter by cohort"
                value={filters.cohort}
                onChange={(e) => handleFilterChange('cohort', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedEntries.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span className="font-medium">
                {selectedEntries.length} entries selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportEntries('json')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 text-white text-sm font-medium rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-medium text-sm rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Bulk Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Entries Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEntries.length === entries.length && entries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors duration-200"
                  onClick={() => handleSortChange('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sorting.sortBy === 'email' && (
                      sorting.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors duration-200"
                  onClick={() => handleSortChange('position')}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Position
                    {sorting.sortBy === 'position' && (
                      sorting.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors duration-200"
                  onClick={() => handleSortChange('referralCount')}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Referrals
                    {sorting.sortBy === 'referralCount' && (
                      sorting.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors duration-200"
                  onClick={() => handleSortChange('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined
                    {sorting.sortBy === 'createdAt' && (
                      sorting.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <LoadingSpinner size="md" color="violet" showBackground text="Loading entries..." />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No entries found</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const StatusIcon = statusIcons[entry.status] || Clock;
                  return (
                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry._id)}
                          onChange={() => handleSelectEntry(entry._id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {entry.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{entry.email}</p>
                            {entry.companyOrProject && (
                              <p className="text-xs text-gray-500">{entry.companyOrProject}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.firstName || entry.lastName 
                          ? `${entry.firstName || ''} ${entry.lastName || ''}`.trim()
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleColors[entry.role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {entry.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={entry.status}
                            onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${statusColors[entry.status] || 'bg-gray-100 text-gray-800 border-gray-200'} ${loadingStates[entry._id] ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                            disabled={loadingStates[entry._id]}
                          >
                            <option value="waiting">Waiting</option>
                            <option value="invited">Invited</option>
                            <option value="onboarded">Onboarded</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {loadingStates[entry._id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.position ? `#${entry.position}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.referralCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            <Award className="w-3 h-3" />
                            {entry.referralCount}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteEntry(entry._id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </span>
              <div>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), currentPage: 1 }))}
                  className="text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative mx-auto p-8 w-full max-w-md shadow-2xl rounded-2xl bg-white border border-gray-200">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Bulk Status Update</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-8 text-gray-600 leading-relaxed">
              You are about to update the status of <span className="font-bold text-gray-900">{selectedEntries.length}</span> waitlist entries. Please select the new status and optionally add a note for this action.
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  New Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulkAction.status}
                  onChange={(e) => setBulkAction(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select status</option>
                  <option value="waiting">Waiting</option>
                  <option value="invited">Invited</option>
                  <option value="onboarded">Onboarded</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={bulkAction.notes}
                  onChange={(e) => setBulkAction(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add notes about this action..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => setShowBulkModal(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium text-sm border-0 rounded-lg hover:bg-purple-700 transition-all duration-200"
              >
                <Check className="w-4 h-4" />
                Apply Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 