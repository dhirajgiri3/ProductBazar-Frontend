"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import WaitlistLanding from '../../Components/Waitlist/WaitlistLanding';
import { useToast } from '../../lib/contexts/toast-context';

export default function WaitlistPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    // Check for error parameters from Google OAuth redirect
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const authType = searchParams.get('authType');

    if (error && message && !hasShownError) {
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
  }, [searchParams, showToast, hasShownError]);

  return <WaitlistLanding />;
} 