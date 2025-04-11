"use client";

import React, { useState } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight } from "lucide-react";

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

// Content variations based on user type
const getHeroContent = (userType = "general") => {
  const content = {
    general: {
      headline: "Discover Innovative Products & Ideas",
      subheadline:
        "Explore a curated marketplace of cutting-edge products and groundbreaking startup ventures.",
    },
    freelancer: {
      headline: "Find the Right Tools & Your Next Opportunity",
      subheadline:
        "Access essential tools, resources, and exciting freelance projects to elevate your career.",
    },
    jobSeeker: {
      headline: "Unlock Your Potential at Leading Startups",
      subheadline:
        "Browse job openings at dynamic startups and take the next step in your professional journey.",
    },
    investor: {
      headline: "Discover the Next Big Thing: Invest in Promising Startups",
      subheadline:
        "Identify high-growth potential startups and connect directly with founders to fuel innovation.",
    },
    startupOwner: {
      headline: "Showcase Your Innovation & Grow Your Business",
      subheadline:
        "Reach a passionate community of early adopters, investors, and talent eager to support your vision.",
    },
  };

  return content[userType] || content.general;
};

const HeroSection = ({ onSearch }) => {
  const { user } = useAuth();
  const userType = user?.role || "general";
  const heroContent = getHeroContent(userType);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 px-8 py-16 md:py-24 text-center shadow-xl mb-12"
      variants={heroVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] right-[15%] w-40 h-40 bg-purple-300/10 rounded-full blur-2xl"></div>
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        variants={itemVariants}
      >
        {/* Eyebrow label */}
        <motion.div
          className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Discover What's Next</span>
        </motion.div>

        <motion.h1
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight tracking-tight"
          variants={itemVariants}
        >
          {heroContent.headline}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/80 mx-auto mb-10 md:mb-12 max-w-2xl leading-relaxed"
          variants={itemVariants}
        >
          {heroContent.subheadline}
        </motion.p>

        <motion.div
          className="w-full max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, startups, skills, jobs..."
              className="w-full pl-6 pr-16 py-5 rounded-full text-gray-700 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl bg-white text-base"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2.5 bg-violet-700 hover:bg-violet-800 active:bg-violet-900 text-white p-2.5 rounded-full transition-colors shadow-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["AI Tools", "SaaS", "Design", "Dev Tools", "Productivity"].map(
              (tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white/90 text-sm rounded-full transition-colors backdrop-blur-sm"
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                  }}
                >
                  {tag}
                </motion.button>
              )
            )}
          </div>
        </motion.div>

        <motion.div
          className="mt-10 flex justify-center"
          variants={itemVariants}
        >
          <a
            href="#trending"
            className="flex items-center text-white/80 hover:text-white transition-colors gap-1"
          >
            <span>Scroll to discover</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
