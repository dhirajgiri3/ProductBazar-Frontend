"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedUpvoteIcon = ({ isUpvoted, isLoading, size = "md", className = "" }) => {
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
    initial: { scale: 1, y: 0 },
    upvoted: {
      scale: [1, 1.15, 1],
      y: [0, -2, 0],
      transition: {
        duration: 0.4,
        times: [0, 0.3, 1],
        ease: "easeOut"
      }
    },
    notUpvoted: {
      scale: [1, 0.9, 1],
      y: 0,
      transition: {
        duration: 0.3,
        times: [0, 0.3, 1],
        ease: "easeOut"
      }
    },
    loading: {
      y: [0, -2, 0],
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  // Triangle animation variants (new cleaner upvote shape)
  const triangleVariants = {
    initial: {
      opacity: 0,
      fill: "rgba(139, 92, 246, 0)",
      stroke: colors.inactive,
      strokeWidth: strokeWidth
    },
    upvoted: {
      opacity: 1,
      fill: colors.primaryLighter,
      stroke: colors.primary,
      strokeWidth: strokeWidth,
      filter: "none", // Removed drop shadow
      transition: {
        opacity: { duration: 0.2 },
        fill: {
          type: "spring",
          duration: 0.5,
          bounce: 0.2
        },
        stroke: { duration: 0.3 }
      }
    },
    notUpvoted: {
      opacity: 1,
      fill: "rgba(139, 92, 246, 0)",
      stroke: colors.inactive,
      strokeWidth: strokeWidth,
      filter: "none",
      transition: {
        opacity: { duration: 0.2 },
        fill: { duration: 0.2 },
        stroke: { duration: 0.2 }
      }
    },
    loading: {
      opacity: 1,
      fill: "rgba(139, 92, 246, 0)",
      stroke: [colors.inactive, colors.primary, colors.inactive],
      strokeWidth: strokeWidth,
      transition: {
        stroke: {
          repeat: Infinity,
          duration: 1.5,
          times: [0, 0.5, 1]
        }
      }
    }
  };

  // Determine which animation variant to use
  const animationState = isLoading
    ? "loading"
    : isUpvoted
      ? "upvoted"
      : "notUpvoted";

  // Enhanced hover effect
  const enhancedHover = {
    scale: 1.05,
    y: -1,
    transition: { duration: 0.15 }
  };

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
      whileTap={{ scale: 0.95, y: 1 }}
      variants={svgVariants}
    >
      {/* Clean triangle upvote icon */}
      <motion.polygon
        points="12,5 4,15 20,15"
        variants={triangleVariants}
      />
    </motion.svg>
  );
};

export default AnimatedUpvoteIcon;
