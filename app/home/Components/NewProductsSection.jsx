"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { shouldRateLimit, markRequest, getRequestKey } from "../../../Utils/rateLimiter";

const NewProductsSection = () => {
  const { getNewRecommendations } = useRecommendation();
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      // Only show loading state if we don't have any data yet
      if (newProducts.length === 0) {
        setIsLoading(true);
      }

      // Use a longer cooldown for new products (8 seconds)
      const requestKey = getRequestKey('new-products', { limit: 6 });
      if (shouldRateLimit(requestKey, 8000)) {
        console.log('Rate limiting new products request');
        if (newProducts.length > 0) {
          setIsLoading(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      markRequest(requestKey);

      try {
        // Add forceRefresh=false to use cached data when available
        const results = await getNewRecommendations(6, 0, 7, false);

        // Only update state if we got valid results
        if (Array.isArray(results) && results.length > 0) {
          setNewProducts(results);
          // Clear any previous errors
          if (error) setError(null);
        } else if (newProducts.length === 0) {
          // Only show warning if we don't have existing data
          console.warn("No new products found or invalid response format");
        }
      } catch (error) {
        console.error("Failed to fetch new products:", error);
        // Only set error if we don't have existing data
        if (newProducts.length === 0) {
          setError("Failed to load new products");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewProducts();
  }, [getNewRecommendations]); // Removed newProducts.length from dependencies

  return (
    <section className="mt-10">
      <div className="flex items-center mb-6">
        <div className="bg-amber-100 p-2 rounded-md mr-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">New & Noteworthy</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-amber-600 hover:text-amber-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProductCardList
            products={newProducts}
            isLoading={isLoading}
            emptyMessage="No new products available at the moment. Check back soon!"
            viewAllLink="/new"
            recommendationType="new"
          />
        )}
      </div>
    </section>
  );
};

export default NewProductsSection;
