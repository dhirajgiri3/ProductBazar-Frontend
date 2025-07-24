'use client';

import React, { useState, useEffect, useRef, Suspense, lazy, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWaitlist } from '../../lib/contexts/waitlist-context';

const DashboardPreviewCore = dynamic(() => import('../DashboardPreview/DashboardPreview'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-900/20 rounded-2xl animate-pulse" />
});

const PositionTracker = dynamic(() => import('./Components/PositionTracker'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-900/20 rounded-2xl animate-pulse" />
});

const ReferralDashboard = dynamic(() => import('./Components/ReferralDashboard'), {
  ssr: false,
  loading: () => <div className="h-80 bg-slate-900/20 rounded-2xl animate-pulse" />
});

import HeroSection from './Components/HeroSection';
import LoadingSpinner from '../common/LoadingSpinner';
const ActivationGuide = dynamic(() => import('./Components/ActivationGuide'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-900/20 rounded-2xl animate-pulse" />
});

const EmptyState = dynamic(() => import('./Components/EmptyState'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-900/20 rounded-2xl animate-pulse" />
});

// Optimized background component with reduced animations
const OptimizedBackground = React.memo(() => {
  const [isReduced, setIsReduced] = useState(true); // Default to reduced motion for performance
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    const handleChange = e => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Use CSS for animations instead of JS for better performance
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Simplified gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{
          backgroundImage: isReduced ? 'none' : `
            radial-gradient(ellipse 80% 60% at 50% 40%, 
              rgba(99, 102, 241, 0.1) 0%, 
              rgba(139, 92, 246, 0.05) 50%, 
              transparent 80%)
          `
        }}
      />
      
      {/* Simplified grid pattern using CSS */}
      {!isReduced && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(129, 140, 248, 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(129, 140, 248, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}
      
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
    </div>
  );
});

OptimizedBackground.displayName = 'OptimizedBackground';

// Lightweight section wrapper with intersection observer for lazy loading
const LazySection = React.memo(({ children, id, className = '', threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <section id={id} ref={ref} className={className}>
      {isVisible ? children : <div className="h-96 bg-slate-900/10 rounded-2xl animate-pulse" />}
    </section>
  );
});

LazySection.displayName = 'LazySection';

