"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Briefcase,
  FileText,
  Building,
  DollarSign,
  Layers,
  Code,
  Users,
  Bookmark,
  Home,
  Grid,
  Folder,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";
import { useCategories } from "../../Contexts/Category/CategoryContext";
import { useOnClickOutside } from "../../Hooks/useOnClickOutside";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingBanner from "./OnboardingBanner";
import SearchModal from "../Modal/Search/SearchModal";
import CategoryIcon from "../UI/CategoryIcon";

const NavItem = ({ label, isActive, href, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: -3 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -2 }}
    whileTap={{ y: 0 }}
    className="relative"
  >
    <Link
      href={href || "#"}
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition-all flex items-center ${
        isActive ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full"
          layoutId="navIndicator"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
);

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    logout,
    nextStep,
    isInitialized,
    skipProfileCompletion,
    refreshNextStep,
  } = useAuth();
  const {} = useProduct(); // Keep the context for future use
  const { categories = [] } = useCategories();

  // States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchQuery = ""; // Default empty search query for the modal
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Refs
  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useOnClickOutside(userMenuRef, () => {
    setIsUserMenuOpen(false);
  });

  useOnClickOutside(roleMenuRef, () => {
    setShowRoleMenu(false);
  });

  useOnClickOutside(categoryMenuRef, () => {
    setShowCategoryMenu(false);
  });

  // Get role-specific navigation items
  const getRoleBasedNavItems = useCallback(() => {
    if (!user || !user.roleCapabilities) return [];

    const items = [];

    // Add admin-specific navigation items - check both primary and secondary roles
    const isPrimaryAdmin = user.role === "admin";
    const isSecondaryAdmin =
      user.secondaryRoles && user.secondaryRoles.includes("admin");

    if (isPrimaryAdmin || isSecondaryAdmin) {
      items.push({
        label: "Admin Dashboard",
        href: "/admin/users",
        isActive: pathname.startsWith("/admin"),
        icon: <Users size={16} />,
        isNew: true,
        roles: ["admin"],
        isPrimary: isPrimaryAdmin,
        isSecondary: isSecondaryAdmin,
      });
    }

    // Add role-specific navigation items
    if (user.roleCapabilities.canApplyToJobs) {
      items.push({
        label: "Jobs",
        href: "/jobs",
        isActive: pathname.startsWith("/jobs") && !pathname.includes("/post"),
        icon: <Briefcase size={16} />,
        roles: ["jobseeker"],
        isPrimary: user.role === "jobseeker",
        isSecondary:
          user.secondaryRoles && user.secondaryRoles.includes("jobseeker"),
      });

      items.push({
        label: "My Applications",
        href: "/profile/applications",
        isActive: pathname.startsWith("/profile/applications"),
        icon: <FileText size={16} />,
        roles: ["jobseeker"],
        isPrimary: user.role === "jobseeker",
        isSecondary:
          user.secondaryRoles && user.secondaryRoles.includes("jobseeker"),
      });
    }

    if (user.roleCapabilities.canPostJobs) {
      items.push({
        label: "Post Job",
        href: "/jobs/post",
        isActive: pathname === "/jobs/post",
        icon: <Plus size={16} />,
        roles: ["startupOwner", "agency"],
        isPrimary: ["startupOwner", "agency"].includes(user.role),
        isSecondary:
          user.secondaryRoles &&
          user.secondaryRoles.some((role) =>
            ["startupOwner", "agency"].includes(role)
          ),
      });
    }

    if (user.roleCapabilities.canShowcaseProjects) {
      items.push({
        label: "Projects",
        href: "/projects",
        isActive: pathname.startsWith("/projects"),
        icon: <Layers size={16} />,
        roles: ["startupOwner", "agency", "freelancer", "jobseeker", "maker"],
        isPrimary: [
          "startupOwner",
          "agency",
          "freelancer",
          "jobseeker",
          "maker",
        ].includes(user.role),
        isSecondary:
          user.secondaryRoles &&
          user.secondaryRoles.some((role) =>
            [
              "startupOwner",
              "agency",
              "freelancer",
              "jobseeker",
              "maker",
            ].includes(role)
          ),
      });
    }

    if (user.roleCapabilities.canOfferServices) {
      items.push({
        label: "Services",
        href: "/services",
        isActive: pathname.startsWith("/services"),
        icon: <Code size={16} />,
        roles: ["agency", "freelancer"],
        isPrimary: ["agency", "freelancer"].includes(user.role),
        isSecondary:
          user.secondaryRoles &&
          user.secondaryRoles.some((role) =>
            ["agency", "freelancer"].includes(role)
          ),
      });
    }

    if (user.roleCapabilities.canInvest) {
      items.push({
        label: "Invest",
        href: "/invest",
        isActive: pathname.startsWith("/invest"),
        icon: <DollarSign size={16} />,
        roles: ["investor"],
        isPrimary: user.role === "investor",
        isSecondary:
          user.secondaryRoles && user.secondaryRoles.includes("investor"),
      });
    }

    return items;
  }, [user, pathname]);

  // Consolidated effect for onboarding and profile status
  useEffect(() => {
    // Only show banner for authenticated users
    if (!isAuthenticated() || !user) {
      setShowOnboardingBanner(false);
      return;
    }

    // Check if all steps are completed
    const allStepsCompleted =
      user.isEmailVerified && user.isPhoneVerified && user.isProfileCompleted;

    if (allStepsCompleted) {
      // All steps are completed, hide banner
      setShowOnboardingBanner(false);

      // If nextStep still exists despite all steps being completed, refresh it
      if (nextStep) {
        refreshNextStep();
      }
    } else if (nextStep) {
      // There are incomplete steps and we have a nextStep, show banner
      setShowOnboardingBanner(true);
    } else {
      // There are incomplete steps but no nextStep (shouldn't happen), refresh nextStep
      refreshNextStep();
      setShowOnboardingBanner(false); // Hide until refreshed
    }
  }, [isAuthenticated, user, nextStep, refreshNextStep]);

  // Handle keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command/Ctrl + K to open search modal
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // Handle product submission - redirect to create product page
  const handleProductSubmit = () => {
    if (!isAuthenticated()) {
      toast.error("Please log in to submit a product");
      router.push("/auth/login");
      return;
    }

    // If user has pending email or phone verification, complete that first
    if (
      nextStep &&
      (nextStep.type === "email_verification" ||
        nextStep.type === "phone_verification")
    ) {
      toast.error("Please verify your contact information first");
      handleCompleteOnboarding();
      return;
    }

    // Check if user has permission to upload products
    if (user?.roleCapabilities?.canUploadProducts) {
      router.push("/product/new");
    } else {
      toast.error("Your current role doesn't allow product submissions");
      router.push("/user/settings");
    }
  };

  // Complete onboarding redirect based on next step
  const handleCompleteOnboarding = () => {
    if (!nextStep) return;

    if (nextStep.type === "email_verification") {
      router.push("/auth/verify-email");
    } else if (nextStep.type === "phone_verification") {
      router.push("/auth/verify-phone");
    } else if (nextStep.type === "profile_completion") {
      router.push("/complete-profile");
    }
  };

  return (
    <>
      {/* Onboarding Banner - Enhanced with better animations and visual appeal */}
      <AnimatePresence>
        {showOnboardingBanner && nextStep ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <OnboardingBanner
              nextStep={nextStep}
              onComplete={() => {
                setShowOnboardingBanner(false);
                handleCompleteOnboarding();
              }}
              onSkip={() => {
                setShowOnboardingBanner(false);
                skipProfileCompletion();
              }}
              onRefresh={async () => {
                // Show loading toast
                toast.loading("Refreshing verification status...", {
                  id: "refresh-toast",
                });
                // Refresh next step
                try {
                  const result = await Promise.resolve(refreshNextStep());
                  // Show success toast
                  setTimeout(() => {
                    if (result) {
                      toast.success("Verification status updated", {
                        id: "refresh-toast",
                      });
                    } else {
                      toast.success("All steps completed!", {
                        id: "refresh-toast",
                      });
                    }
                  }, 500);
                } catch (error) {
                  toast.error("Failed to refresh status", {
                    id: "refresh-toast",
                  });
                }
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Left Section: Logo and Search */}
          <div className="flex items-center">
            {/* Logo - Enhanced with animations and visual appeal */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/home" aria-label="Go to Home">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-violet-500 via-violet-700 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden group"
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, rotate: -15, y: 10 }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    y: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1,
                  }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  {/* Main content container */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Initials */}
                    <motion.span
                      className="absolute text-md font-bold tracking-wider"
                      initial={{ y: 0 }}
                      animate={{ y: isHovered ? -30 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      PB
                    </motion.span>

                    {/* Icon that appears on hover */}
                    <motion.div
                      className="absolute text-white"
                      initial={{ y: 30 }}
                      animate={{ y: isHovered ? 0 : 30 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <Home size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Search - Enhanced with animations and visual cues */}
            <div className="relative hidden sm:block ml-4">
              <motion.button
                className="flex items-center relative rounded-md border border-gray-200 px-3 py-2 w-64 md:w-80 transition-all hover:border-violet-300 hover:shadow-sm group"
                onClick={() => setIsSearchModalOpen(true)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 opacity-0 rounded-md"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="text-gray-400 mr-2 relative"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search size={16} />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-violet-400 rounded-full opacity-0"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                <span className="text-gray-600 text-sm flex-1 text-left group-hover:text-violet-700 transition-colors relative z-10">
                  Search products, startups, etc...
                </span>
                <motion.div
                  className="hidden md:flex items-center border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-500 relative z-10 bg-white/80 backdrop-blur-sm"
                  whileHover={{
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                    borderColor: "rgba(124, 58, 237, 0.3)",
                    color: "rgba(124, 58, 237, 1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  ⌘K
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Desktop Navigation - Minimalistic design without icons */}
          <nav className="hidden md:flex items-center space-x-3">
            <NavItem
              label="Home"
              isActive={pathname === "/" || pathname === "/home"}
              href="/home"
            />

            {/* Products menu - Available to all users */}
            <NavItem
              label="Products"
              isActive={
                pathname === "/products" || pathname.startsWith("/products/")
              }
              href="/products"
            />

            {/* Categories dropdown - Available to all users */}
            <div className="relative" ref={categoryMenuRef}>
              <motion.button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`px-3 py-2 text-sm font-medium transition-colors flex items-center relative ${
                  pathname.startsWith("/category")
                    ? "text-violet-600"
                    : "text-gray-700 hover:text-violet-600"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span>Categories</span>
                <motion.div
                  animate={{ rotate: showCategoryMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-1"
                >
                  <ChevronDown size={16} />
                </motion.div>
                {pathname.startsWith("/category") && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full"
                    layoutId="navIndicator"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>

              {/* Categories dropdown menu with enhanced animations */}
              <AnimatePresence>
                {showCategoryMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-20"
                  >
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"
                      layoutId="menuTopBar"
                    />

                    <div className="p-4 border-b border-gray-100 relative">
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center">
                            <Grid size={20} className="text-violet-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            Browse Categories
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            Discover products by category
                          </div>
                        </div>
                      </div>
                    </div>

                    {categories.length > 0 ? (
                      <div className="max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
                        {categories.slice(0, 8).map((category, index) => (
                          <motion.div
                            key={category._id || category.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 3 }}
                          >
                            <Link
                              href={`/category/${
                                category.slug ||
                                category.name.toLowerCase().replace(/\s+/g, "-")
                              }`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setShowCategoryMenu(false)}
                            >
                              <span className="mr-3 text-violet-500">
                                <CategoryIcon
                                  icon={category.icon}
                                  name={category.name}
                                  size={18}
                                />
                              </span>
                              <span>{category.name}</span>
                            </Link>
                          </motion.div>
                        ))}
                        <div className="px-4 py-2 border-t border-gray-100">
                          <Link
                            href="/categories"
                            className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center justify-center"
                            onClick={() => setShowCategoryMenu(false)}
                          >
                            View All Categories
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">
                        Loading categories...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated() && (
              <>
                <NavItem
                  label="Bookmarks"
                  isActive={pathname === "/user/mybookmarks"}
                  href="/user/mybookmarks"
                />

                <NavItem
                  label="History"
                  isActive={pathname === "/user/history"}
                  href="/user/history"
                />

                {/* Role-based navigation dropdown - Minimalistic design without icons */}
                <div className="relative" ref={roleMenuRef}>
                  <motion.button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center relative ${
                      pathname.startsWith("/jobs") ||
                      pathname.startsWith("/projects") ||
                      pathname.startsWith("/services") ||
                      pathname.startsWith("/invest") ||
                      pathname.startsWith("/profile/applications")
                        ? "text-violet-600"
                        : "text-gray-700 hover:text-violet-600"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>Features</span>
                    <motion.div
                      animate={{ rotate: showRoleMenu ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                    {(pathname.startsWith("/jobs") ||
                      pathname.startsWith("/projects") ||
                      pathname.startsWith("/services") ||
                      pathname.startsWith("/invest") ||
                      pathname.startsWith("/profile/applications")) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full"
                        layoutId="navIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>

                  {/* Role-based menu dropdown with enhanced animations */}
                  <AnimatePresence>
                    {showRoleMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          duration: 0.2,
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-20"
                      >
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"
                          layoutId="menuTopBar"
                        />

                        <div className="p-4 border-b border-gray-100 relative">
                          <div className="flex items-start">
                            <div className="mr-3 flex-shrink-0">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center">
                                <Folder size={20} className="text-violet-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">
                                Your Features
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                Role-specific features and tools
                              </div>
                            </div>
                          </div>
                        </div>

                        {getRoleBasedNavItems().length > 0 ? (
                          <div className="max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
                            {getRoleBasedNavItems().map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 3 }}
                              >
                                <Link
                                  href={item.href}
                                  className={`flex items-center px-4 py-2.5 text-sm ${
                                    item.isActive
                                      ? "bg-violet-50 text-violet-700 font-medium"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                  onClick={() => setShowRoleMenu(false)}
                                >
                                  <span className="mr-3 text-violet-500">
                                    {item.icon}
                                  </span>
                                  <span>{item.label}</span>
                                  {item.isNew && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                      New
                                    </span>
                                  )}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 italic">
                            No role-specific features available
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </nav>

          {/* Right Section: Actions, Notifications, Profile - Enhanced with better animations */}
          <div className="flex items-center space-x-4">
            {/* Submit Button - Enhanced with better animations and visual appeal */}
            {isInitialized &&
              isAuthenticated() &&
              user?.roleCapabilities?.canUploadProducts && (
                <motion.button
                  onClick={handleProductSubmit}
                  className="hidden md:flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full px-5 py-2 text-sm font-medium relative overflow-hidden group"
                  aria-label="Submit a product"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0"
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="relative z-10 flex items-center"
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="mr-1.5 relative"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus size={16} />
                    </motion.div>
                    <span>Submit Product</span>
                  </motion.div>
                </motion.button>
              )}

            {!isInitialized ? (
              // Show skeleton loader while auth is initializing
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : isAuthenticated() ? (
              <>
                {/* Notifications - Enhanced with better animations */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Link
                    href="/notifications"
                    className="relative p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors flex items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {user?.unreadNotifications > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                        aria-label={`${user.unreadNotifications} unread notifications`}
                      >
                        {user.unreadNotifications > 9
                          ? "9+"
                          : user.unreadNotifications}
                      </motion.span>
                    )}
                  </Link>
                  {user?.unreadNotifications > 0 && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-violet-200 opacity-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    />
                  )}
                </motion.div>

                {/* User Menu - Enhanced with better animations and visual appeal */}
                <div ref={userMenuRef} className="relative">
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 focus:outline-none group"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="rounded-full overflow-hidden border-2 border-transparent group-hover:border-violet-300 transition-all duration-300 relative"
                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Image
                        src={
                          user?.profilePicture?.url ||
                          "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        }
                        alt={`${user?.firstName || "User"}'s profile`}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover rounded-full"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                      <motion.div className="absolute inset-0 bg-gradient-to-tr from-violet-400/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-500 group-hover:text-violet-600 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </motion.button>

                  {/* User Dropdown Menu - Enhanced with better animations and visual appeal */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          duration: 0.2,
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-20"
                        role="menu"
                      >
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"
                          layoutId="userMenuTopBar"
                        />

                        <div className="p-4 border-b border-gray-100 relative">
                          <div className="flex items-start">
                            <div className="mr-3 flex-shrink-0">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                <Image
                                  src={
                                    user?.profilePicture?.url ||
                                    "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                  }
                                  alt={`${user?.firstName || "User"}'s profile`}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 flex items-center">
                                {user?.firstName} {user?.lastName}
                                {user?.role && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-violet-100 text-violet-800 rounded-full">
                                    {user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {user?.email || user?.phone || ""}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            whileHover={{ x: 3 }}
                          >
                            <Link
                              href={`/user/${user?.username}`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <User
                                size={16}
                                className="mr-3 text-violet-500"
                              />
                              Your Profile
                            </Link>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ x: 3 }}
                          >
                            <Link
                              href="/user/products"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <Briefcase
                                size={16}
                                className="mr-3 text-violet-500"
                              />
                              Your Products
                            </Link>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            whileHover={{ x: 3 }}
                          >
                            <Link
                              href="/user/history"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <Clock
                                size={16}
                                className="mr-3 text-violet-500"
                              />
                              View History
                            </Link>
                          </motion.div>

                          {/* Role-specific menu items */}
                          {user?.roleCapabilities?.canApplyToJobs && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              whileHover={{ x: 3 }}
                            >
                              <Link
                                href="/profile/applications"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                                role="menuitem"
                              >
                                <FileText
                                  size={16}
                                  className="mr-3 text-violet-500"
                                />
                                My Applications
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  New
                                </span>
                              </Link>
                            </motion.div>
                          )}

                          {user?.roleCapabilities?.canShowcaseProjects && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 }}
                              whileHover={{ x: 3 }}
                            >
                              <Link
                                href="/projects"
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                                role="menuitem"
                              >
                                <Layers
                                  size={16}
                                  className="mr-3 text-violet-500"
                                />
                                My Projects
                              </Link>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ x: 3 }}
                          >
                            <Link
                              href="/user/settings"
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                              role="menuitem"
                            >
                              <Settings
                                size={16}
                                className="mr-3 text-violet-500"
                              />
                              Settings
                            </Link>
                          </motion.div>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ x: 3 }}
                          >
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                handleLogout();
                              }}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              role="menuitem"
                            >
                              <LogOut size={16} className="mr-3" />
                              Log Out
                            </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Login/Register buttons for non-authenticated users - Enhanced with better animations and visual appeal
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm text-violet-600 hover:text-violet-800 font-medium rounded-md hover:bg-violet-50 transition-all border border-transparent hover:border-violet-200 flex items-center"
                  >
                    Log In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative overflow-hidden rounded-md"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0"
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-medium rounded-md transition-all flex items-center relative z-10"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Toggle - Enhanced with better animations and visual appeal */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full md:hidden focus:outline-none transition-all relative"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-violet-100 rounded-full opacity-0"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                  className="relative z-10"
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search (only visible on mobile) - Enhanced with better animations and visual appeal */}
        <div className="px-4 pb-3 sm:hidden">
          <motion.button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full mt-1 relative rounded-md border border-gray-200 flex items-center py-2.5 px-3 hover:border-violet-300 hover:shadow-sm transition-all group overflow-hidden"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 opacity-0"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="text-gray-400 mr-2 relative z-10"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Search size={16} />
            </motion.div>
            <span className="text-gray-600 text-sm flex-1 text-left group-hover:text-violet-700 transition-colors relative z-10">
              Search products, startups, etc...
            </span>
          </motion.button>
        </div>

        {/* Global Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />
      </header>

      {/* Mobile Menu Drawer - Enhanced with better animations and visual appeal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-16 right-0 bottom-0 w-4/5 max-w-sm bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden border-l border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"
                layoutId="mobileMenuTopBar"
              />
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                  {/* Mobile Navigation Items */}
                  <motion.nav
                    className="flex flex-col space-y-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                  >
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Link
                        href="/"
                        className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                          pathname === "/" || pathname === "/home"
                            ? "bg-violet-50 text-violet-700 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home size={18} className="mr-3" />
                        Home
                      </Link>
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Link
                        href="/products"
                        className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                          pathname === "/products" ||
                          pathname.startsWith("/products/")
                            ? "bg-violet-50 text-violet-700 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Grid size={18} className="mr-3" />
                        Products
                      </Link>
                    </motion.div>

                    {/* Categories section for mobile - Available to all users */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="mt-2"
                    >
                      <div className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-1 h-4 bg-violet-500 rounded-full mr-2"></div>
                          <h3 className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
                            Popular Categories
                          </h3>
                        </div>
                      </div>

                      {categories.length > 0 ? (
                        <div className="space-y-1 px-2 mt-1">
                          {categories.slice(0, 5).map((category, idx) => (
                            <motion.div
                              key={category._id || category.id || idx}
                              variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: { opacity: 1, x: 0 },
                              }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                href={`/category/${
                                  category.slug ||
                                  category.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                                }`}
                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-all duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="mr-3 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                  <CategoryIcon
                                    icon={category.icon}
                                    name={category.name}
                                    size={20}
                                  />
                                </div>
                                <span className="font-medium text-sm">
                                  {category.name}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                          <motion.div
                            variants={{
                              hidden: { opacity: 0, y: 5 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            className="px-4 py-2"
                          >
                            <Link
                              href="/categories"
                              className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              View All Categories
                              <ArrowRight size={14} className="ml-1" />
                            </Link>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 italic">
                          Loading categories...
                        </div>
                      )}
                    </motion.div>

                    {isAuthenticated() && (
                      <>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="mt-2"
                        >
                          <Link
                            href="/user/mybookmarks"
                            className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                              pathname === "/user/mybookmarks"
                                ? "bg-violet-50 text-violet-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Bookmark size={18} className="mr-3" />
                            Bookmarks
                          </Link>
                        </motion.div>

                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <Link
                            href="/user/history"
                            className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                              pathname === "/user/history"
                                ? "bg-violet-50 text-violet-700 font-medium"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Clock size={18} className="mr-3" />
                            History
                          </Link>
                        </motion.div>

                        {/* Role-based mobile navigation */}
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="mt-6 mb-2 px-4"
                        >
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Role Features
                          </h3>
                        </motion.div>

                        {/* Primary Role Features */}
                        {getRoleBasedNavItems()
                          .filter((item) => {
                            // Filter items based on primary role
                            const isPrimaryRoleItem =
                              user.role &&
                              item.roles &&
                              item.roles.includes(user.role);
                            return isPrimaryRoleItem;
                          })
                          .map((item, index) => (
                            <motion.div
                              key={`primary-${index}`}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                              }}
                            >
                              <Link
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                                  item.isActive
                                    ? "bg-violet-50 text-violet-700 font-medium"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.label}
                                {item.isNew && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          ))}

                        {/* Secondary Role Features */}
                        {user.secondaryRoles &&
                          user.secondaryRoles.length > 0 && (
                            <motion.div
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              className="mt-4 mb-2 px-4"
                            >
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Secondary Roles
                              </h3>
                            </motion.div>
                          )}

                        {getRoleBasedNavItems()
                          .filter((item) => {
                            // Filter items based on secondary roles
                            const isSecondaryRoleItem =
                              user.secondaryRoles &&
                              item.roles &&
                              user.secondaryRoles.some((role) =>
                                item.roles.includes(role)
                              );
                            return isSecondaryRoleItem;
                          })
                          .map((item, index) => (
                            <motion.div
                              key={`secondary-${index}`}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                              }}
                            >
                              <Link
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                                  item.isActive
                                    ? "bg-violet-50 text-violet-700 font-medium"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.label}
                                {item.isNew && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          ))}
                      </>
                    )}
                  </motion.nav>

                  {/* We've already added a more comprehensive Categories section above */}
                </div>
              </div>

              {/* Footer Actions - Enhanced with better animations and visual appeal */}
              <motion.div
                className="p-5 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isAuthenticated() &&
                  user?.roleCapabilities?.canUploadProducts && (
                    <motion.button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleProductSubmit();
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-4 py-3.5 text-sm font-medium transition-all flex items-center justify-center relative overflow-hidden group mb-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0"
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 0.3, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="relative z-10 flex items-center"
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className="mr-2 relative"
                          whileHover={{ rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Plus size={18} />
                        </motion.div>
                        <span>Submit Product</span>
                      </motion.div>
                    </motion.button>
                  )}

                {isAuthenticated() ? (
                  <motion.button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-3.5 text-sm font-medium transition-all flex items-center justify-center"
                    whileHover={{
                      scale: 1.02,
                      borderColor: "rgba(124, 58, 237, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={16} className="mr-2 text-gray-500" />
                    Log Out
                  </motion.button>
                ) : (
                  <div className="flex space-x-3">
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center border border-gray-300 hover:border-violet-300 hover:bg-violet-50 text-gray-700 hover:text-violet-700 rounded-lg px-3 py-3 text-sm font-medium transition-all flex items-center justify-center w-full"
                      >
                        <User size={16} className="mr-1.5 opacity-70" />
                        Log In
                      </Link>
                    </motion.div>
                    <motion.div
                      className="flex-1 relative overflow-hidden rounded-lg"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0"
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 0.3, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-3 py-3 text-sm font-medium transition-all flex items-center justify-center w-full relative z-10"
                      >
                        <Plus size={16} className="mr-1.5" />
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
