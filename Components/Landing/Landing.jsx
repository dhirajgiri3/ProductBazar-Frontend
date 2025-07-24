"use client";

// React is automatically imported in Next.js
import HeroSection from "./Components/HeroSection";
// To control theme, pass isDark={true} or isDark={false} to DashboardPreview
import DashboardPreview from "../DashboardPreview/DashboardPreview";
import Why from "./Components/Why";
import Impact from "./Components/Impact";
import Spotlight from "./Components/Spotlight";
import EcosystemStats from "./Components/EcosystemStats";
import { ProductBazarEcosystemConnector } from "./Components/ProductBazarEcosystemConnector";
import FeaturesSection from "./Components/FeaturesSection";
import TestimonialsSection from "./Components/TestimonialsSection";
import FaqSection from "./Components/FaqSection";

// Section spacing component for consistent vertical rhythm and centering
const SectionSpacing = ({ children, className = "", role = "region", "aria-label": ariaLabel }) => (
  <section 
    className={`w-full flex flex-col items-center justify-center ${className}`}
    role={role}
    aria-label={ariaLabel}
  >
    <div className="mx-auto w-full">
      {children}
    </div>
  </section>
);

function Landing() {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-white min-h-screen w-full"
      role="document"
      aria-label="ProductBazar landing page"
    >
      {/* Hero Section */}
      <SectionSpacing 
        role="banner" 
        aria-label="Hero section - Beyond The Launch"
      >
        <HeroSection />
      </SectionSpacing>

      {/* Dashboard Preview Section */}
      <SectionSpacing 
        aria-label="Platform preview and demonstration"
      >
        <DashboardPreview isDark={true} />
      </SectionSpacing>

      {/* Features Section */}
      <SectionSpacing 
        aria-label="Platform features and capabilities"
      >
        <FeaturesSection />
      </SectionSpacing>

      {/* Why Choose Us Section */}
      <SectionSpacing 
        aria-label="Why choose ProductBazar"
      >
        <Why />
      </SectionSpacing>

      {/* Impact and Results Section */}
      <SectionSpacing 
        aria-label="Real impact and measurable growth"
      >
        <Impact />
      </SectionSpacing>

      {/* Featured Products Section */}
      <SectionSpacing 
        aria-label="Featured products in our ecosystem"
      >
        <Spotlight />
      </SectionSpacing>

      {/* Testimonials Section */}
      <SectionSpacing 
        aria-label="Success stories from our ecosystem"
      >
        <TestimonialsSection />
      </SectionSpacing>

      {/* Statistics Section */}
      <SectionSpacing 
        aria-label="Our ecosystem by the numbers"
      >
        <EcosystemStats />
      </SectionSpacing>

      {/* Call to Action Section */}
      <SectionSpacing 
        aria-label="Join the ecosystem"
      >
        <ProductBazarEcosystemConnector />
      </SectionSpacing>

      {/* FAQ Section */}
      <SectionSpacing 
        aria-label="Common questions about our ecosystem"
      >
        <FaqSection />
      </SectionSpacing>
    </div>
  );
}

export default Landing;
