"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedBookmarkIcon = ({ isBookmarked, isLoading, size = "md", className = "" }) => {
  // Size mapping
  const sizeMap = {
    sm: { width: 14, height: 14, strokeWidth: 1.5 },
    md: { width: 16, height: 16, strokeWidth: 1.5 },
    lg: { width: 20, height: 20, strokeWidth: 1.5 },
  };

  const { width, height, strokeWidth } = sizeMap[size] || sizeMap.md;

  // Colors
  const colors = {
    primary: "#8B5CF6", // Violet-600
    primaryLight: "#A78BFA", // Violet-400
    primaryLighter: "#EDE9FE", // Violet-100 - lighter for better contrast
    inactive: "#6B7280" // Gray-500 - better contrast than currentColor
  };

  // SVG container animation
  const svgVariants = {
    initial: { scale: 1 },
    bookmarked: {
      scale: [1, 1.15, 1],
      transition: {
        duration: 0.4,
        times: [0, 0.3, 1],
        ease: "easeOut"
      }
    },
    unbookmarked: {
      scale: [1, 0.9, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.3, 1],
        ease: "easeOut"
      }
    },
    loading: {
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    }
  };

  // Path animation variants
  const pathVariants = {
    initial: {
      pathLength: 0,
      fill: "rgba(139, 92, 246, 0)",
      stroke: colors.inactive,
      filter: "none"
    },
    bookmarked: {
      pathLength: 1,
      fill: colors.primaryLighter,
      stroke: colors.primary,
      filter: "none", // Removed drop shadow
      transition: {
        pathLength: { type: "spring", duration: 0.5, bounce: 0.2 },
        fill: {
          type: "spring",
          duration: 0.5,
          bounce: 0.2
        },
        stroke: { duration: 0.3 }
      }
    },
    unbookmarked: {
      pathLength: 1,
      fill: "rgba(139, 92, 246, 0)",
      stroke: colors.inactive,
      filter: "none",
      transition: {
        pathLength: { type: "spring", duration: 0.4, bounce: 0.2 },
        fill: { duration: 0.2 },
        stroke: { duration: 0.2 }
      }
    },
    loading: {
      pathLength: 1,
      fill: "rgba(139, 92, 246, 0)",
      stroke: [colors.inactive, colors.primary, colors.inactive],
      filter: "none",
      transition: {
        stroke: {
          repeat: Infinity,
          duration: 1.5,
          times: [0, 0.5, 1]
        }
      }
    }
  };

  // Checkmark animation variants
  const checkVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 0.4, bounce: 0.2, delay: 0.1 },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    }
  };

  // Enhanced hover effect
  const enhancedHover = {
    scale: 1.05,
    y: -1,
    transition: { duration: 0.15 }
  };

  // Determine which animation variant to use
  const animationState = isLoading
    ? "loading"
    : isBookmarked
      ? "bookmarked"
      : "unbookmarked";

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="initial"
      animate={animationState}
      whileHover={enhancedHover}
      whileTap={{ scale: 0.95 }}
      variants={svgVariants}
    >
      <motion.path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        variants={pathVariants}
      />
      {isBookmarked && (
        <motion.path
          d="M9 10l2 2 4-4"
          stroke="#8B5CF6"
          strokeWidth={strokeWidth}
          initial="initial"
          animate="animate"
          variants={checkVariants}
        />
      )}
    </motion.svg>
  );
};

export default AnimatedBookmarkIcon;
