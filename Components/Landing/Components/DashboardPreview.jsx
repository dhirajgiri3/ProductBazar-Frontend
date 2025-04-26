"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  TrendingUp,
  Package,
  MessageSquare,
  Settings,
  Search,
  Bell,
  User,
  ChevronRight,
  Shield,
  Moon,
  Sun,
  Sparkles,
  ArrowUp,
  Clock,
  Star,
  Plus,
  Lock,
  BellIcon,
} from "lucide-react";
import Link from "next/link";

// --- Helper: Debounce ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- Tabs Data --- (Moved outside for stability in useEffect dependency)
const TABS_DATA = [
  { name: "Analytics", icon: <TrendingUp size={16} /> },
  { name: "Products", icon: <Package size={16} /> },
  { name: "Feedback", icon: <MessageSquare size={16} /> },
  { name: "Settings", icon: <Settings size={16} /> },
];

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null); // Ref to store the interval ID
  const tabs = TABS_DATA; // Use the constant data
  const autoSwitchInterval = 7000; // 7 seconds

  // --- Perspective Tilt & Parallax Effect ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const debouncedMouseMove = useRef(
    debounce((e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    }, 16) // 16ms ~ 60fps
  ).current;

  const handleMouseMove = (e) => {
    debouncedMouseMove(e.nativeEvent); // Pass native event for clientX/Y
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (containerRef.current) {
      mouseX.set(containerRef.current.offsetWidth / 2);
      mouseY.set(containerRef.current.offsetHeight / 2);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      mouseX.set(containerRef.current.offsetWidth / 2);
      mouseY.set(containerRef.current.offsetHeight / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const springConfig = { stiffness: 150, damping: 20, mass: 1 };

  const rotateX = useSpring(
    useTransform(
      mouseY,
      () => [0, containerRef.current?.offsetHeight ?? 600],
      [8, -8]
    ),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(
      mouseX,
      () => [0, containerRef.current?.offsetWidth ?? 1000],
      [-8, 8]
    ),
    springConfig
  );

  const imageTranslateY = useSpring(
    useTransform(
      mouseY,
      () => [0, containerRef.current?.offsetHeight ?? 600],
      [-15, 15]
    ),
    springConfig
  );
  const imageTranslateX = useSpring(
    useTransform(
      mouseX,
      () => [0, containerRef.current?.offsetWidth ?? 1000],
      [-10, 10]
    ),
    springConfig
  );

  // Settings Toggles State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(true);

  // Dashboard Screen Images
  const imageUrl3 =
    "https://res.cloudinary.com/dgak25skk/image/upload/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png";
  const imageUrl2 =
    "https://res.cloudinary.com/dgak25skk/image/upload/v1745437942/Screenshot_2025-04-24_at_1.22.02_AM_rpkjsn.png";
  const imageUrl4 =
    "https://res.cloudinary.com/dgak25skk/image/upload/v1745437793/Screenshot_2025-04-23_at_4.48.44_PM_sdwqzb.png";
  const imageUrl1 =
    "https://res.cloudinary.com/dgak25skk/image/upload/v1745437791/Screenshot_2025-04-23_at_4.49.11_PM_d3oqjt.png";

  const dashboardScreens = [imageUrl4, imageUrl2, imageUrl3, imageUrl1];

  // --- Automatic Tab Switching ---
  const startAutoSwitch = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Start a new interval
    intervalRef.current = setInterval(() => {
      setActiveTab((prevTab) => (prevTab + 1) % tabs.length);
    }, autoSwitchInterval);
  }, [tabs.length, autoSwitchInterval]); // Dependencies for useCallback

  useEffect(() => {
    startAutoSwitch(); // Start the interval on component mount

    // Cleanup function to clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startAutoSwitch]); // Re-run if startAutoSwitch function identity changes

  // --- Manual Tab Click Handler ---
  const handleTabClick = (index) => {
    setActiveTab(index);
    startAutoSwitch(); // Reset the interval timer on manual click
  };

  // --- Demo Data ---
  const performanceData = [
    { label: "Users", value: "12.8k", change: "+27%", color: "violet" },
    { label: "Revenue", value: "$82.4k", change: "+18%", color: "blue" },
    { label: "Engagement", value: "92%", change: "+5%", color: "green" },
  ];
  const productsData = [
    {
      name: "AI Code Assistant",
      emoji: "🚀",
      progress: 80,
      change: "+24%",
      users: "16,482",
      target: "20,000",
      color: "blue",
    },
    {
      name: "Marketing Suite",
      emoji: "🎯",
      progress: 60,
      change: "+12%",
      users: "9,217",
      target: "15,000",
      color: "purple",
    },
    {
      name: "Data Analytics Platform",
      emoji: "📊",
      progress: 45,
      change: "+8%",
      users: "5,103",
      target: "10,000",
      color: "teal",
    },
  ];
  const feedbackData = [
    {
      name: "Sarah P.",
      initial: "SP",
      rating: 5,
      text: "Love the new interface, much easier to navigate! The dashboard organization saves me so much time.",
      color: "green",
    },
    {
      name: "Mike L.",
      initial: "ML",
      rating: 4,
      text: "Consider adding keyboard shortcuts for power users. Otherwise, great improvements!",
      color: "blue",
    },
    {
      name: "Jane D.",
      initial: "JD",
      rating: 5,
      text: "The product management section is fantastic. Very intuitive.",
      color: "purple",
    },
  ];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 },
    },
    hover: {
      y: -6,
      scale: 1.01,
      boxShadow: `0 15px 30px ${
        isDarkMode ? "rgba(167, 139, 250, 0.12)" : "rgba(124, 58, 237, 0.18)"
      }`,
      transition: { type: "spring", stiffness: 350, damping: 15 },
    },
  };

  const switchVariants = {
    on: { x: 22 },
    off: { x: 2 },
  };
  const switchContainerVariants = {
    on: { backgroundColor: isDarkMode ? "#a78bfa" : "#8b5cf6" },
    off: { backgroundColor: isDarkMode ? "#4b5563" : "#d1d5db" },
  };

  // Floating particles effect
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3.5 + 1,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.5) * 60,
      driftY: (Math.random() - 0.5) * 60,
    }));
    setParticles(newParticles);
  }, []);

  // Theme toggle handler
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);
  const handleNotificationToggle = () =>
    setNotificationsEnabled(!notificationsEnabled);
  const handle2FAToggle = () => setTwoFactorAuthEnabled(!twoFactorAuthEnabled);

  // Current Date for Header
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden
                h-[85vh] flex flex-col
                transition-colors duration-300
                ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-900 to-black"
                    : "bg-gradient-to-br from-violet-50 via-white to-gray-50"
                }
                border ${
                  isDarkMode ? "border-gray-700/50" : "border-violet-100"
                } shadow-2xl
                ${isDarkMode ? "shadow-gray-950/50" : "shadow-violet-200/40"}`}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }} 
    >
      {/* --- Dynamic Background Effects --- */}
      <motion.div
        className={`absolute inset-0 opacity-50 ${
          isDarkMode ? "bg-grid-gray-700/[0.2]" : "bg-grid-violet-100/[0.4]"
        } [mask-image:linear-gradient(0deg,transparent,black)] z-0`}
        style={{ backgroundSize: "40px 40px" }}
        aria-hidden="true"
      />
      {isHovering && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1] overflow-hidden rounded-2xl"
          style={{
            background: `radial-gradient(450px circle at ${mouseX}px ${mouseY}px, ${
              isDarkMode
                ? "rgba(167, 139, 250, 0.1)"
                : "rgba(124, 58, 237, 0.1)"
            }, transparent 70%)`,
            transition: "background 0.1s ease-out",
          }}
        />
      )}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            isDarkMode ? "bg-violet-500/30" : "bg-violet-400/30"
          } pointer-events-none z-[1]`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: 0,
          }}
          animate={{
            x: [0, particle.driftX, 0],
            y: [0, particle.driftY, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.1, 0.5],
            rotate: [0, Math.random() * 180 - 90, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Perspective Container for Tilting Content */}
      <motion.div
        className="flex flex-col h-full relative z-10"
        style={{ rotateX, rotateY, transition: "transform 0.1s ease-out" }}
      >
        {/* Browser Chrome */}
        <div className="flex-shrink-0">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-900/80 backdrop-blur-sm"
                : "bg-gray-50/80 backdrop-blur-sm"
            } px-4 py-3 border-b ${
              isDarkMode ? "border-gray-700/60" : "border-gray-200"
            } flex items-center justify-between sticky top-0 z-30`}
          >
            <div className="flex space-x-2">
              {["red", "yellow", "green"].map((color) => (
                <motion.div
                  key={color}
                  className={`w-3 h-3 bg-${color}-400 rounded-full`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              ))}
            </div>
            <div className="flex-grow text-center">
              <motion.div
                className={`mx-auto ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                } rounded-md flex items-center justify-center px-3 py-1 text-xs ${
                  isDarkMode
                    ? "text-gray-300 border-gray-600/50"
                    : "text-gray-500 border-gray-200"
                } border max-w-xs shadow-sm transition-colors duration-300`}
                whileHover={{
                  y: -1,
                  boxShadow: `0 2px 8px ${
                    isDarkMode
                      ? "rgba(124, 58, 237, 0.15)"
                      : "rgba(124, 58, 237, 0.1)"
                  }`,
                }}
              >
                <Lock
                  size={11}
                  className={`mr-1.5 ${
                    isDarkMode ? "text-green-400" : "text-violet-500"
                  }`}
                />{" "}
                productbazar.in/dashboard
              </motion.div>
            </div>
            <div className="w-16 text-right">
              {" "}
              <span
                className={`font-medium flex whitespace-nowrap text-[10px] ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } hidden md:inline`}
              >
                {currentDate.split(",")[0]}
              </span>{" "}
            </div>
          </div>
        </div>

        {/* App Header */}
        <div className="flex-shrink-0">
          <motion.div
            className={`${
              isDarkMode
                ? "bg-gray-900/80 border-gray-800/80"
                : "bg-white/80 border-gray-200/80"
            } backdrop-blur-sm px-6 py-4 border-b flex items-center justify-between transition-colors duration-300`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-center" variants={itemVariants}>
              <motion.div
                className={`bg-gradient-to-br from-violet-500 to-violet-700 text-white font-bold rounded-full flex items-center justify-center text-sm w-10 h-10 p-1 mr-3 shadow-lg ${
                  isDarkMode ? "shadow-violet-900/40" : "shadow-violet-300/50"
                }`}
                whileHover={{
                  scale: 1.1,
                  rotate: [-3, 3, 0],
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                {" "}
                PB{" "}
              </motion.div>
              <h2
                className={`text-lg font-bold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                } tracking-tight`}
              >
                {" "}
                ProductBazar{" "}
              </h2>
              <p className="text-xs text-green-500 ml-2">
                Interactive Dashboard Preview
              </p>
            </motion.div>
            <div className="flex items-center space-x-3">
              <HeaderButton
                isDarkMode={isDarkMode}
                variants={itemVariants}
                label="Search"
              >
                {" "}
                <Search size={18} />{" "}
              </HeaderButton>
              <HeaderButton
                isDarkMode={isDarkMode}
                variants={itemVariants}
                label="Notifications"
              >
                {" "}
                <Bell size={18} />
                <motion.span
                  className={`absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full border ${
                    isDarkMode ? "border-gray-900" : "border-white"
                  }`}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </HeaderButton>
              <HeaderButton
                isDarkMode={isDarkMode}
                variants={itemVariants}
                label={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                onClick={handleThemeToggle}
                rotateHover
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isDarkMode ? "moon" : "sun"}
                    initial={{ y: -10, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 10, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "block" }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </motion.div>
                  </motion.span>
                </AnimatePresence>
              </HeaderButton>
              <motion.button
                className={`flex items-center p-1 rounded-full transition-colors duration-200 ${
                  isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-violet-50"
                } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  isDarkMode
                    ? "focus:ring-offset-gray-900"
                    : "focus:ring-offset-white"
                }`}
                whileHover="hover"
                variants={itemVariants}
                aria-label="User Profile"
              >
                <motion.div
                  className={`w-8 h-8 ${
                    isDarkMode
                      ? "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300"
                      : "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600"
                  } rounded-full flex items-center justify-center shadow`}
                  variants={{ hover: { scale: 1.1 } }}
                >
                  {" "}
                  <User size={16} />{" "}
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex-shrink-0">
          <div
            className={`flex border-b ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/80"
                : "border-gray-200/80 bg-white/80"
            } backdrop-blur-sm px-4 transition-colors duration-300 shadow-sm`}
          >
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.name}
                onClick={() => handleTabClick(index)} // Use the new handler
                className={`relative flex items-center px-5 py-4 text-sm font-medium transition-colors duration-200 ease-out outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 ${
                  isDarkMode
                    ? "focus-visible:ring-offset-gray-900"
                    : "focus-visible:ring-offset-white"
                } ${
                  activeTab === index
                    ? isDarkMode
                      ? "text-violet-300"
                      : "text-violet-600"
                    : isDarkMode
                    ? "text-gray-500 hover:text-violet-400"
                    : "text-gray-500 hover:text-violet-600"
                }`}
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97, y: 0 }}
              >
                <motion.span
                  className={`mr-2 transition-colors duration-200 ${
                    activeTab === index
                      ? isDarkMode
                        ? "text-violet-400"
                        : "text-violet-500"
                      : isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                  animate={{
                    scale: activeTab === index ? [1, 1.2, 1, 1.2, 1] : 1,
                    opacity: activeTab === index ? [0.8, 1, 0.8, 1, 0.8] : 1,
                  }}
                >
                  {" "}
                  {tab.icon}{" "}
                </motion.span>{" "}
                {tab.name}
                {activeTab === index && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-[3px] ${
                      isDarkMode
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        : "bg-gradient-to-r from-violet-500 to-violet-700"
                    } rounded-t-full shadow-[0_0_8px_rgba(167,139,250,0.5)]`}
                    layoutId="activeTabIndicator"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-grow relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Crucial for triggering exit/enter animations on tab change
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 h-full"
            >
              {/* Background Image with Parallax */}
              <motion.img
                src={dashboardScreens[activeTab]}
                alt={`${tabs[activeTab].name} Background`}
                style={{ y: imageTranslateY, x: imageTranslateX, scale: 1.1 }}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isDarkMode ? "opacity-30" : "opacity-60"
                } `}
                // Add key to force re-render on src change if needed, though AnimatePresence should handle it
                key={`bg-${activeTab}`}
              />

              {/* Overlays Container */}
              <div className="absolute inset-0 p-4 sm:p-6 pointer-events-none overflow-y-auto">
                {/* Render content based on activeTab */}
                {activeTab === 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-4"
                  >
                    {performanceData.map((item) => (
                      <MetricCard
                        key={item.label}
                        item={item}
                        isDarkMode={isDarkMode}
                        cardVariants={cardVariants}
                        itemVariants={itemVariants}
                      />
                    ))}
                    <RevenueCard
                      isDarkMode={isDarkMode}
                      cardVariants={cardVariants}
                    />
                  </motion.div>
                )}
                {activeTab === 1 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <ProductListCard
                      productsData={productsData}
                      isDarkMode={isDarkMode}
                      cardVariants={cardVariants}
                      itemVariants={itemVariants}
                    />
                    <FeaturedLaunchCard
                      isDarkMode={isDarkMode}
                      cardVariants={cardVariants}
                    />
                  </motion.div>
                )}
                {activeTab === 2 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                  >
                    <RecentFeedbackCard
                      feedbackData={feedbackData}
                      isDarkMode={isDarkMode}
                      cardVariants={cardVariants}
                      itemVariants={itemVariants}
                    />
                    <FeedbackOverviewCard
                      isDarkMode={isDarkMode}
                      cardVariants={cardVariants}
                    />
                  </motion.div>
                )}
                {activeTab === 3 && (
                  <SettingsCard
                    isDarkMode={isDarkMode}
                    notificationsEnabled={notificationsEnabled}
                    twoFactorAuthEnabled={twoFactorAuthEnabled}
                    handleThemeToggle={handleThemeToggle}
                    handleNotificationToggle={handleNotificationToggle}
                    handle2FAToggle={handle2FAToggle}
                    cardVariants={cardVariants}
                    itemVariants={itemVariants}
                    switchVariants={switchVariants}
                    switchContainerVariants={switchContainerVariants}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Info Footer */}
        <div className="flex-shrink-0">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-900/80 border-gray-700/60"
                : "bg-white/80 border-gray-200/80"
            } backdrop-blur-sm px-6 py-3 border-t flex items-center justify-between text-xs transition-colors duration-300`}
          >
            <div
              className={`flex items-center space-x-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <motion.div className="flex items-center" whileHover={{ x: 1 }}>
                <motion.div
                  className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.9)]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />{" "}
                All systems operational
              </motion.div>
              <div className="hidden sm:flex items-center">
                {" "}
                <Clock size={10} className="mr-1.5" /> Last update:{" "}
                <span
                  className={`font-medium ml-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Just now
                </span>{" "}
              </div>
            </div>
            <Link href="/product/new">
              <motion.button
                className={`${
                  isDarkMode
                    ? "bg-violet-600 hover:bg-violet-500"
                    : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
                } text-white text-xs font-semibold py-2 px-3.5 rounded-md transition-all flex items-center shadow-md ${
                  isDarkMode ? "shadow-violet-900/30" : "shadow-violet-200/50"
                } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  isDarkMode
                    ? "focus:ring-offset-gray-900"
                    : "focus:ring-offset-white"
                }`}
                whileHover={{
                  scale: 1.05,
                  y: -1.5,
                  boxShadow: `0 5px 15px ${
                    isDarkMode
                      ? "rgba(167, 139, 250, 0.25)"
                      : "rgba(124, 58, 237, 0.3)"
                  }`,
                }}
                whileTap={{ scale: 0.97, y: 0 }}
              >
                {" "}
                <Plus size={14} className="mr-1 -ml-0.5" /> Add Product{" "}
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Subtle bottom glow */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 ${
            isDarkMode ? "bg-violet-700/15" : "bg-violet-400/10"
          } rounded-full blur-3xl -z-10 pointer-events-none`}
        ></div>
      </motion.div>{" "}
      {/* End Perspective Container */}
    </motion.div>
  );
};

