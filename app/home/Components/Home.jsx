"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../Contexts/Auth/AuthContext";
import { useRecommendation } from "../../../Contexts/Recommendation/RecommendationContext";
import HeroSection from "./HeroSection";
import CategoryGrid from "./CategoryGrid";
import TrendingProductsSection from "./TrendingProductSection";
import PersonalizedSection from "./PersonalizedSection";
import NewProductsSection from "./NewProductsSection";
import CommunityPicksSection from "./CommunityPicksSection";
import ForumThreadsSection from "./ForumThreadsSection";
import NewsletterSignup from "../../../Components/common/Auth/NewsletterSignup";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { recordInteraction } = useRecommendation();
  const [userType, setUserType] = useState("general");

  // Determine user type for personalized content
  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case "startupOwner":
          setUserType("startupOwner");
          break;
        case "investor":
          setUserType("investor");
          break;
        case "jobseeker":
          setUserType("jobSeeker");
          break;
        case "freelancer":
          setUserType("freelancer");
          break;
        default:
          setUserType("general");
      }
    } else {
      setUserType("general");
    }
  }, [user]);

  // Track page view for recommendations
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Only track if authenticated and tracking function exists
        if (isAuthenticated && recordInteraction) {
          await recordInteraction('homepage', 'page_view', {
            userType,
            section: 'homepage',
            source: 'direct_navigation'
          });
        }
      } catch (err) {
        console.error('Failed to track page view:', err);
        // Non-critical error, don't need to show to user
      }
    };
    
    trackPageView();
  }, [isAuthenticated, recordInteraction, userType]);

  // Handle search from hero section
  const handleSearch = useCallback((query) => {
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* Hero Section */}
        <HeroSection 
          onSearch={handleSearch}
        />
        
        {/* Category Grid */}
        <CategoryGrid />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Trending Products Section */}
            <TrendingProductsSection />
            
            {/* Personalized Section - Only show if authenticated */}
            {isAuthenticated && (
              <PersonalizedSection />
            )}
            
            {/* New Products Section */}
            <NewProductsSection />
            
            {/* Community Picks - Only show if authenticated */}
            {isAuthenticated && (
              <CommunityPicksSection />
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Forum Threads */}
            <ForumThreadsSection />
            
            {/* Newsletter Signup */}
            <NewsletterSignup />
          </div>
        </div>
      </div>
    </>
  );
}