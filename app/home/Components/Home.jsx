"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "./HeroSection";
import TrendingProductsSection from "./TrendingProductSection";
import PersonalizedSection from "./PersonalizedSection";
import NewProductsSection from "./NewProductsSection";
import HybridFeedSection from "./HybridFeedSection";
import InterestBasedSection from "./InterestBasedSection";
import ForumThreadsSection from "./ForumThreadsSection";
import CategoryList from "./CategoryList";
import NewsletterSignup from "../../../Components/common/Auth/NewsletterSignup";
import logger from "../../../Utils/logger";
import {
  ArrowUp,
  Clock,
  AlertCircle,
} from "lucide-react";

// Loading fallback for lazy-loaded components
const SectionSkeleton = ({ height = "h-64" }) => (
  <div
    className={`animate-pulse rounded-xl ${height} bg-gray-100/60 w-full shadow-sm overflow-hidden`}
  >
    <div className="h-4 w-1/3 bg-gray-200 rounded-full mb-4 mx-6 mt-6"></div>
    <div className="h-24 bg-gray-200/70 mx-6 rounded-lg mb-4"></div>
    <div className="h-24 bg-gray-200/70 mx-6 rounded-lg mb-4"></div>
    <div className="h-24 bg-gray-200/70 mx-6 rounded-lg"></div>
  </div>
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
  const { showToast } = useToast();
  const [userType, setUserType] = useState("general");
  const [pageLoaded, setPageLoaded] = useState(false);
  const rateLimitWarningShown = useRef(false);


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
          const pageViewKey = "homepage_view_tracked";
          const lastTracked = sessionStorage.getItem(pageViewKey);
          const now = Date.now();

          // Only track once per 5 minutes per session
          if (!lastTracked || now - parseInt(lastTracked) > 5 * 60 * 1000) {
            // Use non-blocking approach with a single tracking attempt
            if (!window._homepageViewTracking) {
              window._homepageViewTracking = true;

              setTimeout(async () => {
                try {
                  const result = await recordInteraction(
                    "homepage",
                    "page_view",
                    {
                      pageType: "homepage",
                      userType,
                      section: "main",
                      timestamp: new Date().toISOString(),
                      path: window.location.pathname,
                    }
                  );

                  if (result.success) {
                    // Store timestamp of successful tracking
                    sessionStorage.setItem(pageViewKey, now.toString());
                    logger.debug(
                      "Homepage view tracked" +
                        (result.rateLimited ? " (rate limited)" : "")
                    );
                  } else if (result.error) {
                    logger.warn("Homepage view tracking failed:", result.error);
                  }

                  // Clear the tracking flag after a delay
                  setTimeout(() => {
                    window._homepageViewTracking = false;
                  }, 10000); // Clear flag after 10 seconds

                } catch (error) {
                  logger.error("Unexpected error tracking homepage view:", error);
                  window._homepageViewTracking = false;
                }
              }, 1000); // Delay tracking by 1 second to prioritize content loading
            }
          } else {
            // Only log this message if we haven't logged it recently
            // Use a window variable to track this
            if (!window._loggedHomepageViewSkipped) {
              logger.debug(
                "Homepage view tracking skipped (already tracked recently)"
              );
              window._loggedHomepageViewSkipped = true;

              // Reset the flag after 30 seconds
              setTimeout(() => {
                window._loggedHomepageViewSkipped = false;
              }, 30000);
            }
          }
        }
      } catch (error) {
        // Catch any errors in sessionStorage access
        logger.error("Error in page view tracking setup:", error);
      }
    };

    // Only track page view when component mounts
    trackPageView();

    // Clean up tracking flags on unmount
    return () => {
      window._homepageViewTracking = false;
      window._loggedHomepageViewSkipped = false;
    };
  }, [isAuthenticated, userType, recordInteraction]);

  // Set page loaded state after initial render
  useEffect(() => {
    setPageLoaded(true);

    // Check for rate limiting warnings
    const checkRateLimiting = () => {
      try {
        // Check if we're experiencing rate limiting
        const trendingRequestCount = parseInt(sessionStorage.getItem('request_count_trending') || '0');
        const feedRequestCount = parseInt(sessionStorage.getItem('request_count_feed') || '0');
        const personalizedRequestCount = parseInt(sessionStorage.getItem('request_count_personalized') || '0');

        // If any endpoint is being called excessively, show a warning
        if ((trendingRequestCount > 5 || feedRequestCount > 5 || personalizedRequestCount > 5) && !rateLimitWarningShown.current) {
          showToast(
            "warning",
            "Refreshing too frequently. Please wait a moment before refreshing again.",
            <AlertCircle className="w-5 h-5 text-amber-500" />,
            5000
          );
          rateLimitWarningShown.current = true;

          // Reset the warning flag after some time
          setTimeout(() => {
            rateLimitWarningShown.current = false;
          }, 30000); // Only show warning once every 30 seconds
        }
      } catch (e) {
        // Ignore storage errors
      }
    };

    // Check for rate limiting when component mounts
    checkRateLimiting();

    // Also set up an interval to check periodically
    const interval = setInterval(checkRateLimiting, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [showToast]);

  // Handle search from hero section
  const handleSearch = useCallback((query) => {
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }, []);

  // Group sections by priority for better organization
  const renderMainContent = () => (
    <div className="lg:col-span-2 space-y-12">
      <SectionWrapper>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <TrendingProductsSection />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.1}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <HybridFeedSection />
        </div>
      </SectionWrapper>

      {isAuthenticated && (
        <SectionWrapper delay={0.2}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <PersonalizedSection componentName="home" />
          </div>
        </SectionWrapper>
      )}

      <SectionDivider />

      <SectionWrapper delay={0.3}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center mb-6">
            <span className="text-green-600 mr-2">
              <Clock className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          <NewProductsSection />
        </div>
      </SectionWrapper>

      {isAuthenticated && (
        <SectionWrapper delay={0.4}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <InterestBasedSection componentName="home" />
          </div>
        </SectionWrapper>
      )}
    </div>
  );

  // Sidebar content
  const renderSidebar = () => (
    <div className="space-y-8 sticky top-20 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 pb-6">
      <SectionWrapper>
        <CategoryList />
      </SectionWrapper>

      <SectionWrapper delay={0.1}>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6 relative">
        {/* Hero Section - Full width */}
        <SectionWrapper>
          <HeroSection onSearch={handleSearch} />
        </SectionWrapper>

        <SectionDivider />

        {/* Floating action button for mobile */}
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <motion.button
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Main content */}
          {pageLoaded ? (
            renderMainContent()
          ) : (
            <div className="lg:col-span-2 space-y-12">
              <SectionSkeleton height="h-96" />
              <SectionSkeleton height="h-96" />
            </div>
          )}

          {/* Right column - Sidebar */}
          {pageLoaded ? (
            renderSidebar()
          ) : (
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

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white z-50 hover:shadow-violet-200/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 hidden lg:flex"
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
