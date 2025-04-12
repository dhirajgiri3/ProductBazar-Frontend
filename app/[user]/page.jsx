"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "../../Contexts/Auth/AuthContext.js";
import { useProduct } from "../../Contexts/Product/ProductContext.js";
import EditProfileModal from "../../Components/Modal/EditProfileModal/EditProfileModal.jsx";
import OverviewTab from "./Components/ProfileTabs/OverviewTab";
import ProductsTab from "./Components/ProfileTabs/ProductsTab";
import CollectionsTab from "./Components/ProfileTabs/CollectionsTab";
import UpvotesTab from "./Components/ProfileTabs/UpvotesTab";
import TopicsTab from "./Components/ProfileTabs/TopicsTab";
import ActivityTab from "./Components/ProfileTabs/ActivityTab";
import SkillsTab from "./Components/ProfileTabs/SkillsTab";
import SocialTab from "./Components/ProfileTabs/SocialTab";
import RoleCapabilities from "../../Components/User/RoleCapabilities";
import SecondaryRoles from "../../Components/User/SecondaryRoles";
import AdminRoleManager from "../../Components/Admin/AdminRoleManager";
import logger from "../../Utils/logger";
import LoaderComponent from "../../Components/UI/LoaderComponent.jsx";
import { normalizeProducts } from "../../Utils/Product/productUtils.js";

// Role-based badge configuration
const roleBadges = {
  startupOwner: {
    text: "Startup Owner",
    bg: "bg-violet-100",
    textColor: "text-violet-700",
  },
  freelancer: {
    text: "Freelancer",
    bg: "bg-green-100",
    textColor: "text-green-700",
  },
  investor: {
    text: "Investor",
    bg: "bg-purple-100",
    textColor: "text-purple-700",
  },
  agency: { text: "Agency", bg: "bg-orange-100", textColor: "text-orange-700" },
  jobseeker: {
    text: "Job Seeker",
    bg: "bg-teal-100",
    textColor: "text-teal-700",
  },
  default: { text: "User", bg: "bg-gray-100", textColor: "text-gray-700" },
};

// Animation variants
const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2 } },
};

