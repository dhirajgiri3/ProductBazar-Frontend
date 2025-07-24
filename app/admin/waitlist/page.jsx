'use client';

import { useState, useEffect } from 'react';
import WaitlistDashboard from '../../../Components/Admin/Waitlist/WaitlistDashboard';
import { useAuth } from '../../../lib/contexts/auth-context';
import { AdminWaitlistProvider } from '../../../lib/contexts/admin-waitlist-context';
import LoadingSpinner from '../../../Components/common/LoadingSpinner';
import ErrorMessage from '../../../Components/common/ErrorMessage';

export default function AdminWaitlistPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setError('You must be logged in to access this page');
        setLoading(false);
      } else if (user?.role !== 'admin') {
        setError('You do not have permission to access this page');
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" color="violet" text="Loading admin panel..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waitlist Management</h1>
          <p className="mt-2 text-gray-600">
            Manage waitlist entries, view analytics, and control system settings.
          </p>
        </div>

        <AdminWaitlistProvider>
          <WaitlistDashboard />
        </AdminWaitlistProvider>
      </div>
    </div>
  );
} 