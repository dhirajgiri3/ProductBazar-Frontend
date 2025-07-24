'use client';

import { useEffect, useState } from 'react';
import { useWaitlist } from '../lib/contexts/waitlist-context';
import { useAuth } from '../lib/contexts/auth-context';
import Landing from "Components/Landing/Landing";
import WaitlistLanding from "Components/Waitlist/WaitlistLanding";
import LoadingSpinner from "Components/common/LoadingSpinner";
import "./globals.css";

export default function Page() {
  const { isWaitlistEnabled, loading: waitlistLoading, hasAccess } = useWaitlist();
  const { user, isAuthenticated, authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
