"use client";

import Home from "../Components/Home/Home";
import React, { useEffect } from "react";
import "./globals.css";
import runAllCleanup from "../Utils/cleanupUtils";

function page() {
  useEffect(() => {
    // Run cleanup on component mount
    runAllCleanup();
  }, []);

  return (
    <div>
      <Home />
    </div>
  );
}

export default page;
