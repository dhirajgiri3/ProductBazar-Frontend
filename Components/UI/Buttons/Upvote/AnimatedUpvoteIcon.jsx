"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedUpvoteIcon = ({
  isUpvoted,
  isLoading,
  size = "md",
  className = "",
}) => {
  // Simplified size mapping
  const sizeMap = {
    sm: { width: 14, height: 14, strokeWidth: 1.5 },
    md: { width: 16, height: 16, strokeWidth: 1.5 },
    lg: { width: 20, height: 20, strokeWidth: 1.5 },
  };

  const { width, height, strokeWidth } = sizeMap[size] || sizeMap.md;

  // Simplified colors
  const colors = {
    primary: "#8B5CF6", // Violet-600
    inactive: "#6B7280", // Gray-500
  };

  // Combined variants for cleaner code
  const animationState = isLoading
    ? "loading"
    : isUpvoted
    ? "upvoted"
    : "notUpvoted";

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isUpvoted ? colors.primary : colors.inactive}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={{ scale: 1, y: 0 }}
      animate={{
        scale: isLoading ? 1 : isUpvoted ? [1, 1.15, 1] : [1, 0.9, 1],
        y: isLoading ? [0, -2, 0] : isUpvoted ? [0, -2, 0] : 0,
      }}
      transition={{
        duration: isLoading ? 1 : isUpvoted ? 0.4 : 0.3,
        repeat: isLoading ? Infinity : 0,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95, y: 1 }}
    >
      <motion.polygon
        points="12,5 4,15 20,15"
        initial={{ fill: "transparent" }}
        animate={{
          fill: isUpvoted ? colors.primary : "transparent",
          stroke: isLoading
            ? [colors.inactive, colors.primary, colors.inactive]
            : isUpvoted
            ? colors.primary
            : colors.inactive,
        }}
        transition={{
          fill: { duration: 0.3 },
          stroke: isLoading
            ? { repeat: Infinity, duration: 1.5 }
            : { duration: 0.3 },
        }}
      />
    </motion.svg>
  );
};

export default AnimatedUpvoteIcon;
