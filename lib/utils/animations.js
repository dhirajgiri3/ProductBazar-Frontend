// Animation utilities for waitlist components

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.6, 
    ease: 'easeOut',
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
};

export const progressBar = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: 0.8, ease: 'easeInOut' }
};

export const countUp = (from, to, duration = 1000) => {
  return {
    initial: from,
    animate: to,
    transition: { duration: duration / 1000, ease: 'easeOut' }
  };
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 10 }
};

export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const cardHover = {
  whileHover: { 
    y: -5, 
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' 
  },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const typewriterEffect = (text, speed = 50) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed / 1000,
      },
    },
  };

  const child = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return { variants, child };
};

// Success animations
export const successCheckmark = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.1
    }
  }
};

export const confettiEffect = {
  initial: { y: -10, opacity: 0 },
  animate: { 
    y: [0, -20, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.5,
      repeat: 3,
      ease: 'easeOut'
    }
  }
};

// Loading animations
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const dotPulse = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Form animations
export const inputFocus = {
  whileFocus: { 
    scale: 1.02,
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  transition: { duration: 0.2 }
};

export const labelFloat = (isFocused, hasValue) => ({
  initial: false,
  animate: {
    y: (isFocused || hasValue) ? -20 : 0,
    scale: (isFocused || hasValue) ? 0.85 : 1,
    color: isFocused ? '#3B82F6' : '#6B7280'
  },
  transition: { duration: 0.2, ease: 'easeOut' }
});

// Progress animations
export const progressFill = (progress) => ({
  initial: { width: '0%' },
  animate: { width: `${progress}%` },
  transition: { duration: 0.5, ease: 'easeOut' }
});

export const stepIndicator = (isActive, isCompleted) => ({
  initial: false,
  animate: {
    scale: isActive ? 1.1 : 1,
    backgroundColor: isCompleted ? '#10B981' : isActive ? '#3B82F6' : '#E5E7EB',
    color: (isCompleted || isActive) ? '#FFFFFF' : '#6B7280'
  },
  transition: { duration: 0.3, ease: 'easeOut' }
});

// Social sharing animations
export const shareButtonExpand = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 25 }
};

export const copySuccess = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1],
    backgroundColor: ['#3B82F6', '#10B981', '#3B82F6']
  },
  transition: { duration: 0.6, ease: 'easeInOut' }
};

// Notification animations
export const notificationSlide = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
};

export const badgeBounce = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15
    }
  }
};

// Chart animations
export const chartLineGrow = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 2, ease: 'easeInOut' }
};

export const barGrowUp = (delay = 0) => ({
  initial: { scaleY: 0 },
  animate: { scaleY: 1 },
  transition: { duration: 0.8, delay, ease: 'easeOut' }
});

// Utility functions
export const createStaggeredAnimation = (children, staggerDelay = 0.1) => {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
};

export const delayedAnimation = (animation, delay) => ({
  ...animation,
  transition: {
    ...animation.transition,
    delay
  }
});

export const repeatAnimation = (animation, repeatCount = Infinity) => ({
  ...animation,
  animate: {
    ...animation.animate,
    transition: {
      ...animation.transition,
      repeat: repeatCount
    }
  }
});

// Theme-aware animations
export const themeTransition = {
  transition: { duration: 0.3, ease: 'easeInOut' }
};

export const mobileOptimized = (animation, isMobile) => {
  if (isMobile) {
    return {
      ...animation,
      transition: {
        ...animation.transition,
        duration: (animation.transition?.duration || 0.3) * 0.8 // Faster on mobile
      }
    };
  }
  return animation;
}; 