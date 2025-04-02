"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCardList from "./ProductCardList";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";

const NewProductsSection = () => {
  const { getDiversifiedFeed } = useRecommendation();
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      setIsLoading(true);
      try {
        const result = await getDiversifiedFeed(6, false, true);
        setNewProducts(result.map((item) => item.product || item));
      } catch (error) {
        console.error("Failed to fetch new products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewProducts();
  }, [getDiversifiedFeed]);

  return (
    <section className="mt-12">
      <div className="flex items-center mb-6">
        <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">New & Noteworthy</h2>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <ProductCardList products={newProducts} isLoading={isLoading} emptyMessage="No new products available at the moment. Check back soon!" viewAllLink="/new" />
      </div>
    </section>
  );
};

export default NewProductsSection;