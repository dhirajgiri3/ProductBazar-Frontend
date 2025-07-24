"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  ArrowRight,
  Code,
  Monitor,
  Github,
  Rocket,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { y: 24, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Social media brand colors
const socialColors = {
  linkedin: "#0077B5",
  twitter: "#1DA1F2",
  instagram: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
  github: "#181717",
};

const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: false, amount: 0.1 });
  const controls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      controls.start("show");
    }
  }, [isInView, controls]);

  return (
    <footer
      ref={footerRef}
      className="bg-gray-900 text-white py-24 px-6 md:px-12 lg:px-16 w-full relative z-10 overflow-hidden font-['Inter',sans-serif] border-t border-gray-800"
    >
      {/* Animated gradient background with floating blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black">
          {/* Purple blob */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Violet blob */}
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Blue blob */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Additional smaller blobs for depth */}
          <motion.div
            className="absolute top-1/6 left-1/6 w-48 h-48 bg-purple-500/8 rounded-full blur-2xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 25, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-1/6 right-1/6 w-56 h-56 bg-violet-500/6 rounded-full blur-2xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={controls}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Main Headline */}
        <motion.div variants={fadeInUp} className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 backdrop-blur-sm"
          >
            <span className="text-purple-300 font-normal text-xs tracking-wider uppercase">Join Our Network</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-light mb-4 text-white tracking-tight"
          >
            Elevate your{" "}
            <span className="font-normal bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              professional
            </span>{" "}
            connections
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Connect with innovators, freelancers, and startups on our professional platform designed for meaningful collaboration and growth.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-16">
          {/* About Us Section */}
          <motion.div variants={fadeInUp}>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-2xl font-normal mb-6 text-white tracking-tight">
                  About Product Bazaar
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm font-normal">
                  We're building the future of professional collaboration. Our platform connects talented individuals with innovative projects, 
                  creating opportunities for growth, learning, and meaningful impact in the digital economy.
                </p>
              </motion.div>

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h4 className="text-lg font-normal mb-5 text-white tracking-tight">Connect With Us</h4>
                <div className="flex gap-4">
                  {[
                    { href: "https://www.linkedin.com/in/dhirajgiri", label: "LinkedIn", icon: Linkedin, color: socialColors.linkedin },
                    { href: "https://x.com/dhirajgiri003", label: "Twitter", icon: Twitter, color: socialColors.twitter },
                    { href: "https://www.instagram.com/dhirajjgoswami", label: "Instagram", icon: Instagram, color: socialColors.instagram },
                    { href: "https://github.com/dhirajgiri3", label: "Github", icon: Github, color: socialColors.github},
                  ].map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      aria-label={`Follow us on ${social.label}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 group backdrop-blur-sm"
                    >
                      <social.icon size={20} className="transition-all duration-300" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div variants={fadeInUp}>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 backdrop-blur-sm">
                    <Mail size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-normal text-white tracking-tight">Stay Updated</h3>
                    <p className="text-gray-400 text-sm font-normal">Get industry insights delivered to your inbox</p>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-8 text-sm font-normal">
                  Receive curated insights, exclusive opportunities, and strategic resources to help you stay ahead in your professional journey.
                </p>
              </motion.div>

              <motion.form
                className="space-y-5"
                role="form"
                aria-label="Newsletter subscription"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    aria-label="Email for newsletter"
                    className="relative w-full py-4 px-5 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-sm font-normal backdrop-blur-sm"
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-normal text-sm flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Subscribe to newsletter"
                >
                  <span className="mr-2">Subscribe</span>
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>

                <p className="text-xs text-gray-500 text-center font-normal">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.form>
            </div>
          </motion.div>
        </div>

        {/* Copyright Section */}
        <motion.div
          variants={fadeInUp}
          className="pt-10 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div
              className="flex flex-col md:flex-row items-center gap-4 md:gap-8"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-gray-500 text-xs font-normal">
                © 2025 Product Bazaar. All rights reserved.
              </p>
              <div className="hidden md:block w-1 h-1 rounded-full bg-purple-500/50"></div>
              <p className="text-gray-500 text-xs font-normal">
                All trademarks belong to their respective owners.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <p className="text-xs text-gray-500 text-center md:text-right font-normal">
                Designed and developed by{" "}
                <a
                  href="https://www.linkedin.com/in/dhirajgiri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-normal relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-gradient-to-r after:from-purple-400 after:to-purple-500 after:transition-[width] after:duration-300 hover:after:w-full"
                  aria-label="Visit Dhiraj Giri's LinkedIn"
                >
                  Dhiraj Giri
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;