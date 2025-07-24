import { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import GlobalButton from "../../UI/Buttons/GlobalButton";
import SectionLabel from "./Animations/SectionLabel";

export default function FeaturesSection({ onHover, onLeave }) {
  const ref = useRef(null);
  const headerRef = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const isHeaderInView = useInView(headerRef, { once: false, amount: 0.2 });
  const [activeTab, setActiveTab] = useState("all");
  const [previousTab, setPreviousTab] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  // Update feature titles and descriptions
  const features = [
    {
      id: "launch",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Launch with Context",
      description: "Showcase your innovations with rich context, roadmap visibility, and long-term community engagement.",
      category: "product",
      color: "text-violet-700",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-300",
      gradientFrom: "from-violet-500",
      gradientTo: "to-violet-700",
      row: 1,
      size: "large",
      badge: "Popular",
      badgeColor: "bg-violet-600",
      stats: { users: 2345, growth: "+24%" },
      cta: "Get Started",
    },
    {
      id: "discover",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: "Discover with Intelligence",
      description: "Find relevant products through AI-powered recommendations, curated feeds, and smart filtering based on your interests and needs.",
      category: "product",
      color: "text-fuchsia-700",
      bgColor: "bg-fuchsia-50",
      borderColor: "border-fuchsia-300",
      gradientFrom: "from-fuchsia-500",
      gradientTo: "to-fuchsia-700",
      row: 1,
      size: "large",
      badge: "Trending",
      badgeColor: "bg-fuchsia-600",
      stats: { products: 5280, new: 128 },
      cta: "Explore",
    },
    {
      id: "feedback",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "Shape the Future",
      description:
        "Comment on products and help makers improve with your valuable insights.",
      category: "community",
      color: "text-pink-700",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
      gradientFrom: "from-pink-500",
      gradientTo: "to-pink-700",
      row: 2,
      size: "small",
      badge: "Active",
      badgeColor: "bg-pink-600",
      stats: { comments: 12950 },
      cta: "Comment",
    },
    {
      id: "upvote",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      ),
      title: "Upvote & Bookmark",
      description:
        "Support products you love by upvoting, increasing their visibility.",
      category: "community",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      gradientFrom: "from-rose-500",
      gradientTo: "to-rose-700",
      row: 2,
      size: "small",
      badge: "Hot",
      badgeColor: "bg-rose-600",
      stats: { upvotes: 45680 },
      cta: "Upvote",
    },
    {
      id: "connect",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Build Relationships",
      description:
        "Build relationships with innovative creators and collaborate on projects.",
      category: "community",
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      gradientFrom: "from-red-500",
      gradientTo: "to-red-700",
      row: 2,
      size: "small",
      badge: "Network",
      badgeColor: "bg-red-600",
      stats: { makers: 1285 },
      cta: "Connect",
    },
    {
      id: "recommendations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: "Smart Recommendations",
      description:
        "Receive personalized product suggestions based on your interests.",
      category: "tools",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-700",
      row: 3,
      size: "large",
      badge: "Smart",
      badgeColor: "bg-orange-600",
      stats: { accuracy: "95%", matched: 2840 },
      cta: "Get Recommendations",
    },
    {
      id: "analytics",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Analytics & Insights",
      description:
        "Track your product's performance with comprehensive analytics.",
      category: "tools",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      gradientFrom: "from-amber-500",
      gradientTo: "to-amber-700",
      row: 3,
      size: "large",
      badge: "Pro",
      badgeColor: "bg-amber-600",
      stats: { reports: 148, metrics: 25 },
      cta: "View Analytics",
    },
  ];

  const categories = [
    { id: "all", label: "All Features" },
    { id: "product", label: "Product" },
    { id: "community", label: "Community" },
    { id: "tools", label: "Tools" },
  ];

  const filteredFeatures =
    activeTab === "all"
      ? features
      : features.filter((feature) => feature.category === activeTab);

  // Effect to handle tab changes
  useEffect(() => {
    // This effect runs when activeTab changes
  }, [activeTab]);

  // Group features by row
  const rows = filteredFeatures.reduce((acc, feature) => {
    if (!acc[feature.row]) acc[feature.row] = [];
    acc[feature.row].push(feature);
    return acc;
  }, {});

  // Function to format numbers
  const formatNumber = (num) => {
    return num > 999 ? (num / 1000).toFixed(1) + "k" : num;
  };

  // Section variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Header animation variants
  const headerVariants = {
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

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Feature card hover animation
  const featureHoverEffect = shouldReduceMotion
    ? {}
    : {
        scale: 1.01,
        y: -4,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.3, ease: "easeOut" },
      };

  return (
    <div
      className="max-w-6xl mx-auto relative z-10 py-16 sm:py-20 px-4 sm:px-6"
      ref={ref}
    >
      {/* Background decorative elements */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-violet-300/10 to-fuchsia-300/10 rounded-full blur-3xl -z-10"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />
          <motion.div
            className="absolute bottom-24 right-1/4 w-80 h-80 bg-gradient-to-br from-fuchsia-300/10 to-amber-300/10 rounded-full blur-3xl -z-10"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.4 }}
          />
        </>
      )}

      {/* Section header */}
      <motion.div
        className="text-center mb-20 relative"
        ref={headerRef}
        variants={shouldReduceMotion ? {} : sectionVariants}
        initial="hidden"
        animate={isHeaderInView ? "visible" : "hidden"}
      >
        <SectionLabel
          text="Platform Features"
          size="medium"
          alignment="center"
          animate={!shouldReduceMotion}
          variant="vibrant"
          glowEffect={true}
          gradientText={true}
          animationStyle="bounce"
        />

        <motion.div
          className="relative inline-block"
          variants={shouldReduceMotion ? {} : headerVariants}
        >
          <h2 className="text-4xl font-extrabold mb-6 relative">
            <span className="relative z-10 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 bg-clip-text text-transparent [background-size:200%_100%] animate-gradient-x">
              Powerful features to simplify your
            </span>
            {/* Fallback for browsers that don't support bg-clip-text */}
            <span className="absolute inset-0 text-gray-900 opacity-0 [.no-bg-clip-text_&]:opacity-100 [.no-bg-clip-text_&]:text-violet-700">
              Powerful features to simplify your
            </span>
          </h2>

          {/* Wavy gradient underline with animation */}
          <motion.svg
            className="absolute bottom-2 left-0 right-0 w-full h-6"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            animate={isHeaderInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.5,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          >
            <motion.path
              d="M0,50 Q250,0 500,50 T1000,50"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              initial={{ pathLength: 0 }}
              animate={isHeaderInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 2,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </motion.svg>
        </motion.div>

        <motion.p
          className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
          variants={shouldReduceMotion ? {} : headerVariants}
        >
          Everything you need to launch, discover, and grow in one comprehensive platform designed for the modern product journey.
        </motion.p>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mb-12"
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        role="tablist"
        aria-label="Filter features by category"
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
              activeTab === category.id
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            variants={shouldReduceMotion ? {} : itemVariants}
            role="tab"
            aria-selected={activeTab === category.id}
            aria-controls={`features-${category.id}`}
          >
            {category.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Features Grid */}
      <div
        id={`features-${activeTab}`}
        role="tabpanel"
        aria-label={`${categories.find(c => c.id === activeTab)?.label || 'All features'}`}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            className={`relative group cursor-pointer transition-all duration-300 ${
              feature.size === "large" ? "md:col-span-2" : ""
            }`}
            variants={shouldReduceMotion ? {} : itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={featureHoverEffect}
            role="article"
            aria-label={`${feature.title} - ${feature.description}`}
          >
            <div
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                feature.borderColor
              } bg-white p-6 shadow-sm hover:shadow-lg group-hover:border-violet-400`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${feature.badgeColor} text-white`}
                >
                  {feature.badge}
                </div>
                <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                  <div className={`${feature.color}`}>{feature.icon}</div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {Object.entries(feature.stats).map(([key, value]) => (
                      <span key={key} className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900">
                          {typeof value === "number" ? formatNumber(value) : value}
                        </span>
                        <span className="capitalize">{key}</span>
                      </span>
                    ))}
                  </div>
                  <GlobalButton
                    variant="secondary"
                    size="sm"
                    href={`/${feature.id}`}
                    ariaLabel={`Learn more about ${feature.title}`}
                  >
                    {feature.cta}
                  </GlobalButton>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced CTA Button with refined animations */}
      <motion.div
        className="mt-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="relative inline-block">
          {/* Decorative elements */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-violet-200/30 to-fuchsia-200/30 dark:from-violet-800/20 dark:to-fuchsia-800/20 rounded-full blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
              <motion.div
                className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-fuchsia-200/30 to-violet-200/30 dark:from-fuchsia-800/20 dark:to-violet-800/20 rounded-full blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </>
          )}

          <GlobalButton
            icon="ArrowRight"
            variant="primary"
            size="lg"
            shimmerEffect={true}
            magneticEffect={true}
            href="/products"
          >
            Explore All Features
          </GlobalButton>
        </div>
      </motion.div>
    </div>
  );
}
