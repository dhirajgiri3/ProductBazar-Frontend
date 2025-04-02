"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import { useProduct } from "../../Contexts/Product/ProductContext";
import { useCategories } from "../../Contexts/Category/CategoryContext";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "../../Hooks/useOnClickOutside";
import { toast } from "react-hot-toast";

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
  const { user, isAuthenticated, logout, nextStep } = useAuth();
  const { searchProducts } = useProduct();
  const { categories = [] } = useCategories();

  // States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [bannerLink, setBannerLink] = useState("");

  // Refs
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useOnClickOutside(searchRef, () => {
    setIsSearchActive(false);
  });

  useOnClickOutside(userMenuRef, () => {
    setIsUserMenuOpen(false);
  });

  // Consolidated effect for onboarding and profile status
  useEffect(() => {
    if (isAuthenticated()) {
      // Check if user has pending onboarding steps
      if (nextStep) {
        setShowOnboardingBanner(true);
        
        // Set the appropriate banner link based on the next step type
        if (nextStep.type === "email_verification") {
          setBannerLink("/auth/verify-email");
        } else if (nextStep.type === "phone_verification") {
          setBannerLink("/auth/verify-phone");
        } else if (nextStep.type === "profile_completion") {
          setBannerLink("/complete-profile");
        } else {
          // Default fallback
          setBannerLink("/complete-profile");
        }
      } else {
        setShowOnboardingBanner(false);
        setBannerLink("");
      }
    } else {
      setShowOnboardingBanner(false);
      setBannerLink("");
    }
  }, [isAuthenticated, user, nextStep]);

  // redirect to login if user is not authenticated
  // useEffect(() => {
  //   if (!isAuthenticated() && pathname !== "/auth/login") {
  //     router.push("/auth/login");
  //   }
  // }, [isAuthenticated, pathname, router]);

  // Search implementation with debounce
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const results = await searchProducts(query, {
          limit: 5,
          natural_language: true,
        });

        if (results && results.products) {
          setSearchResults(results.products);
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchProducts]
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchActive(false);
      setSearchResults([]);
    }
  };

  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchActive(true);
        searchInputRef.current?.focus();
      }
      // Escape to close search
      if (e.key === "Escape") {
        setIsSearchActive(false);
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

    // If user has pending onboarding, complete that first
    if (nextStep) {
      toast.error("Please complete your profile first");
      handleCompleteOnboarding();
      return;
    }

    router.push("/add-product");
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
            <div ref={searchRef} className="relative hidden sm:block">
              <div
                className={`flex items-center relative rounded-md border ${
                  isSearchActive
                    ? "border-violet-300 ring-2 ring-violet-100"
                    : "border-gray-200"
                } px-3 py-2 w-64 md:w-80 transition-all`}
                onClick={() => setIsSearchActive(true)}
              >
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  id="search-input"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, startups, etc..."
                  className="bg-transparent border-none focus:outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchActive(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                  aria-expanded={isSearchActive}
                  aria-controls="search-results"
                />
                <div className="hidden md:flex items-center border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-500">
                  ⌘K
                </div>
              </div>

              {/* Search Results Dropdown */}
              {isSearchActive && (
                <div
                  id="search-results"
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-30"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-pulse">Searching...</div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((product) => (
                          <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            onClick={() => setIsSearchActive(false)}
                          >
                            <div className="flex items-start">
                              {product.thumbnail && (
                                <img
                                  src={product.thumbnail}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover mr-3"
                                  onError={(e) => {
                                    e.target.src =
                                      "/images/default-product.png";
                                  }}
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-sm text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {product.tagline || product.description}
                                </p>
                                {product.categoryName && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs">
                                    {product.categoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="block w-full text-center py-2 text-violet-600 hover:bg-violet-50 rounded-md text-sm font-medium transition-colors"
                          onClick={() => setIsSearchActive(false)}
                        >
                          View all results
                        </Link>
                      </div>
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Try searching for:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["AI tools", "SaaS", "Marketing", "Design"].map(
                          (term) => (
                            <button
                              key={term}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-800 transition-colors"
                              onClick={() => {
                                setSearchQuery(term);
                                debouncedSearch(term);
                              }}
                            >
                              {term}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              <NavItem
                label="Bookmarks"
                isActive={pathname === "/bookmarks"}
                href="/bookmarks"
              />
            )}
          </nav>

          {/* Right Section: Actions, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Submit Button */}
            <button
              onClick={handleProductSubmit}
              className="hidden md:flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
              aria-label="Submit a product"
            >
              <Plus size={16} className="mr-1" />
              Submit
            </button>

            {isAuthenticated() ? (
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
                          "/images/default-avatar.png"
                        }
                        alt={`${user?.firstName || "User"}'s profile`}
                        className="w-8 h-8 object-cover rounded-full"
                        onError={(e) => {
                          e.target.src = "/images/default-avatar.png";
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
          <form onSubmit={handleSearchSubmit} className="mt-1">
            <div className="relative rounded-md border border-gray-200 flex items-center">
              <Search size={16} className="ml-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-2 pl-2 pr-4 focus:outline-none text-sm"
                aria-label="Search"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
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
                    className={`px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/"
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className={`px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/products"
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/categories"
                    className={`px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/categories"
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/trending"
                    className={`px-4 py-3 rounded-lg text-gray-800 ${
                      pathname === "/trending"
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trending
                  </Link>
                  {isAuthenticated() && (
                    <Link
                      href="/bookmarks"
                      className={`px-4 py-3 rounded-lg text-gray-800 ${
                        pathname === "/bookmarks"
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Bookmarks
                    </Link>
                  )}
                </nav>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 mb-2">
                      Browse by Category
                    </h3>
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
                  </div>
                )}
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

      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <p className="text-white text-sm">
              {nextStep?.message ||
                "Complete your profile to unlock all features"}
            </p>
            <Link href={bannerLink || "/complete-profile"}>
              <button
                onClick={() => {
                  setShowOnboardingBanner(false);
                  handleCompleteOnboarding();
                }}
                className="bg-white text-violet-600 hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                {nextStep?.actionLabel || "Complete Now"}
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
