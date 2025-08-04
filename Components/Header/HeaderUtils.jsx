'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Briefcase,
  FileText,
  DollarSign,
  Layers,
  Code,
  Users,
  Bookmark,
  Grid,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Users as UsersIcon,
  BarChart3,
  UserCheck,
  UserX,
  Settings as SettingsIcon,
  Mail,
  TrendingUp,
  Shield,
} from 'lucide-react';

// Smart menu prioritization system for responsive header
export const useSmartMenuLayout = (allMenus, screenWidth, user) => {
  return useMemo(() => {
    // Screen size breakpoints
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    // Role-based menu importance scoring
    const getMenuImportanceScore = menu => {
      let score = 0;

      // Admin menus should NEVER appear in primary menu - force them to More dropdown
      if (menu.category === 'admin' || menu.id === 'admin') {
        return -1000; // Negative score ensures they never appear in primary
      }

      // Base importance from menu definition
      if (menu.importance === 'high') score += 100;
      else if (menu.importance === 'medium') score += 50;
      else if (menu.importance === 'low') score += 25;

      // Active menu gets highest priority
      if (menu.isActive) score += 1000;

      // Role-specific scoring
      const userRole = user?.role;
      const secondaryRoles = user?.secondaryRoles || [];

      // Core business features get higher priority for relevant roles
      if (menu.id === 'my-products' && ['startupOwner'].includes(userRole)) score += 200;
      if (menu.id === 'jobs' && ['jobseeker', 'freelancer'].includes(userRole)) score += 200;
      if (menu.id === 'post-jobs' && ['agency', 'startupOwner'].includes(userRole)) score += 150;
      if (menu.id === 'projects' && ['freelancer'].includes(userRole)) score += 150;
      if (menu.id === 'services' && ['agency', 'freelancer'].includes(userRole)) score += 150;
      if (menu.id === 'invest' && userRole === 'investor') score += 200;

      // Reduce priority for low-priority categories
      if (menu.category === 'user') score -= 50;

      return score;
    };

    // Separate menus by categories - exclude admin from core menus
    const coreMenus = allMenus.filter(
      menu =>
        ['core', 'jobs', 'projects', 'services', 'investment'].includes(menu.category) &&
        menu.category !== 'admin' &&
        menu.id !== 'admin'
    );
    const userMenus = allMenus.filter(menu => menu.category === 'user');
    const adminMenus = allMenus.filter(menu => menu.category === 'admin' || menu.id === 'admin');

    // Score and sort core menus
    const scoredCoreMenus = coreMenus
      .map(menu => ({ ...menu, score: getMenuImportanceScore(menu) }))
      .sort((a, b) => b.score - a.score);

    // Smart distribution based on screen size - maximum 2 menus for better responsive UI
    let maxPrimaryMenus = 2; // Base: show only 2 most important
    let showSubmitButton = true;

    if (screenWidth >= breakpoints.xl) {
      maxPrimaryMenus = 2; // XL screens show 2 (changed from 3)
    } else if (screenWidth >= breakpoints.lg) {
      maxPrimaryMenus = 2; // Large screens show 2
    } else if (screenWidth >= breakpoints.md) {
      maxPrimaryMenus = 2; // Medium screens show 2
    } else {
      maxPrimaryMenus = 1; // Small screens show only 1
      showSubmitButton = false; // Hide submit button on very small screens
    }

    // Always ensure we have at least the most important menu if available
    maxPrimaryMenus = Math.min(maxPrimaryMenus, scoredCoreMenus.length);

    // Distribution logic
    const primaryMenus = scoredCoreMenus.slice(0, maxPrimaryMenus);
    const moreMenus = scoredCoreMenus.slice(maxPrimaryMenus);

    // Enhanced user dropdown with better organization
    const organizedUserMenus = userMenus.reduce((acc, menu) => {
      const category = getMenuCategory(menu.id);
      if (!acc[category]) acc[category] = [];
      acc[category].push(menu);
      return acc;
    }, {});

    // Add overflow menus to More dropdown
    const enhancedMoreMenus = [
      ...moreMenus,
      // Always add admin menus to More dropdown for better organization
      ...adminMenus,
      // Add some user menus to More if they're important
      ...userMenus.filter(
        menu => ['bookmarks', 'history'].includes(menu.id) && maxPrimaryMenus < 2
      ),
    ];

    return {
      primary: primaryMenus,
      more: enhancedMoreMenus,
      userDropdown: organizedUserMenus,
      showSubmitButton,
      stats: {
        totalMenus: allMenus.length,
        distribution: `Primary: ${primaryMenus.length}, More: ${enhancedMoreMenus.length}, User: ${userMenus.length}`,
        screenSize:
          screenWidth >= breakpoints.xl
            ? 'xl'
            : screenWidth >= breakpoints.lg
            ? 'lg'
            : screenWidth >= breakpoints.md
            ? 'md'
            : 'sm',
        topScores: primaryMenus.map(m => `${m.label}:${m.score}`).join(', '),
      },
    };
  }, [allMenus, screenWidth, user]);
};

