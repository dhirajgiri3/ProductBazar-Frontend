import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Crown, Star, Trophy, Rocket, TrendingUp, Users } from "lucide-react";

const ProgressHero = ({ referralStats, userEntry }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Simplified tier structure
  const tiers = [
    { name: 'Explorer', min: 0, max: 4, reward: 'Early Access', icon: Target, color: '#64748b' },
    { name: 'Advocate', min: 5, max: 14, reward: 'Priority Support', icon: Rocket, color: '#3b82f6' },
    { name: 'Champion', min: 15, max: 34, reward: 'VIP Features', icon: Trophy, color: '#10b981' },
    { name: 'Legend', min: 35, max: 74, reward: 'Partnership', icon: Star, color: '#f59e0b' },
    { name: 'Master', min: 75, max: Infinity, reward: 'Equity Access', icon: Crown, color: '#8b5cf6' }
  ];

  const getCurrentTier = (referralCount) => {
    return tiers.find(tier => referralCount >= tier.min && referralCount <= tier.max) || tiers[0];
  };

  const getNextTierProgress = (referralCount) => {
    const currentTier = getCurrentTier(referralCount);
    const nextTier = tiers[tiers.indexOf(currentTier) + 1];
    
    if (!nextTier) return { progress: 100, nextTier: null };
    
    const progress = Math.min(100, 
      ((referralCount - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    );
    return { progress, nextTier };
  };

  const userReferrals = referralStats?.stats?.totalReferrals || 0;
  const currentTier = getCurrentTier(userReferrals);
  const nextTierProgress = getNextTierProgress(userReferrals);
  const positionImprovement = referralStats?.positionImprovement || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(nextTierProgress.progress);
    }, 800);
    return () => clearTimeout(timer);
  }, [nextTierProgress.progress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="col-span-12 lg:col-span-8 bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8"
        >
          <div className="grid grid-cols-5 gap-8 items-center">
            
            {/* Progress Ring */}
            <div className="col-span-2 flex justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke={currentTier.color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 0, strokeDashoffset: 502 }}
                    animate={{ 
                      strokeDasharray: `${animatedProgress * 5.02} 502`,
                      strokeDashoffset: 0 
                    }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light text-white mb-1">{userReferrals}</span>
                  <span className="text-sm text-white/60">connections</span>
                </div>
              </div>
            </div>

            {/* Tier Info */}
            <div className="col-span-3 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentTier.color}20` }}
                  >
                    <currentTier.icon 
                      className="w-6 h-6" 
                      style={{ color: currentTier.color }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-white">{currentTier.name}</h2>
                    <p className="text-sm text-white/60">Current tier</p>
                  </div>
                </div>
              </div>

              {/* Progress to Next */}
              {nextTierProgress.nextTier && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Next: {nextTierProgress.nextTier.name}</span>
                    <span className="text-white">{Math.round(animatedProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: nextTierProgress.nextTier.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {nextTierProgress.nextTier.min - userReferrals} more to unlock {nextTierProgress.nextTier.name}
                  </p>
                </div>
              )}

              {/* Current Reward */}
              <div className="pt-4 border-t border-slate-800/50">
                <p className="text-xs text-white/60 mb-1">Current reward</p>
                <p className="text-white font-medium">{currentTier.reward}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Positions Gained */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Positions</p>
                <p className="text-xl font-light text-white">+{positionImprovement}</p>
              </div>
            </div>
          </motion.div>

          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Network</p>
                <p className="text-xl font-light text-white">{userReferrals}</p>
              </div>
            </div>
          </motion.div>

          {/* Next Milestone */}
          {nextTierProgress.nextTier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="col-span-2 lg:col-span-1 bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${nextTierProgress.nextTier.color}20` }}
                >
                  <nextTierProgress.nextTier.icon 
                    className="w-5 h-5" 
                    style={{ color: nextTierProgress.nextTier.color }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60">Next milestone</p>
                  <p className="text-sm font-medium text-white">{nextTierProgress.nextTier.name}</p>
                  <p className="text-xs text-white/60 mt-1">{nextTierProgress.nextTier.reward}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressHero;