// --- Reusable Sub-components (No changes needed below this line) ---

const HeaderButton = ({
  children,
  label,
  onClick,
  isDarkMode,
  variants,
  rotateHover = false,
}) => (
  <motion.button
    onClick={onClick}
    className={`relative p-2 rounded-full transition-colors duration-200 ${
      isDarkMode
        ? "text-gray-400 hover:bg-gray-700/60 hover:text-violet-300"
        : "text-gray-500 hover:bg-violet-100/60 hover:text-violet-600"
    } focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
      isDarkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"
    }`}
    whileHover={{
      scale: 1.15,
      rotate: rotateHover ? (isDarkMode ? -15 : 15) : 0,
    }}
    whileTap={{ scale: 0.9 }}
    variants={variants}
    aria-label={label}
  >
    {children}
  </motion.button>
);

const MetricCard = ({ item, isDarkMode, cardVariants, itemVariants }) => (
  <motion.div
    variants={cardVariants || itemVariants}
    whileHover="hover"
    className={` ${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 w-48 shadow-lg border cursor-default`}
  >
    <div className="flex items-center justify-between mb-2">
      <span
        className={`text-xs font-medium ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {item.label}
      </span>
      <span
        className={`text-xs font-bold flex items-center ${
          isDarkMode ? "text-green-400" : "text-green-600"
        }`}
      >
        {" "}
        <ArrowUp size={10} className="mr-0.5" />
        {item.change}{" "}
      </span>
    </div>
    <p
      className={`text-2xl font-bold ${
        isDarkMode ? "text-gray-50" : `text-${item.color}-600`
      }`}
    >
      {item.value}
    </p>
    <div
      className={`w-full h-1.5 mt-3 rounded-full ${
        isDarkMode ? "bg-gray-700/80" : "bg-gray-200/80"
      }`}
    >
      <motion.div
        className={`h-1.5 rounded-full bg-gradient-to-r ${
          isDarkMode
            ? `from-${item.color}-600 to-${item.color}-400`
            : `from-${item.color}-500 to-${item.color}-400`
        }`}
        initial={{ width: "0%" }}
        animate={{ width: `${Math.random() * 40 + 50}%` }}
        transition={{ delay: 0.5, duration: 1, ease: "circOut" }}
      />
    </div>
  </motion.div>
);

const RevenueCard = ({ isDarkMode, cardVariants }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 w-64 shadow-lg border cursor-default`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-3 text-sm flex items-center`}
    >
      {" "}
      <Sparkles
        size={14}
        className={`mr-2 ${isDarkMode ? "text-violet-400" : "text-violet-500"}`}
      />{" "}
      Revenue Overview{" "}
    </h3>
    <div
      className={`h-32 flex items-end justify-center mb-2 p-3 rounded-lg border ${
        isDarkMode
          ? "bg-gray-900/30 border-gray-700/40"
          : "bg-gradient-to-br from-gray-50/50 to-gray-100/50 border-gray-200/40"
      } shadow-inner`}
    >
      <div className="flex items-end h-full gap-2">
        {[40, 65, 85, 60, 78, 95].map((height, i) => (
          <motion.div
            key={i}
            className={`w-4 rounded-t-md ${
              isDarkMode
                ? "bg-gradient-to-b from-violet-500 to-violet-700"
                : "bg-gradient-to-b from-violet-400 to-violet-600"
            } shadow-sm`}
            initial={{ height: "0%" }}
            animate={{ height: `${height}%` }}
            transition={{
              delay: 0.7 + i * 0.07,
              duration: 0.7,
              type: "spring",
              stiffness: 80,
              damping: 12,
            }}
          />
        ))}
      </div>
    </div>
    <div
      className={`flex justify-between items-center text-xs mb-1 ${
        isDarkMode ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {" "}
      <span>Monthly Progress:</span>{" "}
      <span
        className={`font-semibold ${
          isDarkMode ? "text-violet-300" : "text-violet-600"
        }`}
      >
        $82,430 / $100,000
      </span>{" "}
    </div>
    <div
      className={`w-full ${
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      } rounded-full h-2`}
    >
      <motion.div
        className={`h-2 rounded-full bg-gradient-to-r ${
          isDarkMode
            ? "from-violet-500 to-fuchsia-500"
            : "from-violet-400 to-violet-600"
        }`}
        initial={{ width: "0%" }}
        animate={{ width: "82%" }}
        transition={{ delay: 0.8, duration: 1.2, ease: "circOut" }}
      />
    </div>
  </motion.div>
);

const ProductListCard = ({
  productsData,
  isDarkMode,
  cardVariants,
  itemVariants,
}) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 shadow-lg border cursor-default md:col-span-2`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-4 text-sm flex items-center`}
    >
      <Package
        size={14}
        className={`mr-2 ${isDarkMode ? "text-violet-400" : "text-violet-500"}`}
      />{" "}
      Product Performance
    </h3>
    <div className="space-y-3">
      {" "}
      {productsData.map((product, index) => (
        <motion.div
          key={product.name}
          variants={itemVariants}
          className={`flex items-center p-3 rounded-lg border ${
            isDarkMode
              ? `bg-gray-900/30 border-gray-700/40`
              : `bg-${product.color}-50/50 border-${product.color}-100/60`
          } shadow-sm`}
          whileHover={{
            y: -2,
            x: 2,
            backgroundColor: isDarkMode
              ? "rgba(75, 85, 99, 0.5)"
              : `rgba(224, 231, 255, 0.5)`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <motion.div
            className={`w-10 h-10 rounded-lg ${
              isDarkMode
                ? `bg-gradient-to-br from-${product.color}-700 to-${product.color}-900 text-${product.color}-300`
                : `bg-gradient-to-br from-${product.color}-100 to-${product.color}-300 text-${product.color}-700`
            } flex items-center justify-center mr-3 shadow-md text-xl`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {" "}
            {product.emoji}{" "}
          </motion.div>
          <div className="flex-grow">
            <div className="flex justify-between items-baseline">
              <p
                className={`font-medium text-sm ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {product.name}
              </p>{" "}
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                {product.change}
              </span>
            </div>
            <div
              className={`w-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } rounded-full h-1.5 mt-1.5`}
            >
              <motion.div
                className={`h-1.5 rounded-full bg-gradient-to-r from-${product.color}-500 to-${product.color}-400`}
                initial={{ width: "0%" }}
                animate={{ width: `${product.progress}%` }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 1.2,
                  ease: "circOut",
                }}
              />
            </div>
            <div
              className={`flex justify-between mt-1 text-[10px] ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {" "}
              <span>{product.users} users</span>
              <span>Target: {product.target}</span>{" "}
            </div>
          </div>
        </motion.div>
      ))}{" "}
    </div>
  </motion.div>
);

const FeaturedLaunchCard = ({ isDarkMode, cardVariants }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 shadow-lg border cursor-default md:col-span-1 self-start`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-3 text-sm flex items-center`}
    >
      <Sparkles size={14} className={`mr-2 text-yellow-400`} /> Featured Launch
    </h3>
    <div
      className={`p-4 rounded-xl border ${
        isDarkMode
          ? "bg-gradient-to-br from-violet-900/50 to-blue-900/50 border-violet-700/50"
          : "bg-gradient-to-br from-violet-50/80 to-blue-50/80 border-violet-200"
      } shadow-lg`}
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: 10 }}
        className={`w-12 h-12 rounded-xl ${
          isDarkMode ? "bg-gray-700" : "bg-white"
        } flex items-center justify-center text-violet-600 mb-3 shadow-md text-2xl cursor-grab`}
      >
        🚀
      </motion.div>
      <p
        className={`font-semibold text-base ${
          isDarkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        AI Code Assistant
      </p>
      <p
        className={`text-xs font-medium flex items-center mt-1 ${
          isDarkMode ? "text-green-300" : "text-green-600"
        }`}
      >
        <TrendingUp size={12} className="mr-1" /> Trending High
      </p>
      <motion.button
        className={`mt-4 w-full ${
          isDarkMode
            ? "bg-violet-600 hover:bg-violet-500"
            : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
        } text-white text-[11px] font-semibold py-2 px-3 rounded-lg transition-all shadow-md ${
          isDarkMode ? "shadow-violet-900/40" : "shadow-violet-300/50"
        } pointer-events-auto focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
          isDarkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
        }`}
        whileHover={{
          scale: 1.03,
          y: -1,
          boxShadow: `0 5px 12px ${
            isDarkMode ? "rgba(167, 139, 250, 0.2)" : "rgba(124, 58, 237, 0.25)"
          }`,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {" "}
        View Details <ChevronRight size={14} className="inline ml-0.5" />{" "}
      </motion.button>
    </div>
  </motion.div>
);

const RecentFeedbackCard = ({
  feedbackData,
  isDarkMode,
  cardVariants,
  itemVariants,
}) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 shadow-lg border cursor-default lg:col-span-2`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-4 text-sm flex items-center`}
    >
      <MessageSquare
        size={14}
        className={`mr-2 ${isDarkMode ? "text-violet-400" : "text-violet-500"}`}
      />{" "}
      Recent Feedback
    </h3>
    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 simple-scrollbar">
      {" "}
      {feedbackData.map((feedback, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={`p-3.5 rounded-lg border ${
            isDarkMode
              ? "bg-gray-900/40 border-gray-700/40"
              : "bg-gray-50/60 border-gray-100/80"
          } shadow-sm`}
        >
          <div className="flex items-center mb-2.5">
            <div
              className={`w-8 h-8 rounded-full ${
                isDarkMode
                  ? `bg-${feedback.color}-800/70`
                  : `bg-${feedback.color}-100`
              } flex items-center justify-center text-${feedback.color}-${
                isDarkMode ? "300" : "600"
              } mr-3 text-xs font-semibold border ${
                isDarkMode
                  ? `border-${feedback.color}-700/50`
                  : `border-${feedback.color}-200/80`
              }`}
            >
              {feedback.initial}
            </div>
            <p
              className={`font-medium text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {feedback.name}
            </p>
            <div className="ml-auto flex space-x-0.5">
              {" "}
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={`${
                    i < feedback.rating
                      ? isDarkMode
                        ? "text-yellow-400"
                        : "text-yellow-500"
                      : isDarkMode
                      ? "text-gray-600"
                      : "text-gray-300"
                  } `}
                  fill={i < feedback.rating ? "currentColor" : "none"}
                />
              ))}{" "}
            </div>
          </div>
          <p
            className={`text-xs leading-relaxed italic ${
              isDarkMode ? "text-gray-300/90" : "text-gray-600"
            }`}
          >
            "{feedback.text}"
          </p>
        </motion.div>
      ))}{" "}
    </div>
  </motion.div>
);

