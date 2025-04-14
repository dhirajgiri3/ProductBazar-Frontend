"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, Zap } from "lucide-react";
import NumberedProductList from "./NumberedProductList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { motion } from "framer-motion";
import { globalRecommendationTracker } from "../../../Utils/recommendationUtils";
import logger from "../../../Utils/logger";

const TrendingProductsSection = () => {
  const { getTrendingRecommendations } = useRecommendation();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    let isMounted = true;
    const fetchTrendingProducts = async () => {
      // Only show loading state if we don't have any data yet
      if (trendingProducts.length === 0) {
        setIsLoading(true);
      }

      try {
        // Reset the recommendation tracker to ensure fresh tracking for the home page
        // Trending section is typically the first to load, so we reset here
        globalRecommendationTracker.reset();

        // Using the updated getTrendingRecommendations from the context
        // The context now handles caching, in-flight requests, and rate limiting
        const results = await getTrendingRecommendations(12, 0, timeRange, false);

        // Only update state if component is still mounted and we got results
        if (isMounted) {
          if (results && Array.isArray(results) && results.length > 0) {
            // Mark trending products as seen and store them
            const distinctResults = results.slice(0, 6); // Take first 6 for display
            globalRecommendationTracker.markAsSeen(distinctResults);
            setTrendingProducts(distinctResults);

            // Only log once per component mount
            if (!window._loggedTrendingLoad) {
              logger.debug(`Loaded ${distinctResults.length} trending products`);
              window._loggedTrendingLoad = true;
            }
          } else if (trendingProducts.length === 0) {
            // Only log an error if we don't have any existing data
            logger.warn("No trending products returned");
            // Try to fetch trending products directly from the products API as fallback
            try {
              const response = await fetch('/api/v1/products/trending?limit=6&_t=' + Date.now());
              const data = await response.json();
              if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                setTrendingProducts(data.data);
                logger.info(`Loaded ${data.data.length} trending products from fallback API`);
              }
            } catch (fallbackError) {
              logger.error("Fallback trending products fetch failed:", fallbackError);
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          logger.error("Failed to fetch trending products:", error);
        }
        // Don't clear existing data on error
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrendingProducts();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [timeRange, getTrendingRecommendations, trendingProducts.length]);

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-violet-600 mr-2">
            <TrendingUp className="w-6 h-6" />
          </span>
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Today", value: 1, icon: <Clock className="w-3.5 h-3.5 mr-1" /> },
            { label: "Week", value: 7, icon: <Zap className="w-3.5 h-3.5 mr-1" /> },
            { label: "Month", value: 30, icon: <TrendingUp className="w-3.5 h-3.5 mr-1" /> },
          ].map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center ${
                timeRange === option.value
                  ? "bg-violet-100 text-violet-700 font-medium"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {option.icon}
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>
      <NumberedProductList
        products={trendingProducts}
        isLoading={isLoading}
        emptyMessage="No trending products available right now. Check back soon!"
        viewAllLink="/trending"
        recommendationType="trending"
      />
    </div>
  );

};

export default TrendingProductsSection;