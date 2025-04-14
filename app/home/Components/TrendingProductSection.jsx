"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TrendingUp, Clock, Zap, Calendar, Loader2 } from "lucide-react";
import NumberedProductList from "./NumberedProductList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { motion, AnimatePresence } from "framer-motion";
import { globalRecommendationTracker } from "../../../Utils/recommendationUtils";
import logger from "../../../Utils/logger";
import { makePriorityRequest } from "../../../Utils/api";
import { useToast } from "../../../Contexts/Toast/ToastContext";

const TrendingProductsSection = () => {
  const { getTrendingRecommendations } = useRecommendation();
  const { showToast } = useToast();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days
  const [activeFilter, setActiveFilter] = useState('week'); // 'today', 'week', 'month'
  const [isChangingFilter, setIsChangingFilter] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    // When timeRange or activeFilter changes, we should always fetch new data
    // This ensures the time filter buttons work correctly
    if (isMounted && (trendingProducts.length === 0 || isChangingFilter)) {
      setIsLoading(true);
    }

    const fetchTrendingProducts = async () => {
      try {
        // Check if we've fetched recently to avoid excessive API calls
        const lastFetchKey = `trending_products_last_fetch_${activeFilter}`;
        const lastFetch = parseInt(sessionStorage.getItem(lastFetchKey) || '0');
        const now = Date.now();
        const refreshInterval = 2 * 60 * 1000; // 2 minutes

        // Only use cache if filter hasn't changed since last render and we're not explicitly changing filters
        // This is tracked by checking if we have a specific lastFetchKey for this filter
        if (!isChangingFilter && sessionStorage.getItem(lastFetchKey) && now - lastFetch < refreshInterval) {
          if (isMounted) {
            setIsLoading(false);
            if (isChangingFilter) setIsChangingFilter(false);
          }
          return;
        }

        // Reset the recommendation tracker to ensure fresh tracking for the home page
        // Trending section is typically the first to load, so we reset here
        globalRecommendationTracker.reset();

        // Using the updated getTrendingRecommendations from the context
        // The context now handles caching, in-flight requests, and rate limiting
        const options = {
          signal: abortController.signal // Add abort signal for cleanup
        };

        const results = await getTrendingRecommendations(12, 0, timeRange, false, options);

        // Only update state if component is still mounted and we got results
        if (isMounted) {
          if (results && Array.isArray(results) && results.length > 0) {
            // Mark trending products as seen and store them
            const distinctResults = results.slice(0, 6); // Take first 6 for display
            globalRecommendationTracker.markAsSeen(distinctResults);
            setTrendingProducts(distinctResults);

            // Store the fetch time
            try {
              sessionStorage.setItem(lastFetchKey, now.toString());
            } catch (e) {
              // Ignore storage errors
            }

            // Only log in development and with rate limiting
            if (process.env.NODE_ENV === 'development') {
              const logKey = `trending_products_log_${activeFilter}`;
              const lastLog = parseInt(sessionStorage.getItem(logKey) || '0');

              // Only log once every 30 seconds
              if (now - lastLog > 30000) {
                logger.debug(`Loaded ${distinctResults.length} trending products for ${activeFilter}`);

                try {
                  sessionStorage.setItem(logKey, now.toString());
                } catch (e) {
                  // Ignore storage errors
                }
              }
            }

            // Reset the changing filter state if needed
            if (isChangingFilter && isMounted) {
              setIsChangingFilter(false);
            }
          } else if (trendingProducts.length === 0 || isChangingFilter) {
            // Log an error if we don't have any existing data or we're changing filters
            logger.warn(`No trending products returned for ${activeFilter}`);

            // Try to fetch trending products directly from the products API as fallback
            try {
              // Use makePriorityRequest instead of fetch to ensure correct base URL
              const response = await makePriorityRequest('GET', '/products/trending', {
                params: {
                  limit: 6,
                  timeRange: activeFilter === 'today' ? '1d' : activeFilter === 'week' ? '7d' : '30d',
                  _t: Date.now() // Cache busting
                },
                signal: abortController.signal
              });

              if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setTrendingProducts(response.data.data);

                // Store the fetch time for the fallback as well
                try {
                  sessionStorage.setItem(lastFetchKey, now.toString());
                } catch (e) {
                  // Ignore storage errors
                }

                // Only log in development
                if (process.env.NODE_ENV === 'development') {
                  logger.info(`Loaded ${response.data.data.length} trending products from fallback API for ${activeFilter}`);
                }

                // Reset the changing filter state if needed
                if (isChangingFilter && isMounted) {
                  setIsChangingFilter(false);
                }
              }
            } catch (fallbackError) {
              if (!abortController.signal.aborted) {
                logger.error("Fallback trending products fetch failed:", fallbackError);
              }

              // Reset the changing filter state even on error
              if (isChangingFilter && isMounted) {
                setIsChangingFilter(false);
              }
            }
          }
          if (isMounted) setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' &&
            error.code !== 'ERR_CANCELED' &&
            !abortController.signal.aborted &&
            isMounted) {
          logger.error("Failed to fetch trending products:", error);
        }
        // Don't clear existing data on error
        if (isMounted) {
          setIsLoading(false);
          // Reset the changing filter state even on error
          if (isChangingFilter) {
            setIsChangingFilter(false);
          }
        }
      }
    };

    fetchTrendingProducts();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [timeRange, activeFilter, isChangingFilter, getTrendingRecommendations, trendingProducts.length]);

  const handleTimeRangeChange = useCallback((days, filterName) => {
    // Show loading indicator for filter change
    setIsChangingFilter(true);

    // Update time range and active filter
    setTimeRange(days);
    setActiveFilter(filterName);

    // Show toast notification
    showToast(
      "info",
      `Showing trending products from the ${filterName === 'today' ? 'past 24 hours' : filterName === 'week' ? 'past week' : 'past month'}`,
      <Calendar className="w-4 h-4" />,
      3000
    );

    // Reset changing filter state after a short delay
    setTimeout(() => {
      setIsChangingFilter(false);
    }, 300);
  }, [showToast]);

  return (
    <div className="relative">
      {/* Minimalistic Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-6">
        <div className="flex items-center">
          <span className="text-violet-600 mr-3">
            <TrendingUp className="w-6 h-6" />
          </span>
          <h2 className="text-2xl font-medium text-gray-900">Trending Now</h2>
        </div>

        {/* Minimalistic Time Range Filter Buttons */}
        <div className="flex gap-2 self-start sm:self-auto">
          <div className="flex gap-1">
            <AnimatePresence mode="wait">
              {[
                { label: "Today", value: 1, filterName: 'today', icon: <Clock className="w-3.5 h-3.5 mr-1" /> },
                { label: "Week", value: 7, filterName: 'week', icon: <Zap className="w-3.5 h-3.5 mr-1" /> },
                { label: "Month", value: 30, filterName: 'month', icon: <TrendingUp className="w-3.5 h-3.5 mr-1" /> },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value, option.filterName)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center ${
                    activeFilter === option.filterName
                      ? "bg-violet-50 text-violet-700 font-medium border border-violet-100"
                      : "text-gray-500 hover:text-violet-600 hover:bg-violet-50/30 transition-colors"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading && trendingProducts.length === 0}
                  aria-label={`Show trending products for ${option.label}`}
                  aria-pressed={activeFilter === option.filterName}
                >
                  {isChangingFilter && activeFilter === option.filterName ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    option.icon
                  )}
                  {option.label}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Minimalistic Loading Indicator */}
      {isLoading && trendingProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10"
        >
          <div className="bg-white/90 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm text-gray-600">Loading trending products</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Minimalistic Filter Change Loading Indicator */}
      {isChangingFilter && trendingProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10"
        >
          <div className="bg-white/90 w-full h-full flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
              <span className="text-sm text-gray-600">Updating</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product List with proper padding */}
      <div className="px-6">
        <NumberedProductList
          products={trendingProducts}
          isLoading={isLoading && trendingProducts.length === 0}
          emptyMessage="No trending products available right now. Check back soon!"
          viewAllLink="/trending"
          recommendationType="trending"
        />
      </div>

      {/* Minimalistic Time Range Indicator */}
      <div className="flex justify-end mt-4 px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter} // This ensures animation triggers when filter changes
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-gray-500 inline-flex items-center justify-end mt-4"
          >
            {activeFilter === 'today' ? (
              <Clock className="w-3 h-3 mr-1.5 text-violet-500" />
            ) : activeFilter === 'week' ? (
              <Zap className="w-3 h-3 mr-1.5 text-violet-500" />
            ) : (
              <Calendar className="w-3 h-3 mr-1.5 text-violet-500" />
            )}
            <span>
              Showing trends from the <span className="text-violet-600">{activeFilter === 'today' ? 'past 24 hours' : activeFilter === 'week' ? 'past week' : 'past month'}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

};

export default TrendingProductsSection;