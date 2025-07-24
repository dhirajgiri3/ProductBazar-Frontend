export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: 'from-indigo-400 to-purple-500',
      100: 'from-indigo-500 to-purple-600',
      200: 'from-indigo-600 to-purple-700',
    },
    secondary: {
      50: 'from-slate-400 to-slate-500',
      100: 'from-slate-500 to-slate-600',
    },
    accent: {
      emerald: 'from-emerald-400 to-teal-500',
      amber: 'from-amber-400 to-orange-500',
      pink: 'from-pink-400 to-rose-500',
      blue: 'from-blue-400 to-cyan-500',
    },
    background: {
      primary: 'bg-slate-950',
      secondary: 'bg-slate-900/30',
      tertiary: 'bg-slate-800/30',
      card: 'bg-slate-950/60',
      elevated: 'bg-slate-900/60',
    },
    border: {
      primary: 'border-slate-800/30',
      secondary: 'border-slate-700/30',
      accent: 'border-indigo-500/20',
      glow: 'border-indigo-500/40',
      button: 'border-indigo-500/30',
      buttonHover: 'border-indigo-400/50',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      tertiary: 'text-slate-400',
      muted: 'text-slate-500',
      accent: 'text-indigo-400',
    }
  },
  
  typography: {
    h1: 'text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[0.95]',
    h2: 'text-3xl lg:text-4xl font-light tracking-tight',
    h3: 'text-2xl lg:text-3xl font-medium tracking-tight',
    h4: 'text-xl lg:text-2xl font-medium tracking-tight',
    body: 'text-base font-light leading-relaxed',
    bodySmall: 'text-sm font-light leading-relaxed',
    caption: 'text-sm font-medium',
    small: 'text-xs font-medium tracking-wide',
    button: 'text-sm font-medium',
  },
  
  spacing: {
    section: 'py-16 sm:py-24 lg:py-32',
    container: 'px-4 sm:px-6 lg:px-8',
    card: 'p-6 sm:p-8 lg:p-12',
    button: 'px-6 py-3',
    buttonLarge: 'px-8 py-4',
    input: 'px-4 py-3',
  },
  
  // Borders & Radius
  radius: {
    card: 'rounded-2xl',
    button: 'rounded-xl',
    pill: 'rounded-full',
    small: 'rounded-lg',
    input: 'rounded-xl',
  },
  
  // Shadows
  shadows: {
    card: 'shadow-2xl',
    button: 'shadow-lg hover:shadow-xl',
    glow: 'shadow-indigo-500/20',
    input: 'shadow-md',
  },
  
  // Animations
  animations: {
    duration: {
      fast: 0.3,
      normal: 0.6,
      slow: 0.8,
    },
    ease: [0.25, 0.46, 0.45, 0.94],
  },
};

// Helper functions for common patterns
export const getGradientClass = (gradientType = 'primary', intensity = 50) => {
  return `bg-gradient-to-r ${DESIGN_TOKENS.colors[gradientType][intensity]}`;
};

export const getTextGradientClass = (gradientType = 'primary', intensity = 50) => {
  return `bg-gradient-to-r ${DESIGN_TOKENS.colors[gradientType][intensity]} bg-clip-text text-transparent`;
};

export const getButtonClass = (variant = 'primary', size = 'normal') => {
  let baseClass = '';
  if (variant === 'primary') {
    baseClass = `bg-gradient-to-r ${DESIGN_TOKENS.colors.primary[100]} ${DESIGN_TOKENS.colors.text.primary} ${DESIGN_TOKENS.radius.button} font-medium border ${DESIGN_TOKENS.colors.border.button} hover:${DESIGN_TOKENS.colors.border.buttonHover} transition-all duration-300`;
  } else if (variant === 'secondary') {
    baseClass = `${DESIGN_TOKENS.colors.background.tertiary} ${DESIGN_TOKENS.colors.text.secondary} ${DESIGN_TOKENS.radius.button} font-medium border ${DESIGN_TOKENS.colors.border.secondary} hover:${DESIGN_TOKENS.colors.border.primary} hover:${DESIGN_TOKENS.colors.text.primary} transition-all duration-300`;
  } else if (variant === 'ghost') {
    baseClass = `${DESIGN_TOKENS.colors.text.secondary} hover:${DESIGN_TOKENS.colors.text.primary} transition-all duration-300`;
  }
  const sizeClass = size === 'large' ? DESIGN_TOKENS.spacing.buttonLarge : DESIGN_TOKENS.spacing.button;
  return `${baseClass} ${sizeClass}`;
};

export const getCardClass = (variant = 'primary') => {
  if (variant === 'primary') {
    return `${DESIGN_TOKENS.colors.background.card} backdrop-blur-2xl ${DESIGN_TOKENS.radius.card} ${DESIGN_TOKENS.colors.border.primary}`;
  } else if (variant === 'elevated') {
    return `${DESIGN_TOKENS.colors.background.elevated} backdrop-blur-2xl ${DESIGN_TOKENS.radius.card} ${DESIGN_TOKENS.colors.border.primary}`;
  }
  return '';
};

export const getInputClass = () => {
  return `${DESIGN_TOKENS.colors.background.tertiary} ${DESIGN_TOKENS.colors.text.primary} ${DESIGN_TOKENS.radius.input} ${DESIGN_TOKENS.colors.border.secondary} ${DESIGN_TOKENS.shadows.input} focus:${DESIGN_TOKENS.colors.border.accent} focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 ${DESIGN_TOKENS.spacing.input}`;
};

// Animation variants for Framer Motion
export const MOTION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: DESIGN_TOKENS.animations.duration.normal,
        ease: DESIGN_TOKENS.animations.ease
      }
    }
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: DESIGN_TOKENS.animations.duration.slow,
        ease: DESIGN_TOKENS.animations.ease
      }
    }
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: DESIGN_TOKENS.animations.duration.normal,
        ease: DESIGN_TOKENS.animations.ease
      }
    }
  },
  
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: DESIGN_TOKENS.animations.duration.normal,
        ease: DESIGN_TOKENS.animations.ease
      }
    }
  }
};

export default DESIGN_TOKENS; 