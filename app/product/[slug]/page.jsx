"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "../../../Contexts/Product/ProductContext.js";
import { useAuth } from "../../../Contexts/Auth/AuthContext.js";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext.js";
import { useToast } from "../../../Contexts/Toast/ToastContext";
import LoaderComponent from "../../../Components/UI/LoaderComponent.jsx";
import ViewTracker from "../../../Components/View/ViewTracker.js";
import {
  FiArrowUp,
  FiBookmark,
  FiExternalLink,
  FiGithub,
  FiPlayCircle,
  FiEye,
  FiMessageSquare,
  FiCalendar,
  FiChevronLeft,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import ProductGallery from "./Components/ProductGallery.jsx";
import ProductTabs from "./Components/ProductTabs.jsx";
import CommentSection from "./Components/Comment/CommentSection.jsx";
import ActionButtons from "./Components/ActionButtons.jsx";
import ShareButton from "../../../Components/common/ShareButton.jsx";
import SimilarProductsSection from "./Components/SimilarProductsSection.jsx";

const ProductDetailPage = ({ params }) => {
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

  // Get recommendation context for enhanced similarity recommendations
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

      // Make sure we get the correct upvote count from the data
      const upvoteCount = data.upvotes?.count || 0;
      setUpvoteCount(upvoteCount);

      const commentCount = data.comments?.length || 0;
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

  // Load product only once on mount or when slug changes
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
        // Update with actual server values
        setHasUpvoted(result.upvoted);
        setUpvoteCount(result.upvoteCount);

        // Record upvote interaction for recommendation system
        if (result.upvoted && !prevUpvoted) {
          handleInteraction("upvote");

          // Show success message
          showToast("success", "Product upvoted successfully");
        } else if (!result.upvoted && prevUpvoted) {
          showToast("info", "Upvote removed");
        }
      } else {
        // Revert optimistic update if API call failed
        setHasUpvoted(prevUpvoted);
        setUpvoteCount(prevCount);
        showToast("error", result?.message || "Failed to update vote");
      }
    } catch (error) {
      // Revert optimistic update if an exception occurred
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
        // Record bookmark interaction for recommendation system
        if (!prevBookmarked) {
          handleInteraction("bookmark");
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

  if (loading && !product) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <LoaderComponent message="Loading product details..." />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Error Loading Product
        </h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={handleBackClick}
          className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="container h-screen mx-auto px-4 py-16 text-center flex items-center justify-center">
        <div className="max-w-md flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const thumbnailUrl =
    product?.thumbnail ||
    "https://images.unsplash.com/photo-1742277666303-bbba7fa3fecf?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const isOwner =
    isAuthenticated && user && product && user._id === product.maker._id;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Silent view tracking component */}
      {product && <ViewTracker productId={product._id} source={source} />}

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBackClick}
          className="mb-6 flex items-center text-gray-600 hover:text-violet-700 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/2 relative h-80 md:h-auto">
              <Image
                src={thumbnailUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.status !== "Published" && (
                <div className="absolute top-4 right-4 bg-gray-800 text-white py-1 px-3 rounded-full text-sm">
                  {product.status}
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-1 px-3 rounded-full text-sm font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  Featured
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="mb-3 flex items-center flex-wrap gap-2">
                    <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                      {product.categoryName || "General"}
                    </span>
                    <span className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1 text-gray-400" size={14} />
                      {formattedDate}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name} {product.slug} {product._id}
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    {product.tagline}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <ShareButton
                    url={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/products/${product.slug}`}
                    title={product.name}
                    description={product.tagline}
                  />
                  {isOwner && (
                    <ActionButtons
                      product={product}
                      onRefresh={() => router.refresh()}
                    />
                  )}
                </div>
              </div>

              {product.pricing && (
                <div className="mb-6">
                  {product.pricing.type === "free" && (
                    <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      Free
                    </span>
                  )}
                  {product.pricing.type === "paid" && (
                    <span className="inline-block bg-violet-100 text-violet-800 px-4 py-2 rounded-lg font-medium">
                      {product.pricing.currency || "$"}
                      {product.pricing.amount}
                    </span>
                  )}
                  {product.pricing.type === "contact" && (
                    <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                      Contact for Pricing
                    </span>
                  )}
                </div>
              )}

              {product.links && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {product.links.website && (
                    <a
                      href={product.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                      <FiExternalLink className="text-gray-500" />
                      Website
                    </a>
                  )}
                  {product.links.github && (
                    <a
                      href={product.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                      <FiGithub className="text-gray-500" />
                      GitHub
                    </a>
                  )}
                  {product.links.demo && (
                    <a
                      href={product.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                      <FiPlayCircle className="text-gray-500" />
                      Demo
                    </a>
                  )}
                </div>
              )}

              {product.maker && (
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-white shadow-sm">
                    {product.maker.profilePicture?.url ? (
                      <Image
                        src={product.maker.profilePicture.url}
                        alt={`${product.maker.firstName || ""} ${
                          product.maker.lastName || ""
                        }`}
                        title={`${product.maker.firstName || ""} ${
                          product.maker.lastName || ""
                        }`}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-500 text-lg font-semibold">
                        {product.maker.firstName
                          ? product.maker.firstName.charAt(0).toUpperCase()
                          : "M"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.maker.firstName
                        ? `${product.maker.firstName} ${
                            product.maker.lastName || ""
                          }`
                        : product.makerProfile?.name || "Maker"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.maker.bio || product.makerProfile?.title || ""}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpvote}
                    disabled={isUpvoting}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                      hasUpvoted
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiArrowUp
                      className={
                        hasUpvoted ? "text-violet-600 fill-violet-600" : ""
                      }
                    />
                    <span>{upvoteCount}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                      hasBookmarked
                        ? "bg-violet-100 text-violet-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiBookmark
                      className={
                        hasBookmarked ? "text-violet-600 fill-violet-600" : ""
                      }
                    />
                    <span>{hasBookmarked ? "Saved" : "Save"}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FiEye className="mr-1 text-gray-400" />
                    <strong>{product.views?.count || 0}</strong>
                  </span>
                  <span className="flex items-center">
                    <FiMessageSquare className="mr-1 text-gray-400" />
                    <strong>{commentCount || 0}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {product.gallery && product.gallery.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <ProductGallery
                gallery={product.gallery}
                productName={product.name}
              />
            </div>
          )}

          <div className="p-6 md:p-8 border-t border-gray-100">
            <ProductTabs
              product={product}
              isOwner={isOwner}
              onRefresh={() => router.refresh()}
            />
          </div>
        </div>

        {product && product._id && (
          <SimilarProductsSection productId={product._id} limit={3} />
        )}

        <div className="mt-10">
          <CommentSection
            productSlug={product.slug}
            productId={product._id}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
