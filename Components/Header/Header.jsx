'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/auth-context';
import { useWaitlist } from '@/lib/contexts/waitlist-context';
import { toast } from 'react-hot-toast';
import OnboardingBanner from './OnboardingBanner.jsx';
import SearchModal from '../Modal/Search/SearchModal.jsx';

// Import modular components
import HeaderNavigation from './HeaderNavigation';
import AuthSection from './HeaderAuth';
import HeaderMobile from './HeaderMobile';

// Import utilities
import {
  useSmartMenuLayout,
  getAllUserMenus,
  useScreenWidth,
  getMenuItemStyle,
  getMenuDescription,
} from './HeaderUtils';

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
    authLoading,
  } = useAuth();
  const { isWaitlistEnabled, queueStats } = useWaitlist();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  // Screen width tracking for responsive behavior
  const screenWidth = useScreenWidth();

  // Enhanced menu configuration with better role-based logic
  const allUserMenus = getAllUserMenus(isAuthenticated, user, pathname);
  const {
    primary: primaryMenus,
    more: moreMenus,
    userDropdown: organizedUserMenus,
    showSubmitButton,
    stats,
  } = useSmartMenuLayout(allUserMenus, screenWidth, user);

  // Debug info (remove in production)
  console.log('Smart Menu Distribution:', stats);

  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = useCallback(() => {
    // Provide immediate visual feedback
    toast.loading('Logging out...', { id: 'logout-toast' });

    // Fire-and-forget: we don't await to avoid blocking UI
    logout();

    // Optimistic success toast – will be cleared on new page load anyway
    toast.success('Logged out successfully', { id: 'logout-toast' });

    // Instant redirect to login page
    window.location.href = '/auth/login';
  }, [logout]);

  const handleProductSubmit = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a product');
      router.push('/auth/login');
      return;
    }
    if (
      nextStep &&
      (nextStep.type === 'email_verification' || nextStep.type === 'phone_verification')
    ) {
      toast.error('Please verify your contact information first');
      router.push(`/auth/verify-${nextStep.type.split('_')[0]}`);
      return;
    }
    if (user?.roleCapabilities?.canUploadProducts) {
      router.push('/product/new');
    } else {
      toast.error("Your current role doesn't allow product submissions");
      router.push('/user/settings');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isInitialized && isAuthenticated && nextStep && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <OnboardingBanner
              nextStep={nextStep}
              onComplete={() => router.push(`/auth/verify-${nextStep.type.split('_')[0]}`)}
              onSkip={() => {
                skipProfileCompletion();
                refreshNextStep();
              }}
              onRefresh={async () => {
                toast.loading('Refreshing verification status...', { id: 'refresh-toast' });
                try {
                  await refreshNextStep();
                  toast.success('Verification status updated', { id: 'refresh-toast' });
                } catch (error) {
                  toast.error('Failed to refresh status', { id: 'refresh-toast' });
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Header with improved sticky behavior */}
      <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-200/60 supports-[backdrop-filter]:bg-white/95 will-change-transform">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 sm:px-6">
          {/* Enhanced Logo Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/products" aria-label="ProductBazar - Go to homepage">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold relative overflow-hidden transition-all duration-150 hover:scale-105 hover:shadow-lg group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent group-hover:from-white/30 transition-all duration-150" />
                <span className="relative z-10 text-sm sm:text-lg group-hover:scale-110 transition-transform duration-150">
                  PB
                </span>
              </div>
            </Link>

            {/* Enhanced Desktop Search Bar - Responsive */}
            <button
              className="hidden sm:flex items-center w-48 md:w-72 lg:w-96 h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl border border-gray-200/80 hover:border-violet-400/80 bg-gradient-to-r from-gray-50/90 to-white/90 hover:from-white hover:to-violet-50/50 text-gray-500 hover:text-violet-600 transition-all duration-150 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 relative backdrop-blur-sm group"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search"
            >
              <Search
                size={16}
                className="mr-3 sm:mr-4 text-violet-500 group-hover:text-violet-600 transition-colors"
              />
              <span className="text-xs sm:text-sm font-medium truncate">Search products, startups...</span>
              <span className="absolute right-2 sm:right-4 text-xs text-gray-400 bg-gray-100/80 group-hover:bg-violet-100/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono transition-all border border-gray-200/50">
                ⌘K
              </span>
            </button>

            {/* Waitlist Status Indicator for Admin - Responsive */}
            {(user?.role === 'admin' || user?.secondaryRoles?.includes('admin')) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm"
              >
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    isWaitlistEnabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs font-medium text-gray-600">
                  Waitlist: {isWaitlistEnabled ? 'Active' : 'Inactive'}
                </span>
                {isWaitlistEnabled && queueStats?.waiting && (
                  <span className="text-xs text-gray-500">
                    ({queueStats.waiting.toLocaleString()} waiting)
                  </span>
                )}
                <Link
                  href="/admin/waitlist"
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  Manage
                </Link>
              </motion.div>
            )}
          </div>

          {/* Desktop Navigation */}
          <HeaderNavigation
            primaryMenus={primaryMenus}
            moreMenus={moreMenus}
            getMenuItemStyle={getMenuItemStyle}
            getMenuDescription={getMenuDescription}
          />

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Smart Submit Product Button - Responsive */}
            {isInitialized &&
              isAuthenticated &&
              user?.roleCapabilities?.canUploadProducts &&
              showSubmitButton && (
                <motion.button
                  onClick={handleProductSubmit}
                  className="hidden md:flex items-center px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 rounded-xl sm:rounded-2xl transition-all duration-150 border border-violet-500/20 relative overflow-hidden group shadow-lg"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  <Plus size={16} className="mr-1.5 sm:mr-2 relative z-10" />
                  <span className="relative z-10 whitespace-nowrap">Submit Product</span>
                </motion.button>
              )}

            {/* Auth Section */}
            <AuthSection
              userMenuRef={userMenuRef}
              setIsUserMenuOpen={setIsUserMenuOpen}
              isUserMenuOpen={isUserMenuOpen}
              handleLogout={handleLogout}
              organizedUserMenus={organizedUserMenus}
              authLoading={authLoading}
              isWaitlistEnabled={isWaitlistEnabled}
              getMenuItemStyle={getMenuItemStyle}
              getMenuDescription={getMenuDescription}
            />

            {/* Mobile Menu */}
            <HeaderMobile
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              primaryMenus={primaryMenus}
              moreMenus={moreMenus}
              organizedUserMenus={organizedUserMenus}
              handleProductSubmit={handleProductSubmit}
              handleLogout={handleLogout}
              authLoading={authLoading}
              isAuthenticated={isAuthenticated}
              user={user}
              isWaitlistEnabled={isWaitlistEnabled}
              queueStats={queueStats}
            />
          </div>
        </div>

        {/* Enhanced Mobile Search Bar */}
        <div className="px-4 pb-4 sm:hidden">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center h-12 px-4 rounded-2xl border border-gray-200/80 hover:border-violet-400/80 bg-gradient-to-r from-gray-50/90 to-white/90 hover:from-white hover:to-violet-50/50 text-gray-500 hover:text-violet-600 transition-all duration-150 relative group"
          >
            <Search
              size={18}
              className="mr-4 text-violet-500 group-hover:text-violet-600 transition-colors"
            />
            <span className="text-sm font-medium">Search products, startups...</span>
            <span className="absolute right-4 text-xs text-gray-400 bg-gray-100/80 group-hover:bg-violet-100/80 px-2.5 py-1 rounded-lg font-mono transition-all duration-150 border border-gray-200/50">
              <span className="ml-2">⌘K</span>
            </span>
          </button>
        </div>

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery=""
        />
      </header>

      <style jsx global>{`
        :root {
          --primary-color: #8b5cf6;
        }

        /* Improved sticky header behavior */
        header {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Fix for iOS Safari sticky behavior */
        @supports (-webkit-touch-callout: none) {
          header {
            position: -webkit-sticky;
            position: sticky;
            top: 0;
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
          }
        }

        /* Prevent header from jumping on mobile */
        @media (max-width: 768px) {
          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
          
          /* Add padding to body to prevent content from going under fixed header */
          body {
            padding-top: 0;
          }
        }

        button:focus-visible,
        a:focus-visible,
        [role='button']:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
          border-radius: 4px;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @supports (backdrop-filter: blur(20px)) {
          .supports-backdrop-blur {
            backdrop-filter: blur(20px);
          }
        }

        .glass-morphism {
          background: rgba(255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 0.2);
        }

        .gradient-text {
          background: linear-gradient(to right, #8b5cf6, #a855f7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        ul,
        ol,
        li {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .dropdown-menu ul,
        .dropdown-menu ol,
        .dropdown-menu li {
          list-style: none !important;
          list-style-type: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Enhanced responsive breakpoints */
        @media (max-width: 640px) {
          .header-logo {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .header-search {
            width: 12rem;
          }
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .header-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }

        /* Improved touch targets for mobile */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Better focus states for accessibility */
        .focus-visible\:ring-2:focus-visible {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Z-index hierarchy management */
        .z-header {
          z-index: 30;
        }
        
        .z-modal {
          z-index: 50;
        }
        
        .z-dropdown {
          z-index: 40;
        }
        
        .z-tooltip {
          z-index: 60;
        }
        
        .z-notification {
          z-index: 70;
        }
      `}</style>
    </>
  );
};

export default Header;
