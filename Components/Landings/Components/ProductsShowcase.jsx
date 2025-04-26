import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function ProductsShowcase({ onHover, onLeave }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const products = [
    {
      name: "DesignMaster AI",
      tagline: "AI-powered design assistant for modern creators",
      category: "Design Tools",
      upvotes: 253,
      image: "https://res.cloudinary.com/dgak25skk/image/upload/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png",
    },
    {
      name: "TaskFlow",
      tagline: "Seamless project management for remote teams",
      category: "Productivity",
      upvotes: 187,
      image: "https://res.cloudinary.com/dgak25skk/image/upload/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png",
    },
    {
      name: "EcoTracker",
      tagline: "Monitor and reduce your carbon footprint",
      category: "Sustainability",
      upvotes: 142,
      image: "https://res.cloudinary.com/dgak25skk/image/upload/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png",
    },
    {
      name: "CodeBuddy",
      tagline: "Pair programming assistant powered by machine learning",
      category: "Development",
      upvotes: 201,
      image: "https://res.cloudinary.com/dgak25skk/image/upload/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section ref={ref} className="py-24 relative" id="discover">
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
            <span className="text-violet-300 font-medium">
              Featured Products
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Trending innovations
            </span>{" "}
            from our community
          </motion.h2>

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Discover what's popular and gaining traction from innovative
            creators around the world.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {products.map((product, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all"
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(138, 43, 226, 0.3)",
              }}
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            >
              <div className="relative aspect-video w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-violet-900/70 text-xs font-medium">
                  {product.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{product.tagline}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-violet-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-violet-400 text-sm font-medium">
                      {product.upvotes}
                    </span>
                  </div>
                  <button className="text-xs px-2 py-1 rounded-full bg-violet-800/50 border border-violet-700/50 hover:bg-violet-700/50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.button
            className="px-6 py-3 rounded-full bg-gray-800 text-white font-medium border border-gray-700 hover:border-violet-500 transition-all"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(138, 43, 226, 0.3)",
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            Explore All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 inline-block ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
