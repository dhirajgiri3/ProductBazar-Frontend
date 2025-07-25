'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaitlist } from '../lib/contexts/waitlist-context';
import { useAuth } from '../lib/contexts/auth-context';
import { useToast } from '../lib/contexts/toast-context';
import Landing from "Components/Landing/Landing";
import WaitlistLanding from "Components/Waitlist/WaitlistLanding";
import LoadingSpinner from "Components/common/LoadingSpinner";
import "./globals.css";

export default function Page() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isWaitlistEnabled, loading: waitlistLoading, hasAccess } = useWaitlist();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check for error parameters from Google OAuth redirect
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const authType = searchParams.get('authType');

    if (error && message && !hasShownError && mounted) {
      setHasShownError(true);
      
      // Show appropriate toast message based on error type
      if (error === 'waitlist_enabled') {
        const isLoginAttempt = authType === 'login';
        
        showToast({
          type: 'info',
          title: isLoginAttempt ? 'Account Not Found' : 'Registration Restricted',
          message: decodeURIComponent(message),
          duration: 10000,
          action: {
            label: 'Join Waitlist',
            onClick: () => {
              // Scroll to waitlist form or trigger waitlist join
              const waitlistForm = document.getElementById('join-waitlist');
              if (waitlistForm) {
                waitlistForm.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        });
      } else {
        showToast({
          type: 'error',
          title: 'Authentication Error',
          message: decodeURIComponent(message),
          duration: 6000
        });
      }
    }
  }, [searchParams, showToast, hasShownError, mounted]);

  if (!mounted || waitlistLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" color="violet" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div> 
        <Landing />
      </div>
    );
  }

  // Show waitlist landing only for unauthenticated users when waitlist is enabled
  if (isWaitlistEnabled && !hasAccess) {
    return (
      <div>
        <WaitlistLanding />
      </div>
    );
  }

  // Otherwise show regular landing page (waitlist disabled or user has access)
  return (
    <div> 
      <Landing />
    </div>
  );
}
