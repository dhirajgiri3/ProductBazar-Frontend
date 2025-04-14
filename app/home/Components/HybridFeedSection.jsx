"use client";

import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import NumberedProductList from "./NumberedProductList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { globalRecommendationTracker } from "../../../Utils/recommendationUtils";
import logger from "../../../Utils/logger";

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

const HybridFeedSection = ({ componentName = 'home' }) => {
  const { isAuthenticated } = useAuth();
  const { getFeedRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [hybridProducts, setHybridProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHybridFeed = async () => {
      // Only show loading state if we don't have any data yet
      if (hybridProducts.length === 0) {
        if (isMounted) setIsLoading(true);
      }

      try {
        // Use the hybrid feed endpoint with discovery blend for more diverse recommendations
        const options = {
          blend: "discovery", // Use discovery blend for more diverse recommendations
          sortBy: "score", // Sort by recommendation score
          // Add source distribution parameters to ensure consistent distribution
          sourceDistribution: {
            trending: 0.4, // 40% trending
            interests: 0.3, // 30% interests
            discovery: 0.3  // 30% discovery
          }
        };

        // The context now handles caching, in-flight requests, and rate limiting
        // Request more recommendations to ensure we have enough distinct ones
        const results = await getFeedRecommendations(12, 0, options, false);

        // Only update state if component is still mounted and we got results
        if (isMounted && results && results.length > 0) {
          // Get distinct recommendations that haven't been seen in other sections
          const distinctResults = globalRecommendationTracker.getDistinct(
            results,
            6
          );

          setHybridProducts(distinctResults);

          // Log the source distribution for debugging
          const sourceDistribution = {};
          distinctResults.forEach(item => {
            const source = item.source || 'unknown';
            sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
          });

          // Only log once per component mount
          if (!window._loggedHybridFeedLoad) {
            logger.debug(`Loaded ${distinctResults.length} hybrid feed recommendations`);
            window._loggedHybridFeedLoad = true;
          }
          // Only log source distribution once per component mount
          // Use a more specific key to avoid conflicts with other feed distribution logs
          const distributionKey = `hybrid_feed_distribution_${componentName || 'home'}`;
          if (!window[distributionKey]) {
            logger.debug(`Feed recommendations source distribution: ${JSON.stringify(sourceDistribution)}`);
            window[distributionKey] = true;
          }
        } else if (isMounted) {
          logger.warn("No hybrid feed recommendations returned");
        }
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED" &&
          isMounted
        ) {
          logger.error("Failed to fetch hybrid feed recommendations:", error);
          setError("Failed to load hybrid feed recommendations");
        }
        // Keep showing existing data if we have it
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHybridFeed();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [getFeedRecommendations]);

  // Don't render if we have no data and no error
  if (!isLoading && hybridProducts.length === 0 && !error) return null;

  return (
    <SectionWrapper delay={0.6}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-violet-600 mr-2">
              <Zap className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Discover More</h2>
          </div>
        </div>
        <NumberedProductList
          products={hybridProducts}
          isLoading={isLoading}
          emptyMessage="We're curating a diverse selection of products for you. Check back soon!"
          viewAllLink="/discover"
          recommendationType="discovery"
        />
      </div>
    </SectionWrapper>
  );
};

export default HybridFeedSection;