// Helper function to categorize user menus
export const getMenuCategory = menuId => {
  const categoryMap = {
    profile: 'profile',
    bookmarks: 'activity',
    history: 'activity',
    settings: 'settings',
    // admin menus are now handled in the More dropdown, not in user dropdown
  };
  return categoryMap[menuId] || 'other';
};

// Enhanced menu configuration with better role-based logic
export const getAllUserMenus = (isAuthenticated, user, pathname) => {
  if (!isAuthenticated || !user?.roleCapabilities) {
    return [];
  }

  const allMenus = [
    // Core product-related menus
    ...(user.roleCapabilities.canUploadProducts
      ? [
          {
            id: 'my-products',
            label: 'My Products',
            href: `/user/${user.username || user._id || 'profile'}/products`,
            icon: <Briefcase size={16} />,
            isActive: pathname.startsWith('/user/') && pathname.includes('/products'),
            priority: 1,
            category: 'core',
            importance: 'high',
          },
        ]
      : []),

    // Job-related menus
    ...(user.roleCapabilities.canApplyToJobs
      ? [
          {
            id: 'jobs',
            label: 'Jobs',
            href: '/jobs',
            icon: <Briefcase size={16} />,
            isActive: pathname.startsWith('/jobs') && !pathname.includes('/post'),
            priority: 2,
            category: 'jobs',
            importance: 'high',
          },
        ]
      : []),

    ...(user.roleCapabilities.canPostJobs
      ? [
          {
            id: 'post-jobs',
            label: 'Post Jobs',
            href: '/jobs/post',
            icon: <Plus size={16} />,
            isActive: pathname === '/jobs/post',
            priority: 3,
            category: 'jobs',
            importance: 'medium',
          },
          {
            id: 'my-jobs',
            label: 'My Job Posts',
            href: '/user/myjobs',
            icon: <FileText size={16} />,
            isActive: pathname === '/user/myjobs',
            priority: 4,
            category: 'jobs',
            importance: 'medium',
          },
        ]
      : []),

    // Project-related menus
    ...(user.roleCapabilities.canShowcaseProjects
      ? [
          {
            id: 'projects',
            label: 'Projects',
            href: '/projects',
            icon: <Layers size={16} />,
            isActive: pathname.startsWith('/projects'),
            priority: 5,
            category: 'projects',
            importance: 'medium',
          },
        ]
      : []),

    // Service-related menus
    ...(user.roleCapabilities.canOfferServices
      ? [
          {
            id: 'services',
            label: 'Services',
            href: '/services',
            icon: <Code size={16} />,
            isActive: pathname.startsWith('/services'),
            priority: 6,
            category: 'services',
            importance: 'medium',
          },
        ]
      : []),

    // Investment-related menus
    ...(user.roleCapabilities.canInvest
      ? [
          {
            id: 'invest',
            label: 'Invest',
            href: '/invest',
            icon: <DollarSign size={16} />,
            isActive: pathname.startsWith('/invest'),
            priority: 7,
            category: 'investment',
            importance: 'medium',
          },
        ]
      : []),

    // User profile menus
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      href: '/user/mybookmarks',
      icon: <Bookmark size={16} />,
      isActive: pathname === '/user/mybookmarks',
      priority: 8,
      category: 'user',
      importance: 'medium',
    },
    {
      id: 'history',
      label: 'History',
      href: '/user/history',
      icon: <Clock size={16} />,
      isActive: pathname === '/user/history',
      priority: 9,
      category: 'user',
      importance: 'low',
    },
    {
      id: 'profile',
      label: 'Profile',
      href: `/user/${user.username || user._id || 'profile'}`,
      icon: <User size={16} />,
      isActive: pathname === `/user/${user.username || user._id || 'profile'}`,
      priority: 10,
      category: 'user',
      importance: 'fixed',
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/user/settings',
      icon: <Settings size={16} />,
      isActive: pathname === '/user/settings',
      priority: 11,
      category: 'user',
      importance: 'low',
    },

    // Admin menus
    ...(user.role === 'admin' || user.secondaryRoles?.includes('admin')
      ? [
          {
            id: 'admin-users',
            label: 'User Management',
            href: '/admin/users',
            icon: <UsersIcon size={16} />,
            isActive: pathname.includes('/admin/users'),
            priority: 12,
            category: 'admin',
            importance: 'high',
          },
          {
            id: 'admin-waitlist',
            label: 'Waitlist',
            href: '/admin/waitlist',
            icon: <UserCheck size={16} />,
            isActive: pathname.includes('/admin/waitlist'),
            priority: 13,
            category: 'admin',
            importance: 'high',
          },
          {
            id: 'admin-analytics',
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <BarChart3 size={16} />,
            isActive: pathname.includes('/admin/analytics'),
            priority: 14,
            category: 'admin',
            importance: 'medium',
          },
          {
            id: 'admin-settings',
            label: 'System Settings',
            href: '/admin/settings',
            icon: <SettingsIcon size={16} />,
            isActive: pathname.includes('/admin/settings'),
            priority: 15,
            category: 'admin',
            importance: 'medium',
          },
        ]
      : []),
  ];

  return allMenus.sort((a, b) => a.priority - b.priority);
};

