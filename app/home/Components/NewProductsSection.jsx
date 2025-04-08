"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";

const NewProductsSection = () => {
  const { getNewRecommendations } = useRecommendation();
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      setIsLoading(true);
      try {
        // Use the updated getNewRecommendations from context
        const results = await getNewRecommendations(6);

        console.log("New products fetched:", results); // Debugging

        if (Array.isArray(results) && results.length > 0) {
          setNewProducts(results);
        } else {
          console.warn(
            "No new products found or invalid response format:",
            results
          );
          setNewProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch new products:", error);
        setError("Failed to load new products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewProducts();
  }, [getNewRecommendations]);

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
