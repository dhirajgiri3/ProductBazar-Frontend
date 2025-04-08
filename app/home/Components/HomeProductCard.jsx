"use client";

import React from "react";
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
} from "lucide-react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";

const HomeProductCard = ({
  product,
  position = 0,
  recommendationType = null,
}) => {
  const { isAuthenticated } = useAuth();
  const { recordInteraction, submitRecommendationFeedback } =
    useRecommendation();
  const [isUpvoteLoading, setIsUpvoteLoading] = React.useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = React.useState(false);
  const [localProduct, setLocalProduct] = React.useState(product);

  if (!localProduct) return null;

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
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

      // Record interaction with backend
      await recordInteraction(
        localProduct._id,
        newHasUpvoted ? "upvote" : "remove_upvote",
        {
          source: recommendationType || "home",
          position,
          previousInteraction: !newHasUpvoted ? "upvoted" : "none",
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

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href =
        "/login?redirect=" + encodeURIComponent(window.location.pathname);
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

      // Record interaction with backend
      await recordInteraction(
        localProduct._id,
        newHasBookmarked ? "bookmark" : "remove_bookmark",
        {
          source: recommendationType || "home",
          position,
          previousInteraction: !newHasBookmarked ? "bookmarked" : "none",
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

  // Ensure fallbacks for required fields
  const imageUrl = localProduct.thumbnail || "/images/product-placeholder.png";
  const productName = localProduct.name || "Product";
  const tagline =
    localProduct.tagline ||
    localProduct.description ||
    "No description available";
  const truncatedTagline =
    tagline.length > 100 ? `${tagline.substring(0, 100)}...` : tagline;
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
  const categoryName =
    localProduct.categoryNameVirtual ||
    localProduct.categoryName ||
    localProduct.category?.name ||
    "General";
  const makerName =
    localProduct.maker?.fullName || localProduct.maker?.name || "Unknown Maker";
  const makerImage =
    localProduct.maker?.profilePicture?.url || "/images/avatar-placeholder.png";
  const daysSinceCreation =
    localProduct.metrics?.daysSinceCreation ||
    (localProduct.createdAt
      ? Math.floor(
          (new Date() - new Date(localProduct.createdAt)) /
            (1000 * 60 * 60 * 24)
        )
      : null);
  const commentCount = localProduct.commentCount || 0;

  // Recommendation badges
  const recommendationBadges = {
    personalized: { label: "For You", color: "from-violet-500 to-indigo-600" },
    trending: { label: "Trending", color: "from-rose-500 to-pink-600" },
    new: { label: "New", color: "from-emerald-500 to-teal-600" },
    collaborative: {
      label: "Community Pick",
      color: "from-amber-500 to-orange-600",
    },
    similar: {
      label: "Similar",
      color: "from-blue-500 to-indigo-600",
    },
    category: {
      label: categoryName,
      color: "from-purple-500 to-indigo-600",
    },
    interest: {
      label: "Based on interests",
      color: "from-green-500 to-teal-600",
    },
  };

  const badge = recommendationType && recommendationBadges[recommendationType];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: position * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      {/* Badge for recommendation type */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + position * 0.05 }}
          className={`absolute top-3 right-3 bg-gradient-to-r ${badge.color} py-1 px-2.5 rounded-full text-xs font-medium text-white z-10 shadow-sm`}
        >
          {badge.label}
        </motion.div>
      )}

      {/* Card Content */}
      <Link href={`/product/${slug}`} className="block">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <motion.div
              className="relative h-16 w-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={imageUrl}
                alt={productName}
                fill
                sizes="64px"
                style={{ objectFit: "cover" }}
                className="transition-all duration-300"
                onError={(e) => {
                  e.target.src = "/images/product-placeholder.png";
                }}
              />
            </motion.div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 font-semibold text-lg leading-tight tracking-tight mb-1">
                {productName}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {truncatedTagline}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                  {categoryName}
                </span>

                {localProduct.tags &&
                  localProduct.tags.slice(0, 1).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5 rounded-full overflow-hidden border border-gray-100">
                <Image
                  src={makerImage}
                  alt={makerName}
                  fill
                  sizes="20px"
                  style={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/images/avatar-placeholder.png";
                  }}
                />
              </div>
              <span className="truncate max-w-[100px]">{makerName}</span>

              {daysSinceCreation !== null && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {daysSinceCreation}{" "}
                    {daysSinceCreation === 1 ? "day" : "days"}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Bar */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
        {/* Upvote Button */}
        <motion.button
          onClick={handleUpvote}
          disabled={isUpvoteLoading}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            hasUpvoted
              ? "bg-violet-100 text-violet-700"
              : "bg-white hover:bg-violet-50 text-gray-600 hover:text-violet-600 border border-gray-200 hover:border-violet-200"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>{upvotesCount}</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <motion.button
            onClick={handleBookmark}
            disabled={isBookmarkLoading}
            className={`p-1.5 rounded-full ${
              hasBookmarked
                ? "bg-violet-100 text-violet-700"
                : "bg-white hover:bg-violet-50 text-gray-500 hover:text-violet-600 border border-gray-200 hover:border-violet-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={hasBookmarked ? "Remove bookmark" : "Save for later"}
          >
            {hasBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>

          {/* External Link Button */}
          {localProduct.links?.website && (
            <motion.a
              href={localProduct.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full bg-white hover:bg-violet-50 text-gray-500 hover:text-violet-600 border border-gray-200 hover:border-violet-200"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Visit website"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HomeProductCard;
