'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWaitlist } from '@/lib/contexts/waitlist-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { useToast } from '@/lib/contexts/toast-context';
import { Shield } from 'lucide-react';
import LoadingSpinner from '@/Components/common/LoadingSpinner'; // Import LoadingSpinner

// List of route prefixes that remain publicly accessible even when the waitlist is enabled
// and the visitor is NOT authenticated / has no access yet.
// NOTE: Keep paths lowercase and without a trailing slash (except root '/') for easier matching.
const PUBLIC_PATH_PREFIXES = [
  '/',                       // Home + waitlist landing
  '/auth/login',             // Login page
  '/auth/forgot-password',   // Forgot-password request
  '/auth/reset-password',    // Password reset (token appended afterwards)
  '/waitlist/verify',        // Magic link verification
  '/waitlist'                // Waitlist pages
];

/**
 * Check whether the current pathname is allowed for an unauthenticated visitor
 * while the waitlist is enabled.
 */
const isPublicPath = (pathname) => {
  if (!pathname) return false;
  // Strip query parameters and normalize case
  const cleanPath = pathname.split('?')[0].toLowerCase();

  // Root path is explicitly allowed
  if (cleanPath === '/') return true;

  return PUBLIC_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') return false; // already handled
    return cleanPath.startsWith(prefix);
  });
};

/**
 * WaitlistGuard – global client-side route guard used to prevent visitors from
 * accessing private parts of the application while the waitlist is enabled.
 *
 * When the waitlist is ON *and* the visitor is unauthenticated/has no access,
 * they can only visit the public paths listed above. Any attempt to navigate
 * elsewhere triggers an immediate redirect back to the landing page (/).
 */
export default function WaitlistGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const hasShownRedirectToast = useRef(false);

  const { isWaitlistEnabled, hasAccess, loading: waitlistLoading } = useWaitlist();
  const { user, authLoading } = useAuth();

  const isLoadingInitialData = waitlistLoading || authLoading;

  // Determine if a redirection is needed
  const shouldRedirect = isWaitlistEnabled && !isLoadingInitialData && !user && !hasAccess && !isPublicPath(pathname);

  useEffect(() => {
    if (shouldRedirect && !hasShownRedirectToast.current) {
      // Show toast message before redirecting
      showToast(
        'custom',
        'Access restricted. Join our waitlist for early access to exclusive features.',
        <Shield size={20} className="text-indigo-400" />,
        4000
      );
      
      // Mark that we've shown the toast to prevent duplicate messages
      hasShownRedirectToast.current = true;
      
      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        router.replace('/');
      }, 1000);
    }
  }, [shouldRedirect, router, showToast]);

  // Reset the toast flag when pathname changes (user navigates to a different page)
  useEffect(() => {
    hasShownRedirectToast.current = false;
  }, [pathname]);

  // If still loading initial data or should redirect, show spinner
  if (isLoadingInitialData || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" text="Loading..." color="violet" />
      </div>
    );
  }

  // Otherwise, render the children
  return children;
} 