import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function CallToAction({ onHover, onLeave }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 relative" id="submit">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-700/30 rounded-2xl p-12 backdrop-blur-md relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-70"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-600 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Ready to showcase{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
                    your product
                  </span>{" "}
                  to the world?
                </motion.h2>

                <motion.p
                  className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Join thousands of makers who have successfully launched their
                  innovations on Product Bazar. Our community of early adopters
                  and enthusiasts are eager to discover what you've built and provide
                  valuable feedback to help you grow.
                </motion.p>

                <motion.div
                  className="space-y-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-violet-900/30 border border-violet-700/50 flex items-center justify-center mr-4 text-violet-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300">Reach thousands of early adopters and enthusiasts</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-violet-900/30 border border-violet-700/50 flex items-center justify-center mr-4 text-violet-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300">Get valuable feedback to improve your product</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-violet-900/30 border border-violet-700/50 flex items-center justify-center mr-4 text-violet-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300">Build your audience and gain traction</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Link href="/product/new">
                    <motion.button
                      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center shadow-lg shadow-violet-900/20"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 25px rgba(138, 43, 226, 0.6)",
                      }}
                      onMouseEnter={onHover}
                      onMouseLeave={onLeave}
                    >
                      Submit Your Product
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
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
                  </Link>
                  <motion.button
                    className="px-8 py-3.5 rounded-full bg-gray-800/80 backdrop-blur-sm text-white font-medium text-lg border border-gray-700 hover:border-violet-500 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={onHover}
                    onMouseLeave={onLeave}
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                }
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* Form illustration */}
                <motion.div
                  className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl"
                  whileHover={{ y: -5 }}
                  onMouseEnter={onHover}
                  onMouseLeave={onLeave}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mr-3 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">
                      Submit Your Product
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-700/70 border border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-700/70 border border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Brief description of your product"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category
                      </label>
                      <select className="w-full bg-gray-700/70 border border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                        <option>Select a category</option>
                        <option>Design Tools</option>
                        <option>Productivity</option>
                        <option>Development</option>
                        <option>Marketing</option>
                        <option>Sustainability</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        className="w-full bg-gray-700/70 border border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="https://yourproduct.com"
                      />
                    </div>
                    <div className="pt-2">
                      <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-900/20">
                        Continue
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Already have an account?</span>
                      <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</a>
                    </div>
                  </div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-12"
                  animate={{
                    rotate: [12, -5, 12],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center transform -rotate-12"
                  animate={{
                    rotate: [-12, 5, -12],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
