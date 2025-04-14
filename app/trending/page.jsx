"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import TrendingHeader from "./components/TrendingHeader";
import TrendingFilters from "./components/TrendingFilters";
import ProductCard from "./components/ProductCard";
import TrendingStats from "./components/TrendingStats";
import LoaderComponent from "../../Components/UI/LoaderComponent";
// Mock data for trending page
const demoProducts = [
  // Sample product data
  {
    id: 1,
    slug: "ai-copilot-pro",
    name: "AI Copilot Pro",
    tagline: "Your AI-powered programming assistant",
    description: "Helps developers write code faster with real-time suggestions.",
    thumbnail: "https://picsum.photos/seed/ai-copilot-pro/800/500",
    upvotes: 1287,
    hasUpvoted: false,
    featured: true,
    maker: {
      username: "techsmith",
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    tags: ["ai", "developer-tools"],
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    id: 2,
    slug: "startup-finance-os",
    name: "Startup Finance OS",
    tagline: "All-in-one financial management for startups",
    description: "Track expenses, manage investments, and forecast growth.",
    thumbnail: "https://picsum.photos/seed/startup-finance-os/800/500",
    upvotes: 892,
    hasUpvoted: false,
    featured: false,
    maker: {
      username: "finwhiz",
      name: "Michael Roberts",
      avatar: "https://i.pravatar.cc/150?u=michael"
    },
    tags: ["fintech", "saas"],
    createdAt: "2024-01-20T10:00:00Z"
  },
  {
    id: 3,
    slug: "design-hub",
    name: "Design Hub",
    tagline: "Collaborative design for modern teams",
    description: "Streamline your design process with live collaboration.",
    thumbnail: "https://picsum.photos/seed/design-hub/800/500",
    upvotes: 1050,
    hasUpvoted: false,
    featured: true,
    maker: {
      username: "creativedan",
      name: "Danielle Lee",
      avatar: "https://i.pravatar.cc/150?u=danielle"
    },
    tags: ["design", "collaboration"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const demoStats = {
  currentStats: {
    totalProducts: "10,000+",
    activeStartups: "3,200+",
    monthlyUsers: "120K+",
    investorNetwork: "2,000+"
  },
  trending: {
    categories: [
      { name: "AI", growth: "+156%", count: 450 },
      { name: "SaaS", growth: "+89%", count: 380 },
      { name: "Fintech", growth: "+67%", count: 290 },
      { name: "Design", growth: "+45%", count: 270 }
    ]
  }
};
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";

export default function TrendingPage() {
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedProducts, setSavedProducts] = useState(new Set());
  const [stats, setStats] = useState(demoStats);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { user } = useAuth();
  const { toggleUpvote, toggleBookmark } = useProduct();
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      let filteredProducts = [...demoProducts];

      // Updated filtering logic with better date handling
      const now = new Date();
      const timeFilters = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        "all-time": Infinity
      };

      // Category filtering
      if (category !== "all") {
        filteredProducts = filteredProducts.filter(p =>
          p.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
        );
      }

      // Time filtering
      if (filter !== "all-time") {
        filteredProducts = filteredProducts.filter(p => {
          const productDate = new Date(p.createdAt);
          const timeDiff = now.getTime() - productDate.getTime();
          return timeDiff < timeFilters[filter];
        });
      }

      // New: Filter only featured products if toggle enabled
      if (featuredOnly) {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }

      // Sort by featured status first, then upvotes
      filteredProducts.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return b.upvotes - a.upvotes;
      });

      // Compute pagination
      const computedTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
      setTotalPages(computedTotalPages);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newProducts = filteredProducts.slice(startIndex, endIndex);

      if (filteredProducts.length === 0) {
        setError("No products found for the selected filters.");
      }

      setProducts(newProducts);
      setHasMore(endIndex < filteredProducts.length);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [category, filter, page, featuredOnly]);

  const handleRefresh = useCallback(async () => {
    setPage(1);
    await fetchProducts();
  }, [fetchProducts]);

  const handleUpvote = useCallback(async (productId) => {
    try {
      // Find the product by ID
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Optimistic UI update
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const newUpvotes = p.hasUpvoted ? p.upvotes - 1 : p.upvotes + 1;
          return { ...p, upvotes: newUpvotes, hasUpvoted: !p.hasUpvoted };
        }
        return p;
      }));

      // Call the API through ProductContext
      const result = await toggleUpvote(product.slug);

      if (!result.success) {
        // Revert optimistic update if API call failed
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            return { ...p, upvotes: p.hasUpvoted ? p.upvotes + 1 : p.upvotes - 1, hasUpvoted: !p.hasUpvoted };
          }
          return p;
        }));
        toast.error(result.message || "Failed to update vote");
        return;
      }

      toast.success(result.upvoted ? "Product upvoted successfully" : "Upvote removed");
    } catch (error) {
      console.error("Error toggling upvote:", error);
      toast.error("Something went wrong");
    }
  }, [products, toggleUpvote]);

  const handleSave = useCallback(async (productId) => {
    try {
      // Find the product by ID
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Optimistic UI update
      setSavedProducts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });

      // Call the API through ProductContext
      const result = await toggleBookmark(product.slug);

      if (!result.success) {
        // Revert optimistic update if API call failed
        setSavedProducts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(productId)) {
            newSet.delete(productId);
          } else {
            newSet.add(productId);
          }
          return newSet;
        });
        toast.error(result.message || "Failed to update bookmark");
        return;
      }

      toast.success(result.bookmarked ? "Product bookmarked successfully" : "Bookmark removed");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Something went wrong");
    }
  }, [products, toggleBookmark]);

  const handleResetFilters = useCallback(() => {
    setFilter("all-time");
    setCategory("all");
    setFeaturedOnly(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filter, category, page, featuredOnly]);

  useEffect(() => {
    if (inView && hasMore && !loading && !isRefreshing) {
      fetchProducts();
    }
  }, [inView, hasMore, loading, isRefreshing, fetchProducts]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setPage(1);
      setFilter(newFilter);
    }
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory !== category) {
      setPage(1);
      setCategory(newCategory);
    }
  };

  const handleFeaturedToggle = () => {
    setFeaturedOnly(prev => !prev);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-24 pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with enhanced styling */}
          <div className="mb-12">
            <TrendingHeader
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              totalProducts={products.length}
            />
          </div>

          {/* Stats Section with glass effect */}
          <div className="mb-12">
            <div className="backdrop-blur-lg bg-white/30 rounded-2xl p-6 shadow-lg border border-white/20">
              <TrendingStats stats={stats.currentStats} />
            </div>
          </div>

          {/* Filters Section with glass effect */}
          <div className="sticky top-0 z-10 py-4 backdrop-blur-md bg-white/70 border-b border-gray-200/50 shadow-sm">
            <TrendingFilters
              currentFilter={filter}
              currentCategory={category}
              onFilterChange={handleFilterChange}
              onCategoryChange={handleCategoryChange}
              featuredOnly={featuredOnly}
              onFeaturedToggle={handleFeaturedToggle}
              disabled={loading}
            />
          </div>

          {/* Content Section */}
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                error={error}
                onRetry={handleRefresh}
                onReset={handleResetFilters}
              />
            ) : (
              <ProductGrid
                products={products}
                filter={filter}
                category={category}
                savedProducts={savedProducts}
                onUpvote={handleUpvote}
                onSave={handleSave}
                user={user}
              />
            )}
          </AnimatePresence>

          {/* Pagination with enhanced styling */}
          {!loading && !error && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex items-center justify-center space-x-4"
            >
              <PaginationButton
                onClick={handlePrevPage}
                disabled={page === 1}
                direction="prev"
              >
                Previous
              </PaginationButton>

              <span className="px-4 py-2 text-sm text-gray-700 bg-white/50 backdrop-blur-sm rounded-md border border-gray-200/50">
                Page {page} of {totalPages}
              </span>

              <PaginationButton
                onClick={handleNextPage}
                disabled={page === totalPages}
                direction="next"
              >
                Next
              </PaginationButton>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[400px]"
  >
    <LoaderComponent />
    <p className="mt-4 text-gray-600 animate-pulse">
      Discovering trending products...
    </p>
  </motion.div>
);

const ErrorState = ({ error, onRetry, onReset }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[400px]"
  >
    <div className="bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg border border-red-100 text-center max-w-md">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
      <p className="text-sm text-gray-600 mb-6">{error}</p>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  </motion.div>
);

const ProductGrid = ({ products, filter, category, savedProducts, onUpvote, onSave, user }) => (
  <motion.div
    key={`${filter}-${category}`}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    }}
    initial="hidden"
    animate="visible"
    className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  >
    {products.map((product, index) => (
      <ProductCard
        key={`${product.id}-${index}`}
        product={{
          ...product,
          isSaved: savedProducts.has(product.id),
          hasUpvoted: user ? product.hasUpvoted : false
        }}
        index={index}
        onUpvote={onUpvote}
        onSave={onSave}
        isAuthenticated={!!user}
      />
    ))}
  </motion.div>
);

const PaginationButton = ({ children, onClick, disabled, direction }) => (
  <motion.button
    whileHover={!disabled && { scale: 1.05 }}
    whileTap={!disabled && { scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-md text-sm font-medium transition-all
      ${disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white/50 text-gray-700 hover:bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm'
      }
    `}
  >
    {children}
  </motion.button>
);
