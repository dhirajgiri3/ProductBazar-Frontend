"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWaitlist } from '@/lib/contexts/waitlist-context';
import { useAuth } from '@/lib/contexts/auth-context';
import LoadingSpinner from '@/Components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle,
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  X, 
  Shield,
  Clock,
  ArrowRight,
  Mail,
  Home,
  RefreshCw
} from 'lucide-react';

export default function WaitlistVerifyPage() {
  const router = useRouter();
  const { token } = useParams();
  const { verifyMagicLink, loading: waitlistLoading } = useWaitlist();
  const { handleUserData, setNextStep } = useAuth();
  const [verificationState, setVerificationState] = useState('verifying');
  const [error, setError] = useState(null);
  const [nextStep, setLocalNextStep] = useState('dashboard');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const isVerifyingRef = useRef(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log('Verification page mounted with token:', token);
    
    // Avoid verifying the same token multiple times across hot reloads / remounts
    const VERIFICATION_GUARD_KEY = `waitlist_token_verified_${token}`;

    const existingGuard = typeof window !== 'undefined' ? sessionStorage.getItem(VERIFICATION_GUARD_KEY) : null;
    if (existingGuard && existingGuard !== 'in_progress') {
      // Token already verified (or attempted) in this session – skip duplicate call
      console.log('Token already verified in this session, skipping');
      // If it was successful, redirect immediately
      if (existingGuard === 'success') {
        router.replace('/complete-profile');
      } else {
        setVerificationState('error');
        setError('This verification link has already been used in this session.');
      }
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(VERIFICATION_GUARD_KEY, 'in_progress');
    }
    
    // Prevent the effect from running more than once
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    
    if (!token) {
      console.log('No token provided');
      setVerificationState('error');
      setError('Invalid verification link. No token provided.');
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Verification timeout reached');
      setVerificationState('error');
      setError('Verification timed out. Please try again or contact support.');
    }, 30000); // 30 second timeout

    // Verify the magic link token
    const verifyToken = async () => {
      // Declare interval ID in outer scope so it can be cleared in any branch
      let progressIntervalId;
      try {
        console.log('Starting verification process...');
        // Simulate progress for better UX
        progressIntervalId = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressIntervalId);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        console.log('Calling verifyMagicLink...');
        const result = await verifyMagicLink(token);
        console.log('Verification result received:', result);

        // Clear the timeout since we got a result
        clearTimeout(timeoutId);

        // Clear the progress interval once we have a result
        if (progressIntervalId) clearInterval(progressIntervalId);
        setProgress(100);
        
        if (result.success) {
          console.log('Verification successful, processing result...');
          
          // Mark as successful in session storage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(VERIFICATION_GUARD_KEY, 'success');
          }
          
          // Store user data for display
          setUserData(result.user);
          
          // For waitlist users, always redirect to complete-profile for better UX
          // The complete-profile component will handle password setup if needed
          let targetNextStep = 'complete-profile';
          
          // Only go to dashboard if user is not from waitlist and doesn't need profile completion
          if (result.user?.registrationMethod !== 'waitlist' && !result.user?.needsProfileCompletion) {
            targetNextStep = 'dashboard';
          }
          
          console.log('Setting next step to:', targetNextStep);
          setLocalNextStep(targetNextStep);
          setVerificationState('success');
          
          // Properly integrate with auth context
          if (result.user && handleUserData) {
            console.log('Calling handleUserData...');
            handleUserData(result.user);
          }
          
          // Set the next step in auth context if profile completion is needed
          if (targetNextStep === 'complete-profile' && setNextStep) {
            console.log('Setting next step in auth context...');
            setNextStep({
              type: 'profile_completion',
              title: 'Complete your profile',
              description: 'Complete your profile to access all features',
              required: false,
              skippable: false
            });
          }
          
          // Start countdown for redirect with longer delay
          setCountdown(5); // Give user more time to read success message
          console.log('Starting countdown timer...');
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                // Redirect based on nextStep
                console.log('Redirecting to:', targetNextStep === 'complete-profile' ? '/complete-profile' : '/');
                if (targetNextStep === 'complete-profile') {
                  router.replace('/complete-profile');
                } else {
                  router.replace('/');
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          console.log('Verification failed:', result.message);
          
          // Mark as failed in session storage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(VERIFICATION_GUARD_KEY, 'failed');
          }
          
          setVerificationState('error');
          setError(result.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (err) {
        console.error('Verification error caught:', err);
        
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        // Mark as failed in session storage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(VERIFICATION_GUARD_KEY, 'failed');
        }
        
        // Clear any running interval to avoid infinite loop on error
        if (progressIntervalId) clearInterval(progressIntervalId);
        setVerificationState('error');
        setError(err.message || 'An unexpected error occurred during verification. Please try again or contact support.');
      }
    };

    verifyToken();
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  // The dependencies array is empty to ensure this effect runs only once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleManualRedirect = () => {
    if (nextStep === 'complete-profile') {
      router.replace('/complete-profile');
    } else {
      router.replace('/');
    }
  };

  const handleRetry = () => {
    setVerificationState('verifying');
    setError(null);
    setProgress(0);
    isVerifyingRef.current = false;
    if (typeof window !== 'undefined') {
      const VERIFICATION_GUARD_KEY = `waitlist_token_verified_${token}`;
      sessionStorage.removeItem(VERIFICATION_GUARD_KEY);
    }
    window.location.reload();
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
        return (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 bg-violet-50 border-2 border-violet-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <LoadingSpinner size="lg" color="violet" />
              </div>
              {/* Progress ring */}
              <div className="absolute inset-0 w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgb(237, 233, 254)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Verifying your invitation...
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Please wait while we validate your access token and set up your account.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure verification in progress</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                🎉 Welcome to ProductBazar!
              </h2>
              
              {userData && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-md mx-auto">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-800 font-semibold">{userData.firstName} {userData.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-800 font-semibold">{userData.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Role:</span>
                      <span className="text-gray-800 font-semibold capitalize">{userData.role}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-700 text-lg max-w-md mx-auto">
                Your invitation has been verified successfully! {userData?.needsProfileCompletion 
                  ? "Let's complete your profile to get started." 
                  : "You now have full access to ProductBazar."}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Account verified and secured</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Clock className="w-4 h-4" />
                <span>Redirecting to {nextStep === 'complete-profile' ? 'profile setup' : 'dashboard'} in {countdown} seconds...</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                onClick={handleManualRedirect}
                className="px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowRight className="w-4 h-4" />
                {nextStep === 'complete-profile' ? 'Complete Profile' : 'Go to Dashboard'}
              </motion.button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Verification Failed
              </h2>
              <p className="text-gray-700 text-lg max-w-md mx-auto">
                {error}
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-red-800 font-medium mb-3">Possible reasons:</h3>
                <ul className="text-sm text-red-700 text-left space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The verification link has expired
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The link has already been used
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    The link is invalid or corrupted
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Your invitation status has changed
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Need help? Contact our support team</span>
              </div>
              </div>
              
              <div className="flex justify-center space-x-4">
              <motion.button
                onClick={handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                  Try Again
              </motion.button>
              
              <motion.button
                onClick={() => router.push('/waitlist')}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Back to Waitlist
              </motion.button>
              </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Still having issues?{' '}
                <a 
                  href="mailto:support@productbazar.com" 
                  className="text-violet-600 hover:text-violet-700 underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" color="violet" text="Verifying..." />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Logo/Brand */}
        <div className="flex justify-center mb-10">
          <motion.div 
            className="flex items-center space-x-2" 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-medium text-violet-600">ProductBazar</span>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-lg overflow-hidden flex flex-col border border-gray-200 shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Card Header */}
          <div className="border-b border-gray-200 flex-shrink-0 px-6 py-5 bg-gradient-to-r from-violet-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2
                  className="text-xl font-semibold text-gray-800 mb-1 flex items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="w-1.5 h-6 bg-violet-600 rounded-full mr-3"></span>
                  {verificationState === 'verifying' ? 'Verifying Invitation' : 
                   verificationState === 'success' ? 'Verification Complete' : 
                   'Verification Failed'}
                </motion.h2>
                <motion.p
                  className="text-gray-600 text-sm ml-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {verificationState === 'verifying' ? 'Validating your access token...' :
                   verificationState === 'success' ? 'Your account has been successfully verified' :
                   'There was an issue with the verification process'}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={verificationState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
        {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0 bg-gray-50">
            <motion.div
              className="text-xs text-gray-500 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date().getFullYear()} © ProductBazar
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 