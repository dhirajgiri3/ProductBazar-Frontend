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
  DollarSign,
  Layers,
  Code,
  Users,
  Bookmark,
  Home,
  Grid,
  Folder,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext"; // Keep for future use
import { useCategories } from "../../Contexts/Category/CategoryContext";
import { useOnClickOutside } from "../../Hooks/useOnClickOutside";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingBanner from "./OnboardingBanner";
import SearchModal from "../Modal/Search/SearchModal";
import CategoryIcon from "../UI/CategoryIcon"; // Assumed to be theme-aware
import ThemeToggle from "../UI/ThemeToggle/ThemeToggle"; // Assumed to be theme-aware

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
        isActive
          ? "text-violet-600 dark:text-violet-400"
          : "text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-300"
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full shadow-sm dark:shadow-violet-500/30"
          layoutId="navIndicator"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
);

const NewBadge = () => (
  <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 rounded-full ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30">
    New
  </span>
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
  // const { isDarkMode } = useTheme(); // Can be used if direct style manipulation is needed

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchQuery = "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isHoveredLogo, setIsHoveredLogo] = useState(false);

  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useOnClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useOnClickOutside(roleMenuRef, () => setShowRoleMenu(false));
  useOnClickOutside(categoryMenuRef, () => setShowCategoryMenu(false));

  const getRoleBasedNavItems = useCallback(() => {
    if (!user || !user.roleCapabilities) return [];
    const items = [];
    const isPrimaryAdmin = user.role === "admin";
    const isSecondaryAdmin = user.secondaryRoles?.includes("admin");

    if (isPrimaryAdmin || isSecondaryAdmin) {
      items.push({
        label: "Admin Dashboard",
        href: "/admin/users",
        isActive: pathname.startsWith("/admin"),
        icon: <Users size={16} />,
        isNew: true,
      });
    }
    if (user.roleCapabilities.canApplyToJobs) {
      items.push({
        label: "Jobs",
        href: "/jobs",
        isActive: pathname.startsWith("/jobs") && !pathname.includes("/post"),
        icon: <Briefcase size={16} />,
      });
      items.push({
        label: "My Applications",
        href: "/profile/applications",
        isActive: pathname.startsWith("/profile/applications"),
        icon: <FileText size={16} />,
      });
    }
    if (user.roleCapabilities.canPostJobs) {
      items.push({
        label: "Post Job",
        href: "/jobs/post",
        isActive: pathname === "/jobs/post",
        icon: <Plus size={16} />,
      });
    }
    if (user.roleCapabilities.canShowcaseProjects) {
      items.push({
        label: "Projects",
        href: "/projects",
        isActive: pathname.startsWith("/projects"),
        icon: <Layers size={16} />,
      });
    }
    if (user.roleCapabilities.canOfferServices) {
      items.push({
        label: "Services",
        href: "/services",
        isActive: pathname.startsWith("/services"),
        icon: <Code size={16} />,
      });
    }
    if (user.roleCapabilities.canInvest) {
      items.push({
        label: "Invest",
        href: "/invest",
        isActive: pathname.startsWith("/invest"),
        icon: <DollarSign size={16} />,
      });
    }
    return items;
  }, [user, pathname]);

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      setShowOnboardingBanner(false);
      return;
    }
    const allStepsCompleted =
      user.isEmailVerified && user.isPhoneVerified && user.isProfileCompleted;
    if (allStepsCompleted) {
      setShowOnboardingBanner(false);
      if (nextStep) refreshNextStep();
    } else if (nextStep) {
      setShowOnboardingBanner(true);
    } else {
      refreshNextStep();
      setShowOnboardingBanner(false);
    }
  }, [isAuthenticated, user, nextStep, refreshNextStep]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleProductSubmit = () => {
    if (!isAuthenticated()) {
      toast.error("Please log in to submit a product");
      router.push("/auth/login");
      return;
    }
    if (
      nextStep &&
      (nextStep.type === "email_verification" ||
        nextStep.type === "phone_verification")
    ) {
      toast.error("Please verify your contact information first");
      handleCompleteOnboarding();
      return;
    }
    if (user?.roleCapabilities?.canUploadProducts) {
      router.push("/product/new");
    } else {
      toast.error("Your current role doesn't allow product submissions");
      router.push("/user/settings");
    }
  };

  const handleCompleteOnboarding = () => {
    if (!nextStep) return;
    if (nextStep.type === "email_verification")
      router.push("/auth/verify-email");
    else if (nextStep.type === "phone_verification")
      router.push("/auth/verify-phone");
    else if (nextStep.type === "profile_completion")
      router.push("/complete-profile");
  };

  return (
    <>
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
                toast.loading("Refreshing verification status...", {
                  id: "refresh-toast",
                });
                try {
                  const result = await Promise.resolve(refreshNextStep());
                  setTimeout(() => {
                    toast.success(
                      result
                        ? "Verification status updated"
                        : "All steps completed!",
                      { id: "refresh-toast" }
                    );
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

      <header className="bg-white dark:bg-gray-900/95 sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/home" aria-label="Go to Home">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-violet-500 via-violet-700 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden group"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, rotate: -15, y: 10 }}
                  animate={{ opacity: 1, rotate: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1,
                  }}
                  onHoverStart={() => setIsHoveredLogo(true)}
                  onHoverEnd={() => setIsHoveredLogo(false)}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.span
                      className="absolute text-md font-bold tracking-wider"
                      initial={{ y: 0 }}
                      animate={{ y: isHoveredLogo ? -30 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      PB
                    </motion.span>
                    <motion.div
                      className="absolute text-white"
                      initial={{ y: 30 }}
                      animate={{ y: isHoveredLogo ? 0 : 30 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <Home size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            <div className="relative hidden sm:block ml-4">
              <motion.button
                className="flex items-center relative rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 w-64 md:w-80 transition-all hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md dark:hover:shadow-violet-700/20 group"
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
                  className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 opacity-0 rounded-md group-hover:opacity-100"
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="text-gray-400 dark:text-gray-500 mr-2 relative group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search size={16} />
                </motion.div>
                <span className="text-gray-600 dark:text-gray-400 text-sm flex-1 text-left group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors relative z-10">
                  Search products, startups, etc...
                </span>
                <motion.div
                  className="hidden md:flex items-center border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400 relative z-10 bg-gray-50 dark:bg-gray-700/50 backdrop-blur-sm group-hover:border-violet-400 dark:group-hover:border-violet-500 group-hover:text-violet-600 dark:group-hover:text-violet-300 group-hover:bg-violet-100 dark:group-hover:bg-violet-700/30"
                  transition={{ duration: 0.2 }}
                >
                  ⌘K
                </motion.div>
              </motion.button>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavItem
              label="Home"
              isActive={pathname === "/" || pathname === "/home"}
              href="/home"
            />
            <NavItem
              label="Products"
              isActive={
                pathname === "/products" || pathname.startsWith("/products/")
              }
              href="/products"
            />

            <div className="relative" ref={categoryMenuRef}>
              <motion.button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`px-3 py-2 text-sm font-medium transition-colors flex items-center relative ${
                  pathname.startsWith("/category")
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-300"
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
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
                    layoutId="navIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
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
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl dark:shadow-black/30 overflow-hidden z-20 backdrop-blur-md"
                  >
                    <motion.div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 p-2 rounded-full bg-violet-100 dark:bg-violet-500/20">
                          <Grid
                            size={20}
                            className="text-violet-600 dark:text-violet-300"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Browse Categories
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Discover products by category
                          </div>
                        </div>
                      </div>
                    </div>
                    {categories.length > 0 ? (
                      <div className="max-h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar">
                        {categories.slice(0, 8).map((category, index) => (
                          <motion.div
                            key={category._id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={`/category/${
                                category.slug ||
                                category.name.toLowerCase().replace(/\s+/g, "-")
                              }`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-800/60 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-150"
                              onClick={() => setShowCategoryMenu(false)}
                            >
                              <span className="mr-3 text-violet-500 dark:text-violet-400">
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
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href="/categories"
                            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 font-medium flex items-center justify-center transition-colors"
                            onClick={() => setShowCategoryMenu(false)}
                          >
                            View All Categories{" "}
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
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
                <div className="relative" ref={roleMenuRef}>
                  <motion.button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center relative ${
                      getRoleBasedNavItems().some((item) => item.isActive)
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-300"
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
                    {getRoleBasedNavItems().some((item) => item.isActive) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
                        layoutId="navIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
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
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl dark:shadow-black/30 overflow-hidden z-20 backdrop-blur-md"
                      >
                        <motion.div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="mr-3 flex-shrink-0 p-2 rounded-full bg-violet-100 dark:bg-violet-500/20">
                              <Folder
                                size={20}
                                className="text-violet-600 dark:text-violet-300"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                Your Features
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Role-specific features
                              </div>
                            </div>
                          </div>
                        </div>
                        {getRoleBasedNavItems().length > 0 ? (
                          <div className="max-h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar py-1">
                            {getRoleBasedNavItems().map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={item.href}
                                  className={`flex items-center px-4 py-2.5 text-sm transition-colors duration-150 ${
                                    item.isActive
                                      ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium"
                                      : "text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-800/60 hover:text-violet-700 dark:hover:text-violet-300"
                                  }`}
                                  onClick={() => setShowRoleMenu(false)}
                                >
                                  <span className="mr-3 text-violet-500 dark:text-violet-400">
                                    {item.icon}
                                  </span>
                                  <span>{item.label}</span>
                                  {item.isNew && <NewBadge />}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                            No features available for your role(s).
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {isInitialized &&
              isAuthenticated() &&
              user?.roleCapabilities?.canUploadProducts && (
                <motion.button
                  onClick={handleProductSubmit}
                  className="hidden md:flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full px-5 py-2 text-sm font-medium relative overflow-hidden group shadow-sm hover:shadow-lg transition-shadow"
                  aria-label="Submit a product"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <motion.div className="relative z-10 flex items-center">
                    <motion.div className="mr-1.5 group-hover:rotate-90 transition-transform duration-200">
                      <Plus size={16} />
                    </motion.div>
                    <span>Submit Product</span>
                  </motion.div>
                </motion.button>
              )}

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ThemeToggle
                size="small"
                className="shadow-sm rounded-full p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              />
            </motion.div>

            {!isInitialized ? (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : isAuthenticated() ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Link
                    href="/notifications"
                    className="relative p-1.5 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-700/30 rounded-full transition-colors flex items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {user?.unreadNotifications > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
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
                      className="absolute inset-0 rounded-full border-2 border-violet-300 dark:border-violet-500 opacity-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    />
                  )}
                </motion.div>

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
                      className="rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-violet-300 dark:group-hover:border-violet-500 transition-all duration-300 relative"
                      whileHover={{ rotate: [0, -3, 3, -3, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Image
                        src={
                          user?.profilePicture?.url ||
                          `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`
                        }
                        alt={`${user?.firstName || "User"}'s profile`}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover rounded-full"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=User&background=random&color=fff`;
                        }}
                      />
                      <motion.div className="absolute inset-0 bg-gradient-to-tr from-violet-400/10 to-indigo-500/10 dark:from-violet-600/20 dark:to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </motion.button>
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
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl dark:shadow-black/30 overflow-hidden z-20 backdrop-blur-md"
                        role="menu"
                      >
                        <motion.div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="mr-3 flex-shrink-0">
                              <Image
                                src={
                                  user?.profilePicture?.url ||
                                  `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`
                                }
                                alt={`${user?.firstName || "User"}'s profile`}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover rounded-full border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                {user?.firstName} {user?.lastName}
                                {user?.role && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-full">
                                    {user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {user?.email || user?.phone || ""}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          {[
                            {
                              href: `/user/${user?.username}`,
                              label: "Your Profile",
                              icon: User,
                              delay: 0.05,
                            },
                            {
                              href: "/user/products",
                              label: "Your Products",
                              icon: Briefcase,
                              delay: 0.1,
                            },
                            {
                              href: "/user/history",
                              label: "View History",
                              icon: Clock,
                              delay: 0.15,
                            },
                            ...(user?.roleCapabilities?.canApplyToJobs
                              ? [
                                  {
                                    href: "/profile/applications",
                                    label: "My Applications",
                                    icon: FileText,
                                    isNew: true,
                                    delay: 0.2,
                                  },
                                ]
                              : []),
                            ...(user?.roleCapabilities?.canShowcaseProjects
                              ? [
                                  {
                                    href: "/projects",
                                    label: "My Projects",
                                    icon: Layers,
                                    delay: 0.25,
                                  },
                                ]
                              : []),
                            {
                              href: "/user/settings",
                              label: "Settings",
                              icon: Settings,
                              delay: 0.3,
                            },
                          ].map((item) => (
                            <motion.div
                              key={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: item.delay }}
                            >
                              <Link
                                href={item.href}
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-800/60 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-150"
                                onClick={() => setIsUserMenuOpen(false)}
                                role="menuitem"
                              >
                                <item.icon
                                  size={16}
                                  className="mr-3 text-violet-500 dark:text-violet-400"
                                />
                                {item.label}
                                {item.isNew && <NewBadge />}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                        <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                          >
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                handleLogout();
                              }}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-150"
                              role="menuitem"
                            >
                              <LogOut size={16} className="mr-3" /> Log Out
                            </button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href="/auth/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 font-medium rounded-md hover:bg-violet-100 dark:hover:bg-violet-700/30 transition-all border border-transparent hover:border-violet-200 dark:hover:border-violet-600"
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
                  className="relative overflow-hidden rounded-md shadow-sm hover:shadow-lg transition-shadow"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <Link
                    href="/auth/register"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-medium rounded-md transition-all relative z-10"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-700/30 rounded-full md:hidden focus:outline-none transition-all relative"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence initial={false} mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className="relative z-10"
                  >
                    {" "}
                    <X size={22} />{" "}
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className="relative z-10"
                  >
                    {" "}
                    <Menu size={22} />{" "}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <div className="px-4 pb-3 sm:hidden border-t border-gray-200 dark:border-gray-800/50">
          <motion.button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full mt-2 relative rounded-md border border-gray-300 dark:border-gray-700 flex items-center py-2.5 px-3 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-sm transition-all group overflow-hidden bg-white dark:bg-gray-800"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <motion.div className="text-gray-400 dark:text-gray-500 mr-2 relative z-10 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
              {" "}
              <Search size={16} />{" "}
            </motion.div>
            <span className="text-gray-600 dark:text-gray-400 text-sm flex-1 text-left group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors relative z-10">
              Search products, startups...
            </span>
          </motion.button>
        </div>

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/50 dark:bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-2xl dark:shadow-black/40 overflow-hidden border-l border-gray-200 dark:border-gray-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <div className="flex-1 overflow-y-auto p-4 pt-6 hide-scrollbar">
                <motion.nav
                  className="flex flex-col space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {[
                    {
                      href: "/",
                      label: "Home",
                      icon: Home,
                      activeCondition: pathname === "/" || pathname === "/home",
                    },
                    {
                      href: "/products",
                      label: "Products",
                      icon: Grid,
                      activeCondition:
                        pathname === "/products" ||
                        pathname.startsWith("/products/"),
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2.5 rounded-lg text-base transition-colors ${
                          item.activeCondition
                            ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon
                          size={20}
                          className={`mr-3 ${
                            item.activeCondition
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />{" "}
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="pt-4"
                  >
                    <div className="px-3 py-2 mb-1">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categories
                      </h3>
                    </div>
                    {categories.length > 0 ? (
                      <div className="space-y-1">
                        {categories.slice(0, 5).map((category, idx) => (
                          <motion.div
                            key={category._id || idx}
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: { opacity: 1, x: 0 },
                            }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <Link
                              href={`/category/${
                                category.slug ||
                                category.name.toLowerCase().replace(/\s+/g, "-")
                              }`}
                              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-800/60 hover:text-violet-700 dark:hover:text-violet-300 rounded-lg transition-all duration-150"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="mr-3 flex-shrink-0 w-5 h-5 flex items-center justify-center text-violet-500 dark:text-violet-400">
                                <CategoryIcon
                                  icon={category.icon}
                                  name={category.name}
                                  size={18}
                                />
                              </div>
                              <span className="text-sm font-medium">
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
                          className="px-3 py-2"
                        >
                          <Link
                            href="/categories"
                            className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium flex items-center"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            View All Categories{" "}
                            <ArrowRight size={14} className="ml-1" />
                          </Link>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                        Loading...
                      </div>
                    )}
                  </motion.div>

                  {isAuthenticated() && (
                    <>
                      {[
                        {
                          href: "/user/mybookmarks",
                          label: "Bookmarks",
                          icon: Bookmark,
                          activeCondition: pathname === "/user/mybookmarks",
                        },
                        {
                          href: "/user/history",
                          label: "History",
                          icon: Clock,
                          activeCondition: pathname === "/user/history",
                        },
                      ].map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="pt-2"
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-lg text-base transition-colors ${
                              item.activeCondition
                                ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon
                              size={20}
                              className={`mr-3 ${
                                item.activeCondition
                                  ? "text-violet-600 dark:text-violet-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            />{" "}
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}

                      {getRoleBasedNavItems().length > 0 && (
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="pt-4"
                        >
                          <div className="px-3 py-2 mb-1">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Your Features
                            </h3>
                          </div>
                          {getRoleBasedNavItems().map((item, index) => (
                            <motion.div
                              key={`role-${index}`}
                              variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: { opacity: 1, x: 0 },
                              }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Link
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-base transition-colors ${
                                  item.isActive
                                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span
                                  className={`mr-3 ${
                                    item.isActive
                                      ? "text-violet-600 dark:text-violet-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                {item.label}
                                {item.isNew && <NewBadge />}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.nav>
              </div>

              <motion.div
                className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isAuthenticated() &&
                  user?.roleCapabilities?.canUploadProducts && (
                    <motion.button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleProductSubmit();
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-all flex items-center justify-center relative overflow-hidden group mb-3 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      <motion.div className="relative z-10 flex items-center">
                        <motion.div className="mr-2 group-hover:rotate-90 transition-transform duration-200">
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
                    className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-3 text-sm font-medium transition-all flex items-center justify-center"
                    whileHover={{
                      scale: 1.02,
                      borderColor: "rgba(124, 58, 237, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut
                      size={16}
                      className="mr-2 text-gray-500 dark:text-gray-400"
                    />{" "}
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
                        className="flex-1 text-center border border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-700/30 text-gray-700 dark:text-gray-200 hover:text-violet-700 dark:hover:text-violet-300 rounded-lg px-3 py-2.5 text-sm font-medium transition-all flex items-center justify-center w-full"
                      >
                        <User size={16} className="mr-1.5 opacity-70" /> Log In
                      </Link>
                    </motion.div>
                    <motion.div
                      className="flex-1 relative overflow-hidden rounded-lg shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all flex items-center justify-center w-full relative z-10"
                      >
                        <Plus size={16} className="mr-1.5" /> Sign Up
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
