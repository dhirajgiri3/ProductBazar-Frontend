import React, { useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Hero from "../../Sections/Hero/Hero";
import LogoSection from "../../Sections/Logos/LogoSection";
import TrendingProducts from "../../Sections/TrendingProducts/TrendingProducts";
import Working from "../../Sections/Working/Working";
import FeatureProducts from "../../Sections/FeatureProducts/FeatureProducts";
import { useProduct } from "../../Contexts/Product/ProductContext";
import { useRecommendation } from "../../Contexts/Recommendation/RecommendationContext";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { toast } from "react-hot-toast";
import logger from "../../Utils/logger";

gsap.registerPlugin(ScrollTrigger);

// ProductCard Component - moved up to avoid reference errors
const ProductCard = ({ product, onUpvote, onBookmark, onClick }) => {
  if (!product) return null;

  const handleUpvoteClick = (e) => {
    e.stopPropagation();
    onUpvote(product.slug);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmark(product.slug);
  };

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg mr-3 relative overflow-hidden">
            <Image
              src={product.thumbnail || "https://avatars.githubusercontent.com/u/14833627?s=64&v=4"}
              alt={product.name || "Product Image"}
              width={48}
              height={48}
              className="object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://avatars.githubusercontent.com/u/14833627?s=64&v=4";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              {product.isNew && (
                <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                  New
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1 mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpvoteClick}
                  className={`flex items-center text-xs ${
                    product.upvotes?.userHasUpvoted
                      ? "text-violet-600"
                      : "text-gray-400 hover:text-violet-600"
                  }`}
                  aria-label={product.upvotes?.userHasUpvoted ? "Remove upvote" : "Upvote"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={product.upvotes?.userHasUpvoted ? "2" : "1.5"}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span>{product.upvotes?.count || 0}</span>
                </button>
                <button
                  onClick={handleBookmarkClick}
                  className={`flex items-center text-xs ${
                    product.bookmarks?.userHasBookmarked
                      ? "text-violet-600"
                      : "text-gray-400 hover:text-violet-600"
                  }`}
                  aria-label={product.bookmarks?.userHasBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill={
                      product.bookmarks?.userHasBookmarked
                        ? "currentColor"
                        : "none"
                    }
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    getTrendingProducts,
    getFeaturedProducts,
    toggleUpvote,
    toggleBookmark,
    searchProducts,
    error: productError,
    loading: productLoading,
  } = useProduct();

  const {
    getFeedRecommendations,
    getNewRecommendations,
    recordInteraction,
  } = useRecommendation();

  // State for all product data
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    sort: "relevance",
    category: "",
    limit: 20,
    page: 1,
    natural_language: true,
  });

  // Update any product in all relevant lists
  const updateProductInAllLists = useCallback((slug, updater) => {
    const updateList = (list) =>
      list.map(product => product.slug === slug ? updater(product) : product);

    setTrendingProducts(updateList(trendingProducts));
    setFeaturedProducts(updateList(featuredProducts));
    setNewProducts(updateList(newProducts));
    setPersonalizedProducts(updateList(personalizedProducts));
    setSearchResults(updateList(searchResults));
  }, [trendingProducts, featuredProducts, newProducts, personalizedProducts, searchResults]);

  // Handle product interactions
  const handleUpvote = useCallback(
    async (slug) => {
      if (!isAuthenticated()) {
        toast.error("Please log in to upvote products");
        return router.push("/auth/login");
      }

      try {
        const result = await toggleUpvote(slug);

        if (result.success) {
          // Update product in all lists
          updateProductInAllLists(slug, (product) => ({
            ...product,
            upvotes: {
              count: result.count,
              userHasUpvoted: result.upvoted,
            },
          }));

          // Record interaction for recommendations
          if (recordInteraction) {
            await recordInteraction(
              slug,
              result.upvoted ? "upvote" : "remove_upvote",
              {
                source: "home",
                previousInteraction: !result.upvoted ? "upvoted" : "none",
              }
            );
          }

          // Show success message
          toast.success(result.upvoted ? "Product upvoted!" : "Upvote removed");

          // Update recommendations if provided
          if (result.recommendations?.length > 0) {
            setPersonalizedProducts((prev) => {
              // Merge new recommendations, avoiding duplicates
              const existingIds = new Set(prev.map((p) => p.id));
              const newRecs = result.recommendations
                .filter((p) => !existingIds.has(p.id))
                .slice(0, 3);
              return [...prev, ...newRecs].slice(0, 12);
            });
          }
        } else {
          toast.error(result.message || "Failed to upvote");
        }
      } catch (error) {
        logger.error("Upvote error:", error);
        toast.error("Something went wrong with your upvote");
      }
    },
    [isAuthenticated, toggleUpvote, recordInteraction, router, updateProductInAllLists]
  );

  const handleBookmark = useCallback(
    async (slug) => {
      if (!isAuthenticated()) {
        toast.error("Please log in to bookmark products");
        return router.push("/auth/login");
      }

      try {
        const result = await toggleBookmark(slug);

        if (result.success) {
          // Update product in all lists
          updateProductInAllLists(slug, (product) => ({
            ...product,
            bookmarks: {
              userHasBookmarked: result.bookmarked,
            },
          }));

          // Record interaction for recommendations
          if (recordInteraction) {
            await recordInteraction(
              slug,
              result.bookmarked ? "bookmark" : "remove_bookmark",
              {
                source: "home",
                previousInteraction: !result.bookmarked ? "bookmarked" : "none",
              }
            );
          }

          toast.success(
            result.bookmarked ? "Product bookmarked!" : "Bookmark removed"
          );
        } else {
          toast.error(result.message || "Failed to bookmark");
        }
      } catch (error) {
        logger.error("Bookmark error:", error);
        toast.error("Something went wrong with your bookmark");
      }
    },
    [isAuthenticated, toggleBookmark, recordInteraction, router, updateProductInAllLists]
  );

  const handleProductClick = useCallback(
    async (slug) => {
      // Record view interaction for recommendations
      if (isAuthenticated()) {
        try {
          await recordInteraction(slug, "view");
        } catch (error) {
          logger.error("Failed to record view interaction", error);
          // Don't stop navigation if recording fails
        }
      }

      // Navigate to product page
      router.push(`/product/${slug}`);
    },
    [isAuthenticated, recordInteraction, router]
  );

  // Fetch search results
  const handleSearch = useCallback(
    async (query, options = {}) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const searchOpts = { ...searchOptions, ...options };
        const results = await searchProducts(query, searchOpts);

        if (results && results.products) {
          setSearchResults(results.products);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        logger.error("Search error:", error);
        toast.error("Failed to search products");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchProducts, searchOptions]
  );

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // Fetch data in parallel for performance
        const results = await Promise.allSettled([
          getTrendingProducts(10),
          getFeaturedProducts(6),
          getNewRecommendations(6),
          isAuthenticated() ? getFeedRecommendations(8) : Promise.resolve([])
        ]);

        // Handle results safely
        const [trending, featured, newProds, personalized] = results;

        if (trending?.status === 'fulfilled') setTrendingProducts(trending.value || []);
        if (featured?.status === 'fulfilled') setFeaturedProducts(featured.value || []);
        if (newProds?.status === 'fulfilled') setNewProducts(newProds.value || []);
        if (personalized?.status === 'fulfilled') setPersonalizedProducts(personalized.value || []);

        // Check for any rejected promises
        const rejectedPromises = results.filter(result => result.status === 'rejected');
        if (rejectedPromises.length > 0) {
          logger.error("Some data fetching failed:", rejectedPromises.map(r => r.reason));
          toast.error("Some content failed to load. Please refresh to try again.");
        }
      } catch (error) {
        logger.error("Error loading home data:", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    getTrendingProducts,
    getFeaturedProducts,
    getNewRecommendations,
    getFeedRecommendations,
    isAuthenticated,
  ]);

  // Show error from product context if there is one
  useEffect(() => {
    if (productError) {
      toast.error(productError);
    }
  }, [productError]);

  // Pass props to child components
  return (
    <div className="min-h-screen">
      <div className="z-[2] relative">
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          handleSearch={handleSearch}
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
          onProductClick={handleProductClick}
        />
      </div>
      <div className="z-[-1] relative">
        <LogoSection />
      </div>
      <FeatureProducts
        products={featuredProducts}
        loading={isLoading || productLoading}
        onUpvote={handleUpvote}
        onBookmark={handleBookmark}
        onProductClick={handleProductClick}
      />
      <TrendingProducts
        products={trendingProducts}
        loading={isLoading || productLoading}
        onUpvote={handleUpvote}
        onBookmark={handleBookmark}
        onProductClick={handleProductClick}
      />
      {personalizedProducts.length > 0 && (
        <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product._id || product.slug || Math.random().toString(36)} // Add safer unique key
                product={product}
                onUpvote={handleUpvote}
                onBookmark={handleBookmark}
                onClick={() => handleProductClick(product.slug)}
              />
            ))}
          </div>
        </div>
      )}
      <Working />
    </div>
  );
};

export default Home;
