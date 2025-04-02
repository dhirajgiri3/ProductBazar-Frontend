"use client";

import React, { useState } from "react";
import HomeProductCard from "./HomeProductCard";
import { motion } from "framer-motion";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const ProductCardList = ({
  products = [],
  title,
  emptyMessage = "No products found",
  viewAllLink,
  isLoading = false,
}) => {
  const { toggleUpvote, toggleBookmark } = useProduct();
  const { isAuthenticated } = useAuth();
  const [loadingStates, setLoadingStates] = useState({
    upvote: null,
    bookmark: null,
  });

  const handleUpvote = async (product) => {
    if (!isAuthenticated) return (window.location.href = "/auth/login");
    setLoadingStates((prev) => ({ ...prev, upvote: product._id }));
    await toggleUpvote(product.slug);
    setLoadingStates((prev) => ({ ...prev, upvote: null }));
  };

  const handleBookmark = async (product) => {
    if (!isAuthenticated) return (window.location.href = "/auth/login");
    setLoadingStates((prev) => ({ ...prev, bookmark: product._id }));
    await toggleBookmark(product.slug);
    setLoadingStates((prev) => ({ ...prev, bookmark: null }));
  };

  return (
    <div className="w-full">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-violet-600 hover:text-violet-700 flex items-center text-sm font-medium"
            >
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => (
            <HomeProductCard
              key={product._id}
              product={product}
              onUpvote={handleUpvote}
              onBookmark={handleBookmark}
              isUpvoteLoading={loadingStates.upvote === product._id}
              isBookmarkLoading={loadingStates.bookmark === product._id}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-10 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
};

export default ProductCardList;
