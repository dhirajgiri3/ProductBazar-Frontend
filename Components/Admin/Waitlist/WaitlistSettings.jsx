'use client';

import { useAdminWaitlist } from '../../../lib/contexts/admin-waitlist-context';
import LoadingSpinner from '../../common/LoadingSpinner';
import { 
  Settings, 
  Shield, 
  Users, 
  Link, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Save,
  Zap,
  Clock,
  UserCheck,
  Share2
} from 'lucide-react';

export default function WaitlistSettings() {
  const {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings,
    fetchSettings,
    resetPositions,
    clearData,
    toggleWaitlistStatus
  } = useAdminWaitlist();

  const handleSettingChange = (key, value) => {
    // If toggling waitlist_enabled, immediately call backend toggle
    if (key === 'waitlist_enabled') {
      toggleWaitlistStatus(value).then(success => {
        if (success) {
          updateSetting(key, value);
        }
      });
    } 
    // For toggle settings, save immediately to backend
    else if (key === 'auto_approve_creators' || key === 'referral_system_enabled') {
      updateSetting(key, value);
      // Save immediately to backend
      saveSettings({ ...settings, [key]: value }).then(success => {
        if (!success) {
          // Revert on failure
          updateSetting(key, !value);
        }
      });
    } 
    // For other settings, just update local state
    else {
      updateSetting(key, value);
    }
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    await fetchSettings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" color="violet" showBackground text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Waitlist Access Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 border border-purple-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Waitlist Access</h2>
              <p className="text-gray-600">Enable or disable the waitlist system for your platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">
                {settings.waitlist_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-gray-500">
                {settings.waitlist_enabled ? 'System is active' : 'System is inactive'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.waitlist_enabled}
                onChange={e => handleSettingChange('waitlist_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 peer-focus:ring-purple-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Advanced Settings</h3>
          </div>
          <p className="text-gray-600">Configure advanced waitlist behavior and automation features</p>
        </div>
        
        <div className="space-y-8">
          {/* Auto-invitation Settings */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Auto-invitation Settings</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Auto-invite Interval (days)
                </label>
                <input
                  type="number"
                  value={settings.autoInviteInterval || ''}
                  onChange={(e) => handleSettingChange('autoInviteInterval', parseInt(e.target.value))}
                  placeholder="7"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Days between automatic invitations</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Invitation Expiry (hours)
                </label>
                <input
                  type="number"
                  value={settings.invitationExpiry || ''}
                  onChange={(e) => handleSettingChange('invitationExpiry', parseInt(e.target.value))}
                  placeholder="72"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Hours before invitation expires</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Enable Auto-invitations</h5>
                  <p className="text-xs text-gray-500">Automatically invite users based on their position in the waitlist</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.auto_approve_creators}
                  onChange={e => handleSettingChange('auto_approve_creators', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-focus:ring-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Referral System Settings */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Referral System</h4>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-green-600" />
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Enable Referral System</h5>
                  <p className="text-xs text-gray-500">Allow users to refer others and move up the waitlist</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.referral_system_enabled}
                  onChange={e => handleSettingChange('referral_system_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-focus:ring-green-500"></div>
              </label>
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">System Actions</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={resetPositions}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-200 transition-all duration-200 font-medium text-sm"
              >
                <Users className="w-4 h-4" />
                Reset Positions
              </button>
              
              <button
                onClick={clearData}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg border border-red-200 hover:bg-red-200 transition-all duration-200 font-medium text-sm"
              >
                <XCircle className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800">
                  <p className="font-medium mb-1">⚠️ Warning:</p>
                  <p>These actions are irreversible. Reset Positions will recalculate all waitlist positions, and Clear All Data will remove all waitlist entries permanently.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="
            inline-flex items-center gap-3 px-8 py-4
            bg-gradient-to-r from-purple-600 to-purple-700 text-white
            font-semibold text-base
            border-0 rounded-xl shadow-lg
            transition-all duration-200 ease-out
            hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:scale-105
            focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" showBackground />
              <span>Saving Settings...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 