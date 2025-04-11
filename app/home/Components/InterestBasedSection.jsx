"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";

const InterestBasedSection = () => {
  const { isAuthenticated } = useAuth();
  const { getInterestsRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [interestProducts, setInterestProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only show loading state if we don't have any data yet
      if (interestProducts.length === 0) {
        setIsLoading(true);
      }

      // Check if we should rate limit this request with a longer cooldown (15 seconds)
      // Interest-based recommendations are more expensive to compute, so we use a longer cooldown
      const requestKey = getRequestKey('interests', { limit: 6, offset: 0, strategy: 'interests' });
      if (shouldRateLimit(requestKey, 15000)) { // 15 second cooldown
        console.log('Rate limiting interest-based recommendations request');
        // If we have cached data, don't show loading state
        if (interestProducts.length > 0) {
          setIsLoading(false);
          return;
        }
        // Otherwise wait a bit before trying
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Mark this request as made
      markRequest(requestKey);

      try {
        // Use the updated getInterestsRecommendations from context
        // Add forceRefresh=false to use cached data when available
        const results = await getInterestsRecommendations(6, 0, false);

        // Only update state if we got results
        if (results && results.length > 0) {
          setInterestProducts(results);
        }
      } catch (error) {
        console.error("Failed to fetch interest-based recommendations:", error);
        setError("Failed to load recommendations based on your interests");
        // Keep showing existing data if we have it
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated, getInterestsRecommendations]);

  if (!isAuthenticated) return null;
  
  // Don't render if we have no data and no error
  if (!isLoading && interestProducts.length === 0 && !error) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center mb-6">
        <div className="bg-fuchsia-100 p-2 rounded-md mr-3">
          <Heart className="w-5 h-5 text-fuchsia-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Based on Your Interests</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ProductCardList
          products={interestProducts}
          isLoading={isLoading}
          emptyMessage="We're analyzing your interests to find the perfect products for you. Explore more to get better recommendations!"
          viewAllLink="/recommendations?filter=interests"
          recommendationType="interests"
        />
      </div>
    </section>
  );
};

export default InterestBasedSection;
