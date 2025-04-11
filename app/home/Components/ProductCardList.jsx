"use client";

import React from "react";
import HomeProductCard from "./HomeProductCard";
import { motion } from "framer-motion";
import { Inbox, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1.5 text-base">{description}</p>
              )}
            </div>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
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
              className="bg-white rounded-2xl shadow-sm h-72 animate-pulse border border-gray-100 p-6 overflow-hidden"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl bg-gray-200"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded-full w-1/2 mb-5"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-1/2 mt-5"></div>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1.5 text-base">{description}</p>
              )}
            </div>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>
        )}
        <motion.div
          className="text-center py-16 px-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{emptyMessage}</p>
        </motion.div>
      </div>
    );
  }

  // Normalize product data structure
  const normalizedProducts = products.map((item) => {
    // Check if the item has a productData property (from recommendation API)
    if (item.productData) {
      return {
        ...item.productData,
        _id: item.productData._id || item.product || item._id,
        score: item.score,
        reason: item.reason,
        explanationText: item.explanationText || item.reason,
        scoreContext: item.scoreContext,
        metadata: item.metadata,
      };
    }
    // Check if the item has a product property (from older recommendation API)
    else if (item.product) {
      return {
        ...(typeof item.product === 'object' ? item.product : {}),
        _id: item._id || (typeof item.product === 'object' ? item.product._id : item.product),
        score: item.score,
        reason: item.reason,
        explanationText: item.explanationText || item.reason || item.explanation,
        scoreContext: item.scoreContext,
      };
    }
    // Return the item as is if it's already a product
    return item;
  });

  // Render List
  return (
    <div className="w-full">
      {title && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1.5 text-base">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={viewAllLink}
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </motion.div>
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