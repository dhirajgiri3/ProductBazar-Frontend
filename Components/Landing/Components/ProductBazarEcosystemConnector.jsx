"use client";

import React, { useRef, useState, useId, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { AnimatedBeam } from "./Animations/AnimatedBeam";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useTheme } from "../../../Contexts/Theme/ThemeContext";
import SectionLabel from "./Animations/SectionLabel";

// Enhanced Circle component with improved animations and accessibility
const Circle = React.forwardRef(
  (
    {
      className,
      children,
      tooltipText,
      icon,
      iconColor,
      label,
      accentColor,
      index = 0,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const tooltipId = useId();
    const circleId = useId();

    // Motion values for smoother animations with spring physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    // Derived motion values for tilt effect
    const rotateX = useTransform(springY, [-50, 50], [5, -5]);
    const rotateY = useTransform(springX, [-50, 50], [-5, 5]);

    // Improved entry animation with staggered timing
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100 + index * 100); // Slightly faster staggering

      return () => clearTimeout(timer);
    }, [index]);

    // Enhanced mouse move handler for 3D effect
    const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center (normalized to -50 to 50 range)
      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;

      // Apply movement with intensity proportional to distance from center
      x.set(distanceX * 0.5);
      y.set(distanceY * 0.5);
    };

    // Reset position on mouse leave for smoother transition
    const handleMouseLeave = () => {
      setIsHovered(false);
      // Smoothly animate back to neutral position
      x.set(0);
      y.set(0);
    };

    // Determine active state (hover or focus)
    const isActive = isHovered || isFocused;

    return (
      <motion.div
        ref={ref}
        id={circleId}
        className={cn(
          "z-10 flex items-center justify-center rounded-full bg-white relative transition-all cursor-pointer overflow-hidden",
          "will-change-transform perspective-1000 sm:size-14 md:size-16 lg:size-18", // Added perspective and will-change
          isActive
            ? `shadow-xl shadow-${accentColor}-500/20` // Enhanced shadow
            : "shadow-md shadow-gray-200/50",
          className
        )}
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={
          isMounted
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
              }
            : {}
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          rotateX: rotateX, // Apply 3D rotation
          rotateY: rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{
          type: "spring",
          stiffness: 500, // More responsive spring
          damping: 25,
          mass: 0.8, // Lighter mass for quicker response
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={handleMouseLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseMove={handleMouseMove}
        tabIndex={0}
        role="button"
        aria-describedby={tooltipId}
      >
        {/* Improved gradient border with animation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.9,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={`absolute inset-0 rounded-full ${isActive ? `bg-gradient-to-br from-${accentColor}-400/90 via-${accentColor}-500/90 to-${accentColor}-600/90` : ''} p-[2px]`}>
            <div className="absolute inset-0 rounded-full bg-white"></div>
          </div>
        </motion.div>

        {/* Improved ripple effect with SVG filter */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className={`absolute inset-0 rounded-full overflow-hidden`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Multiple ripples with staggered timing */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute inset-0 rounded-full bg-${accentColor}-400/10`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [0.8, 1.8],
                    opacity: [0.7, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.2,
                  }}
                />
              ))}

              {/* Subtle glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-${accentColor}-300/20 blur-md`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  opacity: isActive ? 0.8 : 0.5,
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-active border with subtle gradient */}
        {!isActive && (
          <div className="absolute inset-0 rounded-full border border-gray-100 bg-gradient-to-b from-white to-gray-50/80"></div>
        )}

        {/* Enhanced icon with better animations */}
        <motion.div
          className="relative z-10 transform-gpu"
          animate={
            isActive
              ? {
                  scale: 1.15,
                  y: isActive ? -1 : 0,
                  rotate:
                    label === "Job Seekers" || label === "Users"
                      ? isActive ? 5 : 0
                      : label === "Startups" || label === "Innovators"
                      ? isActive ? -5 : 0
                      : 0,
                }
              : { scale: 1, y: 0, rotate: 0 }
          }
          transition={{
            scale: { type: "spring", stiffness: 400, damping: 10 },
            y: { duration: 0.2 },
            rotate: {
              duration: 0.5,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse",
              repeatDelay: 1.5,
              ease: "easeInOut",
            },
          }}
        >
          {/* Icon wrapper with glow effect */}
          <div className={`relative ${isActive ? `text-${accentColor}-600` : iconColor}`}>
            {React.createElement(icon, {
              className: `sm:w-5 sm:h-5 md:w-6 md:h-6 drop-shadow-sm transform-gpu transition-colors duration-300`,
              strokeWidth: isActive ? 2 : 1.8,
              "aria-hidden": "true",
            })}

            {/* Subtle glow behind icon when active */}
            {isActive && (
              <motion.div
                className={`absolute inset-0 rounded-full bg-${accentColor}-300/30 blur-md -z-10`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        </motion.div>

        {/* Enhanced label with better transitions */}
        <motion.span
          className={`text-xs font-medium absolute text-center w-full -bottom-7 transition-colors duration-300 ${
            isActive ? `text-${accentColor}-600 font-semibold` : "text-gray-600"
          }`}
          animate={{
            y: isActive ? -1 : 2,
            scale: isActive ? 1.05 : 1,
            textShadow: isActive ? "0 0 5px rgba(255,255,255,0.5)" : "none",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {label}
        </motion.span>

        {children}

        {/* Modernized tooltip with improved design and animation */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              id={tooltipId}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2.5 rounded-lg shadow-xl z-20 w-max max-w-[12rem] sm:max-w-[14rem] text-center border border-gray-100"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{
                duration: 0.25,
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              role="tooltip"
              aria-hidden={!isActive}
            >
              {/* Sequentially revealed tooltip text */}
              <motion.div
                className="text-xs font-medium text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {tooltipText}
              </motion.div>

              {/* Enhanced tooltip arrow with improved shadow and animation */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white border-r border-b border-gray-100 shadow-sm"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Circle.displayName = "Circle";

// Custom water ripple SVG filter component
const WaterRippleFilter = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <filter id="water-ripple" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="water" />
        <feBlend in="SourceGraphic" in2="water" />
      </filter>
    </defs>
  </svg>
);

export function ProductBazarEcosystemConnector() {
  const containerRef = useRef(null);
  const centerRef = useRef(null);
  const [containerVisible, setContainerVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const { isDarkMode } = useTheme(); // Add theme context

  // Individual refs for ecosystem members
  const refs = {
    startups: useRef(null),
    investors: useRef(null),
    agencies: useRef(null),
    jobSeekers: useRef(null),
    innovators: useRef(null),
    users: useRef(null),
  };

  // Spring animation for header elements
  const headerSpring = useSpring(0, { stiffness: 100, damping: 20 });
  const headerScale = useTransform(headerSpring, [0, 1], [0.97, 1]);
  const headerY = useTransform(headerSpring, [0, 1], [10, 0]);

  useEffect(() => {
    // Improved loading effect with smoother timing
    const timer = setTimeout(() => {
      setContainerVisible(true);
      headerSpring.set(1);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced ecosystem members data with vibrant multicolor scheme
  const ecosystemMembers = [
    {
      id: "startups",
      name: "Startups",
      ref: refs.startups,
      accentColor: "blue",
      icon: LucideIcons.Rocket,
      iconColor: "text-blue-500",
      gradientFrom: "#3B82F6", // blue-500
      gradientTo: "#60A5FA", // blue-400
      tooltip:
        "Early-stage companies showcasing innovative products and connecting with their target audience",
    },
    {
      id: "investors",
      name: "Investors",
      ref: refs.investors,
      accentColor: "emerald",
      icon: LucideIcons.DollarSign,
      iconColor: "text-emerald-500",
      gradientFrom: "#10B981", // emerald-500
      gradientTo: "#34D399", // emerald-400
      tooltip:
        "Angels and VCs discovering promising startups and innovative products to invest in",
    },
    {
      id: "agencies",
      name: "Agencies",
      ref: refs.agencies,
      accentColor: "amber",
      icon: LucideIcons.Building,
      iconColor: "text-amber-500",
      gradientFrom: "#F59E0B", // amber-500
      gradientTo: "#FBBF24", // amber-400
      tooltip:
        "Design and development agencies offering specialized services to product creators",
    },
    {
      id: "jobSeekers",
      name: "Job Seekers",
      ref: refs.jobSeekers,
      accentColor: "rose",
      icon: LucideIcons.Briefcase,
      iconColor: "text-rose-500",
      gradientFrom: "#F43F5E", // rose-500
      gradientTo: "#FB7185", // rose-400
      tooltip:
        "Professionals finding opportunities in innovative companies and startups",
    },
    {
      id: "innovators",
      name: "Innovators",
      ref: refs.innovators,
      accentColor: "purple",
      icon: LucideIcons.Lightbulb,
      iconColor: "text-purple-500",
      gradientFrom: "#8B5CF6", // purple-500
      gradientTo: "#A78BFA", // purple-400
      tooltip:
        "Creative minds developing new ideas and solutions to transform industries",
    },
    {
      id: "users",
      name: "Users",
      ref: refs.users,
      accentColor: "cyan",
      icon: LucideIcons.Users,
      iconColor: "text-cyan-500",
      gradientFrom: "#06B6D4", // cyan-500
      gradientTo: "#22D3EE", // cyan-400
      tooltip:
        "Community members discovering and engaging with products that improve their lives",
    },
  ];

  // Enhanced beam animation configuration with physics-based properties
  const beamConfigs = [
    {
      from: "startups",
      curvature: -85,
      endYOffset: -12,
      delay: 0.6,
      duration: 6.5,
      reverse: false,
      intensity: 1.3,
      pulseSpeed: 4.5,
      extendPath: 1.05,
      particleEffect: true,
    },
    {
      from: "investors",
      curvature: -45,
      endYOffset: -6,
      delay: 1.0,
      duration: 7.0,
      reverse: false,
      intensity: 1.4,
      pulseSpeed: 5.0,
      extendPath: 1.08,
      particleEffect: true,
    },
    {
      from: "agencies",
      curvature: 45,
      endYOffset: 6,
      delay: 1.4,
      duration: 7.5,
      reverse: true,
      intensity: 1.5,
      pulseSpeed: 5.5,
      extendPath: 1.06,
      particleEffect: true,
    },
    {
      from: "jobSeekers",
      curvature: 85,
      endYOffset: 12,
      delay: 1.8,
      duration: 7.2,
      reverse: false,
      intensity: 1.3,
      pulseSpeed: 4.8,
      extendPath: 1.04,
      particleEffect: true,
    },
    {
      from: "innovators",
      curvature: -85,
      endYOffset: -12,
      delay: 2.2,
      duration: 6.8,
      reverse: true,
      intensity: 1.4,
      pulseSpeed: 5.2,
      extendPath: 1.07,
      particleEffect: true,
    },
    {
      from: "users",
      curvature: 85,
      endYOffset: 12,
      delay: 2.6,
      duration: 7.0,
      reverse: true,
      intensity: 1.5,
      pulseSpeed: 5.0,
      extendPath: 1.05,
      particleEffect: true,
    },
  ];

  return (
    <div
      className="relative flex min-h-[400px] h-full w-full items-center justify-center overflow-hidden py-12 sm:py-16"
      ref={containerRef}
    >
      {/* Custom SVG filters for water ripple effects */}
      <WaterRippleFilter />

      {/* Enhanced background with animated patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white dark:from-gray-900 dark:via-gray-800/90 dark:to-gray-900 z-0 transition-colors duration-300" />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 bg-grid-purple-100/[0.3] dark:bg-grid-purple-300/[0.15] grid-fade-mask z-0 opacity-20 transition-colors duration-300"
        style={{ backgroundSize: "24px 24px" }}
        animate={{
          backgroundPosition: ["0px 0px", "24px 24px"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Floating particles in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br transition-colors duration-300 ${
              i % 6 === 0 ? "from-blue-400/20 to-blue-500/10 dark:from-blue-400/15 dark:to-blue-500/5" :
              i % 6 === 1 ? "from-emerald-400/20 to-emerald-500/10 dark:from-emerald-400/15 dark:to-emerald-500/5" :
              i % 6 === 2 ? "from-amber-400/20 to-amber-500/10 dark:from-amber-400/15 dark:to-amber-500/5" :
              i % 6 === 3 ? "from-rose-400/20 to-rose-500/10 dark:from-rose-400/15 dark:to-rose-500/5" :
              i % 6 === 4 ? "from-purple-400/20 to-purple-500/10 dark:from-purple-400/15 dark:to-purple-500/5" :
              "from-cyan-400/20 to-cyan-500/10 dark:from-cyan-400/15 dark:to-cyan-500/5"
            }`}
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: containerVisible ? -30 : 0,
              x: containerVisible ? Math.random() * 20 - 10 : 0,
              opacity: containerVisible ? 0.6 : 0.3,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24">
        {/* Enhanced header with improved design and animations */}
        <motion.div
          className="text-center relative z-10 mb-16 sm:mb-20 md:mb-24 lg:mb-28"
          style={{
            scale: headerScale,
            y: headerY,
          }}
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
        >
          {/* Dynamic background elements with improved aesthetics */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-lg h-40 opacity-20 dark:opacity-15 -z-10 transition-opacity duration-300">
            {[
              { color: "bg-blue-400 dark:bg-blue-500", delay: 0, size: "w-28 h-28", pos: "top-0 left-1/4" },
              { color: "bg-purple-400 dark:bg-purple-500", delay: 1, size: "w-24 h-24", pos: "top-10 right-1/4" },
              { color: "bg-emerald-400 dark:bg-emerald-500", delay: 2, size: "w-20 h-20", pos: "bottom-0 left-1/3" },
              { color: "bg-rose-400 dark:bg-rose-500", delay: 1.5, size: "w-16 h-16", pos: "top-16 left-1/2" },
            ].map((blob, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${blob.color} blur-xl ${blob.pos} ${blob.size} transition-colors duration-300`}
                animate={{
                  scale: isHeaderHovered ? 1.2 : 1,
                  opacity: isHeaderHovered ? 0.7 : 0.5,
                  x: isHeaderHovered ? 10 : 0,
                  y: isHeaderHovered ? -5 : 0,
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: blob.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Animated subtitle with enhanced design */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <SectionLabel
              text="Connecting the Innovation Ecosystem"
              size="medium"
              alignment="center"
              animate={false}
            />
          </motion.div>

          {/* Main title with enhanced styling and animation effects */}
          <div className="mb-5">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-50 tracking-tight transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                type: "spring",
                stiffness: 50,
                damping: 12,
              }}
            >
              <motion.span
                className="inline-block relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400 relative transition-colors duration-300"
                  animate={{
                    backgroundPosition: isHeaderHovered ? ["0% 50%", "100% 50%"] : "0% 50%",
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: isHeaderHovered ? Infinity : 0,
                    repeatType: "reverse",
                  }}
                >
                  Product Bazar
                </motion.span>

                {/* Enhanced curvy SVG underline effect with animation */}
                <div className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-3 md:h-4 overflow-hidden -z-10">
                  <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 15"
                    preserveAspectRatio="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <motion.path
                      d="M0,10 Q40,5 100,10 Q160,15 200,10"
                      fill="none"
                      stroke="url(#underlineGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: 1,
                        d: isHeaderHovered
                          ? "M0,10 Q50,2 100,10 Q150,18 200,10"
                          : "M0,10 Q40,5 100,10 Q160,15 200,10"
                      }}
                      transition={{
                        pathLength: { delay: 0.7, duration: 0.8, ease: "easeOut" },
                        opacity: { delay: 0.7, duration: 0.8 },
                        d: { duration: 1, ease: "easeInOut" }
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="underlineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <motion.stop
                          offset="50%"
                          stopColor="#ddd6fe"
                          animate={{
                            stopColor: isHeaderHovered ? "#a78bfa" : "#ddd6fe"
                          }}
                          transition={{ duration: 0.5 }}
                        />
                        <stop offset="100%" stopColor="#c4b5fd" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </div>
              </motion.span>{" "}
              <motion.span
                className="text-gray-800 dark:text-gray-200 inline-block mt-1 md:mt-0 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Ecosystem
              </motion.span>
            </motion.h2>
          </div>

          {/* Enhanced description with better animation and design */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative"
          >
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed transition-colors duration-300"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              Connect with every part of our vibrant ecosystem to grow your
              product, find opportunities, and reach new heights in the tech
              innovation landscape
            </motion.p>

            {/* Animated decorative underline */}
            <motion.div
              className="h-0.5 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-500 to-transparent rounded-full mx-auto mt-6 transition-colors duration-300"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "5rem", opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{
                width: "8rem",
                background: isDarkMode
                  ? "linear-gradient(to right, transparent, rgba(167, 139, 250, 0.7), transparent)"
                  : "linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5), transparent)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Main ecosystem diagram with improved physics and animations */}
        <motion.div
          className="relative w-full aspect-square max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl z-10 mb-16 sm:mb-20 lg:mb-24"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={containerVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.7,
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Using CSS Grid with improved spacing for ecosystem layout */}
          <div className="grid grid-cols-3 grid-rows-3 h-full w-full place-items-center gap-6 md:gap-8">
            {/* Top row */}
            <div className="col-start-1 col-span-1 row-start-1">
              <Circle
                ref={refs.startups}
                tooltipText={ecosystemMembers[0].tooltip}
                icon={ecosystemMembers[0].icon}
                iconColor={ecosystemMembers[0].iconColor}
                label={ecosystemMembers[0].name}
                accentColor={ecosystemMembers[0].accentColor}
                index={0}
              />
            </div>

            <div className="col-start-3 col-span-1 row-start-1">
              <Circle
                ref={refs.innovators}
                tooltipText={ecosystemMembers[4].tooltip}
                icon={ecosystemMembers[4].icon}
                iconColor={ecosystemMembers[4].iconColor}
                label={ecosystemMembers[4].name}
                accentColor={ecosystemMembers[4].accentColor}
                index={4}
              />
            </div>

            {/* Middle row */}
            <div className="col-start-1 col-span-1 row-start-2">
              <Circle
                ref={refs.investors}
                tooltipText={ecosystemMembers[1].tooltip}
                icon={ecosystemMembers[1].icon}
                iconColor={ecosystemMembers[1].iconColor}
                label={ecosystemMembers[1].name}
                accentColor={ecosystemMembers[1].accentColor}
                index={1}
              />
            </div>

            {/* Modernized center logo with significantly enhanced design */}
            <div className="col-start-2 col-span-1 row-start-2">
              <motion.div
                ref={centerRef}
                className="z-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 relative sm:size-20 md:size-24 lg:size-28 will-change-transform perspective-1000 transition-colors duration-300"
                initial={{ opacity: 0, scale: 0.9, rotateY: 0 }}
                animate={
                  containerVisible
                    ? {
                        opacity: 1,
                        scale: 1,
                        boxShadow: isHovering
                          ? "0 15px 30px -5px rgba(139, 92, 246, 0.3)"
                          : "0 10px 25px -5px rgba(139, 92, 246, 0.2)",
                      }
                    : {}
                }
                whileHover={{
                  scale: 1.08,
                  rotateY: 5,
                  transition: {
                    rotateY: {
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }
                }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {/* Enhanced gradient border with 3D effect */}
                <div className="absolute inset-0 rounded-full p-[2px] overflow-hidden">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-600"
                    animate={{
                      background: isHovering
                        ? "linear-gradient(45deg, #8b5cf6, #7c3aed, #6d28d9, #8b5cf6)"
                        : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                      backgroundSize: isHovering ? "300% 300%" : "100% 100%",
                      backgroundPosition: isHovering ? ["0% 0%", "100% 100%"] : "0% 0%",
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: isHovering ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                  >
                    {/* Inner white background for content */}
                    <div className="absolute inset-[2px] rounded-full bg-white dark:bg-gray-800 transition-colors duration-300"></div>
                  </motion.div>
                </div>

                {/* Improved central content */}
                <motion.div
                  className="flex flex-col items-center justify-center z-10"
                  animate={{
                    y: isHovering ? 1 : 0
                  }}
                  transition={{
                    y: {
                      duration: 2,
                      repeat: isHovering ? Infinity : 0,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                >
                  <motion.div
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600"
                    animate={{
                      backgroundPosition: isHovering ? ["0% 50%", "100% 50%"] : "0% 50%",
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: isHovering ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                  >
                    PB
                  </motion.div>
                  <motion.div
                    className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5 transition-colors duration-300"
                    animate={{
                      color: isHovering ? "#6d28d9" : "#6b7280",
                      letterSpacing: isHovering ? "0.05em" : "normal"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    connect
                  </motion.div>
                </motion.div>

                <motion.span
                  className="text-xs md:text-sm font-medium absolute w-full text-center -bottom-8 text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  animate={{
                    y: isHovering ? -2 : 0,
                    scale: isHovering ? 1.05 : 1,
                    fontWeight: isHovering ? "600" : "500",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Product Bazar
                </motion.span>

                {/* Drastically improved ripple effect with realistic water-like motion */}
                <AnimatePresence>
                  {isHovering && (
                    <motion.div
                      className="absolute -inset-6 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.5 } }}
                    >
                      {/* Multiple ripples with staggered timing and natural physics */}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border border-purple-400/30 opacity-0"
                          initial={{
                            scale: 1,
                            opacity: 0.6,
                          }}
                          animate={{
                            scale: 1.8 + i * 0.1,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 2 + i * 0.3,
                            ease: "easeOut",
                            delay: i * 0.4,
                            repeat: Infinity,
                            repeatDelay: 0.2,
                          }}
                          style={{ filter: "url(#water-ripple)" }}
                        />
                      ))}

                      {/* Inner glow pulse effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-purple-100/30 blur-md"
                        animate={{
                          scale: isHovering ? 1.15 : 1,
                          opacity: isHovering ? 0.8 : 0.6,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="col-start-3 col-span-1 row-start-2">
              <Circle
                ref={refs.agencies}
                tooltipText={ecosystemMembers[2].tooltip}
                icon={ecosystemMembers[2].icon}
                iconColor={ecosystemMembers[2].iconColor}
                label={ecosystemMembers[2].name}
                accentColor={ecosystemMembers[2].accentColor}
                index={2}
              />
            </div>

            {/* Bottom row */}
            <div className="col-start-1 col-span-1 row-start-3">
              <Circle
                ref={refs.jobSeekers}
                tooltipText={ecosystemMembers[3].tooltip}
                icon={ecosystemMembers[3].icon}
                iconColor={ecosystemMembers[3].iconColor}
                label={ecosystemMembers[3].name}
                accentColor={ecosystemMembers[3].accentColor}
                index={3}
              />
            </div>

            <div className="col-start-3 col-span-1 row-start-3">
              <Circle
                ref={refs.users}
                tooltipText={ecosystemMembers[5].tooltip}
                icon={ecosystemMembers[5].icon}
                iconColor={ecosystemMembers[5].iconColor}
                label={ecosystemMembers[5].name}
                accentColor={ecosystemMembers[5].accentColor}
                index={5}
              />
            </div>
          </div>
        </motion.div>

        {/* Enhanced animated beams with vivid effects and particle animation */}
        {containerVisible &&
          beamConfigs.map((config) => {
            const member = ecosystemMembers.find((m) => m.id === config.from);
            if (!member) return null;

            return (
              <AnimatedBeam
                key={config.from}
                containerRef={containerRef}
                fromRef={refs[config.from]}
                toRef={centerRef}
                curvature={config.curvature}
                endYOffset={config.endYOffset}
                reverse={config.reverse}
                className={`text-${member.accentColor}-400`}
                duration={config.duration}
                delay={config.delay}
                pathWidth={0.7 * (config.intensity || 1)}
                pathOpacity={0.15 * (config.intensity || 1)}
                gradientStartColor={member.gradientFrom}
                gradientStopColor={member.gradientTo}
                pulseEffect={true}
                pulseSpeed={config.pulseSpeed || 5}
                glowEffect={true}
                extendPath={config.extendPath || 1}
                particleEffect={config.particleEffect || false}
                particleCount={6}
                particleSpeed={config.duration * 0.8}
                particleSize={3}
                particleOpacity={0.6}
              />
            );
          })}

        {/* Enhanced accessibility features */}
        <div className="sr-only" aria-live="polite">
          <h2>Product Bazar Ecosystem Visualization</h2>
          <p>
            An interactive diagram showing how Product Bazar connects startups,
            investors, agencies, job seekers, innovators, and users in a
            collaborative ecosystem centered around product innovation.
          </p>
          <ul>
            {ecosystemMembers.map((member) => (
              <li key={member.id}>
                {member.name}: {member.tooltip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}