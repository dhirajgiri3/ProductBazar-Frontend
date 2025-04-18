"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import NumberedProductList from "./NumberedProductList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { motion } from "framer-motion";
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

const PersonalizedSection = () => {
  const { isAuthenticated } = useAuth();
  const { getPersonalizedRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [personalized, setPersonalized] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // Only show loading state if we don't have any data yet
      if (personalized.length === 0) {
        if (isMounted) setIsLoading(true);
      }

      try {
        // The context now handles caching, in-flight requests, and rate limiting
        // Request more recommendations to ensure we have enough distinct ones
        const results = await getPersonalizedRecommendations(12, 0, 'personalized', false);

        // Only update state if component is still mounted and we got results
        if (isMounted && results && results.length > 0) {
          // Get distinct recommendations that haven't been seen in other sections
          const distinctResults = globalRecommendationTracker.getDistinct(results, 6);
          globalRecommendationTracker.markAsSeen(distinctResults);

          setPersonalized(distinctResults);

          // Only log once per component mount
          if (!window._loggedPersonalizedLoad) {
            logger.debug(`Loaded ${distinctResults.length} personalized recommendations`);
            window._loggedPersonalizedLoad = true;
          }
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED' && isMounted) {
          console.error("Failed to fetch personalized recommendations:", error);
        }
        // Keep showing existing data if we have it
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRecommendations();
    } else if (isMounted) {
      setIsLoading(false);
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, getPersonalizedRecommendations]);

  if (!isAuthenticated) return null;

  // Don't render if we have no data
  if (!isLoading && personalized.length === 0) return null;

  return (
    <SectionWrapper delay={0.2}>
      <div className="bg-white rounded-xl overflow-hidden h-full my-6">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-pink-600 mr-3">
              <Heart className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-gray-900">For You</h2>
          </div>
        </div>
        <div className="px-6">
          <NumberedProductList
            products={personalized}
            isLoading={isLoading}
            emptyMessage="We're working on your personalized recommendations! Explore more products to get tailored suggestions."
            viewAllLink="/recommendations"
            recommendationType="personalized"
          />
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PersonalizedSection;
