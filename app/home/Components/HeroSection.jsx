"use client";

import React from 'react';
import { useAuth } from '../../../Contexts/Auth/AuthContext';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Content variations based on user type
const getHeroContent = (userType = 'general') => {
  const content = {
    general: {
      headline: "Discover Innovative Products & Ideas",
      subheadline: "Explore a curated marketplace of cutting-edge products and groundbreaking startup ventures."
    },
    freelancer: {
      headline: "Find the Right Tools & Your Next Opportunity",
      subheadline: "Access essential tools, resources, and exciting freelance projects to elevate your career."
    },
    jobSeeker: {
      headline: "Unlock Your Potential at Leading Startups",
      subheadline: "Browse job openings at dynamic startups and take the next step in your professional journey."
    },
    investor: {
      headline: "Discover the Next Big Thing: Invest in Promising Startups",
      subheadline: "Identify high-growth potential startups and connect directly with founders to fuel innovation."
    },
    startupOwner: {
      headline: "Showcase Your Innovation & Grow Your Business",
      subheadline: "Reach a passionate community of early adopters, investors, and talent eager to support your vision."
    }
  };
  
  return content[userType] || content.general;
};

const HeroSection = ({ onSearch }) => {
  const { user } = useAuth();
  const userType = user?.role || 'general';
  const heroContent = getHeroContent(userType);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    if (query && onSearch) {
      onSearch(query);
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl px-8 py-14 md:py-16 text-center shadow-sm"
      variants={heroVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight max-w-3xl mx-auto"
        variants={itemVariants}
      >
        {heroContent.headline}
      </motion.h1>
      
      <motion.p 
        className="text-md md:text-lg text-gray-600 mx-auto mb-8 md:mb-10 max-w-2xl"
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
            name="search"
            placeholder="Search for products, startups, skills, jobs..."
            className="w-full pl-5 pr-16 py-4 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm bg-white"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-3">
          Explore AI, SaaS, Design, Developer Tools, and more
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;