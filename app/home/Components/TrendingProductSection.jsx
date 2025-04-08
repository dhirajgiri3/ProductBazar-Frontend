"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";

const TrendingProductsSection = () => {
  const { isAuthenticated } = useAuth();
  const { getTrendingRecommendations } = useRecommendation();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      try {
        // Using the updated getTrendingRecommendations from the context
        const results = await getTrendingRecommendations(6, 0, timeRange);
        setTrendingProducts(results);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [getTrendingRecommendations, timeRange]);

  const handleTimeRangeChange = (days) => {
    setTimeRange(days);
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-red-100 p-2 rounded-md mr-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="flex gap-2">
          {[
            { label: "Today", value: 1 },
            { label: "Week", value: 7 },
            { label: "Month", value: 30 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-3 py-1 text-sm rounded-full ${
                timeRange === option.value
                  ? "bg-red-100 text-red-600 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <ProductCardList
          products={trendingProducts}
          isLoading={isLoading}
          emptyMessage="No trending products available right now. Check back soon!"
          viewAllLink="/trending"
          recommendationType="trending"
        />
      </div>
    </section>
  );
};

export default TrendingProductsSection;
