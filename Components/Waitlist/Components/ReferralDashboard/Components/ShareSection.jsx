import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Copy, 
  CheckCircle2, 
  ArrowUp,
  Users,
  Zap,
  Gift,
  Twitter,
  Linkedin
} from "lucide-react";

const ShareSection = ({ onShare, referralCode, referralStats }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('twitter');
  
  const userReferrals = referralStats?.stats?.totalReferrals || 0;
  const positionImprovement = referralStats?.positionImprovement || 0;

  const shareOptions = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin }
  ];

  const benefits = [
    { icon: ArrowUp, title: 'Skip Queue', description: '+5 positions per referral', value: '+5' },
    { icon: Gift, title: 'Unlock Perks', description: 'Exclusive features', value: '🎁' },
    { icon: Users, title: 'Build Network', description: 'Connect with innovators', value: userReferrals }
  ];

  const handleCopyCode = async () => {
    try {
      const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (method) => {
    setSelectedMethod(method);
    const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
    const message = `Join me on the waitlist: ${referralUrl}`;
    
    switch (method) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
        window.open(linkedinUrl, '_blank');
        break;
      default:
        handleCopyCode();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Share Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="col-span-12 lg:col-span-8 bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8"
        >
          <div className="grid grid-cols-7 gap-8 items-center">
            
            {/* Left: Info & Benefits */}
            <div className="col-span-4 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-white">Share & Advance</h2>
                    <p className="text-white/60">Turn connections into progress</p>
                  </div>
                </div>
                
                <p className="text-white/80 leading-relaxed">
                  Every person you invite moves you +5 positions up the queue. 
                  Share your link to accelerate your access.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-white/80" />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">{benefit.title}</h4>
                      <p className="text-xs text-white/60">{benefit.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right: Share Interface */}
            <div className="col-span-3 space-y-6">
              {/* Referral Code */}
              <div className="space-y-3">
                <p className="text-sm text-white/60">Your referral link</p>
                <div className="relative">
                  <div className="bg-white/10 rounded-2xl border border-white/10 p-4">
                    <code className="text-blue-300 text-sm font-mono break-all">
                      {referralCode ? `.../${referralCode}` : '••••••'}
                    </code>
                  </div>
                  <motion.button
                    onClick={handleCopyCode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-3 right-3 w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      {isCopied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="w-4 h-4 text-blue-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Share Methods */}
              <div className="space-y-3">
                {shareOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = selectedMethod === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => handleShare(option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-500/30' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-white/80" />
                        <span className="text-sm text-white/60">{option.name}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Main CTA */}
              <motion.button
                onClick={() => handleShare('twitter')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-4 font-medium transition-colors"
              >
                Share Now
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Right Side Cards */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-2xl font-light text-white mb-1">{userReferrals}</p>
              <p className="text-sm text-white/60">connections made</p>
              <p className="text-xs text-emerald-400 mt-2">+{positionImprovement} positions gained</p>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6"
          >
            <div className="text-center">
              <div className="flex -space-x-2 justify-center mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-medium">{i}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-white mb-1">{userReferrals + 150}+ active</p>
              <p className="text-xs text-white/60">sharing their links</p>
            </div>
          </motion.div>

          {/* Quick Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="col-span-2 lg:col-span-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ArrowUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Ready to advance?</p>
                <p className="text-xs text-white/60">Each connection = +5 positions instantly</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShareSection;
