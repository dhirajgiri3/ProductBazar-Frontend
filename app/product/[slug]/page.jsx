"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct } from "../../../Contexts/Product/ProductContext.js";
import { useAuth } from "../../../Contexts/Auth/AuthContext.js";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext.js";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import LoaderComponent from "../../../Components/UI/LoaderComponent.jsx";
import ViewTracker from "../../../Components/View/ViewTracker.js";
import {
  ArrowLeft,
  ArrowUp,
  Bookmark,
  ExternalLink,
  GitHub,
  Play,
  Eye,
  MessageSquare,
  Calendar,
  Share2,
  ChevronRight,
  Award,
  Edit,
  MoreHorizontal,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Globe,
  Info,
  Users,
  Tag,
  BarChart,
  Star,
  Heart,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import SimilarProductsSection from "./Components/SimilarProductsSection.jsx";
import CommentSection from "./Components/Comment/CommentSection.jsx";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const {
    getProductBySlug,
    toggleUpvote,
    toggleBookmark,
    loading,
    error,
    clearError,
  } = useProduct();

  const { recordInteraction } = useRecommendation();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [source, setSource] = useState("direct");
  const [activeTab, setActiveTab] = useState("overview");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animations
  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.4 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Extract source from URL params when available
  useEffect(() => {
    const sourceParam =
      searchParams.get("source") || searchParams.get("utm_source");
    if (sourceParam) {
      setSource(sourceParam);
    }
  }, [searchParams]);

  // Memoized loadProduct function
  const loadProduct = useCallback(async () => {
    try {
      const data = await getProductBySlug(slug, !isLoaded);
      if (!data || data.success === false) {
        setIsLoaded(true);
        return;
      }
      setProduct(data);

      const upvoteCount = data.upvotes?.count || 0;
      setUpvoteCount(upvoteCount);

      const commentCount = data.comments?.count || 0;
      setCommentCount(commentCount);

      if (isAuthenticated && user) {
        setHasUpvoted(data.upvotes?.userHasUpvoted || false);
        setHasBookmarked(data.bookmarks?.userHasBookmarked || false);
      }
      setIsLoaded(true);

      // Record view interaction for recommendation engine
      if (data._id) {
        recordInteraction(data._id, "view", { source });
      }
    } catch (err) {
      showToast("error", "Failed to load product details");
      console.error("Error loading product:", err);
      setIsLoaded(true);
    }
  }, [
    slug,
    getProductBySlug,
    isAuthenticated,
    user,
    isLoaded,
    showToast,
    recordInteraction,
    source,
  ]);

  // Load product on mount or when slug changes
  useEffect(() => {
    if (slug && !isLoaded) {
      loadProduct();
    }
    return () => {
      clearError();
    };
  }, [slug, loadProduct, clearError]);

  // Record product interaction
  const handleInteraction = async (type) => {
    if (!product || !product._id) return;

    try {
      await recordInteraction(product._id, type);
    } catch (err) {
      console.error(`Error recording ${type} interaction:`, err);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      showToast("error", "Please log in to upvote products");
      return;
    }

    if (user && product && user._id === product.maker._id) {
      showToast("error", "You cannot upvote your own product");
      return;
    }

    if (isUpvoting) return;

    setIsUpvoting(true);
    const prevUpvoted = hasUpvoted;
    const prevCount = upvoteCount;

    // Optimistically update UI
    setHasUpvoted(!hasUpvoted);
    setUpvoteCount((prev) => (hasUpvoted ? prev - 1 : prev + 1));

    try {
      const result = await toggleUpvote(slug);

      if (result && result.success) {
        setHasUpvoted(result.upvoted);
        setUpvoteCount(result.upvoteCount);

        if (result.upvoted && !prevUpvoted) {
          handleInteraction("upvote");
          showToast("success", "Product upvoted successfully");
        } else if (!result.upvoted && prevUpvoted) {
          showToast("info", "Upvote removed");
        }
      } else {
        setHasUpvoted(prevUpvoted);
        setUpvoteCount(prevCount);
        showToast("error", result?.message || "Failed to update vote");
      }
    } catch (error) {
      setHasUpvoted(prevUpvoted);
      setUpvoteCount(prevCount);
      showToast("error", "Something went wrong");
      console.error("Upvote error:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast("error", "Please log in to bookmark products");
      return;
    }

    if (isBookmarking) return;

    setIsBookmarking(true);
    const prevBookmarked = hasBookmarked;

    setHasBookmarked(!hasBookmarked);

    try {
      const result = await toggleBookmark(slug);
      if (!result.success) {
        setHasBookmarked(prevBookmarked);
        showToast("error", "Failed to update bookmark");
      } else {
        if (!prevBookmarked) {
          handleInteraction("bookmark");
          showToast("success", "Product bookmarked successfully");
        } else {
          showToast("info", "Bookmark removed");
        }
      }
    } catch (error) {
      setHasBookmarked(prevBookmarked);
      showToast("error", "Something went wrong");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const formattedDate = product?.createdAt
    ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })
    : "";

  const isOwner =
    isAuthenticated && user && product && user._id === product.maker._id;

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50/30">
        <LoaderComponent message="Loading product details..." />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen flex items-center justify-center">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Product</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="container h-screen mx-auto px-4 py-16 text-center flex items-center justify-center">
        <motion.div
          className="max-w-md flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const getThumbnailUrl = () => {
    if (!product)
      return "https://images.unsplash.com/photo-1742277666303-bbba7fa3fecf?q=80&w=3087&auto=format&fit=crop";

    if (
      typeof product.thumbnail === "string" &&
      product.thumbnail.trim() !== ""
    ) {
      return product.thumbnail;
    }

    if (product.thumbnail && product.thumbnail.url) {
      return product.thumbnail.url;
    }

    if (product.gallery && product.gallery.length > 0) {
      const firstImage = product.gallery[0];
      if (typeof firstImage === "string") {
        return firstImage;
      }
      if (firstImage && firstImage.url) {
        return firstImage.url;
      }
    }

    return "https://images.unsplash.com/photo-1742277666303-bbba7fa3fecf?q=80&w=3087&auto=format&fit=crop";
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="bg-gradient-to-b from-violet-50/50 to-white min-h-screen">
      {/* Silent view tracking component */}
      {product && <ViewTracker productId={product._id} source={source} />}

      {/* Background mesh gradient */}
      <div className="fixed inset-0 -z-10 bg-white">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),rgba(124,58,237,0.01)_40%,transparent_60%)]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-violet-100/50 filter blur-3xl opacity-30"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-200/40 filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.button
          onClick={handleBackClick}
          className="mb-6 flex items-center text-gray-600 hover:text-violet-700 transition-colors group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Discover</span>
        </motion.button>

        {/* Main content container */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-8"
          >
            <div className="md:flex flex-col-reverse md:flex-row">
              {/* Product Info Section */}
              <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium"
                    >
                      {product.categoryName || "General"}
                    </motion.span>

                    {product.featured && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        Featured
                      </motion.span>
                    )}

                    {product.launchedAt && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        Launched{" "}
                        {new Date(product.launchedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </motion.span>
                    )}
                  </div>

                  <motion.div variants={fadeInUp} className="mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                      {product.name}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {product.tagline}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="flex flex-wrap gap-2 mb-6"
                  >
                    {product.tags &&
                      product.tags.length > 0 &&
                      product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                  </motion.div>

                  {/* Released date and view stats */}
                  <motion.div
                    variants={fadeInUp}
                    className="flex items-center text-sm text-gray-500 mb-8"
                  >
                    <span className="flex items-center mr-4">
                      <Calendar className="w-4 h-4 mr-1.5 text-violet-500" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1.5 text-violet-500" />
                      {product.views?.count || 0} views
                    </span>
                  </motion.div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <motion.button
                    onClick={handleUpvote}
                    disabled={isUpvoting}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-xl transition-all ${
                      hasUpvoted
                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    <ArrowUp
                      className={`transition-transform ${
                        hasUpvoted ? "text-violet-600" : ""
                      }`}
                      size={18}
                    />
                    <span className="font-medium">{upvoteCount}</span>
                  </motion.button>

                  <motion.button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 py-2.5 px-5 rounded-xl transition-all ${
                      hasBookmarked
                        ? "bg-violet-100 text-violet-700 border border-violet-200"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    <Bookmark
                      className={`transition-transform ${
                        hasBookmarked ? "text-violet-600 fill-violet-600" : ""
                      }`}
                      size={18}
                    />
                    <span className="font-medium">
                      {hasBookmarked ? "Saved" : "Save"}
                    </span>
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="ml-auto flex items-center gap-2"
                  >
                    {isOwner && (
                      <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition-all">
                        <Edit size={18} />
                      </button>
                    )}
                    <button
                      className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition-all"
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: product.name,
                              text: product.tagline,
                              url: window.location.href,
                            })
                            .catch((err) =>
                              console.error("Error sharing:", err)
                            );
                        } else {
                          // Fallback copy to clipboard
                          navigator.clipboard.writeText(window.location.href);
                          showToast("success", "Link copied to clipboard");
                        }
                      }}
                    >
                      <Share2 size={18} />
                    </button>
                    <div className="relative">
                      <button
                        className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Dropdown menu */}
                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 w-44 z-50"
                          >
                            <ul className="py-2">
                              <li className="px-4 py-2 hover:bg-violet-50 text-gray-700 cursor-pointer text-sm flex items-center">
                                <Eye size={15} className="mr-2 opacity-70" />
                                <span>Watch updates</span>
                              </li>
                              <li className="px-4 py-2 hover:bg-violet-50 text-gray-700 cursor-pointer text-sm flex items-center">
                                <MessageSquare
                                  size={15}
                                  className="mr-2 opacity-70"
                                />
                                <span>Send message</span>
                              </li>
                              <li className="px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer text-sm flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                  <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                                <span>Report product</span>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Product Image Section */}
              <motion.div
                className="md:w-1/2 relative h-72 md:h-auto overflow-hidden"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-violet-100/30 backdrop-blur-sm"></div>
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={product.name}
                    fill
                    className="object-cover z-10 brightness-[1.02] saturate-[1.05]"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 z-10">
                    <div className="text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto text-violet-300 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-violet-500 font-medium">
                        No image available
                      </p>
                    </div>
                  </div>
                )}

                {/* Pricing Badge */}
                {product.pricing && (
                  <div className="absolute top-6 right-6 z-20">
                    {product.pricing.type === "free" && (
                      <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-xl font-medium shadow-sm border border-green-200">
                        Free
                      </span>
                    )}
                    {product.pricing.type === "paid" && (
                      <span className="inline-block bg-violet-100 text-violet-800 px-4 py-2 rounded-xl font-medium shadow-sm border border-violet-200">
                        {product.pricing.currency || "$"}
                        {product.pricing.amount}
                      </span>
                    )}
                    {product.pricing.type === "contact" && (
                      <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-medium shadow-sm border border-blue-200">
                        Contact for Pricing
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Links and Maker Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Quick Links */}
            <motion.div
              variants={fadeInUp}
              className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="font-medium text-lg text-gray-800 mb-4">
                Quick Links
              </h2>
              <div className="flex flex-wrap gap-3">
                {product.links?.website && (
                  <motion.a
                    href={product.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <ExternalLink size={18} />
                    <span className="font-medium">Visit Website</span>
                  </motion.a>
                )}
                {product.links?.demo && (
                  <motion.a
                    href={product.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <Play size={18} className="text-violet-600" />
                    <span className="font-medium">Try Demo</span>
                  </motion.a>
                )}
                {product.links?.github && (
                  <motion.a
                    href={product.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <GitHub size={18} className="text-violet-600" />
                    <span className="font-medium">GitHub</span>
                  </motion.a>
                )}
                {product.links?.appStore && (
                  <motion.a
                    href={product.links.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 text-violet-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span className="font-medium">App Store</span>
                  </motion.a>
                )}
                {product.links?.playStore && (
                  <motion.a
                    href={product.links.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 text-violet-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 20.5l-.16-.03L15 13l-10-7.5v15zM5 3l14 9-14 9V3zm6.5 4.8l8.65 5.7-2.65 2.45-6-8.15zm7.45 6.95l-6.45 8.75-1.2-1.55 4.18-7.2 3.47 0z" />
                    </svg>
                    <span className="font-medium">Play Store</span>
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Maker Profile */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="font-medium text-lg text-gray-800 mb-4">
                Created By
              </h2>
              {product.maker && (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex items-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm group transition-all"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-white shadow-md group-hover:shadow-lg transition-all">
                    {product.maker.profilePicture?.url ? (
                      <Image
                        src={product.maker.profilePicture.url}
                        alt={`${product.maker.firstName || ""} ${
                          product.maker.lastName || ""
                        }`}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.classList.add(
                            "bg-gradient-to-br",
                            "from-violet-500",
                            "to-indigo-600",
                            "flex",
                            "items-center",
                            "justify-center",
                            "text-white",
                            "text-xl",
                            "font-semibold"
                          );
                          e.target.parentNode.innerText = product.maker
                            .firstName
                            ? product.maker.firstName.charAt(0).toUpperCase()
                            : "M";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                        {product.maker.firstName
                          ? product.maker.firstName.charAt(0).toUpperCase()
                          : "M"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {product.maker.firstName
                        ? `${product.maker.firstName} ${
                            product.maker.lastName || ""
                          }`
                        : product.makerProfile?.name || "Maker"}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {product.maker.bio ||
                        product.makerProfile?.title ||
                        "Product Creator"}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden"
          >
            <div className="border-b border-gray-100">
              <div className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === "overview"
                      ? "text-violet-700 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-violet-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === "features"
                      ? "text-violet-700 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-violet-700"
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === "gallery"
                      ? "text-violet-700 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-violet-700"
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === "discussion"
                      ? "text-violet-700 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-violet-700"
                  }`}
                >
                  Discussion
                  {commentCount > 0 && (
                    <span className="ml-2 bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-xs">
                      {commentCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="prose prose-gray max-w-none">
                      <div
                        className={`relative ${
                          isDescriptionExpanded
                            ? ""
                            : "max-h-72 overflow-hidden"
                        }`}
                      >
                        <div className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                          {product.description || "No description provided."}
                        </div>

                        {!isDescriptionExpanded &&
                          product.description &&
                          product.description.length > 300 && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                          )}
                      </div>

                      {product.description &&
                        product.description.length > 300 && (
                          <button
                            onClick={() =>
                              setIsDescriptionExpanded(!isDescriptionExpanded)
                            }
                            className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors font-medium mt-2"
                          >
                            {isDescriptionExpanded ? "Show less" : "Read more"}
                            <ChevronDown
                              size={16}
                              className={`transform transition-transform ${
                                isDescriptionExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                    </div>

                    {/* Key Insights */}
                    <div className="mt-8 grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                          <Tag size={16} className="text-violet-600" />
                          <span>Category</span>
                        </div>
                        <p className="text-gray-600">
                          {product.categoryName || "General"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                          <Globe size={16} className="text-violet-600" />
                          <span>Status</span>
                        </div>
                        <p className="text-gray-600">
                          {product.status || "Published"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 font-medium text-gray-800 mb-2">
                          <BarChart size={16} className="text-violet-600" />
                          <span>Trending Score</span>
                        </div>
                        <p className="text-gray-600">
                          {product.trendingScore
                            ? product.trendingScore.toFixed(4)
                            : "0.0000"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "features" && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {product.tags &&
                        product.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-600">
                                <Star size={20} />
                              </div>
                              <h3 className="font-medium text-gray-900">
                                {tag}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                              This product features {tag.toLowerCase()}{" "}
                              technology.
                            </p>
                          </div>
                        ))}

                      {(!product.tags || product.tags.length === 0) && (
                        <div className="md:col-span-2 text-center p-8">
                          <div className="text-gray-400 mb-3">
                            <Info size={36} className="mx-auto mb-2" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Features Listed
                          </h3>
                          <p className="text-gray-600">
                            This product hasn't listed any specific features
                            yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "gallery" && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.gallery && product.gallery.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {product.gallery.map((image, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.03 }}
                            className="aspect-video relative rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                          >
                            <Image
                              src={
                                typeof image === "string" ? image : image.url
                              }
                              alt={`${product.name} - Image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-gray-400 mb-3">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Gallery Images
                        </h3>
                        <p className="text-gray-600">
                          This product doesn't have any gallery images yet.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "discussion" && (
                  <motion.div
                    key="discussion"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CommentSection
                      productSlug={product.slug}
                      productId={product._id}
                      isAuthenticated={isAuthenticated}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Similar Products Section */}
          {product && product._id && (
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Similar Products
                </h2>
                <button className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center gap-1 group">
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <SimilarProductsSection
                productId={product._id}
                limit={3}
                tags={product.tags}
                category={product.category?.slug}
              />
            </motion.div>
          )}

          {/* Newsletter or Call to Action */}
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-lg p-8 md:p-10 text-white mb-8"
          >
            <div className="md:flex items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-3">
                  Discover more like this
                </h2>
                <p className="text-violet-100 leading-relaxed">
                  Get notified about trending products in{" "}
                  {product.categoryName || "this category"} and other categories
                  that match your interests.
                </p>
              </div>
              <div>
                <button className="px-6 py-3 bg-white text-violet-700 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 w-full justify-center md:w-auto">
                  Browse Category
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* User Feedback Disclaimer */}
          <motion.div
            variants={fadeInUp}
            className="text-center text-sm text-gray-500 mb-8"
          >
            <p>
              Have feedback about this product page?{" "}
              <a
                href="#"
                className="text-violet-600 hover:text-violet-700 underline"
              >
                Let us know
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
