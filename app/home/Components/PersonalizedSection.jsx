"use client";

import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";

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

      setIsLoading(true);
      try {
        // Use the updated getPersonalizedRecommendations from context
        const results = await getPersonalizedRecommendations(6);
        setPersonalized(results);
      } catch (error) {
        console.error("Failed to fetch personalized recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
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
