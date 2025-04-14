"use client";

import Home from "../Components/Home/Home";
import React, { useEffect } from "react";
import "./globals.css";
import runAllCleanup from "../Utils/cleanupUtils";

useEffect(() => {
  // Run cleanup on component mount
  runAllCleanup();
}, []);

function page() {
  return (
    <div>
      <Home />
    </div>
  );
}

export default page;
