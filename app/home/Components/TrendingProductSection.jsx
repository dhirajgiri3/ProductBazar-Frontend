"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";
import { motion } from "framer-motion";

const TrendingProductsSection = () => {
  const { getTrendingRecommendations } = useRecommendation();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      // Only show loading state if we don't have any data yet
      if (trendingProducts.length === 0) {
        setIsLoading(true);
      }

      // Check if we should rate limit this request with a longer cooldown (10 seconds)
      const requestKey = getRequestKey('trending', { limit: 6, offset: 0, days: timeRange });
      if (shouldRateLimit(requestKey, 10000)) { // 10 second cooldown
        console.log('Rate limiting trending products request');
        // If we have cached data, don't show loading state
        if (trendingProducts.length > 0) {
          setIsLoading(false);
          return;
        }
        // Otherwise wait a bit before trying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mark this request as made
      markRequest(requestKey);

      try {
        // Using the updated getTrendingRecommendations from the context
        // Add forceRefresh=false to use cached data when available
        const results = await getTrendingRecommendations(6, 0, timeRange, false);

        // Only update state if we got results
        if (results && results.length > 0) {
          setTrendingProducts(results);
        } else if (trendingProducts.length === 0) {
          // Only log an error if we don't have any existing data
          console.warn("No trending products returned");
        }
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
        // Don't clear existing data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();

    // Remove trendingProducts.length from dependencies to prevent unnecessary refetches
    // Only refetch when the time range changes or the function reference changes
  }, [getTrendingRecommendations, timeRange]);

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
  };

  return (
    <section id="trending" className="mt-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-red-100 w-8 h-8 rounded-md mr-3 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Today", value: 1 },
            { label: "Week", value: 7 },
            { label: "Month", value: 30 },
          ].map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                timeRange === option.value
                  ? "bg-red-100 text-red-600 font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <ProductCardList
          products={trendingProducts}
          isLoading={isLoading}
          emptyMessage="No trending products available right now. Check back soon!"
          viewAllLink="/trending"
          recommendationType="trending"
        />
      </div>
    </section>
  );
};

export default TrendingProductsSection;