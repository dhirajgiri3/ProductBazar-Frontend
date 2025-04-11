"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";

const CommunityPicksSection = () => {
  const { getCollaborativeRecommendations } = useRecommendation();
  const [communityPicks, setCommunityPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityPicks = async () => {
      // Check if we should rate limit this request
      const requestKey = getRequestKey('community-picks', { limit: 6 });
      if (shouldRateLimit(requestKey, 5000)) { // 5 second cooldown
        console.log('Rate limiting community picks request');
        // If we have cached data, don't show loading state
        if (communityPicks.length > 0) {
          setIsLoading(false);
          return;
        }
        // Otherwise wait a bit before trying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mark this request as made
      markRequest(requestKey);

      setIsLoading(true);
      try {
        // Use the updated getCollaborativeRecommendations from context
        const results = await getCollaborativeRecommendations(6);

        // Log the structure to help with debugging
        console.log('Community picks data structure:',
          results.length > 0 ?
          { firstItem: results[0], keys: Object.keys(results[0]) } :
          'No results');

        setCommunityPicks(results);
      } catch (error) {
        console.error("Failed to fetch community picks:", error);
        // Keep showing existing data if we have it
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityPicks();
  }, [getCollaborativeRecommendations, communityPicks.length]);

  return (
    <section className="mt-10">
      <div className="flex items-center mb-6">
        <div className="bg-green-100 p-2 rounded-md mr-3">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Community Picks</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ProductCardList
          products={communityPicks}
          isLoading={isLoading}
          emptyMessage="Community picks are being gathered. Check back later!"
          viewAllLink="/community-picks"
          recommendationType="collaborative"
        />
      </div>
    </section>
  );
};

export default CommunityPicksSection;
