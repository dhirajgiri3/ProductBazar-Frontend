'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  LogOut,
  ArrowRight,
  UserCheck,
  Users as UsersIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useOnClickOutside } from '@/lib/hooks/useOnClickOutside';
import ProfilePicture from '../common/ProfilePicture.jsx';
import { MenuDropdownItem } from './HeaderNavigation';

const AuthSection = ({
  userMenuRef,
  setIsUserMenuOpen,
  isUserMenuOpen,
  handleLogout,
  organizedUserMenus = {},
  authLoading = false,
  isWaitlistEnabled = false,
  getMenuItemStyle,
  getMenuDescription,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full shadow-sm" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Count total user menu items
    const totalUserMenus = Object.values(organizedUserMenus).flat().length;

    return (
      <div ref={userMenuRef} className="relative">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-3 p-1.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors duration-150 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 relative"
          aria-expanded={isUserMenuOpen}
          aria-label="User menu"
        >
          <ProfilePicture
            user={user}
            size={36}
            showStatus={true}
            variant="default"
            enableHover={false}
            statusColor="green"
          />
          {/* Menu count indicator - only show if there are user menus */}
          {totalUserMenus > 0 && (
            <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {totalUserMenus}
            </span>
          )}
          <div
            className={`transition-transform duration-150 ${
              isUserMenuOpen ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown
              size={16}
              className="text-gray-400 hover:text-violet-600 transition-colors duration-150"
            />
          </div>
        </button>

        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl z-[9998] overflow-hidden shadow-2xl"
            >
              {/* Enhanced User Info Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-violet-50/80 via-purple-50/80 to-indigo-50/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 rounded-full translate-y-4 -translate-x-4" />

                <div className="flex items-center gap-4 relative z-10">
                  <ProfilePicture
                    user={user}
                    size={56}
                    showStatus={true}
                    variant="default"
                    statusColor="green"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {user.firstName || 'User'} {user.lastName || ''}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {user.email || user.phone || 'No contact info'}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.role && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100/80 text-violet-700 backdrop-blur-sm border border-violet-200/50">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      )}
                      {user.secondaryRoles && user.secondaryRoles.length > 0 && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100/80 text-blue-700 backdrop-blur-sm border border-blue-200/50">
                          +{user.secondaryRoles.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organized User Menu Items */}
              <div className="py-3 max-h-80 overflow-y-auto">
                {Object.keys(organizedUserMenus).length > 0 ? (
                  <>
                    {/* Profile Section */}
                    {organizedUserMenus.profile && organizedUserMenus.profile.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Profile
                          </div>
                        </div>
                        {organizedUserMenus.profile.map((menu, index) => (
                          <MenuDropdownItem
                            key={menu.id}
                            menu={menu}
                            index={index}
                            onClose={() => setIsUserMenuOpen(false)}
                            getMenuItemStyle={getMenuItemStyle}
                            getMenuDescription={getMenuDescription}
                          />
                        ))}
                      </div>
                    )}

                    {/* Activity Section */}
                    {organizedUserMenus.activity && organizedUserMenus.activity.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Activity
                          </div>
                        </div>
                        {organizedUserMenus.activity.map((menu, index) => (
                          <MenuDropdownItem
                            key={menu.id}
                            menu={menu}
                            index={index + 10}
                            onClose={() => setIsUserMenuOpen(false)}
                            getMenuItemStyle={getMenuItemStyle}
                            getMenuDescription={getMenuDescription}
                          />
                        ))}
                      </div>
                    )}

                    {/* Settings Section */}
                    {organizedUserMenus.settings && organizedUserMenus.settings.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Settings
                          </div>
                        </div>
                        {organizedUserMenus.settings.map((menu, index) => (
                          <MenuDropdownItem
                            key={menu.id}
                            menu={menu}
                            index={index + 20}
                            onClose={() => setIsUserMenuOpen(false)}
                            getMenuItemStyle={getMenuItemStyle}
                            getMenuDescription={getMenuDescription}
                          />
                        ))}
                      </div>
                    )}

                    {/* Waitlist Quick Actions for Admin */}
                    {(user.role === 'admin' || user.secondaryRoles?.includes('admin')) && (
                      <div className="mb-2">
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Waitlist Quick Actions
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Link
                            href="/admin/waitlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-all duration-150 mr-3">
                              <UserCheck size={16} className="text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Manage Waitlist</div>
                              <div className="text-xs text-gray-500">View entries & analytics</div>
                            </div>
                          </Link>
                          <Link
                            href="/admin/waitlist?tab=entries"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-all duration-150 mr-3">
                              <UsersIcon size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Review Entries</div>
                              <div className="text-xs text-gray-500">Approve or reject users</div>
                            </div>
                          </Link>
                          <Link
                            href="/admin/waitlist?tab=settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 group-hover:bg-green-100 transition-all duration-150 mr-3">
                              <SettingsIcon size={16} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Waitlist Settings</div>
                              <div className="text-xs text-gray-500">
                                Enable/disable & configure
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Other uncategorized menus */}
                    {organizedUserMenus.other && organizedUserMenus.other.length > 0 && (
                      <div className="mb-2">
                        {organizedUserMenus.other.map((menu, index) => (
                          <MenuDropdownItem
                            key={menu.id}
                            menu={menu}
                            index={index + 40}
                            onClose={() => setIsUserMenuOpen(false)}
                            getMenuItemStyle={getMenuItemStyle}
                            getMenuDescription={getMenuDescription}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <div className="text-sm">No additional options available</div>
                  </div>
                )}
              </div>

              {/* Enhanced Logout Button */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={authLoading}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-150 rounded-2xl group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 transition-all duration-150 mr-3">
                    <LogOut size={18} className="text-red-500 group-hover:text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-400">End your session</div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/auth/login"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 rounded-xl transition-all duration-300 border border-transparent hover:border-violet-200/50"
        >
          Log In
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Link
          href={isWaitlistEnabled ? '/' : '/auth/register'}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 rounded-xl transition-colors duration-150 border border-violet-500/20"
        >
          {isWaitlistEnabled ? 'Join Waitlist' : 'Sign Up'}
        </Link>
      </motion.div>
    </div>
  );
};

export default AuthSection; 