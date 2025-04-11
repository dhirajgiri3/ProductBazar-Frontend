"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '../../../Contexts/Auth/AuthContext';
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from './HeroSection';
import CategoryGrid from "./CategoryGrid";
import TrendingProductsSection from "./TrendingProductSection";
import PersonalizedSection from "./PersonalizedSection";
import NewProductsSection from "./NewProductsSection";
import CommunityPicksSection from "./CommunityPicksSection";
import InterestBasedSection from "./InterestBasedSection";
import CollaborativeSection from "./CollaborativeSection";
import ForumThreadsSection from "./ForumThreadsSection";
import NewsletterSignup from '../../../Components/common/Auth/NewsletterSignup';
import logger from '../../../Utils/logger';
import { ArrowUp } from "lucide-react";

// Loading fallback for lazy-loaded components
const SectionSkeleton = ({ height = "h-64" }) => (
  <div className={`animate-pulse rounded-2xl ${height} bg-gray-100 w-full shadow-sm`}></div>
);

// Section wrapper for consistent styling and animations
const SectionWrapper = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`w-full ${className}`}
  >
    {children}
  </motion.div>
);

// Section divider component
const SectionDivider = () => (
  <div className="my-12 border-t border-gray-100"></div>
);

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { recordInteraction } = useRecommendation();
  const [userType, setUserType] = useState("general");
  const [pageLoaded, setPageLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine user type for personalized content
  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case "startupOwner":
          setUserType("startupOwner");
          break;
        case "investor":
          setUserType("investor");
          break;
        case "jobseeker":
          setUserType("jobSeeker");
          break;
        case "freelancer":
          setUserType("freelancer");
          break;
        default:
          setUserType("general");
      }
    } else {
      setUserType("general");
    }
  }, [user]);

  // Track page view for recommendations with debouncing
  useEffect(() => {
    // Use a debounced function to avoid multiple calls
    const trackPageView = async () => {
      try {
        // Only track if authenticated and after a short delay
        if (isAuthenticated && recordInteraction) {
          // Check if we've already tracked a page view in this session
          const pageViewKey = 'homepage_view_tracked';
          const lastTracked = sessionStorage.getItem(pageViewKey);
          const now = Date.now();

          // Only track once per 5 minutes per session
          if (!lastTracked || (now - parseInt(lastTracked)) > 5 * 60 * 1000) {
            // Use non-blocking approach
            setTimeout(async () => {
              try {
                const result = await recordInteraction('homepage', 'page_view', {
                  pageType: 'homepage',
                  userType,
                  section: 'main',
                  timestamp: new Date().toISOString(),
                  path: window.location.pathname,
                });

                if (result.success) {
                  // Store timestamp of successful tracking
                  sessionStorage.setItem(pageViewKey, now.toString());
                  logger.debug('Homepage view tracked' + (result.rateLimited ? ' (rate limited)' : ''));
                } else if (result.error) {
                  logger.warn('Homepage view tracking failed:', result.error);
                }
              } catch (error) {
                logger.error('Unexpected error tracking homepage view:', error);
              }
            }, 1000); // Delay tracking by 1 second to prioritize content loading
          } else {
            logger.debug('Homepage view tracking skipped (already tracked recently)');
          }
        }
      } catch (error) {
        // Catch any errors in sessionStorage access
        logger.error('Error in page view tracking setup:', error);
      }
    };

    // Only track page view when component mounts
    trackPageView();
  }, [isAuthenticated, userType]);

  // Set page loaded state after initial render
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Handle search from hero section
  const handleSearch = useCallback((query) => {
    if (query) {
      setSearchQuery(query);
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }, []);

  // Group sections by priority for better organization
  const renderMainContent = () => (
    <div className="lg:col-span-2 space-y-12">
      <SectionWrapper>
        <TrendingProductsSection />
      </SectionWrapper>

      {isAuthenticated && (
        <SectionWrapper delay={0.2}>
          <PersonalizedSection />
        </SectionWrapper>
      )}

      <SectionDivider />

      <SectionWrapper delay={0.3}>
        <NewProductsSection />
      </SectionWrapper>

      {isAuthenticated && (
        <SectionWrapper delay={0.4}>
          <InterestBasedSection />
        </SectionWrapper>
      )}

      {isAuthenticated && (
        <SectionWrapper delay={0.5}>
          <CollaborativeSection />
        </SectionWrapper>
      )}

      {isAuthenticated && (
        <SectionWrapper delay={0.6}>
          <CommunityPicksSection />
        </SectionWrapper>
      )}
    </div>
  );

  // Sidebar content
  const renderSidebar = () => (
    <div className="space-y-12">
      <SectionWrapper>
        <ForumThreadsSection />
      </SectionWrapper>

      <SectionWrapper delay={0.2}>
        <NewsletterSignup />
      </SectionWrapper>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        {/* Hero Section - Full width */}
        <SectionWrapper>
          <HeroSection onSearch={handleSearch} />
        </SectionWrapper>

        {/* Category Grid - Full width */}
        <SectionWrapper delay={0.2} className="mt-8">
          <Suspense fallback={<SectionSkeleton height="h-48" />}>
            <CategoryGrid />
          </Suspense>
        </SectionWrapper>

        <SectionDivider />

        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Main content */}
          {pageLoaded ? renderMainContent() : (
            <div className="lg:col-span-2 space-y-12">
              <SectionSkeleton height="h-96" />
              <SectionSkeleton height="h-96" />
            </div>
          )}

          {/* Right column - Sidebar */}
          {pageLoaded ? renderSidebar() : (
            <div className="space-y-12">
              <SectionSkeleton height="h-96" />
              <SectionSkeleton height="h-64" />
            </div>
          )}
        </div>
      </div>

      {/* Back to top button - appears when scrolling down */}
      <BackToTopButton />
    </motion.div>
  );
}

// Back to top button component that appears when scrolling
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg bg-violet-600 text-white z-50 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          aria-label="Back to top"
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};