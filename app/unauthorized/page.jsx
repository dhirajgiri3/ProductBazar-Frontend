"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/auth-context';

const UnauthorizedPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isDev = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-xl p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          {isDev && user && (
            <div className="mb-4 p-2 bg-gray-100 text-gray-700 rounded text-left text-xs">
              <div><strong>Debug Info:</strong></div>
              <div>role: {user.role ? user.role : 'N/A'}</div>
              <div>secondaryRoles: {user.secondaryRoles ? JSON.stringify(user.secondaryRoles) : 'N/A'}</div>
              <div>userId: {user._id || 'N/A'}</div>
              <div>email: {user.email || 'N/A'}</div>
            </div>
          )}
          
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="mr-2" />
            Return to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
