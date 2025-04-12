"use client";

import React from 'react';
import { motion } from 'framer-motion';

const LoaderComponent = ({ size = 'medium', text = 'Loading...', type = 'dots', color = 'violet' }) => {
  // Size variants
  const sizeVariants = {
    small: {
      container: 'h-16',
      dot: 'w-2 h-2',
      spinner: 'w-6 h-6',
      pulse: 'w-8 h-8',
      text: 'text-xs',
    },
    medium: {
      container: 'h-24',
      dot: 'w-3 h-3',
      spinner: 'w-10 h-10',
      pulse: 'w-12 h-12',
      text: 'text-sm',
    },
    large: {
      container: 'h-32',
      dot: 'w-4 h-4',
      spinner: 'w-16 h-16',
      pulse: 'w-20 h-20',
      text: 'text-base',
    },
  };

  // Color variants
  const colorVariants = {
    violet: {
      primary: 'bg-violet-600',
      secondary: 'bg-violet-400',
      tertiary: 'bg-violet-200',
      text: 'text-violet-600',
      border: 'border-violet-600',
      shadow: 'shadow-violet-200',
    },
    blue: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-400',
      tertiary: 'bg-blue-200',
      text: 'text-blue-600',
      border: 'border-blue-600',
      shadow: 'shadow-blue-200',
    },
    green: {
      primary: 'bg-green-600',
      secondary: 'bg-green-400',
      tertiary: 'bg-green-200',
      text: 'text-green-600',
      border: 'border-green-600',
      shadow: 'shadow-green-200',
    },
    red: {
      primary: 'bg-red-600',
      secondary: 'bg-red-400',
      tertiary: 'bg-red-200',
      text: 'text-red-600',
      border: 'border-red-600',
      shadow: 'shadow-red-200',
    },
    gray: {
      primary: 'bg-gray-600',
      secondary: 'bg-gray-400',
      tertiary: 'bg-gray-200',
      text: 'text-gray-600',
      border: 'border-gray-600',
      shadow: 'shadow-gray-200',
    },
  };

  // Get current size and color styles
  const sizeStyle = sizeVariants[size] || sizeVariants.medium;
  const colorStyle = colorVariants[color] || colorVariants.violet;

  // Animation transition for dots
  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  // Spinner animation
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Pulse animation
  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Wave animation is defined inline in the component

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-2 justify-center items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeStyle.dot} rounded-full ${colorStyle.primary}`}
                initial="initial"
                animate={{
                  y: [-8, 0, -8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  ...dotTransition,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        );

      case 'spinner':
        return (
          <motion.div
            className={`${sizeStyle.spinner} rounded-full border-4 border-t-transparent ${colorStyle.border} border-opacity-70`}
            variants={spinnerVariants}
            animate="animate"
          />
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizeStyle.pulse} rounded-full ${colorStyle.primary} opacity-70 shadow-lg ${colorStyle.shadow}`}
            variants={pulseVariants}
            animate="animate"
          />
        );

      case 'wave':
        return (
          <div className={`w-24 h-12 flex items-center justify-center`}>
            <svg width="100%" height="100%" viewBox="0 0 100 50">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.path
                  key={i}
                  d={`M ${10 + i * 20} 50 Q ${20 + i * 20} 20 ${30 + i * 20} 50`}
                  stroke={`hsl(${i * 15 + 250}, 70%, 60%)`}
                  strokeWidth="4"
                  fill="transparent"
                  initial={{ pathLength: 0, pathOffset: 0 }}
                  animate={{
                    pathLength: [0, 1, 0],
                    pathOffset: [0, 0, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          </div>
        );

      case 'bounce':
        return (
          <div className="flex space-x-1 justify-center items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`${sizeStyle.dot} rounded-full`}
                style={{ backgroundColor: `hsl(${i * 15 + 250}, 70%, 60%)` }}
                animate={{
                  y: [0, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case 'circle':
        return (
          <div className="relative">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${i === 0 ? colorStyle.primary : i === 1 ? colorStyle.secondary : colorStyle.tertiary}`}
                style={{
                  width: sizeStyle.spinner,
                  height: sizeStyle.spinner,
                  top: '50%',
                  left: '50%',
                  marginLeft: `-${parseInt(sizeStyle.spinner) / 2}px`,
                  marginTop: `-${parseInt(sizeStyle.spinner) / 2}px`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="flex space-x-2 justify-center items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeStyle.dot} rounded-full ${colorStyle.primary}`}
                initial="initial"
                animate={{
                  y: [-8, 0, -8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  ...dotTransition,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeStyle.container}`}>
      {renderLoader()}
      {text && (
        <motion.p
          className={`mt-4 ${sizeStyle.text} ${colorStyle.text} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoaderComponent;