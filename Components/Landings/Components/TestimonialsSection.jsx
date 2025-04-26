import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function TestimonialsSection({ onHover, onLeave }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const testimonials = [
    {
      quote:
        "Product Bazar helped me reach thousands of early adopters for my AI tool in just a few days. The feedback was invaluable.",
      author: "Alex Rivera",
      role: "Founder, DesignMaster AI",
      avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1745407095/profile/snkuryw9phzu2alcom7j.jpg",
    },
    {
      quote:
        "As an early tech enthusiast, I've discovered some of my favorite tools through Product Bazar. The recommendation system is spot on!",
      author: "Sarah Chen",
      role: "UX Designer",
      avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1745407095/profile/snkuryw9phzu2alcom7j.jpg",
    },
    {
      quote:
        "The community engagement on our product page gave us insights we never would have uncovered otherwise. Game changer!",
      author: "Michael Okonjo",
      role: "Co-founder, TaskFlow",
      avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1745407095/profile/snkuryw9phzu2alcom7j.jpg",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

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

  return (
    <section
      ref={ref}
      className="py-24 relative"
      id="testimonials"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] blur-3xl opacity-10">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-fuchsia-600 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-600 rounded-full"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4 px-4 py-1 rounded-full bg-violet-900/30 border border-violet-700/50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-violet-300 font-medium">Testimonials</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            What our community is{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
              saying
            </span>
          </motion.h2>

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join thousands of makers and product enthusiasts already
            transforming how innovations are shared.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-violet-500/50 transition-all"
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(138, 43, 226, 0.3)",
              }}
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            >
              <div className="flex items-center space-x-1 mb-6 text-violet-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
