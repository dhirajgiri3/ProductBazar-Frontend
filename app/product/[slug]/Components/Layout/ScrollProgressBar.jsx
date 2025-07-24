'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollProgressBar = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!mounted) {
    return null; // Don't render anything on server-side
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-violet-600 to-violet-500 z-50 origin-left"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgressBar; 