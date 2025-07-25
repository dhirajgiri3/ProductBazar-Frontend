"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { oauthHandler } from '@/lib/utils/oauth';
import Image from 'next/image';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Google OAuth Button Component
 * 
 * Features:
 * - Minimalistic design with clean typography
 * - Handles both login and signup flows
 * - Smooth loading states and animations
 * - Error handling with subtle feedback
 * - Responsive design
 * - Accessibility compliant
 */

const GoogleAuthButton = ({ 
  isLogin = true, 
  size = "default", 
  className = "",
  onError = null,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Optimized size variants for cleaner design
  const sizeClasses = {
    sm: "px-4 py-2.5 text-sm h-10",
    compact: "px-5 py-3 text-sm h-12",
    default: "px-6 py-3.5 text-base h-12",
    lg: "px-8 py-4 text-lg h-14"
  };

  // Icon sizes for proper scaling
  const iconSizes = {
    sm: 16,
    compact: 18,
    default: 20,
    lg: 24
  };

  /**
   * Handle Google OAuth initiation
   */
  const handleGoogleAuth = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      setError('');

      // Clear any previous auth errors
      if (oauthHandler.isOAuthCallback()) {
        oauthHandler.clearOAuthParams();
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';
      const type = isLogin ? 'login' : 'register';
      const oauthUrl = oauthHandler.generateOAuthUrl('google', type, baseUrl);

      if (oauthUrl) {
        window.location.href = oauthUrl;
      } else {
        throw new Error('Failed to generate OAuth URL');
      }

    } catch (err) {
      console.error('Google OAuth error:', err);
      const errorMessage = oauthHandler.getErrorMessage('oauth_error') || 'Authentication failed. Please try again.';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  const iconSize = iconSizes[size];

  return (
    <div className="w-full">
      <motion.button
        onClick={handleGoogleAuth}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles - Clean and minimal
          "w-full relative flex items-center justify-center gap-3 font-medium rounded-xl",
          "border border-gray-200 bg-white text-gray-800",
          "transition-all duration-200 ease-out",
          "hover:border-gray-300 hover:bg-gray-50",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white",
          
          // Size classes
          sizeClasses[size],
          
          // Custom classes
          className
        )}
        whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
        transition={{ duration: 0.15 }}
        aria-label={`${isLogin ? 'Sign in' : 'Sign up'} with Google`}
      >
        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" color="gray" inline />
            <span className="text-gray-600">Connecting...</span>
          </div>
        ) : (
          <>
            {/* Google Logo */}
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width={iconSize}
              height={iconSize}
              className="flex-shrink-0"
              priority
            />
            
            {/* Button text */}
            <span className="font-medium">
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </span>
          </>
        )}
      </motion.button>

      {/* Error message - Clean and minimal */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
