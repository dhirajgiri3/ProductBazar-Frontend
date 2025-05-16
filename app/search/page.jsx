"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Loader2,
  Package,
  Briefcase,
  User,
  Folder,
  ChevronDown,
  Info as InfoIcon,
  CheckCircle,
  ArrowUp,
  Bookmark,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { makePriorityRequest } from "@/lib/api/api";
import logger from "@/lib/utils/logger";
import { useAuth } from "@/lib/contexts/auth-context";
import { useCategories } from "@/lib/contexts/category-context";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);
  const [results, setResults] = useState({});
  const [counts, setCounts] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Animation variants for search results
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Fetch search results
  const fetchSearchResults = useCallback(
    async (reset = false) => {
      if (!query.trim()) return;

      setIsLoading(true);
      try {
        const currentPage = reset ? 1 : page;

        const response = await makePriorityRequest("get", "/search", {
          params: {
            q: query,
            type: activeTab,
            page: currentPage,
            limit: 10,
            natural_language: true, // Use natural language search for better relevance
            ...filters,
          },
        });

        if (response.data.success) {
          const newResults = response.data.results || {};

          // If resetting or first page, replace results
          // Otherwise append to existing results
          if (reset || currentPage === 1) {
            setResults(newResults);
          } else {
            // Merge new results with existing ones
            const mergedResults = { ...results };
            Object.keys(newResults).forEach((type) => {
              if (mergedResults[type]) {
                mergedResults[type] = [
                  ...mergedResults[type],
                  ...(newResults[type] || []),
                ];
              } else {
                mergedResults[type] = newResults[type] || [];
              }
            });
            setResults(mergedResults);
          }

          setCounts(response.data.counts || {});
          setTotalResults(response.data.totalResults || 0);

          // Check if there are more results to load
          const currentCount = Object.values(newResults).reduce(
            (sum, items) => sum + (items?.length || 0),
            0
          );
          setHasMore(currentCount >= 10);

          // Update page
          if (!reset) {
            setPage(currentPage + 1);
          } else {
            setPage(2);

            // If we're on the 'all' tab and this is the initial search,
            // suggest the most relevant tab
            if (activeTab === 'all' && query.trim()) {
              const relevantTab = getMostRelevantTab();
              if (relevantTab !== 'all') {
                // Don't automatically switch tabs, but highlight the most relevant one
                // This is a visual cue for the user
                const tabButton = document.querySelector(`button[data-tab="${relevantTab}"]`);
                if (tabButton) {
                  tabButton.classList.add('animate-pulse', 'bg-violet-50');
                  setTimeout(() => {
                    tabButton.classList.remove('animate-pulse', 'bg-violet-50');
                  }, 2000);
                }
              }
            }
          }
        } else {
          // Handle unsuccessful response
          toast.error(
            response.data.error || "Search failed. Please try again."
          );
          setResults({});
          setCounts({});
          setTotalResults(0);
        }
      } catch (error) {
        logger.error("Error fetching search results:", error);
        toast.error("Search failed. Please try again later.");
        setResults({});
        setCounts({});
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    [query, activeTab, page, filters]
  );

  // Initial search when component mounts or query/tab changes
  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults(true);
    } else {
      setResults({});
      setCounts({});
      setTotalResults(0);
    }
  }, [query, activeTab]);

  // Determine the most relevant tab based on search results
  const getMostRelevantTab = useCallback(() => {
    if (!counts || Object.keys(counts).length === 0) return 'all';

    // If we're searching for a user name, prioritize the users tab
    const userNamePattern = /^[a-z]+(\s[a-z]+)?$/i;
    if (userNamePattern.test(query.trim()) && counts.users > 0) {
      return 'users';
    }

    // Find the tab with the most results
    const tabCounts = {
      products: counts.products || 0,
      users: counts.users || 0,
      jobs: counts.jobs || 0,
      projects: counts.projects || 0
    };

    // Sort tabs by count (descending)
    const sortedTabs = Object.entries(tabCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return sortedTabs[0] || 'all';
  }, [counts, query]);

  // Fetch categories when component mounts
  useEffect(() => {
    // Fetch categories for the filter dropdown
    fetchCategories();
  }, [fetchCategories]);

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchSearchResults(true);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Calculate relevance score for each result type based on query
  const calculateTypeRelevance = (type, searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return 0;

    const query = searchQuery.trim().toLowerCase();
    let relevanceScore = 0;

    // Base relevance from result count (0-5 points)
    const count = counts[type] || 0;
    relevanceScore += Math.min(count / 10, 5);

    // Check if query directly matches type name (10 points)
    if (type.toLowerCase().includes(query) || query.includes(type.toLowerCase())) {
      relevanceScore += 10;
    }

    // Type-specific relevance factors
    switch (type) {
      case 'products':
        // Products get priority for product-related terms
        if (['product', 'app', 'tool', 'software', 'service', 'platform'].some(term =>
          query.includes(term) || term.includes(query))) {
          relevanceScore += 15;
        }
        break;

      case 'jobs':
        // Jobs get priority for job-related terms
        if (['job', 'career', 'work', 'position', 'employment', 'hire', 'hiring'].some(term =>
          query.includes(term) || term.includes(query))) {
          relevanceScore += 15;
        }
        break;

      case 'projects':
        // Projects get priority for project-related terms
        if (['project', 'portfolio', 'showcase', 'demo', 'prototype'].some(term =>
          query.includes(term) || term.includes(query))) {
          relevanceScore += 15;
        }
        break;

      case 'users':
        // Users get priority for name patterns and user-related terms
        const namePattern = /^[a-z]+(\s[a-z]+)?$/i;
        if (namePattern.test(query)) {
          // Only boost if there are actual user results
          if (count > 0) {
            relevanceScore += 15;
          }
        }
        if (['user', 'person', 'people', 'maker', 'creator', 'developer'].some(term =>
          query.includes(term) || term.includes(query))) {
          relevanceScore += 10;
        }
        break;
    }

    return relevanceScore;
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    // If value is empty, remove the filter
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    fetchSearchResults(true);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setShowFilters(false);
    fetchSearchResults(true);
  };

  // Load more results
  const loadMore = () => {
    fetchSearchResults();
  };

  // Render result items by type
  const renderResultItems = (type) => {
    const items = results[type] || [];
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
          {type}
        </h2>
        <div className="space-y-4">
          {items.map((item) => {
            switch (type) {
              case "products":
                return <ProductResultItem key={item._id} product={item} query={query} />;
              case "jobs":
                return <JobResultItem key={item._id} job={item} query={query} />;
              case "projects":
                return <ProjectResultItem key={item._id} project={item} query={query} />;
              case "users":
                return <UserResultItem key={item._id} user={item} query={query} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across products, jobs, projects and more..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 bg-white text-gray-800"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border ${
                Object.keys(filters).length > 0
                  ? "border-violet-500 text-violet-600 bg-violet-50"
                  : "border-gray-200 text-gray-600 bg-white"
              } rounded-xl font-medium flex items-center`}
            >
              <Filter size={18} className="mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset all
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dynamic filters based on active tab */}
                {(activeTab === "all" || activeTab === "products") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Category
                    </label>
                    <div className="relative">
                      {categoriesLoading ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        </div>
                      ) : null}
                      <select
                        value={filters.category || ""}
                        onChange={(e) =>
                          handleFilterChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        disabled={categoriesLoading}
                      >
                        <option value="">All Categories</option>
                        {categories && categories.length > 0 ? (
                          categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))
                        ) : !categoriesLoading ? (
                          <option value="" disabled>
                            No categories found
                          </option>
                        ) : null}
                      </select>
                    </div>
                  </div>
                )}

                {(activeTab === "all" || activeTab === "jobs") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Type
                      </label>
                      <select
                        value={filters.jobType || ""}
                        onChange={(e) =>
                          handleFilterChange("jobType", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location Type
                      </label>
                      <select
                        value={filters.locationType || ""}
                        onChange={(e) =>
                          handleFilterChange("locationType", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                      >
                        <option value="">All Locations</option>
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </>
                )}

                {(activeTab === "all" || activeTab === "users") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role
                    </label>
                    <select
                      value={filters.role || ""}
                      onChange={(e) =>
                        handleFilterChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">All Roles</option>
                      <option value="maker">Maker</option>
                      <option value="investor">Investor</option>
                      <option value="jobSeeker">Job Seeker</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-600 font-medium mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}

          {/* Search Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              data-tab="all"
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "all"
                  ? "text-violet-600 border-b-2 border-violet-600"
                  : "text-gray-600 hover:text-violet-600"
              }`}
              onClick={() => handleTabChange("all")}
            >
              All
              {counts.all > 0 && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                  {totalResults}
                </span>
              )}
            </button>

            {/* Fixed order tabs with icons */}
            {[
              { id: 'products', count: counts.products || 0, label: "Products", icon: <Package size={14} className="mr-1" /> },
              { id: 'jobs', count: counts.jobs || 0, label: "Jobs", icon: <Briefcase size={14} className="mr-1" /> },
              { id: 'projects', count: counts.projects || 0, label: "Projects", icon: <Folder size={14} className="mr-1" /> },
              { id: 'users', count: counts.users || 0, label: "Users", icon: <User size={14} className="mr-1" /> }
            ].map((tabInfo) => (
                <button
                  key={tabInfo.id}
                  data-tab={tabInfo.id}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tabInfo.id
                      ? "text-violet-600 border-b-2 border-violet-600"
                      : "text-gray-600 hover:text-violet-600"
                  }`}
                  onClick={() => handleTabChange(tabInfo.id)}
                >
                  <div className="flex items-center">
                    {tabInfo.icon}
                    {tabInfo.label}
                    {tabInfo.count > 0 && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                        {tabInfo.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-violet-600 mr-2" />
            <span className="text-gray-600 text-lg">Searching...</span>
          </div>
        ) : query && totalResults === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No results found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              We couldn't find any matches for "{query}". Try different keywords
              or check your spelling.
            </p>

            {/* Spelling suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    setQuery("product");
                    fetchSearchResults(true);
                  }}
                  className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 rounded-full text-sm font-medium transition-colors inline-flex items-center"
                >
                  product
                </button>
                <button
                  onClick={() => {
                    setQuery(query.toLowerCase());
                    fetchSearchResults(true);
                  }}
                  className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 rounded-full text-sm font-medium transition-colors inline-flex items-center"
                >
                  {query.toLowerCase()}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Show results based on active tab */}
            {activeTab === "all" ? (
              <>
                {/* Order sections by relevance */}
                {Object.entries({
                  products: { type: 'products', count: counts.products || 0, relevance: calculateTypeRelevance('products', query) },
                  jobs: { type: 'jobs', count: counts.jobs || 0, relevance: calculateTypeRelevance('jobs', query) },
                  projects: { type: 'projects', count: counts.projects || 0, relevance: calculateTypeRelevance('projects', query) },
                  users: { type: 'users', count: counts.users || 0, relevance: calculateTypeRelevance('users', query) }
                })
                  .filter(([_, info]) => info.count > 0) // Only show types with results
                  .sort((a, b) => {
                    // Sort by relevance score first (higher is better)
                    if (b[1].relevance !== a[1].relevance) {
                      return b[1].relevance - a[1].relevance;
                    }
                    // If relevance is the same, sort by count
                    return b[1].count - a[1].count;
                  })
                  .map(([_, info]) => renderResultItems(info.type))}
              </>
            ) : (
              renderResultItems(activeTab)
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More Results"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Result item components
// Define item variants for animations
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ProductResultItem = ({ product, query }) => {
  // Access categories from context
  const { categories } = useCategories();
  // Generate relevance badge based on search relevance data from backend
  const getRelevanceBadge = () => {
    if (!query || !query.trim()) return null;

    // Use the search relevance data from the backend if available
    if (product.searchRelevance) {
      const { primaryMatchReason } = product.searchRelevance;

      // Show exact match badge if available (highest priority)
      if (product.name && product.name.toLowerCase() === query.toLowerCase()) {
        return (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-700 text-white rounded text-xs font-medium">
            Exact match
          </div>
        );
      }

      // Show fuzzy match badge if this was a spelling correction match
      if (product.fuzzyMatch) {
        return (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
            Similar match
          </div>
        );
      }

      switch (primaryMatchReason) {
        case 'name':
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
              Name match
            </div>
          );
        case 'tag':
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
              Tag match
            </div>
          );
        case 'category':
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Category match
            </div>
          );
        case 'tagline':
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              Tagline match
            </div>
          );
        case 'description':
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
              Description match
            </div>
          );
        default:
          return (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              Relevant match
            </div>
          );
      }
    }

    // Fallback to client-side relevance detection if backend data is not available
    const queryLower = query.toLowerCase();

    // Check for exact name match (highest relevance)
    if (product.name && product.name.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
          Name match
        </div>
      );
    }

    // Check for tag match (high relevance)
    if (product.tags && product.tags.some(tag =>
      tag && typeof tag === 'string' &&
      (tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase()))
    )) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          Tag match
        </div>
      );
    }

    // Check for category match
    if (product.categoryName && product.categoryName.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          Category match
        </div>
      );
    }

    // Default relevance
    return (
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
        Relevant match
      </div>
    );
  };

  // Format pricing information
  const formatPricing = () => {
    if (!product.pricing) return 'Free';

    const { type, amount, currency } = product.pricing;

    switch (type) {
      case 'free':
        return 'Free';
      case 'paid':
        return `${currency} ${amount}`;
      case 'subscription':
        return `${currency} ${amount}/${product.pricing.interval || 'month'}`;
      case 'freemium':
        return 'Freemium';
      case 'contact':
        return 'Contact for pricing';
      default:
        return 'Free';
    }
  };

  // Format maker name
  const getMakerName = () => {
    if (product.makerDetails && product.makerDetails[0]) {
      const maker = product.makerDetails[0];
      return maker.firstName && maker.lastName
        ? `${maker.firstName} ${maker.lastName}`
        : maker.username;
    }
    return 'Unknown maker';
  };

  // Get category name from category ID
  const getCategoryName = () => {
    // If categoryName is already provided in the product data, use it
    if (product.categoryName) {
      return product.categoryName;
    }

    // Otherwise, look up the category name from the categories context
    if (product.category && categories && categories.length > 0) {
      const category = categories.find(cat => cat._id === product.category);
      return category ? category.name : 'Uncategorized';
    }

    return 'Uncategorized';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow relative"
    >
      <Link
        href={`/product/${product.slug}`}
        className="flex md:flex-row flex-col h-full"
      >
        <div className="md:w-48 w-full h-48 md:h-auto flex-shrink-0 bg-gray-100 relative">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package size={48} />
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              Featured
            </div>
          )}
        </div>

        <div className="p-6 flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-gray-900 pr-2">
              {product.name}
            </h3>
            <span className="text-sm text-gray-500 whitespace-nowrap">{formatPricing()}</span>
          </div>

          <p className="text-gray-500 mb-2 line-clamp-2">{product.tagline}</p>

          {/* Explanation text */}
          {product.explanationText && (
            <p className="text-xs text-violet-600 mb-3 italic">
              <InfoIcon size={12} className="inline mr-1" />
              {product.explanationText}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags &&
              product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
          </div>

          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-2 gap-y-1">
            {/* Engagement metrics */}
            <span className="flex items-center">
              <ArrowUp size={16} className="mr-1" />
              {product.upvoteCount || 0}
            </span>

            {product.bookmarks !== undefined && (
              <span className="flex items-center">
                <Bookmark size={16} className="mr-1" />
                {product.bookmarkCount || 0}
              </span>
            )}

            {product.views && product.views.count && (
              <span className="flex items-center">
                <Eye size={16} className="mr-1" />
                {product.views.count}
              </span>
            )}

            <span className="mx-2">•</span>

            {/* Category */}
            <span>{getCategoryName()}</span>

            <span className="mx-2">•</span>

            {/* Maker */}
            <span className="flex items-center">
              by {getMakerName()}
            </span>

            {/* Launch date if available */}
            {product.launchedAt && (
              <>
                <span className="mx-2">•</span>
                <span>Launched {formatDate(product.launchedAt)}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Relevance badge */}
      {getRelevanceBadge()}

    </motion.div>
  );
};

const JobResultItem = ({ job, query }) => {
  // Generate relevance badge based on job data and search query
  const getRelevanceBadge = () => {
    if (!query || !query.trim()) return null;

    const queryLower = query.toLowerCase();

    // Check for title match (highest relevance)
    if (job.title && job.title.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
          Title match
        </div>
      );
    }

    // Check for skills match (high relevance)
    if (job.skills && job.skills.some(skill =>
      skill && typeof skill === 'string' &&
      (skill.toLowerCase().includes(queryLower) || queryLower.includes(skill.toLowerCase()))
    )) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          Skill match
        </div>
      );
    }

    // Check for company match
    if (job.company?.name && job.company.name.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          Company match
        </div>
      );
    }

    // Default relevance
    return (
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
        Relevant match
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow relative"
    >
      <Link href={`/jobs/${job._id}`} className="block p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            {job.companyDetails?.[0]?.profilePicture ? (
              <img
                src={job.companyDetails[0].profilePicture}
                alt={job.company?.name || "Company"}
                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Briefcase size={24} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 mb-2">
              {job.company?.name || job.companyDetails?.[0]?.name || "Company"}
            </p>

            {/* Explanation text */}
            {job.explanationText && (
              <p className="text-xs text-violet-600 mb-3 italic">
                <InfoIcon size={12} className="inline mr-1" />
                {job.explanationText}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {job.jobType}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                {job.locationType}
              </span>
              {job.experienceLevel && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {job.experienceLevel}
                </span>
              )}
            </div>
            {job.skills && (
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Relevance badge */}
      {getRelevanceBadge()}

    </motion.div>
  );
};

const ProjectResultItem = ({ project, query }) => {
  // Generate relevance badge based on project data and search query
  const getRelevanceBadge = () => {
    if (!query || !query.trim()) return null;

    const queryLower = query.toLowerCase();

    // Check for title match (highest relevance)
    if (project.title && project.title.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
          Title match
        </div>
      );
    }

    // Check for technology match (high relevance)
    if (project.technologies && project.technologies.some(tech =>
      tech && typeof tech === 'string' &&
      (tech.toLowerCase().includes(queryLower) || queryLower.includes(tech.toLowerCase()))
    )) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          Tech match
        </div>
      );
    }

    // Check for description match
    if (project.description && project.description.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          Description match
        </div>
      );
    }

    // Default relevance
    return (
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
        Relevant match
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow relative"
    >
      <Link
        href={`/project/${project._id}`}
        className="flex md:flex-row flex-col h-full"
      >
        <div className="md:w-48 w-full h-48 md:h-auto flex-shrink-0 bg-gray-100">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Folder size={48} />
            </div>
          )}
        </div>
        <div className="p-6 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.title}
          </h3>
          <p className="text-gray-500 mb-2 line-clamp-2">{project.description}</p>

          {/* Explanation text */}
          {project.explanationText && (
            <p className="text-xs text-violet-600 mb-3 italic">
              <InfoIcon size={12} className="inline mr-1" />
              {project.explanationText}
            </p>
          )}
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 5).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <span>{project.categoryName}</span>
            {project.ownerDetails && project.ownerDetails[0] && (
              <>
                <span className="mx-2">•</span>
                <span>by {project.ownerDetails[0].name}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Relevance badge */}
      {getRelevanceBadge()}

    </motion.div>
  );
};

const UserResultItem = ({ user, query }) => {
  // Generate relevance badge based on user data and search query
  const getRelevanceBadge = () => {
    if (!query || !query.trim()) return null;

    const queryLower = query.toLowerCase();
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();

    // Check for username match (highest relevance)
    if (user.username && user.username.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
          Username match
        </div>
      );
    }

    // Check for first name match (high relevance)
    if (user.firstName && user.firstName.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          First name match
        </div>
      );
    }

    // Check for last name match (high relevance)
    if (user.lastName && user.lastName.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          Last name match
        </div>
      );
    }

    // Check for full name match
    if (fullName && fullName.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          Full name match
        </div>
      );
    }

    // Check for role match
    if (user.role && user.role.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
          Role match
        </div>
      );
    }

    // Check for company match
    if (user.companyName && user.companyName.toLowerCase().includes(queryLower)) {
      return (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
          Company match
        </div>
      );
    }

    // Default relevance
    return (
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
        Relevant match
      </div>
    );
  };

  // Format role name for display
  const formatRole = (role) => {
    if (!role) return '';

    // Convert camelCase to Title Case with spaces
    return role
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow relative hover:shadow-md"
    >
      <Link href={`/${user.username}`} className="block p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            {user.profilePicture && user.profilePicture.url ? (
              <img
                src={user.profilePicture.url}
                alt={user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-500">
                <User size={32} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
              </h3>

              {/* Verification badge if applicable */}
              {user.isVerified && (
                <span className="ml-1 text-blue-500" title="Verified User">
                  <CheckCircle size={16} />
                </span>
              )}
            </div>

            <p className="text-violet-600 font-medium mb-2">@{user.username}</p>

            {user.bio && (
              <p className="text-gray-500 mb-3 line-clamp-2">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {user.role && (
                <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                  {formatRole(user.role)}
                </span>
              )}

              {user.companyName && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                  <Briefcase size={12} className="mr-1" />
                  {user.companyName}
                </span>
              )}

              {user.companyRole && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {user.companyRole}
                </span>
              )}
            </div>

            {/* User explanation text */}
            {user.explanationText && (
              <p className="text-xs text-violet-600 mt-3 italic flex items-center">
                <InfoIcon size={12} className="inline mr-1" />
                {user.explanationText}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Relevance badge */}
      {getRelevanceBadge()}

    </motion.div>
  );
};

export default SearchPage;
