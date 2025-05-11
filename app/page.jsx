"use client";

import Home from "./home/Components/Home";
import React, { useEffect } from "react";
import "./globals.css";
import { runAllCleanup } from "../Utils/cleanupUtils";
import Landing from "../Components/Landing/Landing";


function page() {
  useEffect(() => {
    // Run cleanup on component mount
    runAllCleanup();
  }, []);

  return (
    <div>
      <Landing />
    </div>
  );
}

export default page;
