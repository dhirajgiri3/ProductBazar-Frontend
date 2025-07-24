'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useWaitlist } from '../../../lib/contexts/waitlist-context';
import { toast } from 'react-hot-toast';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  Search,
  Hammer,
  DollarSign,
  Building,
  Code,
  Target,
  Copy,
  Share2,

  Lightbulb,
  Monitor,
  TrendingUp,
  BarChart3,
  PenTool,
  Scale,
  Users,
  ChevronRight,
  Check,
  Plus,
} from 'lucide-react';
import { BorderBeam } from '../../UI/BorderBeam/BorderBeam';

const roleOptions = [
  {
    value: 'discoverer',
    label: 'Discoverer',
    icon: Search,
    description: 'Explore and discover amazing products',
    fields: [],
    gradient: 'from-emerald-400/20 to-teal-500/20',
  },
  {
    value: 'maker',
    label: 'Maker',
    icon: Hammer,
    description: 'Build and launch your products',
    fields: ['stage', 'goals'],
    gradient: 'from-violet-400/20 to-purple-500/20',
  },
  {
    value: 'investor',
    label: 'Investor',
    icon: DollarSign,
    description: 'Invest in promising startups',
    fields: ['ticketSize', 'goals'],
    gradient: 'from-amber-400/20 to-orange-500/20',
  },
  {
    value: 'agency',
    label: 'Agency',
    icon: Building,
    description: 'Provide services to businesses',
    fields: ['services', 'goals'],
    gradient: 'from-blue-400/20 to-indigo-500/20',
  },
  {
    value: 'freelancer',
    label: 'Freelancer',
    icon: Code,
    description: 'Offer your skills independently',
    fields: ['services', 'goals'],
    gradient: 'from-pink-400/20 to-rose-500/20',
  },
  {
    value: 'jobseeker',
    label: 'Job Seeker',
    icon: Target,
    description: 'Find your next opportunity',
    fields: ['goals'],
    gradient: 'from-cyan-400/20 to-blue-500/20',
  },
];

const stageOptions = [
  { value: 'idea', label: 'Idea Stage', description: 'Just getting started', icon: Lightbulb },
  { value: 'mvp', label: 'MVP', description: 'Building minimum viable product', icon: Code },
  { value: 'launched', label: 'Launched', description: 'Product is live', icon: TrendingUp },
  { value: 'scaling', label: 'Scaling', description: 'Growing the business', icon: BarChart3 },
];

const ticketSizeOptions = [
  { value: '$1k-10k', label: '$1K - $10K', description: 'Angel/seed investments' },
  { value: '$10k-100k', label: '$10K - $100K', description: 'Early stage rounds' },
  { value: '$100k-1m', label: '$100K - $1M', description: 'Series A/B rounds' },
  { value: '$1m+', label: '$1M+', description: 'Growth stage investments' },
];

const serviceOptions = [
  { value: 'design', label: 'Design', icon: PenTool },
  { value: 'development', label: 'Development', icon: Code },
  { value: 'marketing', label: 'Marketing', icon: TrendingUp },
  { value: 'consulting', label: 'Consulting', icon: Lightbulb },
];

