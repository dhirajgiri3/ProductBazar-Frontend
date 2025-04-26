"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { SplineScene } from "../../UI/SplineScene"; // Assuming this path is correct

const HeroSection = () => {
  const robotRef = useRef(null);
  const containerRef = useRef(null);
  const glowControls = useAnimation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const lastUpdateTime = useRef(0);
  const animationFrameRef = useRef(null);

  // Create reactive values for parallax effect with improved damping for smoother movement
  // Initialize with default values, will be updated after component mounts
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Use default values initially, will be updated after component mounts
  const rotateX = useTransform(mouseY, [0, windowSize.height], [1.2, -1.2], {
    damping: 40,
  });
  const rotateY = useTransform(mouseX, [0, windowSize.width], [-1.2, 1.2], {
    damping: 40,
  });

  // Additional transform values for more subtle and natural movement

  // Update window size after component mounts
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Set initial window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      // Update window size on resize
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);

      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Handle browser back/forward navigation focus
  useEffect(() => {
    const handleFocus = () => {
      const focusableElements = containerRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length) {
        try {
          focusableElements[0].focus({ preventScroll: true });
        } catch (error) {
          console.warn(
            "Could not focus on the first focusable element:",
            error
          );
        }
      }
    };

    if (containerRef.current) {
      const focusTimeout = setTimeout(handleFocus, 100);
      return () => clearTimeout(focusTimeout);
    }
  }, []);

  // Company logos memoized to prevent unnecessary re-renders
  const companyLogos = useMemo(
    () => [
      { name: "Google", delay: 0 },
      { name: "Microsoft", delay: 0.1 },
      { name: "Uber", delay: 0.2 },
      { name: "Airbnb", delay: 0.3 },
      { name: "Slack", delay: 0.4 },
    ],
    []
  );

  // Floating elements configuration memoized
  const floatingElements = useMemo(
    () => [
      {
        id: "element-1",
        position: "top-24 left-2 md:left-8",
        initial: { x: -20, y: -80, rotate: -3, opacity: 0 },
        animate: { y: [-80, -85, -80] },
        duration: 8,
        delay: 0.2,
        icon: (
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        ),
      },
      {
        id: "element-2",
        position: "bottom-32 right-0 md:right-8",
        initial: { x: 60, y: 20, rotate: 3, opacity: 0 },
        animate: { y: [20, 25, 20] },
        duration: 9,
        delay: 0.4,
        icon: (
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
            clipRule="evenodd"
          />
        ),
      },
      {
        id: "element-3",
        position: "bottom-20 left-4 md:left-12",
        initial: { x: -30, y: 60, rotate: -5, opacity: 0 },
        animate: { y: [60, 65, 60] },
        duration: 7,
        delay: 0.6,
        icon: (
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        ),
      },
      {
        id: "element-4",
        position: "top-28 right-4 md:right-14",
        initial: { x: 40, y: -50, rotate: 4, opacity: 0 },
        animate: { y: [-50, -55, -50] },
        duration: 8.5,
        delay: 0.8,
        icon: (
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        ),
      },
    ],
    []
  );

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Enhanced glow animation sequence with optimized performance
    glowControls.start({
      opacity: [0.15, 0.25, 0.15],
      scale: [1, 1.08, 1],
      filter: ["blur(30px)", "blur(35px)", "blur(30px)"],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    });

    // Setup initial animations with staggered timing for floating elements
    const floatingElements = document.querySelectorAll(".floating-element");
    const timeouts = [];
    floatingElements.forEach((el, index) => {
      const timeoutId = setTimeout(() => {
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      }, index * 120 + 500);
      timeouts.push(timeoutId);
    });

    // Enhanced mouse move handler with improved throttling and smoother transitions
    const handleMouseMove = (e) => {
      if (!hasInteracted) setHasInteracted(true);

      const now = Date.now();
      // Throttle updates to every 20ms for better performance while maintaining smoothness
      if (now - lastUpdateTime.current < 20) return;
      lastUpdateTime.current = now;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const currentX = e.clientX;
        const currentY = e.clientY;

        // Smooth mouse position updates with easing
        mouseX.set(currentX);
        mouseY.set(currentY);

        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = currentX - rect.left;
          const y = currentY - rect.top;

          // Calculate normalized position (0 to 1) relative to container
          const normalizedX = x / rect.width;
          const normalizedY = y / rect.height;

          // Check if mouse is within container bounds for more natural edge behavior
          const isWithinBounds =
            normalizedX >= 0 &&
            normalizedX <= 1 &&
            normalizedY >= 0 &&
            normalizedY <= 1;

          setMousePosition({ x, y });

          // Apply more optimized transform to decorative elements with improved easing
          const decorativeElements =
            document.querySelectorAll(".decorative-circle");
          decorativeElements.forEach((el, index) => {
            if (index > 2) return;
            // Increased depth for more subtle movement
            const depth = (index + 1) * 35;
            // Calculate movement with center-based normalization for more natural feel
            const moveX = (x - rect.width / 2) / depth;
            const moveY = (y - rect.height / 2) / depth;
            // Reduced rotation factor for subtlety
            const rotation = index % 2 === 0 ? moveX * 0.2 : -moveX * 0.2;

            // Apply transform with subtle transition for smoother movement
            el.style.transition = isWithinBounds ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out';
            el.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
          });

          // Apply smoother transform to robot container with improved 3D effect
          if (robotRef.current) {
            // Further reduced movement values for subtlety
            const robotX = (x - rect.width / 2) / 100;
            const robotY = (y - rect.height / 2) / 100;

            // Apply subtle transition when mouse leaves container for smoother reset
            robotRef.current.style.transition = isWithinBounds
              ? 'transform 0.1s cubic-bezier(0.33, 1, 0.68, 1)'
              : 'transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)';

            // Enhanced 3D transform with subtle perspective and scale effects
            robotRef.current.style.transform = `translate3d(${robotX}px, ${robotY}px, 0)
              rotateX(${isWithinBounds ? (normalizedY - 0.5) * -1.5 : 0}deg)
              rotateY(${isWithinBounds ? (normalizedX - 0.5) * 1.5 : 0}deg)
              scale(${isWithinBounds ? 1.01 : 1})`;
          }

          // Update gradient position with smoother transition
          const gradientElement = document.querySelector(".dynamic-gradient");
          if (gradientElement) {
            const gradX = (x / rect.width) * 100;
            const gradY = (y / rect.height) * 100;
            gradientElement.style.transition = isWithinBounds ? 'background 0.2s ease-out' : 'background 0.6s ease-out';
            gradientElement.style.background = `radial-gradient(circle at ${gradX}% ${gradY}%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%)`;
          }
        }
      });
    };

    // Enhanced cursor blob effect with improved performance and smoother transitions
    const cursor = document.getElementById("cursor-blob");
    let cursorPosX = -150;
    let cursorPosY = -150;
    let cursorTargetX = -150;
    let cursorTargetY = -150;
    let speed = 0.08; // Reduced speed for smoother movement
    let isHovering = false;

    const updateCursorPosition = () => {
      const dx = cursorTargetX - cursorPosX;
      const dy = cursorTargetY - cursorPosY;

      // Apply enhanced easing for smoother movement with variable speed
      // Speed up when moving, slow down when close to target
      const distance = Math.sqrt(dx * dx + dy * dy);
      const currentSpeed = Math.min(0.12, Math.max(0.06, speed * (distance / 100)));

      cursorPosX += dx * currentSpeed;
      cursorPosY += dy * currentSpeed;

      if (cursor) {
        // Apply subtle scale effect based on movement speed
        const scaleValue = isHovering ? 1.15 : Math.min(1.05, Math.max(0.95, 1 + distance / 2000));
        cursor.style.transform = `translate3d(${cursorPosX}px, ${cursorPosY}px, 0) scale(${scaleValue})`;
        cursor.style.transition = "opacity 0.3s ease-out, filter 0.3s ease-out";

        // Adjust opacity and blur based on movement
        if (distance > 100) {
          cursor.style.opacity = "0.12";
          cursor.style.filter = "blur(15px)";
        } else {
          cursor.style.opacity = "0.15";
          cursor.style.filter = "blur(11px)";
        }
      }

      requestAnimationFrame(updateCursorPosition);
    };

    updateCursorPosition();

    const handleBlobMove = (e) => {
      cursorTargetX = e.clientX - 100;
      cursorTargetY = e.clientY - 100;
    };

    // Add hover effect for interactive elements
    const handleElementHover = (hovering) => {
      isHovering = hovering;
      if (cursor) {
        cursor.style.opacity = hovering ? "0.2" : "0.15";
        cursor.style.filter = hovering ? "blur(8px)" : "blur(11px)";
      }
    };

    // Add event listeners for interactive elements
    const interactiveElements = document.querySelectorAll("a, button, .floating-element");
    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", () => handleElementHover(true));
      el.addEventListener("mouseleave", () => handleElementHover(false));
    });

    // Event handlers for mouse movement
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", handleBlobMove, { passive: true });

    // Enhanced cleanup function
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleBlobMove);

      // Clean up interactive element event listeners
      const interactiveElements = document.querySelectorAll("a, button, .floating-element");
      interactiveElements.forEach(el => {
        el.removeEventListener("mouseenter", () => handleElementHover(true));
        el.removeEventListener("mouseleave", () => handleElementHover(false));
      });

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      timeouts.forEach(clearTimeout);
    };
  }, [glowControls, mouseX, mouseY, hasInteracted]);

  // Pulse animation for the CTA button
  const pulseCta = () => {
    if (typeof document === 'undefined') return;

    const cta = document.querySelector(".primary-cta");
    if (cta) {
      cta.classList.add("pulse-animation");
      setTimeout(() => {
        if (cta) cta.classList.remove("pulse-animation");
      }, 1000);
    }
  };

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    let pulseInterval;
    if (!hasInteracted) {
      const initialPulseTimeout = setTimeout(() => {
        pulseCta();
        pulseInterval = setInterval(pulseCta, 15000); // Increased interval time
      }, 3000);

      return () => {
        clearTimeout(initialPulseTimeout);
        clearInterval(pulseInterval);
      };
    }

    return () => clearInterval(pulseInterval);
  }, [hasInteracted]);

  return (
    <section
      ref={containerRef}
      className="relative text-gray-900 h-[95vh] border border-b-1 border-b-gray-100 flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* SVG Grid Background Pattern - simplified */}
      <div className="absolute inset-0 z-0 opacity-[0.015]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Dynamic gradient that follows mouse - optimized */}
      <div
        className="dynamic-gradient absolute inset-0 z-0 pointer-events-none will-change-transform"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, rgba(124, 58, 237, 0) 70%)`,
        }}
      ></div>

      {/* Enhanced cursor blob effect with improved interactivity */}
      <div
        id="cursor-blob"
        className="fixed w-64 h-64 rounded-full pointer-events-none mix-blend-multiply filter blur-xl bg-violet-200 opacity-15 z-0 will-change-transform"
        style={{
          transform: "translate3d(-150px, -150px, 0)",
          transition: "transform 0.05s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s ease, filter 0.3s ease"
        }}
        aria-hidden="true"
      ></div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-gray-50/90 via-transparent to-gray-50/90 z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 md:py-10 lg:py-0">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start"
          >
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <div
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default group"
                aria-label="Product tagline"
              >
                <span className="flex w-2.5 h-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mr-2 shrink-0"></span>
                <span className="relative z-10">Innovate • Connect • Grow</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900"
            >
              <span>The Ecosystem for</span>
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 font-semibold italic">
                  Tech Innovation
                </span>
              </span>
            </motion.h1>

            {/* Sub-headline / Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed"
            >
              Product Bazar is a modern innovation platform{" "}
              <span className="relative inline-block group cursor-pointer">
                <span className="text-violet-700 font-medium">
                  powered by community
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </span>{" "}
              that changes how tech products reach their audience.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
            >
              {/* Primary CTA */}
              <motion.a
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -8px rgba(124, 58, 237, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                href="/launch"
                className="primary-cta relative bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium py-3 px-7 rounded-lg transition duration-300 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden group text-center"
                onClick={pulseCta}
                aria-label="Get started with Product Bazar"
              >
                <span className="relative z-10">Get started</span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.div
                  className="relative z-10 flex items-center ml-2"
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine pointer-events-none"></div>
              </motion.a>

              {/* Secondary CTA */}
              <motion.a
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(124, 58, 237, 0.07)",
                  boxShadow: "0 4px 10px -4px rgba(124, 58, 237, 0.2)",
                }}
                whileTap={{ scale: 0.97 }}
                href="/discover"
                className="border border-violet-600 text-violet-700 font-medium py-3 px-7 rounded-lg transition duration-300 flex items-center justify-center hover:shadow-md group relative overflow-hidden text-center"
                aria-label="Request a product demonstration"
              >
                <span className="relative z-10">Request a demo</span>
                <motion.div className="relative z-10 ml-2 flex items-center">
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                    className="block"
                    aria-hidden="true"
                  >
                    →
                  </motion.span>
                </motion.div>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 md:mt-14"
            >
              <p className="text-xs font-semibold tracking-wider text-gray-500 mb-4 flex items-center justify-start sm:justify-start">
                <span className="inline-block w-6 h-[1px] bg-gray-300 mr-2"></span>
                TRUSTED BY INNOVATIVE TEAMS
                <span className="inline-block w-6 h-[1px] bg-gray-300 ml-2"></span>
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8 sm:gap-y-4">
                {companyLogos.map((company) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + company.delay, duration: 0.4 }}
                    className="text-gray-500 font-medium text-sm lg:text-base filter brightness-100 hover:brightness-75 transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.05, color: "#555" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {company.name}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: 3D Robot and Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              type: "spring",
              stiffness: 80, // Reduced stiffness for smoother animation
            }}
            className="relative flex justify-center items-center lg:items-end h-[400px] sm:h-[500px] lg:h-[600px] w-full"
            style={{
              perspective: "1500px", // Enhanced perspective for more subtle 3D effect
              transformStyle: "preserve-3d",
            }}
            ref={robotRef}
          >
            {/* Decorative Rotating Circles - reduced number and simplified */}
            <div
              className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none will-change-transform"
              aria-hidden="true"
            >
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                  }}
                  transition={{
                    duration: 80 - i * 15, // Even slower rotation for less CPU usage
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  className={`absolute z-0 border border-violet-200/70 rounded-full opacity-${
                    12 - i * 4
                  } decorative-circle`}
                  style={{
                    width: `${96 - i * 15}%`,
                    height: `${96 - i * 15}%`,
                    paddingBottom: `${96 - i * 15}%`,
                    height: 0,
                  }}
                />
              ))}
            </div>

            {/* Subtle Grid pattern - more efficient */}
            <div
              className="absolute inset-0 bg-[radial-gradient(theme(colors.gray.200)_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.03] z-0 pointer-events-none"
              aria-hidden="true"
            ></div>

            {/* Robot Container */}
            <motion.div
              className="relative z-10 h-[450px] sm:h-[500px] lg:h-[550px] w-full max-w-lg transform-gpu will-change-transform"
              style={{
                rotateX,
                rotateY,
                translateY: useTransform(
                  mouseY,
                  [0, windowSize.height],
                  [3, -3],
                  { damping: 50 }
                ),
                translateX: useTransform(
                  mouseX,
                  [0, windowSize.width],
                  [-3, 3],
                  { damping: 50 }
                ),
                transition: "transform 0.05s cubic-bezier(0.33, 1, 0.68, 1)",
              }}
              whileHover={{
                scale: 1.01,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              <div
                className="w-full h-full cursor-grab active:cursor-grabbing"
                aria-label="Interactive 3D robot visualization"
              >
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>

              {/* Enhanced glow effect under the robot - optimized */}
              <motion.div
                animate={glowControls}
                className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 w-[280px] sm:w-80 h-28 sm:h-32 bg-violet-500 opacity-15 blur-[40px] sm:blur-[50px] rounded-[50%] z-0 pointer-events-none will-change-transform"
                aria-hidden="true"
              ></motion.div>

              {/* Additional subtle pulsing ring - simplified */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.1, 0.18, 0.1],
                }}
                transition={{
                  duration: 8, // Slower animation
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 w-56 sm:w-64 h-10 sm:h-12 border border-violet-400/30 rounded-full pointer-events-none will-change-transform"
                aria-hidden="true"
              ></motion.div>
            </motion.div>

            {/* Floating UI Elements - with memoized config */}
            {floatingElements.map((element) => (
              <motion.div
                key={element.id}
                initial={element.initial}
                animate={{
                  ...element.animate,
                  opacity: 1,
                }}
                transition={{
                  duration: element.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: element.delay,
                }}
                whileHover={{
                  scale: 1.05,
                  zIndex: 25,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                  rotateX: "-5deg",
                  rotateY: "5deg",
                }}
                whileTap={{
                  scale: 0.98,
                  rotateX: "0deg",
                  rotateY: "0deg",
                }}
                className={`absolute ${element.position} bg-white/90 shadow-lg rounded-lg p-2.5 z-20 floating-element backdrop-blur-sm transition-all duration-300 cursor-pointer will-change-transform hover:shadow-xl`}
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  transformStyle: "preserve-3d",
                  perspective: "800px",
                  transition: "transform 0.2s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.2s ease"
                }}
                aria-hidden="true"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-purple-100 rounded-md flex items-center justify-center group">
                  <svg
                    className="w-5 h-5 text-violet-600 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {element.icon}
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
