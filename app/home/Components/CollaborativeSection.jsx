"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
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

const CollaborativeSection = () => {
  const { isAuthenticated } = useAuth();
  const { getCollaborativeRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [collaborativeProducts, setCollaborativeProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    let retryTimeout = null;
    let requestCount = 0;

    // Track request count in sessionStorage to prevent excessive retries
    const getRequestCount = () => {
      try {
        return parseInt(
          sessionStorage.getItem("collaborative_request_count") || "0"
        );
      } catch (e) {
        return 0;
      }
    };

    const incrementRequestCount = () => {
      try {
        const count = getRequestCount() + 1;
        sessionStorage.setItem("collaborative_request_count", count.toString());
        requestCount = count;
        return count;
      } catch (e) {
        requestCount++;
        return requestCount;
      }
    };

    const resetRequestCount = () => {
      try {
        sessionStorage.setItem("collaborative_request_count", "0");
        requestCount = 0;
      } catch (e) {
        // Ignore storage errors
      }
    };

    const fetchRecommendations = async (retry = 0) => {
      // Only show loading state if we don't have any data yet
      if (collaborativeProducts.length === 0) {
        if (isMounted) setIsLoading(true);
      }

      // Check if we've made too many requests in this session
      const currentRequestCount = incrementRequestCount();
      if (currentRequestCount > 10) {
        logger.warn(
          `Too many collaborative requests (${currentRequestCount}), skipping to prevent rate limiting`
        );
        if (isMounted) {
          setIsLoading(false);
          if (collaborativeProducts.length === 0) {
            setError("Too many requests. Please try again later.");
          }
        }
        return;
      }

      try {
        // The context now handles caching, in-flight requests, and rate limiting
        // Request more recommendations to ensure we have enough distinct ones
        const results = await getCollaborativeRecommendations(12, 0, retry > 0);

        // Log the results for debugging
        logger.debug(`Collaborative recommendations results: ${results?.length || 0} items`);

        // Only update state if component is still mounted and we got results
        if (isMounted && results && results.length > 0) {
          // Get distinct recommendations that haven't been seen in other sections
          const distinctResults = globalRecommendationTracker.getDistinct(
            results,
            6
          );
          globalRecommendationTracker.markAsSeen(distinctResults);

          setCollaborativeProducts(distinctResults);
          logger.debug(
            `Loaded ${distinctResults.length} collaborative recommendations`
          );
          setError(null); // Clear any previous errors

          // Reset request count on success
          resetRequestCount();
        } else if (isMounted && (!results || results.length === 0)) {
          // Handle empty results
          logger.info("No collaborative recommendations available");
          setCollaborativeProducts([]);
          setError(null); // Don't show error for empty results
        }
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED" &&
          isMounted
        ) {
          logger.error("Failed to fetch collaborative recommendations:", error);

          // If we get a 429 or 500 error, retry with exponential backoff
          if (
            (error.response?.status === 429 ||
              error.response?.status === 500) &&
            retry < 2
          ) {
            const nextRetry = retry + 1;
            // Longer delay for each retry: 2s, then 5s
            const delay = nextRetry === 1 ? 2000 : 5000;

            logger.warn(
              `Rate limited, retrying in ${delay}ms (attempt ${nextRetry}/2)`
            );

            if (isMounted) {
              retryCount = nextRetry;
              retryTimeout = setTimeout(
                () => fetchRecommendations(nextRetry),
                delay
              );
              return; // Don't clear loading state yet
            }
          } else {
            // Only show error if we have no data
            if (collaborativeProducts.length === 0) {
              setError("Failed to load recommendations from similar users");
            }
          }
        }
        // Keep showing existing data if we have it
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRecommendations(0);
    } else if (isMounted) {
      setIsLoading(false);
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isAuthenticated, getCollaborativeRecommendations]);

  if (!isAuthenticated) return null;

  // Don't render if we have no data and no error
  if (!isLoading && collaborativeProducts.length === 0 && !error) return null;

  return (
    <SectionWrapper delay={0.5}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">
              <Users className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900">People Like You Also Liked</h2>
          </div>
        </div>
        <NumberedProductList
          products={collaborativeProducts}
          isLoading={isLoading}
          emptyMessage="We're finding products that similar users have enjoyed. Check back soon!"
          viewAllLink="/recommendations?filter=collaborative"
          recommendationType="collaborative"
        />
      </div>
    </SectionWrapper>
  );
};

export default CollaborativeSection;
