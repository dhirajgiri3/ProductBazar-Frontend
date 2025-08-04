'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  Plus,
  LogOut,
  ArrowRight,
  UserCheck,
  Grid,
} from 'lucide-react';
import { useCategories } from '@/lib/contexts/category-context';
import CategoryIcon from '../UI/CategoryIcon';

const HeaderMobile = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  primaryMenus,
  moreMenus,
  organizedUserMenus,
  handleProductSubmit,
  handleLogout,
  authLoading,
  isAuthenticated,
  user,
  isWaitlistEnabled,
  queueStats,
}) => {
  const { categories = [] } = useCategories();

  // Create portal for mobile menu to ensure it renders at body level
  const mobileMenuContent = (
    <AnimatePresence mode="wait">
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1] // Custom easing for smoother animation
          }}
          className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm md:hidden"
          style={{ 
            isolation: 'isolate',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: '100%', 
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1], // Custom easing for natural movement
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className="absolute top-0 right-0 bottom-0 w-11/12 max-w-sm bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-200/50 flex flex-col"
            style={{ 
              isolation: 'isolate',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  <span>PB</span>
                </div>
                <span className="font-semibold text-gray-900">ProductBazar</span>
              </div>
              <motion.button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="flex flex-col gap-2">
                {/* Categories Section */}
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </h3>
                  {categories.slice(0, 6).map((category, idx) => (
                    <motion.div
                      key={category._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.2 + idx * 0.08,
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                    >
                      <Link
                        href={`/category/${
                          category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
                        }`}
                        className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-violet-100 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                          <CategoryIcon
                            icon={category.icon}
                            name={category.name}
                            size={16}
                            className="text-gray-600 group-hover:text-violet-600"
                          />
                        </div>
                        {category.name}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.6,
                      duration: 0.4,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                  >
                    <Link
                      href="/categories"
                      className="flex items-center justify-between px-4 py-3 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors mx-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-medium">View All Categories</span>
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                </div>

                {isAuthenticated && (
                  <>
                    {/* Primary Features Section - Most Important */}
                    {primaryMenus.length > 0 && (
                      <div className="mb-4">
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Top Features
                        </h3>
                        {primaryMenus.map((menu, idx) => (
                          <motion.div
                            key={menu.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.7 + idx * 0.08,
                              duration: 0.4,
                              ease: [0.4, 0.0, 0.2, 1]
                            }}
                          >
                            <Link
                              href={menu.href}
                              className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                                menu.isActive
                                  ? 'bg-violet-100 text-violet-700 border border-violet-200/50'
                                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {menu.icon && <span className="mr-3">{menu.icon}</span>}
                              <div className="flex-1">
                                <div className="font-medium">{menu.label}</div>
                                {menu.score > 200 && (
                                  <div className="text-xs text-violet-600">Priority feature</div>
                                )}
                              </div>
                              {menu.score > 200 && (
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* More Features Section */}
                    {moreMenus.length > 0 && (
                      <div className="mb-4">
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          More Features ({moreMenus.length})
                        </h3>
                        {moreMenus.slice(0, 6).map((menu, idx) => (
                          <motion.div
                            key={menu.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.9 + idx * 0.08,
                              duration: 0.4,
                              ease: [0.4, 0.0, 0.2, 1]
                            }}
                          >
                            <Link
                              href={menu.href}
                              className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                                menu.isActive
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {menu.icon && <span className="mr-3">{menu.icon}</span>}
                              <div className="flex-1">
                                <div className="font-medium">{menu.label}</div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {menu.category}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                        {moreMenus.length > 6 && (
                          <div className="px-4 py-2 text-xs text-gray-500">
                            And {moreMenus.length - 6} more features...
                          </div>
                        )}
                      </div>
                    )}

                    {/* User Profile Section - Organized */}
                    {Object.keys(organizedUserMenus).length > 0 && (
                      <div className="mb-4">
                        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Profile & Settings
                        </h3>
                        {Object.entries(organizedUserMenus).map(([category, menus]) =>
                          menus.slice(0, 2).map((menu, idx) => (
                            <motion.div
                              key={menu.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                delay: 1.1 + idx * 0.08,
                                duration: 0.4,
                                ease: [0.4, 0.0, 0.2, 1]
                              }}
                            >
                              <Link
                                href={menu.href}
                                className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                                  menu.isActive
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {menu.icon && <span className="mr-3">{menu.icon}</span>}
                                <div className="flex-1">
                                  <div className="font-medium">{menu.label}</div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {category}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              {/* Mobile Submit Product Button - show even on small screens for important action */}
              {isAuthenticated && user?.roleCapabilities?.canUploadProducts && (
                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleProductSubmit();
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl mb-3 transition-all duration-200 shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.3,
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                >
                  <Plus size={18} className="mr-2" />
                  Submit Product
                </motion.button>
              )}

              {/* Mobile Waitlist Management Button for Admin */}
              {(user?.role === 'admin' || user?.secondaryRoles?.includes('admin')) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.4,
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="mb-3"
                >
                  <Link
                    href="/admin/waitlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    <UserCheck size={18} className="mr-2" />
                    Manage Waitlist
                    {isWaitlistEnabled && (
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        Active
                      </span>
                    )}
                  </Link>
                </motion.div>
              )}
              
              {isAuthenticated ? (
                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.5,
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </motion.button>
              ) : (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.5,
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                >
                  <Link
                    href="/auth/login"
                    className="flex-1 text-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href={isWaitlistEnabled ? '/waitlist' : '/auth/register'}
                    className="flex-1 text-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {isWaitlistEnabled ? 'Join Waitlist' : 'Sign Up'}
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-3 text-gray-500 hover:text-violet-600 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 rounded-2xl md:hidden focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 border border-transparent hover:border-violet-200/50"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.div>
      </motion.button>

      {/* Render mobile menu using portal to ensure it appears above all other components */}
      {typeof document !== 'undefined' && createPortal(mobileMenuContent, document.body)}
    </>
  );
};

export default HeaderMobile; 