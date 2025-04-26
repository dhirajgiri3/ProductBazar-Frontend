import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function StatsSection({ onHover, onLeave }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const stats = [
    {
      value: "10,000+",
      label: "Products Launched",
      description: "Innovative products across various categories",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      value: "25,000+",
      label: "Active Users",
      description: "Makers and enthusiasts in our community",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: "500,000+",
      label: "Monthly Views",
      description: "Product pages viewed by potential customers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      value: "2M+",
      label: "Upvotes",
      description: "Community endorsements for great products",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
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
    <section ref={ref} className="py-24 relative" id="stats">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] blur-3xl opacity-10">
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet-600 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-fuchsia-600 rounded-full"></div>
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
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/50 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-violet-300 font-medium">
              Our Impact
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Growing Community
            </span>{" "}
            of Innovators
          </motion.h2>

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Product Bazar has become the go-to platform for product launches and discovery, connecting makers with their ideal audience at scale.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-all"
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(138, 43, 226, 0.3)",
              }}
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-5 text-white shadow-lg">
                {stat.icon}
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {stat.value}
              </h3>
              <h4 className="text-xl font-semibold mb-2 text-white">{stat.label}</h4>
              <p className="text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 backdrop-blur-sm border border-violet-700/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-70"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-600 rounded-full opacity-10 blur-3xl"></div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Join the fastest growing product launch platform</h3>
                  <p className="text-gray-300 mb-6">
                    Product Bazar is more than just a platform—it's a thriving ecosystem where innovation meets opportunity. Our community is growing every day, with new products being launched and discovered.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <div className="text-2xl font-bold text-violet-400">93%</div>
                      <div className="text-gray-400 text-sm">Maker satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-violet-400">87%</div>
                      <div className="text-gray-400 text-sm">User retention</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-violet-400">42%</div>
                      <div className="text-gray-400 text-sm">Monthly growth</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Product Launches</div>
                        <div className="text-sm text-gray-300">+24% this month</div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "75%" } : { width: 0 }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">User Signups</div>
                        <div className="text-sm text-gray-300">+32% this month</div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "85%" } : { width: 0 }}
                          transition={{ duration: 1, delay: 1.2 }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Product Views</div>
                        <div className="text-sm text-gray-300">+56% this month</div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "92%" } : { width: 0 }}
                          transition={{ duration: 1, delay: 1.4 }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Maker Success Rate</div>
                        <div className="text-sm text-gray-300">+18% this month</div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "68%" } : { width: 0 }}
                          transition={{ duration: 1, delay: 1.6 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
