import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor({ cursorVariant }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
    },
    hover: {
      x: mousePosition.x - 30,
      y: mousePosition.y - 30,
      scale: 2,
    },
  };

  return (
    <>
      <motion.div
        className="cursor-dot hidden md:block fixed top-0 left-0 w-8 h-8 pointer-events-none z-50"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-violet-500 opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
        </div>
      </motion.div>
    </>
  );
}
