'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { SplineScene } from '../../UI/SplineScene';
import { useInView } from 'react-intersection-observer';

const HeroSection = () => {
  const robotRef = useRef(null);
  const containerRef = useRef(null);
  const glowControls = useAnimation();
  const blobControls = useAnimation();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [hoveredLogo, setHoveredLogo] = useState(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const animationFrameRef = useRef(null);

  // Smoothed motion values for more natural animation
  const smoothMouseX = useSpring(mouseX, { stiffness: 75, damping: 15 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 75, damping: 15 });

  // Initialize with default values, will be updated after component mounts
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Transform mouse position to rotation with dampened effect
  const rotateX = useTransform(smoothMouseY, [0, windowSize.height], [3, -3], {
    clamp: true,
  });
  const rotateY = useTransform(smoothMouseX, [0, windowSize.width], [-3, 3], {
    clamp: true,
  });

  // Float effect for the 3D model
  const floatY = useMotionValue(0);

  // Intersection observer for scroll-based animations
  const [heroRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Update window size after component mounts with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setDimensions = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial size
    setDimensions();

    // Debounced resize handler
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setDimensions, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
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
          console.warn('Could not focus on the first focusable element:', error);
        }
      }
    };

    if (containerRef.current) {
      const focusTimeout = setTimeout(handleFocus, 100);
      return () => clearTimeout(focusTimeout);
    }
  }, []);

  // Company logos with enhanced information
  const companyLogos = useMemo(
    () => [
      {
        name: 'Google',
        delay: 0,
        color: '#4285F4',
      },
      {
        name: 'Microsoft',
        delay: 0.1,
        color: '#00A4EF',
      },
      {
        name: 'Uber',
        delay: 0.2,
        color: '#276EF1',
      },
      {
        name: 'Airbnb',
        delay: 0.3,
        color: '#FF5A5F',
      },
      {
        name: 'Slack',
        delay: 0.4,
        color: '#4A154B',
      },
    ],
    []
  );

  // Floating elements configuration with improved responsive positioning
  const floatingElements = useMemo(
    () => [
      {
        id: 'element-1',
        position: 'top-16 left-4 sm:top-20 sm:left-6 md:top-24 md:left-8 lg:top-24 lg:left-8',
        initial: { x: -20, y: -80, rotate: -3, opacity: 0 },
        animate: { y: [-80, -84, -80] },
        duration: 6,
        delay: 0.3,
        label: 'Components',
        icon: (
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        ),
      },
      {
        id: 'element-2',
        position: 'bottom-20 right-2 sm:bottom-24 sm:right-4 md:bottom-32 md:right-8 lg:bottom-32 lg:right-8',
        initial: { x: 60, y: 20, rotate: 3, opacity: 0 },
        animate: { y: [20, 24, 20] },
        duration: 7,
        delay: 0.6,
        label: 'Interface',
        icon: (
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
            clipRule="evenodd"
          />
        ),
      },
      {
        id: 'element-3',
        position: 'bottom-12 left-2 sm:bottom-16 sm:left-4 md:bottom-20 md:left-12 lg:bottom-20 lg:left-12',
        initial: { x: -30, y: 60, rotate: -5, opacity: 0 },
        animate: { y: [60, 64, 60] },
        duration: 8,
        delay: 0.9,
        label: 'Code',
        icon: (
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        ),
      },
      {
        id: 'element-4',
        position: 'top-20 right-2 sm:top-24 sm:right-4 md:top-28 md:right-14 lg:top-28 lg:right-14',
        initial: { x: 40, y: -50, rotate: 4, opacity: 0 },
        animate: { y: [-50, -54, -50] },
        duration: 7.5,
        delay: 1.2,
        label: 'Design',
        icon: (
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        ),
      },
      {
        id: 'element-5',
        position: 'top-32 left-16 sm:top-36 sm:left-20 md:top-40 md:left-32 lg:top-40 lg:left-32',
        initial: { x: -15, y: -30, rotate: -2, opacity: 0 },
        animate: { y: [-30, -34, -30] },
        duration: 6.5,
        delay: 1.5,
        label: 'Analytics',
        icon: (
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        ),
      },
    ],
    []
  );

  // Custom spring animation for the robot
  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle floating animation
      const newY = Math.sin(Date.now() / 2000) * 5;
      floatY.set(newY);
    }, 16);

    return () => clearInterval(interval);
  }, [floatY]);

  // Enhanced animations for glows and blobs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Animation for the primary blob
    blobControls.start({
      opacity: [0.65, 0.85, 0.65],
      scale: [0.96, 1.04, 0.96],
      filter: ['blur(65px)', 'blur(75px)', 'blur(65px)'],
      rotate: [0, 8, 0],
      transition: {
        duration: 13,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    });

    // Setup initial animations with staggered timing for floating elements
    const floatingElementsNodeList = document.querySelectorAll('.floating-element');
    const timeouts = [];
    floatingElementsNodeList.forEach((el, index) => {
      const timeoutId = setTimeout(() => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) rotate(0)';
        }
      }, index * 140 + 500);
      timeouts.push(timeoutId);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      timeouts.forEach(clearTimeout);
    };
  }, [blobControls]);

  // Enhanced robot interaction effect
  useEffect(() => {
    const handleRobotHover = e => {
      if (!robotRef.current || !modelLoaded) return;

      const rect = robotRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate normalized position (0 to 1) relative to container
      const normalizedX = x / rect.width;
      const normalizedY = y / rect.height;

      // Check if mouse is within container bounds
      const isWithinBounds =
        normalizedX >= 0 && normalizedX <= 1 && normalizedY >= 0 && normalizedY <= 1;

      if (isWithinBounds) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    const handleRobotClick = () => {
      // Special animation on click
      if (robotRef.current && modelLoaded) {
        setHasInteracted(true);

        // Trigger a special animation
        const splineElement = robotRef.current.querySelector('.spline-scene');
        if (splineElement) {
          splineElement.classList.add('robot-clicked');
          setTimeout(() => {
            splineElement.classList.remove('robot-clicked');
          }, 600);
        }
      }
    };

    if (robotRef.current) {
      robotRef.current.addEventListener('mousemove', handleRobotHover, {
        passive: true,
      });
      robotRef.current.addEventListener('click', handleRobotClick);
    }

    return () => {
      if (robotRef.current) {
        robotRef.current.removeEventListener('mousemove', handleRobotHover);
        robotRef.current.removeEventListener('click', handleRobotClick);
      }
    };
  }, [mouseX, mouseY, modelLoaded]);

  // Enhanced CTA pulse animation
  const pulseCta = () => {
    if (typeof document === 'undefined') return;

    const cta = document.querySelector('.primary-cta');
    if (cta) {
      cta.classList.add('pulse-animation');
      setTimeout(() => {
        if (cta) cta.classList.remove('pulse-animation');
      }, 1000);
    }
  };

  // Handle loading errors
  useEffect(() => {
    // Set a timeout to mark the model as loaded if it takes too long
    // This prevents infinite loading state
    const loadTimeout = setTimeout(() => {
      if (!modelLoaded) {
        console.warn('SplineScene took too long to load, forcing loaded state');
        setModelLoaded(true);
      }
    }, 8000); // 8 seconds timeout

    return () => clearTimeout(loadTimeout);
  }, [modelLoaded]);

  // Pulse the CTA button periodically until user interacts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let pulseInterval;
    if (!hasInteracted) {
      const initialPulseTimeout = setTimeout(() => {
        pulseCta();
        pulseInterval = setInterval(pulseCta, 15000);
      }, 3000);

      return () => {
        clearTimeout(initialPulseTimeout);
        clearInterval(pulseInterval);
      };
    }

    return () => clearInterval(pulseInterval);
  }, [hasInteracted]);

  const handleModelLoad = () => {
    setModelLoaded(true);
    setModelError(false);
  };

  const handleModelError = () => {
    setModelError(true);
    setModelLoaded(true); // Mark as loaded anyway to remove loading indicator
    console.error('Failed to load 3D model');
  };

  return (
    <section
      ref={containerRef}
      className="hero-section relative w-full text-gray-900 flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
      aria-label="Hero section"
      onClick={() => !hasInteracted && setHasInteracted(true)}
    >
      {/* Primary Animated Blob at bottom right */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-64 h-64 sm:w-80 sm:h-80 md:w-[32rem] md:h-[32rem] bg-gradient-to-tr from-purple-500/80 via-violet-500/70 to-violet-600/80 rounded-full pointer-events-none z-0 will-change-transform backdrop-blur-3xl"
        aria-hidden="true"
        animate={blobControls}
      />

      {/* Secondary Animated Blob at top left */}
      <motion.div
        className="absolute top-[-15%] left-[-15%] w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-gradient-to-br from-violet-400/70 via-indigo-500/60 to-indigo-500/70 rounded-full pointer-events-none z-0 will-change-transform backdrop-blur-3xl"
        aria-hidden="true"
        animate={{
          opacity: [0.55, 0.75, 0.55],
          scale: [0.97, 1.05, 0.97],
          filter: ['blur(55px)', 'blur(65px)', 'blur(55px)'],
          rotate: [0, -10, 0],
          transition: {
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          },
        }}
      />

      {/* Small accent blob (new) */}
      <motion.div
        className="absolute top-[30%] right-[25%] w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-gradient-to-br from-blue-400/60 via-cyan-500/50 to-blue-500/60 rounded-full pointer-events-none z-0 will-change-transform backdrop-blur-3xl hidden sm:block"
        aria-hidden="true"
        animate={{
          opacity: [0.4, 0.55, 0.4],
          scale: [0.98, 1.06, 0.98],
          filter: ['blur(50px)', 'blur(60px)', 'blur(50px)'],
          rotate: [0, 15, 0],
          transition: {
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          },
        }}
      />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div
          ref={heroRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center justify-items-center lg:justify-items-start min-h-[80vh] lg:min-h-[70vh]"
        >
          {/* Left Side: Text Content - Improved alignment and spacing */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="hero-text flex flex-col items-center lg:items-start space-y-6  text-center lg:text-left w-full max-w-2xl lg:max-w-none"
          >
            {/* Enhanced Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full flex justify-center lg:justify-start"
            >
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-violet-100/80 text-violet-600 text-sm font-medium cursor-default group transition-all duration-300 border border-violet-100"
                aria-label="Community status: 3,000+ builders, investors and partners inside"
              >
                <motion.span
                  className="flex w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mr-2 shrink-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                ></motion.span>
                {/* Badge (status) */}
                <span className="relative z-10 font-medium text-xs">
                  Join 3,000+ Product Makers, Investors & Startups
                </span>
              </div>
            </motion.div>

            <div className="flex flex-col gap-y-4 sm:gap-y-6 w-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-4 sm:space-y-6"
              >
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.7,
                    ease: [0.25, 0.1, 0.25, 1.0],
                  }}
                  className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2 text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-gray-900 justify-center lg:justify-start"
                >
                  <span>Discover.</span>
                  <span className="text-violet-600">Build.</span>
                  <span>Connect.</span>
                </motion.h1>
              </motion.div>

              {/* Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="text-sm sm:text-base text-gray-600 mb-2 max-w-2xl leading-relaxed mx-auto lg:mx-0"
              >
                ProductBazar is the launchpad where innovation meets opportunity. Get discovered by
                the right users, investors, and partners who are actively seeking what you're
                creating.
              </motion.p>
            </div>

            {/* Enhanced Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-center w-full justify-center lg:justify-start"
              role="group"
              aria-label="Call to action buttons"
            >
              {/* Primary CTA with enhanced effects */}
              <motion.a
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 10px 25px -6px rgba(124, 58, 237, 0.35)',
                }}
                whileTap={{ scale: 0.97 }}
                href="/"
                className="primary-cta relative bg-gradient-to-r from-violet-600 via-purple-600 to-purple-600 text-white font-medium py-3.5 px-6 sm:px-8 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden group text-center min-w-[200px]"
                onClick={() => {
                  pulseCta();
                  setHasInteracted(true);
                }}
                aria-label="Join the waitlist - Be the first to launch on ProductBazar"
              >
                <span className="relative z-10 text-base md:text-lg">Join the Waitlist</span>

                {/* Enhanced gradient hover effect */}
                <div
                  className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-700 via-purple-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                ></div>

                {/* Moving light effect on hover */}
                <div
                  className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out"
                  aria-hidden="true"
                ></div>

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
              </motion.a>
            </motion.div>

            {/* Enhanced Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="mt-6 sm:mt-8 lg:mt-10 pt-4 w-full"
            >
              <p className="text-xs font-semibold tracking-wider text-gray-500 mb-5 flex items-center justify-center lg:justify-start">
                <span className="inline-block w-8 h-[1px] bg-gradient-to-r from-gray-200 to-gray-300 mr-3"></span>
                MAKERS FROM TOP COMPANIES
                <span className="inline-block w-8 h-[1px] bg-gradient-to-r from-gray-300 to-gray-200 ml-3"></span>
              </p>
              <div
                className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-4 justify-center lg:justify-start"
                role="list"
                aria-label="Makers from top companies"
              >
                {companyLogos.map(company => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay: 1.1 + company.delay, duration: 0.5 }}
                    onHoverStart={() => setHoveredLogo(company.name)}
                    onHoverEnd={() => setHoveredLogo(null)}
                    className={`font-medium text-sm sm:text-base lg:text-lg transition-all duration-300 cursor-pointer relative ${
                      hoveredLogo === company.name ? 'text-' + company.color : 'text-gray-500'
                    }`}
                    style={{
                      color: hoveredLogo === company.name ? company.color : '',
                    }}
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{ scale: 0.97 }}
                    role="listitem"
                    aria-label={`${company.name} - Maker community member`}
                  >
                    {company.name}

                    {/* Animated underline on hover */}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-current rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: hoveredLogo === company.name ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      aria-hidden="true"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Enhanced 3D Robot and Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{
              delay: 0.4,
              duration: 0.9,
              type: 'spring',
              stiffness: 90,
            }}
            className="hero-3d-container relative flex justify-center items-center h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] w-full order-first lg:order-last lg:justify-end"
            ref={robotRef}
            style={{
              perspective: '1800px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Robot container with enhanced interactions */}
            <motion.div
              className="relative z-10 h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] w-full max-w-md lg:max-w-lg xl:max-w-xl transform-gpu will-change-transform group/robot"
              style={{
                rotateX,
                rotateY,
                translateY: floatY,
              }}
              whileHover={{
                scale: 1.01,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
            >
              {/* Loading overlay */}
              <AnimatePresence>
                {!modelLoaded && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center z-50"
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        rotate: {
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'linear',
                        },
                      }}
                      className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive 3D scene container */}
              <div
                className="w-full h-full cursor-grab active:cursor-grabbing transition-all duration-300 rounded-xl overflow-hidden"
                aria-label="Interactive 3D robot visualization"
              >
                {/* Improved Spline scene with proper error handling */}
                <div className="spline-scene w-full h-full">
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                  />
                </div>
              </div>

              {/* Interactive particles (new feature) */}
              {modelLoaded && !modelError && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-violet-400/80 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Floating UI Elements with improved responsive design */}
            {floatingElements.map(element => (
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
                  repeatType: 'reverse',
                  ease: [0.42, 0.0, 0.58, 1.0],
                  delay: element.delay,
                }}
                whileHover={{
                  scale: 1.1,
                  zIndex: 25,
                  boxShadow: '0 8px 16px rgba(124, 58, 237, 0.08)',
                  rotateX: '5deg',
                  rotateY: '-5deg',
                }}
                whileTap={{
                  scale: 0.95,
                  rotateX: '0deg',
                  rotateY: '0deg',
                }}
                className={`absolute ${element.position} bg-white/85 shadow-sm rounded-xl p-2 sm:p-3 z-20 floating-element backdrop-blur-sm transition-all duration-300 cursor-pointer will-change-transform border border-gray-100/80 group/element hidden sm:block`}
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transformStyle: 'preserve-3d',
                  perspective: '800px',
                  transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.2s ease',
                }}
                aria-hidden="true"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-50 to-violet-100/80 rounded-lg flex items-center justify-center group">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 transition-transform duration-300 group-hover/element:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {element.icon}
                  </svg>
                </div>

                {/* Tooltip that appears on hover */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover/element:opacity-100 transition-opacity duration-200 bg-gray-900/95 text-white px-2.5 py-1 rounded text-xs whitespace-nowrap pointer-events-none backdrop-blur-sm z-30">
                  {element.label}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-b-gray-900/95 border-l-transparent border-r-transparent"></div>
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
