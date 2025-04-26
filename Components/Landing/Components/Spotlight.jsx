import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, useAnimation } from "framer-motion";
import { ArrowUp, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Enhanced tilt effect logic with smoother transitions
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const x = (clientX - left - width / 2) / (width / 2);
    const y = (clientY - top - height / 2) / (height / 2);
    
    cardRef.current.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale3d(1.02, 1.02, 1.02)`;
    cardRef.current.style.transition = "transform 0.15s ease-out";
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    cardRef.current.style.transition = "transform 0.4s ease-out";
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-full sm:w-80 md:w-96 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group hover:shadow-lg border border-gray-100"
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-w-16 aspect-h-10 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${name} preview`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-violet-100 text-violet-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm bg-opacity-90 shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-5 leading-relaxed">
          {tagline}
        </p>
        
        <div className="flex justify-between items-center text-sm mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-violet-600 font-medium">
              <ArrowUp size={16} strokeWidth={2.5} className="group-hover:animate-bounce" style={{animationDuration: '0.75s'}} />
              <span>{upvotes}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <MessageSquare size={16} strokeWidth={2} />
              <span>{comments}</span>
            </div>
          </div>
          
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            className="relative"
          >
            <a
              href="#"
              className="text-violet-600 hover:text-violet-800 text-xs font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
            >
              View Details
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Spotlight = () => {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const controls = useAnimation();
  const [width, setWidth] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [hasCompletedScroll, setHasCompletedScroll] = useState(false);

  // Scroll-based animation setup
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Products data with the provided Unsplash image URLs
  const products = [
    {
      imageUrl: "https://images.unsplash.com/photo-1601158935942-52255782d322?q=80&w=2691&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "AI / Dev Tools",
      name: "CodePilot AI Assist",
      tagline: "Intelligent code completion and review powered by state-of-the-art machine learning models.",
      upvotes: 312,
      comments: 28,
    },
    {
      imageUrl: "https://plus.unsplash.com/premium_photo-1661962960694-0b4ed303744f?q=80&w=3135&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "SaaS / Productivity",
      name: "FlowState Task Manager",
      tagline: "Seamlessly manage projects and tasks with intuitive workflows and team collaboration features.",
      upvotes: 280,
      comments: 19,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1639395241103-9c855f93a90c?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "No-Code / Automation",
      name: "Connecta Bridge",
      tagline: "Visually integrate your favorite apps without writing code. 200+ integrations available.",
      upvotes: 450,
      comments: 35,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1648134859177-66e35b61e106?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "AI / Analytics",
      name: "Insight Engine Pro",
      tagline: "Uncover deep customer insights automatically from your data using advanced AI algorithms.",
      upvotes: 395,
      comments: 41,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1639395241103-9c855f93a90c?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Design / Tools",
      name: "ProtoPalette",
      tagline: "Generate beautiful color schemes and UI components with AI-powered design suggestions.",
      upvotes: 275,
      comments: 23,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1601158935942-52255782d322?q=80&w=2691&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Marketing / Automation",
      name: "GrowthPulse",
      tagline: "Automate your marketing campaigns with smart triggers and personalized customer journeys.",
      upvotes: 328,
      comments: 31,
    },
  ];

  // Calculate the total scroll distance needed to show all cards
  const totalScrollDistance = products.length - cardsPerView;
  
  // Transform vertical scroll progress into horizontal scroll position
  const x = useTransform(
    scrollYProgress, 
    // Input range: start from 0.1 to 0.9 of the section's visibility to give a bit of buffer
    [0.1, 0.9], 
    // Output range: 0 to -width * totalScrollDistance (negative because we're moving left)
    [0, -width * totalScrollDistance]
  );

  // Calculate dimensions and constraints for carousel
  useEffect(() => {
    if (carouselRef.current) {
      const updateDimensions = () => {
        // Set cards per view based on screen width
        let newCardsPerView = 3;
        if (window.innerWidth < 1024 && window.innerWidth >= 640) {
          newCardsPerView = 2;
        } else if (window.innerWidth < 640) {
          newCardsPerView = 1;
        }
        
        setCardsPerView(newCardsPerView);
        
        // Calculate card width based on carousel width and cards per view
        const containerWidth = carouselRef.current.offsetWidth;
        const gap = 24; // 6 * 4 = 24px (space-x-6)
        const cardWidth = (containerWidth - (gap * (newCardsPerView - 1))) / newCardsPerView;
        
        setWidth(cardWidth);
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Track scroll completion for releasing the "scroll lock"
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(value => {
      if (value >= 0.9 && !hasCompletedScroll) {
        setHasCompletedScroll(true);
      } else if (value <= 0.1 && hasCompletedScroll) {
        setHasCompletedScroll(false);
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, hasCompletedScroll]);

  // Intro animation variants
  const introVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  // Variants for each card's appearance animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: i * 0.1,
        ease: "easeOut" 
      }
    })
  };

  return (
    <section 
      ref={sectionRef}
      className="bg-gradient-to-b from-gray-50 to-white py-24 md:py-32 overflow-hidden"
      // Set a minimum height to ensure enough scroll space for the animation
      style={{ minHeight: "150vh" }}
    >
      <div className="container mx-auto px-6">
        {/* Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={introVariants}
          className="max-w-3xl mx-auto mb-16 lg:mb-24 text-center"
        >
          <motion.span 
            variants={introVariants}
            className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider"
          >
            Spotlight
          </motion.span>
          
          <motion.h2 
            variants={introVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight"
          >
            Innovation Taking <span className="text-violet-600">Flight</span>
          </motion.h2>
          
          <motion.p 
            variants={introVariants}
            className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Explore curated SaaS, AI, Dev Tools, and No-Code solutions gaining traction 
            and solving real problems within the Product Bazar community.
          </motion.p>
        </motion.div>

        {/* Scroll-based Carousel */}
        <div className="relative">
          {/* Scroll progress indicator (optional) */}
          <motion.div 
            className="absolute -top-8 left-0 h-1 bg-violet-500 rounded-full"
            style={{ 
              width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
              opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
            }}
          />
          
          {/* Product Cards Carousel */}
          <div className="overflow-hidden" ref={carouselRef}>
            <motion.div 
              className="flex space-x-6 px-1 pb-2"
              style={{ x }}
              transition={{ type: "spring", bounce: 0 }}
            >
              {products.map((product, index) => (
                <motion.div 
                  key={index}
                  custom={index} 
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  style={{ 
                    flex: `0 0 ${width}px`, 
                    maxWidth: `${width}px`,
                  }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator for users */}
          <motion.div 
            className="flex justify-center mt-8 items-center space-x-2"
            style={{ 
              opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]) 
            }}
          >
            <div className="text-sm text-gray-500">Scroll to explore</div>
            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-violet-500"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          variants={introVariants}
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <a
            href="#explore"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-violet-600 text-violet-700 bg-transparent rounded-full font-medium transition-all duration-300 hover:bg-violet-600 hover:text-white group"
          >
            Explore All Innovations
            <ArrowRight 
              size={18} 
              className="ml-2 transition-transform duration-300 group-hover:translate-x-1" 
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Spotlight;