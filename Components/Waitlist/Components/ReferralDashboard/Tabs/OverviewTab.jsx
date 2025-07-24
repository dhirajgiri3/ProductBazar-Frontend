import React from "react";
import { motion } from "framer-motion";
import { Target, Crown, Star, Trophy, Rocket, CheckCircle } from "lucide-react";

const OverviewTab = ({ referralStats, userEntry, onShare }) => {
  // Consistent tier structure with ProgressHero
  const tiers = [
    { name: 'Explorer', min: 0, max: 4, reward: 'Early Access', icon: Target, color: '#64748b', description: 'Start your journey' },
    { name: 'Advocate', min: 5, max: 14, reward: 'Priority Support', icon: Rocket, color: '#3b82f6', description: 'Building momentum' },
    { name: 'Champion', min: 15, max: 34, reward: 'VIP Features', icon: Trophy, color: '#10b981', description: 'Making an impact' },
    { name: 'Legend', min: 35, max: 74, reward: 'Partnership', icon: Star, color: '#f59e0b', description: 'Elite status' },
    { name: 'Master', min: 75, max: Infinity, reward: 'Equity Access', icon: Crown, color: '#8b5cf6', description: 'Ultimate achievement' }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Tier Journey - Unique Timeline Design */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-light text-white mb-2">Your Growth Journey</h3>
          <p className="text-slate-400">Track your progress through each milestone</p>
        </div>
        
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 to-slate-600" />
          
          <div className="space-y-6">
            {tiers.map((tier, index) => {
              const IconComponent = tier.icon;
              const isActive = tier.name === currentTier.name;
              const isCompleted = userReferrals >= tier.min;
              const isNext = !isActive && !isCompleted && index === tiers.findIndex(t => userReferrals < t.min);
              
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-center gap-6"
                >
                  {/* Progress Dot */}
                  <div className="relative z-10">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all backdrop-blur-sm ${
                        isActive 
                          ? 'border-white/30 bg-white/10 shadow-lg shadow-white/10' 
                          : isCompleted 
                            ? 'border-emerald-500/30 bg-emerald-500/10' 
                            : 'border-slate-700/50 bg-slate-800/30'
                      }`}
                      style={isActive ? { borderColor: `${tier.color}40` } : {}}
                    >
                      <IconComponent 
                        className={`w-7 h-7 transition-all ${
                          isActive ? 'scale-110' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                        style={isActive ? { color: tier.color } : {}}
                      />
                      {isCompleted && !isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier Info */}
                  <div className="flex-1">
                    <div 
                      className={`p-6 rounded-2xl border transition-all backdrop-blur-sm ${
                        isActive 
                          ? 'bg-white/10 border-white/20 shadow-lg' 
                          : isCompleted 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-slate-900/30 border-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-medium text-white">{tier.name}</h4>
                          {isActive && (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                          {isCompleted && !isActive && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                              Completed
                            </span>
                          )}
                          {isNext && (
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                              Next
                            </span>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-white/60">
                            {tier.min} - {tier.max === Infinity ? '∞' : tier.max}
                          </p>
                          <p className="text-xs text-white/40">connections</p>
                        </div>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-2">{tier.reward}</p>
                      <p className="text-white/60 text-xs">{tier.description}</p>
                      
                      {isActive && nextTierProgress.nextTier && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-white/60">Progress to {nextTierProgress.nextTier.name}</span>
                            <span className="text-white font-medium">{Math.round(nextTierProgress.progress)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <motion.div
                              className="h-1.5 rounded-full"
                              style={{ backgroundColor: tier.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${nextTierProgress.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats - Compact Version */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-light text-white">{userReferrals}</p>
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
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-light text-white">+{referralStats?.positionImprovement || 0}</p>
              <p className="text-sm text-white/60">Positions gained</p>
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
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${currentTier.color}20` }}
            >
              <currentTier.icon className="w-6 h-6" style={{ color: currentTier.color }} />
            </div>
            <div>
              <p className="text-lg font-medium text-white">{currentTier.name}</p>
              <p className="text-sm text-white/60">Current tier</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewTab; 