import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, User, X, Loader2, Heart } from 'lucide-react';
import { useWaitlist } from '../../../lib/contexts/waitlist-context';
import { toast } from 'react-hot-toast';
import { BorderBeam } from '../../UI/BorderBeam/BorderBeam';

const SimpleEmailForm = ({ onSuccess, onUpgrade }) => {
  const { submitWaitlistEntry, formData: contextFormData } = useWaitlist();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailValidationState, setEmailValidationState] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [firstNameValidationState, setFirstNameValidationState] = useState('idle'); // 'idle', 'validating', 'valid'

  // Enhanced email validation with beautiful minimal visual feedback
  useEffect(() => {
    if (!email) {
      setEmailValidationState('idle');
      setIsValidEmail(false);
      setErrors(prev => ({ ...prev, email: null }));
      return;
    }

    setEmailValidationState('validating');
    
    const validateEmailTimeout = setTimeout(() => {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const hasValidDomain = /\.[a-zA-Z]{2,}$/.test(email);
      const isLongEnough = email.length >= 5;
      const hasNoConsecutiveDots = !/\.\./.test(email);
      const hasNoSpecialCharsAtStart = !/^[._-]/.test(email);
      const hasNoSpecialCharsAtEnd = !/[._-]$/.test(email);
      const hasNoSpaces = !/\s/.test(email);
      
      const isValid = emailRegex.test(email) && hasValidDomain && isLongEnough && 
                     hasNoConsecutiveDots && hasNoSpecialCharsAtStart && hasNoSpecialCharsAtEnd && hasNoSpaces;
      
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
    }, 400); // Slightly longer delay for better UX

    return () => clearTimeout(validateEmailTimeout);
  }, [email]);

  // First name validation with personalized messaging
  useEffect(() => {
    if (!firstName.trim()) {
      setFirstNameValidationState('idle');
      return;
    }

    setFirstNameValidationState('validating');
    
    const validateFirstNameTimeout = setTimeout(() => {
      const trimmedName = firstName.trim();
      const isValidLength = trimmedName.length >= 2;
      const hasOnlyLetters = /^[a-zA-Z\s'-]+$/.test(trimmedName);
      const isNotTooLong = trimmedName.length <= 30;
      
      if (isValidLength && hasOnlyLetters && isNotTooLong) {
        setFirstNameValidationState('valid');
      } else {
        setFirstNameValidationState('idle');
      }
    }, 300);

    return () => clearTimeout(validateFirstNameTimeout);
  }, [firstName]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!isValidEmail) newErrors.email = 'Please enter a valid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        role: 'discoverer',
        referralCode: contextFormData?.referralCode || '',
      };
      const result = await submitWaitlistEntry(formData);
      if (result.success) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const getFirstNameFieldStyles = () => {
    const baseStyles = 'transition-all duration-300';
    
    switch (firstNameValidationState) {
      case 'validating':
        return `${baseStyles} border-blue-300/30 bg-blue-950/5 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10`;
      case 'valid':
        return `${baseStyles} border-emerald-300/40 bg-emerald-950/5 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10`;
      default:
        if (firstNameFocused) {
          return `${baseStyles} border-indigo-400/40 bg-slate-900/20 ring-2 ring-indigo-400/10`;
        }
        return `${baseStyles} border-slate-500/30 bg-slate-900/20 hover:border-slate-600/30`;
    }
  };

  const getFirstNameIconColor = () => {
    switch (firstNameValidationState) {
      case 'validating':
        return 'text-blue-400';
      case 'valid':
        return 'text-emerald-400';
      default:
        return firstNameFocused ? 'text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-400';
    }
  };

  const getPersonalizedMessage = () => {
    if (!firstName.trim() || firstNameValidationState !== 'valid') return null;
    
    const name = firstName.trim();
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    const messages = [
      `Welcome to the ecosystem, ${capitalizedName}!`,
      `Great to have you here, ${capitalizedName}!`,
      `Thanks for joining us, ${capitalizedName}!`,
      `Perfect! Welcome aboard, ${capitalizedName}!`,
      `Excited to have you, ${capitalizedName}!`
    ];
    
    // Use a simple hash to consistently pick the same message for the same name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return messages[hash % messages.length];
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
              type: "spring", 
              stiffness: 300,
              scale: { duration: 0.4 }
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
              scale: { duration: 0.3 }
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

  const renderFirstNameValidationIcon = () => {
    if (!firstName.trim()) return null;

    switch (firstNameValidationState) {
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
              type: "spring", 
              stiffness: 300,
              scale: { duration: 0.4 }
            }}
            className="flex items-center"
          >
            <Heart className="w-4 h-4 text-emerald-400 fill-current" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative max-w-lg mx-auto"
    >
      <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-slate-800/20 shadow-2xl relative overflow-hidden">
        
        <BorderBeam delay={0} />     
        
        {/* Enhanced background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/10 via-transparent to-violet-950/10 rounded-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
        
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">    
            <div className="space-y-3">
              <h2 className="text-3xl font-extralight text-white tracking-tight">
                Enter the Ecosystem.
              </h2>
              <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm mx-auto">
                Secure your founding member status in the ecosystem
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field with Beautiful Minimal Visual Feedback - Now First */}
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className={`w-4 h-4 transition-all duration-300 ${getEmailIconColor()}`} />
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
                      text-sm font-light
                      focus:outline-none
                      ${getEmailFieldStyles()}
                    `}
                    required
                  />
                  
                  {/* Beautiful validation icon with smooth animations */}
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                    <AnimatePresence mode="wait">
                      {renderEmailValidationIcon()}
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtle glow effects for validation states */}
                  <AnimatePresence>
                    {emailValidationState === 'valid' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl ring-1 ring-emerald-400/20 pointer-events-none"
                      />
                    )}
                    
                    {emailValidationState === 'invalid' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl ring-1 ring-red-400/20 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Minimal error messaging */}
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-start gap-2 px-3"
                    >
                      <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-xs font-light leading-relaxed">
                        {errors.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Minimal success feedback */}
                <AnimatePresence>
                  {emailValidationState === 'valid' && !errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-start gap-2 px-3"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-emerald-400 text-xs font-light leading-relaxed">
                        Perfect! This email looks great
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* First Name Field with Enhanced Visual Feedback and Personalized Messages */}
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className={`w-4 h-4 transition-all duration-300 ${getFirstNameIconColor()}`} />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                    placeholder="First name (optional)"
                    className={`
                      w-full pl-14 pr-14 py-4
                      text-white placeholder-slate-400
                      rounded-2xl border
                      text-sm font-light
                      focus:outline-none
                      ${getFirstNameFieldStyles()}
                    `}
                  />
                  
                  {/* Beautiful validation icon with smooth animations */}
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                    <AnimatePresence mode="wait">
                      {renderFirstNameValidationIcon()}
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtle glow effects for validation states */}
                  <AnimatePresence>
                    {firstNameValidationState === 'valid' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl ring-1 ring-emerald-400/20 pointer-events-none"
                      />
                    )}
                    
                    {firstNameValidationState === 'validating' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl ring-1 ring-blue-400/20 pointer-events-none"
                      />
                    )}
                    
                    {firstNameFocused && firstNameValidationState === 'idle' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 rounded-2xl ring-1 ring-indigo-400/20 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Personalized welcome message */}
                <AnimatePresence>
                  {getPersonalizedMessage() && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                      }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className="flex items-start gap-2 px-3"
                    >
                      <Heart className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5 fill-current" />
                      <p className="text-emerald-400 text-xs font-light leading-relaxed">
                        {getPersonalizedMessage()}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !email || !isValidEmail}
              whileHover={{ scale: isSubmitting || !email || !isValidEmail ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting || !email || !isValidEmail ? 1 : 0.99 }}
              className="
                w-full py-4 px-6
                bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600
                text-white text-sm font-medium
                rounded-2xl border-none
                disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-indigo-400/30
                relative overflow-hidden
                group
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Securing Access...</span>
                  </>
                ) : (
                  <>
                    <span>Secure My Access</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          {/* Minimal footer */}
          <div className="text-center pt-2">
            <button
              onClick={onUpgrade}
              className="text-slate-400 hover:text-slate-300 text-sm font-light transition-all duration-200 underline underline-offset-4"
            >
              Tell us more about yourself for a personalized experience.
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SimpleEmailForm;