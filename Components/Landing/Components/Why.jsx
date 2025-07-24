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
import { useRef, useState, memo, useMemo } from "react";
import {
  Target,
  MessageSquare,
  Shield,
  Brain,
  Network,
  TrendingUp,
  Zap,
  MessageCircle,
  Award,
  Sparkles,
  Users,
  LineChart,
  ArrowRight,
} from "lucide-react";
import GlobalButton from "../../UI/Buttons/GlobalButton";
import SectionLabel from "./Animations/SectionLabel";

// Map icon names to imported components
const LucideIconsMap = {
  Target,
  MessageSquare,
  Shield,
  Brain,
  Network,
  TrendingUp,
  Zap,
  MessageCircle,
  Award,
  Sparkles,
  Users,
  LineChart,
  ArrowRight,
};

// Advantage Data
const advantageData = [
  {
    id: "targeted",
    title: "Strategic Audience Reach",
    description:
      "Reach genuinely engaged early adopters, potential customers, and tech enthusiasts actively seeking new SaaS, AI, Dev Tools, and No-Code solutions.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "from-indigo-50/90 to-indigo-100/90",
      text: "text-indigo-900",
      accent: "#818cf8", // Indigo-400
      border: "#c7d2fe", // Indigo-200
    },
    icon: "Target",
    badgeIcon: "Zap",
    delay: 0,
    category: "acquisition",
  },
  {
    id: "feedback",
    title: "Continuous Improvement Engine",
    description:
      "Gather specific, actionable insights from a knowledgeable community to refine your product, iterate faster, and build a stronger roadmap.",
    gridClass: "col-span-1 row-span-1 md:col-span-1 sm:col-span-1",
    color: {
      bg: "from-amber-50/90 to-amber-100/90",
      text: "text-amber-900",
      accent: "#fbbf24", // Amber-400
      border: "#fde68a", // Amber-200
    },
    icon: "MessageSquare",
    badgeIcon: "MessageCircle",
    delay: 0.1,
    category: "product",
  },
  {
    id: "trust",
    title: "Professional Validation",
    description:
      "Showcase your product on a professional, curated platform, building trust and signaling quality to users, stakeholders, and potential investors.",
    gridClass: "col-span-1 row-span-1 md:col-span-1 sm:col-span-1",
    color: {
      bg: "from-emerald-50/90 to-emerald-100/90",
      text: "text-emerald-900",
      accent: "#34d399", // Emerald-400
      border: "#a7f3d0", // Emerald-200
    },
    icon: "Shield",
    badgeIcon: "Award",
    delay: 0.2,
    category: "trust",
  },
  {
    id: "ai",
    title: "Intelligent Discovery",
    description:
      "Find relevant, cutting-edge tools and software quickly through curated feeds, personalized recommendations, and smart filtering based on your interests.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "from-blue-50/90 to-blue-100/90",
      text: "text-blue-900",
      accent: "#60a5fa", // Blue-400
      border: "#bfdbfe", // Blue-200
    },
    icon: "Brain",
    badgeIcon: "Sparkles",
    delay: 0.3,
    category: "technology",
  },
  {
    id: "network",
    title: "Ecosystem Networking",
    description:
      "Network with fellow founders, potential partners, skilled talent, and investors within a supportive, tech-focused community.",
    gridClass: "col-span-2 row-span-1 md:col-span-2 sm:col-span-1",
    color: {
      bg: "from-violet-50/90 to-violet-100/90",
      text: "text-violet-900",
      accent: "#a78bfa", // Violet-400
      border: "#ddd6fe", // Violet-200
    },
    icon: "Network",
    badgeIcon: "Users",
    delay: 0.4,
    category: "community",
  },
  {
    id: "traction",
    title: "Proof of Market",
    description:
      "Gain tangible proof of interest, user engagement metrics, and valuable analytics to validate your ideas and attract further opportunities.",
    gridClass: "col-span-1 row-span-1 md:col-span-1 sm:col-span-1",
    color: {
      bg: "from-rose-50/90 to-rose-100/90",
      text: "text-rose-900",
      accent: "#fb7185", // Rose-400
      border: "#fecdd3", // Rose-200
    },
    icon: "TrendingUp",
    badgeIcon: "LineChart",
    delay: 0.5,
    category: "growth",
  },
];

