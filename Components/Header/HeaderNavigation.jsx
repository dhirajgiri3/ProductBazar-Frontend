'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Grid,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { useOnClickOutside } from '@/lib/hooks/useOnClickOutside';
import { useCategories } from '@/lib/contexts/category-context';
import CategoryIcon from '../UI/CategoryIcon';

// Enhanced NavItem with priority indicators
export const NavItem = ({ label, isActive, href, onClick, icon, priority, showPriority = false }) => (
  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="relative group">
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl border border-transparent relative whitespace-nowrap ${
        isActive
          ? 'text-violet-700 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/50 shadow-sm'
          : 'text-gray-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 hover:border-violet-200/30'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && (
        <span
          className={`transition-colors duration-300 ${
            isActive ? 'text-violet-600' : 'text-gray-500 group-hover:text-violet-600'
          }`}
        >
          {icon}
        </span>
      )}
      {label}
      {showPriority && priority <= 3 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-violet-600 rounded-full shadow-sm"
          layoutId="navIndicator"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
);

// Reusable dropdown menu item component
export const MenuDropdownItem = ({ menu, index, onClose, getMenuItemStyle, getMenuDescription }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={menu.href}
        className={`flex items-center px-4 py-3 mx-2 text-sm transition-all duration-300 group rounded-2xl ${
          menu.isActive
            ? 'bg-violet-100/80 text-violet-700'
            : 'text-gray-700 hover:bg-violet-50/80 hover:text-violet-700'
        }`}
        onClick={onClose}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${getMenuItemStyle(
            menu.id
          )} transition-all duration-300 mr-3 group-hover:scale-110`}
        >
          {menu.icon}
        </div>
        <div className="flex-1">
          <div className="font-medium">{menu.label}</div>
          <div className="text-xs text-gray-500">{getMenuDescription(menu.id)}</div>
        </div>
        <ArrowRight
          size={14}
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
        />
      </Link>
    </motion.div>
  );
};

const HeaderNavigation = ({ 
  primaryMenus, 
  moreMenus, 
  getMenuItemStyle, 
  getMenuDescription 
}) => {
  const pathname = usePathname();
  const { categories = [] } = useCategories();
  
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const categoryMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  useOnClickOutside(categoryMenuRef, () => setIsCategoryMenuOpen(false));
  useOnClickOutside(moreMenuRef, () => setIsMoreMenuOpen(false));

  return (
    <nav className="hidden md:flex items-center gap-2">
      <div ref={categoryMenuRef} className="relative">
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl border border-transparent text-gray-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 hover:border-violet-200/30"
          >
            Products
          </Link>
          <motion.button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl border border-transparent ${
              pathname.startsWith('/category')
                ? 'text-violet-700 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/50'
                : 'text-gray-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 hover:border-violet-200/30'
            }`}
            aria-expanded={isCategoryMenuOpen}
            aria-label="Categories"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <Grid size={16} className="mr-2" />
            Categories
            <motion.div
              animate={{ rotate: isCategoryMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={14} className="ml-2" />
            </motion.div>
          </motion.button>
        </div>
        <AnimatePresence>
          {isCategoryMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl z-[9998] shadow-xl"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Grid size={16} className="text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900">Browse Categories</div>
                </div>
              </div>
              {categories.length > 0 ? (
                <div className="py-2">
                  {categories.slice(0, 8).map((category, index) => (
                    <motion.div
                      key={category._id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/category/${
                          category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
                        }`}
                        className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-600 group"
                        onClick={() => setIsCategoryMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                          <CategoryIcon
                            icon={category.icon}
                            name={category.name}
                            size={16}
                            className="text-gray-600 group-hover:text-violet-600"
                          />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link
                      href="/categories"
                      className="flex items-center justify-between px-4 py-3 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg mx-2 transition-colors"
                      onClick={() => setIsCategoryMenuOpen(false)}
                    >
                      <span className="font-medium">View All Categories</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <div className="text-sm">Loading categories...</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Navigation Items - Only show top 2 most important */}
      {primaryMenus.map(menu => (
        <NavItem
          key={menu.id}
          label={menu.label}
          isActive={menu.isActive}
          href={menu.href}
          icon={menu.icon}
          priority={menu.priority}
          showPriority={false} // Disable priority indicators for cleaner look
        />
      ))}

      {/* More Menu for All Secondary Items */}
      {moreMenus.length > 0 && (
        <div ref={moreMenuRef} className="relative">
          <motion.button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl border border-transparent transition-all duration-300 ${
              isMoreMenuOpen
                ? 'text-violet-700 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/50 shadow-sm'
                : 'text-gray-600 hover:text-violet-700 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 hover:border-violet-200/30'
            }`}
            aria-expanded={isMoreMenuOpen}
            aria-label="More options"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <MoreHorizontal size={16} className="mr-2" />
            More
            {moreMenus.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
                {moreMenus.length}
              </span>
            )}
            <motion.div
              animate={{ rotate: isMoreMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={14} className="ml-2" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {isMoreMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-gray-100/40 rounded-2xl z-[9998] shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MoreHorizontal size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">More Options</div>
                      <div className="text-xs text-gray-500">
                        {moreMenus.length} additional features
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2 max-h-80 overflow-y-auto">
                  {moreMenus.map((menu, index) => (
                    <MenuDropdownItem
                      key={menu.id}
                      menu={menu}
                      index={index}
                      onClose={() => setIsMoreMenuOpen(false)}
                      getMenuItemStyle={getMenuItemStyle}
                      getMenuDescription={getMenuDescription}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  );
};

export default HeaderNavigation; 