import React, { useState, useEffect, useCallback } from "react";
import { useRecommendation } from "../../../../Contexts/Recommendation/RecommendationContext";
import { useProduct } from "../../../../Contexts/Product/ProductContext";
import LoaderComponent from "../../../../Components/ui/LoaderComponent";
import { formatDistanceToNow } from "date-fns";

const ProductCard = ({
  product,
  onUpvote,
  onBookmark,
  recommendationContext,
}) => {
  const [isUpvoted, setIsUpvoted] = useState(product.hasUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(product.upvotes);
  const [isSaved, setIsSaved] = useState(product.isSaved);

  const handleUpvote = async () => {
    const result = await onUpvote(product.slug);
    if (result) {
      setIsUpvoted(result.upvoted);
      setUpvoteCount(result.count);
    }
  };

  const handleBookmark = async () => {
    const result = await onBookmark(product.slug);
    if (result) {
      setIsSaved(result.bookmarked);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="relative w-full h-40 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1742277666303-bbba7fa3fecf?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <a href={`/product/${product.slug}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors duration-200">
            {product.name}
          </h3>
        </a>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.tagline}
        </p>
        {recommendationContext && (
          <p className="text-xs text-gray-400 mt-1 italic">
            {recommendationContext.explanationText}
          </p>
        )}
        <div className="mt-3 flex items-center">
          <img
            src={product.maker.avatar}
            alt={product.maker.name}
            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          <div className="ml-2">
            <a
              href={`/user/${product.maker.username}`}
              className="text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors duration-200"
            >
              {product.maker.name}
            </a>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(product.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors duration-200 ${
                isUpvoted
                  ? "bg-violet-100 text-violet-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={handleUpvote}
            >
              <svg
                className={`w-4 h-4 ${isUpvoted ? "fill-violet-600" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {upvoteCount}
            </button>
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors duration-200 ${
                isSaved
                  ? "bg-violet-100 text-violet-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={handleBookmark}
            >
              <svg
                className={`w-4 h-4 ${isSaved ? "fill-violet-600" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimilarProductsSection = ({ productId, limit = 3 }) => {
  const { getSimilarProducts, handleInteraction } = useRecommendation();
  const { toggleUpvote, toggleBookmark, recordProductInteraction } =
    useProduct();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [contextInsights, setContextInsights] = useState(null);

  const fetchSimilarProducts = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const response = await getSimilarProducts(productId, limit);
      if (response && response.data) {
        const transformedProducts = response.data.map((item) => {
          const product = item.product || item;
          return {
            id: product._id,
            name: product.name || "Unnamed Product",
            slug: product.slug || "",
            thumbnail: product.thumbnail || "https://images.unsplash.com/photo-1742277666303-bbba7fa3fecf?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            tagline: product.tagline || "",
            createdAt: product.createdAt || new Date().toISOString(),
            upvotes: product.views?.count || 0,
            hasUpvoted: product.userInteractions?.hasUpvoted || false,
            isSaved: product.userInteractions?.hasBookmarked || false,
            maker: {
              name: product.maker?.fullName || "Unknown Maker",
              avatar:
                product.maker?.profilePicture?.url || "/default-avatar.png",
              username: product.maker?._id || "unknown",
            },
            recommendationContext: {
              score: item.score,
              explanationText: item.explanationText,
              reason: item.reason,
            },
          };
        });
        setSimilarProducts(transformedProducts);
        setSource(response.meta?.source || "api");
        setContextInsights(response.meta?.contextInsights || null);
        setError(null);

        await recordProductInteraction(productId, "view_similar", {
          source: "similar_section",
        });
      } else {
        throw new Error("Failed to load similar products");
      }
    } catch (error) {
      console.error("Error fetching similar products:", error);
      setError(
        error.message ||
          "Failed to load similar products. Please try again later."
      );
      setSimilarProducts([]);
    } finally {
      setLoading(false);
    }
  }, [productId, limit, getSimilarProducts, recordProductInteraction]);

  useEffect(() => {
    fetchSimilarProducts();
  }, [fetchSimilarProducts]);

  const handleUpvote = useCallback(
    async (slug) => {
      const result = await toggleUpvote(slug);
      if (result) {
        setSimilarProducts((prev) =>
          prev.map((p) =>
            p.slug === slug
              ? { ...p, hasUpvoted: result.upvoted, upvotes: result.count }
              : p
          )
        );
        await handleInteraction(slug, "upvote");
        return result;
      }
      return null;
    },
    [toggleUpvote, handleInteraction]
  );

  const handleBookmark = useCallback(
    async (slug) => {
      const result = await toggleBookmark(slug);
      if (result) {
        setSimilarProducts((prev) =>
          prev.map((p) =>
            p.slug === slug ? { ...p, isSaved: result.bookmarked } : p
          )
        );
        await handleInteraction(slug, "bookmark");
        return result;
      }
      return null;
    },
    [toggleBookmark, handleInteraction]
  );

  if (
    !loading &&
    !error &&
    (!similarProducts || similarProducts.length === 0)
  ) {
    return null;
  }

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
        </div>
        <div className="flex items-center space-x-2">
          {source && !loading && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full animate-fade-in">
              {source === "client-cache"
                ? "From cache"
                : "Latest recommendations"}
            </span>
          )}
          {contextInsights?.commonThemes && (
            <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
              Themes: {contextInsights.commonThemes.join(", ")}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <LoaderComponent message="Finding similar products..." />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">{error}</h3>
          <p className="text-gray-500 text-sm">
            We couldn't load similar products at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpvote={handleUpvote}
              onBookmark={handleBookmark}
              recommendationContext={product.recommendationContext}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarProductsSection;