const CategoryBadge = memo(
  ({ category, accentColor, badgeIcon, isHovered, borderColor }) => {
    const BadgeIcon = LucideIconsMap[badgeIcon];
    const prefersReducedMotion = useReducedMotion();

    const shadowValues = useMemo(() => {
      if (
        !accentColor ||
        typeof accentColor !== "string" ||
        !accentColor.startsWith("#")
      ) {
        return { shadowStart: "none", shadowMid: "none", shadowEnd: "none" };
      }
      const r = parseInt(accentColor.slice(1, 3), 16);
      const g = parseInt(accentColor.slice(3, 5), 16);
      const b = parseInt(accentColor.slice(5, 7), 16);
      const intensity = 0.3;

      return {
        shadowStart: `0 0 0px rgba(${r}, ${g}, ${b}, 0.05)`,
        shadowMid: `0 0 10px rgba(${r}, ${g}, ${b}, ${intensity})`,
        shadowEnd: `0 0 0px rgba(${r}, ${g}, ${b}, 0.05)`,
      };
    }, [accentColor]);

    const currentBoxShadow =
      isHovered && !prefersReducedMotion
        ? [
            shadowValues.shadowStart,
            shadowValues.shadowMid,
            shadowValues.shadowEnd,
          ]
        : shadowValues.shadowStart;

    return (
      <motion.div
        className="py-1.5 px-3 rounded-full flex items-center gap-2 text-xs font-medium uppercase tracking-wider shadow-sm transition-all duration-300"
        style={{
          backgroundColor: accentColor ? `${accentColor}1C` : "rgba(240,240,245,0.85)",
          color: accentColor || "inherit",
          border: `1px solid ${borderColor || (accentColor ? `${accentColor}4A` : "rgba(200,200,205,0.5)")}`,
        }}
        initial={{ y: 0, scale: 1, boxShadow: shadowValues.shadowStart }}
        animate={
          isHovered && !prefersReducedMotion
            ? { boxShadow: currentBoxShadow }
            : { boxShadow: shadowValues.shadowStart }
        }
        whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.05 }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 15 },
          scale: { type: "spring", stiffness: 300, damping: 15 },
          boxShadow: {
            duration: 1.8,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          },
        }}
        aria-label={`${category} category`}
      >
        <motion.span
          animate={
            isHovered && !prefersReducedMotion
              ? { rotate: [-6, 0, 6, 0, -6] }
              : { rotate: 0 }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1,
          }}
          aria-hidden="true"
        >
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
        </motion.span>
        <span>{category}</span>
      </motion.div>
    );
  }
);
CategoryBadge.displayName = "CategoryBadge";

const sharedAnimations = {
  card: {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: delay * 0.12,
        ease: [0.25, 1, 0.5, 1],
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    }),
    hover: {
      scale: 1.025,
      transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  icon: {
    hidden: { scale: 0.7, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 150, damping: 15 },
    },
  },
  text: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
};

