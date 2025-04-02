"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion"; // For animations

const ProgressIndicator = ({ step, totalSteps }) => {
  return (
    <div className="mb-10 px-4 sm:px-0">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        {/* Steps */}
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="relative flex flex-col items-center z-10">
            {/* Circle with Animation */}
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-md 
                transition-all duration-300 ease-in-out transform 
                ${
                  index < step
                    ? "bg-gradient-to-br from-violet-500 to-violet-700 border-violet-700 text-white scale-110"
                    : index === step
                    ? "bg-white border-violet-600 text-violet-600 scale-105"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: index <= step ? 1.05 : 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {index < step ? (
                <Check size={24} className="text-white" />
              ) : (
                <span className="text-base font-semibold">{index + 1}</span>
              )}
            </motion.div>

            {/* Label */}
            <span
              className={`mt-3 text-sm font-medium tracking-wide 
                ${index <= step ? "text-violet-700" : "text-gray-500"} 
                transition-colors duration-300`}
            >
              {index === 0 ? "Basics" : index === 1 ? "Details" : "Review"}
            </span>
          </div>
        ))}

        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full -z-10" />

        {/* Progress Line Foreground with Animation */}
        <motion.div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-violet-500 to-violet-700 rounded-full -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
