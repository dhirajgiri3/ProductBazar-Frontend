'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { makePriorityRequest } from '@/lib/api/api';
import ProfilePage from './Components/ProfileTabs/ProfilePage';
import logger from '@/lib/utils/logger';
import LoadingSpinner from '@/Components/common/LoadingSpinner';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username;

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [interactionCounts, setInteractionCounts] = useState({
    bookmarks: 0,
    upvotes: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await makePriorityRequest('get', `/auth/user/username/${username}`);
        if (userResponse.data?.status !== 'success' || !userResponse.data.data.user) {
          throw new Error('User not found');
        }
        const userData = userResponse.data.data.user;
        setUser(userData);

        // Fetch products data
        const productsResponse = await makePriorityRequest('get', `/products/user/${userData._id}`, {
          params: { page: 1, limit: 6, filter: 'all' },
        });
        const productsData = productsResponse.data?.data || [];
        const totalPagesData = productsResponse.data?.totalPages || 1;
        const statusCountsData = {
          all: productsResponse.data?.totalCount || 0,
          published: productsResponse.data?.statusCounts?.published || 0,
          draft: productsResponse.data?.statusCounts?.draft || 0,
          archived: productsResponse.data?.statusCounts?.archived || 0,
        };

        setProducts(productsData);
        setTotalPages(totalPagesData);
        setStatusCounts(statusCountsData);

        // Fetch interaction data
        const interactionResponse = await makePriorityRequest('get', `/users/${userData._id}/interactions`);
        const interactionCountsData = {
          bookmarks: interactionResponse.data?.bookmarkCount || 0,
          upvotes: interactionResponse.data?.upvoteCount || 0,
        };
        setInteractionCounts(interactionCountsData);

      } catch (error) {
        logger.error(`Failed to fetch profile data for ${username}:`, error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-4">The requested user profile could not be found.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfilePage 
      initialUser={user}
      initialProducts={products}
      initialInteractionCounts={interactionCounts}
      initialStatusCounts={statusCounts}
      initialTotalPages={totalPages}
    />
  );
}