import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Share2, Zap, Crown, Activity, Award, CheckCircle2, Target, 
  Trophy, Star, Rocket, Gift, Lock, Unlock, TrendingUp, Users, Medal
} from "lucide-react";
import LoadingSpinner from "../../../../common/LoadingSpinner";
import ErrorDisplay from "../ErrorDisplay";

const AchievementsTab = ({ referralStats, loading, error, onRetry }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced achievement system with categories
  const achievementDefinitions = [
    {
      id: 'first_referral',
      name: 'First Steps',
      description: 'Welcome to the program! Your first referral unlocks the journey.',
      icon: Star,
      threshold: 1,
      reward: '+10 bonus positions',
      category: 'milestone',
      color: 'blue'
    },
    {
      id: 'social_sharer',
      name: 'Social Butterfly',
      description: 'Share across multiple platforms to maximize your reach.',
      icon: Share2,
      threshold: 3,
      reward: 'Priority support badge',
      category: 'social',
      color: 'purple'
    },
    {
      id: 'power_referrer',
      name: 'Power Referrer',
      description: 'You\'re building serious momentum in the community.',
      icon: Zap,
      threshold: 10,
      reward: 'Beta features access',
      category: 'milestone',
      color: 'emerald'
    },
    {
      id: 'influence_master',
      name: 'Influence Master',
      description: 'Your network trusts your recommendations.',
      icon: Crown,
      threshold: 25,
      reward: 'VIP status upgrade',
      category: 'milestone',
      color: 'amber'
    },
    {
      id: 'viral_creator',
      name: 'Viral Creator',
      description: 'You\'ve created a viral effect in your network.',
      icon: Activity,
      threshold: 50,
      reward: 'Revenue sharing program',
      category: 'milestone',
      color: 'purple'
    },
    {
      id: 'community_leader',
      name: 'Community Leader',
      description: 'You\'re among the top contributors to our growth.',
      icon: Award,
      threshold: 'top10',
      reward: 'Leadership council invite',
      category: 'special',
      color: 'rose'
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'You joined the waitlist early and helped shape the platform.',
      icon: Star,
      threshold: 'early',
      reward: 'Founder badge',
      category: 'special',
      color: 'amber'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Reached 5 referrals in your first week.',
      icon: Rocket,
      threshold: 'speed',
      reward: 'Accelerated access',
      category: 'special',
      color: 'emerald'
    },
    {
      id: 'generous_giver',
      name: 'Generous Giver',
      description: 'Helped 20+ people join the platform.',
      icon: Gift,
      threshold: 20,
      reward: 'Community ambassador',
      category: 'milestone',
      color: 'pink'
    },
    {
      id: 'network_builder',
      name: 'Network Builder',
      description: 'Connected with diverse groups of people.',
      icon: Users,
      threshold: 15,
      reward: 'Networking events access',
      category: 'social',
      color: 'indigo'
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintained steady referral activity for 30 days.',
      icon: TrendingUp,
      threshold: 'consistency',
      reward: 'Reliability badge',
      category: 'special',
      color: 'emerald'
    },
    {
      id: 'quality_connector',
      name: 'Quality Connector',
      description: 'All your referrals completed their onboarding.',
      icon: Medal,
      threshold: 'quality',
      reward: 'Quality assurance badge',
      category: 'special',
      color: 'blue'
    }
  ];

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
          fullScreen
          text="Loading achievements..."
        />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  const referralCount = referralStats?.stats?.totalReferrals || 0;
  const completedAchievements = achievementDefinitions.filter(achievement => {
    if (achievement.threshold === 'top10') return false;
    if (achievement.threshold === 'early') return true; // Early adopter
    if (achievement.threshold === 'speed') return referralCount >= 5;
    if (achievement.threshold === 'consistency') return false; // Would need tracking
    if (achievement.threshold === 'quality') return false; // Would need tracking
    return referralCount >= achievement.threshold;
  }).length;

  const filteredAchievements = selectedCategory === 'all' 
    ? achievementDefinitions 
    : achievementDefinitions.filter(achievement => achievement.category === selectedCategory);

  return (
    <motion.div
      key="achievements"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-3xl font-light text-white mb-2">Your Achievements</h3>
          <p className="text-slate-400">Unlock rewards as you hit milestones</p>
        </div>
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">{completedAchievements}</p>
                <p className="text-sm text-white/60">Achievements unlocked</p>
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
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">{referralCount}</p>
                <p className="text-sm text-white/60">Total connections</p>
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
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">{Math.round((completedAchievements / achievementDefinitions.length) * 100)}%</p>
                <p className="text-sm text-white/60">Completion rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-2">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', icon: Trophy },
              { key: 'milestone', label: 'Milestones', icon: Target },
              { key: 'social', label: 'Social', icon: Share2 },
              { key: 'special', label: 'Special', icon: Crown }
            ].map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category.key
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => {
          const completed = achievement.threshold === 'top10' 
            ? false 
            : achievement.threshold === 'early'
            ? true
            : achievement.threshold === 'speed'
            ? referralCount >= 5
            : achievement.threshold === 'consistency'
            ? false
            : achievement.threshold === 'quality'
            ? false
            : referralCount >= achievement.threshold;
          
          const progress = achievement.threshold === 'top10' 
            ? 0 
            : achievement.threshold === 'early'
            ? 100
            : achievement.threshold === 'speed'
            ? Math.min(100, (referralCount / 5) * 100)
            : achievement.threshold === 'consistency'
            ? 0
            : achievement.threshold === 'quality'
            ? 0
            : Math.min(100, (referralCount / achievement.threshold) * 100);
          
          return (
            <AchievementCard
              key={achievement.id}
              achievement={{
                ...achievement,
                completed,
                progress
              }}
              delay={index * 0.1}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400">No achievements in this category</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const AchievementCard = ({ achievement, delay = 0 }) => {
  const IconComponent = achievement.icon;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
    rose: 'from-rose-500 to-rose-600'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
        achievement.completed 
          ? `border-${achievement.color}-500/50 bg-gradient-to-br from-${achievement.color}-950/20 to-${achievement.color}-900/20` 
          : 'border-slate-800/50 bg-slate-900/30 hover:border-slate-700/50'
      }`}
    >
      {/* Completion Badge */}
      {achievement.completed && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
      )}

      <div className="space-y-4">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
          achievement.completed 
            ? `bg-gradient-to-r ${colorClasses[achievement.color]}` 
            : 'bg-slate-800/50'
        }`}>
          {achievement.completed ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <IconComponent className="w-8 h-8 text-slate-400" />
          )}
        </div>
        
        {/* Content */}
        <div className="text-center space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{achievement.name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{achievement.description}</p>
          </div>
          
          {achievement.reward && (
            <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
              <Gift className="w-4 h-4" />
              <span>{achievement.reward}</span>
            </div>
          )}
          
          {/* Progress Bar */}
          {!achievement.completed && achievement.threshold !== 'top10' && achievement.threshold !== 'consistency' && achievement.threshold !== 'quality' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-300">{Math.round(achievement.progress)}%</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <motion.div
                  className={`bg-gradient-to-r ${colorClasses[achievement.color]} h-2 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${achievement.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          {achievement.completed ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Unlocked</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/20 text-slate-400 rounded-full border border-slate-500/30">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium">Locked</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementsTab; 