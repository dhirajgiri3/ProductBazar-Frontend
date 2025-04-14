"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";

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

const CommunityPicksSection = () => {
  const { getCollaborativeRecommendations } = useRecommendation();
  const [communityPicks, setCommunityPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCommunityPicks = async () => {
      // Only show loading state if we don't have any data yet
      if (communityPicks.length === 0) {
        if (isMounted) setIsLoading(true);
      }

      try {
        // The context now handles caching, in-flight requests, and rate limiting
        const results = await getCollaborativeRecommendations(6, 0, false);

        // Only update state if component is still mounted and we got results
        if (isMounted && results && results.length > 0) {
          setCommunityPicks(results);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED' && isMounted) {
          console.error("Failed to fetch community picks:", error);
        }
        // Keep showing existing data if we have it
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCommunityPicks();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [getCollaborativeRecommendations]);

  // Don't render if we have no data
  if (!isLoading && communityPicks.length === 0) return null;

  return (
    <SectionWrapper delay={0.6}>
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl mr-3 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Community Picks</h2>
          </div>
        </div>
        <ProductCardList
          products={communityPicks}
          isLoading={isLoading}
          emptyMessage="Community picks are being gathered. Check back later!"
          viewAllLink="/community-picks"
          recommendationType="collaborative"
        />
      </div>
    </SectionWrapper>
  );
};

export default CommunityPicksSection;