function WaitlistLanding() {
  const {
    formData,
    loading,
    submitting,
    positionChecking,
    isLoading, // Unified loading state from context
    isInitialLoading, // Initial context loading
    isProcessing, // Non-blocking operations
    errors,
    submitApplication,
    checkPosition,
    updateFormData,
    resetForm,
    clearErrors,
    userEntry,
    isOnWaitlist,
    hasAccess,
    queueStats
  } = useWaitlist();

  // Optimized state management - removed redundant loading states
  const [localState, setLocalState] = useState({
    showFullForm: false,
    showSuccess: false,
    submissionData: null,
    hasViewedPosition: false,
    autoActivateDashboard: false
  });

  // Memoized counter with optimized animation
  const liveCounter = useMemo(() => {
    // Return the actual waiting count from database, no fallback
    return queueStats?.waiting || 0;
  }, [queueStats?.waiting]);

  // Optimized handlers with useCallback
  const handleFormSuccess = useCallback((data) => {
    // Prevent multiple state updates
    setLocalState(prev => {
      // Only update if not already showing success
      if (prev.showSuccess) return prev;
      
      return {
        ...prev,
        submissionData: data,
        showSuccess: true
      };
    });
    
    // Store in localStorage only once
    if (typeof window !== 'undefined') {
      localStorage.setItem('waitlist_joined', '1');
      localStorage.setItem('waitlist_submission_data', JSON.stringify(data));
    }
  }, []);

  const handleSimpleFormSuccess = useCallback((data) => {
    // Use the same handler to ensure consistency
    handleFormSuccess(data);
  }, [handleFormSuccess]);

  const resetLocalForm = useCallback(() => {
    setLocalState(prev => ({
      ...prev,
      showFullForm: false,
      showSuccess: false,
      submissionData: null
    }));
    
    // Clean up localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('waitlist_joined');
      localStorage.removeItem('waitlist_submission_data');
    }
  }, []);

  const scrollToPosition = useCallback(() => {
    const positionElement = document.getElementById('position');
    if (positionElement) {
      const offset = 80;
      const elementPosition = positionElement.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback with retry
      setTimeout(() => {
        const fallbackElement = document.getElementById('position');
        if (fallbackElement) {
          const offset = 80;
          const elementPosition = fallbackElement.offsetTop - offset;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, []);

  const handlePositionCheck = useCallback(async (email) => {
    if (!email?.trim()) return;

    try {
      const result = await checkPosition(email.trim());
      if (result) {
        setTimeout(() => {
          document.getElementById('position')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }, [checkPosition]);

  const handleAccessDashboard = useCallback(async (entryData) => {
    try {
      setLocalState(prev => ({
        ...prev,
        showSuccess: false,
        autoActivateDashboard: true
      }));
      
      // Ensure smooth scroll to position tracker
      const scrollToPositionTracker = () => {
        const positionElement = document.getElementById('position');
        if (positionElement) {
          // Add offset for better positioning
          const offset = 80; // Account for any fixed headers
          const elementPosition = positionElement.offsetTop - offset;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        } else {
          // Fallback: try scrolling to the section after a delay
          setTimeout(() => {
            const fallbackElement = document.getElementById('position');
            if (fallbackElement) {
              const offset = 80;
              const elementPosition = fallbackElement.offsetTop - offset;
              window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
              });
            }
          }, 500);
        }
      };
      
      if (entryData?.email) {
        // Initial scroll to position tracker
        setTimeout(scrollToPositionTracker, 100);
        
        // Auto-check position after a delay
        setTimeout(async () => {
          try {
            await checkPosition(entryData.email);
            setLocalState(prev => ({ ...prev, hasViewedPosition: true }));
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('has_viewed_position', 'true');
            }
            
            // Scroll to referrals section after position check
            setTimeout(() => {
              const referralsElement = document.getElementById('referrals');
              if (referralsElement) {
                const offset = 80;
                const elementPosition = referralsElement.offsetTop - offset;
                window.scrollTo({
                  top: elementPosition,
                  behavior: 'smooth'
                });
              }
            }, 800);
          } catch (error) {
            // Handle error silently
          }
        }, 600);
      } else {
        // Fallback scroll if no email data
        setTimeout(scrollToPositionTracker, 100);
      }
    } catch (error) {
      setLocalState(prev => ({ ...prev, showSuccess: false }));
      setTimeout(scrollToPositionTracker, 100);
    }
  }, [checkPosition]);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasViewed = localStorage.getItem('has_viewed_position');
      if (hasViewed) {
        setLocalState(prev => ({ ...prev, hasViewedPosition: true }));
      }

      // Restore modal state if user just joined
      const joined = localStorage.getItem('waitlist_joined');
      const data = localStorage.getItem('waitlist_submission_data');
      if (joined && data) {
        try {
          setLocalState(prev => ({
            ...prev,
            submissionData: JSON.parse(data),
            showSuccess: true
          }));
          localStorage.removeItem('waitlist_joined');
          localStorage.removeItem('waitlist_submission_data');
        } catch (e) {
          // Handle parsing error silently
        }
      }
    }
  }, []);

  // Memoized dashboard accessibility check
  const isDashboardAccessible = useMemo(() => {
    return isOnWaitlist && userEntry && localState.hasViewedPosition;
  }, [isOnWaitlist, userEntry, localState.hasViewedPosition]);

  // Only show full-screen loader for initial context loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <LoadingSpinner 
            size="md" 
            color="violet" 
            text="Loading waitlist..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section - Always visible, no lazy loading */}
      <section id="hero" className="relative overflow-hidden min-h-screen">
        <OptimizedBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 mt-20">
            <div className="w-full max-w-7xl mx-auto">
              <HeroSection
                liveCounter={liveCounter}
                showSuccess={localState.showSuccess}
                showFullForm={localState.showFullForm}
                submissionData={localState.submissionData}
                resetForm={resetLocalForm}
                handleFormSuccess={handleFormSuccess}
                handleSimpleFormSuccess={handleSimpleFormSuccess}
                setShowFullForm={(show) => setLocalState(prev => ({ ...prev, showFullForm: show }))}
                onAccessDashboard={handleAccessDashboard}
                onCheckPosition={handlePositionCheck}
                isCheckingPosition={positionChecking}
                isLoading={isInitialLoading} // Pass the initial loading state
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section - Lazy loaded */}
      <LazySection id="dashboard-preview" threshold={0.1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full py-16">
            <Suspense fallback={<div className="h-96 bg-slate-900/20 rounded-2xl animate-pulse" />}>
              <DashboardPreviewCore isDark={true} />
            </Suspense>
          </div>
        </div>
      </LazySection>

      {/* Position Tracker Section - Lazy loaded */}
      <LazySection 
        id="position" 
        className="py-16 sm:py-24 lg:py-32 bg-slate-950 relative overflow-hidden scroll-mt-20"
        threshold={0.1}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="h-64 bg-slate-900/20 rounded-2xl animate-pulse" />}>
            <PositionTracker 
              autoFillEmail={localState.autoActivateDashboard && localState.submissionData?.email ? localState.submissionData.email : null}
              autoSubmit={localState.autoActivateDashboard}
            />
          </Suspense>
        </div>
      </LazySection>

      {/* Referral Dashboard Section - Lazy loaded */}
      <LazySection 
        id="referrals" 
        className="bg-slate-950 relative overflow-hidden"
        threshold={0.1}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-16 sm:pb-24 lg:pb-32">
            <Suspense fallback={<div className="h-80 bg-slate-900/20 rounded-2xl animate-pulse" />}>
              {isDashboardAccessible ? (
                <ReferralDashboard />
              ) : isOnWaitlist && userEntry && !localState.hasViewedPosition ? (
                <ActivationGuide scrollToPosition={scrollToPosition} />
              ) : (
                <EmptyState />
              )}
            </Suspense>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </LazySection>
      
      {/* Processing overlay - only show for non-blocking operations */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[55]">
          <div className="bg-slate-900/95 border border-slate-800/40 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <LoadingSpinner 
              size="md" 
              color="violet" 
              text={
                submitting ? "Submitting application..." :
                positionChecking ? "Checking position..." :
                "Processing..."
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WaitlistLanding);
