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
  TrendingUp,
  Folder,
} from "lucide-react";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";
import { useCategories } from "../../Contexts/Category/CategoryContext";
import { useOnClickOutside } from "../../Hooks/useOnClickOutside";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingBanner from "./OnboardingBanner";
import SearchModal from "../Modal/Search/SearchModal";

const NavItem = ({ label, isActive, href, onClick }) => (
  <Link
    href={href || "#"}
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-violet-600 border-b-2 border-violet-600"
        : "text-gray-700 hover:text-violet-600"
    }`}
  >
    {label}
  </Link>
);

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    logout,
    nextStep,
    authLoading,
    isInitialized,
    skipProfileCompletion,
    refreshNextStep,
  } = useAuth();
  const { searchProducts } = useProduct();
  const {
    categories = [],
    error: categoryError,
    retryFetchCategories,
  } = useCategories();

  // States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Refs
  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);

  useOnClickOutside(userMenuRef, () => {
    setIsUserMenuOpen(false);
  });

  useOnClickOutside(roleMenuRef, () => {
    setShowRoleMenu(false);
  });

  // Get role-specific navigation items
  const getRoleBasedNavItems = useCallback(() => {
    if (!user || !user.roleCapabilities) return [];

    const items = [];

    // Add admin-specific navigation items
    if (user.role === "admin") {
      items.push({
        label: "Admin Dashboard",
        href: "/admin/users",
        isActive: pathname.startsWith("/admin"),
        icon: <Users size={16} />,
        isNew: true,
      });
    }

    // Add role-specific navigation items
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

  // Consolidated effect for onboarding and profile status
  useEffect(() => {
    // Only show banner for authenticated users
    if (!isAuthenticated() || !user) {
      setShowOnboardingBanner(false);
      return;
    }

    // Check if all steps are completed
    const allStepsCompleted = user.isEmailVerified && user.isPhoneVerified && user.isProfileCompleted;

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
      {/* Onboarding Banner - Placed at the top of the page, outside the sticky header */}
      {showOnboardingBanner && nextStep ? (
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
            toast.loading('Refreshing verification status...', { id: 'refresh-toast' });
            // Refresh next step
            try {
              const result = await Promise.resolve(refreshNextStep());
              // Show success toast
              setTimeout(() => {
                if (result) {
                  toast.success('Verification status updated', { id: 'refresh-toast' });
                } else {
                  toast.success('All steps completed!', { id: 'refresh-toast' });
                }
              }, 500);
            } catch (error) {
              toast.error('Failed to refresh status', { id: 'refresh-toast' });
            }
          }}
        />
      ) : null}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Left Section: Logo and Search */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/home" className="mr-4 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                PB
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="relative hidden sm:block">
              <button
                className="flex items-center relative rounded-md border border-gray-200 px-3 py-2 w-64 md:w-80 transition-all hover:border-violet-300 hover:ring-1 hover:ring-violet-100"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <Search size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-500 text-sm flex-1 text-left">
                  Search products, startups, etc...
                </span>
                <div className="hidden md:flex items-center border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-500">
                  ⌘K
                </div>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
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
            <NavItem
              label="Categories"
              isActive={
                pathname === "/categories" || pathname.startsWith("/category/")
              }
              href="/categories"
            />
            <NavItem
              label="Trending"
              isActive={pathname === "/trending"}
              href="/trending"
            />
            {isAuthenticated() && (
              <>
                <NavItem
                  label="Bookmarks"
                  isActive={pathname === "/bookmarks"}
                  href="/bookmarks"
                />

                {/* Role-based navigation dropdown */}
                <div ref={roleMenuRef} className="relative">
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                      pathname.startsWith("/jobs") ||
                      pathname.startsWith("/projects") ||
                      pathname.startsWith("/services") ||
                      pathname.startsWith("/invest") ||
                      pathname.startsWith("/profile/applications")
                        ? "text-violet-600"
                        : "text-gray-700 hover:text-violet-600"
                    }`}
                  >
                    <span>Features</span>
                    <ChevronDown
                      size={16}
                      className={`ml-1 transition-transform ${
                        showRoleMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Role-based menu dropdown */}
                  <AnimatePresence>
                    {showRoleMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-1"
                      >
                        {getRoleBasedNavItems().map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center px-4 py-2 text-sm ${
                              item.isActive
                                ? "bg-violet-50 text-violet-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => setShowRoleMenu(false)}
                          >
                            <span className="mr-2">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.isNew && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                New
                              </span>
                            )}
                          </Link>
                        ))}

                        {getRoleBasedNavItems().length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500">
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

          {/* Right Section: Actions, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Submit Button - Only show for users who can upload products */}
            {isInitialized &&
              isAuthenticated() &&
              user?.roleCapabilities?.canUploadProducts && (
                <button
                  onClick={handleProductSubmit}
                  className="hidden md:flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  aria-label="Submit a product"
                >
                  <Plus size={16} className="mr-1" />
                  Submit
                </button>
              )}

            {!isInitialized ? (
              // Show skeleton loader while auth is initializing
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ) : isAuthenticated() ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {user?.unreadNotifications > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                      aria-label={`${user.unreadNotifications} unread notifications`}
                    >
                      {user.unreadNotifications > 9
                        ? "9+"
                        : user.unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="rounded-full overflow-hidden border-2 border-transparent hover:border-violet-200 transition-colors">
                      <img
                        src={
                          user?.profilePicture?.url ||
                          "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        }
                        alt={`${user?.firstName || "User"}'s profile`}
                        className="w-8 h-8 object-cover rounded-full"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                    </div>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden z-20"
                      role="menu"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <div className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user?.email || user?.phone || ""}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/user"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <User size={16} className="mr-2" />
                          Your Profile
                        </Link>

                        <Link
                          href="/user/products"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <Briefcase size={16} className="mr-2" />
                          Your Products
                        </Link>

                        {/* Role-specific menu items */}
                        {user?.roleCapabilities?.canApplyToJobs && (
                          <Link
                            href="/profile/applications"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <FileText size={16} className="mr-2" />
                            My Applications
                            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              New
                            </span>
                          </Link>
                        )}

                        {user?.roleCapabilities?.canShowcaseProjects && (
                          <Link
                            href="/projects"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <Layers size={16} className="mr-2" />
                            My Projects
                          </Link>
                        )}

                        <Link
                          href="/user/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <Settings size={16} className="mr-2" />
                          Settings
                        </Link>
                      </div>

                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          role="menuitem"
                        >
                          <LogOut size={16} className="mr-2" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Login/Register buttons for non-authenticated users
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium rounded-md hover:bg-violet-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-700 font-medium rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full md:hidden focus:outline-none transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search (only visible on mobile) */}
        <div className="px-4 pb-3 sm:hidden">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full mt-1 relative rounded-md border border-gray-200 flex items-center py-2 px-3"
          >
            <Search size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-500 text-sm flex-1 text-left">
              Search products...
            </span>
          </button>
        </div>

        {/* Global Search Modal */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute top-16 right-0 bottom-0 w-3/4 max-w-sm bg-white shadow-xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4">
                {/* Mobile Navigation Items */}
                <nav className="flex flex-col space-y-1">
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
                  <Link
                    href="/categories"
                    className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/categories" ||
                      pathname.startsWith("/category/")
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Folder size={18} className="mr-3" />
                    Categories
                  </Link>
                  <Link
                    href="/trending"
                    className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/trending"
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <TrendingUp size={18} className="mr-3" />
                    Trending
                  </Link>
                  {isAuthenticated() && (
                    <>
                      <Link
                        href="/bookmarks"
                        className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                          pathname === "/bookmarks"
                            ? "bg-violet-50 text-violet-700 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bookmark size={18} className="mr-3" />
                        Bookmarks
                      </Link>

                      {/* Role-based mobile navigation */}
                      <div className="mt-4 mb-2 px-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Features
                        </h3>
                      </div>

                      {getRoleBasedNavItems().map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className={`flex items-center px-4 py-3 rounded-lg text-gray-800 ${
                            item.isActive
                              ? "bg-violet-50 text-violet-700 font-medium"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                          {item.isNew && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              New
                            </span>
                          )}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>

                {/* Categories */}
                <div className="mt-6">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 mb-2">
                    Browse by Category
                  </h3>

                  {categoryError ? (
                    <div className="px-4 py-3 text-sm text-red-600 bg-red-50 rounded-lg mx-2">
                      <p className="mb-2">Error loading categories</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          retryFetchCategories();
                        }}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="space-y-1">
                      {categories.slice(0, 6).map((category) => (
                        <Link
                          key={category._id || category.id}
                          href={`/category/${
                            category.slug ||
                            category.name.toLowerCase().replace(/\s+/g, "-")
                          }`}
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="text-lg mr-2">
                            {category.icon || "📁"}
                          </span>
                          <span>{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      <div className="animate-pulse flex space-x-2">
                        <div className="rounded-full bg-gray-200 h-5 w-5"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleProductSubmit();
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-1" />
                  Submit a Product
                </button>

                {isAuthenticated() ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                  >
                    Log Out
                  </button>
                ) : (
                  <div className="flex mt-3 space-x-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
