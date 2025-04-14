"use client";

import React, { useEffect } from 'react';
import Home from './Components/Home';
import { runAllCleanup } from '../../Utils/cleanupUtils';

function page() {
  useEffect(() => {
    // Run cleanup on component mount
    runAllCleanup();
  }, []);

  return (
    <Home />
  );
}

export default page;