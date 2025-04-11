"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";

const CollaborativeSection = () => {
  const { isAuthenticated } = useAuth();
  const { getCollaborativeRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [collaborativeProducts, setCollaborativeProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only show loading state if we don't have any data yet
      if (collaborativeProducts.length === 0) {
        setIsLoading(true);
      }

      // Check if we should rate limit this request with a longer cooldown (15 seconds)
      const requestKey = getRequestKey('collaborative', { limit: 6, offset: 0, strategy: 'collaborative' });
      if (shouldRateLimit(requestKey, 15000)) { // 15 second cooldown
        console.log('Rate limiting collaborative recommendations request');
        // If we have cached data, don't show loading state
        if (collaborativeProducts.length > 0) {
          setIsLoading(false);
          return;
        }
        // Otherwise wait a bit before trying
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Mark this request as made
      markRequest(requestKey);

      try {
        // Use the updated getCollaborativeRecommendations from context
        // Add forceRefresh=false to use cached data when available
        const results = await getCollaborativeRecommendations(6, 0, false);

        // Only update state if we got results
        if (results && results.length > 0) {
          setCollaborativeProducts(results);
        }
      } catch (error) {
        console.error("Failed to fetch collaborative recommendations:", error);
        setError("Failed to load recommendations from similar users");
        // Keep showing existing data if we have it
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated, getCollaborativeRecommendations]);

  if (!isAuthenticated) return null;
  
  // Don't render if we have no data and no error
  if (!isLoading && collaborativeProducts.length === 0 && !error) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-md mr-3">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">People Like You Also Liked</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ProductCardList
          products={collaborativeProducts}
          isLoading={isLoading}
          emptyMessage="We're finding products that similar users have enjoyed. Check back soon!"
          viewAllLink="/recommendations?filter=collaborative"
          recommendationType="collaborative"
        />
      </div>
    </section>
  );
};

export default CollaborativeSection;
