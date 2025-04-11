"use client";

import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";

const PersonalizedSection = () => {
  const { isAuthenticated } = useAuth();
  const { getPersonalizedRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [personalized, setPersonalized] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      // Only show loading state if we don't have any data yet
      if (personalized.length === 0) {
        setIsLoading(true);
      }

      // Check if we should rate limit this request with a longer cooldown (15 seconds)
      // Personalized recommendations are more expensive to compute, so we use a longer cooldown
      const requestKey = getRequestKey('personalized', { limit: 6, offset: 0, strategy: 'personalized' });
      if (shouldRateLimit(requestKey, 15000)) { // 15 second cooldown
        console.log('Rate limiting personalized recommendations request');
        // If we have cached data, don't show loading state
        if (personalized.length > 0) {
          setIsLoading(false);
          return;
        }
        // Otherwise wait a bit before trying
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Mark this request as made
      markRequest(requestKey);

      try {
        // Use the updated getPersonalizedRecommendations from context
        // Add forceRefresh=false to use cached data when available
        const results = await getPersonalizedRecommendations(6, 0, 'personalized', false);

        // Only update state if we got results
        if (results && results.length > 0) {
          setPersonalized(results);
        }
      } catch (error) {
        console.error("Failed to fetch personalized recommendations:", error);
        // Keep showing existing data if we have it
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRecommendations();
    }

    // We don't need to include personalized.length in the dependencies
    // to avoid unnecessary refetches
  }, [isAuthenticated, getPersonalizedRecommendations]);

  if (!isAuthenticated) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center mb-6">
        <div className="bg-violet-100 p-2 rounded-md mr-3">
          <Lightbulb className="w-5 h-5 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Just For You</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ProductCardList
          products={personalized}
          isLoading={isLoading}
          emptyMessage="We're working on your personalized recommendations! Explore more products to get tailored suggestions."
          viewAllLink="/recommendations"
          recommendationType="personalized"
        />
      </div>
    </section>
  );
};

export default PersonalizedSection;
