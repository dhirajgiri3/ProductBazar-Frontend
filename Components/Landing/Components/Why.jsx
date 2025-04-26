"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useInView,
  useScroll,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import React, { useRef, useState, useEffect, memo, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import GlobalButton from "../../UI/Buttons/GlobalButton";

// Enhanced Advantage Data with Lucide icons and refined metadata
const advantageData = [
  {
    id: "targeted",
    title: "Targeted Tech Exposure",
    description:
      "Reach genuinely engaged early adopters, potential customers, and tech enthusiasts actively seeking new SaaS, AI, Dev Tools, and No-Code solutions.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 dark:from-indigo-900/20 dark:to-indigo-800/30",
      text: "text-indigo-900 dark:text-indigo-100",
      accent: "#818cf8", // Indigo-400
      darkAccent: "#a5b4fc", // Indigo-300 for dark mode
    },
    icon: "Target",
    badgeIcon: "Zap",
    delay: 0,
    category: "acquisition",
  },
  {
    id: "feedback",
    title: "Quality Feedback Loop",
    description:
      "Gather specific, actionable insights from a knowledgeable community to refine your product, iterate faster, and build a stronger roadmap.",
    gridClass: "col-span-1 row-span-1",
    color: {
      bg: "bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-900/20 dark:to-amber-800/30",
      text: "text-amber-900 dark:text-amber-100",
      accent: "#fbbf24", // Amber-400
      darkAccent: "#fcd34d", // Amber-300 for dark mode
    },
    icon: "MessageSquare",
    badgeIcon: "MessageCircle",
    delay: 0.1,
    category: "product",
  },
  {
    id: "trust",
    title: "Enhanced Credibility",
    description:
      "Showcase your product on a professional, curated platform, building trust and signaling quality to users, stakeholders, and potential investors.",
    gridClass: "col-span-1 row-span-1",
    color: {
      bg: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/30",
      text: "text-emerald-900 dark:text-emerald-100",
      accent: "#34d399", // Emerald-400
      darkAccent: "#6ee7b7", // Emerald-300 for dark mode
    },
    icon: "Shield",
    badgeIcon: "Award",
    delay: 0.2,
    category: "trust",
  },
  {
    id: "ai",
    title: "AI-Powered Discovery",
    description:
      "Find relevant, cutting-edge tools and software quickly through curated feeds, personalized recommendations, and smart filtering based on your interests.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/30",
      text: "text-blue-900 dark:text-blue-100",
      accent: "#60a5fa", // Blue-400
      darkAccent: "#93c5fd", // Blue-300 for dark mode
    },
    icon: "Brain",
    badgeIcon: "Sparkles",
    delay: 0.3,
    category: "technology",
  },
  {
    id: "network",
    title: "Strategic Connections",
    description:
      "Network with fellow founders, potential partners, skilled talent, and investors within a supportive, tech-focused community.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "bg-gradient-to-br from-violet-50/80 to-violet-100/80 dark:from-violet-900/20 dark:to-violet-800/30",
      text: "text-violet-900 dark:text-violet-100",
      accent: "#a78bfa", // Violet-400
      darkAccent: "#c4b5fd", // Violet-300 for dark mode
    },
    icon: "Network",
    badgeIcon: "Users",
    delay: 0.4,
    category: "community",
  },
  {
    id: "traction",
    title: "Early Traction & Validation",
    description:
      "Gain tangible proof of interest, user engagement metrics, and valuable analytics to validate your ideas and attract further opportunities.",
    gridClass: "col-span-1 row-span-1",
    color: {
      bg: "bg-gradient-to-br from-rose-50/80 to-rose-100/80 dark:from-rose-900/20 dark:to-rose-800/30",
      text: "text-rose-900 dark:text-rose-100",
      accent: "#fb7185", // Rose-400
      darkAccent: "#fda4af", // Rose-300 for dark mode
    },
    icon: "TrendingUp",
    badgeIcon: "LineChart",
    delay: 0.5,
    category: "growth",
  },
];

// Enhanced Category Badge with subtle animation
const CategoryBadge = ({ category, accentColor, badgeIcon, isHovered }) => {
  const BadgeIcon = LucideIcons[badgeIcon];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="py-1 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: `${accentColor}20`,
        color: accentColor,
      }}
      animate={
        isHovered && !prefersReducedMotion
          ? { y: [-1, 0, -1], scale: [1, 1.03, 1] }
          : {}
      }
      transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
    >
      <BadgeIcon className="w-3 h-3" />
      <span>{category}</span>
    </motion.div>
  );
};

