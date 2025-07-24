// Responsive utilities for mobile-first design

// Breakpoint utilities
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Mobile detection
export const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Touch device detection
export const useIsTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Responsive spacing utilities
export const spacing = {
  mobile: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },
  desktop: {
    xs: 'md:p-4',
    sm: 'md:p-6',
    md: 'md:p-8',
    lg: 'md:p-12',
    xl: 'md:p-16'
  }
};

// Responsive typography
export const typography = {
  mobile: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  },
  desktop: {
    xs: 'md:text-sm',
    sm: 'md:text-base',
    base: 'md:text-lg',
    lg: 'md:text-xl',
    xl: 'md:text-2xl',
    '2xl': 'md:text-3xl',
    '3xl': 'md:text-4xl',
    '4xl': 'md:text-5xl',
    '5xl': 'md:text-6xl'
  }
};

// Mobile-optimized animations
export const mobileAnimations = {
  // Reduced motion for mobile
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  // Faster transitions on mobile
  buttonTap: {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 }
  }
};

// Responsive grid utilities
export const gridColumns = {
  mobile: {
    1: 'grid-cols-1',
    2: 'grid-cols-2'
  },
  tablet: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3'
  },
  desktop: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  }
};

// Mobile-first button styles
export const buttonStyles = {
  mobile: {
    // Larger touch targets for mobile
    primary: 'px-6 py-4 text-base font-semibold rounded-xl min-h-[48px] w-full',
    secondary: 'px-4 py-3 text-sm font-medium rounded-lg min-h-[44px] w-full',
    small: 'px-3 py-2 text-sm rounded-md min-h-[40px]'
  },
  desktop: {
    primary: 'md:px-8 md:py-3 md:text-lg md:w-auto md:min-h-[52px]',
    secondary: 'md:px-6 md:py-2 md:text-base md:w-auto md:min-h-[48px]',
    small: 'md:px-4 md:py-1.5 md:text-sm md:min-h-[36px]'
  }
};

// Modal responsive styles
export const modalStyles = {
  mobile: {
    container: 'fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4',
    content: 'w-full max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md sm:w-full overflow-hidden',
    backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm'
  },
  desktop: {
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'w-full max-w-md max-h-[90vh] bg-white rounded-2xl overflow-hidden',
    backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm'
  }
};

// Form input responsive styles
export const inputStyles = {
  mobile: {
    base: 'w-full px-4 py-3 text-base border rounded-xl min-h-[48px] focus:ring-2 focus:border-transparent transition-all',
    small: 'w-full px-3 py-2 text-sm border rounded-lg min-h-[44px] focus:ring-2 focus:border-transparent transition-all'
  },
  desktop: {
    base: 'md:px-4 md:py-2.5 md:text-base md:min-h-[44px]',
    small: 'md:px-3 md:py-2 md:text-sm md:min-h-[40px]'
  }
};

// Card responsive styles
export const cardStyles = {
  mobile: {
    padding: 'p-4 sm:p-6',
    margin: 'm-2 sm:m-4',
    borderRadius: 'rounded-xl sm:rounded-2xl'
  },
  desktop: {
    padding: 'md:p-8',
    margin: 'md:m-6',
    borderRadius: 'md:rounded-2xl'
  }
};

// Navigation responsive utilities
export const navigationStyles = {
  mobile: {
    height: 'h-16',
    padding: 'px-4 py-3',
    fontSize: 'text-sm',
    iconSize: 'w-6 h-6'
  },
  desktop: {
    height: 'md:h-20',
    padding: 'md:px-8 md:py-4',
    fontSize: 'md:text-base',
    iconSize: 'md:w-7 md:h-7'
  }
};

// Responsive helper functions
export const combineResponsiveClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getResponsiveSpacing = (size = 'md') => {
  return combineResponsiveClasses(
    spacing.mobile[size],
    spacing.desktop[size]
  );
};

export const getResponsiveTypography = (size = 'base') => {
  return combineResponsiveClasses(
    typography.mobile[size],
    typography.desktop[size]
  );
};

export const getResponsiveButton = (variant = 'primary') => {
  return combineResponsiveClasses(
    buttonStyles.mobile[variant],
    buttonStyles.desktop[variant]
  );
};

export const getResponsiveInput = (variant = 'base') => {
  return combineResponsiveClasses(
    inputStyles.mobile[variant],
    inputStyles.desktop[variant]
  );
};

export const getResponsiveCard = () => {
  return combineResponsiveClasses(
    cardStyles.mobile.padding,
    cardStyles.mobile.margin,
    cardStyles.mobile.borderRadius,
    cardStyles.desktop.padding,
    cardStyles.desktop.margin,
    cardStyles.desktop.borderRadius
  );
};

// Mobile viewport utilities
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return '100vh';
  
  // Use CSS custom property for mobile viewport height
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  return 'calc(var(--vh, 1vh) * 100)';
};

// Safe area utilities for mobile devices
export const safeAreaStyles = {
  top: 'pt-safe-top',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  right: 'pr-safe-right',
  all: 'p-safe'
};

// Touch-optimized interaction zones
export const touchTargets = {
  minimum: 'min-w-[44px] min-h-[44px]', // iOS minimum
  recommended: 'min-w-[48px] min-h-[48px]', // Material Design
  comfortable: 'min-w-[56px] min-h-[56px]' // For primary actions
};

// Responsive grid template
export const createResponsiveGrid = (mobileColumns, tabletColumns, desktopColumns) => {
  return combineResponsiveClasses(
    gridColumns.mobile[mobileColumns],
    gridColumns.tablet[tabletColumns],
    gridColumns.desktop[desktopColumns]
  );
};

// Media query helpers for JavaScript
export const mediaQueries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touchDevice: '(hover: none) and (pointer: coarse)'
};

export const useMediaQuery = (query) => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia(query).matches;
};

// Performance optimizations for mobile
export const mobileOptimizations = {
  // Reduce animation complexity on mobile
  reduceMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Check for slow connection
  isSlowConnection: () => {
    if (typeof navigator === 'undefined' || !navigator.connection) return false;
    return navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === 'slow-2g';
  },
  
  // Battery optimization
  isLowBattery: () => {
    if (typeof navigator === 'undefined' || !navigator.getBattery) return false;
    navigator.getBattery().then(battery => battery.level < 0.2);
  }
};

// Accessibility improvements for mobile
export const accessibilityHelpers = {
  // Ensure sufficient contrast for mobile screens
  highContrast: 'contrast-more:bg-black contrast-more:text-white',
  
  // Focus management for mobile
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
  
  // Screen reader optimizations
  screenReaderOnly: 'sr-only',
  
  // Touch device specific accessibility
  touchAccessible: 'touch-manipulation select-none'
}; 