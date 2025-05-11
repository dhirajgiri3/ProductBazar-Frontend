"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls, useSpring } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { useTheme } from "../../../../Contexts/Theme/ThemeContext";

/**
 * Ultra-Enhanced SectionLabel Component
 *
 * A stunningly designed section label with premium animations and visual effects.
 * Features 3D transforms, particle effects, gradient backgrounds, advanced hover states,
 * and sophisticated entrance animations for a truly premium feel.
 *
 * Optimized for performance with proper overflow handling and efficient animations.
 */
const SectionLabel = ({
  text,
  alignment = 'left',
  size = 'medium',
  className = "",
  id,
  uppercase = false,
  customColor,
  animate = true,
  icon = null,
  glowEffect = false,
  variant = 'default',
  badge = null,
  ribbon = false,
  gradientText = false,
  pulseEffect = false,
  magneticEffect = false,
  particleEffect = false,
  animationStyle = 'fade', // 'fade', 'slide', 'bounce', 'typewriter', '3d'
  animationDelay = 0,
}) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Refs for magnetic effect
  const labelRef = useRef(null);

  // Spring animations for smoother movement
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const translateX = useSpring(0, springConfig);
  const translateY = useSpring(0, springConfig);

  // Controls for advanced animations
  const controls = useAnimationControls();

  // Size variants with improved spacing
  const sizeVariants = {
    small: {
      base: "text-xs sm:text-sm",
      padding: "px-4 py-1.5",
      iconSize: "w-3 h-3 mr-1.5",
    },
    medium: {
      base: "text-sm sm:text-base",
      padding: "px-5 py-2",
      iconSize: "w-4 h-4 mr-2",
    },
    large: {
      base: "text-base sm:text-lg md:text-xl",
      padding: "px-6 py-2.5",
      iconSize: "w-5 h-5 mr-2.5",
    },
  };

  // Alignment classes
  const alignmentClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  // Enhanced design variants with more options
  const designVariants = {
    default: {
      bg: isDarkMode ? "bg-violet-900/60" : "bg-violet-100/80",
      text: isDarkMode ? "text-violet-200" : "text-violet-700",
      border: isDarkMode ? "border-violet-700/50" : "border-violet-300",
      accent: isDarkMode ? "from-violet-400 to-purple-500" : "from-violet-500 to-purple-600",
      dot: isDarkMode ? "bg-violet-400" : "bg-violet-500",
      badgeBg: isDarkMode ? "bg-violet-700" : "bg-violet-200",
      badgeText: isDarkMode ? "text-violet-100" : "text-violet-800",
      ribbonBg: isDarkMode ? "bg-violet-800" : "bg-violet-300",
      gradientText: "from-violet-400 to-purple-500",
    },
    gradient: {
      bg: isDarkMode ? "bg-gradient-to-r from-indigo-900/70 to-purple-900/70" : "bg-gradient-to-r from-indigo-100 to-purple-100",
      text: isDarkMode ? "text-indigo-100" : "text-indigo-700",
      border: isDarkMode ? "border-indigo-700/40" : "border-indigo-200",
      accent: isDarkMode ? "from-indigo-400 to-purple-500" : "from-indigo-500 to-purple-600",
      dot: isDarkMode ? "bg-indigo-400" : "bg-indigo-500",
      badgeBg: isDarkMode ? "bg-indigo-700" : "bg-indigo-200",
      badgeText: isDarkMode ? "text-indigo-100" : "text-indigo-800",
      ribbonBg: isDarkMode ? "bg-indigo-800" : "bg-indigo-300",
      gradientText: "from-indigo-400 to-purple-500",
    },
    minimal: {
      bg: isDarkMode ? "bg-gray-900/50" : "bg-white",
      text: isDarkMode ? "text-gray-200" : "text-gray-700",
      border: isDarkMode ? "border-gray-700" : "border-gray-200",
      accent: isDarkMode ? "from-gray-400 to-gray-500" : "from-gray-600 to-gray-700",
      dot: isDarkMode ? "bg-gray-400" : "bg-gray-500",
      badgeBg: isDarkMode ? "bg-gray-700" : "bg-gray-200",
      badgeText: isDarkMode ? "text-gray-100" : "text-gray-800",
      ribbonBg: isDarkMode ? "bg-gray-800" : "bg-gray-300",
      gradientText: "from-gray-400 to-gray-600",
    },
    vibrant: {
      bg: isDarkMode ? "bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-pink-900/60" : "bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100",
      text: isDarkMode ? "text-blue-100" : "text-blue-700",
      border: isDarkMode ? "border-blue-700/40" : "border-blue-200",
      accent: isDarkMode ? "from-blue-400 via-purple-400 to-pink-400" : "from-blue-500 via-purple-500 to-pink-500",
      dot: isDarkMode ? "bg-blue-400" : "bg-blue-500",
      badgeBg: isDarkMode ? "bg-blue-700" : "bg-blue-200",
      badgeText: isDarkMode ? "text-blue-100" : "text-blue-800",
      ribbonBg: isDarkMode ? "bg-blue-800" : "bg-blue-300",
      gradientText: "from-blue-400 via-purple-400 to-pink-400",
    },
    neon: {
      bg: isDarkMode ? "bg-black/80" : "bg-white/80",
      text: isDarkMode ? "text-green-400" : "text-green-500",
      border: isDarkMode ? "border-green-500/50" : "border-green-400/50",
      accent: isDarkMode ? "from-green-400 to-emerald-500" : "from-green-500 to-emerald-600",
      dot: isDarkMode ? "bg-green-400" : "bg-green-500",
      badgeBg: isDarkMode ? "bg-green-900" : "bg-green-200",
      badgeText: isDarkMode ? "text-green-100" : "text-green-800",
      ribbonBg: isDarkMode ? "bg-green-800" : "bg-green-300",
      gradientText: "from-green-400 to-emerald-500",
    },
    sunset: {
      bg: isDarkMode ? "bg-gradient-to-r from-orange-900/70 to-red-900/70" : "bg-gradient-to-r from-orange-100 to-red-100",
      text: isDarkMode ? "text-orange-100" : "text-orange-700",
      border: isDarkMode ? "border-orange-700/40" : "border-orange-200",
      accent: isDarkMode ? "from-orange-400 to-red-500" : "from-orange-500 to-red-600",
      dot: isDarkMode ? "bg-orange-400" : "bg-orange-500",
      badgeBg: isDarkMode ? "bg-orange-700" : "bg-orange-200",
      badgeText: isDarkMode ? "text-orange-100" : "text-orange-800",
      ribbonBg: isDarkMode ? "bg-orange-800" : "bg-orange-300",
      gradientText: "from-orange-400 to-red-500",
    },
    ocean: {
      bg: isDarkMode ? "bg-gradient-to-r from-cyan-900/70 to-blue-900/70" : "bg-gradient-to-r from-cyan-100 to-blue-100",
      text: isDarkMode ? "text-cyan-100" : "text-cyan-700",
      border: isDarkMode ? "border-cyan-700/40" : "border-cyan-200",
      accent: isDarkMode ? "from-cyan-400 to-blue-500" : "from-cyan-500 to-blue-600",
      dot: isDarkMode ? "bg-cyan-400" : "bg-cyan-500",
      badgeBg: isDarkMode ? "bg-cyan-700" : "bg-cyan-200",
      badgeText: isDarkMode ? "text-cyan-100" : "text-cyan-800",
      ribbonBg: isDarkMode ? "bg-cyan-800" : "bg-cyan-300",
      gradientText: "from-cyan-400 to-blue-500",
    },
    glass: {
      bg: isDarkMode ? "bg-white/10 backdrop-blur-md" : "bg-black/5 backdrop-blur-md",
      text: isDarkMode ? "text-white" : "text-gray-800",
      border: isDarkMode ? "border-white/20" : "border-black/10",
      accent: isDarkMode ? "from-white/40 to-white/20" : "from-black/20 to-black/10",
      dot: isDarkMode ? "bg-white" : "bg-black",
      badgeBg: isDarkMode ? "bg-white/20" : "bg-black/10",
      badgeText: isDarkMode ? "text-white" : "text-gray-800",
      ribbonBg: isDarkMode ? "bg-white/20" : "bg-black/10",
      gradientText: isDarkMode ? "from-white to-gray-300" : "from-gray-700 to-black",
    }
  };

  // Get design variant (with fallback to default)
  const design = designVariants[variant] || designVariants.default;

  // Animation style variants based on the animationStyle prop
  const getContainerVariants = () => {
    const baseTransition = {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smoother feel
      delay: animationDelay
    };

    const variants = {
      fade: {
        hidden: { opacity: 0, y: 15, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: baseTransition
        }
      },
      slide: {
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            ...baseTransition,
            x: { type: "spring", stiffness: 100, damping: 15 }
          }
        }
      },
      bounce: {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...baseTransition,
            y: { type: "spring", stiffness: 200, damping: 10 },
            scale: { type: "spring", stiffness: 300, damping: 15, delay: animationDelay + 0.1 }
          }
        }
      },
      '3d': {
        hidden: {
          opacity: 0,
          rotateX: 90,
          y: 20,
          scale: 0.9
        },
        visible: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transition: {
            ...baseTransition,
            rotateX: { type: "spring", stiffness: 100, damping: 15 }
          }
        }
      },
      typewriter: {
        hidden: { width: 0, opacity: 0 },
        visible: {
          width: "auto",
          opacity: 1,
          transition: {
            ...baseTransition,
            width: { duration: 0.8 }
          }
        }
      }
    };

    return variants[animationStyle] || variants.fade;
  };

  const containerVariants = getContainerVariants();

  // Enhanced letter animation variants
  const getLetterVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: i => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: animationDelay + 0.05 * i,
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }
      })
    };

    const variants = {
      fade: baseVariants,
      slide: {
        hidden: { opacity: 0, x: -10 },
        visible: i => ({
          opacity: 1,
          x: 0,
          transition: {
            delay: animationDelay + 0.03 * i,
            duration: 0.3,
            ease: "easeOut",
          }
        })
      },
      bounce: {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: i => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: animationDelay + 0.04 * i,
            duration: 0.4,
            y: { type: "spring", stiffness: 200, damping: 10 },
            scale: { type: "spring", stiffness: 300, damping: 15 }
          }
        })
      },
      '3d': {
        hidden: { opacity: 0, rotateY: 90 },
        visible: i => ({
          opacity: 1,
          rotateY: 0,
          transition: {
            delay: animationDelay + 0.05 * i,
            duration: 0.4,
            ease: "easeOut",
          }
        })
      },
      typewriter: {
        hidden: { opacity: 0 },
        visible: i => ({
          opacity: 1,
          transition: {
            delay: animationDelay + 0.05 * i,
            duration: 0.1,
          }
        })
      }
    };

    return variants[animationStyle] || variants.fade;
  };

  const letterVariants = getLetterVariants();

  // Enhanced dot animation variants
  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: animationDelay + 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    hover: {
      scale: 1.3,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  };

  // Reset animation if text changes - this is important for re-triggering animations
  useEffect(() => {
    setHasAnimated(false);
  }, [text]);

  // Handle magnetic effect - optimized to use element-specific events
  useEffect(() => {
    if (!magneticEffect || !labelRef.current) return;

    const element = labelRef.current;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate distance from center (normalized)
      const distanceX = (e.offsetX - centerX) / (rect.width / 2);
      const distanceY = (e.offsetY - centerY) / (rect.height / 2);

      // Apply rotation and translation based on mouse position
      rotateX.set(distanceY * -4); // Reduced intensity for smoother effect
      rotateY.set(distanceX * 4);
      translateX.set(distanceX * 4);
      translateY.set(distanceY * 4);
    };

    const handleMouseLeave = () => {
      // Reset to original position with spring animation
      rotateX.set(0);
      rotateY.set(0);
      translateX.set(0);
      translateY.set(0);
    };

    // Use element-specific events instead of window events for better performance
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [magneticEffect, rotateX, rotateY, translateX, translateY]);

  // Handle pulse effect - optimized for performance
  useEffect(() => {
    if (pulseEffect && controls) {
      controls.start({
        scale: [1, 1.02, 1], // Reduced scale for subtler effect
        transition: {
          duration: 2.5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.5, 1] // Explicit timing control
        }
      });
    }

    return () => {
      if (controls) {
        controls.stop(); // Clean up animation on unmount
      }
    };
  }, [pulseEffect, controls]);

  // Mark as animated once animation completes
  const handleAnimationComplete = () => {
    setHasAnimated(true);
  };

  // Combine all classes
  const containerClasses = cn(
    "relative inline-flex items-center justify-center overflow-hidden",
    // Base shape - rounded by default, but can be modified for ribbon
    ribbon ? "rounded-l-full" : "rounded-full",
    // Padding and text size
    sizeVariants[size].padding,
    sizeVariants[size].base,
    // Background and text colors
    !gradientText && design.text,
    design.bg,
    // Font weight
    "font-medium",
    // Border styles
    design.border,
    "border",
    // Spacing
    "mb-6",
    // Alignment
    alignmentClasses[alignment],
    // Text transformation
    uppercase ? "uppercase tracking-wider" : "tracking-wide",
    // Shadow effects
    glowEffect ? "shadow-lg" : "shadow-md",
    glowEffect && isDarkMode ? "shadow-violet-500/20" : "",
    glowEffect && !isDarkMode ? "shadow-violet-500/20" : "",
    // Glass effect for the glass variant
    variant === 'glass' && "backdrop-filter backdrop-blur-md",
    // Animation style specific classes
    animationStyle === 'typewriter' && "whitespace-nowrap",
    // Custom classes
    className
  );

  // Helper for letter animation
  const animateText = () => {
    return text.split('').map((char, index) => (
      <motion.span
        key={index}
        custom={index}
        initial={animate && !hasAnimated ? "hidden" : "visible"}
        animate={animate && !hasAnimated ? "visible" : "visible"}
        variants={letterVariants}
        style={char === ' ' ? { marginRight: '0.25em' } : {}}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <div
      className={cn(
        "relative",
        alignment === 'center' ? "flex justify-center" :
        alignment === 'right' ? "flex justify-end" : ""
      )}
    >
      <motion.div
        id={id}
        ref={labelRef}
        className={containerClasses}
        style={{
          boxShadow: glowEffect ? (isDarkMode ? '0 0 20px rgba(139, 92, 246, 0.2)' : '0 0 20px rgba(139, 92, 246, 0.15)') : '',
          ...customColor ? { color: customColor } : {},
          ...(magneticEffect ? {
            rotateX: rotateX,
            rotateY: rotateY,
            translateX: translateX,
            translateY: translateY,
            transformStyle: "preserve-3d",
            perspective: "1000px"
          } : {})
        }}
        initial={animate && !hasAnimated ? "hidden" : "visible"}
        animate={animate && !hasAnimated || pulseEffect ? "visible" : "visible"}
        variants={containerVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onAnimationComplete={handleAnimationComplete}
        whileHover={{
          y: -3,
          boxShadow: glowEffect
            ? (isDarkMode ? '0 0 25px rgba(139, 92, 246, 0.3)' : '0 0 25px rgba(139, 92, 246, 0.25)')
            : '',
          scale: 1.02
        }}
      >
        {/* Background gradient effect */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-20",
            ribbon ? "rounded-l-full" : "rounded-full"
          )}
        />

        {/* Ribbon tail (if enabled) */}
        {ribbon && (
          <div className={cn(
            "absolute -right-3 top-0 h-full w-6 overflow-hidden",
          )}>
            <div className={cn(
              "absolute top-0 left-0 h-full w-full transform -skew-x-12",
              design.ribbonBg
            )}></div>
          </div>
        )}

        {/* Dot accent with pulse effect option */}
        <motion.span
          className={cn(
            "w-2 h-2 rounded-full",
            design.dot,
            "mr-2"
          )}
          initial={animate && !hasAnimated ? "hidden" : "visible"}
          animate={animate && !hasAnimated
            ? "visible"
            : (pulseEffect
                ? "pulse"
                : (isHovered ? "hover" : "visible")
              )
          }
          variants={dotVariants}
        />

        {/* Icon (if provided) */}
        {icon && (
          <span className={sizeVariants[size].iconSize}>
            {icon}
          </span>
        )}

        {/* Label text with letter animation and gradient option */}
        <span
          className={cn(
            "relative z-10 font-medium",
            gradientText && "bg-gradient-to-r bg-clip-text text-transparent",
            gradientText && design.gradientText
          )}
        >
          {animate && !hasAnimated ? animateText() : text}
        </span>

        {/* Badge (if provided) */}
        {badge && (
          <span className={cn(
            "ml-2 px-1.5 py-0.5 text-xs rounded-full",
            design.badgeBg,
            design.badgeText,
            "font-semibold"
          )}>
            {badge}
          </span>
        )}

        {/* Subtle shimmer effect on hover - optimized */}
        {isHovered && (
          <motion.div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10",
              ribbon ? "rounded-l-full" : "rounded-full"
            )}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "100%", opacity: 0.15 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          />
        )}

        {/* Particle effects - optimized */}
        {particleEffect && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Reduced number of particles for better performance */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-1.5 h-1.5 rounded-full",
                  design.dot
                )}
                style={{
                  top: "50%",
                  left: "50%",
                  marginTop: "-2px",
                  marginLeft: "-2px"
                }}
                initial="hidden"
                animate="visible"
                custom={i}
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  visible: {
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (8 + i * 4)],
                    y: [0, (i % 3 === 0 ? 1 : -1) * (8 + i * 3)],
                    transition: {
                      delay: 0.2 + (i * 0.1),
                      duration: 1.2,
                      repeat: Infinity,
                      repeatDelay: 0.8,
                      ease: "easeInOut"
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SectionLabel;