export default function ProfilePage() {
  const { user, authLoading, error } = useAuth();
  const { products, loading: productsLoading, getUserProducts } = useProduct();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [mergedProducts, setMergedProducts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

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
    const baseTabs = ["Overview", "Products", "Collections", "Upvotes"];
    const roleSpecificTabs = {
      startupOwner: ["Topics", "Activity", "Skills", "Social"],
      freelancer: ["Skills", "Social", "Activity"],
      investor: ["Activity", "Social"],
      agency: ["Topics", "Activity", "Skills", "Social"],
      jobseeker: ["Skills", "Social", "Activity"],
    };
    return user?.role && roleSpecificTabs[user.role]
      ? [...baseTabs, ...(roleSpecificTabs[user.role] || [])]
      : baseTabs;
  }, [user?.role]);

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

  // Initialize products data when user is loaded
  useEffect(() => {
    if (user?._id) {
      // For now, we're only showing the current user's profile
      // In the future, this could be updated to fetch another user's profile
      setIsOwnProfile(true);
      setProfileUser(user);
      fetchUserProducts(currentPage, activeProductFilter);
    }
  }, [user, fetchUserProducts, currentPage, activeProductFilter]);

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

  const badge = roleBadges[user.role] || roleBadges.default;

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <motion.div
        className="relative h-40 md:h-56 overflow-hidden rounded-t-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-violet-100" />
        <div className="absolute inset-0 bg-[url('/Assets/Image/ProfileBg.png')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-20 h-20 rounded-full bg-violet-200 opacity-20"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-16 h-16 rounded-full bg-violet-300 opacity-20"
          animate={{
            y: [0, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      {/* Profile Header */}
      <div className="relative -mt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row md:items-end gap-6 bg-white/95 backdrop-blur-sm rounded-xl p-8 border border-gray-50 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]"
          >
            {/* Profile Image */}
            <motion.div
              className="relative mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gradient-to-br from-violet-50 to-white">
                <Image
                  src={user.profilePicture?.url || "/Assets/Image/Profile.png"}
                  alt={`${user.firstName} ${user.lastName}'s Profile`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-full"
                />
              </div>
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#7c3aed" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full text-white border border-violet-100 transition-colors duration-200"
                  aria-label="Edit Profile"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </motion.button>
              )}
            </motion.div>

            {/* User Info */}
            <motion.div
              className="flex-grow text-center md:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2 mb-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.textColor}`}
                >
                  {badge.text}
                </motion.span>
                {user.openToWork && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-2"
                  >
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Open to Work
                  </motion.span>
                )}
              </div>

              <p className="text-gray-600 text-sm font-medium">
                {user.companyRole || user.role === "freelancer"
                  ? "Freelancer"
                  : user.role === "jobseeker"
                  ? "Looking for Opportunities"
                  : "Product Enthusiast"}
              </p>

              {user.bio && (
                <p className="text-gray-500 mt-2 text-sm max-w-2xl line-clamp-2">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 justify-center md:justify-start">
                {user.address && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {typeof user.address === "object"
                      ? `${user.address.city || ""}, ${
                          user.address.country || ""
                        }`
                      : user.address}
                  </span>
                )}
                {user.preferredContact && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {user.preferredContact}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm">
                <motion.span
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="font-medium text-gray-900">
                    {mergedProducts.length}
                  </span>
                  <span className="text-gray-500">Products</span>
                </motion.span>
                <motion.span
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="font-medium text-gray-900">
                    {user.upvotes || 0}
                  </span>
                  <span className="text-gray-500">Upvotes</span>
                </motion.span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-row md:flex-col gap-2 mt-3 md:mt-0 justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isOwnProfile && (
                <motion.button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700 transition-colors duration-200"
                  whileHover={{ scale: 1.02, backgroundColor: "#7c3aed" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Profile
                </motion.button>
              )}
              {user.socialLinks?.website && (
                <motion.a
                  href={user.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-100 text-violet-600 rounded-md text-sm font-medium hover:bg-violet-50 transition-colors duration-200 flex items-center justify-center gap-1"
                  whileHover={{ scale: 1.02, borderColor: "#ddd6fe" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Website
                </motion.a>
              )}
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm mt-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="flex space-x-2 overflow-x-auto hide-scrollbar py-3"
          >
            {tabs.map((item, index) => (
              <motion.button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`py-2 px-5 text-sm font-medium whitespace-nowrap relative rounded-full transition-all ${
                  activeTab === item
                    ? "text-white bg-violet-600 shadow-sm shadow-violet-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.05,
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                {item}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "Overview" && (
            <motion.div
              key="Overview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <OverviewTab user={user} products={mergedProducts} />
            </motion.div>
          )}
          {activeTab === "Products" && (
            <motion.div
              key="Products"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
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
          {activeTab === "Collections" && (
            <motion.div
              key="Collections"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <CollectionsTab collections={user.collections || []} />
            </motion.div>
          )}
          {activeTab === "Upvotes" && (
            <motion.div
              key="Upvotes"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <UpvotesTab upvotes={user.upvotes || 0} />
            </motion.div>
          )}
          {activeTab === "Topics" && (
            <motion.div
              key="Topics"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <TopicsTab topics={user.topics || []} />
            </motion.div>
          )}
          {activeTab === "Activity" && (
            <motion.div
              key="Activity"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <ActivityTab activity={user.activity || []} />
            </motion.div>
          )}
          {activeTab === "Skills" && (
            <motion.div
              key="Skills"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <SkillsTab skills={user.skills || []} />
            </motion.div>
          )}
          {activeTab === "Social" && (
            <motion.div
              key="Social"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1
              }}
              className="bg-white rounded-xl border border-gray-50 p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]"
            >
              <SocialTab social={user.socialLinks || {}} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
