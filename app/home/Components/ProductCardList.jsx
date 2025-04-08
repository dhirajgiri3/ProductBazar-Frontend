"use client";

import React from "react";
import HomeProductCard from "./HomeProductCard";
import { motion } from "framer-motion";
import { Inbox, Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const ProductCardList = ({
  products = [],
  title,
  description,
  emptyMessage = "No products found",
  viewAllLink,
  isLoading = false,
  gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  recommendationType = null,
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="w-full">
        {title && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1 text-sm">{description}</p>
              )}
            </div>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>
        )}
        <div className={gridClass}>
          {[...Array(3)].map((_, i) => (
            <div
              key={`skel-${i}`}
              className="bg-white rounded-xl shadow-sm h-64 animate-pulse border border-gray-100 p-5"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!products || products.length === 0) {
    return (
      <div className="w-full">
        {title && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1 text-sm">{description}</p>
              )}
            </div>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>
        )}
        <div className="text-center py-10 px-6 bg-gray-50 rounded-xl">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Normalize product data structure
  const normalizedProducts = products.map((item) => {
    // Check if the item has a product property (from recommendation API)
    if (item.product || item.productData) {
      return {
        ...(item.productData || item.product),
        _id: item._id || item.product?._id || item.productData?._id,
        score: item.score,
        explanationText: item.reason || item.explanation,
      };
    }
    // Return the item as is if it's already a product
    return item;
  });

  // Render List
  return (
    <div className="w-full">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1 text-sm">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      <motion.div
        className={gridClass}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {normalizedProducts.map((product, index) => (
          <HomeProductCard
            key={product._id || `product-${index}`}
            product={product}
            position={index}
            recommendationType={recommendationType}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ProductCardList;