const BentoCard = memo(({ item, scrollYProgress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const IconComponent = LucideIconsMap[item.icon];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: item.delay,
        ease: "easeOut",
      },
    },
  };

  const hoverVariants = prefersReducedMotion
    ? {}
    : {
        hover: {
          y: -8,
          scale: 1.02,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        },
      };

  return (
    <motion.div
      className={`relative group cursor-pointer transition-all duration-300 ${item.gridClass}`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="article"
      aria-label={`${item.title} - ${item.description}`}
      tabIndex={0}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-6 h-full transition-all duration-300 bg-gradient-to-br ${item.color.bg} border border-transparent hover:border-opacity-50 shadow-sm hover:shadow-lg`}
        style={{
          borderColor: isHovered || isFocused ? item.color.border : "transparent",
        }}
      >
        {/* Badge */}
        <CategoryBadge
          category={item.category}
          accentColor={item.color.accent}
          badgeIcon={item.badgeIcon}
          isHovered={isHovered}
          borderColor={item.color.border}
        />

        {/* Icon */}
        <div className="mt-4 mb-4">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300`}
            style={{
              backgroundColor: `${item.color.accent}20`,
              color: item.color.accent,
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <IconComponent className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3
            className={`text-xl font-semibold transition-colors duration-300 ${item.color.text}`}
          >
            {item.title}
          </h3>
          <p className={`text-sm leading-relaxed transition-colors duration-300 ${item.color.text} opacity-80`}>
            {item.description}
          </p>
        </div>

        {/* Hover effect overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
});
BentoCard.displayName = "BentoCard";

const SectionHeader = memo(
  ({ id, title, subtitle, scrollYProgress, isInView }) => {
    const prefersReducedMotion = useReducedMotion();
    const titleY = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion ? [0, 0] : [0, -20]
    );
    const subtitleY = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion ? [0, 0] : [0, -10]
    );

    return (
      <div className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SectionLabel
            text="Why Choose ProductBazar"
            size="medium"
            alignment="center"
            animate={!prefersReducedMotion}
            variant="vibrant"
            glowEffect={true}
            gradientText={true}
            animationStyle="bounce"
          />
        </motion.div>

        <motion.h2
          id={id}
          className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{ y: prefersReducedMotion ? 0 : titleY }}
        >
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h2>

        <motion.p
          className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          style={{ y: prefersReducedMotion ? 0 : subtitleY }}
        >
          {subtitle}
        </motion.p>
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

const Background = memo(({ scrollYProgress, prefersReducedMotion }) => {
  const gridY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -40]
  );

  const useBlobTransform = (yOffset, xOffset, scaleRange) => {
    const y = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion ? [0, 0] : [0, yOffset]
    );
    const x = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion ? [0, 0] : [0, xOffset]
    );
    const scale = useTransform(
      scrollYProgress,
      [0, 0.5, 1],
      prefersReducedMotion ? [1, 1, 1] : scaleRange
    );
    return { y, x, scale };
  };

  const blob1 = useBlobTransform(-45, 30, [0.85, 1.15, 0.85]);
  const blob2 = useBlobTransform(45, -30, [0.9, 1.1, 0.9]);
  const blob3 = useBlobTransform(25, -15, [0.95, 1.05, 0.95]);

  const lightGridLineColor = "rgba(148, 163, 184, 0.4)"; // Slate-400 @ 40%
  const lightGridLineColorLarge = "rgba(148, 163, 184, 0.5)"; // Slate-400 @ 50%

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute inset-0"
        style={{ y: gridY }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, rgba(241, 245, 249, 0.1) 0%, rgba(241, 245, 249, 1) 80%)`, // slate-100 base
          }}
        />

        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `linear-gradient(to right, ${lightGridLineColor} 1px, transparent 1px),
                             linear-gradient(to bottom, ${lightGridLineColor} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `linear-gradient(to right, ${lightGridLineColorLarge} 1px, transparent 1px),
                             linear-gradient(to bottom, ${lightGridLineColorLarge} 1px, transparent 1px)`,
            backgroundSize: "160px 160px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
      </motion.div>

      {[blob1, blob2, blob3].map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full
            ${index === 0 ? "top-5 right-[2%] w-80 h-80 sm:w-96 sm:h-96" : ""}
            ${
              index === 1
                ? "-bottom-28 left-[-2%] w-72 h-72 sm:w-80 sm:h-80"
                : ""
            }
            ${
              index === 2
                ? "top-[30%] left-[10%] w-56 h-56 sm:w-64 sm:h-64 hidden md:block"
                : ""
            }`}
          style={{
            background:
              index % 2 === 0
                ? "linear-gradient(135deg, rgba(196,181,253,0.18) 0%, rgba(139,92,246,0.18) 100%)"
                : "linear-gradient(135deg, rgba(147,197,253,0.15) 0%, rgba(59,130,246,0.15) 100%)",
            opacity: index === 2 ? 0.25 : 0.3,
            y: blob.y,
            x: blob.x,
            scale: blob.scale,
            filter: "blur(90px)",
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
});
Background.displayName = "Background";

function Why() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001,
  });

  const isInView = useInView(sectionRef, { amount: 0.15, once: false });
  const headingId = "why-product-bazar-heading";

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className="relative overflow-hidden py-12 sm:py-16 bg-white"
    >
      <Background
        scrollYProgress={smoothScrollYProgress}
        prefersReducedMotion={prefersReducedMotion}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          id={headingId}
          title="Why ProductBazar?"
          subtitle="Unlock your product's full potential with our innovative platform designed for the needs of modern creators and developers. Experience strategic advantages that go beyond traditional launch platforms."
          scrollYProgress={smoothScrollYProgress}
          isInView={isInView}
        />

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-7 mb-14 sm:mb-16"
          role="list"
          aria-label="Strategic advantages of ProductBazar"
        >
          <AnimatePresence>
            {advantageData.map((item) => (
              <BentoCard
                key={item.id}
                item={item}
                scrollYProgress={smoothScrollYProgress}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{
            duration: 0.6,
            delay: 0.5 + advantageData.length * 0.05,
          }}
          className="text-center"
        >
          <motion.div
            className="inline-block"
            whileHover={{
              scale: 1.03,
              transition: { type: "spring", stiffness: 250, damping: 12 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <GlobalButton
              variant="primary"
              size="lg"
              magneticEffect={true}
              ariaLabel="Submit your product to ProductBazar and start your journey"
              icon="ArrowRight"
              iconPosition="right"
              href="/product/new"
            >
              Submit Your Product
            </GlobalButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Why;