import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  User,
  Clock,
  Trophy,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Zap,
} from 'lucide-react';
import { DESIGN_TOKENS } from '../designTokens.js';

const PositionCheckCTA = ({ onCheckPosition, isChecking = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailValidationState, setEmailValidationState] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'

  // Enhanced email validation with beautiful minimal visual feedback
  useEffect(() => {
    if (!email) {
      setEmailValidationState('idle');
      setIsValidEmail(false);
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
      } else {
        setEmailValidationState('invalid');
      }
    }, 400);

    return () => clearTimeout(validateEmailTimeout);
  }, [email]);

  const handleEmailChange = e => {
    const value = e.target.value;
    setEmail(value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidEmail) return;

    try {
      await onCheckPosition(email.trim().toLowerCase());
    } catch (error) {
      console.error('Position check failed:', error);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const getEmailFieldStyles = () => {
    switch (emailValidationState) {
      case 'validating':
        return 'border-blue-300/30 bg-blue-950/5 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10';
      case 'valid':
        return 'border-emerald-300/40 bg-emerald-950/5 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10';
      case 'invalid':
        return 'border-red-300/40 bg-red-950/5 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/10';
      default:
        return 'border-slate-500/30 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10 hover:border-slate-600/30';
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

    switch (emailValidationState) {
      case 'validating':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </motion.div>
        );
      case 'valid':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: [0.5, 1.2, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.3,
              type: 'spring',
              stiffness: 300,
              scale: { duration: 0.4 },
            }}
            className="flex items-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </motion.div>
        );
      case 'invalid':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [0.8, 1.1, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.2,
              scale: { duration: 0.3 },
            }}
            className="flex items-center"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getErrorMessage = () => {
    if (emailValidationState !== 'invalid') return null;

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const hasValidDomain = /\.[a-zA-Z]{2,}$/.test(email);
    const isLongEnough = email.length >= 5;
    const hasNoConsecutiveDots = !/\.\./.test(email);
    const hasNoSpecialCharsAtStart = !/^[._-]/.test(email);
    const hasNoSpecialCharsAtEnd = !/[._-]$/.test(email);
    const hasNoSpaces = !/\s/.test(email);

    if (!hasValidDomain) {
      return 'Email must have a valid domain';
    } else if (!isLongEnough) {
      return 'Email is too short';
    } else if (!hasNoConsecutiveDots) {
      return 'Cannot contain consecutive dots';
    } else if (!hasNoSpecialCharsAtStart || !hasNoSpecialCharsAtEnd) {
      return 'Cannot start or end with . _ or -';
    } else if (!hasNoSpaces) {
      return 'Email cannot contain spaces';
    }

    return 'Please enter a valid email address';
  };

  return (
    <section className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: DESIGN_TOKENS.animations.duration.normal, 
          delay: 0.3 
        }}
        className="relative"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            // Collapsed State
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: DESIGN_TOKENS.animations.duration.normal }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800/20 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/20"
              onClick={handleExpand}
            >
              {/* Background Effects */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-950/10 via-transparent to-violet-950/10" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
              
              {/* Subtle animated background grid */}
              <motion.div
                className="absolute inset-0 z-0 opacity-[0.02]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(148, 163, 184, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.02 }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
              />

              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 rounded-2xl bg-slate-800/30 p-3 transition-colors duration-300 group-hover:bg-slate-700/30">
                    <Zap className="h-5 w-5 text-indigo-400" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-medium tracking-tight text-white">
                      Already joined?
                    </h3>
                    <p className="mt-1 text-sm font-light leading-relaxed text-slate-400">
                      Check your position to unlock referral rewards
                    </p>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-indigo-400" />
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 border-t border-slate-800/30 pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium tracking-wide text-slate-400">
                      Real-time updates
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-medium tracking-wide text-slate-400">
                      Referral rewards
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Expanded State
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: DESIGN_TOKENS.animations.duration.normal }}
              className="relative overflow-hidden rounded-3xl border border-slate-800/20 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-2xl"
            >
              {/* Background Effects */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-950/10 via-transparent to-violet-950/10" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-800/30 p-2">
                      <Search className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-medium tracking-tight text-white">
                        Check Your Position
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-slate-400">
                        Unlock your referral dashboard and start earning rewards
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-slate-800/30 hover:text-white"
                    aria-label="Close position check"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Input Field */}
                  <div className="space-y-3">
                    <div className="group relative">
                      {/* Email Icon */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                        <Mail
                          className={`h-4 w-4 transition-all duration-300 ${getEmailIconColor()}`}
                        />
                      </div>

                      {/* Input Field */}
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={`
                          w-full rounded-2xl border py-4 pl-14 pr-14
                          text-sm font-light text-white placeholder-slate-400 text-left
                          transition-all duration-300 focus:outline-none
                          disabled:cursor-not-allowed disabled:opacity-50
                          ${getEmailFieldStyles()}
                        `}
                        disabled={isChecking}
                        required
                      />

                      {/* Validation Icon */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-5">
                        <AnimatePresence mode="wait">
                          {renderEmailValidationIcon()}
                        </AnimatePresence>
                      </div>

                      {/* Validation Ring Effects */}
                      <AnimatePresence>
                        {emailValidationState === 'valid' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-400/20"
                          />
                        )}

                        {emailValidationState === 'invalid' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-red-400/20"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error Messages */}
                    <AnimatePresence>
                      {emailValidationState === 'invalid' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="flex items-start gap-2 px-3 text-left"
                        >
                          <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400" />
                          <p className="text-xs font-light leading-relaxed text-red-400">
                            {getErrorMessage()}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success Messages */}
                    <AnimatePresence>
                      {emailValidationState === 'valid' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="flex items-start gap-2 px-3 text-left"
                        >
                          <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          <p className="text-xs font-light leading-relaxed text-emerald-400">
                            Perfect! Ready to unlock your dashboard
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isChecking || !email || !isValidEmail}
                    whileHover={{ 
                      scale: isChecking || !email || !isValidEmail ? 1 : 1.01 
                    }}
                    whileTap={{ 
                      scale: isChecking || !email || !isValidEmail ? 1 : 0.99 
                    }}
                    className="
                      group relative w-full overflow-hidden rounded-2xl
                      bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600
                      px-6 py-4 text-sm font-medium text-white
                      transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-indigo-400/30
                    "
                  >
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-2">
                      {isChecking ? (
                        <>
                          <motion.div
                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity, 
                              ease: 'linear' 
                            }}
                          />
                          <span>Unlocking Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Unlock My Dashboard</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default PositionCheckCTA;
