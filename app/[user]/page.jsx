"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FiExternalLink,
  FiEdit3,
  FiLink,
  FiMapPin,
  FiMail,
  FiGrid,
  FiPackage,
  FiBookmark,
  FiActivity,
  FiAward,
} from "react-icons/fi";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";
import LoaderComponent from "../../Components/UI/LoaderComponent";
import OverviewTab from "./Components/ProfileTabs/OverviewTab";
import ActivityTab from "./Components/ProfileTabs/ActivityTab";
import ProductsTab from "./Components/ProfileTabs/ProductsTab";
import UpvotesTab from "./Components/ProfileTabs/UpvotesTab";
import EditProfileModal from "../../Components/Modal/EditProfileModal/EditProfileModal";
import ProfileCompletionPrompt from "../../Components/Modal/ProfileCompletionPrompt/ProfileCompletionPrompt";
import logger from "../../Utils/logger";
import axios from "axios";

// Role badges configuration
const roleBadges = {
  startupOwner: {
    text: "Startup Founder",
    bg: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  investor: {
    text: "Investor",
    bg: "bg-green-100",
    textColor: "text-green-700",
  },
  freelancer: {
    text: "Freelancer",
    bg: "bg-amber-100",
    textColor: "text-amber-700",
  },
  jobseeker: {
    text: "Job Seeker",
    bg: "bg-blue-100",
    textColor: "text-blue-700",
  },
  agency: { text: "Agency", bg: "bg-purple-100", textColor: "text-purple-700" },
  maker: { text: "Maker", bg: "bg-rose-100", textColor: "text-rose-700" },
  admin: { text: "Admin", bg: "bg-red-100", textColor: "text-red-700" },
  default: { text: "Member", bg: "bg-gray-100", textColor: "text-gray-700" },
};

// Normalize product data structure
const normalizeProducts = (products = []) => {
  if (!products || !Array.isArray(products)) return [];

  return products
    .map((product) => {
      // Handle case when product is just an ID
      if (typeof product === "string") {
        return { _id: product, id: product };
      }

      // Already in proper format
      if (product._id && product.name) {
        return product;
      }

      // Handle nested product field
      if (product.product && typeof product.product === "object") {
        return { ...product.product, upvoted: product.upvoted };
      }

      return product;
    })
    .filter(Boolean);
};

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const tabVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.06,
    },
  },
};

