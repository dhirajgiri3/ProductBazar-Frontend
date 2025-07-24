// PositionTracker.jsx - Enhanced with estimated access time and premium typography
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlist } from '../../../lib/contexts/waitlist-context';
import { getPositionStatus, calculateProgressPercentage } from '../../../lib/utils/waitlist-position.utils.js';
import {
  Search,
  RefreshCw,
  Share2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Timer,
  Users,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  X,
  Copy,
  ExternalLink,
  Zap,
  Star,
  Gift,
  ChevronRight,
  ArrowUp,
  Rocket,
  Crown,
  Loader2,
  CalendarDays,
  Hourglass,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TwitterIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.46h-1.262c-1.225 0-1.604.755-1.604 1.534V12h2.77l-.443 2.891h-2.327v6.987C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12.039 2c-5.463 0-9.916 4.453-9.916 9.916 0 1.765.462 3.46 1.325 4.962L2 22l4.215-1.102c1.439.785 3.097 1.206 4.784 1.206 5.463 0 9.916-4.453 9.916-9.916S17.502 2 12.039 2zm0 18.061c-1.467 0-2.909-.395-4.179-1.144L6.039 19.5l-.264-.492-3.153 1.018.82-3.044-.249-.41-1.077-1.724c-.75-1.218-1.157-2.613-1.157-4.093 0-4.542 3.69-8.231 8.231-8.231 4.541 0 8.231 3.69 8.231 8.231s-3.69 8.231-8.231 8.231zm4.017-5.597c-.201-.1-.857-.42-1.002-.472s-.254-.075-.36-.075c-.106 0-.256.038-.396.155s-.36.472-.439.569-.155.1-.289.038c-1.202-.451-2.002-.916-2.836-1.745-.66-.653-1.106-1.46-1.246-1.704-.14-.25-.015-.389.09-.494.083-.083.187-.2.274-.3s.187-.2.289-.344.18-.245.245-.395c.065-.15.033-.289-.015-.395s-.36-.857-.492-1.157c-.134-.3-.269-.25-.36-.25s-.194-.008-.299-.008-.256.038-.396.173c-.14.135-.536.528-.536 1.29s.546 1.496.625 1.602c.078.107 1.018 1.554 2.459 2.115.352.135.631.218.847.284.357.109.686.096.94-.015.254-.107.857-.357 1.002-.63.144-.274.144-.509.1-.569s-.14-.074-.29-.148z" />
  </svg>
);

const TelegramIcon = (props) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.303 7.332l-2.072 9.01a.76.76 0 0 1-1.102.585l-3.321-2.45-.867.842a.25.25 0 0 1-.41.014l-.991-3.111-4.717-1.491c-.812-.257-.803-1.472.046-1.724l15.02-5.744c.732-.279 1.469.53 1.154 1.332zM9.436 14.47l.487 2.05.992-3.111c.08-.25.068-.52-.03-.762l-1.449-3.418 7.502-4.524-5.322 7.02z" />
  </svg>
);

