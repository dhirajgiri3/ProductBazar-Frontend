"use client";

import React from "react";
import NumberedProductCard from "./NumberedProductCard";
import { motion } from "framer-motion";
import { Inbox, ArrowRight } from "lucide-react";
import Link from "next/link";

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

const NumberedProductList = ({
  products = [],
  title,
  description,
  emptyMessage = "No products found",
  viewAllLink,
  isLoading = false,
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
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>
        )}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={`skel-${i}`}
              className="bg-white rounded-xl shadow-sm h-24 animate-pulse border border-gray-100 overflow-hidden"
            >
              <div className="flex p-5">
                <div className="w-12 h-12 rounded-lg bg-gray-200 mr-4"></div>
                <div className="w-14 h-14 rounded-lg bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
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
                className="text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center shrink-0 ml-4 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            )}
          </div>
        )}
        <motion.div
          className="text-center py-8 px-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-4">{emptyMessage}</p>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium"
            >
              Browse All <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  // Normalize product data structure
  const normalizedProducts = products.map((item) => {
    // Handle null or undefined items
    if (!item) return null;

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
        userInteractions: item.productData.userInteractions || {},
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
        userInteractions: (typeof item.product === 'object' && item.product.userInteractions) || {},
      };
    }
    // Return the item as is if it's already a product
    return item;
  }).filter(Boolean); // Remove any null items

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
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {normalizedProducts.map((product, index) => (
          <NumberedProductCard
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

export default NumberedProductList;
