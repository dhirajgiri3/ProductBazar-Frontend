import { useEffect, useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function GradientBackground() {
  // --- Hooks and Refs ---
  const { scrollYProgress } = useScroll();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesContainerRef = useRef(null);

  // --- Effect for Mount, Resize, and Mouse Movement ---
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      window.requestAnimationFrame(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize, { passive: true });
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // --- Calculate derived values ---
  const defaultHeight = typeof window !== "undefined" ? window.innerHeight : 500;
  const height = isMounted && windowSize.height > 0 ? windowSize.height : defaultHeight;

  // --- Motion Values ---
  const centerY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [height * 0.4, height * 0.5, height * 0.3]
  );
  
  const primaryOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.25, 0.2, 0.15, 0.25]
  );
  
  const secondaryOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.15, 0.12, 0.18, 0.15]
  );

  // --- Animation Transitions ---
  const mainOrbTransition = {
    duration: 25,
    repeat: Infinity,
    ease: "easeInOut",
    repeatType: "reverse",
  };

  const secondaryOrbTransitions = {
    slow: { duration: 35, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
    medium: { duration: 30, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
    fast: { duration: 25, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
  };

  // --- Particles Configuration ---
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = useMemo(() => {
    return {
      fullScreen: {
        enable: false
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
            parallax: {
              enable: true,
              force: 50,
              smooth: 10
            }
          },
          onClick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 0.25,
              color: "#a594f9"
            }
          },
          push: {
            quantity: 3
          }
        }
      },
      particles: {
        color: {
          value: ["#9d4edd", "#e0aaff", "#c77dff", "#7b2cbf"]
        },
        links: {
          enable: false
        },
        collisions: {
          enable: true
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out"
          },
          random: true,
          speed: 1,
          straight: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 600
          }
        },
        number: {
          density: {
            enable: true,
            area: 800
          },
          value: 50
        },
        opacity: {
          value: { min: 0.1, max: 0.4 },
          animation: {
            enable: true,
            speed: 0.3,
            minimumValue: 0.1
          }
        },
        shape: {
          type: ["circle", "triangle", "star"]
        },
        size: {
          value: { min: 1, max: 4 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.1
          }
        }
      },
      detectRetina: true
    };
  }, []);

  // --- Custom Floating Elements ---
  const floatingElements = useMemo(() => {
    if (!isMounted) return [];
    
    const elements = [];
    const shapes = ["✦", "◇", "○", "△", "⬡"];
    const count = 12;
    
    for (let i = 0; i < count; i++) {
      const shapeIndex = i % shapes.length;
      const shape = shapes[shapeIndex];
      const size = 10 + (i % 15);
      const left = (i * 7.5) % 90 + 5; // Distribute across the screen
      const top = (i * 8.3) % 90 + 5;
      const duration = 15 + (i % 20);
      
      // Color based on shape type
      let color;
      switch (shapeIndex) {
        case 0: color = "text-violet-300"; break;
        case 1: color = "text-fuchsia-300"; break;
        case 2: color = "text-indigo-300"; break;
        case 3: color = "text-purple-300"; break;
        default: color = "text-pink-300";
      }
      
      elements.push(
        <motion.div
          key={`floating-element-${i}`}
          className={`absolute ${color} pointer-events-none opacity-30`}
          style={{
            fontSize: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
          }}
          animate={{
            y: [0, -30, 0, -15, 0],
            x: [0, 15, 0, -15, 0],
            rotate: [0, i % 2 === 0 ? 180 : -180, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {shape}
        </motion.div>
      );
    }
    
    return elements;
  }, [isMounted]);

  // --- Magnetic Cursor Element ---
  const cursorElement = useMemo(() => {
    if (!isMounted) return null;
    
    return (
      <motion.div
        className="absolute pointer-events-none w-24 h-24 rounded-full opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(157, 78, 221, 0.6) 0%, rgba(224, 170, 255, 0) 70%)",
          x: mousePosition.x - 48,
          y: mousePosition.y - 48,
          willChange: "transform",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }, [isMounted, mousePosition]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gray-950">
      {/* Main central gradient orb */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
        style={{
          top: centerY,
          opacity: primaryOpacity,
          willChange: "transform, opacity",
          background: "radial-gradient(circle, rgba(123, 44, 191, 0.2) 0%, rgba(157, 78, 221, 0.15) 40%, rgba(121, 40, 202, 0.1) 70%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          scale: [1, 1.05, 1], 
          rotate: [0, 3, 0, -3, 0], 
        }}
        transition={mainOrbTransition}
      />

      {/* Secondary orbiting gradients */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{
          opacity: secondaryOpacity,
          willChange: "transform, opacity",
          background: "radial-gradient(circle, rgba(157, 78, 221, 0.2) 0%, rgba(224, 170, 255, 0.1) 60%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          x: ["-20vw", "-15vw", "-18vw", "-16vw", "-20vw"],
          y: ["12vh", "16vh", "14vh", "16vh", "12vh"],
        }}
        transition={secondaryOrbTransitions.fast}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[130px]"
        style={{
          opacity: secondaryOpacity,
          willChange: "transform, opacity",
          background: "radial-gradient(circle, rgba(199, 125, 255, 0.2) 0%, rgba(157, 78, 221, 0.1) 60%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          x: ["58vw", "54vw", "56vw", "54vw", "58vw"],
          y: ["32vh", "36vh", "34vh", "36vh", "32vh"],
        }}
        transition={secondaryOrbTransitions.medium}
      />
      
      <motion.div
        className="absolute w-[650px] h-[650px] rounded-full blur-[140px]"
        style={{
          opacity: secondaryOpacity,
          willChange: "transform, opacity",
          background: "radial-gradient(circle, rgba(123, 44, 191, 0.2) 0%, rgba(157, 78, 221, 0.1) 60%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          x: ["28vw", "24vw", "26vw", "24vw", "28vw"],
          y: ["72vh", "76vh", "74vh", "76vh", "72vh"],
        }}
        transition={secondaryOrbTransitions.slow}
      />

      {/* Enhanced accent elements */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full blur-[80px]"
        style={{ 
          willChange: "transform",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.08) 60%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          x: ["12vw", "16vw", "14vw", "16vw", "12vw"],
          y: ["48vh", "44vh", "46vh", "44vh", "48vh"],
          scale: [1, 1.1, 1.05, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        className="absolute w-[220px] h-[220px] rounded-full blur-[70px]"
        style={{ 
          willChange: "transform",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 60%, rgba(0, 0, 0, 0) 100%)"
        }}
        animate={{
          x: ["72vw", "76vw", "74vw", "76vw", "72vw"],
          y: ["13vh", "9vh", "11vh", "9vh", "13vh"],
          scale: [1, 1.06, 1.03, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />

      {/* Floating Geometric Elements */}
      {floatingElements}

      {/* React Particles with Cursor Interaction */}
      {isMounted && (
        <div className="absolute inset-0" ref={particlesContainerRef}>
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
          />
        </div>
      )}

      {/* Magnetic Cursor Element */}
      {cursorElement}

      {/* Glow Effect on Mouse Position */}
      {isMounted && (
        <motion.div
          className="absolute bg-violet-500/5 w-64 h-64 rounded-full pointer-events-none blur-3xl"
          style={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
            willChange: "transform",
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Enhanced Overlays */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black opacity-25"></div>
      
      {/* Gradient overlays for depth effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent opacity-70"></div>
      <div className="absolute top-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-gray-950 via-gray-950/30 to-transparent opacity-40"></div>
    </div>
  );
}