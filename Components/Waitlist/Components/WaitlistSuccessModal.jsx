import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  X,
  Share2,
  Copy,
  Clock,
  Users,
  ArrowRight,
  ChevronDown,
  Trophy,
  TrendingUp,
  Gift,
  Star,
  Zap,
  Heart,
} from 'lucide-react';
import { useWaitlist } from '../../../lib/contexts/waitlist-context';
import ConfettiBurst from './ConfettiBurst';
import LoadingSpinner from '../../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const TwitterIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SocialShareButton = ({ platform, icon: Icon, color, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 bg-slate-800/60 text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-700/60 transition-all duration-200 border border-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed group`}
  >
    <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
    <span className="text-sm font-medium">{platform}</span>
  </button>
);

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      bounce: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.1
    }
  }
};

export default function WaitlistSuccessModal({ open, onClose, submissionData, onAccessDashboard }) {
  const modalRef = useRef();
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  const {
    userEntry,
    copyReferralLink,
    shareOnSocial,
    generateReferralLink,
    queueStats
  } = useWaitlist();

  useEffect(() => {
    if (!open) return;

    const handleKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleClick = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  useEffect(() => {
    if (open && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      firstFocusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  // Prefer userEntry (from context) for freshest stats, fallback to submissionData
  const entry = userEntry || submissionData || {};

  // Debug logging
  console.log('WaitlistSuccessModal entry data:', entry);

  const {
    position = 0,
    referralCode = '',
    firstName = '',
    lastName = '',
    email = '',
    referralCount = 0,
    status = 'waiting',
    estimatedInviteDate,
    role = ''
  } = entry;

  const referralLink = referralCode ? generateReferralLink(referralCode) : '';
  const displayName = firstName || (firstName && lastName ? `${firstName} ${lastName}` : 'Innovator');

  // Calculate estimated time to access
  const getEstimatedTime = () => {
    if (!position || !queueStats?.waiting) return 'Unknown';

    const avgDailyInvites = queueStats?.invited / 30 || 10; // Rough estimate
    const daysToAccess = Math.ceil(position / avgDailyInvites);

    if (daysToAccess <= 7) return `${daysToAccess} days`;
    if (daysToAccess <= 30) return `${Math.ceil(daysToAccess / 7)} weeks`;
    return `${Math.ceil(daysToAccess / 30)} months`;
  };

  // Enhanced copy handler with loading state
  const handleCopyClick = async () => {
    if (!referralCode || isCopying) return;

    setIsCopying(true);
    try {
      const referralUrlWithDomain = `${window.location.origin}/?ref=${referralCode}`;
      await copyReferralLink(referralUrlWithDomain);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try again.');
    } finally {
      setIsCopying(false);
    }
  };

  // Enhanced social share handler
  const handleShareClick = async (platform) => {
    if (!referralCode || isSharing) return;

    setIsSharing(true);
    try {
      const referralUrlWithDomain = `${window.location.origin}/?ref=${referralCode}`;
      await shareOnSocial(platform, referralUrlWithDomain);
      toast.success(`Shared on ${platform}!`);
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Access Dashboard button click
  const handleAccessDashboard = () => {
    // Close modal first
    onClose();

    // Small delay to ensure modal is closed before scrolling
    setTimeout(() => {
      if (onAccessDashboard) {
        onAccessDashboard(entry);
      } else {
        // Fallback: scroll to position tracker directly
        const positionElement = document.getElementById('position');
        if (positionElement) {
          positionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Confetti celebration */}
          <ConfettiBurst />

          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative mt-10 bg-gray-950 border border-slate-800/60 shadow-2xl rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Waitlist Success Modal"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors z-20 p-2 rounded-lg hover:bg-slate-800/60"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-slate-900/50">
              {/* Header Section */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      id="modal-title"
                      className="text-2xl font-bold text-white mb-2 leading-tight"
                    >
                      Welcome to ProductBazar!
                    </h2>
                    <p className="text-xl font-medium text-emerald-300 mb-1">
                      Hello, {displayName}
                    </p>
                    <p
                      id="modal-description"
                      className="text-slate-400 text-sm"
                    >
                      You're now in the queue for early access
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Stats Section */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">Queue Position</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      #{position && position > 0 ? position.toLocaleString() : '—'}
                    </div>
                    <div className="text-xs text-slate-400">in line</div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-slate-300">Estimated Access</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {estimatedInviteDate ?
                        new Date(estimatedInviteDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        }) :
                        getEstimatedTime()
                      }
                    </div>
                    <div className="text-xs text-slate-400">from now</div>
                  </div>
                </div>
              </div>

              {/* Referral Section */}
              {referralCode && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="px-6 pb-4"
                >
                  <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-200">Share & Move Up</h3>
                        <p className="text-sm text-blue-300/70">Each referral moves you closer to the front</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-4">
                      <span className="truncate text-blue-200 font-mono text-sm flex-1" title={referralLink}>
                        {referralLink || 'Loading referral link...'}
                      </span>
                      <button
                        onClick={handleCopyClick}
                        disabled={isCopying || !referralLink}
                        className="p-2 rounded-lg hover:bg-slate-700/60 transition-colors disabled:opacity-50 group"
                        aria-label="Copy connection link"
                      >
                        {isCopying ? (
                          <LoadingSpinner size="sm" color="blue" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-3 mb-4">
                      <SocialShareButton
                        platform="Twitter"
                        icon={TwitterIcon}
                        color="text-sky-400"
                        onClick={() => handleShareClick('twitter')}
                        disabled={isSharing}
                      />
                      <SocialShareButton
                        platform="LinkedIn"
                        icon={LinkedInIcon}
                        color="text-blue-400"
                        onClick={() => handleShareClick('linkedin')}
                        disabled={isSharing}
                      />
                    </div>

                    {referralCount > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-200 bg-blue-900/30 border border-blue-800/30 rounded-xl py-2 px-3">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-medium">{referralCount} successful {referralCount === 1 ? 'referral' : 'referrals'}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Benefits Section */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="px-6 pb-4"
              >
                <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border border-amber-800/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-200">Founding Member Benefits</h3>
                      <p className="text-sm text-amber-300/70">Exclusive perks for early adopters</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 text-sm text-amber-200 bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
                      <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Priority access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-amber-200 bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Exclusive perks</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-amber-200 bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
                      <Heart className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Direct feedback</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-amber-200 bg-amber-900/20 border border-amber-800/30 rounded-xl p-3">
                      <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Early features</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Advanced Info Panel */}
              <AnimatePresence mode="wait">
                {showAdvancedInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="px-6 pb-4"
                  >
                    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-slate-300" />
                        </div>
                        <h4 className="text-base font-semibold text-slate-200">Your Details</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Queue Position</span>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-xl font-bold text-white">
                            #{position && position > 0 ? position.toLocaleString() : '—'}
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Referrals</span>
                            <Users className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="text-xl font-bold text-white">{referralCount}</div>
                        </div>
                        
                        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</span>
                            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          </div>
                          <div className="text-lg font-semibold text-white capitalize">
                            {status || 'waiting'}
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Referral Code</span>
                            <Copy className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="font-mono text-sm text-slate-200 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30">
                            {referralCode || '—'}
                          </div>
                        </div>
                        
                        {role && (
                          <div className="col-span-1 sm:col-span-2 bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Account Role</span>
                              <Star className="w-3 h-3 text-amber-400" />
                            </div>
                            <div className="text-lg font-semibold text-white capitalize">{role}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fixed Action Footer */}
            <div className="flex-shrink-0 bg-slate-950/95 backdrop-blur-sm">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left - Advanced Info Toggle */}
                  <button
                    onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/40"
                    aria-expanded={showAdvancedInfo}
                  >
                    {showAdvancedInfo ? 'Hide' : 'Show'} details
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedInfo ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Right - Main Action Button */}
                  <button
                    onClick={handleAccessDashboard}
                    className="flex-1 max-w-xs py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500/70 via-purple-500/70 to-pink-500/70 text-white font-semibold text-base shadow-lg hover:from-indigo-600/70 hover:via-purple-600/70 hover:to-pink-600/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 group"
                    aria-label="Access your dashboard and track your position"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Access Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 