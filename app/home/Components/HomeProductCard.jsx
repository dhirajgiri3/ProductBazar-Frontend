"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MessageCircle,
  Clock,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import { useProduct } from "../../../Contexts/Product/ProductContext";

const HomeProductCard = ({
  product,
  position = 0,
  recommendationType = null,
}) => {
  const { isAuthenticated } = useAuth();
  const { recordInteraction } = useRecommendation();
  const { toggleUpvote, toggleBookmark } = useProduct();
  const [isUpvoteLoading, setIsUpvoteLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [localProduct, setLocalProduct] = useState(product);
  const [isHovered, setIsHovered] = useState(false);

  if (!localProduct) return null;

  // Handle product view interaction
  const handleProductView = async () => {
    if (!isAuthenticated || !recordInteraction) return;
    try {
      await recordInteraction(localProduct._id, "view", {
        source: recommendationType || "home",
        position,
      });
    } catch (error) {
      console.error("Failed to record product view:", error);
    }
  };

  // Handle upvote interaction
  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    if (isUpvoteLoading) return;

    setIsUpvoteLoading(true);
    try {
      // Optimistic UI update
      const newHasUpvoted = !localProduct.userInteractions?.hasUpvoted;
      const upvoteDelta = newHasUpvoted ? 1 : -1;

      setLocalProduct((prev) => ({
        ...prev,
        upvoteCount: (prev.upvoteCount || 0) + upvoteDelta,
        userInteractions: {
          ...prev.userInteractions,
          hasUpvoted: newHasUpvoted,
        },
      }));

      // Call the toggleUpvote function from ProductContext
      const result = await toggleUpvote(localProduct.slug);

      if (!result.success) {
        // Revert optimistic update if API call failed
        setLocalProduct(product);
        console.error("Failed to upvote product:", result.message);
        return;
      }

      // Record interaction for recommendation system
      await recordInteraction(
        localProduct._id,
        result.upvoted ? "upvote" : "remove_upvote",
        {
          source: recommendationType || "home",
          position,
          previousInteraction: !result.upvoted ? "upvoted" : "none",
        }
      );
    } catch (error) {
      console.error("Failed to upvote product:", error);
      // Revert optimistic update on error
      setLocalProduct(product);
    } finally {
      setIsUpvoteLoading(false);
    }
  };

  // Handle bookmark interaction
  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      // Optimistic UI update
      const newHasBookmarked = !localProduct.userInteractions?.hasBookmarked;

      setLocalProduct((prev) => ({
        ...prev,
        userInteractions: {
          ...prev.userInteractions,
          hasBookmarked: newHasBookmarked,
        },
      }));

      // Call the toggleBookmark function from ProductContext
      const result = await toggleBookmark(localProduct.slug);

      if (!result.success) {
        // Revert optimistic update if API call failed
        setLocalProduct(product);
        console.error("Failed to bookmark product:", result.message);
        return;
      }

      // Record interaction for recommendation system
      await recordInteraction(
        localProduct._id,
        result.bookmarked ? "bookmark" : "remove_bookmark",
        {
          source: recommendationType || "home",
          position,
          previousInteraction: !result.bookmarked ? "bookmarked" : "none",
        }
      );
    } catch (error) {
      console.error("Failed to bookmark product:", error);
      // Revert optimistic update on error
      setLocalProduct(product);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  // Data preparation with fallbacks
  const imageUrl =
    localProduct.thumbnail ||
    localProduct.logo ||
    "/images/product-placeholder.png";
  const productName = localProduct.name || "Product";
  const tagline =
    localProduct.tagline ||
    localProduct.description ||
    "No description available";
  const truncatedTagline =
    tagline.length > 80 ? `${tagline.substring(0, 80)}...` : tagline;
  const slug = localProduct.slug || localProduct._id;
  const upvotesCount =
    localProduct.upvotes?.count || localProduct.upvoteCount || 0;
  const hasUpvoted =
    localProduct.upvotes?.userHasUpvoted ||
    localProduct.userInteractions?.hasUpvoted ||
    false;
  const hasBookmarked =
    localProduct.bookmarks?.userHasBookmarked ||
    localProduct.userInteractions?.hasBookmarked ||
    false;

  // Recommendation data is handled below

  const categoryName =
    localProduct.categoryNameVirtual ||
    localProduct.categoryName ||
    localProduct.category?.name ||
    "General";
  const makerFirstName =
    localProduct.maker?.firstName || localProduct.maker?.name || "Unknown";
  const makerLastName = localProduct.maker?.lastName || "";
  const makerImage =
    localProduct.maker?.profilePicture?.url || "/images/avatar-placeholder.png";
  const daysSinceCreation =
    localProduct.metrics?.daysSinceCreation ||
    (localProduct.createdAt
      ? Math.floor(
          (new Date().getTime() - new Date(localProduct.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null);
  const commentCount = localProduct.commentCount || 0;
  const tags = localProduct.tags || [];
  const reason = localProduct.reason || "";
  const explanationText = localProduct.explanationText || "Recommended for you";
  const scoreContext = localProduct.scoreContext || "";

  // Recommendation badge configuration
  const badgeConfig = {
    personalized: {
      label: "For You",
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
      icon: <Heart className="w-3 h-3" />,
    },
    trending: {
      label: "Trending",
      color: "bg-gradient-to-r from-orange-500 to-amber-500",
      icon: <ArrowUp className="w-3 h-3" />,
    },
    new: {
      label: "New",
      color: "bg-gradient-to-r from-emerald-500 to-teal-500",
      icon: <Clock className="w-3 h-3" />,
    },
    collaborative: {
      label: "Community Pick",
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
      icon: <Heart className="w-3 h-3" />,
    },
    interests: {
      label: "Matches You",
      color: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
      icon: <Heart className="w-3 h-3" />,
    },
    discovery: {
      label: "Discover",
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
      icon: <ExternalLink className="w-3 h-3" />,
    },
    similar: {
      label: "Similar",
      color: "bg-gradient-to-r from-violet-500 to-purple-500",
      icon: <MessageCircle className="w-3 h-3" />,
    },
    category: {
      label: categoryName,
      color: "bg-gradient-to-r from-indigo-500 to-blue-500",
      icon: null,
    },
    backup: {
      label: "Suggested",
      color: "bg-gradient-to-r from-gray-500 to-gray-700",
      icon: <ExternalLink className="w-3 h-3" />,
    },
  };

  // Determine badge based on recommendation type or reason
  const badge = recommendationType
    ? badgeConfig[recommendationType]
    : reason && badgeConfig[reason]
    ? badgeConfig[reason]
    : null;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: position * 0.05 },
    },
    hover: {
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  const timeAgo = () => {
    if (daysSinceCreation === null) return "";
    if (daysSinceCreation === 0) return "Today";
    if (daysSinceCreation === 1) return "Yesterday";
    return `${daysSinceCreation} days ago`;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleProductView}
      className="group overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <Link href={`/product/${slug}`} className="block">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/images/product-placeholder.png";
            }}
          />

          {/* Badge Overlay */}
          {badge && (
            <div
              className={`absolute top-3 left-3 ${badge.color} py-1 px-3 rounded-full flex items-center gap-1 text-xs font-medium text-white shadow-sm`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm py-1 px-2 rounded-full text-xs font-medium text-white">
            {categoryName}
          </div>

          {/* Upvote Stats */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm py-1 px-2 rounded-full flex items-center gap-1.5 text-xs font-medium text-white">
            <ArrowUp className="w-3 h-3" />
            <span>{upvotesCount}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 flex-1 line-clamp-1">
              {productName}
            </h3>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{timeAgo()}</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {truncatedTagline}
          </p>

          {/* Explanation Text (if available) */}
          {explanationText && (
            <div className="flex items-center gap-1.5 mb-3 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md w-fit">
              <span className="font-medium">{explanationText}</span>
            </div>
          )}

          {/* Tags Row */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer Section */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Maker Info */}
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 rounded-full overflow-hidden border border-gray-100">
                <Image
                  src={makerImage}
                  alt={`${makerFirstName} ${makerLastName}`}
                  fill
                  sizes="24px"
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = "/images/avatar-placeholder.png";
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[120px]">
                {makerFirstName} {makerLastName}
              </span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Bar - Fixed at bottom */}
      <div className="border-t border-gray-100 p-3 flex items-center justify-between bg-gray-50">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <motion.button
            onClick={handleUpvote}
            disabled={isUpvoteLoading}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full transition-all duration-200 ${
              hasUpvoted
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-white hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200"
            }`}
            title={hasUpvoted ? "Remove upvote" : "Upvote"}
          >
            <ArrowUp
              className={`w-4 h-4 ${isUpvoteLoading ? "animate-pulse" : ""}`}
            />
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full transition-all duration-200 ${
              hasBookmarked
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-white hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200"
            }`}
            title={hasBookmarked ? "Remove bookmark" : "Save for later"}
          >
            {hasBookmarked ? (
              <BookmarkCheck
                className={`w-4 h-4 ${
                  isBookmarkLoading ? "animate-pulse" : ""
                }`}
              />
            ) : (
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarkLoading ? "animate-pulse" : ""
                }`}
              />
            )}
          </motion.button>

          {/* External Link Button */}
          {localProduct.links?.website && (
            <motion.a
              href={localProduct.links.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200"
              title="Visit website"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>

        {/* View Details Button */}
        <Link
          href={`/product/${slug}`}
          className="inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </Link>
      </div>

      {/* Explanation - Only shown when hovered */}
      {explanationText && isHovered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-indigo-50 p-3 border-t border-indigo-100"
        >
          <p className="text-xs text-indigo-800">
            <span className="font-medium">Why we recommend this:</span>{" "}
            {explanationText}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeProductCard;
