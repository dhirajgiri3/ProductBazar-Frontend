'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

const GoogleOAuthNotification = () => {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const authType = searchParams.get('authType');

    if (error === 'waitlist_enabled' && message) {
      setNotificationData({
        type: authType === 'login' ? 'login' : 'register',
        message: decodeURIComponent(message)
      });
      setIsVisible(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !notificationData) return null;

  const isLoginAttempt = notificationData.type === 'login';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-blue-200" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">
                {isLoginAttempt ? 'Account Not Found' : 'Registration Restricted'}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {notificationData.message}
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    const waitlistForm = document.getElementById('join-waitlist');
                    if (waitlistForm) {
                      waitlistForm.scrollIntoView({ behavior: 'smooth' });
                    }
                    handleClose();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  Join Waitlist
                </button>
                
                {isLoginAttempt && (
                  <a
                    href="/auth/login"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                  >
                    Try Different Email
                  </a>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoogleOAuthNotification; 