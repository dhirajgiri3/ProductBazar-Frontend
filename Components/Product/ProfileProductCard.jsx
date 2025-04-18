import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUp, FiEye, FiTag, FiCalendar, FiHeart } from "react-icons/fi";
import { format, parseISO, isValid } from "date-fns";

// Helper function to safely format dates
const formatDate = (dateString) => {
  try {
    if (!dateString) return "";

    // Sometimes dates can come as timestamps or other formats
    const date = typeof dateString === 'number'
      ? new Date(dateString)
      : parseISO(dateString);

    if (!isValid(date)) {
      return "";
    }

    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "";
  }
};

// Helper to safely get slug or ID for product URL
const getProductUrl = (product) => {
  if (!product) return "#";

  if (product.slug) {
    return `/product/${product.slug}`;
  }

  return `/product/${product._id || product.id}`;
};

const ProfileProductCard = ({ product, minimal = false }) => {
  if (!product) return null;

  const {
    name,
    title,
    description,
    tagline,
    thumbnailImage,
    images,
    tags,
    category,
    upvotesCount,
    upvotes,
    views,
    createdAt,
    launchedAt,
    status
  } = product;

  // Determine product name from various possible fields
  const productName = name || title || "Unnamed Product";

  // Get short description
  const shortDescription = tagline || description || "";

  // Calculate upvotes count
  const upvoteCount = upvotesCount || (Array.isArray(upvotes) ? upvotes.length : upvotes) || 0;

  // Get thumbnail URL, with fallbacks
  const thumbnailUrl =
    (thumbnailImage && thumbnailImage.url) ||
    (thumbnailImage && typeof thumbnailImage === 'string' ? thumbnailImage : null) ||
    (images && images.length > 0 && images[0].url) ||
    (images && images.length > 0 && typeof images[0] === 'string' ? images[0] : null) ||
    "https://images.unsplash.com/photo-1744167602287-77dc1cabd4e6?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Get formatted date
  const formattedDate = formatDate(launchedAt || createdAt);

  // Get product URL
  const productUrl = getProductUrl(product);

  // Get category name
  const categoryName =
    (typeof category === 'object' ? category.name : category) ||
    "Uncategorized";

  // Get status with default
  const productStatus = status || "Published";

  // Format tags for display
  const productTags = Array.isArray(tags) ? tags :
    (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-violet-100 ${minimal ? 'h-full' : ''}`}
    >
      {status && status !== "Published" && (
        <div className="absolute top-3 right-3 z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              status === "Draft"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : status === "Archived"
                  ? "bg-gray-50 text-gray-700 border-gray-200"
                  : "bg-violet-50 text-violet-700 border-violet-200"
            }`}
          >
            {status}
          </motion.span>
        </div>
      )}

      <Link href={productUrl}>
        <div className="w-full aspect-video relative overflow-hidden group">
          <Image
            src={thumbnailUrl}
            alt={productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-5">
          <h3 className="font-medium text-gray-900 line-clamp-1 text-base md:text-lg">{productName}</h3>

          {!minimal && shortDescription && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{shortDescription}</p>
          )}

          {minimal && shortDescription && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{shortDescription}</p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!minimal && (
                <motion.div
                  className="flex items-center text-gray-500 text-xs gap-1.5"
                  whileHover={{ scale: 1.05, color: "#8b5cf6" }}
                >
                  <FiEye className="w-3.5 h-3.5" />
                  <span>{views || 0}</span>
                </motion.div>
              )}

              <motion.div
                className="flex items-center text-gray-500 text-xs gap-1.5"
                whileHover={{ scale: 1.05, color: "#8b5cf6" }}
              >
                <FiArrowUp className="w-3.5 h-3.5" />
                <span>{upvoteCount}</span>
              </motion.div>

              {!minimal && formattedDate && (
                <motion.div
                  className="flex items-center text-gray-500 text-xs gap-1.5"
                  whileHover={{ scale: 1.05, color: "#8b5cf6" }}
                >
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </motion.div>
              )}
            </div>

            {!minimal && categoryName && (
              <motion.span
                className="text-xs px-3 py-1 bg-violet-50 text-violet-600 rounded-full border border-violet-100"
                whileHover={{ scale: 1.05, y: -2, backgroundColor: "#ede9fe" }}
              >
                {categoryName}
              </motion.span>
            )}
          </div>

          {!minimal && productTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {productTags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100"
                  whileHover={{ scale: 1.05, y: -2, backgroundColor: "#f5f3ff" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {tag}
                </motion.span>
              ))}
              {productTags.length > 3 && (
                <motion.span
                  className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100"
                  whileHover={{ scale: 1.05, y: -2, backgroundColor: "#f5f3ff" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  +{productTags.length - 3}
                </motion.span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProfileProductCard;
