import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Target, Rocket, Star, Trophy, Crown, TrendingUp, Medal, Award } from "lucide-react";
import LoadingSpinner from "../../../../common/LoadingSpinner";
import ErrorDisplay from "../ErrorDisplay";

const LeaderboardTab = ({ leaderboardData, userEntry, loading, error, onRetry }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const tabVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      x: -24,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner 
          size="md" 
          color="violet" 
          showBackground
          text="Loading leaderboard..."
        />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  const totalConnections = leaderboardData.reduce((sum, user) => sum + (user.referralCount || 0), 0);
  const userRank = leaderboardData.findIndex(user => user.email === userEntry?.email) + 1;

  return (
    <motion.div
      key="leaderboard"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-3xl font-light text-white mb-2">Community Leaders</h3>
          <p className="text-slate-400">Top referrers driving our growth</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">{totalConnections}</p>
                <p className="text-sm text-white/60">Total connections</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">{leaderboardData.length}</p>
                <p className="text-sm text-white/60">Active referrers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">#{userRank || 'N/A'}</p>
                <p className="text-sm text-white/60">Your rank</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="space-y-6">
          <h4 className="text-xl font-medium text-white text-center">Top Performers</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <motion.div
                key={user._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all ${
                  index === 0 ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30' :
                  index === 1 ? 'bg-gradient-to-br from-slate-500/20 to-gray-500/20 border-slate-500/30' :
                  'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
                }`}
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-amber-500' :
                    index === 1 ? 'bg-slate-500' :
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                    index === 0 ? 'bg-amber-500/20' :
                    index === 1 ? 'bg-slate-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    {index === 0 ? <Crown className="w-8 h-8 text-amber-400" /> :
                     index === 1 ? <Medal className="w-8 h-8 text-slate-400" /> :
                     <Award className="w-8 h-8 text-orange-400" />}
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0]}
                    </h5>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-light text-white">{user.referralCount || 0}</p>
                    <p className="text-xs text-white/60">connections</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-6">
        <h4 className="text-xl font-medium text-white text-center">Complete Rankings</h4>
        <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 overflow-hidden">
          {leaderboardData.length > 0 ? (
            <div className="divide-y divide-slate-800/50">
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={`p-6 hover:bg-white/5 transition-all duration-300 ${
                    user.email === userEntry?.email 
                      ? 'bg-indigo-500/10 border-l-4 border-indigo-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                        index < 3 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-slate-800/50'
                      }`}>
                        {index < 3 ? 
                          <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span> : 
                          <span className="text-sm">{index + 1}</span>
                        }
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-white">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0]}
                          </h5>
                          {user.email === userEntry?.email && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span>+{user.positionImprovement || (user.referralCount * 5)} positions</span>
                          {user.tier && (
                            <>
                              <div className="w-1 h-1 bg-white/30 rounded-full" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.tier === 'Master' ? 'bg-purple-500/20 text-purple-400' :
                                user.tier === 'Legend' ? 'bg-amber-500/20 text-amber-400' :
                                user.tier === 'Champion' ? 'bg-emerald-500/20 text-emerald-400' :
                                user.tier === 'Advocate' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {user.tier}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-2xl font-light text-white">{user.referralCount || 0}</p>
                      <p className="text-sm text-white/60">connections</p>
                      
                      {/* Status Icon */}
                      <div className="flex items-center justify-center mt-2">
                        {user.referralCount >= 35 ? (
                          <div className="flex items-center gap-1">
                            <Crown className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-400">Elite</span>
                          </div>
                        ) : user.referralCount >= 15 ? (
                          <div className="flex items-center gap-1">
                            <Rocket className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Rising</span>
                          </div>
                        ) : user.referralCount >= 5 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-amber-400">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
            
                            <span className="text-xs text-slate-500">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">No leaderboard data available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardTab; 