const SocialShareButton = ({ platform, icon: Icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-3 bg-slate-800/50 text-slate-300 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30 group`}
  >
    <Icon className={`w-5 h-5 ${color}`} />
    <span>{platform}</span>
  </button>
);

const PositionTracker = ({ autoFillEmail = null, autoSubmit = false }) => {
  const { checkPosition, shareReferralLink, userEntry, isOnWaitlist, isLoading, queueStats } =
    useWaitlist();

  const [email, setEmail] = useState('');
  const [positionData, setPositionData] = useState(null);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [animatedPosition, setAnimatedPosition] = useState(0);

  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailValidationState, setEmailValidationState] = useState('idle');
  const [isAutoChecking, setIsAutoChecking] = useState(false);

  // Handle auto-fill from success modal
  useEffect(() => {
    if (autoFillEmail && !email) {
      setEmail(autoFillEmail);
    }
  }, [autoFillEmail, email]);

  // Handle auto-submit when coming from success modal
  useEffect(() => {
    if (autoSubmit && autoFillEmail && isValidEmail && !positionData) {
      setIsAutoChecking(true);
      // Small delay to ensure email validation is complete
      const timer = setTimeout(async () => {
        try {
          await handleLookup({ preventDefault: () => {} });
        } finally {
          setIsAutoChecking(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSubmit, autoFillEmail, isValidEmail, positionData]);

  useEffect(() => {
    if (userEntry?.email) {
      setEmail(userEntry.email);
      setPositionData(userEntry);
      setLastUpdated(new Date());
    }
  }, [userEntry]);

  useEffect(() => {
    if (positionData?.position) {
      const targetPosition = positionData.position;
      const duration = 1500;
      const steps = 60;
      const increment = targetPosition / steps;
      let currentPosition = 0;

      const timer = setInterval(() => {
        currentPosition += increment;
        if (currentPosition >= targetPosition) {
          currentPosition = targetPosition;
          clearInterval(timer);
        }
        setAnimatedPosition(Math.floor(currentPosition));
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [positionData?.position]);

  useEffect(() => {
    if (!email) {
      setEmailValidationState('idle');
      setIsValidEmail(false);
      setErrors(prev => ({ ...prev, email: null }));
      return;
    }

    setEmailValidationState('validating');

    const validateEmailTimeout = setTimeout(() => {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const hasValidDomain = /\.[a-zA-Z]{2,}$/.test(email);
      const isLongEnough = email.length >= 5;
      const hasNoConsecutiveDots = !/\.\./.test(email);
      const hasNoSpecialCharsAtStart = !/^[._-]/.test(email);
      const hasNoSpecialCharsAtEnd = !/[._-]$/.test(email);
      const hasNoSpaces = !/\s/.test(email);

      const isValid =
        emailRegex.test(email) &&
        hasValidDomain &&
        isLongEnough &&
        hasNoConsecutiveDots &&
        hasNoSpecialCharsAtStart &&
        hasNoSpecialCharsAtEnd &&
        hasNoSpaces;

      setIsValidEmail(isValid);

      if (isValid) {
        setEmailValidationState('valid');
        setErrors(prev => ({ ...prev, email: null }));
      } else {
        setEmailValidationState('invalid');
        let errorMessage = 'Please enter a valid email address';

        if (!hasValidDomain) {
          errorMessage = 'Email must have a valid domain';
        } else if (!isLongEnough) {
          errorMessage = 'Email is too short';
        } else if (!hasNoConsecutiveDots) {
          errorMessage = 'Cannot contain consecutive dots';
        } else if (!hasNoSpecialCharsAtStart || !hasNoSpecialCharsAtEnd) {
          errorMessage = 'Cannot start or end with . _ or -';
        } else if (!hasNoSpaces) {
          errorMessage = 'Email cannot contain spaces';
        }

        setErrors(prev => ({ ...prev, email: errorMessage }));
      }
    }, 400);

    return () => clearTimeout(validateEmailTimeout);
  }, [email]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!isValidEmail) newErrors.email = 'Please enter a valid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLookup = async e => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      const result = await checkPosition(email.trim().toLowerCase());
      if (result) {
        setPositionData(result);
        setLastUpdated(new Date());
        setErrors({});
        toast.success('Status found! 🎉');
      } else {
        setErrors({
          email: 'Email not found. Please check your spelling or join the waitlist.',
        });
        setPositionData(null);
        toast.error('Email not found in waitlist');
      }
    } catch (error) {
      setErrors({
        general: error.message || 'Something went wrong. Please try again.',
      });
      setPositionData(null);
      toast.error('Failed to check your status');
    }
  };

  const handleRefresh = async () => {
    if (!positionData?.email) return;
    setIsRefreshing(true);
    try {
      const result = await checkPosition(positionData.email);
      if (result) {
        setPositionData(result);
        setLastUpdated(new Date());
        toast.success('Status updated!');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh position');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getEmailFieldStyles = () => {
    switch (emailValidationState) {
      case 'validating':
        return 'bg-blue-950/20 border-blue-400/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';
      case 'valid':
        return 'bg-emerald-950/20 border-emerald-400/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20';
      case 'invalid':
        return 'bg-red-950/20 border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20';
      default:
        return 'bg-slate-800/30 border-slate-500/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 hover:border-slate-500';
    }
  };

  const getEmailIconColor = () => {
    switch (emailValidationState) {
      case 'validating':
        return 'text-blue-400';
      case 'valid':
        return 'text-emerald-400';
      case 'invalid':
        return 'text-red-400';
      default:
        return 'text-slate-400 group-focus-within:text-indigo-400';
    }
  };

  const renderEmailValidationIcon = () => {
    if (!email) return null;
    const iconProps = { className: 'w-5 h-5' };

    switch (emailValidationState) {
      case 'validating':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 {...iconProps} className={`${iconProps.className} text-blue-400 animate-spin`} />
          </motion.div>
        );
      case 'valid':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.2, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.3,
              type: 'spring',
              stiffness: 300,
              scale: { duration: 0.4 }, // <-- CORRECTED TRANSITION
            }}
          >
            <CheckCircle2 {...iconProps} className={`${iconProps.className} text-emerald-400`} />
          </motion.div>
        );
      case 'invalid':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, scale: { duration: 0.3 } }}
          >
            <AlertCircle {...iconProps} className={`${iconProps.className} text-red-400`} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // --- Other helper and render functions (unchanged) ---
  const handleCopy = async () => {
    if (!positionData?.referralCode) return;

    try {
      const referralUrl = `${window.location.origin}/?ref=${positionData.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async platform => {
    if (!positionData?.referralCode) return;
    try {
      const referralUrl = `${window.location.origin}/?ref=${positionData.referralCode}`;
      await shareReferralLink(platform, referralUrl);
      setShowShareModal(false);
      toast.success(`Shared on ${platform}!`);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share');
    }
  };

  const SocialShareButton = ({ platform, onClick }) => {
    const icons = {
      Twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      LinkedIn: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    };
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 bg-slate-800/50 text-slate-300 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30 group"
      >
        <div className="group-hover:scale-110 transition-transform duration-200">
          {icons[platform]}
        </div>
        <span className="font-medium text-sm">{platform}</span>
      </button>
    );
  };

  // Use the utility function for position status
  const getPositionStatusWithIcon = position => {
    const status = getPositionStatus(position);
    // Map icon names to actual components
    const iconMap = {
      'Crown': Crown,
      'Rocket': Rocket,
      'Zap': Zap,
      'Timer': Timer
    };
    return {
      ...status,
      icon: iconMap[status.icon] || Timer
    };
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/20 backdrop-blur-sm group hover:bg-slate-800/40 transition-all duration-300">
      <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
        <Icon className="w-4 h-4 group-hover:text-indigo-400 transition-colors duration-300" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  );

  const formatJoinDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Calculate how far the user has progressed through the overall queue.
  // Prefer the overall `total` count if the backend provides it; otherwise
  // fall back to `waiting`. This avoids the situation where `waiting` equals
  // the user position (e.g. the user is currently last in the queue) which
  // would incorrectly show 0% progress even if there are invited/onboarded
  // users ahead of them.
  const getProgressPercentage = () => {
    if (!positionData?.position || !queueStats) return 0;

    // Determine the denominator for progress calculation
    const totalInQueue = queueStats.total || queueStats.waiting || 0;

    return calculateProgressPercentage(positionData.position, totalInQueue);
  };

  // Calculate estimated access time based on position
  const calculateEstimatedAccessTime = (position) => {
    if (!position) return null;
    
    // Based on 300 approvals per week
    const approvalsPerWeek = 300;
    const weeksToAccess = Math.ceil(position / approvalsPerWeek);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksToAccess * 7) + 2); // +2 days buffer
    
    return {
      date: estimatedDate,
      weeks: weeksToAccess,
      days: weeksToAccess * 7
    };
  };

  // Format estimated access time
  const formatEstimatedAccess = (estimatedData) => {
    if (!estimatedData) return null;
    
    const { date, weeks, days } = estimatedData;
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 7) {
      return {
        text: `${daysDiff} day${daysDiff !== 1 ? 's' : ''}`,
        type: 'soon',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20'
      };
    } else if (daysDiff <= 30) {
      return {
        text: `${Math.ceil(daysDiff / 7)} week${Math.ceil(daysDiff / 7) !== 1 ? 's' : ''}`,
        type: 'near',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20'
      };
    } else {
      return {
        text: `${Math.ceil(daysDiff / 30)} month${Math.ceil(daysDiff / 30) !== 1 ? 's' : ''}`,
        type: 'later',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20'
      };
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      <div className="text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/30 backdrop-blur-xl rounded-full border border-slate-700/20">
            <Target className="w-5 h-5 text-indigo-400" />
            <span className="text-slate-300 text-sm font-medium tracking-wide">
              Waitlist Position
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight">
            Check Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
              Position
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg">
            See your current status and unlock your personalized Growth Dashboard.
          </p>
        </motion.div>

      </div>

      {!positionData && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden"
        >
          <div className="bg-slate-950/30 max-w-3xl mx-auto backdrop-blur-2xl rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/10 via-transparent to-indigo-950/10 rounded-3xl" />

            <div className="relative z-10 max-w-lg mx-auto">
              <div className="text-center space-y-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full mx-auto flex items-center justify-center border border-indigo-500/20"
                >
                  <Zap className="w-5 h-5 text-indigo-400" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-light text-white">Unlock Your Dashboard</h2>
                  <p className="text-slate-400 text-base">
                    Enter your email to check your position and access your personalized Growth Dashboard
                  </p>
                </div>
                
                {/* Benefits Preview */}
                <div className="rounded-xl p-4 text-center">
                  <h4 className="text-white text-sm font-medium mb-3">What you'll unlock:</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs max-w-xs mx-auto">
                    <div className="flex items-center gap-2 justify-center">
                      <Target className="w-3 h-3 text-indigo-400" />
                      <span className="text-slate-300">Position Tracking</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-300">Referral Rewards</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span className="text-slate-300">Exclusive Access</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Users className="w-3 h-3 text-pink-400" />
                      <span className="text-slate-300">Network Building</span>
                    </div>
                  </div>
                </div>
                
                {/* Auto-checking indicator */}
                <AnimatePresence>
                  {isAutoChecking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
                      />
                      <span className="text-emerald-400 text-sm font-medium">
                        Unlocking your dashboard...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleLookup} className="space-y-6">
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail
                        className={`w-5 h-5 transition-all duration-300 ${getEmailIconColor()}`}
                      />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={`
                        w-full pl-14 pr-14 py-4
                        text-white placeholder-slate-400
                        rounded-2xl border transition-all duration-300
                        text-base
                        focus:outline-none
                        ${getEmailFieldStyles()}
                      `}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                      <AnimatePresence mode="wait">{renderEmailValidationIcon()}</AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {emailValidationState === 'valid' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 rounded-full ring-1 ring-emerald-400/20 pointer-events-none"
                        />
                      )}
                      {emailValidationState === 'invalid' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 rounded-full ring-1 ring-red-400/20 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-start gap-2 px-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm font-light leading-relaxed">
                          {errors.email}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {emailValidationState === 'valid' && !errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-start gap-2 px-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-emerald-400 text-sm font-light leading-relaxed">
                          Perfect! Ready to unlock your dashboard
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-900/10 border border-red-500/20 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{errors.general}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={isLoading || isAutoChecking || !email || !isValidEmail}
                  whileHover={{ scale: isLoading || isAutoChecking || !email || !isValidEmail ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading || isAutoChecking || !email || !isValidEmail ? 1 : 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  {isAutoChecking ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>Unlocking your dashboard...</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>Checking position...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Unlock My Dashboard</span>
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() =>
                      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Join the waitlist
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* The rest of the component remains unchanged... */}
      {positionData && (
        <motion.div
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
            }}
            className="relative bg-slate-900/30 rounded-3xl border border-slate-800/30 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/10"
          >
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r ${
                getPositionStatusWithIcon(positionData.position).gradient
              } from-transparent via-current to-transparent blur-lg opacity-60`}
            />

            <motion.div
              className={`absolute inset-0 opacity-10 blur-3xl bg-gradient-to-br ${
                getPositionStatusWithIcon(positionData.position).gradient
              }`}
              animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="lg:grid lg:grid-cols-5 lg:gap-16 items-start">
                <div className="lg:col-span-2 text-center lg:text-left mb-12 lg:mb-0">
                  <p className="text-xl text-slate-400 mb-4 font-light">Your Position</p>
                  <div className="my-6 text-8xl lg:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-50 to-slate-400 tracking-tighter leading-none">
                    #{animatedPosition.toLocaleString()}
                  </div>
                  <div
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${
                      getPositionStatusWithIcon(positionData.position).gradient
                    } text-white shadow-lg mb-8`}
                  >
                    {React.createElement(getPositionStatusWithIcon(positionData.position).icon, {
                      className: 'w-6 h-6',
                    })}
                    <span className="font-semibold text-lg">
                      {getPositionStatusWithIcon(positionData.position).text}
                    </span>
                  </div>

                  {/* Moved buttons to left side, bottom of position section */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      whileHover={{ scale: isRefreshing ? 1 : 1.02 }}
                      whileTap={{ scale: isRefreshing ? 1 : 0.98 }}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-slate-800/50 text-slate-200 font-semibold rounded-2xl hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-50 border border-slate-700/30"
                    >
                      {isRefreshing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      Refresh
                    </motion.button>
                    {positionData.referralCode && (
                      <motion.button
                        onClick={() => setShowShareModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl hover:opacity-90 transition-all duration-300 whitespace-nowrap"
                      >
                        <ArrowUp className="w-5 h-5" />
                        Share & Climb
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-10">
                  {/* Estimated Access Time Component */}
                  {positionData.position && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="bg-slate-800/20 rounded-2xl p-6 border border-slate-700/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                          <Clock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Estimated Access</h3>
                          <p className="text-slate-400 text-sm font-light">Based on 300 approvals per week</p>
                        </div>
                      </div>
                      
                      {(() => {
                        const estimatedData = calculateEstimatedAccessTime(positionData.position);
                        const formattedAccess = formatEstimatedAccess(estimatedData);
                        
                        if (!formattedAccess) return null;
                        
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${formattedAccess.bgColor} border ${formattedAccess.borderColor}`}>
                                <CalendarDays className={`w-6 h-6 ${formattedAccess.color}`} />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-white">
                                  {formattedAccess.text}
                                </p>
                                <p className="text-slate-400 text-sm font-light">
                                  {estimatedData.date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Hourglass className="w-4 h-4" />
                                <span>Queue moving fast!</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between text-base text-slate-400 font-medium">
                      <span>Queue Progress</span>
                      <span>{getProgressPercentage().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-3 border border-slate-700/30">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          getPositionStatusWithIcon(positionData.position).gradient
                        } shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ duration: 2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <InfoItem
                      icon={Calendar}
                      label="Date Joined"
                      value={formatJoinDate(positionData.joinedAt)}
                    />
                    <InfoItem
                      icon={Users}
                      label="Referrals"
                      value={positionData.referralCount || 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
            }}
            className="bg-slate-900/30 rounded-3xl p-10 border border-slate-800/30 backdrop-blur-2xl"
          >
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="p-4 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl border border-violet-500/20 shadow-lg"
              >
                <Zap className="w-10 h-10 text-violet-300" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white/95 mb-3">
                  Accelerate Your Access
                </h3>
                <p className="text-slate-400 text-base leading-relaxed mb-6 font-light">
                  Share your unique referral link to climb the queue. Each friend who joins moves
                  you <span className="font-semibold text-emerald-400">up 5 spots</span>.
                </p>
                {positionData.referralCode && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 text-slate-200 font-medium rounded-2xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/30"
                  >
                    <Share2 className="w-5 h-5" />
                    Get Share Link
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showShareModal && positionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="relative bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full border border-slate-800/50 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent blur-lg opacity-60" />

              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Share to Climb Faster
                    </h3>
                    <p className="text-slate-400">
                      Get <span className="font-medium text-emerald-400">+5 positions</span> for
                      every friend who joins.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?ref=${positionData.referralCode}`}
                    className="w-full pr-32 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                  />
                  <button
                    onClick={handleCopy}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 font-semibold rounded-xl text-sm transition-all duration-200 ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-sm text-slate-500">Or share via</p>
                  <div className="grid grid-cols-2 gap-4">
                    <SocialShareButton
                      platform="Twitter"
                      icon={TwitterIcon}
                      color="text-sky-400"
                      onClick={() => handleShare('twitter')}
                    />
                    <SocialShareButton
                      platform="LinkedIn"
                      icon={LinkedInIcon}
                      color="text-blue-400"
                      onClick={() => handleShare('linkedin')}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                  <Star className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-semibold text-yellow-400 mb-2">Pro Tip</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Personalized messages see higher success. Tell friends why you're excited!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PositionTracker;