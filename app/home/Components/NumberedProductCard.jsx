"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import UpvoteButton from "../../../Components/Buttons/Upvote/UpvoteButton";
import BookmarkButton from "../../../Components/Buttons/Bookmark/BookmarkButton";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useSocket } from "../../../Contexts/Socket/SocketContext";

// Memoize the component to prevent unnecessary re-renders
const NumberedProductCard = React.memo(function NumberedProductCard({
  product,
  position = 0,
  recommendationType = null,
}) {
  const { isAuthenticated } = useAuth();
  const { recordInteraction } = useRecommendation();
  const { subscribeToProductUpdates } = useSocket();

  // Store product ID in a ref to avoid re-subscriptions when only other props change
  const productIdRef = useRef(product?._id);

  // Update the ref if the product ID changes
  useEffect(() => {
    if (product?._id && product._id !== productIdRef.current) {
      productIdRef.current = product._id;
    }
  }, [product?._id]);

  // Subscribe to socket updates for this product - only once per product ID
  useEffect(() => {
    const productId = productIdRef.current;
    if (!productId || !subscribeToProductUpdates) return;

    // Subscribe to product updates via socket
    const unsubscribe = subscribeToProductUpdates(productId);

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToProductUpdates]); // Only depend on subscribeToProductUpdates, not product ID

  if (!product) return null;

  // Handle product view interaction - memoize to prevent recreation on each render
  const handleProductView = useCallback(() => {
    if (!isAuthenticated || !recordInteraction) return;

    // Use a non-blocking approach to avoid delaying navigation
    setTimeout(async () => {
      try {
        await recordInteraction(product._id, "view", {
          source: recommendationType || "home",
          position,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to record product view:", error);
      }
    }, 10); // Very small delay to ensure it doesn't block navigation
  }, [isAuthenticated, recordInteraction, product._id, recommendationType, position]);

  // Memoized empty success handler - the global cache handles updates
  // Using useCallback to prevent recreation on each render
  const handleInteractionSuccess = useCallback(() => {}, []);

  // Data preparation with fallbacks
  const imageUrl =
    product.thumbnail ||
    product.logo ||
    "/images/product-placeholder.png";
  const productName = product.name || "Product";
  const tagline =
    product.tagline ||
    product.description ||
    "No description available";
  const truncatedTagline =
    tagline.length > 100 ? `${tagline.substring(0, 100)}...` : tagline;
  const slug = product.slug || product._id;

  const categoryName =
    product.categoryNameVirtual ||
    product.categoryName ||
    product.category?.name ||
    "General";
  const tags = product.tags || [];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, delay: position * 0.05, ease: "easeOut" },
    },
    hover: {
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const [showExplanation, setShowExplanation] = useState(false);
  const explanationText = product.explanationText || "Recommended based on your interests";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={handleProductView}
      className="group bg-white rounded-xl border border-gray-100 transition-all duration-300 overflow-hidden hover:border-violet-200"
    >
      <div className="flex items-start p-4 sm:p-5">
        {/* Left side - Number with enhanced styling */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 font-bold flex items-center justify-center text-lg mr-3 sm:mr-4 shadow-sm">
          {position + 1}
        </div>

        {/* Middle - Content with improved responsive layout */}
        <div className="flex-1 min-w-0">
          <Link href={`/product/${slug}`} className="block">
            <div className="flex items-center mb-2">
              {/* Product Image with enhanced styling */}
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 mr-3 shadow-sm group-hover:shadow transition-shadow duration-300">
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 48px, 48px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={position < 3}
                  onError={(e) => {
                    e.target.src = "/images/product-placeholder.png";
                  }}
                />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-violet-700 transition-colors duration-200 line-clamp-1">
                {productName}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
              {truncatedTagline}
            </p>

            {/* Tags with improved responsive layout */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-full group-hover:bg-violet-100 transition-colors duration-200">
                #{categoryName}
              </span>
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full group-hover:bg-gray-100 transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full group-hover:bg-gray-100 transition-colors duration-200">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          </Link>

          {/* Action Row with improved responsive layout */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2">
            <div className="flex items-center gap-3">
              {/* Upvote Button */}
              <UpvoteButton
                product={product}
                size="sm"
                source={recommendationType || "home"}
                onSuccess={(result) => handleInteractionSuccess(result, 'upvote')}
              />

              {/* Bookmark Button */}
              <BookmarkButton
                product={product}
                size="sm"
                source={recommendationType || "home"}
                onSuccess={(result) => handleInteractionSuccess(result, 'bookmark')}
              />

              {/* Comments Count */}
              {product.commentCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {product.commentCount}
                  </span>
                </div>
              )}
            </div>

            {/* View Product Link with enhanced styling */}
            <Link
              href={`/product/${slug}`}
              className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center bg-violet-50 hover:bg-violet-100 px-3 py-1 rounded-lg transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              View Product
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* External link if available - enhanced styling */}
      {product.links?.website && (
        <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
          <a
            href={product.links.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-500 hover:text-violet-600 flex items-center"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {product.links.website.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        </div>
      )}

      {/* Explanation Text with enhanced styling */}
      {explanationText && (
        <div
          className="px-5 py-2 border-t border-gray-100 bg-violet-50 text-xs text-violet-700 cursor-pointer group-hover:bg-violet-100 transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowExplanation(!showExplanation);
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">Why we recommend this</span>
            <motion.div
              animate={{ rotate: showExplanation ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2"
              >
                {explanationText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
});

export default NumberedProductCard;