const sourceOptions = [
  { value: 'Google Search', label: 'Google Search' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Friend/Colleague', label: 'Friend/Colleague' },
  { value: 'Newsletter', label: 'Newsletter' },
  { value: 'Other', label: 'Other' },
];

const WaitlistForm = ({ onSuccess, onClose }) => {
  const { submitApplication, submitting, queueStats, copyReferralLink, shareOnSocial } =
    useWaitlist();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    companyOrProject: '',
    stage: '',
    ticketSize: '',
    services: [],
    goals: [],
    source: '',
    notes: '',
    referralCode: '',
    meta: {},
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [customGoal, setCustomGoal] = useState('');
  const [emailValidationState, setEmailValidationState] = useState('idle');

  // Get referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) setFormData(prev => ({ ...prev, referralCode: refCode }));
  }, []);

  // Email validation
  useEffect(() => {
    if (!formData.email) {
      setEmailValidationState('idle');
      setErrors(prev => ({ ...prev, email: null }));
      return;
    }

    setEmailValidationState('validating');
    const timeout = setTimeout(() => {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const isValid =
        emailRegex.test(formData.email) &&
        /\.[a-zA-Z]{2,}$/.test(formData.email) &&
        formData.email.length >= 5 &&
        !/\.\./.test(formData.email) &&
        !/^[._-]/.test(formData.email) &&
        !/[._-]$/.test(formData.email) &&
        !/\s/.test(formData.email);

      setEmailValidationState(isValid ? 'valid' : 'invalid');
      setErrors(prev => ({
        ...prev,
        email: isValid ? null : 'Please enter a valid email address',
      }));
    }, 400);

    return () => clearTimeout(timeout);
  }, [formData.email]);

  // Validation
  const validateStep = step => {
    const newErrors = {};
    
    if (step === 1) {
      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (emailValidationState === 'invalid') {
        newErrors.email = 'Invalid email address';
      }
      
      // First name validation (required by backend)
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length > 50) {
        newErrors.firstName = 'First name must be 50 characters or less';
      }
      
      // Role validation
      if (!formData.role) {
        newErrors.role = 'Please select a role';
      }
    } else if (step === 2) {
      const selectedRole = roleOptions.find(r => r.value === formData.role);
      
      // Company/Project validation for non-discoverer roles
      if (formData.role !== 'discoverer') {
        if (!formData.companyOrProject.trim()) {
          newErrors.companyOrProject = 'Company/Project name is required';
        } else if (formData.companyOrProject.trim().length > 100) {
          newErrors.companyOrProject = 'Company/Project name must be 100 characters or less';
        }
      }
      
      // Role-specific field validation
      if (selectedRole?.fields.includes('stage') && !formData.stage) {
        newErrors.stage = 'Please select a stage';
      }
      
      if (selectedRole?.fields.includes('ticketSize') && !formData.ticketSize) {
        newErrors.ticketSize = 'Please select an investment size';
      }
      
      if (selectedRole?.fields.includes('services') && formData.services.length === 0) {
        newErrors.services = 'Please select at least one service';
      }
      
      if (selectedRole?.fields.includes('goals') && formData.goals.length === 0) {
        newErrors.goals = 'Please add at least one goal';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Prepare the submission data with proper validation
      const submissionData = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName?.trim() || '',
        role: formData.role,
        companyOrProject: formData.companyOrProject?.trim() || '',
        referralCode: formData.referralCode || '',
        meta: {
          ...(formData.stage && { stage: formData.stage }),
          ...(formData.ticketSize && { ticketSize: formData.ticketSize }),
          ...(formData.services.length > 0 && { services: formData.services }),
          ...(formData.goals.length > 0 && { goals: formData.goals }),
          ...(formData.source && { source: formData.source }),
          ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
          userAgent: navigator.userAgent,
        }
      };

      // Add UTM parameters if present
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('utm_source')) submissionData.meta.utmSource = urlParams.get('utm_source');
      if (urlParams.get('utm_medium')) submissionData.meta.utmMedium = urlParams.get('utm_medium');
      if (urlParams.get('utm_campaign')) submissionData.meta.utmCampaign = urlParams.get('utm_campaign');

      const result = await submitApplication(submissionData);
      if (result.success) {
        setSubmissionData(result.data);
        setShowSuccess(true);
        triggerCelebration();
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Enhanced error handling for validation errors
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message && error.message.includes('Validation failed')) {
        // Try to extract specific validation errors from the error response
        if (error.response && error.response.errors) {
          const validationErrors = error.response.errors;
          const fieldErrors = {};
          
          validationErrors.forEach(err => {
            const field = err.path || err.param;
            if (field) {
              fieldErrors[field] = err.msg;
            }
          });
          
          setErrors(fieldErrors);
          errorMessage = 'Please fix the form errors and try again.';
        } else {
          errorMessage = 'Please check your form inputs and try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'],
    });
  };

  const addGoal = () => {
    if (customGoal.trim() && !formData.goals.includes(customGoal.trim())) {
      setFormData(prev => ({ ...prev, goals: [...prev.goals, customGoal.trim()] }));
      setCustomGoal('');
    }
  };

  const removeGoal = goal => {
    setFormData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
  };

  const toggleService = service => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === totalSteps) handleSubmit();
      else setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleShare = async platform => {
    try {
      const referralUrlWithDomain = `${window.location.origin}/?ref=${submissionData?.referralCode}`;
      await shareOnSocial(platform, referralUrlWithDomain);
      toast.success('Shared successfully!');
    } catch (error) {
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const referralUrlWithDomain = `${window.location.origin}/?ref=${submissionData?.referralCode}`;
      await copyReferralLink(referralUrlWithDomain);
      toast.success('Referral link copied!');
    } catch (error) {
      toast.error('Failed to copy link. Please try again.');
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
        return 'border-slate-500/30 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10';
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
    if (!formData.email) return null;
    switch (emailValidationState) {
      case 'validating':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const totalSteps = selectedRole?.fields.length > 0 ? 3 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative max-w-2xl mx-auto"
    >
      <div className="bg-slate-950/60 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-slate-800/20 shadow-2xl relative overflow-hidden">
        <BorderBeam delay={0} />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/10 via-transparent to-violet-950/10 rounded-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

        <div className="relative z-10 space-y-8">
          {onClose && (
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}

          {/* Progress Indicator */}
          {!showSuccess && (
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(totalSteps)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentStep ? 'bg-indigo-400' : 'bg-slate-700/50'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: i + 1 === currentStep ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              ))}
            </div>
          )}

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-extralight text-white tracking-tight">
                Welcome Aboard!
              </h2>
              <p className="text-slate-400 text-sm font-light max-w-sm mx-auto">
                You're position #{submissionData?.position || '???'} of{' '}
                {(queueStats.waiting || 0) + 1}.
              </p>
              {submissionData?.referralCode && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">Share your link to move up the list!</p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      onClick={handleCopyLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" /> Copy Link
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare('twitter')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && !showSuccess && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-extralight text-white tracking-tight">
                    Join the Ecosystem
                  </h2>
                  <p className="text-slate-400 text-sm font-light max-w-sm mx-auto">
                    Choose your role to get started.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${getEmailIconColor()}`}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-12 py-4 text-white text-sm font-light rounded-xl border ${getEmailFieldStyles()}`}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AnimatePresence>{renderEmailValidationIcon()}</AnimatePresence>
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                      className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                      required
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name (optional)"
                      className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                    />
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3 col-span-2"
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Your Role *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roleOptions.map(role => (
                        <motion.button
                          key={role.value}
                          onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border text-left ${
                            formData.role === role.value
                              ? 'border-indigo-400/50 bg-indigo-900/20 text-white'
                              : 'border-slate-700/20 bg-slate-900/20 text-slate-300 hover:border-indigo-400/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <role.icon className="w-5 h-5 text-indigo-400" />
                            <div>
                              <div className="text-sm font-medium">{role.label}</div>
                              <div className="text-xs text-slate-400">{role.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.role && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.role}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && selectedRole?.fields.length > 0 && !showSuccess && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-extralight text-white tracking-tight">
                    Tell Us More
                  </h2>
                  <p className="text-slate-400 text-sm font-light max-w-sm mx-auto">
                    Customize your experience.
                  </p>
                </div>

                {formData.role !== 'discoverer' && (
                  <div>
                    <input
                      type="text"
                      value={formData.companyOrProject}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, companyOrProject: e.target.value }))
                      }
                      placeholder="Company/Project Name"
                      className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                      required
                    />
                    {errors.companyOrProject && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.companyOrProject}
                      </motion.p>
                    )}
                  </div>
                )}

                {selectedRole?.fields.includes('stage') && (
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Current Stage *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {stageOptions.map(stage => (
                        <motion.button
                          key={stage.value}
                          onClick={() => setFormData(prev => ({ ...prev, stage: stage.value }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border text-left ${
                            formData.stage === stage.value
                              ? 'border-indigo-400/50 bg-indigo-900/20 text-white'
                              : 'border-slate-700/20 bg-slate-900/20 text-slate-300 hover:border-indigo-400/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <stage.icon className="w-5 h-5 text-indigo-400" />
                            <div>
                              <div className="text-sm font-medium">{stage.label}</div>
                              <div className="text-xs text-slate-400">{stage.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.stage && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.stage}
                      </motion.p>
                    )}
                  </div>
                )}

                {selectedRole?.fields.includes('ticketSize') && (
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Investment Size *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ticketSizeOptions.map(size => (
                        <motion.button
                          key={size.value}
                          onClick={() => setFormData(prev => ({ ...prev, ticketSize: size.value }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border text-left ${
                            formData.ticketSize === size.value
                              ? 'border-indigo-400/50 bg-indigo-900/20 text-white'
                              : 'border-slate-700/20 bg-slate-900/20 text-slate-300 hover:border-indigo-400/30'
                          }`}
                        >
                          <div className="text-sm font-medium">{size.label}</div>
                          <div className="text-xs text-slate-400">{size.description}</div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.ticketSize && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.ticketSize}
                      </motion.p>
                    )}
                  </div>
                )}

                {selectedRole?.fields.includes('services') && (
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Services Offered *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {serviceOptions.map(service => (
                        <motion.button
                          key={service.value}
                          onClick={() => toggleService(service.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border text-center ${
                            formData.services.includes(service.value)
                              ? 'border-indigo-400/50 bg-indigo-900/20 text-white'
                              : 'border-slate-700/20 bg-slate-900/20 text-slate-300 hover:border-indigo-400/30'
                          }`}
                        >
                          <service.icon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                          <div className="text-sm font-medium">{service.label}</div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.services && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.services}
                      </motion.p>
                    )}
                  </div>
                )}

                {selectedRole?.fields.includes('goals') && (
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-3">
                      Your Goals *
                    </label>
                    <div className="space-y-3">
                      {formData.goals.map((goal, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-slate-900/20 rounded-xl border border-slate-700/20"
                        >
                          <span className="text-white text-sm">{goal}</span>
                          <button
                            onClick={() => removeGoal(goal)}
                            className="text-slate-400 hover:text-red-400 p-1 rounded-full hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={customGoal}
                          onChange={e => setCustomGoal(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && addGoal()}
                          placeholder="Add a goal..."
                          className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                        />
                        <motion.button
                          onClick={addGoal}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-4 bg-indigo-600 text-white rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    {errors.goals && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 px-3"
                      >
                        {errors.goals}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && !showSuccess && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-extralight text-white tracking-tight">
                    Final Details
                  </h2>
                  <p className="text-slate-400 text-sm font-light max-w-sm mx-auto">
                    Add a few more details to complete your profile.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    How did you hear about us?
                  </label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                  >
                    <option value="" className="bg-slate-900">
                      Select an option
                    </option>
                    {sourceOptions.map(source => (
                      <option key={source.value} value={source.value} className="bg-slate-900">
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Anything else you'd like to share..."
                    className="w-full pl-4 pr-4 py-4 text-white text-sm font-light rounded-xl border border-slate-700/20 bg-slate-900/20 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10 resize-none"
                    rows="4"
                    maxLength={500}
                  />
                  <div className="text-slate-400 text-xs mt-2 text-right">
                    {formData.notes.length}/500
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!showSuccess && (
            <div className="space-y-4">
              {/* Submit Error Display */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                </motion.div>
              )}
              
              <div className="flex justify-between items-center">
                <motion.button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  whileHover={{ scale: currentStep !== 1 ? 1.05 : 1 }}
                  whileTap={{ scale: currentStep !== 1 ? 0.95 : 1 }}
                  className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-2 ${
                    currentStep === 1
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </motion.button>

                <motion.button
                  onClick={nextStep}
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.05 }}
                  whileTap={{ scale: submitting ? 1 : 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : currentStep === totalSteps ? (
                      <>
                        <span>Join Now</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(WaitlistForm);
