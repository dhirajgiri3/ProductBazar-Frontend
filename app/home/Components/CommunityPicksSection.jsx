"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";

const CommunityPicksSection = () => {
  const { getCollaborativeRecommendations } = useRecommendation();
  const [communityPicks, setCommunityPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityPicks = async () => {
      setIsLoading(true);
      try {
        // Use the updated getCollaborativeRecommendations from context
        const results = await getCollaborativeRecommendations(6);
        setCommunityPicks(results);
      } catch (error) {
        console.error("Failed to fetch community picks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityPicks();
  }, [getCollaborativeRecommendations]);

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
