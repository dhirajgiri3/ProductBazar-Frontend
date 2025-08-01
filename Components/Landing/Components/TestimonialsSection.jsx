import { useRef, useState, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import GlobalButton from "../../UI/Buttons/GlobalButton";
import SectionLabel from "./Animations/SectionLabel";

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  const scrollControls = useAnimation();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      quote:
        "Product Bazar has been instrumental in our long-term growth, connecting us with partners and supporters who believe in our journey.",
      author: "Alex Rivera",
      role: "Founder, DesignMaster AI",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "violet",
    },
    {
      id: 2,
      quote:
        "As an early tech enthusiast, I've discovered some of my favorite tools through Product Bazar. The recommendation system is spot on!",
      author: "Sarah Chen",
      role: "UX Designer",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "fuchsia",
    },
    {
      id: 3,
      quote:
        "The community engagement on our product page gave us insights we never would have uncovered otherwise. Game changer!",
      author: "Michael Okonjo",
      role: "Co-founder, TaskFlow",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "pink",
    },
    {
      id: 4,
      quote:
        "Launch day was a breeze with Product Bazar. We got immediate traction and valuable feedback from real users.",
      author: "Emma Thompson",
      role: "CEO, NexaTech",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "indigo",
    },
    {
      id: 5,
      quote:
        "The analytics dashboard helped us understand exactly what resonated with our early users. Worth every penny!",
      author: "David Lau",
      role: "Product Manager, Insight Analytics",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "purple",
    },
    {
      id: 6,
      quote:
        "Product Bazar's community is unlike any other. The quality of feedback and engagement has been instrumental in refining our product roadmap.",
      author: "Priya Sharma",
      role: "Founder, DataViz Pro",
      avatar: "/api/placeholder/48/48",
      rating: 5,
      color: "blue",
    },
  ];

  // Duplicate testimonials for infinite scroll effect
  const scrollTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Check viewport size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Start the infinite scroll animation when the section is in view
  useEffect(() => {
    if (isInView && !isPaused) {
      startScrollAnimation();
    } else {
      scrollControls.stop();
    }

    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, isPaused, controls, scrollControls]);

  const startScrollAnimation = () => {
    scrollControls.start({
      x: [0, -100 * testimonials.length],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 60,
          ease: "linear",
        },
      },
    });
  };

  // Color variations for cards
  const colorMap = {
    violet: {
      bg: "bg-violet-100/80",
      border: "border-violet-300/70",
      text: "text-violet-600",
    },
    fuchsia: {
      bg: "bg-fuchsia-100/80",
      border: "border-fuchsia-300/70",
      text: "text-fuchsia-600",
    },
    pink: {
      bg: "bg-pink-100/80",
      border: "border-pink-300/70",
      text: "text-pink-600",
    },
    indigo: {
      bg: "bg-indigo-100/80",
      border: "border-indigo-300/70",
      text: "text-indigo-600",
    },
    purple: {
      bg: "bg-purple-100/80",
      border: "border-purple-300/70",
      text: "text-purple-600",
    },
    blue: {
      bg: "bg-blue-100/80",
      border: "border-blue-300/70",
      text: "text-blue-600",
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white"
      id="testimonials"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-fuchsia-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-400/15 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SectionLabel
              text="Success Stories from Our Ecosystem"
              size="medium"
              alignment="center"
              animate={true}
              variant="glass"
              glowEffect={true}
              ribbon={true}
              badge="New"
              animationStyle="slide"
            />
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            What our community is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-600">
              saying
            </span>
          </motion.h2>

          <motion.p
            className="max-w-2xl mx-auto text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of makers and product enthusiasts already
            transforming how innovations are shared and discovered.
          </motion.p>
        </motion.div>

        {/* Featured Testimonials */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {testimonials.slice(0, 3).map((testimonial, index) => {
            const colors = colorMap[testimonial.color];

            return (
              <motion.div
                key={`featured-${testimonial.id}`}
                variants={itemVariants}
                className={`h-full flex flex-col bg-white/80 backdrop-blur-sm border ${colors.border} rounded-xl p-5 md:p-6 shadow-lg hover:shadow-xl`}
                whileHover={{
                  y: -2,
                  scale: 1.005,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                  borderColor: "rgba(139, 92, 246, 0.5)",
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                initial={{
                  opacity: 0,
                  y: 10 * (index + 1),
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.1 * (index + 1),
                    duration: 0.4,
                  },
                }}
              >
                {/* Star Rating */}
                <div
                  className={`flex items-center space-x-1 mb-4 ${colors.text}`}
                >
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <svg
                      key={starIndex}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-600 mb-6 md:mb-8 italic text-base md:text-lg line-clamp-4 md:line-clamp-none flex-grow">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative group">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-${testimonial.color}-100 to-${testimonial.color}-200 shadow-md transition-all duration-300 group-hover:shadow-lg ring-1 ring-gray-200/70`}
                    >
                      <span className={`font-semibold text-base md:text-lg text-${testimonial.color}-700 transition-all duration-300 group-hover:scale-110`}>
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4.5 md:h-4.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 border-2 border-white rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                    </div>
                  </div>

                  <div className="ml-3.5">
                    <h4 className={`font-medium text-gray-800 text-sm md:text-base group-hover:text-${testimonial.color}-600`}>
                      {testimonial.author}
                    </h4>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Infinite Scroll Testimonials */}
        <div className="relative overflow-hidden py-8 mb-12">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          <motion.div
            className="flex gap-6 py-4"
            animate={{
              x: [-100 * testimonials.length, 0],
              transition: {
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 70,
                  ease: "linear",
                },
              },
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {scrollTestimonials.map((_, index) => {
              const reversedIndex = scrollTestimonials.length - 1 - index;
              const reversedTestimonial = scrollTestimonials[reversedIndex];
              const colors = colorMap[reversedTestimonial.color];

              return (
                <motion.div
                  key={`scroll-reverse-${reversedTestimonial.id}-${index}`}
                  className={`flex-shrink-0 w-[280px] sm:w-[320px] bg-white/80 backdrop-blur-md border ${colors.border} rounded-xl p-6 shadow-lg`}
                  whileHover={{
                    y: -5,
                    border: "1px solid rgba(139, 92, 246, 0.5)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <div
                    className={`flex items-center space-x-1 mb-4 ${colors.text}`}
                  >
                    {[...Array(reversedTestimonial.rating)].map(
                      (_, starIndex) => (
                        <svg
                          key={starIndex}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )
                    )}
                  </div>

                  <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                    "{reversedTestimonial.quote}"
                  </p>

                  <div className="flex items-center">
                    <div className="relative group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-${reversedTestimonial.color}-100 to-${reversedTestimonial.color}-200 shadow-md transition-all duration-300 group-hover:shadow-lg ring-1 ring-gray-200/70`}
                      >
                        <span className={`font-semibold text-sm text-${reversedTestimonial.color}-700 transition-all duration-300 group-hover:scale-110`}>
                          {reversedTestimonial.author.charAt(0)}
                        </span>
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 border-2 border-white rounded-full shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                      </div>
                    </div>

                    <div className="ml-3">
                      <h4 className={`font-medium text-gray-800 text-sm group-hover:text-${reversedTestimonial.color}-600`}>
                        {reversedTestimonial.author}
                      </h4>
                      <p className="text-gray-500 text-xs">
                        {reversedTestimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <a href="/product/new">
            <GlobalButton
              variant="primary"
              size="lg"
              magneticEffect={true}
              className="px-6 sm:px-8 py-3 sm:py-4 shadow-lg"
              ariaLabel="Submit your product to Product Bazar"
              icon="ArrowRight"
              iconPosition="right"
            >
              Submit Your Product
            </GlobalButton>
          </a>
        </div>
      </div>
    </section>
  );
}