import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Target,
  MessageSquare,
  ShieldCheck,
  BrainCircuit,
  Network,
  TrendingUp, // Advantages
  Rocket,
  Sparkles, // Value Props
  CheckCircle,
  XCircle, // Lists & Table
  ArrowUp, // Product Card Upvote
  Quote, // Testimonial
  ChevronDown, // FAQ
  MessageCircle, // Floating Button
  ArrowRight, // General purpose arrow
} from "lucide-react"; // Import necessary Lucide icons

import DashboardPreview from "./DashboardPreview"; // Assuming this component exists
import HeroSection from "../../Landing/Components/HeroSection"; // Import Hero Section

// --- Animation Variants (Keep as is) ---
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// --- Custom Hook (Keep as is) ---
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

// --- Reusable Components (Using Lucide Icons internally) ---

const AdvantageCard = ({ icon: IconComponent, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 h-full flex flex-col hover:shadow-lg"
      style={{
        boxShadow: isHovered
          ? "0 10px 20px -5px rgba(0,0,0,0.07)"
          : "0 4px 6px -1px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`mb-5 p-3 rounded-full self-start ${
          isHovered
            ? "bg-violet-600 text-white"
            : "bg-violet-100 text-violet-600"
        } transition-colors duration-300`}
      >
        {/* Use Lucide Icon Component passed as prop */}
        <IconComponent className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed flex-grow">
        {description}
      </p>
    </motion.div>
  );
};

const HowItWorksStep = ({ number, title, description }) => {
  const [ref, isVisible] = useScrollAnimation(0.3);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center md:items-start text-center md:text-left relative pb-10 md:pb-0"
    >
      <div className="relative mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : { scale: 0 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-semibold shadow-md"
        >
          {number}
        </motion.div>
        {/* Connector Lines (Keep as is) */}
        {number < 4 && (
          <div
            className="absolute top-1/2 left-full h-[2px] w-full bg-gray-200 hidden xl:block"
            style={{ transform: "translateY(-1px)" }}
          >
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-full bg-gradient-to-r from-violet-300 to-violet-500"
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + (number - 1) * 0.1,
                    ease: "circOut",
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        )}
        {number < 4 && (
          <div
            className="absolute top-full left-1/2 h-10 w-[2px] bg-gray-200 block md:hidden"
            style={{ transform: "translateX(-1px)" }}
          >
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  className="w-full bg-gradient-to-b from-violet-300 to-violet-500"
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + (number - 1) * 0.1,
                    ease: "circOut",
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 + (number - 1) * 0.1 }}
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 + (number - 1) * 0.1 }}
        className="text-gray-600 text-sm leading-relaxed"
      >
        {description}
      </motion.p>
    </div>
  );
};

const ProductCard = ({
  imageUrl,
  category,
  name,
  tagline,
  upvotes,
  comments,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Tilt effect logic (Keep as is or simplify/remove)
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / (width / 2);
    const y = (clientY - top - height / 2) / (height / 2);
    cardRef.current.style.transform = `perspective(1000px) rotateY(${
      x * 3
    }deg) rotateX(${-y * 3}deg) scale3d(1.02, 1.02, 1.02)`;
    cardRef.current.style.transition = "transform 0.1s ease-out";
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    cardRef.current.style.transition = "transform 0.4s ease-out";
    setIsHovered(false); // Also set hover state false here
  };

  return (
    <motion.div
      ref={cardRef}
      variants={fadeInUp}
      className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 ease-out group hover:shadow-md"
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${name} screenshot`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="inline-block bg-violet-100 text-violet-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 self-start ring-1 ring-inset ring-violet-200">
          {category}
        </span>
        <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">
          {tagline}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Upvote Icon */}
            <div className="flex items-center space-x-1 text-violet-600 transition-colors group-hover:text-violet-700">
              <ArrowUp size={16} strokeWidth={2.5} /> {/* Lucide Icon */}
              <span className="font-medium">{upvotes}</span>
            </div>
            {/* Comment Icon */}
            <div className="flex items-center space-x-1 text-gray-400 transition-colors group-hover:text-gray-500">
              <MessageSquare size={16} strokeWidth={2} /> {/* Lucide Icon */}
              <span>{comments}</span>
            </div>
          </div>
          <a
            href="#" // Replace with actual link
            className="text-violet-600 hover:text-violet-800 text-xs font-semibold transition-all flex items-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300 ease-out"
          >
            View Details
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              className="ml-1 transition-transform duration-300 group-hover:translate-x-0.5"
            />{" "}
            {/* Lucide Icon */}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const ValuePropositionCard = ({
  icon: IconComponent, // Expecting a Lucide component
  title,
  subtitle,
  listItems,
  buttonText,
  buttonHref = "#",
  isPrimaryCta,
  id,
}) => (
  <motion.div
    id={id}
    variants={fadeInUp}
    className="bg-gradient-to-br from-white to-gray-50/50 p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full backdrop-blur-sm hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-5">
      <div className="p-3 rounded-full bg-violet-100 text-violet-600 mr-4 ring-4 ring-violet-50">
        <IconComponent size={28} strokeWidth={1.5} /> {/* Use Lucide Icon */}
      </div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-lg text-gray-700 font-medium mb-6">{subtitle}</p>
    <ul className="space-y-3 text-gray-600 text-sm mb-8 flex-grow">
      {listItems.map((item, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle
            size={20}
            className="text-violet-600 mr-2 flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />{" "}
          {/* Lucide Icon */}
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <AnimatedButton
      primary={isPrimaryCta}
      href={buttonHref}
      className="w-full mt-auto text-sm"
    >
      {buttonText}
    </AnimatedButton>
  </motion.div>
);

const TestimonialCard = ({ quote, name, title, company }) => (
  <motion.div
    variants={fadeInUp}
    className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg relative overflow-hidden h-full flex flex-col"
    whileHover={{ y: -5, scale: 1.01, shadow: "xl" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="absolute -top-4 -left-4 w-16 h-16 text-violet-100 opacity-80 z-0">
      {/* Lucide Quote Icon */}
      <Quote className="w-full h-full" strokeWidth={1} fill="currentColor" />
    </div>
    <blockquote className="text-gray-700 mb-6 leading-relaxed italic text-sm relative z-10 flex-grow">
      “{quote}”
    </blockquote>
    <div className="flex items-center relative z-10 mt-auto">
      <div className="w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium text-lg ring-2 ring-white flex-shrink-0">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-500">
          {title}, {company}
        </p>
      </div>
    </div>
  </motion.div>
);

const ParallaxBackgroundSection = ({
  children,
  className = "",
  bgColor = "bg-gradient-to-br from-violet-100/30 to-purple-100/30",
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className={`absolute inset-0 z-0 ${bgColor}`}
        style={{ y }}
        aria-hidden="true"
      >
        {/* Subtle pattern (Keep as is) */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238A2BE2' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        ></div>
      </motion.div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const AnimatedButton = ({ primary, children, className = "", href = "#" }) => {
  // Check if children ends with '→' to potentially add ArrowRight icon
  const showArrow = typeof children === "string" && children.endsWith("→");
  const buttonText = showArrow ? children.slice(0, -1).trim() : children; // Remove arrow if present

  return (
    <motion.a
      href={href}
      whileHover={{
        scale: 1.03,
        y: -2,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center px-8 py-3 text-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out text-base ${
        primary
          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:from-violet-700 hover:to-purple-700 hover:shadow-lg"
          : "bg-white text-violet-600 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
      } ${className}`}
    >
      {buttonText}
      {showArrow && (
        <ArrowRight size={18} className="ml-2" strokeWidth={2.5} />
      )}{" "}
      {/* Add Lucide Arrow */}
    </motion.a>
  );
};

const FeatureComparisonTable = () => {
  const [ref, isVisible] = useScrollAnimation(0.3);

  const features = [
    {
      name: "Targeted Tech Ecosystem Focus",
      productBazar: true,
      others: false,
    },
    {
      name: "Quality-Focused Feedback Loop",
      productBazar: true,
      others: false,
    },
    {
      name: "Early Traction & Validation Signals",
      productBazar: true,
      others: false,
    },
    { name: "AI-Driven Curated Discovery", productBazar: true, others: false },
    {
      name: "Integrated Network Opportunities",
      productBazar: true,
      others: false,
    },
    {
      name: "Professional Showcase Platform",
      productBazar: true,
      others: true,
    },
    {
      name: "Full Innovation Lifecycle Support",
      productBazar: true,
      others: false,
    },
  ];

  const Mark = ({ isCheck, delay = 0, isVariable = false }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={isVisible ? { scale: 1, opacity: 1 } : {}}
      transition={{
        duration: 0.3,
        delay: delay,
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
      className="flex justify-center items-center"
    >
      {isVariable ? (
        <span className="text-xs text-gray-400 italic">Variable</span>
      ) : isCheck ? (
        <CheckCircle size={22} className="text-green-500" strokeWidth={2} />
      ) : (
        <XCircle size={22} className="text-red-400" strokeWidth={2} />
      )}
    </motion.div>
  );

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden max-w-4xl mx-auto mt-12 mb-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Feature
          </div>
          <div className="py-4 px-6 text-center text-xs font-semibold text-violet-700 uppercase tracking-wider">
            Product Bazar
          </div>
          <div className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Other Platforms
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.08 + 0.2 }}
              className="grid grid-cols-3 hover:bg-violet-50/30 transition-colors duration-150 items-center"
            >
              <div className="py-4 px-6 text-left text-gray-700 text-sm font-medium">
                {feature.name}
              </div>
              <div className="py-4 px-6">
                <Mark
                  isCheck={feature.productBazar}
                  delay={index * 0.08 + 0.3}
                />
              </div>
              <div className="py-4 px-6">
                {/* Simplified logic based on your table */}
                <Mark
                  isCheck={feature.others}
                  isVariable={
                    feature.name === "Quality-Focused Feedback Loop" ||
                    feature.name === "Curated Discovery Engine"
                  } // Assuming variable for these two
                  delay={index * 0.08 + 0.35}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const AnimatedStatCounter = ({
  value,
  label,
  suffix = "",
  prefix = "",
  delay = 0,
}) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollAnimation(0.5);
  const initialValue = 0;

  useEffect(() => {
    let counter;
    if (isVisible) {
      const animationDuration = 1500;
      const framesPerSecond = 60;
      const totalFrames = Math.round(
        (animationDuration / 1000) * framesPerSecond
      );
      let frame = 0;

      counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutProgress = ((t) => --t * t * t + 1)(progress);
        setCount(
          Math.round(initialValue + (value - initialValue) * easeOutProgress)
        );

        if (frame >= totalFrames) {
          clearInterval(counter);
          setCount(value);
        }
      }, animationDuration / totalFrames);
    }

    return () => {
      if (counter) clearInterval(counter);
    };
  }, [isVisible, value, initialValue]);

  return (
    <div ref={ref} className="text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
        className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2"
      >
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: delay + 0.2, ease: "easeOut" }}
        className="text-xs text-gray-500 uppercase tracking-wider font-medium"
      >
        {label}
      </motion.p>
    </div>
  );
};

const FaqItemWithState = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="border-b border-gray-200 last:border-b-0"
    >
      <h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full py-6 text-left text-gray-800 hover:text-violet-600 transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-md"
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${question.replace(/\s+/g, "-")}`}
        >
          <span className="text-md lg:text-lg font-medium">{question}</span>
          <span
            className={`ml-6 flex-shrink-0 flex items-center text-violet-400 group-hover:text-violet-600 transform transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : "rotate-0" // Corrected rotation
            }`}
          >
            {/* Lucide Chevron Icon */}
            <ChevronDown size={20} strokeWidth={2.5} />
          </span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${question.replace(/\s+/g, "-")}`}
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {
                opacity: 1,
                height: "auto",
                marginTop: "-0.5rem",
                paddingBottom: "1.25rem",
                transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
              },
              collapsed: {
                opacity: 0,
                height: 0,
                marginTop: "0rem",
                paddingBottom: "0rem",
                transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
              },
            }}
            className="overflow-hidden"
            role="region"
          >
            <div className="text-sm text-gray-600 leading-relaxed pr-12">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FloatingHelpButton = () => (
  <motion.div
    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
    initial={{ scale: 0, opacity: 0, rotate: -90 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    transition={{
      delay: 1.5,
      duration: 0.4,
      type: "spring",
      stiffness: 200,
      damping: 15,
    }}
  >
    <button
      aria-label="Contact Support"
      className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
    >
      {/* Lucide Chat Icon */}
      <MessageCircle size={24} strokeWidth={2} />
    </button>
  </motion.div>
);

// --- MAIN PBLANDING COMPONENT ---
const PBLanding = () => {
  // Placeholder Image URL Function
  const placeholderImageUrl = (id) =>
    `https://images.unsplash.com/photo-1601158935942-52255782d322?q=80&w=2691&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`; // Added 'software' keyword

  // Map Advantage Titles to Lucide Icons
  const advantageIcons = {
    "Targeted Tech Exposure": Target, // Target icon for exposure
    "High-Quality Feedback Loop": MessageSquare, // Message icon for feedback
    "Enhanced Credibility & Trust": ShieldCheck, // Shield icon for trust/credibility
    "AI-Powered Discovery Engine": BrainCircuit, // Brain icon for AI/Discovery
    "Strategic Ecosystem Connections": Network, // Network icon for connections
    "Early Traction & Market Validation": TrendingUp, // Chart/Trend icon for validation
  };

  // Define Icons for Value Proposition Cards using Lucide
  const founderIcon = Rocket; // Rocket for launch/growth
  const enthusiastIcon = Sparkles; // Sparkles for discovery/enthusiasm

  // FAQ Content Array (Keep as is from previous update)
  const faqData = [
    {
      question: "What makes Product Bazar different from other platforms?",
      answer: (
        <p>
          We differentiate through our{" "}
          <strong>dedicated focus on the tech ecosystem</strong> (SaaS, AI, Dev
          Tools, No-Code), facilitating <strong>quality interactions</strong>{" "}
          beyond simple discovery (feedback, connections), providing{" "}
          <strong>early validation signals</strong> (upvotes, analytics), using{" "}
          <strong>AI for smarter discovery</strong>, and building an{" "}
          <strong>integrated network</strong> for founders, users, investors,
          talent, and agencies. It's about supporting the <i>entire</i>{" "}
          innovation lifecycle, not just a launch day.
        </p>
      ),
    },
    {
      question: "Who is Product Bazar for?",
      answer: (
        <p>
          It's designed for <strong>tech startups/founders</strong> launching
          products, <strong>users/tech enthusiasts</strong> seeking innovative
          solutions, <strong>investors</strong> looking for validated
          opportunities, <strong>skilled professionals</strong> seeking roles in
          tech startups, and <strong>agencies/freelancers</strong> looking for
          tools or partners within the ecosystem.
        </p>
      ),
    },
    {
      question: "What benefits do *users* (Discoverers & Enthusiasts) get?",
      answer: (
        <p>
          Users discover cutting-edge, often early-stage software solutions they
          might not find elsewhere. They can{" "}
          <strong>directly influence products</strong> through feedback,{" "}
          <strong>connect with makers</strong>, stay informed about relevant
          tech trends via <strong>AI-powered recommendations</strong>, and build
          their professional toolkit with{" "}
          <strong>community-vetted tools</strong>.
        </p>
      ),
    },
    {
      question: "How do you ensure the quality of products and feedback?",
      answer: (
        <p>
          Quality is fostered through a <strong>curated community</strong> of
          tech-focused individuals, clear <strong>submission guidelines</strong>{" "}
          for makers, structured <strong>feedback mechanisms</strong> (comments,
          upvotes with context planned), and ongoing <strong>moderation</strong>{" "}
          and feature enhancements focused on constructive, valuable
          interaction.
        </p>
      ),
    },
    {
      question: "Is my intellectual property safe when I submit a product?",
      answer: (
        <p>
          Absolutely. You control the information you share publicly (name,
          description, links, images). Your core IP remains yours. We provide
          the platform for discovery and connection based on the details you{" "}
          <i>choose</i> to showcase. We don't claim ownership of your IP. Please
          review our Terms and Privacy Policy for details.
        </p>
      ),
    },
    {
      question: "Is Product Bazar free to use?",
      answer: (
        <p>
          Yes, the core functionalities – launching, discovering, upvoting,
          commenting, basic analytics, and connecting – are{" "}
          <strong>free</strong> for all members of the ecosystem. We plan to
          introduce optional premium features for advanced analytics, promotion,
          or enterprise needs in the future to support the platform's growth.
        </p>
      ),
    },
    {
      question: "How does the recommendation system work?",
      answer: (
        <p>
          Our AI-powered system analyzes product categories, tags, user
          interactions (views, upvotes), explicitly stated interests (if
          provided), and community trends (like trending or newly launched
          products) to provide personalized and relevant suggestions, helping
          you discover products you'll love.
        </p>
      ),
    },
    {
      question: "Why should I join now if the platform is still evolving?",
      answer: (
        <p>
          Joining early gives you a significant advantage:{" "}
          <strong>establish your presence</strong> first, build{" "}
          <strong>foundational connections</strong> across the growing network,
          directly <strong>influence the platform's development</strong> with
          your feedback, and maximize the benefits of{" "}
          <strong>network effects</strong> as the community expands. Be an early
          pillar of the ecosystem!
        </p>
      ),
    },
  ];

  return (
    <div className="bg-white font-sans antialiased text-gray-800 selection:bg-violet-100 selection:text-violet-800">
      <FloatingHelpButton />

      {/* === Hero Section === */}
      {/* The Hero Section component is now included here */}
      {/* <HeroSection /> */}

      {/* Main content starts after Hero */}
      <main className="relative z-10">
        {/* === Why Product Bazar? Section === */}
        <motion.section
          id="why-us"
          className="bg-white py-24 md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6">
            <motion.div
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
            >
              <span className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                Why Product Bazar?
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.85rem] font-bold text-gray-900 mb-4 leading-tight">
                Unlock Your Innovation Potential.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We provide the focused environment, smart tools, and vibrant
                community needed to accelerate growth, gain critical insights,
                and build meaningful connections within the tech landscape. Go
                beyond just launching – thrive throughout the innovation
                lifecycle.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Use the advantageIcons map */}
              <AdvantageCard
                icon={advantageIcons["Targeted Tech Exposure"]}
                title="Targeted Tech Exposure"
                description="Reach genuinely engaged early adopters, potential customers, and tech enthusiasts actively seeking new SaaS, AI, Dev Tools, and No-Code solutions."
              />
              <AdvantageCard
                icon={advantageIcons["High-Quality Feedback Loop"]}
                title="High-Quality Feedback Loop"
                description="Gather specific, actionable insights from a knowledgeable community to refine your product, iterate faster, and build a stronger roadmap."
              />
              <AdvantageCard
                icon={advantageIcons["Enhanced Credibility & Trust"]}
                title="Enhanced Credibility & Trust"
                description="Showcase your product on a professional, curated platform, building trust and signaling quality to users, stakeholders, and potential investors."
              />
              <AdvantageCard
                icon={advantageIcons["AI-Powered Discovery Engine"]}
                title="AI-Powered Discovery Engine"
                description="Find relevant, cutting-edge tools and software quickly through curated feeds, personalized recommendations, and smart filtering based on your interests."
              />
              <AdvantageCard
                icon={advantageIcons["Strategic Ecosystem Connections"]}
                title="Strategic Ecosystem Connections"
                description="Network with fellow founders, potential partners, skilled talent, and investors within a supportive, tech-focused community."
              />
              <AdvantageCard
                icon={advantageIcons["Early Traction & Market Validation"]}
                title="Early Traction & Market Validation"
                description="Gain tangible proof of interest, user engagement (upvotes, views, comments), and valuable analytics to validate your ideas and attract further opportunities."
              />
            </div>
          </div>
        </motion.section>

        {/* === How It Works Section === */}
        <motion.section
          id="how-it-works"
          className="bg-gradient-to-b from-gray-50/50 to-white py-24 md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="mx-auto px-6">
            <motion.div
              variants={fadeInUp}
              className="text-center max-w-2xl mx-auto mb-16 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-[2.85rem] font-bold text-gray-900 mb-4 leading-tight">
                Simple Steps to Maximum Impact.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Getting started on Product Bazar is fast, intuitive, and
                designed for immediate value, whether you're showcasing or
                discovering.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-12 relative max-w-6xl mx-auto">
              <HowItWorksStep
                number="1"
                title="Join & Profile (Free)"
                description="Create your free account in minutes. Define your role (Maker, Discoverer, Investor, etc.) for a tailored experience and personalized recommendations."
              />
              <HowItWorksStep
                number="2"
                title="Showcase / Explore"
                description={
                  <>
                    <strong>Makers:</strong> Easily submit your product with key
                    details.
                    <br />
                    <strong>Discoverers:</strong> Browse curated feeds,
                    categories, trending lists, or search for specific
                    solutions.
                  </>
                }
              />
              <HowItWorksStep
                number="3"
                title="Engage & Connect"
                description="Upvote products you love, provide constructive feedback via comments, bookmark favorites, and connect directly with makers and other members."
              />
              <HowItWorksStep
                number="4"
                title="Grow & Validate"
                description={
                  <>
                    <strong>Makers:</strong> Track product traction with
                    analytics, gain insights, find collaborators.
                    <br />
                    <strong>Discoverers:</strong> Build your toolkit, influence
                    products, stay ahead of the curve.
                  </>
                }
              />
            </div>
          </div>
        </motion.section>

        {/* === Dashboard Preview Integration === */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto px-6 text-center max-w-6xl">
            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
            >
              A Glimpse Inside Product Bazar
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-lg text-gray-600 mb-12 leading-relaxed"
            >
              Experience a platform designed for clarity and action. Manage your
              products, track analytics, engage with feedback, and discover
              effortlessly.
            </motion.p>
            <DashboardPreview />
          </div>
        </section>

        {/* === Spotlight Section === */}
        <motion.section
          id="spotlight"
          className="bg-gray-50 py-24 md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6">
            <motion.div
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
            >
              <span className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                Spotlight
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.85rem] font-bold text-gray-900 mb-4 leading-tight">
                Innovation Taking Flight.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Explore curated SaaS, AI, Dev Tools, and No-Code solutions
                gaining traction and solving real problems within the Product
                Bazar community.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <ProductCard
                imageUrl="https://images.unsplash.com/photo-1601158935942-52255782d322?q=80&w=2691&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                category="AI / Dev Tools"
                name="CodePilot AI Assist"
                tagline="Intelligent code completion and review powered by AI."
                upvotes={312}
                comments={28}
              />
              <ProductCard
                imageUrl="https://plus.unsplash.com/premium_photo-1661962960694-0b4ed303744f?q=80&w=3135&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                category="SaaS / Productivity"
                name="FlowState Task Manager"
                tagline="Seamlessly manage projects and tasks with intuitive workflows."
                upvotes={280}
                comments={19}
              />
              <ProductCard
                imageUrl="https://images.unsplash.com/photo-1639395241103-9c855f93a90c?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                category="No-Code / Automation"
                name="Connecta Bridge"
                tagline="Visually integrate your favorite apps without writing code."
                upvotes={450}
                comments={35}
              />
              <ProductCard
                imageUrl="https://images.unsplash.com/photo-1648134859177-66e35b61e106?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                category="AI / Analytics"
                name="Insight Engine Pro"
                tagline="Uncover deep customer insights automatically from your data."
                upvotes={395}
                comments={41}
              />
            </div>
            <motion.div variants={fadeInUp} className="text-center mt-16">
              <AnimatedButton href="#explore" primary={false}>
                Explore All Innovations →
              </AnimatedButton>
            </motion.div>
          </div>
        </motion.section>

        {/* === Community Impact / Stats Section === */}
        <motion.section
          className="bg-white py-20 md:py-28"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6">
            <motion.div
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                A Thriving Ecosystem, Growing Daily
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <AnimatedStatCounter
                value={10000}
                suffix="+"
                label="Products Launched"
                delay={0}
              />
              <AnimatedStatCounter
                value={25000}
                suffix="+"
                label="Community Members"
                delay={0.1}
              />
              <AnimatedStatCounter
                value={50000}
                suffix="+"
                label="Connections Made"
                delay={0.2}
              />
              <AnimatedStatCounter
                value={95}
                suffix="%"
                label="User Satisfaction"
                delay={0.3}
              />
            </div>
          </div>
        </motion.section>

        {/* === Built For Every Role Section === */}
        <ParallaxBackgroundSection className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-[2.85rem] font-bold text-gray-900 mb-4 leading-tight">
                Built For Every Role in the Tech Ecosystem.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're building the next big thing, discovering
                innovative tools, seeking investment, or finding talent, Product
                Bazar is your dedicated platform for growth and opportunity.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <ValuePropositionCard
                id="for-founders"
                icon={founderIcon}
                title="For Founders & Makers"
                subtitle="Fuel Your Growth Engine."
                listItems={[
                  "Showcase your product to targeted early adopters & tech users.",
                  "Gain critical, high-quality feedback to iterate and improve faster.",
                  "Build credibility, gather testimonials, and achieve market validation.",
                  "Connect with co-founders, talent, partners, and potential investors.",
                  "Track key metrics & user engagement with built-in analytics.",
                  "Amplify your launch reach within a supportive community.",
                ]}
                buttonText="Launch Your Product & Connect →"
                isPrimaryCta={true}
                buttonHref="#signup"
              />
              <ValuePropositionCard
                id="for-discoverers"
                icon={enthusiastIcon}
                title="For Discoverers & Tech Enthusiasts"
                subtitle="Discover & Shape What's Next."
                listItems={[
                  "Find cutting-edge SaaS, AI, and No-Code solutions, often before mainstream.",
                  "Be the first to try innovative products and gain early access.",
                  "Influence product development directly with your feedback and insights.",
                  "Connect directly with the makers behind the products.",
                  "Stay ahead of the technology curve with personalized recommendations.",
                  "Build your ultimate toolkit with vetted, community-approved software.",
                ]}
                buttonText="Start Discovering & Influencing →"
                isPrimaryCta={false}
                buttonHref="#explore"
              />
            </motion.div>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="text-center text-sm text-gray-500 mt-12"
            >
              Also connecting Investors, Talent Seekers, and Agencies.{" "}
              <a href="#contact" className="text-violet-600 hover:underline">
                Learn more
              </a>
              .
            </motion.p>
          </div>
        </ParallaxBackgroundSection>

        {/* === Feature Comparison Table Section === */}
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                The Product Bazar Advantage
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                See how our dedicated focus on the tech innovation lifecycle
                delivers unique value.
              </p>
            </motion.div>
            <FeatureComparisonTable />
          </div>
        </section>

        {/* === Testimonials Section === */}
        <motion.section
          id="testimonials"
          className="bg-gradient-to-b from-white to-violet-50/30 py-24 md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 lg:mb-20"
            >
              Hear From Our Growing Community.
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              <TestimonialCard
                quote="Product Bazar connected us with invaluable early users whose feedback directly shaped our V2. The focus on quality interactions and the targeted tech audience is evident."
                name="Alex Chen"
                title="CEO & Co-founder"
                company="SynthAI Analytics"
              />
              <TestimonialCard
                quote="As a product manager always looking for the next edge, I constantly find gems here before they hit the mainstream. The AI recommendations are spot on. It's my go-to for industry discovery."
                name="Maria Garcia"
                title="Product Lead"
                company="Innovate Solutions"
              />
              <TestimonialCard
                quote="The visibility, upvotes, and validation we received on Product Bazar were crucial discussion points for our pre-seed funding round. A must-have platform for early-stage tech startups."
                name="Sam Patel"
                title="Founder"
                company="FlowState Inc."
              />
            </div>
          </div>
        </motion.section>

        {/* === Future Vision Section === */}
        <motion.section
          className="relative bg-gradient-to-br from-violet-700 to-purple-800 text-white py-24 md:py-36 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 93c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 43c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23FFFFFF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          ></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-[2.85rem] font-bold mb-6 tracking-tight"
            >
              More Than Launch: The Innovation Lifecycle Hub.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-violet-100 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Product Bazar is evolving into the central hub connecting founders
              and innovators with the essential resources they need – users,
              feedback, talent, investors, and partners – throughout their
              entire journey from idea to scale.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-md text-violet-200 max-w-3xl mx-auto font-medium"
            >
              <strong>Join us now</strong> to be part of the foundation,
              influence the platform's future, gain early access advantages, and
              build foundational connections within a rapidly growing network of
              tech opportunities.
            </motion.p>
          </div>
        </motion.section>

        {/* === Final CTA Section === */}
        <motion.section
          id="signup"
          className="bg-white py-28 md:py-40"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-[3rem] font-extrabold text-gray-900 mb-5 leading-tight tracking-tight"
            >
              Ready to Join the Innovation Ecosystem?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Launch your product, discover groundbreaking tools, find talent,
              connect with investors, or simply explore the future of tech. Your
              journey starts here.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <AnimatedButton
                primary
                href="#"
                className="text-lg px-10 py-4 shadow-xl"
              >
                Join Product Bazar Free →
              </AnimatedButton>
              <p className="text-sm text-gray-500 mt-5">
                Free core access for Founders, Makers, Users, Investors, Talent
                & Agencies.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* === FAQ Section === */}
        <motion.section
          id="faq"
          className="bg-gray-50/70 py-24 md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 lg:mb-20"
            >
              Frequently Asked Questions
            </motion.h2>
            <dl className="space-y-1">
              {faqData.map((faq, index) => (
                <FaqItemWithState
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </dl>
            <motion.div variants={fadeInUp} className="text-center mt-16">
              <a
                href="#"
                className="text-violet-600 hover:text-violet-800 font-semibold transition-colors text-sm inline-flex items-center group"
              >
                Have More Questions? Contact Us
                <ArrowRight
                  size={16}
                  strokeWidth={2.5}
                  className="ml-1.5 group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer (Assumed handled elsewhere or add here if needed) */}
    </div>
  );
};

export default PBLanding;
