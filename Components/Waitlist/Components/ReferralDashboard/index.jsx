// ReferralDashboard/index.jsx - Modern minimal design with progress + share focus
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWaitlist } from "../../../../lib/contexts/waitlist-context";
import LoadingSpinner from "../../../common/LoadingSpinner";
import { toast } from "react-hot-toast";

// Import modular components
import DashboardHeader from "./DashboardHeader";
import ProgressHero from "./Components/ProgressHero";
import StatsGrid from "./Components/StatsGrid";
import ShareSection from "./Components/ShareSection";
import TabNavigation from "./TabNavigation";
import OverviewTab from "./Tabs/OverviewTab";
import LeaderboardTab from "./Tabs/LeaderboardTab";
import AchievementsTab from "./Tabs/AchievementsTab";
import ShareModal from "./ShareModal";
import ErrorDisplay from "./ErrorDisplay";

const ReferralDashboard = () => {
  const {
    userEntry,
    getReferralStats,
    getReferralLeaderboard,
    shareReferralLink,
    isOnWaitlist,
  } = useWaitlist();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Retry function
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required functions
      if (typeof getReferralStats !== 'function') {
        throw new Error('Referral dashboard is not available at this time.');
      }

      if (typeof getReferralLeaderboard !== 'function') {
        throw new Error('Leaderboard data is not available at this time.');
      }

      // Fetch referral stats
      if (userEntry?.referralCode) {
        const stats = await getReferralStats(userEntry.referralCode);
        setReferralStats(stats);
      } else {
        setReferralStats({
          stats: {
            totalReferrals: 0,
            successfulReferrals: 0,
            pendingReferrals: 0,
            positionImprovement: 0
          },
          positionImprovement: 0
        });
      }
      
      // Fetch leaderboard data
      const leaderboardResult = await getReferralLeaderboard({ limit: 10 });
      setLeaderboardData(leaderboardResult?.leaderboard || []);
      setCurrentUserRank(leaderboardResult?.currentUserRank || null);
      setCurrentUserPosition(leaderboardResult?.currentUserPosition || userEntry?.position || null);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load referral data. Please try again later.');
      
      // Set fallback data
      setReferralStats({
        stats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingReferrals: 0,
          positionImprovement: 0
        },
        positionImprovement: 0
      });
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, [userEntry?.referralCode, getReferralStats, getReferralLeaderboard, retryCount]);

  // Fetch data on mount and retry
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (userEntry?.referralCode) {
        const stats = await getReferralStats(userEntry.referralCode);
        setReferralStats(stats);
      }
      
      const leaderboardResult = await getReferralLeaderboard({ limit: 10 });
      setLeaderboardData(leaderboardResult?.leaderboard || []);
      setCurrentUserRank(leaderboardResult?.currentUserRank || null);
      setCurrentUserPosition(leaderboardResult?.currentUserPosition || userEntry?.position || null);
      
      toast.success('Referral data refreshed!');
    } catch (err) {
      setError('Failed to refresh referral data.');
      toast.error('Failed to refresh referral data.');
    } finally {
      setLoading(false);
    }
  }, [userEntry?.referralCode, getReferralStats, getReferralLeaderboard]);

  // Handle share
  const handleShare = useCallback(async (platform) => {
    if (!userEntry?.referralCode) return;
    
    try {
      if (platform === 'copy') {
        const referralUrl = `${window.location.origin}/?ref=${userEntry.referralCode}`;
        await navigator.clipboard.writeText(referralUrl);
        toast.success('Referral link copied to clipboard!');
      } else {
        await shareReferralLink(userEntry.referralCode, platform);
        toast.success(`Shared on ${platform}!`);
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share. Please try again.');
    }
  }, [userEntry?.referralCode, shareReferralLink]);

  // Check if user has referral code
  if (!userEntry?.referralCode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl mx-auto flex items-center justify-center border border-amber-500/20">
            <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white">No Referral Code Found</h2>
            <p className="text-slate-400 leading-relaxed">
              It looks like you don't have a referral code yet. Please check your waitlist position first to generate your referral code.
            </p>
          </div>
          <button
            onClick={() => document.getElementById('position')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Check My Position
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner 
          size="md" 
          color="violet" 
          showBackground
          text="Loading your referral dashboard..."
        />
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <DashboardHeader onRefresh={handleRefresh} loading={loading} />

      {/* Hero Section - Progress + Share CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Progress Hero */}
          <ProgressHero referralStats={referralStats} userEntry={userEntry} />
          
          {/* Stats Grid */}
          <StatsGrid 
            referralStats={referralStats} 
            currentUserRank={currentUserRank} 
            currentUserPosition={currentUserPosition}
          />
          
          {/* Share Section */}
          <ShareSection 
            onShare={() => setShowShareModal(true)} 
            referralCode={userEntry?.referralCode}
            referralStats={referralStats}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab
              key="overview"
              referralStats={referralStats}
              userEntry={userEntry}
              onShare={() => setShowShareModal(true)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              key="leaderboard"
              leaderboardData={leaderboardData}
              userEntry={userEntry}
              loading={loading}
              error={error}
              onRetry={handleRetry}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab
              key="achievements"
              referralStats={referralStats}
              loading={loading}
              error={error}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        referralCode={userEntry?.referralCode}
      />
    </div>
  );
};

export default ReferralDashboard; 