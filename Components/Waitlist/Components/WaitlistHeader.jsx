'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, LogIn, Home, Eye, Search, Trophy, Menu, X } from 'lucide-react';

const WaitlistHeader = ({ onJoinClick }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const formElement = document.getElementById('join-waitlist');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
    if (onJoinClick) {
      onJoinClick();
    }
  };

  const scrollToSection = sectionId => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const navigationItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'position', label: 'Your Status', icon: Search },
    { id: 'referrals', label: 'Growth', icon: Trophy },
  ];

  // Animation variants
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    hover: {
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const mobileMenuVariants = {
    initial: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  bg-transparent`}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Premium Logo - Responsive sizing */}
          <Link href="/products" aria-label="ProductBazar - Go to homepage">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold relative overflow-hidden transition-all duration-150 hover:scale-105 hover:shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent group-hover:from-white/30 transition-all duration-150" />
              <span className="relative z-10 text-base sm:text-lg group-hover:scale-110 transition-transform duration-150">
                PB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-2 px-3 2xl:px-4 py-2 2xl:py-3 rounded-lg 2xl:rounded-xl text-xs 2xl:text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  activeSection === item.id
                    ? 'text-white bg-violet-600 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                custom={index}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <div className="relative">
                  <item.icon
                    className={`w-3 h-3 2xl:w-4 2xl:h-4 transition-all duration-300 group-hover:scale-110 ${
                      activeSection === item.id ? 'text-white' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-violet-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                </div>
                <span className="font-medium tracking-wide">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons - Responsive layout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Login Button - Hidden on small screens */}
            <Link href="/auth/login" className="hidden sm:block">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-300 bg-gray-900 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 border border-gray-700 shadow-sm hover:shadow-md hover:border-gray-600 hover:bg-gray-800 group"
              >
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="font-medium tracking-wide hidden lg:inline">Login</span>
              </motion.button>
            </Link>

            {/* Join Waitlist Button - Responsive sizing */}
            <motion.button
              onClick={scrollToForm}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 font-medium tracking-wide">
                <span className="hidden sm:inline">Join the Ecosystem</span>
                <span className="sm:hidden">Join</span>
              </span>
              <Rocket className="w-3 h-3 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-12" />
            </motion.button>

            {/* Mobile menu button - Show on mobile and tablet */}
            <div className="xl:hidden">
              <motion.button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-300 hover:text-white p-2 rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all duration-300 border border-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {showMobileMenu ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Responsive layout */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              variants={mobileMenuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="xl:hidden mt-3 sm:mt-4 bg-gray-900/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl shadow-black/30 border border-gray-700 overflow-hidden"
            >
              <div className="p-3 sm:p-4 space-y-1">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center space-x-3 w-full text-left px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 relative ${
                      activeSection === item.id
                        ? 'text-white bg-violet-600 shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <item.icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                        activeSection === item.id ? 'text-white' : ''
                      }`}
                    />
                    <span className="font-medium tracking-wide">{item.label}</span>
                  </motion.button>
                ))}
                
                {/* Mobile Login Button */}
                <div className="pt-2 mt-2 border-t border-gray-700/50 sm:hidden">
                  <Link href="/auth/login">
                    <motion.button
                      className="flex items-center space-x-3 w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: navigationItems.length * 0.1,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="font-medium tracking-wide">Login</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default WaitlistHeader;
