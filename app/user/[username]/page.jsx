"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FiTag
} from "react-icons/fi";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useProduct } from "../../../Contexts/Product/ProductContext";
import LoaderComponent from "../../../Components/UI/LoaderComponent";
import OverviewTab from "./Components/ProfileTabs/OverviewTab";
import ActivityTab from "./Components/ProfileTabs/ActivityTab";
import ProductsTab from "./Components/ProfileTabs/ProductsTab";
import UpvotesTab from "./Components/ProfileTabs/UpvotesTab";
import EditProfileModal from "../../../Components/Modal/EditProfileModal/EditProfileModal";
import ProfileCompletionPrompt from "../../../Components/Modal/ProfileCompletionPrompt/ProfileCompletionPrompt";
import logger from "../../../Utils/logger";
import { makePriorityRequest } from "../../../Utils/api";
import eventBus, { EVENT_TYPES } from "../../../Utils/eventBus";

// Utility functions and configurations

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

// Animation variants are defined above for better organization

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

export default function ProfilePage({ params }) {
  const { user, authLoading, error, getUserByUsername } = useAuth();
  const { products, getUserProducts } = useProduct();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [mergedProducts, setMergedProducts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [interactionCounts, setInteractionCounts] = useState({
    bookmarks: 0,
    upvotes: 0,
  });

  // Reference to store active product request for cancellation
  const activeProductRequest = useRef(null);

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
    async (userId, page = 1, filter = "all", bypassCache = false) => {
      try {
        if (userId) {
          // Cancel any previous requests to avoid race conditions
          if (activeProductRequest.current) {
            activeProductRequest.current.abort();
          }

          // Set loading state
          setProductsLoading(true);

          // Make the request with the new API
          const response = await getUserProducts(userId, {
            page,
            limit: productsPerPage,
            filter,
            bypassCache, // Pass the bypassCache parameter to force fresh data
          });

          // Store the controller for potential future cancellation
          if (response.controller) {
            activeProductRequest.current = response.controller;
          }

          if (response && response.data) {
            // Update filtered products for display
            setFilteredProducts(response.data);

            // Update merged products for other components (like Overview tab)
            setMergedProducts(response.data);

            // Update status counts
            setStatusCounts({
              all: response.totalCount || 0,
              published: response.statusCounts?.published || 0,
              draft: response.statusCounts?.draft || 0,
              archived: response.statusCounts?.archived || 0,
            });

            // Set total pages for pagination
            setTotalPages(response.totalPages || 1);

            // Log success
            logger.info(`Fetched ${response.data.length} products for user ${userId}${bypassCache ? ' (bypassed cache)' : ''}`);
          } else {
            // Handle empty response
            setFilteredProducts([]);
            setStatusCounts({ all: 0, published: 0, draft: 0, archived: 0 });
            setTotalPages(1);
            logger.info(`No products found for user ${userId}`);
          }
        }
      } catch (error) {
        // Only log non-cancellation errors
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          logger.error("Failed to fetch user products:", error);
          setFilteredProducts([]);
          setStatusCounts({ all: 0, published: 0, draft: 0, archived: 0 });
          setTotalPages(1);
        }
      } finally {
        setProductsLoading(false);
      }
    },
    [getUserProducts, productsPerPage]
  );

  // Handle page change for product pagination
  const handleProductPageChange = useCallback(
    (page, userId) => {
      setCurrentPage(page);
      // Use bypassCache=true to ensure we get fresh data when changing pages
      fetchUserProducts(userId, page, activeProductFilter, true);
    },
    [fetchUserProducts, activeProductFilter]
  );

  // Handle filter change for products
  const handleProductFilterChange = useCallback(
    (filter, userId) => {
      setActiveProductFilter(filter);
      setCurrentPage(1);
      // Use bypassCache=true to ensure we get fresh data when changing filters
      fetchUserProducts(userId, 1, filter, true);
    },
    [fetchUserProducts]
  );

  // Add this new function to fetch interaction counts
  const fetchInteractionCounts = useCallback(async (userId) => {
    if (!userId) return;

    try {
      // Make a direct API call to avoid any middleware issues
      const response = await makePriorityRequest('get', `/users/${userId}/interactions`);

      if (response.data.success) {
        // Handle different response formats
        const upvotesValue = response.data.upvoteCount || response.data.upvotes || 0;
        const bookmarksValue = response.data.bookmarkCount || response.data.bookmarks || 0;

        // Ensure we're storing the count value if upvotes/bookmarks are objects
        const upvotesCount = typeof upvotesValue === 'object' ? upvotesValue.count || 0 : upvotesValue;
        const bookmarksCount = typeof bookmarksValue === 'object' ? bookmarksValue.count || 0 : bookmarksValue;

        setInteractionCounts({
          bookmarks: bookmarksCount,
          upvotes: upvotesCount,
        });

        logger.info(
          `User interactions: ${upvotesCount} upvotes, ${bookmarksCount} bookmarks`
        );
      }
    } catch (error) {
      logger.error("Failed to fetch interaction counts:", error);
    }
  }, []);

  // Reference to store active profile request for cancellation
  const activeProfileRequest = useRef(null);

  // Fetch user by username from URL parameter
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Cancel any previous requests
        if (activeProfileRequest.current) {
          activeProfileRequest.current.abort();
        }

        setProfileLoading(true);
        setProfileError(null);

        const username = params.username;
        if (!username) {
          setProfileError("Username is required");
          setProfileLoading(false);
          return;
        }

        // Create a new abort controller
        const controller = new AbortController();
        activeProfileRequest.current = controller;

        // Fetch user with username
        const fetchedUser = await getUserByUsername(username);

        // Check if the request was canceled or component unmounted
        if (controller.signal.aborted) {
          return;
        }

        if (!fetchedUser) {
          setProfileError("User not found");
          setProfileLoading(false);
          return;
        }

        setProfileUser(fetchedUser);

        // Check if this is the current user's profile
        if (user && user._id === fetchedUser._id) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }

        // Fetch user products and interaction counts
        // Use bypassCache=true to ensure we get fresh data on initial load
        fetchUserProducts(fetchedUser._id, currentPage, activeProductFilter, true);
        fetchInteractionCounts(fetchedUser._id);

        // Show profile completion modal if it's own profile and not completed
        if (isOwnProfile && user && !user.isProfileCompleted) {
          const timer = setTimeout(() => {
            setIsProfileCompletionModalOpen(true);
          }, 1000);

          return () => clearTimeout(timer);
        }

        setProfileLoading(false);
      } catch (error) {
        // Only log non-cancellation errors
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          logger.error("Failed to fetch user profile:", error);
          setProfileError("Failed to load user profile");
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();

    // Cleanup function to cancel any pending requests when component unmounts
    return () => {
      if (activeProfileRequest.current) {
        activeProfileRequest.current.abort();
      }
    };
  }, [
    params.username,
    user,
    getUserByUsername,
    fetchUserProducts,
    fetchInteractionCounts,
    currentPage,
    activeProductFilter,
    isOwnProfile
  ]);

  // Update the Overview tab with product data whenever products change
  useEffect(() => {
    if (profileUser) {
      const normalized =
        products?.length > 0
          ? normalizeProducts(products)
          : normalizeProducts(profileUser.products || []);

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
          `Merged ${normalized.length} products for user ${profileUser._id}`
        );
      }
    }
  }, [profileUser, products, mergedProducts.length]);

  // Also fetch products when active tab changes to Products to refresh the data
  useEffect(() => {
    if (activeTab === "Products" && profileUser?._id) {
      // Use bypassCache=true to ensure we get fresh data when switching to Products tab
      fetchUserProducts(profileUser._id, currentPage, activeProductFilter, true);
    }
  }, [activeTab, profileUser, fetchUserProducts, currentPage, activeProductFilter]);

  // Listen for product events (deleted, updated) to refresh the products list
  useEffect(() => {
    if (!profileUser?._id) return;

    // Handle product deletion events
    const handleProductDeleted = (data) => {
      logger.info(`Product deleted event received: ${data.slug}`);

      // Immediately update the UI by removing the deleted product from the filtered products
      setFilteredProducts(prevProducts => {
        // Check if the product is already removed from the filtered products
        const productExists = prevProducts.some(p => p.slug === data.slug || p._id === data.productId);

        if (!productExists && data.wasAlreadyDeleted) {
          // If the product was already deleted and is not in the filtered products, no need to update
          logger.info(`Product ${data.slug} was already removed from UI. Skipping UI update.`);
          return prevProducts;
        }

        // Filter out the deleted product by slug or ID
        const updatedProducts = prevProducts.filter(p => {
          return p.slug !== data.slug && p._id !== data.productId;
        });

        // Update status counts
        const newStatusCounts = {
          all: updatedProducts.length,
          published: updatedProducts.filter(p => p.status === "Published").length,
          draft: updatedProducts.filter(p => p.status === "Draft").length,
          archived: updatedProducts.filter(p => p.status === "Archived").length,
        };
        setStatusCounts(newStatusCounts);

        // Also update the merged products to keep them in sync
        setMergedProducts(prevMerged => {
          return prevMerged.filter(p => p.slug !== data.slug && p._id !== data.productId);
        });

        logger.info(`Removed product ${data.slug} from UI. Updated product count: ${updatedProducts.length}`);
        return updatedProducts;
      });

      // Also refresh from the server to ensure consistency, but with a slight delay to avoid race conditions
      setTimeout(() => {
        if (profileUser?._id) {
          // Force a fresh fetch by bypassing cache
          fetchUserProducts(profileUser._id, currentPage, activeProductFilter, true);
        }
      }, 500);
    };

    // Handle product update events
    const handleProductUpdated = (data) => {
      logger.info(`Product updated event received: ${data.newSlug || data.slug}`);

      // Immediately update the UI by updating the product in the filtered products
      setFilteredProducts(prevProducts => {
        // Check if the product exists in the filtered products
        const productExists = prevProducts.some(p =>
          p.slug === data.oldSlug || p.slug === data.newSlug || p._id === data.productId
        );

        if (!productExists) {
          // If the product doesn't exist in the filtered products, no need to update
          logger.info(`Product ${data.newSlug || data.slug} not found in UI. Skipping UI update.`);
          return prevProducts;
        }

        const updatedProducts = prevProducts.map(p => {
          // Find the product by old slug, new slug, or ID
          if (p.slug === data.oldSlug || p.slug === data.newSlug || p._id === data.productId) {
            // Return the updated product data
            const updatedProduct = {
              ...p,
              ...data.product,
              slug: data.newSlug || data.slug || p.slug,
              _id: data.productId || p._id,
              updatedAt: new Date().toISOString()
            };

            logger.info(`Updated product in UI: ${p.slug} -> ${updatedProduct.slug}`);
            return updatedProduct;
          }
          return p;
        });

        // Update status counts
        const newStatusCounts = {
          all: updatedProducts.length,
          published: updatedProducts.filter(p => p.status === "Published").length,
          draft: updatedProducts.filter(p => p.status === "Draft").length,
          archived: updatedProducts.filter(p => p.status === "Archived").length,
        };
        setStatusCounts(newStatusCounts);

        // Also update the merged products to keep them in sync
        setMergedProducts(prevMerged => {
          return prevMerged.map(p => {
            if (p.slug === data.oldSlug || p.slug === data.newSlug || p._id === data.productId) {
              return {
                ...p,
                ...data.product,
                slug: data.newSlug || data.slug || p.slug,
                _id: data.productId || p._id,
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          });
        });

        return updatedProducts;
      });

      // Also refresh from the server to ensure consistency, but with a slight delay to avoid race conditions
      setTimeout(() => {
        if (profileUser?._id) {
          // Force a fresh fetch by bypassing cache
          fetchUserProducts(profileUser._id, currentPage, activeProductFilter, true);
        }
      }, 500);
    };

    // Subscribe to events
    const unsubscribeDelete = eventBus.subscribe(EVENT_TYPES.PRODUCT_DELETED, handleProductDeleted);
    const unsubscribeUpdate = eventBus.subscribe(EVENT_TYPES.PRODUCT_UPDATED, handleProductUpdated);

    // Cleanup on unmount
    return () => {
      unsubscribeDelete();
      unsubscribeUpdate();
    };
  }, [profileUser, fetchUserProducts, currentPage, activeProductFilter]);

  useEffect(() => {
    if (error || profileError) {
      logger.error("Profile loading error:", error || profileError);
    }
  }, [error, profileError]);

  // Combine all loading states
  const isLoading = authLoading || productsLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <LoaderComponent text="Loading profile..." />
      </div>
    );
  }

  if (error || profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-red-500"
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
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-medium text-gray-900 mb-3"
            >
              Error Loading Profile
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-sm mb-6 max-w-sm mx-auto"
            >
              {error || profileError}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#7c3aed" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = "/"}
                className="px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
              >
                Go Home
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"></div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-medium text-gray-900 mb-3"
            >
              User Not Found
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-sm mb-6 max-w-sm mx-auto"
            >
              The user you're looking for doesn't exist or has been removed. You can search for other users or return to the home page.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#7c3aed" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = "/"}
                className="px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.history.back()}
                className="px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
              >
                Go Back
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Ready to render the profile page

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
                        profileUser.profilePicture?.url || "/Assets/Image/Profile.png"
                      }
                      alt={`${profileUser.firstName} ${profileUser.lastName}`}
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
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {profileUser.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                        {profileUser.role === "freelancer"
                          ? "Freelancer"
                          : profileUser.role === "jobseeker"
                          ? "Job Seeker"
                          : profileUser.role}
                      </span>
                    )}
                    {profileUser.openToWork && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Open to Work
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-500 text-sm">
                  {profileUser.headline ||
                    (profileUser.companyRole || profileUser.role === "freelancer"
                      ? "Freelancer"
                      : profileUser.role === "jobseeker"
                      ? "Looking for Opportunities"
                      : "Product Enthusiast")}
                </p>

                {profileUser.bio && (
                  <p className="text-gray-500 text-sm max-w-2xl line-clamp-2">
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 justify-center md:justify-start">
                  {profileUser.address &&
                    (profileUser.address.city ||
                      profileUser.address.country ||
                      (typeof profileUser.address === "string" && profileUser.address)) && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-gray-400" />
                        {typeof profileUser.address === "object"
                          ? `${profileUser.address.city || ""}, ${
                              profileUser.address.country || ""
                            }`
                              .replace(/, $/, "")
                              .replace(/^, /, "")
                          : profileUser.address}
                      </span>
                    )}

                  {profileUser.preferredContact && (
                    <span className="flex items-center gap-1">
                      <FiMail className="w-3 h-3 text-gray-400" />
                      {profileUser.preferredContact}
                    </span>
                  )}

                  {profileUser.socialLinks?.website && (
                    <a
                      href={profileUser.socialLinks.website}
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

                {profileUser.socialLinks?.website && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={profileUser.socialLinks.website}
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
                {typeof interactionCounts.upvotes === 'object' ? interactionCounts.upvotes.count || 0 : interactionCounts.upvotes || 0}
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
                {profileUser.activity?.length || 0}
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
              <OverviewTab user={profileUser} products={mergedProducts} />
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
                onPageChange={(page) => handleProductPageChange(page, profileUser._id)}
                onFilterChange={(filter) => handleProductFilterChange(filter, profileUser._id)}
                onProductUpdated={() =>
                  fetchUserProducts(profileUser._id, currentPage, activeProductFilter)
                }
                userId={profileUser._id}
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
              <UpvotesTab upvotes={typeof interactionCounts.upvotes === 'object' ? interactionCounts.upvotes.count || 0 : interactionCounts.upvotes || 0} />
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
              <ActivityTab activity={profileUser.activity || []} />
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
