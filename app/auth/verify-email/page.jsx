"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, XCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../../Components/common/LoadingSpinner';

// Custom hook to extract token from URL when the page is loaded via email verification link
const useVerificationToken = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  // URL may have token in path or query parameters
  // Check URL path if the token is part of a route like /verify-email/TOKEN
  const router = useRouter();
  const pathname = router.pathname;
  
  useEffect(() => {
    // If token is in URL path, extract it
    if (!token && pathname.includes('/verify-email/')) {
      const pathSegments = pathname.split('/');
      const pathToken = pathSegments[pathSegments.length - 1];
      if (pathToken && pathToken !== 'verify-email') {
        // Here we would set the token, but since this is a custom hook
        // we'd return it and let the component handle it
        return pathToken;
      }
    }
  }, [pathname, token]);
  
  return token;
};

const VerifyEmailPage = () => {
  const { user, resendEmailVerification, verifyEmail, authLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', or null
  const router = useRouter();
  const searchParams = useSearchParams();
  const intervalRef = useRef(null);
  const emailInputRef = useRef(null);
  const urlToken = searchParams.get('token');
  const [token, setToken] = useState(urlToken);

  useEffect(() => {
    // Handle token verification if present in URL
    const handleTokenVerification = async () => {
      if (token) {
        setIsVerifying(true);
        try {
          const result = await verifyEmail(token);
          if (result.success) {
            setVerificationStatus('success');
            setIsVerified(true);
            // Wait 3 seconds before redirecting to profile
            setTimeout(() => {
              router.push(`/user/${result.user?.username || ''}`);
            }, 3000);
          } else {
            setVerificationStatus('error');
            setErrorMessage(result.message || 'Verification failed. The link may be expired or invalid.');
          }
        } catch (err) {
          setVerificationStatus('error');
          setErrorMessage(err.message || 'An error occurred during verification.');
        } finally {
          setIsVerifying(false);
        }
      }
    };

    // Pre-fill with user email if available
    if (user?.email) {
      setEmail(user.email);
    }

    // Focus email input if empty and not in verification mode
    if (emailInputRef.current && !email && !token) {
      emailInputRef.current.focus();
    }

    // Check if user is already verified
    if (user?.isEmailVerified && !token) {
      setIsAlreadyVerified(true);
      // Only redirect if not in token verification flow
      if (!verificationStatus) {
        // Allow user to see the already verified message for 3 seconds
        setTimeout(() => {
          router.push(`/user/${user.username}`);
        }, 3000);
      }
    }

    // Run token verification if present
    if (token && !verificationStatus) {
      handleTokenVerification();
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, router, email, token, verificationStatus, verifyEmail]);

  const startCooldown = () => {
    setCooldown(60); // 60 seconds cooldown
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting || cooldown > 0) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccess(false);

    try {
      // Check if email matches the current user's email
      if (user?.email && email.toLowerCase() !== user.email.toLowerCase()) {
        setErrorMessage('Please use the email associated with your account or log in with the new email');
        setIsSubmitting(false);
        return;
      }

      const response = await resendEmailVerification(email);
      
      if (response.success) {
        setSuccess(true);
        startCooldown();
        // Clear any previous errors
        setErrorMessage('');
      } else {
        // Handle specific error scenarios
        if (response.message?.includes('already verified')) {
          setIsAlreadyVerified(true);
        } else {
          setErrorMessage(response.message || 'Failed to send verification email');
        }
      }
    } catch (err) {
      // Handle different error types with friendly messages
      if (err.message?.includes('rate limit') || err.message?.includes('too many')) {
        setErrorMessage('You have requested too many verification emails. Please wait before trying again.');
      } else if (err.message?.includes('not found') || err.message?.includes('no account')) {
        setErrorMessage('No account found with this email address. Please check your email or create a new account.');
      } else if (err.message?.includes('already verified')) {
        setIsAlreadyVerified(true);
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo and Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl font-bold text-white">PB</span>
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {token 
              ? 'Verifying Your Email' 
              : isAlreadyVerified 
                ? 'Email Verified' 
                : 'Verify Your Email'}
          </h2>
          <p className="text-gray-600">
            {token 
              ? 'Please wait while we verify your email address...' 
              : isAlreadyVerified 
                ? 'Your email has been successfully verified'
                : "We&apos;ll send a verification link to your email address"}
          </p>
        </motion.div>

        {/* Step Indicator - Show only when not verifying with token */}
        {!token && !isAlreadyVerified && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Email</span>
              </div>

              <div className="w-8 h-0.5 bg-gray-200"></div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Verify</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl border border-gray-100"
          variants={itemVariants}
        >
          {token ? (
            // Token verification flow
            <motion.div variants={itemVariants} className="text-center">
              {isVerifying ? (
                <div>
                  <LoadingSpinner size="md" color="violet" showBackground fullScreen text="Verifying..." />
                </div>
              ) : verificationStatus === 'success' ? (
                <motion.div variants={successVariants} className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">Verification Successful!</h3>
                  <p className="text-gray-600 mt-2">Redirecting to your profile...</p>
                </motion.div>
              ) : (
                <motion.div variants={successVariants} className="flex flex-col items-center">
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">Verification Failed</h3>
                  <p className="text-gray-600 mt-2">{errorMessage}</p>
                  <Link href="/auth/verify-email" className="mt-4 text-primary hover:underline">
                    Request a new verification link
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ) : isAlreadyVerified ? (
            // Already verified message
            <motion.div variants={itemVariants} className="text-center">
              <motion.div variants={successVariants} className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Email Already Verified</h3>
                <p className="text-gray-600 mt-2">You&apos;re all set! Redirecting to your profile...</p>
              </motion.div>
            </motion.div>
          ) : (
            // Email submission form
            <motion.div variants={itemVariants}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start bg-red-50 p-3 rounded-lg border border-red-200"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <p className="text-sm text-green-700">A new verification link has been sent to your email.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || cooldown > 0}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="md" showBackground fullScreen color="white" inline />
                    ) : cooldown > 0 ? (
                      <div className="flex items-center">
                        <span className="mr-2">Resend in {cooldown}s</span>
                        <div className="relative w-4 h-4">
                          <LoadingSpinner size="sm" showBackground fullScreen color="white" inline />
                        </div>
                      </div>
                    ) : (
                      'Send Verification Link'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  {token ? 'Need assistance?' : isAlreadyVerified ? 'Go to app' : 'Already verified?'}
                </span>
              </div>
            </div>

            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={isAlreadyVerified ? "/products" : "/auth/login"}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg hover:bg-primary/5"
              >
                {isAlreadyVerified ? 'Discover Products' : 'Return to Login'}
              </Link>
            </motion.div>
          </motion.div>

        {/* Footer Help Text - Only show for email verification request mode */}
        {!token && !isAlreadyVerified && (
          <motion.div
            className="mt-6 text-center text-sm text-gray-500"
            variants={itemVariants}
          >
            <p className="leading-relaxed">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                try another email
              </Link>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;