export default function ProfilePage() {
  const { user, authLoading, error } = useAuth();
  const { products, loading: productsLoading, getUserProducts } = useProduct();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [mergedProducts, setMergedProducts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [interactionCounts, setInteractionCounts] = useState({
    bookmarks: 0,
    upvotes: 0,
  });

  // Product tab specific states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeProductFilter, setActiveProductFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });
  const productsPerPage = 6;

  // Memoized tabs to prevent recalculation
  const tabs = useMemo(() => {
    // Focus on the essential tabs for a cleaner UI
    return ["Overview", "Products", "Activity", "Upvotes"];
  }, []);

  // Fetch user products with pagination and filters
  const fetchUserProducts = useCallback(
    async (page = 1, filter = "all") => {
      try {
        if (user?._id) {
          const response = await getUserProducts(user._id, {
            page,
            limit: productsPerPage,
            filter,
          });

          if (response && response.data) {
            const fetchedProducts = normalizeProducts(response.data || []);

            // Update status counts
            setStatusCounts({
              all: response.totalCount || fetchedProducts.length,
              published:
                response.statusCounts?.published ||
                fetchedProducts.filter((p) => p.status === "Published").length,
              draft:
                response.statusCounts?.draft ||
                fetchedProducts.filter((p) => p.status === "Draft").length,
              archived:
                response.statusCounts?.archived ||
                fetchedProducts.filter((p) => p.status === "Archived").length,
            });

            // Set total pages for pagination
            if (response.totalCount) {
              setTotalPages(Math.ceil(response.totalCount / productsPerPage));
            }

            // Filter products if needed
            if (filter === "all") {
              setFilteredProducts(fetchedProducts);
            } else {
              setFilteredProducts(
                fetchedProducts.filter(
                  (p) => p.status?.toLowerCase() === filter
                )
              );
            }
            // Update merged products for other components
            setMergedProducts(normalizeProducts(fetchedProducts));
          }
        }
      } catch (error) {
        logger.error("Failed to fetch user products:", error);
      }
    },
    [getUserProducts, user]
  );

  // Handle page change for product pagination
  const handleProductPageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      fetchUserProducts(page, activeProductFilter);
    },
    [fetchUserProducts, activeProductFilter]
  );

  // Handle filter change for products
  const handleProductFilterChange = useCallback(
    (filter) => {
      setActiveProductFilter(filter);
      setCurrentPage(1);
      fetchUserProducts(1, filter);
    },
    [fetchUserProducts]
  );

  // Add this new function to fetch interaction counts
  const fetchInteractionCounts = useCallback(async () => {
    if (!user?._id) return;

    try {
      // Make a direct API call to avoid any middleware issues
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5004/api/v1"
        }/users/${user._id}/interactions`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setInteractionCounts({
          bookmarks: response.data.bookmarkCount || 0,
          upvotes: response.data.upvoteCount || 0,
        });
        logger.info(
          `User interactions: ${response.data.upvoteCount} upvotes, ${response.data.bookmarkCount} bookmarks`
        );
      }
    } catch (error) {
      logger.error("Failed to fetch interaction counts:", error);
    }
  }, [user]);

  // Initialize products data when user is loaded
  useEffect(() => {
    if (user?._id) {
      // For now, we're only showing the current user's profile
      setIsOwnProfile(true);
      fetchUserProducts(currentPage, activeProductFilter);
      fetchInteractionCounts(); // Add this line

      // Show profile completion modal if profile is not completed
      if (isOwnProfile && !user.isProfileCompleted) {
        // Use a timeout to ensure the modal doesn't appear immediately
        const timer = setTimeout(() => {
          setIsProfileCompletionModalOpen(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [
    user,
    fetchUserProducts,
    currentPage,
    activeProductFilter,
    isOwnProfile,
    fetchInteractionCounts,
  ]);

  // Update the Overview tab with product data whenever products change
  useEffect(() => {
    if (user) {
      const normalized =
        products?.length > 0
          ? normalizeProducts(products)
          : normalizeProducts(user.products || []);

      // Only update merged products here if we haven't already fetched them with getUserProducts
      if (!mergedProducts.length) {
        setMergedProducts(normalized);

        // Initialize filtered products and status counts
        setFilteredProducts(normalized);
        setStatusCounts({
          all: normalized.length,
          published: normalized.filter((p) => p.status === "Published").length,
          draft: normalized.filter((p) => p.status === "Draft").length,
          archived: normalized.filter((p) => p.status === "Archived").length,
        });

        logger.info(
          `Merged ${normalized.length} products for user ${user._id}`
        );
      }
    }
  }, [user, products, mergedProducts.length]);

  // Also fetch products when active tab changes to Products to refresh the data
  useEffect(() => {
    if (activeTab === "Products" && user?._id) {
      fetchUserProducts(currentPage, activeProductFilter);
    }
  }, [activeTab, user, fetchUserProducts, currentPage, activeProductFilter]);

  useEffect(() => {
    if (error) logger.error("Profile loading error:", error);
  }, [error]);

  const isLoading = authLoading || productsLoading;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <LoaderComponent text="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full border border-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get primary role badge
  const primaryBadge = roleBadges[user.role] || roleBadges.default;

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Banner with elegant gradient and subtle animation */}
      <motion.div
        className="relative h-48 md:h-64 overflow-hidden z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-violet-600 to-violet-700" />
        <motion.div
          className="absolute inset-0 bg-[url('/Assets/Image/ProfileBg.png')] bg-cover bg-center opacity-80"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        <motion.div
          className="absolute inset-0"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "100% 100%" }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
      </motion.div>

      {/* Profile Header - Elegant and Modern */}
      <div className="relative -mt-20 px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28">
                  <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-violet-100">
                    <Image
                      src={
                        user.profilePicture?.url || "/Assets/Image/Profile.png"
                      }
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      priority
                      style={{ objectFit: "cover" }}
                      className="rounded-full"
                    />
                  </div>

                  {isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute -bottom-1 -right-1 bg-violet-500 p-1.5 rounded-full text-white shadow-sm"
                      aria-label="Edit Profile"
                    >
                      <FiEdit3 className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* User Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-grow text-center md:text-left space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h1 className="text-xl font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </h1>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {user.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                        {user.role === "freelancer"
                          ? "Freelancer"
                          : user.role === "jobseeker"
                          ? "Job Seeker"
                          : user.role}
                      </span>
                    )}
                    {user.openToWork && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Open to Work
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-500 text-sm">
                  {user.headline ||
                    (user.companyRole || user.role === "freelancer"
                      ? "Freelancer"
                      : user.role === "jobseeker"
                      ? "Looking for Opportunities"
                      : "Product Enthusiast")}
                </p>

                {user.bio && (
                  <p className="text-gray-500 text-sm max-w-2xl line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 justify-center md:justify-start">
                  {user.address &&
                    (user.address.city ||
                      user.address.country ||
                      (typeof user.address === "string" && user.address)) && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-gray-400" />
                        {typeof user.address === "object"
                          ? `${user.address.city || ""}, ${
                              user.address.country || ""
                            }`
                              .replace(/, $/, "")
                              .replace(/^, /, "")
                          : user.address}
                      </span>
                    )}

                  {user.preferredContact && (
                    <span className="flex items-center gap-1">
                      <FiMail className="w-3 h-3 text-gray-400" />
                      {user.preferredContact}
                    </span>
                  )}

                  {user.socialLinks?.website && (
                    <a
                      href={user.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors"
                    >
                      <FiLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons - Moved to the right */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2"
              >
                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3 py-1.5 bg-violet-500 text-white rounded-md text-sm font-medium hover:bg-violet-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </motion.button>
                )}

                {user.socialLinks?.website && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    Visit Site
                  </motion.a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2, borderColor: "#e9d5ff" }}
          >
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
              <FiPackage className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <motion.span
                className="block text-lg font-medium text-gray-900"
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    delay: 0.6,
                  },
                }}
              >
                {mergedProducts.length}
              </motion.span>
              <span className="text-xs text-gray-500">Products</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            whileHover={{ y: -2, borderColor: "#e9d5ff" }}
          >
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
              <FiBookmark className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <motion.span
                className="block text-lg font-medium text-gray-900"
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    delay: 0.65,
                  },
                }}
              >
                {interactionCounts.bookmarks}
              </motion.span>
              <span className="text-xs text-gray-500">Bookmarks</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2, borderColor: "#e9d5ff" }}
          >
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
              <FiAward className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <motion.span
                className="block text-lg font-medium text-gray-900"
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    delay: 0.7,
                  },
                }}
              >
                {interactionCounts.upvotes}
              </motion.span>
              <span className="text-xs text-gray-500">Upvotes</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            whileHover={{ y: -2, borderColor: "#e9d5ff" }}
          >
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
              <FiActivity className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <motion.span
                className="block text-lg font-medium text-gray-900"
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    delay: 0.75,
                  },
                }}
              >
                {user.activity?.length || 0}
              </motion.span>
              <span className="text-xs text-gray-500">Activities</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="flex space-x-1 overflow-x-auto hide-scrollbar py-3"
          >
            {tabs.map((item, index) => {
              // Define icons for each tab
              const getTabIcon = (tabName) => {
                switch (tabName) {
                  case "Overview":
                    return <FiGrid className="w-4 h-4" />;
                  case "Products":
                    return <FiPackage className="w-4 h-4" />;

                  case "Activity":
                    return <FiActivity className="w-4 h-4" />;
                  case "Upvotes":
                    return <FiAward className="w-4 h-4" />;
                  default:
                    return null;
                }
              };

              const tabIcon = getTabIcon(item);
              const isActive = activeTab === item;

              return (
                <motion.button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`py-2 px-4 text-sm font-medium whitespace-nowrap relative rounded-md transition-colors flex items-center gap-2 ${
                    isActive
                      ? "text-violet-700 bg-violet-50"
                      : "text-gray-600 hover:text-violet-600 hover:bg-gray-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  {tabIcon && (
                    <span
                      className={isActive ? "text-violet-600" : "text-gray-400"}
                    >
                      {tabIcon}
                    </span>
                  )}
                  {item}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                      layoutId="activeTabIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "Overview" && (
            <motion.div
              key="Overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <OverviewTab user={user} products={mergedProducts} />
            </motion.div>
          )}
          {activeTab === "Products" && (
            <motion.div
              key="Products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <ProductsTab
                products={filteredProducts}
                isLoading={productsLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                activeFilter={activeProductFilter}
                statusCounts={statusCounts}
                onPageChange={handleProductPageChange}
                onFilterChange={handleProductFilterChange}
                onProductUpdated={() =>
                  fetchUserProducts(currentPage, activeProductFilter)
                }
                userId={user._id}
                isOwner={isOwnProfile}
              />
            </motion.div>
          )}

          {activeTab === "Upvotes" && (
            <motion.div
              key="Upvotes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <UpvotesTab upvotes={interactionCounts.upvotes || 0} />
            </motion.div>
          )}
          {activeTab === "Activity" && (
            <motion.div
              key="Activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <ActivityTab activity={user.activity || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileCompletionModalOpen && (
          <ProfileCompletionPrompt
            isOpen={isProfileCompletionModalOpen}
            onClose={() => setIsProfileCompletionModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
