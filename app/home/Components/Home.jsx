"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "./HeroSection";
import CategoryList from "./CategoryList";
import NewsletterSignup from "../../../Components/common/Auth/NewsletterSignup";
import logger from "../../../Utils/logger";
import { ArrowUp, Clock, AlertCircle } from "lucide-react";

// Lazy load components for better performance
const TrendingProductsSection = lazy(() => import("./TrendingProductSection"));
const PersonalizedSection = lazy(() => import("./PersonalizedSection"));
const NewProductsSection = lazy(() => import("./NewProductsSection"));
const HybridFeedSection = lazy(() => import("./HybridFeedSection"));
const InterestBasedSection = lazy(() => import("./InterestBasedSection"));
const ForumThreadsSection = lazy(() => import("./ForumThreadsSection"));
const CommunityPicksSection = lazy(() => import("./CommunityPicksSection"));

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

// Border divider used in the layout
const BorderDivider = () => (
  <div className="my-8 border-t border-gray-100"></div>
);

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const {
    recordInteraction,
    getTrendingRecommendations,
    getPersonalizedRecommendations,
    getNewRecommendations,
    getCollaborativeRecommendations,
    getFeedRecommendations,
    getInterestsRecommendations
  } = useRecommendation();
  const { showToast } = useToast();
  const [userType, setUserType] = useState("general");
  const [pageLoaded, setPageLoaded] = useState(false);
  const rateLimitWarningShown = useRef(false);
  const hasInitiallyFetched = useRef(false);

  // Centralized state for all recommendations
  const [recommendations, setRecommendations] = useState({
    trending: { data: [], loading: true, error: null },
    personalized: { data: [], loading: true, error: null },
    new: { data: [], loading: true, error: null },
    collaborative: { data: [], loading: true, error: null },
    feed: { data: [], loading: true, error: null },
    interests: { data: [], loading: true, error: null },
  });

  // Determine user type for personalized content
  useEffect(() => {
    if (user?.role) {
      setUserType(user.role === "jobseeker" ? "jobSeeker" : user.role);
    } else {
      setUserType("general");
    }
  }, [user]);

  // Track page view for recommendations with debouncing
  useEffect(() => {
    const trackPageView = async () => {
      if (!isAuthenticated || !recordInteraction) return;

      const pageViewKey = "homepage_view_tracked";
      const lastTracked = sessionStorage.getItem(pageViewKey);
      const now = Date.now();

      if (!lastTracked || now - parseInt(lastTracked) > 5 * 60 * 1000) {
        if (!window._homepageViewTracking) {
          window._homepageViewTracking = true;

          setTimeout(async () => {
            try {
              const result = await recordInteraction("homepage", "page_view", {
                pageType: "homepage",
                userType,
                section: "main",
                timestamp: new Date().toISOString(),
                path: window.location.pathname,
              });

              if (result.success) {
                sessionStorage.setItem(pageViewKey, now.toString());
                logger.debug(
                  `Homepage view tracked${
                    result.rateLimited ? " (rate limited)" : ""
                  }`
                );
              } else if (result.error) {
                logger.warn("Homepage view tracking failed:", result.error);
              }
            } catch (error) {
              logger.error("Unexpected error tracking homepage view:", error);
            } finally {
              window._homepageViewTracking = false;
            }
          }, 1000);
        }
      } else if (!window._loggedHomepageViewSkipped) {
        logger.debug(
          "Homepage view tracking skipped (already tracked recently)"
        );
        window._loggedHomepageViewSkipped = true;
        setTimeout(() => {
          window._loggedHomepageViewSkipped = false;
        }, 30000);
      }
    };

    trackPageView();

    return () => {
      window._homepageViewTracking = false;
      window._loggedHomepageViewSkipped = false;
    };
  }, [isAuthenticated, userType, recordInteraction]);

  // Centralized data fetching function
  const fetchAllRecommendations = useCallback(async () => {
    // Set page loaded state
    setPageLoaded(true);

    // Check if we've fetched recently to avoid excessive API calls
    const lastFetchKey = 'home_recommendations_last_fetch';
    const lastFetch = parseInt(sessionStorage.getItem(lastFetchKey) || '0');
    const now = Date.now();
    const refreshInterval = 5 * 60 * 1000; // 5 minutes

    // If we've fetched recently, don't fetch again
    if (now - lastFetch < refreshInterval) {
      logger.debug('Using cached home recommendations (fetched ' + Math.round((now - lastFetch) / 1000) + ' seconds ago)');
      return;
    }

    // Store the fetch time
    try {
      sessionStorage.setItem(lastFetchKey, now.toString());
    } catch (e) {
      // Ignore storage errors
    }

    // Helper function to update a specific recommendation type
    const updateRecommendation = (type, data, error = null) => {
      setRecommendations(prev => ({
        ...prev,
        [type]: {
          data: data || [],
          loading: false,
          error
        }
      }));
    };

    // Start with feed recommendations as they're most comprehensive
    try {
      const feedResults = await getFeedRecommendations(12, 0, false);
      updateRecommendation('feed', feedResults);

      // Extract products by source from feed results to avoid duplicate requests
      const trendingFromFeed = feedResults.filter(item => item.reason === 'trending');
      const personalizedFromFeed = feedResults.filter(item => item.reason === 'personalized');
      const newFromFeed = feedResults.filter(item => item.reason === 'new');

      // Only fetch specific recommendation types if we don't have enough from the feed
      if (trendingFromFeed.length < 6) {
        const trendingResults = await getTrendingRecommendations(6, 0, 7, false);
        updateRecommendation('trending', trendingResults);
      } else {
        updateRecommendation('trending', trendingFromFeed);
      }

      if (isAuthenticated) {
        // Only fetch personalized if authenticated and not enough from feed
        if (personalizedFromFeed.length < 6) {
          const personalizedResults = await getPersonalizedRecommendations(6, 0, false);
          updateRecommendation('personalized', personalizedResults);
        } else {
          updateRecommendation('personalized', personalizedFromFeed);
        }

        // Fetch collaborative separately as they're not in the feed
        try {
          const collaborativeResults = await getCollaborativeRecommendations(10, 0, false);
          updateRecommendation('collaborative', collaborativeResults);
        } catch (error) {
          logger.error('Failed to fetch collaborative recommendations:', error);
          updateRecommendation('collaborative', [], error);
        }

        // Fetch interests separately as they might not be in the feed
        try {
          const interestsResults = await getInterestsRecommendations(12, 0, false);
          updateRecommendation('interests', interestsResults);
        } catch (error) {
          logger.error('Failed to fetch interests recommendations:', error);
          updateRecommendation('interests', [], error);
        }
      }

      // Only fetch new products if not enough from feed
      if (newFromFeed.length < 6) {
        const newResults = await getNewRecommendations(6, 0, 14, false);
        updateRecommendation('new', newResults);
      } else {
        updateRecommendation('new', newFromFeed);
      }
    } catch (error) {
      logger.error('Failed to fetch feed recommendations:', error);
      updateRecommendation('feed', [], error);

      // If feed fails, fetch each type individually
      try {
        const trendingResults = await getTrendingRecommendations(6, 0, 7, false);
        updateRecommendation('trending', trendingResults);
      } catch (error) {
        logger.error('Failed to fetch trending recommendations:', error);
        updateRecommendation('trending', [], error);
      }

      if (isAuthenticated) {
        try {
          const personalizedResults = await getPersonalizedRecommendations(6, 0, false);
          updateRecommendation('personalized', personalizedResults);
        } catch (error) {
          logger.error('Failed to fetch personalized recommendations:', error);
          updateRecommendation('personalized', [], error);
        }

        try {
          const collaborativeResults = await getCollaborativeRecommendations(10, 0, false);
          updateRecommendation('collaborative', collaborativeResults);
        } catch (error) {
          logger.error('Failed to fetch collaborative recommendations:', error);
          updateRecommendation('collaborative', [], error);
        }

        try {
          const interestsResults = await getInterestsRecommendations(12, 0, false);
          updateRecommendation('interests', interestsResults);
        } catch (error) {
          logger.error('Failed to fetch interests recommendations:', error);
          updateRecommendation('interests', [], error);
        }
      }

      try {
        const newResults = await getNewRecommendations(6, 0, 14, false);
        updateRecommendation('new', newResults);
      } catch (error) {
        logger.error('Failed to fetch new recommendations:', error);
        updateRecommendation('new', [], error);
      }
    }
  }, [
    isAuthenticated,
    getFeedRecommendations,
    getTrendingRecommendations,
    getPersonalizedRecommendations,
    getNewRecommendations,
    getCollaborativeRecommendations,
    getInterestsRecommendations
    // Removed pageLoaded to prevent unnecessary re-renders
  ]);

  // Set page loaded state, fetch data, and check for rate limiting
  useEffect(() => {
    // Fetch all recommendations when component mounts - only once
    // Using a ref to ensure we only fetch once per component lifecycle
    if (!pageLoaded && !hasInitiallyFetched.current) {
      hasInitiallyFetched.current = true;
      fetchAllRecommendations();
    }

    const checkRateLimiting = () => {
      try {
        const counts = ["trending", "feed", "personalized"].map((type) =>
          parseInt(sessionStorage.getItem(`request_count_${type}`) || "0")
        );

        if (
          counts.some((count) => count > 5) &&
          !rateLimitWarningShown.current
        ) {
          showToast(
            "warning",
            "Refreshing too frequently. Please wait a moment before refreshing again.",
            <AlertCircle className="w-5 h-5 text-amber-500" />,
            5000
          );
          rateLimitWarningShown.current = true;
          setTimeout(() => {
            rateLimitWarningShown.current = false;
          }, 30000);
        }
      } catch (e) {
        logger.error("Error checking rate limiting:", e);
      }
    };

    checkRateLimiting();
    const interval = setInterval(checkRateLimiting, 10000);

    return () => clearInterval(interval);
  }, [showToast, fetchAllRecommendations]);

  // Handle search from hero section
  const handleSearch = useCallback((query) => {
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }, []);

  // Group sections by priority for better organization and user experience
  const renderMainContent = () => (
    <div className="lg:col-span-2 space-y-8">
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        {/* Trending Section - Always first for maximum visibility */}
        <SectionWrapper>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <TrendingProductsSection
              products={recommendations.trending.data}
              isLoading={recommendations.trending.loading}
              error={recommendations.trending.error}
            />
          </div>
        </SectionWrapper>

        {/* Personalized Section - High priority for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.1}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <PersonalizedSection
                componentName="home"
                products={recommendations.personalized.data}
                isLoading={recommendations.personalized.loading}
                error={recommendations.personalized.error}
              />
            </div>
          </SectionWrapper>
        )}

        {/* New Arrivals Section - Important for discovery */}
        <SectionWrapper delay={isAuthenticated ? 0.2 : 0.1}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 p-6">
            <div className="flex-col items-center">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">
                  <Clock className="w-6 h-6" />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  New Arrivals
                </h2>
              </div>
              <p className="text-gray-600 mt-1 text-sm">
                Recently launched products
              </p>
            </div>
            <NewProductsSection
              products={recommendations.new.data}
              isLoading={recommendations.new.loading}
              error={recommendations.new.error}
            />
          </div>
        </SectionWrapper>

        {/* Community Picks - Social proof for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.3}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <CommunityPicksSection
                componentName="home"
                products={recommendations.collaborative.data}
                isLoading={recommendations.collaborative.loading}
                error={recommendations.collaborative.error}
              />
            </div>
          </SectionWrapper>
        )}

        {/* Hybrid Feed Section - Diverse content for all users */}
        <SectionWrapper delay={isAuthenticated ? 0.3 : 0.2}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <HybridFeedSection
              componentName="home"
              products={recommendations.feed.data}
              isLoading={recommendations.feed.loading}
              error={recommendations.feed.error}
            />
          </div>
        </SectionWrapper>

        {/* Interest Based Section - Personalized content for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.4}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <InterestBasedSection
                componentName="home"
                products={recommendations.interests.data}
                isLoading={recommendations.interests.loading}
                error={recommendations.interests.error}
              />
            </div>
          </SectionWrapper>
        )}

        {/* Sign Up Prompt for non-authenticated users */}
        {!isAuthenticated && (
          <SectionWrapper delay={0.3}>
            <div className="bg-white rounded-xl overflow-hidden border border-violet-100 p-8 text-center">
              <h3 className="text-xl font-bold text-violet-700 mb-3">
                Join Our Community
              </h3>
              <p className="text-violet-600 mb-4">
                Sign up to discover personalized recommendations and connect
                with other users.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                onClick={() => (window.location.href = "/auth/signup")}
              >
                Sign Up Now
              </motion.button>
            </div>
          </SectionWrapper>
        )}
      </Suspense>
    </div>
  );

  // Minimalistic sidebar content with clean design
  const renderSidebar = () => (
    <div className="space-y-6 sticky top-20 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pb-6">
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        {/* Categories - Important for navigation */}
        <SectionWrapper>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <CategoryList />
          </div>
        </SectionWrapper>

        {/* Newsletter Signup - Moved up for better conversion */}
        <SectionWrapper delay={0.1}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <NewsletterSignup />
          </div>
        </SectionWrapper>

        {/* Forum Threads - Community engagement */}
        <SectionWrapper delay={0.2}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <ForumThreadsSection />
          </div>
        </SectionWrapper>

        {/* Quick links section */}
        <SectionWrapper delay={0.3}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Quick Links
            </h3>
            <div className="space-y-2.5">
              <a
                href="/products"
                className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
              >
                <span className="mr-2 text-violet-500">→</span> All Products
              </a>
              <a
                href="/categories"
                className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
              >
                <span className="mr-2 text-violet-500">→</span> Browse
                Categories
              </a>
              <a
                href="/jobs"
                className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
              >
                <span className="mr-2 text-violet-500">→</span> Find Jobs
              </a>
              <a
                href="/forum"
                className="flex items-center text-gray-600 hover:text-violet-600 transition-colors"
              >
                <span className="mr-2 text-violet-500">→</span> Community Forum
              </a>
            </div>
          </div>
        </SectionWrapper>
      </Suspense>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6 relative">
        {/* Hero Section - Full width with minimalistic spacing */}
        <SectionWrapper>
          <HeroSection onSearch={handleSearch} />
        </SectionWrapper>

        <BorderDivider />

        {/* Floating action button for mobile with minimalistic design */}
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <motion.button
            className="bg-violet-600 text-white p-3 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Main Content Grid - Responsive layout with minimalistic spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column - Main content */}
          {pageLoaded ? (
            renderMainContent()
          ) : (
            <div className="lg:col-span-2 space-y-6">
              <SectionSkeleton height="h-96" />
              <SectionSkeleton height="h-96" />
            </div>
          )}

          {/* Right column - Sidebar */}
          {pageLoaded ? (
            renderSidebar()
          ) : (
            <div className="space-y-6">
              <SectionSkeleton height="h-96" />
              <SectionSkeleton height="h-64" />
            </div>
          )}
        </div>
      </div>

      {/* Back to top button with minimalistic design */}
      <BackToTopButton />
    </motion.div>
  );
}

// Minimalistic back to top button component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-violet-600 text-white z-50 border border-violet-500 hidden lg:flex"
          aria-label="Back to top"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
