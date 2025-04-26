import { useEffect, useState } from "react";
import { motion, useTransform } from "framer-motion";
import Link from "next/link";

export default function HeroSection({ scrollProgress, isAuthenticated, user }) {
  const [typingText, setTypingText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const phrases = ["Innovation", "Creativity", "Excellence", "Discovery"];

  // Scroll-based animations
  const opacity = useTransform(scrollProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.3], [1, 0.9]);
  const y = useTransform(scrollProgress, [0, 0.3], [0, 100]);

  // Typing animation effect - fixed to prevent infinite loop
  useEffect(() => {
    const phrase = phrases[typingIndex % phrases.length];
    let timer;

    if (typingText.length < phrase.length) {
      // Typing forward
      timer = setTimeout(() => {
        setTypingText(phrase.substring(0, typingText.length + 1));
      }, 100);
    } else if (typingText === phrase) {
      // Pause at the end of the phrase before starting to delete
      timer = setTimeout(() => {
        // Start deleting
        setTypingText(phrase.substring(0, phrase.length - 1));
      }, 2000);
    } else if (typingText.length > 0) {
      // Continue deleting
      timer = setTimeout(() => {
        setTypingText(typingText.substring(0, typingText.length - 1));
      }, 50);
    } else {
      // If we've deleted the entire phrase, move to the next one
      timer = setTimeout(() => {
        setTypingIndex((prevIndex) => prevIndex + 1);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [typingText, typingIndex, phrases]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] },
    },
  };

  // Determine CTA buttons based on authentication state
  const renderCTAButtons = () => {
    if (isAuthenticated && user) {
      return (
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          variants={itemVariants}
        >
          <Link href="/products">
            <motion.button
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center shadow-lg shadow-violet-900/20"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(138, 43, 226, 0.6)",
              }}
            >
              Explore Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <motion.button
              className="px-8 py-3.5 rounded-full bg-gray-800/80 backdrop-blur-sm text-white font-medium text-lg border border-gray-700 hover:border-violet-500 transition-all flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              Go to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        variants={itemVariants}
      >
        <Link href="/products">
          <motion.button
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center shadow-lg shadow-violet-900/20"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(138, 43, 226, 0.6)",
            }}

          >
            Explore Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        </Link>
        <Link href="/auth/login">
          <motion.button
            className="px-8 py-3.5 rounded-full bg-gray-800/80 backdrop-blur-sm text-white font-medium text-lg border border-gray-700 hover:border-violet-500 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.05 }}

          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center relative py-20 pt-0"
      style={{ opacity, scale, y }}
    >
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="inline-block mb-6 px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/50 backdrop-blur-sm"
              variants={itemVariants}
            >
              <span className="text-violet-300 font-medium">
                Discover • Connect • Launch
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight tracking-tight"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400">
                The Marketplace for
              </span>
              <br />
              <span className="relative inline-flex items-center">
                <span>{typingText}</span>
                <span className={`h-12 w-[3px] ml-1 bg-violet-400 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl leading-relaxed"
              variants={itemVariants}
            >
              {isAuthenticated && user ? (
                <>Welcome back, <span className="text-violet-400 font-semibold">{user.firstName || 'Maker'}</span>! Continue your journey in our thriving ecosystem where visionary creators and early adopters connect to shape tomorrow's innovations.</>
              ) : (
                <>Product Bazar is where visionary makers launch groundbreaking products
                and early adopters discover tomorrow's innovations. Join our thriving
                ecosystem that connects creators with their ideal audience.</>
              )}
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8 mb-8"
              variants={itemVariants}
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-violet-400">10,000+</div>
                <div className="text-gray-400 text-sm">Active Products</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-violet-400">25,000+</div>
                <div className="text-gray-400 text-sm">Community Members</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-violet-400">500+</div>
                <div className="text-gray-400 text-sm">Success Stories</div>
              </div>
            </motion.div>

            {/* CTA buttons */}
            {renderCTAButtons()}
          </motion.div>

          {/* Right side illustration */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Main platform UI mockup */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20 blur-2xl rounded-full transform -rotate-12"
                animate={{
                  rotate: [-12, -8, -12],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-full h-[450px] rounded-2xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 shadow-2xl overflow-hidden relative p-4"
                whileHover={{ y: -10 }}

              >
                {/* Browser chrome */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                <div className="flex mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Platform UI mockup */}
                <div className="space-y-4">
                  {/* Search and filter bar */}
                  <div className="flex items-center gap-2 mb-6">
                    <motion.div
                      className="flex-1 h-10 bg-gray-700/70 rounded-lg flex items-center px-4"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-gray-400 text-sm">Search for products...</span>
                    </motion.div>
                    <motion.div
                      className="w-10 h-10 bg-violet-600/50 rounded-lg flex items-center justify-center text-white"
                      whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.7)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <motion.div
                      className="w-10 h-10 bg-violet-600/50 rounded-lg flex items-center justify-center text-white"
                      whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.7)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Featured product */}
                  <motion.div
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/30"
                    whileHover={{
                      borderColor: "rgba(139, 92, 246, 0.5)"
                    }}
                  >
                    <div className="w-full h-32 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-white/50 text-sm">Product Image</span>
                    </div>
                    <div className="h-6 bg-gray-600/50 rounded-md w-3/4 mb-2 flex items-center px-3">
                      <span className="text-white/50 text-xs">Product Name</span>
                    </div>
                    <div className="h-4 bg-gray-600/50 rounded-md w-1/2 mb-4 flex items-center px-3">
                      <span className="text-white/50 text-[10px]">Product Description</span>
                    </div>
                    <div className="flex justify-between">
                      <motion.div
                        className="h-8 w-24 bg-violet-600/30 rounded-full flex items-center justify-center"
                        whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.5)" }}
                      >
                        <span className="text-white/70 text-xs">View Details</span>
                      </motion.div>
                      <div className="flex gap-2">
                        <motion.div
                          className="h-8 w-8 bg-gray-600/50 rounded-full flex items-center justify-center text-white/70"
                          whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.3)" }}
                        > 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.div>
                        <motion.div
                          className="h-8 w-8 bg-gray-600/50 rounded-full flex items-center justify-center text-white/70"
                          whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.3)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Product grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div
                        key={item}
                        className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/30"
                        whileHover={{
                          backgroundColor: "rgba(109, 40, 217, 0.2)",
                          borderColor: "rgba(139, 92, 246, 0.3)"
                        }}
                      >
                        <div className="w-full h-20 bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-md mb-2 flex items-center justify-center">
                          <span className="text-white/30 text-xs">Image {item}</span>
                        </div>
                        <div className="h-4 bg-gray-600/50 rounded-md w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-600/50 rounded-md w-1/2"></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating notification card */}
            <motion.div
              className="absolute -bottom-10 -left-16 w-64 h-40 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3 transform rotate-6"
              whileHover={{ rotate: 0, scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                type: "spring",
              }}

            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">+1</span>
                </div>
                <div>
                  <div className="h-3 bg-gray-700/70 rounded-md w-32 mb-1 flex items-center px-2">
                    <span className="text-white/50 text-[8px]">New Upvote</span>
                  </div>
                  <div className="h-2 bg-gray-700/70 rounded-md w-24 flex items-center px-2">
                    <span className="text-white/50 text-[6px]">Just now</span>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-gray-700/70 rounded-md w-full mb-2"></div>
              <div className="h-3 bg-gray-700/70 rounded-md w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-700/70 rounded-md w-4/6"></div>
            </motion.div>

            {/* Floating upvote card */}
            <motion.div
              className="absolute -top-12 -right-8 w-48 h-36 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg p-3 transform -rotate-12"
              whileHover={{ rotate: 0, scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                },
                type: "spring",
              }}

            >
              <div className="w-12 h-12 rounded-full bg-fuchsia-600 mb-3 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <div className="h-3 bg-gray-700/70 rounded-md w-full mb-2 flex items-center px-2">
                <span className="text-white/50 text-[8px]">Product Upvoted</span>
              </div>
              <div className="h-3 bg-gray-700/70 rounded-md w-3/4 flex items-center px-2">
                <span className="text-white/50 text-[8px]">Thanks for your support!</span>
              </div>
            </motion.div>
          </motion.div>
        </div>


      </div>
    </motion.section>
  );
}
