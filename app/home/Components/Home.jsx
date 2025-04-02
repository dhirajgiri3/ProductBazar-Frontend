"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Bell,
  ArrowUp,
  MessageCircle,
  TrendingUp,
  Clock,
  User,
  Plus,
  Lightbulb,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import { useCategories } from "../../../Contexts/Category/CategoryContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import HomeProductCard from "./HomeProductCard";
import RecommendationStats from "../../../Components/Recommendation/RecommendationStats";
import Image from "next/image";

export default function Home() {
  const [userType, setUserType] = useState("user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const { getTrendingProducts, toggleUpvote, toggleBookmark } = useProduct();
  const { categories } = useCategories();
  const { getDiversifiedFeed, getUserRecommendations, recordInteraction, getNewProductRecommendations } =
    useRecommendation();

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState([]);
  const [communityPicks, setCommunityPicks] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);

  useEffect(() => {
    if (user && user.role) {
      switch (user.role) {
        case "startupOwner":
          setUserType("startupOwner");
          break;
        case "investor":
          setUserType("investor");
          break;
        case "jobseeker":
          setUserType("jobSeeker");
          break;
        case "freelancer":
          setUserType("freelancer");
          break;
        default:
          setUserType("general");
      }
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
    if (isAuthenticated) loadPersonalizedRecommendations();
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendingData, newProductsData] = await Promise.all([
        loadTrendingProducts(),
        loadNewProducts(),
      ]);
      if (isAuthenticated)
        await Promise.all([
          loadPersonalizedRecommendations(),
          loadCommunityPicks(),
        ]);
      await loadForumThreads();
      if (trendingData) setTrendingProducts(trendingData);
      if (newProductsData) setNewProducts(newProductsData);
    } catch (err) {
      console.error("Error loading home data:", err);
      setError("Failed to load content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingProducts = async () => {
    try {
      const products = await getTrendingProducts(5);
      // Only record impressions for products once loaded and when user is authenticated
      // Move from here to a proper impression tracking mechanism
      return products || [];
    } catch (err) {
      console.error("Error loading trending products:", err);
      setError("Failed to load trending products. Please try again later.");
      return [];
    }
  };

  const loadCommunityPicks = async () => {
    if (!isAuthenticated) {
      setCommunityPicks([]);
      return [];
    }
    try {
      const recommendations = await getUserRecommendations(3);
      const products = recommendations.map((rec) => ({
        ...rec.product,
        score: rec.score,
        reason: rec.reason,
        explanationText: rec.explanationText,
      }));

      // Remove impression tracking from data loading
      setCommunityPicks(products || []);
      return products || [];
    } catch (err) {
      console.error("Error loading community picks:", err);
      setCommunityPicks([]);
      return [];
    }
  };

  const loadNewProducts = async () => {
    try {
      const recommendations = await getNewProductRecommendations(3);
      
      // Process the response structure - extract products from recommendations
      const products = recommendations.map(rec => ({
        ...rec.product,  // Extract the product data
        score: rec.score,
        reason: rec.reason,
        explanationText: rec.explanationText
      }));

      // Remove impression tracking from data loading
      return products || [];
    } catch (err) {
      console.error("Error loading new products:", err);
      return [];
    }
  };

  const loadPersonalizedRecommendations = async () => {
    if (!isAuthenticated) {
      setPersonalizedRecommendations([]);
      return [];
    }
    try {
      const recommendations = await getUserRecommendations(3);
      // Extract the product data from each recommendation
      const products = recommendations.map((rec) => ({
        ...rec.product,
        score: rec.score,
        reason: rec.reason,
        explanationText: rec.explanationText,
      }));

      // Remove impression tracking from data loading
      setPersonalizedRecommendations(products || []);
      return products || [];
    } catch (err) {
      console.error("Error loading personalized recommendations:", err);
      setPersonalizedRecommendations([]);
      return [];
    }
  };

  const loadForumThreads = async () => {
    setForumThreads([]);
    return [];
  };

  const handleUpvote = async (product) => {
    if (!isAuthenticated) return (window.location.href = "/auth/login");
    await toggleUpvote(product.slug);
    if (recordInteraction) recordInteraction(product._id, "upvote");
  };

  const handleBookmark = async (product) => {
    if (!isAuthenticated) return (window.location.href = "/auth/login");
    await toggleBookmark(product.slug);
    if (recordInteraction) recordInteraction(product._id, "bookmark");
  };

  const heroContent = {
    general: {
      headline: "Discover Innovative Products & Ideas",
      subheadline: "Explore a curated marketplace...",
    },
    freelancer: {
      headline: "Find the Right Tools & Your Next Opportunity",
      subheadline: "Access essential tools...",
    },
    jobSeeker: {
      headline: "Unlock Your Potential at Leading Startups",
      subheadline: "Browse job openings...",
    },
    investor: {
      headline: "Discover the Next Big Thing: Invest in Promising Startups",
      subheadline: "Identify high-growth...",
    },
    startupOwner: {
      headline: "Showcase Your Innovation & Grow Your Business",
      subheadline: "Reach a passionate community...",
    },
  };

  // Helper function to safely render text
  const safeRender = (value, fallback = "") => {
    if (typeof value === "string") return value;
    if (value?.name && typeof value.name === "string") return value.name;
    return fallback;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-8 text-white shadow-sm mb-8">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold mb-3">
                  {heroContent[userType]?.headline ||
                    heroContent.general.headline}
                </h1>
                <p className="text-lg opacity-90 mb-6">
                  {heroContent[userType]?.subheadline ||
                    heroContent.general.subheadline}
                </p>
                <div className="relative">
                  <div className="flex items-center bg-white rounded-full shadow-sm">
                    <Search size={18} className="text-gray-400 ml-4" />
                    <input
                      type="text"
                      placeholder="Search for products, startups, skills, jobs..."
                      className="flex-1 py-3 px-3 bg-transparent border-none focus:outline-none text-gray-800 text-sm"
                    />
                    <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full py-2 px-5 mr-1 text-sm font-medium transition-colors">
                      Search
                    </button>
                  </div>
                  <p className="text-sm mt-2 opacity-80">
                    Explore AI, SaaS, Design, and more.
                  </p>
                </div>
              </div>
            </section>

            {/* Trending Products */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 text-violet-600 mr-2" /> Top
                Products Launching Today
              </h2>
              {loading ? (
                <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={`loading-trend-${index}`}
                      className={`${
                        index > 1 ? "border-t border-gray-100 pt-4" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-4 bg-gray-200 rounded mt-1"></div>
                        <div className="w-12 h-12 rounded-lg mr-4 bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="flex space-x-3">
                              <div className="h-3 bg-gray-200 rounded w-6"></div>
                              <div className="h-3 bg-gray-200 rounded w-6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                  {error}
                </div>
              ) : (
                <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
                  {trendingProducts.length > 0 ? (
                    trendingProducts.map((product, index) => (
                      <div
                        key={`trend-${product._id || index}`}
                        className={`${
                          index > 0 ? "border-t border-gray-100 pt-4" : ""
                        }`}
                      >
                        <ProductListItem product={product} rank={index + 1} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No trending products available at the moment.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Personalized Recommendations */}
            {isAuthenticated ? (
              <section className="mt-12">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <Lightbulb className="w-6 h-6 text-violet-600 mr-2" />{" "}
                      Just For You
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      Based on your activity and interests
                    </p>
                  </div>
                  <Link
                    href="/recommendations"
                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                  >
                    See More →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={`loading-rec-${i}`}
                          className="bg-white rounded-lg shadow-sm h-48 animate-pulse border border-gray-100"
                        >
                          <div className="p-4">
                            <div className="flex items-start">
                              <div className="w-12 h-12 rounded-lg mr-3 bg-gray-200"></div>
                              <div className="flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                                <div className="flex justify-between items-center">
                                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                  <div className="flex space-x-3">
                                    <div className="h-3 bg-gray-200 rounded w-6"></div>
                                    <div className="h-3 bg-gray-200 rounded w-6"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : personalizedRecommendations.length > 0 ? (
                    personalizedRecommendations.map((recommendation, index) => (
                      <HomeProductCard
                        key={`rec-${recommendation._id || index}`}
                        product={recommendation}
                        onUpvote={handleUpvote}
                        onBookmark={handleBookmark}
                        recommendationType="personalized"
                        position={index}
                        source={"personalized"}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 bg-white rounded-xl p-6 shadow-sm">
                      <Lightbulb className="w-10 h-10 text-violet-300 mx-auto mb-2" />
                      <p className="text-gray-600 mb-3">
                        We're building your personalized recommendations
                      </p>
                      <p className="text-gray-500 text-sm max-w-lg mx-auto">
                        Explore and interact with more products to help us
                        understand your interests better.
                      </p>
                      <Link
                        href="/products"
                        className="inline-block mt-4 bg-violet-100 text-violet-700 hover:bg-violet-200 px-4 py-2 rounded-full text-sm transition-colors"
                      >
                        Discover Products
                      </Link>
                    </div>
                  )}
                </div>
                {personalizedRecommendations.length > 0 && (
                  <div className="mt-4">
                    <RecommendationStats />
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-6 shadow-sm mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2 flex items-center">
                      <ThumbsUp className="w-5 h-5 text-violet-600 mr-2" /> Get
                      Personalized Recommendations
                    </h2>
                    <p className="text-gray-600">
                      Sign in to discover products tailored to your interests
                      and preferences
                    </p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </section>
            )}

            {/* New Products */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <Clock size={20} className="text-violet-600 mr-2" /> New &
                    Noteworthy
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Discover the freshest innovations
                  </p>
                </div>
                <Link
                  href="/new"
                  className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                >
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`loading-new-${i}`}
                        className="bg-white rounded-lg shadow-sm h-48 animate-pulse border border-gray-100"
                      >
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="w-12 h-12 rounded-lg mr-3 bg-gray-200"></div>
                            <div className="flex-1 min-w-0">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                              <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                <div className="flex space-x-3">
                                  <div className="h-3 bg-gray-200 rounded w-6"></div>
                                  <div className="h-3 bg-gray-200 rounded w-6"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : newProducts.length > 0 ? (
                  newProducts.map((product, index) => (
                    <HomeProductCard
                      key={`new-${product._id || index}`}
                      product={product}
                      onUpvote={handleUpvote}
                      onBookmark={handleBookmark}
                      recommendationType="new"
                      position={index}
                      source={"new"}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    No new products available at the moment.
                  </div>
                )}
              </div>
            </section>

            {/* Community Picks */}
            {isAuthenticated && (
              <section>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <MessageCircle
                        size={20}
                        className="text-violet-600 mr-2"
                      />{" "}
                      Recommended by the Community
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      Discover products that users with similar tastes love
                    </p>
                  </div>
                  <Link
                    href="/community-picks"
                    className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={`loading-community-${i}`}
                          className="bg-white rounded-lg shadow-sm h-48 animate-pulse border border-gray-100"
                        >
                          <div className="p-4">
                            <div className="flex items-start">
                              <div className="w-12 h-12 rounded-lg mr-3 bg-gray-200"></div>
                              <div className="flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                                <div className="flex justify-between items-center">
                                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                  <div className="flex space-x-3">
                                    <div className="h-3 bg-gray-200 rounded w-6"></div>
                                    <div className="h-3 bg-gray-200 rounded w-6"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : communityPicks.length > 0 ? (
                    communityPicks.map((recommendation, index) => (
                      <HomeProductCard
                        key={`community-${recommendation._id || index}`}
                        product={recommendation}
                        onUpvote={handleUpvote}
                        onBookmark={handleBookmark}
                        recommendationType="collaborative"
                        position={index}
                        source={"community"}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 bg-white rounded-xl p-6 shadow-sm">
                      <MessageCircle className="w-10 h-10 text-violet-300 mx-auto mb-2" />
                      <p className="text-gray-600 mb-3">
                        Community recommendations will appear as you interact
                        with products
                      </p>
                      <p className="text-gray-500 text-sm max-w-lg mx-auto">
                        Upvote and bookmark products to help us find similar
                        items enjoyed by like-minded users.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Forum Threads */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Trending Forum Threads</h2>
              <div className="space-y-4">
                {forumThreads.length > 0 ? (
                  forumThreads.map((thread) => (
                    <div
                      key={`thread-${thread.id}`}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <Link
                        href={`/thread/${thread.id}`}
                        className="block hover:bg-gray-50 p-2 -mx-2 rounded"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {safeRender(thread.author, "Unknown")}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          {safeRender(thread.title, "Untitled")}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs space-x-4">
                          <div className="flex items-center">
                            <ArrowUp size={12} className="mr-1" />
                            <span>Upvote ({thread.upvotes || 0})</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle size={12} className="mr-1" />
                            <span>{thread.comments || 0}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No forum threads available at the moment.
                  </div>
                )}
              </div>
              <Link
                href="/forums"
                className="block text-center text-violet-600 hover:text-violet-800 text-sm font-medium mt-4"
              >
                View All Discussions →
              </Link>
            </section>

            {/* Categories */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Explore by Category</h2>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array(10)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`loading-category-${i}`}
                        className="h-12 bg-gray-100 rounded-lg animate-pulse"
                      ></div>
                    ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    if (!category || typeof category !== "object") return null;
                    const categoryId = category._id || category.id;
                    const categoryName = safeRender(
                      category.name,
                      "Unnamed Category"
                    );
                    const categorySlug = safeRender(category.slug, "unknown");
                    const categoryIcon =
                      typeof category.icon === "string" ? category.icon : null;

                    return (
                      <Link
                        key={`category-${categoryId}`}
                        href={`/category/${categorySlug}`}
                        className="flex items-center p-3 bg-gray-50 hover:bg-violet-50 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors"
                      >
                        {categoryIcon ? (
                          <div className="w-5 h-5 mr-2">
                            <Image
                              src={categoryIcon}
                              alt={categoryName}
                              width={20}
                              height={20}
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 mr-2 text-gray-500">
                            <span>📁</span>
                          </div>
                        )}
                        <span className="font-medium text-sm text-gray-800">
                          {categoryName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Categories are loading...
                </div>
              )}
            </section>

            {/* Newsletter */}
            <section className="bg-violet-50 border border-violet-100 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3">Stay in the Loop</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Get weekly updates on the hottest products and startup trends.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-800 border border-gray-200 border-r-0 focus:outline-none focus:ring-1 focus:ring-violet-300 text-sm"
                />
                <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-r-lg font-medium text-sm transition-colors text-white">
                  Subscribe
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, isActive = false }) {
  return (
    <div
      className={`flex items-center px-3 py-2 cursor-pointer ${
        isActive
          ? "text-violet-600 font-medium"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <span className="text-sm">{label}</span>
      <ChevronDown size={14} className="ml-1" />
    </div>
  );
}

function ProductListItem({ product, rank }) {
  if (!product || typeof product !== "object") return null;

  // Helper function to safely render text
  const safeRender = (value, fallback = "") => {
    if (typeof value === "string") return value;
    if (value?.name && typeof value.name === "string") return value.name;
    return fallback;
  };

  const getCategoryName = () => {
    if (typeof product.categoryName === "string") return product.categoryName;
    if (product.categoryName?.name)
      return safeRender(product.categoryName.name);
    if (product.category?.name) return safeRender(product.category.name);
    return "General";
  };

  const imageUrl = product.thumbnail || "/api/placeholder/60/60";
  const productName = safeRender(product.name, "Product");
  const tagline = safeRender(
    product.tagline || product.description,
    "No description available"
  );

  useEffect(() => {
    // Track impression when the component mounts and is visible
    // This ensures impressions are tracked when products are actually visible to the user
    if (product._id && window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            try {
              // Track impression when at least 50% of the product is visible
              if (recordInteraction) {
                recordInteraction(product._id, "impression", {
                  source: "trending",
                  position: rank - 1
                });
              }
              // Disconnect after recording once
              observer.disconnect();
            } catch (e) {
              console.error("Error recording impression:", e);
            }
          }
        });
      }, {
        threshold: 0.5 // Track when at least 50% of the item is visible
      });
      
      // Start observing the element
      const element = document.querySelector(`[data-product-id="${product._id}"]`);
      if (element) {
        observer.observe(element);
        
        // Clean up
        return () => observer.disconnect();
      }
    }
  }, [product._id, rank]);

  return (
    <div className="flex items-start" data-product-id={product._id}>
      <div className="flex-shrink-0 w-8 text-xl font-bold text-gray-300 mt-1">
        {rank}.
      </div>
      <img
        src={imageUrl}
        alt={productName}
        className="w-12 h-12 rounded-lg mr-4"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center mb-1">
          <h3 className="font-bold text-lg text-gray-900 mr-2">
            {productName}
          </h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
            {getCategoryName()}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2">{tagline}</p>
        {product.tags &&
          Array.isArray(product.tags) &&
          product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={`tag-${idx}`}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                >
                  {safeRender(tag, `tag-${idx}`)}
                </span>
              ))}
            </div>
          )}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-500 text-xs">
            <ArrowUp size={14} className="mr-1" />
            <span>{product.upvotes?.count || product.upvoteCount || 0}</span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <MessageCircle size={14} className="mr-1" />
            <span>{product.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
