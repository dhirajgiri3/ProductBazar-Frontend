"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMail, FiPhone, FiUser, FiCheck, FiChevronDown, FiChevronUp, FiInfo, FiRefreshCw } from 'react-icons/fi';

const OnboardingBanner = ({ nextStep, onComplete, onSkip, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!nextStep) {
    console.log('OnboardingBanner received null nextStep');
    return null;
  }

  // Check if all steps are completed
  const allStepsCompleted = nextStep.allSteps &&
    nextStep.allSteps.every(step => step.completed);

  if (allStepsCompleted) {
    console.log('OnboardingBanner: All steps are completed');
    return null;
  }

  console.log('OnboardingBanner rendering with nextStep:', nextStep);

  // Validate that nextStep has the required properties
  if (!nextStep.type) {
    console.error('OnboardingBanner received nextStep without type property:', nextStep);
    return null;
  }

  // Get the icon based on the verification type
  const getStepIcon = (type) => {
    switch (type) {
      case 'email_verification':
        return <FiMail className="h-4 w-4 text-white" />;
      case 'phone_verification':
        return <FiPhone className="h-4 w-4 text-white" />;
      case 'profile_completion':
        return <FiUser className="h-4 w-4 text-white" />;
      default:
        return <FiInfo className="h-4 w-4 text-white" />;
    }
  };

  // Get the link based on the verification type
  const getStepLink = (type) => {
    switch (type) {
      case 'email_verification':
        return '/auth/verify-email';
      case 'phone_verification':
        return '/auth/verify-phone';
      case 'profile_completion':
        return '/complete-profile';
      default:
        return '/complete-profile';
    }
  };



  // Calculate total steps and completed steps
  const totalSteps = nextStep.allSteps ? nextStep.allSteps.length : 3;
  const completedSteps = nextStep.progress ? nextStep.progress.completed : 0;
  const percentage = nextStep.progress ? nextStep.progress.percentage : 0;

  return (
    <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-3 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            {/* Icon based on verification type */}
            <div className="mr-3 bg-white/20 rounded-full p-1.5">
              {getStepIcon(nextStep.type)}
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium">{nextStep.title || 'Complete Your Profile'}</h3>
              <p className="text-xs text-white/80">{nextStep.message || nextStep.description}</p>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors md:hidden"
            >
              {showDetails ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Progress indicator (visible on desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-32 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium whitespace-nowrap">
                {completedSteps} of {totalSteps} completed
              </span>
            </div>

            {/* Refresh button - always show */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Refresh verification status"
              >
                <FiRefreshCw className="h-4 w-4" />
              </button>
            )}

            {/* Skip button - only show for profile completion */}
            {nextStep.type === 'profile_completion' && nextStep.skippable && (
              <button
                onClick={onSkip}
                className="text-white hover:text-gray-100 px-3 py-1.5 text-sm font-medium transition-colors underline"
              >
                Skip for now
              </button>
            )}

            <Link href={getStepLink(nextStep.type)}>
              <button
                onClick={onComplete}
                className="bg-white text-violet-600 hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                {nextStep.actionLabel || 'Complete Now'}
              </button>
            </Link>
          </div>
        </div>

        {/* Expanded details (mobile only) */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 md:hidden overflow-hidden"
            >
              {/* Progress steps */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium ml-2 whitespace-nowrap">
                  {completedSteps} of {totalSteps}
                </span>
              </div>

              {/* All steps */}
              <div className="space-y-2">
                {nextStep.allSteps && nextStep.allSteps.map((step, index) => (
                  <Link
                    key={index}
                    href={getStepLink(step.type)}
                    className={`flex items-center p-2 rounded-md ${step.completed ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/30 transition-colors`}
                  >
                    <div className={`mr-3 ${step.completed ? 'bg-green-500/40' : 'bg-white/20'} rounded-full p-1.5`}>
                      {step.completed ? <FiCheck className="h-4 w-4 text-white" /> : getStepIcon(step.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{step.title}</h4>
                      <p className="text-xs text-white/80">{step.message || step.description}</p>
                    </div>
                    {step.completed ? (
                      <span className="text-xs bg-green-500/30 text-white px-2 py-0.5 rounded-full">Completed</span>
                    ) : step.type === nextStep.type ? (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                    ) : (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingBanner;
