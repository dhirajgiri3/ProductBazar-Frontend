"use client"

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import { IconBrandLinkedin, IconBrandTwitter, IconBrandFacebook, IconBrandInstagram, IconSend } from '@tabler/icons-react';

// Define animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const socialButtonVariants = {
  hover: (color) => ({
    y: -5,
    backgroundColor: color,
    transition: { duration: 0.2, ease: "easeOut" }
  })
};

// Color variants for social icons
const socialColors = {
  linkedin: "#0077B5",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
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
      className="bg-[#0a0a0a] text-white py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 w-full relative z-10 overflow-hidden font-['clash',sans-serif]"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900">
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={controls}
        className="relative z-10"
      >
        {/* Headline */}
        <motion.div 
          variants={fadeInUp}
          className="mb-12 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4 px-4 py-1 rounded-full bg-violet-900/30 border border-violet-700/50"
          >
            <span className="text-violet-300 font-medium">Join Our Community</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-2 text-white"
          >
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">transform</span> how you connect?
          </motion.h2>
        </motion.div>

        <div className="max-w-[1400px] mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          <motion.div variants={fadeInUp}>
            <div className="bg-transparent border-b border-violet-500/20 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-center sm:text-left bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">About Us</h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-sm leading-relaxed text-center sm:text-left text-white/80"
              >
                Learn more about Product Bazaar and our mission to connect innovators, freelancers, startups, and users on a dynamic platform.
              </motion.p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <div className="bg-transparent border-b border-violet-500/20 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-center sm:text-left bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Quick Links</h3>
              <ul className="flex flex-col items-center sm:items-start">
                {[
                  { href: "/jobs", label: "Jobs" },
                  { href: "/freelance-projects", label: "Freelance Projects" },
                  { href: "/startups", label: "Startups" },
                  { href: "/community", label: "Community" },
                  { href: "/blog", label: "Blog" }
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                    className="mb-2 hover:translate-x-1 transition-transform duration-300"
                  >
                    <Link 
                      href={link.href}
                      className="text-white/70 hover:text-white text-sm relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-[-2px] after:left-0 after:bg-gradient-to-r after:from-violet-400 after:to-fuchsia-500 after:transition-[width] after:duration-300 hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <div className="bg-transparent border-b border-violet-500/20 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-center sm:text-left bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Legal</h3>
              <ul className="flex flex-col items-center sm:items-start">
                {[
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/cookies", label: "Cookie Policy" }
                ].map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                    className="mb-2 hover:translate-x-1 transition-transform duration-300"
                  >
                    <Link 
                      href={link.href}
                      className="text-white/70 hover:text-white text-sm relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-[-2px] after:left-0 after:bg-gradient-to-r after:from-violet-400 after:to-fuchsia-500 after:transition-[width] after:duration-300 hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <div className="bg-transparent border-b border-violet-500/20 pb-6">
              <h3 className="text-lg font-semibold mb-4 text-center sm:text-left bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Follow Us</h3>
              <div className="flex gap-6 my-6 justify-center sm:justify-start">
                <motion.a 
                  href="#" 
                  aria-label="LinkedIn"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.linkedin}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="text-white flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-violet-500/30 relative overflow-hidden"
                >
                  <IconBrandLinkedin size={18} className="relative z-[2]" />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Twitter"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.twitter}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="text-white flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-violet-500/30 relative overflow-hidden"
                >
                  <IconBrandTwitter size={18} className="relative z-[2]" />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Facebook"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.facebook}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="text-white flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-violet-500/30 relative overflow-hidden"
                >
                  <IconBrandFacebook size={18} className="relative z-[2]" />
                </motion.a>
                <motion.a 
                  href="#" 
                  aria-label="Instagram"
                  variants={socialButtonVariants}
                  whileHover="hover"
                  custom={socialColors.instagram}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="text-white flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-violet-500/30 relative overflow-hidden"
                >
                  <IconBrandInstagram size={18} className="relative z-[2]" />
                </motion.a>
              </div>
              
              <form className="flex flex-col gap-4 mt-6 w-full items-center sm:items-start">
                <motion.div 
                  className="relative w-full max-w-[300px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      aria-label="Email for newsletter" 
                      className="w-full max-w-[300px] py-[0.9rem] px-4 border border-violet-500/30 rounded-lg bg-white/5 text-white focus:outline-none focus:border-violet-500 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-[300px] mt-2 py-[0.9rem] px-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-medium flex items-center justify-center transition-all duration-300"
                  >
                    Subscribe <IconSend size={16} className="ml-2 inline" />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
        
        <motion.div variants={fadeInUp}>
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <motion.div
              className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.p
                className="text-center text-xs md:text-sm text-white/80 hover:text-white/90 transition-colors duration-300"
                whileHover={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                © 2024 Product Bazaar. All rights reserved.
              </motion.p>
              <motion.div 
                className="hidden md:block w-1.5 h-1.5 rounded-full bg-violet-500/70"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.p
                className="text-center text-xs md:text-sm text-white/80 hover:text-white/90 transition-colors duration-300"
                whileHover={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                All trademarks, logos, and brand names are the property of their respective owners.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;