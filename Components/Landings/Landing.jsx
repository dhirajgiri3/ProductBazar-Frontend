// frontend/Components/Landing/Landing.jsx
import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAuth } from "../../Contexts/Auth/AuthContext";
import Hero from "../Landing/Components/HeroSection";

// Dynamically import components for better performance
const GradientBackground = dynamic(() => import("./Components/GradientBackground"));
const ParticleBackground = dynamic(() => import("./Components/ParticleBackground"));
const HeroSection = dynamic(() => import("./Components/HeroSection"));
const FeaturesSection = dynamic(() => import("./Components/FeaturesSection"));
const HowItWorksSection = dynamic(() => import("./Components/HowItWorksSection"));
const ProductsShowcase = dynamic(() => import("./Components/ProductsShowcase"));
const UserTypesSection = dynamic(() => import("./Components/UserTypesSection"));
const TestimonialsSection = dynamic(() => import("./Components/TestimonialsSection"));
const StatsSection = dynamic(() => import("./Components/StatsSection"));
const FaqSection = dynamic(() => import("./Components/FaqSection"));
const CallToAction = dynamic(() => import("./Components/CallToAction"));
const LoadingScreen = dynamic(() => import("../../Components/UI/LoadingScreen"));

export default function Landing() {
  const [isLoading, setIsLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const mainRef = useRef(null);
  const { user, isAuthenticated, authLoading, isInitialized } = useAuth();

  // Handle initial loading
  useEffect(() => {
    // Wait for auth to initialize and add a small delay for smoother transition
    if (isInitialized && !authLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, authLoading]);

  // Scroll progress transforms
  const opacity = useTransform(scrollYProgress, [0.97, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.97, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950"
          >
            <LoadingScreen message="Preparing your experience..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background components */}
      {/* Animated gradient background */}
      <GradientBackground />

      {/* Enhanced particle animation */}
      <ParticleBackground />

      <motion.main
        ref={mainRef}
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ opacity, scale }}
      >
        {/* Hero section with main value proposition */}
        <HeroSection
          scrollProgress={scrollYProgress}
          isAuthenticated={isAuthenticated}
          user={user}
        />

        {/* Core platform features */}
        <FeaturesSection />

        {/* How the platform works */}
        <HowItWorksSection />

        {/* Featured products showcase */}
        <ProductsShowcase />

        {/* For Makers & For Enthusiasts */}
        <UserTypesSection
          isAuthenticated={isAuthenticated}
          user={user}
        />

        {/* Platform statistics */}
        <StatsSection />

        {/* User testimonials */}
        <TestimonialsSection />

        {/* Frequently asked questions */}
        <FaqSection />

        {/* Final call to action */}
        <CallToAction
          isAuthenticated={isAuthenticated}
          user={user}
        />
      </motion.main>
    </div>
  );
}
