"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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

  // Set page loaded state and check for rate limiting
  useEffect(() => {
    setPageLoaded(true);

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
  }, [showToast]);

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
            <TrendingProductsSection />
          </div>
        </SectionWrapper>

        {/* Personalized Section - High priority for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.1}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <PersonalizedSection componentName="home" />
            </div>
          </SectionWrapper>
        )}

        {/* New Arrivals Section - Important for discovery */}
        <SectionWrapper delay={isAuthenticated ? 0.2 : 0.1}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 px-6">
            <div className="flex-col items-center pt-6 ">
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
            <NewProductsSection />
          </div>
        </SectionWrapper>

        {/* Community Picks - Social proof for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.3}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <CommunityPicksSection componentName="home" />
            </div>
          </SectionWrapper>
        )}

        {/* Hybrid Feed Section - Diverse content for all users */}
        <SectionWrapper delay={isAuthenticated ? 0.3 : 0.2}>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <HybridFeedSection componentName="home" />
          </div>
        </SectionWrapper>

        {/* Interest Based Section - Personalized content for authenticated users */}
        {isAuthenticated && (
          <SectionWrapper delay={0.4}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <InterestBasedSection componentName="home" />
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

        <div className="my-8 border-t border-gray-100"></div>

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

        {/* Minimalistic footer */}
        <div className="mt-16 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-auto mb-6 md:mb-0">
              <h4 className="font-medium text-gray-800 mb-3">ProductBazar</h4>
              <p className="text-sm text-gray-500 max-w-xs">
                Discover innovative products and connect with creators from
                around the world.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-3 text-sm">
                  Products
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/products/trending"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Trending
                    </a>
                  </li>
                  <li>
                    <a
                      href="/products/new"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a
                      href="/categories"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Categories
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-3 text-sm">
                  Community
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/forum"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Forum
                    </a>
                  </li>
                  <li>
                    <a
                      href="/events"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Events
                    </a>
                  </li>
                  <li>
                    <a
                      href="/blog"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-3 text-sm">
                  Company
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/about"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="/help"
                      className="text-gray-500 hover:text-violet-600 transition-colors"
                    >
                      Help
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-50 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} ProductBazar. All rights reserved.
            </p>
          </div>
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