const FeedbackOverviewCard = ({ isDarkMode, cardVariants }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 shadow-lg border cursor-default lg:col-span-1 self-start`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-4 text-sm`}
    >
      Feedback Overview
    </h3>
    <div className="space-y-4">
      <div
        className={`p-3.5 rounded-lg border ${
          isDarkMode
            ? "bg-gray-900/40 border-gray-700/40"
            : "bg-violet-50/60 border-violet-100/80"
        } shadow-sm`}
      >
        <div className="flex justify-between items-center mb-1">
          <p
            className={`text-xs font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Avg Rating
          </p>{" "}
          <p
            className={`text-lg font-bold ${
              isDarkMode ? "text-yellow-300" : "text-yellow-500"
            }`}
          >
            4.8{" "}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / 5
            </span>
          </p>
        </div>
        <div
          className={`w-full ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          } rounded-full h-2 mt-1.5`}
        >
          {" "}
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${
              isDarkMode
                ? "from-yellow-400 to-amber-400"
                : "from-yellow-400 to-yellow-500"
            }`}
            style={{ width: "96%" }}
          ></div>{" "}
        </div>
      </div>
      <div
        className={`p-3.5 rounded-lg border ${
          isDarkMode
            ? "bg-gray-900/40 border-gray-700/40"
            : "bg-green-50/60 border-green-100/80"
        } shadow-sm`}
      >
        <div className="flex justify-between items-center">
          {" "}
          <p
            className={`text-xs font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Satisfaction
          </p>{" "}
          <p
            className={`text-lg font-bold ${
              isDarkMode ? "text-green-300" : "text-green-600"
            }`}
          >
            97%
          </p>{" "}
        </div>
        <p
          className={`text-xs flex items-center ${
            isDarkMode ? "text-green-400" : "text-green-600"
          } mt-1`}
        >
          <ArrowUp size={11} className="mr-0.5" /> 5% MoM
        </p>
      </div>
      <motion.button
        className={`mt-2 w-full ${
          isDarkMode
            ? "bg-violet-700/70 hover:bg-violet-600/80"
            : "bg-violet-100 hover:bg-violet-200 text-violet-700"
        } ${
          isDarkMode ? "text-violet-100" : ""
        } text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-sm pointer-events-auto flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
          isDarkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
        }`}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {" "}
        View Full Report <ChevronRight size={14} className="ml-1" />{" "}
      </motion.button>
    </div>
  </motion.div>
);

const SettingsCard = ({
  isDarkMode,
  notificationsEnabled,
  twoFactorAuthEnabled,
  handleThemeToggle,
  handleNotificationToggle,
  handle2FAToggle,
  cardVariants,
  itemVariants,
  switchVariants,
  switchContainerVariants,
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className={`${
      isDarkMode
        ? "bg-gray-800/70 border-gray-700/50"
        : "bg-white/70 border-violet-100/70"
    } backdrop-blur-lg rounded-xl p-4 shadow-lg border cursor-default max-w-md`}
  >
    <h3
      className={`font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      } mb-4 text-sm flex items-center`}
    >
      <Settings
        size={14}
        className={`mr-2 ${isDarkMode ? "text-violet-400" : "text-violet-500"}`}
      />{" "}
      System Settings
    </h3>
    <div className="space-y-3.5">
      <SettingsRow
        label="Email Notifications"
        icon={<BellIcon size={16} />}
        isDarkMode={isDarkMode}
        variants={itemVariants}
      >
        {" "}
        <ToggleButton
          checked={notificationsEnabled}
          onChange={handleNotificationToggle}
          isDarkMode={isDarkMode}
          switchVariants={switchVariants}
          switchContainerVariants={switchContainerVariants}
        />{" "}
      </SettingsRow>
      <SettingsRow
        label="Dark Mode"
        icon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        isDarkMode={isDarkMode}
        variants={itemVariants}
      >
        {" "}
        <ToggleButton
          checked={isDarkMode}
          onChange={handleThemeToggle}
          isDarkMode={isDarkMode}
          switchVariants={switchVariants}
          switchContainerVariants={switchContainerVariants}
        />{" "}
      </SettingsRow>
      <SettingsRow
        label="Two-Factor Auth"
        icon={<Shield size={16} />}
        isDarkMode={isDarkMode}
        variants={itemVariants}
      >
        {" "}
        <ToggleButton
          checked={twoFactorAuthEnabled}
          onChange={handle2FAToggle}
          isDarkMode={isDarkMode}
          switchVariants={switchVariants}
          switchContainerVariants={switchContainerVariants}
        />{" "}
      </SettingsRow>
    </div>
  </motion.div>
);

const SettingsRow = ({ label, icon, isDarkMode, children, variants }) => (
  <motion.div
    variants={variants}
    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
      isDarkMode
        ? "border-gray-700/60 hover:bg-gray-700/50"
        : "border-gray-100/90 hover:bg-violet-50/40"
    }`}
    whileHover={{ x: 3 }}
  >
    <div className="flex items-center">
      <div
        className={`w-9 h-9 rounded-lg ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300"
            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
        } flex items-center justify-center mr-3 shadow-sm`}
      >
        {" "}
        {icon}{" "}
      </div>
      <p
        className={`text-sm font-medium ${
          isDarkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </p>
    </div>
    <div className="pointer-events-auto">{children}</div>
  </motion.div>
);

const ToggleButton = ({
  checked,
  onChange,
  isDarkMode,
  switchVariants,
  switchContainerVariants,
}) => (
  <motion.button
    onClick={onChange}
    aria-pressed={checked}
    variants={switchContainerVariants}
    animate={checked ? "on" : "off"}
    transition={{ duration: 0.2 }}
    className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center p-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
      isDarkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
    }`}
  >
    <motion.div
      className="w-5 h-5 bg-white rounded-full shadow-md"
      variants={switchVariants}
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
    />
  </motion.button>
);

export default DashboardPreview;
