"use client";

import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";

const PersonalizedSection = () => {
  const { isAuthenticated } = useAuth();
  const { getUserRecommendations } = useRecommendation();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          const results = await getUserRecommendations(6);
          setRecommendations(results.map((item) => item.product || item));
        }
      } catch (error) {
        console.error("Failed to fetch personalized recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, [isAuthenticated, getUserRecommendations]);

  if (!isAuthenticated && !isLoading) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center mb-6">
        <Lightbulb className="w-6 h-6 text-violet-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Just For You</h2>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <ProductCardList products={recommendations} isLoading={isLoading} emptyMessage="We're working on your personalized recommendations! Explore more products to get tailored suggestions." viewAllLink="/recommendations" />
      </div>
    </section>
  );
};

export default PersonalizedSection;