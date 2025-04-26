import {
  useRef,
  useEffect,
  useState,
  memo,
  useCallback,
  createRef,
  lazy,
  Suspense,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
  UserCircle,
  Search,
  MessageSquareShare,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Users2Icon,
  RocketIcon,
  ChartAreaIcon,
  LightbulbIcon,
  Code,
  Layers,
  Wallet,
  Compass,
  ExternalLink,
} from "lucide-react";
import GlobalButton from "../../UI/Buttons/GlobalButton";
import Image from "next/image";
import { useTheme } from "next-themes";

// Lazy loaded components for better performance
const LazyImage = lazy(() => import("next/image"));

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Optimized element visibility hook
const useElementInView = (options = {}) => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: options.once || false,
    threshold: options.threshold || 0.1,
    margin: options.margin || undefined,
  });

  return [ref, inView];
};

// Memoized counter component for better performance
const Counter = memo(({ from, to, duration = 2 }) => {
  const nodeRef = useRef(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (inView && nodeRef.current) {
      if (prefersReducedMotion) {
        // For users who prefer reduced motion, just show the final value
        nodeRef.current.textContent = to;
        return;
      }

      let startValue = from;
      const increment = (to - from) / (duration * 60);
      const timer = setInterval(() => {
        startValue += increment;
        nodeRef.current.textContent = Math.floor(startValue);
        if (startValue >= to) {
          nodeRef.current.textContent = to;
          clearInterval(timer);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, from, to, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className="inline-block">
      <span ref={nodeRef} className="font-semibold tabular-nums">
        {from}
      </span>
    </span>
  );
});

Counter.displayName = "Counter";

// Optimized progress bar component
const ProgressBar = memo(({ progress }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full progress-gradient"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: prefersReducedMotion ? 0.1 : 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

// Memoized icon wrapper for performance
const AnimatedIcon = memo(({ icon }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="w-10 h-10 rounded-md flex items-center justify-center bg-violet-500/10 dark:bg-violet-400/20 text-violet-600 dark:text-violet-300 shrink-0"
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {icon}
    </motion.div>
  );
});

AnimatedIcon.displayName = "AnimatedIcon";

const gradientBG =
  "bg-gradient-to-r from-violet-500/20 to-indigo-500/40 dark:from-violet-600/30 dark:to-indigo-600/50";

// Skeleton loader for image placeholders
const ImageSkeleton = () => (
  <div className="w-full h-full min-h-[250px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
);

// New Component: Rich content box for alternating with images
const ContentBox = memo(({ index, inView }) => {
  const prefersReducedMotion = useReducedMotion();

  // Different content variations based on step index
  const contentData = [
    {}, // Placeholder for step 1 (will be an image)
    {
      title: "Seamless Discovery",
      icon: <Compass className="w-5 h-5" />,
      features: [
        "Personalized recommendations based on your interests",
        "Advanced filtering and sorting options",
        "Save favorites to curated collections",
      ],
      action: "Start exploring",
    },
    {}, // Placeholder for step 3 (will be an image)
    {
      title: "Accelerate Growth",
      icon: <ChartAreaIcon className="w-5 h-5" />,
      features: [
        "Detailed analytics and performance tracking",
        "Connect with potential investors and partners",
        "Access marketing tools and resources",
      ],
      action: "Scale your product",
    },
  ];

  const data = contentData[index];
  if (!data.title) return null; // Return null for steps that should show images

  return (
    <motion.div
      className="w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.6, delay: 0.3 }}
    >
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg group hover:border-violet-500/30 transition-all duration-300 shadow-sm hover:shadow-lg">
        {/* Top accent */}
        <div className={`h-1 w-full ${gradientBG}`} />

        <div className="p-6">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-10 h-10 rounded-full bg-violet-500/10 dark:bg-violet-400/10 flex items-center justify-center text-violet-600 dark:text-violet-300"
              initial={{ rotate: -5 }}
              whileHover={{ rotate: 0, scale: prefersReducedMotion ? 1 : 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {data.icon}
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.title}
            </h3>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 mb-5">
            {data.features.map((feature, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.4 + i * 0.1,
                }}
              >
                <CheckCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Action button */}
          <motion.button
            className="w-full py-2.5 px-4 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-medium rounded-md text-sm flex items-center justify-center gap-2 transition-colors duration-300 group"
            whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
            aria-label={data.action}
          >
            <span>{data.action}</span>
            <motion.span
              animate={prefersReducedMotion ? {} : { x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Decorative pattern behind the box */}
      <div className="absolute top-12 -right-6 w-20 h-20 border border-dashed border-violet-500/20 rounded-full -z-10 opacity-50" />
      <div className="absolute -bottom-4 -left-4 w-12 h-12 border border-dashed border-indigo-500/20 rounded-full -z-10 opacity-50" />
    </motion.div>
  );
});

ContentBox.displayName = "ContentBox";

// New Component: Image display component
const StepImage = memo(({ index, inView }) => {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Different images & styles based on step index
  const imageData = [
    {
      src: "https://res.cloudinary.com/dgak25skk/image/upload/v1745652131/macbook-pb1_lswn7v.png",
      alt: "User profile creation interface",
      width: 500,
      height: 350,
      style: "shadow",
    },
    {}, // Placeholder for step 2 (will be content box)
    {
      src: "https://res.cloudinary.com/dgak25skk/image/upload/v1745653024/raw_fmkvpv.png",
      alt: "Product engagement dashboard",
      width: 500,
      height: 350,
      style: "float",
    },
    {}, // Placeholder for step 4 (will be content box)
  ];

  const data = imageData[index];
  if (!data.src) return null; // Return null for steps that should show content

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto flex items-center justify-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.7, delay: 0.2 }}
    >
      <div className={`relative`}>
        {/* Main image */}
        <div className={`relative overflow-hidden rounded-lg`}>
          <Suspense fallback={<ImageSkeleton />}>
            <LazyImage
              src={data.src}
              alt={data.alt}
              width={data.width}
              height={data.height}
              className="w-full h-auto object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </Suspense>

          {/* Overlay effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
            whileHover={{ opacity: 0.2 }}
          />
        </div>

        {/* Decorative elements */}
        {data.style === "float" && (
          <>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-violet-500/5 rounded-full -z-10" />
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-indigo-500/5 rounded-full -z-10" />
          </>
        )}

        {data.style === "shadow" && (
          <motion.div
            className="absolute -z-10 inset-0 bg-violet-500/20 blur-xl opacity-30 scale-95"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    opacity: [0.2, 0.3, 0.2],
                    scale: [0.94, 0.96, 0.94],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
      </div>

      {/* Caption below image */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 opacity-70">
        {data.alt}
      </div>
    </motion.div>
  );
});

StepImage.displayName = "StepImage";

const Impact = () => {
  // Refs and state
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineMarkersRef = useRef([]);
  const underlineRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [containerRef1, containerInView] = useElementInView();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  
  // Ref for tracking section scroll position for tooltip visibility
  const sectionRef = useRef(null);
  
  // Set up scroll tracking for tooltip visibility
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"] 
  });
  
  // Transform scroll progress to tooltip opacity
  // Will be 0 when out of section, 1 when in section
  const tooltipOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1], // Input range (scroll positions)
    [0, 1, 1, 0]      // Output range (opacity values)
  );

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    if (typeof window !== "undefined") {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkMobile);
      }
    };
  }, []);

  // Data structure for steps
  const stepsData = [
    {
      number: 1,
      title: "Join & Create Profile",
      subtitle: "Free",
      description:
        "Create your free account in minutes. Define your role (Maker, Discoverer, Investor, etc.) for a tailored experience and personalized recommendations.",
      icon: <UserCircle className="w-5 h-5" />,
      stats: [
        { value: 3, label: "minutes setup" },
        { value: 100, label: "% personalized" },
      ],
    },
    {
      number: 2,
      title: "Showcase & Explore",
      subtitle: "",
      description:
        "Makers: Easily submit your product with key details. Discoverers: Browse curated feeds, categories, trending lists, or search for specific solutions.",
      icon: <Search className="w-5 h-5" />,
      stats: [
        { value: 5000, label: "products" },
        { value: 24, label: "categories" },
      ],
    },
    {
      number: 3,
      title: "Engage & Connect",
      subtitle: "",
      description:
        "Upvote products you love, provide constructive feedback via comments, bookmark favorites, and connect directly with makers and other members.",
      icon: <MessageSquareShare className="w-5 h-5" />,
      stats: [
        { value: 87, label: "% engagement" },
        { value: 12000, label: "connections made" },
      ],
    },
    {
      number: 4,
      title: "Grow & Validate",
      subtitle: "",
      description:
        "Makers: Track product traction with analytics, gain insights, find collaborators. Discoverers: Build your toolkit, influence products, stay ahead of the curve.",
      icon: <TrendingUp className="w-5 h-5" />,
      stats: [
        { value: 47, label: "% growth average" },
        { value: 92, label: "% validation" },
      ],
    },
  ];

  // Optimized scroll handler
  const scrollToStep = useCallback(
    (index) => {
      const section = document.querySelectorAll(".step-section")[index];
      if (section) {
        const yOffset = -80;
        const y =
          section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({
          top: y,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [prefersReducedMotion]
  );

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setActiveStep((prev) => Math.min(prev + 1, stepsData.length - 1));
        scrollToStep(Math.min(activeStep + 1, stepsData.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveStep((prev) => Math.max(prev - 1, 0));
        scrollToStep(Math.max(activeStep - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeStep, scrollToStep, stepsData.length]);

  // Setup scroll animations with GSAP
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    const sections = gsap.utils.toArray(".step-section");
    const timeline = timelineRef.current;
    const underline = underlineRef.current;

    // Initialize timeline markers ref array
    timelineMarkersRef.current = Array(stepsData.length)
      .fill()
      .map((_, i) => timelineMarkersRef.current[i] || createRef());

    // Cleanup function for all created animations
    const cleanupFns = [];

    // Animate title underline
    if (underline) {
      const underlineTl = gsap.fromTo(
        underline,
        { width: "0%" },
        {
          width: "100%",
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: underline,
            start: "top 85%",
          },
        }
      );

      cleanupFns.push(() => underlineTl.kill());
    }

    // Reset initial states
    gsap.set(".step-card", { y: 20, opacity: 0 });
    gsap.set(".step-marker", { scale: 0.5, opacity: 0 });
    gsap.set(".stats-container", { opacity: 0, y: 10 });
    gsap.set(".timeline-marker", { scale: 0.5, opacity: 0 });
    gsap.set(".alt-content", { y: 30, opacity: 0 });

    // Clear any existing ScrollTriggers to prevent duplicates
    ScrollTrigger.getAll().forEach((t) => t.kill());

    if (sections.length > 0) {
      // Create scroll-linked animations for each step
      sections.forEach((section, i) => {
        // Step card animation with improved performance
        const cardTl = gsap.to(section.querySelector(".step-card"), {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        cleanupFns.push(() => cardTl.kill());

        // Step marker animation
        if (section.querySelector(".step-marker")) {
          const markerTl = gsap.to(section.querySelector(".step-marker"), {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            delay: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });

          cleanupFns.push(() => markerTl.kill());
        }

        // Stats animation with staggered effect
        const statsItems = section.querySelectorAll(".stat-item");
        if (statsItems.length) {
          gsap.to(statsItems, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });
        } else {
          // Fallback for the container
          const statsTl = gsap.to(section.querySelector(".stats-container"), {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });

          cleanupFns.push(() => statsTl.kill());
        }

        // Alternate content animation (image or content box)
        if (section.querySelector(".alt-content")) {
          const altContentTl = gsap.to(section.querySelector(".alt-content"), {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });

          cleanupFns.push(() => altContentTl.kill());
        }

        // Set active step based on scroll position with improved accuracy
        const stepTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
          onLeave: () =>
            i === stepsData.length - 1 ? null : setActiveStep(i + 1),
          onLeaveBack: () => (i === 0 ? null : setActiveStep(i - 1)),
        });

        cleanupFns.push(() => stepTrigger.kill());
      });

      // Timeline progress animation - IMPROVED
      if (timeline) {
        // Animate the main timeline with better positioning
        const timelineTl = gsap.fromTo(
          timeline,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              // Better start and end points for more accurate tracking
              start: "top 25%",
              end: "bottom 75%",
              scrub: 0.6, // Smoother scrubbing effect
            },
          }
        );

        cleanupFns.push(() => timelineTl.kill());

        // Improved animation for timeline markers
        document.querySelectorAll(".timeline-marker").forEach((marker, i) => {
          // Create a more precise trigger for each marker
          const markerTl = gsap.fromTo(
            marker,
            { scale: 0.5, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: "back.out(2)",
              scrollTrigger: {
                // More precise trigger using markerPosition
                trigger: sections[i],
                start: "top center",
                toggleActions: "play none none reverse",
                onEnter: () => {
                  // Enhance marker appearance when it becomes active
                  gsap.to(marker, {
                    scale: 1.2,
                    backgroundColor: "var(--primary-color)",
                    duration: 0.3,
                  });
                },
                onLeaveBack: () => {
                  // Reset when no longer active
                  gsap.to(marker, {
                    scale: 1,
                    backgroundColor: "white",
                    duration: 0.3,
                  });
                },
              },
            }
          );

          cleanupFns.push(() => markerTl.kill());
        });
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      cleanupFns.forEach((fn) => fn());
    };
  }, [stepsData.length, prefersReducedMotion]);

  // Use transform for better performance
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        containerRef1.current = el;
        sectionRef.current = el; // Add this to track section for tooltip visibility
      }}
      className="relative bg-white dark:bg-gray-900 overflow-hidden py-2"
      id="impact-section"
    >
      {/* Header section */}
      <div className="flex flex-col items-center z-10 relative">
        <motion.div
          className="w-full max-w-4xl flex flex-col items-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.8,
            ease: "easeOut",
          }}
        >
          {/* Badge with sparkle */}
          <motion.div
            className="inline-flex items-center px-5 py-2 mb-6 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/30 relative group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.6,
              delay: 0.1,
            }}
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
          >
            <motion.span
              className="absolute -right-1 -top-1 text-violet-500 dark:text-violet-300"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                    }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.span>
            <span className="text-violet-700 dark:text-violet-300 font-medium text-sm">
              Simple • Intuitive • Powerful
            </span>
          </motion.div>

          {/* Heading with improved animation */}
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-gray-900 dark:text-white relative inline-block text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.8,
              delay: 0.2,
              ease: "easeOut",
            }}
          >
            <span className="relative">
              Simple Steps to{" "}
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                Maximum Impact
                <motion.svg
                  className="absolute -bottom-2 left-0 right-0 w-full h-3 text-violet-500/30 dark:text-violet-400/30"
                  viewBox="0 0 100 10"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: prefersReducedMotion ? 0.2 : 1,
                    duration: prefersReducedMotion ? 0.3 : 1.5,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    d="M0,5 Q20,10 35,5 Q50,0 65,5 Q80,10 100,5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </span>
          </motion.h2>

          {/* Description paragraph */}
          <motion.p
            className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-center leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.8,
              delay: 0.4,
              ease: "easeOut",
            }}
          >
            Getting started on Product Bazar is fast, intuitive, and designed
            for immediate value, whether you're showcasing your innovation or
            discovering the next big thing.
          </motion.p>

          {/* Stats counter section using grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl mt-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.8,
              delay: 0.6,
              ease: "easeOut",
              staggerChildren: 0.1,
            }}
          >
            {[
              {
                value: 10000,
                label: "Active Users",
                icon: <Users2Icon className="w-4 h-4" />,
              },
              {
                value: 5000,
                label: "Products Launched",
                icon: <RocketIcon className="w-4 h-4" />,
              },
              {
                value: 94,
                label: "% Success Rate",
                icon: <ChartAreaIcon className="w-4 h-4" />,
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className={`flex flex-col items-center gap-1 px-6 py-4 relative overflow-hidden
                  ${
                    idx !== 2
                      ? "sm:border-r sm:border-gray-200 sm:dark:border-gray-800"
                      : ""
                  }
                  backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 rounded-lg
                `}
                whileHover={{
                  y: prefersReducedMotion ? 0 : -5,
                  scale: prefersReducedMotion ? 1 : 1.02,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="tabular-nums">
                    <Counter from={0} to={stat.value} duration={2.5} />
                  </span>
                  {stat.label.includes("%") ? "%" : ""}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex gap-2">
                  {stat.icon} {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Step indicators - side navigation for desktop */}
      <AnimatePresence>
        {containerInView && (
          <motion.div
            className="hidden xl:flex fixed left-8 top-1/3 -translate-y-1/2 flex-col gap-6 z-30"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, staggerChildren: 0.05 }}
            role="navigation"
            aria-label="Timeline navigation"
          >
            {stepsData.map((step, index) => (
              <motion.div
                key={index}
                className="group relative flex items-center cursor-pointer"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => scrollToStep(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={activeStep === index ? "step" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    scrollToStep(index);
                  }
                }}
              >
                {/* Vertical connecting line between indicators */}
                {index > 0 && (
                  <div
                    className={`absolute left-[19px] -top-6 w-[2px] h-6 transition-colors duration-500 ${
                      activeStep >= index
                        ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                )}

                {/* Step number indicator */}
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    activeStep >= index
                      ? "border-violet-500 bg-violet-500 text-white shadow-sm"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  animate={
                    activeStep === index && !prefersReducedMotion
                      ? { scale: [1, 1.1, 1], transition: { duration: 0.5 } }
                      : {}
                  }
                >
                  {activeStep > index ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span className="text-sm">{step.number}</span>
                  )}
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {(activeStep === index || hoveredStep === index) && (
                    <motion.div
                      className="absolute left-14 bg-white dark:bg-gray-900 py-2.5 px-4 rounded-full border border-gray-100 dark:border-gray-800 z-30"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {step.title}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central timeline */}
      <div
        className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10 timeline-container"
        style={{ top: "430px", bottom: "430px", width: "2px" }}
        aria-hidden="true"
      >
        <div className="relative w-full h-full">
          {/* Background line */}
          <div className="absolute inset-0 bg-gray-200/70 dark:bg-gray-700/70 rounded-full" />

          {/* Progress line */}
          <div
            ref={timelineRef}
            className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-violet-500 via-violet-600 to-indigo-500"
            style={{ height: "0%" }}
          />

          {/* Timeline markers */}
          {stepsData.map((_, index) => {
            // Calculate even distribution along the timeline height
            const position =
              index === 0
                ? 0
                : index === stepsData.length - 1
                ? 100
                : (100 / (stepsData.length - 1)) * index;

            return (
              <div
                key={index}
                className="timeline-marker absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-violet-500 dark:border-violet-400"
                style={{
                  top: `${position}%`,
                  opacity: 0,
                  transform: "translate(-50%, -50%) scale(0.5)",
                  zIndex: 2,
                }}
                ref={(el) => (timelineMarkersRef.current[index] = el)}
              >
                {/* Pulsing effect for active marker */}
                {activeStep === index && !prefersReducedMotion && (
                  <span className="absolute inset-[-4px] rounded-full bg-violet-500/20 animate-timeline-ping" />
                )}
              </div>
            );
          })}

          {/* Decorative dots */}
          {!prefersReducedMotion &&
            [...Array(8)].map((_, i) => (
              <div
                key={`dot-${i}`}
                className="absolute left-1/2 w-1 h-1 rounded-full bg-violet-500/40 dark:bg-violet-400/60 transform -translate-x-1/2"
                style={{
                  top: `${12 + i * 12}%`,
                  opacity: 0.5 + (i % 3) * 0.15,
                }}
              />
            ))}
        </div>
      </div>

      {/* Steps container */}
      <div className="relative z-10 max-w-6xl mx-auto mt-12">
        {stepsData.map((step, index) => {
          const [ref, inView] = useElementInView({
            threshold: 0.2,
            once: true,
          });

          return (
            <div
              key={index}
              ref={ref}
              className="step-section relative mb-24 last:mb-16 px-4"
              id={`step-${index + 1}`}
              role="region"
              aria-labelledby={`step-title-${index + 1}`}
            >
              <div className="max-w-5xl mx-auto">
                {/* Step number badge */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    className="step-marker relative w-12 h-12 flex items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 text-white z-20 shadow-md"
                    style={{
                      opacity: 0,
                      scale: 0.5,
                      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {/* Pulsing effect for active step */}
                    {activeStep === index && !prefersReducedMotion && (
                      <span className="absolute inset-0 rounded-full bg-violet-600/20 animate-ping" />
                    )}
                    <span className="text-base font-medium">{step.number}</span>
                  </motion.div>
                </div>

                {/* Content container - now with alternating content in second column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Step Card Column - always consistent */}
                  <div className={`${index % 2 !== 0 ? "md:order-2" : ""}`}>
                    <div
                      className="step-card group bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-violet-500/20 dark:hover:border-violet-500/20 hover:shadow-2xl hover:shadow-black/5"
                      style={{ opacity: 0, transform: "translateY(20px)" }}
                    >
                      {/* Card header with gradient border top */}
                      <div className={`${gradientBG} h-1`} />

                      <div className="p-6 pb-3">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <AnimatedIcon icon={step.icon} />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3
                                id={`step-title-${index + 1}`}
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                              >
                                {step.title}
                              </h3>
                              {step.subtitle && (
                                <span className="text-xs font-medium px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-300 rounded-full">
                                  {step.subtitle}
                                </span>
                              )}
                            </div>

                            {/* Progress indicator */}
                            <div className="mt-3">
                              <ProgressBar progress={25 * step.number} />
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Step {step.number} of 4
                                </span>
                                <span className="text-xs font-medium text-right text-gray-700 dark:text-gray-300">
                                  {25 * step.number}% Complete
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-4">
                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                          {step.description}
                        </p>

                        {/* Stats grid */}
                        <div
                          className="stats-container grid grid-cols-2 gap-4 mb-2"
                          style={{ opacity: 0, transform: "translateY(10px)" }}
                        >
                          {step.stats.map((stat, i) => (
                            <motion.div
                              key={i}
                              className="stat-item group relative bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-transparent transition-all duration-300 hover:border-violet-500/20 hover:-translate-y-1"
                              style={{
                                opacity: 0,
                                transform: "translateY(10px)",
                              }}
                            >
                              <div className="text-lg font-semibold text-violet-600 dark:text-violet-400 transition-transform">
                                <Counter
                                  from={0}
                                  to={stat.value}
                                  duration={1.5}
                                />
                                {stat.label.includes("%") ? "%" : ""}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stat.label}
                              </div>

                              {/* Enhanced hover effect */}
                              {!prefersReducedMotion && (
                                <motion.div
                                  className="absolute inset-0 bg-violet-500/5 rounded-lg opacity-0 z-0"
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <motion.button
                          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                            index === stepsData.length - 1
                              ? "bg-violet-600 dark:bg-violet-500 text-white shadow-sm"
                              : "text-violet-600 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15"
                          } transition-all duration-300`}
                          whileHover={{ x: prefersReducedMotion ? 0 : 3 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                          onClick={() =>
                            index < stepsData.length - 1
                              ? scrollToStep(index + 1)
                              : null
                          }
                          aria-label={
                            index < stepsData.length - 1
                              ? `Proceed to step ${index + 2}`
                              : "Get Started"
                          }
                        >
                          <span>
                            {index < stepsData.length - 1
                              ? "Next Step"
                              : "Get Started"}
                          </span>
                          <motion.div
                            animate={
                              prefersReducedMotion ? {} : { x: [0, 3, 0] }
                            }
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                            className="inline-flex ml-1.5"
                          >
                            {index < stepsData.length - 1 ? (
                              <ArrowRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </motion.div>
                        </motion.button>

                        {/* Step completion status */}
                        {activeStep > index ? (
                          <motion.div
                            className="flex items-center text-green-600 dark:text-green-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            <span className="text-sm font-medium">
                              Completed
                            </span>
                          </motion.div>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {activeStep === index ? (
                              <span className="flex items-center">
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 mr-1.5 ${
                                    !prefersReducedMotion ? "animate-pulse" : ""
                                  }`}
                                ></span>
                                In progress
                              </span>
                            ) : (
                              "Coming up"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ALTERNATING SECOND COLUMN - Now showing on mobile too */}
                  <div
                    className={
                      `${
                        index % 2 !== 0 ? "md:order-1" : ""
                      } flex items-center justify-center alt-content` /* Removed the 'hidden md:flex' to show on mobile too */
                    }
                    style={{ opacity: 0, transform: "translateY(30px)" }}
                  >
                    {/* Show image for steps 1 and 3, content box for steps 2 and 4 */}
                    {index % 2 === 0 ? (
                      <StepImage index={index} inView={inView} />
                    ) : (
                      <ContentBox index={index} inView={inView} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action */}
      <div className="flex justify-center w-full z-10 relative">
        <div className="w-full max-w-3xl mx-auto px-4">
          <motion.div
            className="rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-300">
                <LightbulbIcon className="w-5 h-5" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Join thousands of successful product makers today
              </h3>

              <p className="text-gray-400 dark:text-gray-400 mb-6 max-w-xl text-sm">
                Create your account in minutes and start showcasing your
                innovation to a community of eager discoverers, investors, and
                collaborators.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                <GlobalButton
                  variant="primary"
                  size="md"
                  ariaLabel="Submit your product to Product Bazar"
                  href="/product/new"
                >
                  <span>Submit Your Product</span>
                  <motion.span
                    className="ml-1.5 inline-block"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </GlobalButton>

                <GlobalButton
                  variant="outline"
                  size="md"
                  ariaLabel="Learn more about Product Bazar"
                  href="/about"
                >
                  Learn More
                </GlobalButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Updated keyboard navigation tooltip with scroll-based visibility */}
      <AnimatePresence>
        <motion.div
          className="hidden md:block fixed bottom-4 right-4 z-30"
          style={{ opacity: tooltipOpacity }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: tooltipOpacity, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-black rounded-full py-3 px-4 text-xs text-gray-100">
            Use arrow keys to navigate steps
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        /* CSS variables for theming */
        :root {
          --primary-color: #8b5cf6; /* Violet-500 */
          --primary-light: #a78bfa; /* Violet-400 */
          --primary-dark: #7c3aed; /* Violet-600 */
          --primary-rgb: 139, 92, 246;
          --primary-color-shadow: rgba(139, 92, 246, 0.3);

          --secondary-color: #6366f1; /* Indigo-500 */
          --secondary-light: #818cf8; /* Indigo-400 */
          --secondary-dark: #4f46e5; /* Indigo-600 */
        }

        .dark {
          --primary-color: #a78bfa; /* Violet-400 */
          --primary-light: #c4b5fd; /* Violet-300 */
          --primary-dark: #8b5cf6; /* Violet-500 */
          --primary-rgb: 167, 139, 250;
          --primary-color-shadow: rgba(167, 139, 250, 0.3);

          --secondary-color: #818cf8; /* Indigo-400 */
          --secondary-light: #a5b4fc; /* Indigo-300 */
          --secondary-dark: #6366f1; /* Indigo-500 */
        }

        /* Primary color classes */
        .bg-primary {
          background-color: var(--primary-color);
        }

        .text-primary {
          color: var(--primary-color);
        }

        .border-primary {
          border-color: var(--primary-color);
        }

        /* Enhanced animation keyframes */
        @keyframes ping {
          75%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Special animation for timeline markers */
        @keyframes timeline-ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .animate-timeline-ping {
          animation: timeline-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        /* Smooth hover transitions */
        .step-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card:hover {
          transform: translateY(-4px);
        }

        /* Progress gradient */
        .progress-gradient {
          background: linear-gradient(
            90deg,
            var(--primary-dark),
            var(--primary-color),
            var(--secondary-color)
          );
        }

        /* Focus styles for accessibility */
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        /* Better mobile scrolling */
        @media (max-width: 768px) {
          .step-card {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default Impact;