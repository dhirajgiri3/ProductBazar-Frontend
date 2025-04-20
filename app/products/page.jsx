"use client";

import { useState, useEffect, useCallback } from "react";
// Mock data for products page
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
      avatar: "https://i.pravatar.cc/150?u=sarah",
      title: "Founder & CEO"
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
      avatar: "https://i.pravatar.cc/150?u=michael",
      title: "Finance Expert"
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
      avatar: "https://i.pravatar.cc/150?u=danielle",
      title: "Creative Director"
    },
    tags: ["design", "collaboration"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  "All",
  "AI",
  "SaaS",
  "Fintech",
  "Design",
  "Developer Tools",
  "Marketing",
];
const sortOptions = ["Most Upvoted", "Newest", "Featured"];

export default function ProductsPage() {
  const [products, setProducts] = useState(demoProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Upvoted");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    try {
      setIsLoading(true);
      let filtered = [...demoProducts];

      // Apply category filter
      if (selectedCategory !== "All") {
        filtered = filtered.filter((product) =>
          product.tags.some(
            (tag) => tag.toLowerCase() === selectedCategory.toLowerCase()
          )
        );
      }

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "Most Upvoted":
          filtered.sort((a, b) => b.upvotes - a.upvotes);
          break;
        case "Newest":
          filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case "Featured":
          filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
        default:
          break;
      }

      setProducts(filtered);
      setError(null);
    } catch (err) {
      setError("Error filtering products");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, sortBy, searchTerm]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Simplified and enhanced scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Batch animations for better performance
      gsap.set(".product-card", {
        opacity: 0,
        y: 30
      });

      // Create smoother stagger effect
      gsap.to(".product-card", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: {
          each: 0.15,
          ease: "power2.out",
          from: "top"
        },
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top bottom-=100",
          toggleActions: "play none none reset",
          markers: false
        }
      });
    });

    return () => ctx.revert(); // Clean up animations
  }, [products]);

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="container mx-auto px-4 py-12 space-y-12 mt-8 relative">
        {/* Enhanced Header Design */}
        <div
          className="text-center space-y-8 max-w-4xl mx-auto opacity-0"
          ref={(el) => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 1.2,
              ease: "power4.out",
              scrollTrigger: {
                trigger: el,
                start: "top center+=100",
              },
            });
          }}
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              <span className="text-gray-900 relative">
                Products that inspire
                {/* <span className="absolute -right-8 top-0">✨</span> */}
              </span>
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-light">
              Explore our handpicked collection of revolutionary tools and innovations
            </p>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-gray-50 backdrop-blur-xl rounded-3xl border border-gray-100 p-4 space-y-6 sticky top-20 z-10">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-center">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 w-full lg:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300
                    whitespace-nowrap focus:outline-none bg-white hover:bg-white/70 relative
                    ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "bg-gray-50/50 text-gray-700 hover:bg-gray-100/50 hover:text-gray-900"
                    }`}
                >
                  {category}
                  {selectedCategory === category && (
                    <span className="absolute inset-0 rounded-2xl animate-pulse bg-white/20"></span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-grow lg:flex-grow-0 group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 px-6 py-3.5 rounded-2xl border border-gray-200
                    bg-white/70 backdrop-blur-sm placeholder-gray-400 text-gray-900
                    text-sm font-medium group-hover:border-purple-300
                    focus:border-purple-400 focus:ring-4 focus:ring-purple-100
                    transition-all duration-300"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3.5 text-sm rounded-2xl border border-gray-200
                  bg-white/70 backdrop-blur-sm focus:border-purple-400
                  focus:ring-4 focus:ring-purple-100 transition-all duration-300
                  cursor-pointer font-medium"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State with enhanced styling */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div
                className="w-16 h-16 border-4 border-purple-100 border-t-purple-500
                                      rounded-full animate-spin"
              ></div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Product Cards Grid with simplified animation structure */}
            <div className="products-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pt-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="product-card group relative bg-white rounded-2xl
                    hover:shadow-[0_8px_40px_rgb(0,0,0,0.05)] transition-all duration-300
                    hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-105
                        transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md
                          px-3 py-1.5 rounded-full border border-purple-100/50 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                          <span className="text-xs font-medium text-purple-900">Featured</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0
                      group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white
                        transition-colors duration-200 backdrop-blur-md shadow-sm
                        border border-purple-100/50">
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                        </svg>
                      </button>
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white
                        transition-colors duration-200 backdrop-blur-md shadow-sm
                        border border-purple-100/50">
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-grow p-5 space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-[11px]
                            font-medium tracking-wide hover:bg-gray-100 transition-colors
                            duration-200 cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title and Upvotes */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight
                        group-hover:text-purple-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 min-w-[3rem]">
                        <button className="flex items-center gap-1.5 text-gray-500
                          hover:text-purple-600 transition-colors duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                          </svg>
                          <span className="text-sm font-medium">{typeof product.upvotes === 'object' ? product.upvotes.count || 0 : product.upvotes || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    {/* Maker Info */}
                    <div className="flex items-center justify-between pt-4 mt-auto">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.maker.avatar}
                          alt={product.maker.name}
                          className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.maker.name}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.maker.title}
                          </p>
                        </div>
                      </div>

                      <button className="p-2 text-gray-400 hover:text-purple-600
                        transition-colors duration-200 rounded-lg hover:bg-purple-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Empty State */}
            {products.length === 0 && (
              <div className="text-center py-32 bg-white/80 rounded-3xl backdrop-blur-xl border border-gray-100/50 shadow-xl">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900">No products found</h3>
                  <p className="text-gray-600 text-base">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchTerm("");
                    }}
                    className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                  hover:bg-gray-200 transition-colors duration-300 text-sm font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
