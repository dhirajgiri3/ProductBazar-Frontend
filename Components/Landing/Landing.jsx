import React from "react";
import HeroSection from "./Components/HeroSection";
import DashboardPreview from "./Components/DashboardPreview";
import EnhancedWhySection from "./Components/Why";
import Impact from "./Components/Impact";
import Spotlight from "./Components/Spotlight";

function Landing() {
  return (
    <div className="flex flex-col align-center justify-center gap-20 bg-white dark:bg-gray-900">
      <div className="hero">
        <HeroSection />
      </div>
      <div className="dashboard">
        <DashboardPreview />
      </div>
      <div className="why">
        <EnhancedWhySection />
      </div>
      <div className="impact">
        <Impact />
      </div>
      <div className="spotlight">
        <Spotlight />
      </div>
    </div>
  );
}

export default Landing;
