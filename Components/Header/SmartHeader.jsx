'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useWaitlist } from '@/lib/contexts/waitlist-context';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import WaitlistHeader from '../Waitlist/Components/WaitlistHeader';

// ---------- ROUTE CONFIGURATION ----------
// Pages (or prefixes) that should force the Waitlist header when the waitlist   
// system is enabled *and* the visitor is NOT authenticated.  
// Note: do NOT include '/' here or every route would match via startsWith('/')
const WAITLIST_HEADER_ROUTES = [
  '/waitlist', // all waitlist pages eg. /waitlist/verify, /waitlist/foo
];

// Pages (or prefixes) that must always show the *main* header even for visitors
// who are still in the waitlist (login, admin, onboarding etc.)
const MAIN_HEADER_ROUTES = [
  '/admin',
  '/complete-profile',
  '/auth',
  '/profile',
  '/products',
  '/projects',
  '/jobs',
  '/category',
  '/search',
  '/unauthorized',
];

// Special pages where no header should be rendered at all
const NO_HEADER_ROUTES = [
  '/404',
  '/500',
  '/_error',
];

// Helper to test if the current pathname matches any of the supplied prefixes.  
// It treats an entry as a *prefix* (so '/auth' matches '/auth/login') but still
// allows an exact root path match when the entry itself is '/'.
const matchesRoute = (routePrefixes, pathname) => {
  return routePrefixes.some(prefix => {
    if (prefix === '/') {
      return pathname === '/';
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};

// Check if current page is a 404 page
const is404Page = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for error page data attribute (most reliable)
  if (document.querySelector('[data-error-page]')) {
    return true;
  }
  
  // Check if we're on a known error path
  if (window.location.pathname === '/404' || 
      window.location.pathname === '/500' || 
      window.location.pathname === '/_error') {
    return true;
  }
  
  return false;
};

const SmartHeader = () => {
  const { user, isAuthenticated, isInitialized, authLoading } = useAuth();
  const { isWaitlistEnabled, hasAccess, loading: waitlistLoading } = useWaitlist();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isErrorPage, setIsErrorPage] = useState(false);

  // Ensure hydration is complete and check for error pages
  useEffect(() => {
    setMounted(true);
    
    // Check if we're on an error page after hydration
    const checkErrorPage = () => {
      const isError = is404Page();
      setIsErrorPage(isError);
      
      if (process.env.NODE_ENV === 'development' && isError) {
        console.log('SmartHeader: Detected error page, hiding header');
      }
    };
    
    // Check after a short delay to ensure DOM is fully ready
    const timeoutId = setTimeout(checkErrorPage, 50);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Don't render anything until hydration is complete
  if (!mounted) {
    return null;
  }

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('SmartHeader Debug:', {
      pathname,
      isAuthenticated,
      hasAccess,
      isWaitlistEnabled,
      waitlistLoading,
      authLoading,
      isErrorPage,
      user: user ? { id: user._id, role: user.role } : null
    });
  }

  // Don't show header on specific pages or error pages
  if (matchesRoute(NO_HEADER_ROUTES, pathname) || isErrorPage) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartHeader: No header (special page or error page)');
    }
    return null;
  }

  // If the user is authenticated we always show the main header – they are past
  // the waitlist flow entirely.
  if (isAuthenticated && user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartHeader: Main header (authenticated user)');
    }
    return <Header />;
  }

  // Visitor is NOT authenticated – decide based on waitlist state and route.

  // 1. Routes that explicitly require the main header (login, admin, etc.)
  if (matchesRoute(MAIN_HEADER_ROUTES, pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartHeader: Main header (main-header route)');
    }
    return <Header />;
  }

  // 2. If the global waitlist is enabled, default to the waitlist header unless
  //    this visitor already has access (hasAccess) OR the waitlist context is
  //    still loading (to avoid flicker while determining status).
  if (isWaitlistEnabled) {
    // Waitlist specific routes always get the Waitlist header.
    if (matchesRoute(WAITLIST_HEADER_ROUTES, pathname) || pathname === '/') {
      if (process.env.NODE_ENV === 'development') {
        console.log('SmartHeader: Waitlist header (waitlist route/home)');
      }
      return <WaitlistHeader />;
    }

    // If visitor is not authenticated and does NOT yet have access, show waitlist header.
    if (!hasAccess && !waitlistLoading && !authLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('SmartHeader: Waitlist header (waitlist enabled, no access)');
      }
      return <WaitlistHeader />;
    }

    // While the waitlist context is still loading, default to the waitlist
    // header to avoid a flash of the main UI before the status is known.
    if (waitlistLoading && !authLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('SmartHeader: Waitlist header (loading waitlist status)');
      }
      return <WaitlistHeader />;
    }
  }

  // 2b. If the waitlist check itself is still loading (regardless of whether
  //     the waitlist ends up being enabled/disabled) keep showing the waitlist
  //     header to avoid layout shift.
  if (waitlistLoading && !isAuthenticated && !authLoading) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SmartHeader: Waitlist header (waitlist state loading globally)');
    }
    return <WaitlistHeader />;
  }

  // 3. Fallback – show the main header. This covers cases where the waitlist is
  //    disabled or the visitor has access but isn’t authenticated (rare).
  if (process.env.NODE_ENV === 'development') {
    console.log('SmartHeader: Main header (fallback)');
  }
  return <Header />;
};

export default SmartHeader; 