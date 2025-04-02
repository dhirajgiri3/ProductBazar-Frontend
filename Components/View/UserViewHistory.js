"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import viewService from "../../services/viewService";

// Extend dayjs with relativeTime
dayjs.extend(relativeTime);

const UserViewHistory = () => {
  const [viewHistory, setViewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    const fetchViewHistory = async () => {
      try {
        setLoading(true);
        const result = await viewService.getUserViewHistory({
          page: pagination.page,
          limit: 10,
        });

        setViewHistory(result.data);
        setPagination(result.pagination);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch view history:", err);
        setError("Unable to load your view history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchViewHistory();
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Get total view time from history
  const totalViewTime = viewHistory.reduce((total, item) => {
    return total + (item.viewDuration || 0);
  }, 0);

  // Get unique devices from history
  const devices = [
    ...new Set(viewHistory.map((item) => item.device).filter(Boolean)),
  ];

  // Filter functions
  const filterItems = (filter) => {
    setActiveFilter(filter);
  };

  // Stats summary
  const stats = {
    totalItems: viewHistory.length,
    uniqueProducts: new Set(
      viewHistory.map((item) => item.product?._id).filter(Boolean)
    ).size,
    avgViewTime: viewHistory.length
      ? Math.round(totalViewTime / viewHistory.length)
      : 0,
  };

  // Empty state animation variants
  const emptyStateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Loading animation variants
  const loadingVariants = {
    initial: { pathLength: 0 },
    animate: {
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // Render different views based on state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="relative w-24 h-24">
          <motion.svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#7c3aed"
              strokeWidth="4"
              fill="transparent"
              variants={loadingVariants}
              initial="initial"
              animate="animate"
              className="drop-shadow-md"
            />
          </motion.svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-8 text-center h-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-500 mb-4 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-md"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!viewHistory || viewHistory.length === 0) {
    return (
      <motion.div
        className="relative bg-gradient-to-br from-violet-50 to-indigo-50 p-10 rounded-2xl overflow-hidden text-center"
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/30 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full transform -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your browsing history is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Start exploring our products to build your personalized
            recommendations. Your browsing history helps us suggest products
            that match your interests.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium group"
          >
            <span>Discover Products</span>
            <svg
              className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/50 rounded-full filter blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10">
        {/* Header section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-indigo-600 mb-3">
              Your Viewing History
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Keep track of products you've viewed recently and discover similar
              items based on your browsing patterns.
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-violet-100/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Products Viewed</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {stats.totalItems}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-violet-100/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. View Time</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {stats.avgViewTime}s
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-violet-100/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Devices Used</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {devices.length}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls and filters */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-gray-500"
              }`}
              aria-label="Grid view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-gray-500"
              }`}
              aria-label="List view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => filterItems("all")}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                activeFilter === "all"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-white/80 text-gray-600 hover:bg-violet-50"
              }`}
            >
              All
            </button>
            {devices.map((device) => (
              <button
                key={device}
                onClick={() => filterItems(device)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  activeFilter === device
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-white/80 text-gray-600 hover:bg-violet-50"
                }`}
              >
                {device}
              </button>
            ))}
          </div>
        </motion.div>

        {/* History cards */}
        <AnimatePresence>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {viewHistory.map((view, index) => {
              // Filter logic
              if (activeFilter !== "all" && view.device !== activeFilter) {
                return null;
              }

              return (
                <motion.div
                  key={view._id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`
                    ${
                      viewMode === "grid"
                        ? "rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100"
                        : "flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100"
                    }
                    hover:shadow-md transition-all duration-300 group
                  `}
                >
                  {/* Product image */}
                  <div
                    className={`
                    relative overflow-hidden
                    ${
                      viewMode === "grid"
                        ? "h-36"
                        : "flex-shrink-0 w-20 h-20 rounded-lg"
                    }
                  `}
                  >
                    {view.product?.thumbnail ? (
                      <Image
                        src={view.product.thumbnail}
                        alt={view.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes={viewMode === "grid" ? "100vw" : "80px"}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-violet-50 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-violet-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                    )}

                    {/* View time badge */}
                    {view.viewDuration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                        {view.viewDuration}s
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`
                    ${viewMode === "grid" ? "p-4" : "flex-1"}
                  `}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link
                        href={`/product/${
                          view.product?.slug || view.product?._id
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 hover:text-violet-700 transition-colors line-clamp-1">
                          {view.product?.name || "Product Not Available"}
                        </h3>
                      </Link>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {dayjs(view.createdAt).fromNow()}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {view.product?.description || "No description available"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {view.device && (
                        <div className="inline-flex items-center px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs">
                          <DeviceIcon device={view.device} />
                          <span className="ml-1">{view.device}</span>
                        </div>
                      )}

                      {view.referrer && (
                        <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            ></path>
                          </svg>
                          {
                            view.referrer
                              .replace(/^https?:\/\/(www\.)?/, "")
                              .split("/")[0]
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            className="flex justify-center mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="inline-flex items-center rounded-lg bg-white/80 backdrop-blur-sm shadow-sm p-1 border border-gray-100">
              <button
                onClick={() =>
                  handlePageChange(Math.max(1, pagination.page - 1))
                }
                disabled={pagination.page === 1}
                className="p-2 rounded-md mr-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-50 transition-colors"
                aria-label="Previous page"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>

              <div className="flex items-center">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show max 5 pages, prioritizing current page and surrounding pages
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1) ||
                      pagination.pages <= 5
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 mx-0.5 rounded-md flex items-center justify-center text-sm transition-colors ${
                            pagination.page === page
                              ? "bg-violet-600 text-white"
                              : "text-gray-600 hover:bg-violet-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 2 && pagination.page > 3) ||
                      (page === pagination.pages - 1 &&
                        pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span
                          key={page}
                          className="w-9 h-9 flex items-center justify-center text-gray-400"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.pages, pagination.page + 1)
                  )
                }
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-md ml-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-50 transition-colors"
                aria-label="Next page"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Helper component for device icons
const DeviceIcon = ({ device }) => {
  switch (device?.toLowerCase()) {
    case "mobile":
      return (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
      );
    case "tablet":
      return (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
      );
    case "desktop":
      return (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <polyline points="8 21 16 21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    default:
      return (
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
  }
};

export default UserViewHistory;