// Refined animation variants
const sharedAnimations = {
  card: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    }),
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
      },
    },
  },
  icon: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },
  text: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },
  buttonText: {
    initial: { x: 0 },
    hover: {
      x: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  },
};

// Enhanced BentoCard Component with improved tilt animation
const BentoCard = memo(({ item, scrollYProgress, isDarkMode }) => {
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { amount: 0.2, once: false });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // For magnetic hover effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // For improved smooth animation
  const springConfig = { stiffness: 150, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // For enhanced 3D rotation effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Enhanced parallax effects
  const cardOffset = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion
      ? [0, 0, 0]
      : [item.id % 2 === 0 ? -15 : 15, 0, item.id % 2 === 0 ? 15 : -15]
  );

  // Get the appropriate Icon component from Lucide
  const Icon = LucideIcons[item.icon];

  // Calculate accent color based on dark mode
  const accentColor = isDarkMode ? item.color.darkAccent : item.color.accent;

  // Handle mouse movement for enhanced tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || !isHovered || prefersReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Improved magnetic effect strength
    const magneticStrength = 7;
    const offsetX = ((mouseX - centerX) / centerX) * magneticStrength;
    const offsetY = ((mouseY - centerY) / centerY) * magneticStrength;

    x.set(offsetX);
    y.set(offsetY);

    // Enhanced rotation for more realistic tilt
    const rotX = ((mouseY - centerY) / centerY) * 4; // Increased but still natural
    const rotY = ((centerX - mouseX) / centerX) * 4;

    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  // Transform for 3D effect - improved to feel more realistic
  const transform = useTransform(
    [springRotateX, springRotateY],
    ([latestRotateX, latestRotateY]) =>
      prefersReducedMotion
        ? "none"
        : `perspective(1000px) rotateX(${latestRotateX}deg) rotateY(${latestRotateY}deg)`
  );

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl ${item.gridClass} border border-gray-100 dark:border-gray-800 backdrop-blur-[5px] transition-all`}
      variants={sharedAnimations.card}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={item.delay}
      exit="exit"
      whileHover={!prefersReducedMotion ? "hover" : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        transform: prefersReducedMotion ? undefined : transform,
        translateY: cardOffset, // Parallax scroll effect
      }}
      tabIndex={0}
      role="article"
      aria-labelledby={`card-${item.id}-title`}
      aria-describedby={`card-${item.id}-desc`}
    >
      {/* Clean background gradient */}
      <div
        className={`absolute inset-0 ${item.color.bg} transition-colors duration-300`}
      />

      {/* Grid pattern overlay with improved fade effect */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-grid-pattern mix-blend-overlay fade-mask" />
      </div>

      {/* Subtle border highlight on hover */}
      {isHovered && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 border border-current rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.2 }}
          style={{ color: accentColor }}
        />
      )}

      {/* Content with improved spacing and hierarchy */}
      <div className="relative z-10 p-7 flex flex-col h-full">
        {/* Enhanced category badge */}
        <div className="absolute top-5 right-5">
          <CategoryBadge
            category={item.category}
            accentColor={accentColor}
            badgeIcon={item.badgeIcon}
            isHovered={isHovered}
          />
        </div>

        {/* Icon with improved animation */}
        <motion.div
          variants={sharedAnimations.icon}
          animate={
            isHovered && !prefersReducedMotion
              ? { scale: 1.1, y: [0, -2, 0] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="text-2xl mb-6 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
          aria-hidden="true"
        >
          <Icon size={24} />
        </motion.div>

        {/* Title with enhanced styling */}
        <motion.h3
          id={`card-${item.id}-title`}
          variants={sharedAnimations.text}
          className={`text-lg font-semibold ${item.color.text} mb-3.5`}
        >
          {item.title}
        </motion.h3>

        {/* Description with improved readability */}
        <motion.p
          id={`card-${item.id}-desc`}
          variants={sharedAnimations.text}
          className={`text-sm/relaxed ${item.color.text}/75`}
        >
          {item.description}
        </motion.p>
      </div>
    </motion.div>
  );
});

// Enhanced Section Header Component with parallax effects
const SectionHeader = memo(({ title, subtitle, scrollYProgress, isInView }) => {
  const prefersReducedMotion = useReducedMotion();

  // Enhanced parallax effects
  const titleY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [30, 0, -30]
  );

  const subtitleY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [20, 0, -20]
  );

  // Section title animation - enhanced
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="text-center mb-16">
      <motion.div
        className="inline-block relative"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={titleVariants}
        style={{ y: prefersReducedMotion ? 0 : titleY }}
      >
        <h2
          className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
          aria-label={title}
        >
          {title}
        </h2>

        {/* Refined underline */}
        <motion.div
          className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-violet-500 dark:bg-violet-400 rounded-full"
          initial={{ scaleX: 0, originX: 0.5 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>

      <motion.p
        className="text-gray-600 dark:text-gray-300 text-lg mt-6 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ y: prefersReducedMotion ? 0 : subtitleY }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
});

// Simplified Background Component with just gray-500 grid lines
const Background = memo(
  ({ scrollYProgress, isDarkMode, prefersReducedMotion }) => {
    // Parallax effect for grid
    const gridY = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion ? [0, 0] : [0, -30]
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Simple gray grid pattern with no dot patterns */}
        <motion.div
          className="absolute inset-0"
          style={{
            y: gridY,
          }}
        >
          {/* Primary grid layer - simple gray-500 lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(107, 114, 128, 0.15) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(107, 114, 128, 0.15) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Subtle fade effect for edges */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, transparent 60%, #ffffff 95%)`,
            }}
          />
        </motion.div>

        {/* Subtle color accent circles with reduced opacity */}
        <motion.div
          className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-violet-100/20 -z-10"
          style={{
            y: useTransform(
              scrollYProgress,
              [0, 1],
              prefersReducedMotion ? [0, 0] : [0, -50]
            ),
            x: useTransform(
              scrollYProgress,
              [0, 1],
              prefersReducedMotion ? [0, 0] : [0, 30]
            ),
          }}
        />
        <motion.div
          className="absolute bottom-40 left-[5%] w-48 h-48 rounded-full bg-violet-100/20 -z-10"
          style={{
            y: useTransform(
              scrollYProgress,
              [0, 1],
              prefersReducedMotion ? [0, 0] : [0, 50]
            ),
            x: useTransform(
              scrollYProgress,
              [0, 1],
              prefersReducedMotion ? [0, 0] : [0, -30]
            ),
          }}
        />
      </div>
    );
  }
);

