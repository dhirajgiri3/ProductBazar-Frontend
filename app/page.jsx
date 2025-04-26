"use client";

import Home from "./home/Components/Home";
import React, { useEffect } from "react";
import "./globals.css";
import { runAllCleanup } from "../Utils/cleanupUtils";
import Landing from "../Components/Landing/Landing";
import PBLanding from "../Components/Landings/Components/PBLanding";


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
