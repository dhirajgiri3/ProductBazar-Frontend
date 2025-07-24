'use client';

import { useState } from 'react';
import { useAdminWaitlist } from '../../../lib/contexts/admin-waitlist-context';
import WaitlistAnalytics from './WaitlistAnalytics';
import WaitlistEntries from './WaitlistEntries';
import WaitlistSettings from './WaitlistSettings';
import LoadingSpinner from '../../common/LoadingSpinner';
import { 
  BarChart3, 
  Users, 
  Settings, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar 
} from 'lucide-react';

const tabs = [
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'entries', name: 'Entries', icon: Users },
  { id: 'settings', name: 'Settings', icon: Settings }
];

export default function WaitlistDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const { analytics, loading, refreshData } = useAdminWaitlist();

  const handleRefresh = () => {
    refreshData();
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="md" color="violet" showBackground text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative whitespace-nowrap py-6 px-1 border-b-2 font-medium text-sm
                    transition-all duration-200 ease-out
                    flex items-center gap-3
                    ${activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'analytics' && (
            <WaitlistAnalytics 
              analytics={analytics} 
              loading={loading}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === 'entries' && (
            <WaitlistEntries 
              onDataChange={handleRefresh}
            />
          )}
          {activeTab === 'settings' && (
            <WaitlistSettings />
          )}
        </div>
      </div>
    </div>
  );
} 