// Optimized Why Section Component with white background
function Why() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smoother scroll progress for more fluid animations
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const isInView = useInView(sectionRef, { amount: 0.3, once: false });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    // Check initial preference
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    // Set up listener for changes
    const darkModeHandler = (e) => {
      setIsDarkMode(e.matches);
    };

    darkModeQuery.addEventListener("change", darkModeHandler);

    return () => {
      darkModeQuery.removeEventListener("change", darkModeHandler);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      aria-labelledby="why-product-bazar-heading"
    >
      {/* Simplified background with just grid lines */}
      <Background
        scrollYProgress={smoothScrollYProgress}
        isDarkMode={isDarkMode}
        prefersReducedMotion={prefersReducedMotion}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-12">
        {/* Enhanced header with parallax */}
        <SectionHeader
          title="Why Product Bazar?"
          subtitle="Unlock your product's full potential with our innovative platform designed for the needs of modern creators."
          scrollYProgress={smoothScrollYProgress}
          isInView={isInView}
        />

        {/* Enhanced Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 mb-16">
          <AnimatePresence>
            {advantageData.map((item) => (
              <BentoCard
                key={item.id}
                item={item}
                scrollYProgress={smoothScrollYProgress}
                isDarkMode={isDarkMode}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-block">
            <GlobalButton
              variant="primary"
              size="lg"
              magneticEffect={true}
              className="px-8"
              ariaLabel="Submit your product to Product Bazar"
            >
              Submit Your Product
            </GlobalButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Simplified CSS - removed dot pattern styles
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Ensure proper focus states for keyboard users */
      :focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }
      
      /* Reduced motion preferences */
      @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

// Complete component with simplified grid
const EnhancedWhySection = () => {
  return (
    <>
      <GlobalStyles />
      <Why />
    </>
  );
};

export default EnhancedWhySection;
