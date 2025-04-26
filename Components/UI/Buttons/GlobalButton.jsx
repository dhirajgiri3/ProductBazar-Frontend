import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion"; // AnimatePresence removed
import * as LucideIcons from "lucide-react";
import clsx from "clsx";

/**
 * GlobalButton - An interactive button component with magnetic hover,
 * subtle shimmer, scale transitions, and icon animation.
 */
const GlobalButton = ({
  children,
  icon,
  iconPosition = "right",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  magneticEffect = true, // Keep magnetic effect
  shimmerEffect = true, // Keep shimmer effect
  onClick,
  className = "",
  ariaLabel,
  href,
  style = {},
  ...props
}) => {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMagneticActive, setIsMagneticActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // --- Effects Configuration ---
  const enableMagneticEffect =
    magneticEffect && !prefersReducedMotion && !disabled;
  // Keep shimmer toggle, controlled by isHovered state below
  const enableShimmerEffect =
    shimmerEffect && !prefersReducedMotion && !disabled;
  const enableHoverScale = !prefersReducedMotion && !disabled;
  const enableTapScale = !prefersReducedMotion && !disabled;
  const enableIconAnimation = !prefersReducedMotion && !disabled && isHovered; // Icon animation depends on hover

  // --- Magnetic Effect ---
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  // Slightly softer spring for magnetic movement
  const springConfig = { stiffness: 110, damping: 18, mass: 1 };
  const springX = useSpring(magneticX, springConfig);
  const springY = useSpring(magneticY, springConfig);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (enableMagneticEffect) setIsMagneticActive(true);
  };

  const handleMouseMove = (e) => {
    if (!buttonRef.current || !isMagneticActive) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerDistX = mouseX - rect.width / 2;
    const centerDistY = mouseY - rect.height / 2;
    // Slightly reduced strength for refinement
    const magneticStrength = size === "sm" ? 0.18 : size === "md" ? 0.22 : 0.28;
    magneticX.set(centerDistX * magneticStrength);
    magneticY.set(centerDistY * magneticStrength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMagneticActive(false);
    magneticX.set(0);
    magneticY.set(0);
  };

  // --- Simplified Click Handler ---
  const handleClick = (event) => {
    // Just call the original onClick handler if it exists
    onClick?.(event);
  };

  // --- Dynamic Styling ---
  const IconComponent = icon ? LucideIcons[icon] : null;

  const sizeClasses = {
    sm: "py-2 px-4 text-sm rounded-full",
    md: "py-2.5 px-6 text-base rounded-full",
    lg: "py-3 px-8 text-lg rounded-full",
  };

  const variants = {
    primary: {
      base: "bg-violet-600 dark:bg-violet-500 text-white border-transparent",
      hover: "hover:bg-violet-700 dark:hover:bg-violet-600 hover:shadow-lg",
      focusRing: "focus-visible:ring-indigo-500",
    },
    secondary: {
      base: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-transparent",
      hover: "hover:bg-gray-200 dark:hover:bg-gray-600",
      focusRing: "focus-visible:ring-gray-400",
    },
    outline: {
      base: "bg-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500 dark:border-indigo-400",
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
      focusRing: "focus-visible:ring-indigo-500",
    },
    ghost: {
      base: "bg-transparent text-gray-700 dark:text-gray-300 border-transparent",
      hover: "hover:bg-gray-100 dark:hover:bg-gray-800/50",
      focusRing: "focus-visible:ring-gray-400",
    },
    danger: {
      base: "bg-red-600 dark:bg-red-500 text-white border-transparent",
      hover: "hover:bg-red-700 dark:hover:bg-red-600 hover:shadow-lg",
      focusRing: "focus-visible:ring-red-500",
    },
    success: {
      base: "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent",
      hover: "hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-lg",
      focusRing: "focus-visible:ring-emerald-500",
    },
  };

  const variantStyle = variants[variant] || variants.primary;
  const Element = href ? motion.a : motion.button;

  const elementProps = {
    ref: buttonRef,
    className: clsx(
      "relative inline-flex items-center justify-center font-medium",
      "overflow-hidden", // Still useful for shimmer and general clipping
      "select-none align-middle",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
      "transition-colors duration-150 ease-in-out", // Base color transition
      sizeClasses[size],
      variantStyle.base,
      variantStyle.focusRing,
      { [variantStyle.hover]: !disabled }, // Class-based hover styles
      { "opacity-60 cursor-not-allowed": disabled },
      { "w-full": fullWidth },
      className
    ),
    style: {
      ...style, // User-provided styles
      ...(enableMagneticEffect && isMagneticActive // Apply magnetic translation style
        ? { x: springX, y: springY }
        : {}),
      // Keep border style setting for outline transition
      borderWidth: variant === "outline" ? "1px" : "0px",
      borderStyle: "solid",
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseMove: enableMagneticEffect ? handleMouseMove : undefined, // Attach mouse move only if magnetic
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onClick: handleClick, // Simplified click handler
    disabled: disabled,
    "aria-label":
      ariaLabel || (typeof children === "string" ? children : undefined),
    // Scale animations via Framer Motion
    whileHover: enableHoverScale ? { scale: 1.03 } : {},
    whileTap: enableTapScale ? { scale: 0.97 } : {},
    // Define transition for the scale effect (snappier)
    transition: { type: "spring", stiffness: 350, damping: 20 },
    ...(href ? { href } : {}),
    ...props,
  };

  return (
    <Element {...elementProps}>
      {/* Refined Subtle Shimmer Effect */}
      {/* Shimmer enabled by prop but only renders if isHovered is true */}
      {enableShimmerEffect && isHovered && (
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ borderRadius: "inherit" }} // Match button's rounding
          aria-hidden="true"
          initial={{ opacity: 0 }} // Fade in shimmer on hover
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // Fade out shimmer on leave
          transition={{ duration: 0.3 }} // Quick fade transition for shimmer presence
        >
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/10 dark:via-white/05 to-transparent" // Very subtle gradient
            style={{ transform: "skewX(-15deg)" }}
            initial={{ x: "-150%" }}
            animate={{ x: "150%" }}
            transition={{
              duration: 2.5, // Slower duration
              ease: "linear", // Keep linear for smooth sweep
              repeat: Infinity,
              repeatDelay: 4, // Longer delay between repeats
            }}
          />
        </motion.div>
      )}

      {/* Content Layer (still needs z-index to potentially sit above shimmer bg) */}
      <span
        className={clsx(
          "relative z-10 flex items-center justify-center gap-2", // z-10 useful if background elements exist
          iconPosition === "left" ? "flex-row" : "flex-row-reverse"
        )}
      >
        {children}
        {IconComponent && (
          <motion.span
            className="inline-flex items-center justify-center"
            aria-hidden="true"
            animate={
              enableIconAnimation // Icon animation driven by hover state
                ? { x: iconPosition === "right" ? [0, 2.5, 0] : [0, -2.5, 0] } // Smaller bounce distance
                : { x: 0 } // Return to 0 when not hovered/animating
            }
            transition={
              enableIconAnimation
                ? {
                    duration: 1.8, // Slightly longer duration for smoother loop
                    ease: "easeInOut", // Standard smooth easing
                    repeat: Infinity,
                    repeatDelay: 0.3, // Small delay
                  }
                : { duration: 0.2, ease: "easeOut" } // Faster return transition
            }
          >
            <IconComponent
              className={clsx(
                "flex-shrink-0",
                size === "sm"
                  ? "h-4 w-4"
                  : size === "md"
                  ? "h-5 w-5"
                  : "h-5 w-5"
              )}
            />
          </motion.span>
        )}
      </span>
    </Element>
  );
};

export default GlobalButton;