// Custom hook for screen width tracking
export const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenWidth;
};

// Menu item style utilities
export const getMenuItemStyle = menuId => {
  const colorMap = {
    profile: 'bg-blue-50 text-blue-600',
    bookmarks: 'bg-yellow-50 text-yellow-600',
    history: 'bg-indigo-50 text-indigo-600',
    settings: 'bg-gray-50 text-gray-600',
    'my-jobs': 'bg-teal-50 text-teal-600',
    'post-jobs': 'bg-emerald-50 text-emerald-600',
    invest: 'bg-green-50 text-green-600',
    admin: 'bg-red-50 text-red-600',
    projects: 'bg-purple-50 text-purple-600',
    services: 'bg-orange-50 text-orange-600',
  };
  return colorMap[menuId] || 'bg-gray-50 text-gray-600';
};

export const getMenuDescription = menuId => {
  const descriptionMap = {
    profile: 'Manage your public profile',
    bookmarks: 'Your saved products',
    history: 'Recent activity and views',
    settings: 'Account preferences',
    'my-jobs': 'Manage job postings',
    'post-jobs': 'Create job listings',
    invest: 'Investment opportunities',
    admin: 'Administrative tools',
    projects: 'Your project portfolio',
    services: 'Service offerings',
  };
  return descriptionMap[menuId] || 'Access this feature';
}; 