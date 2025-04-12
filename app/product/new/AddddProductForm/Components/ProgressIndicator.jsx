"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ProgressIndicator = ({ step = 0, totalSteps = 3 }) => {
  // Create an array for steps
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute h-0.5 bg-gray-200 top-1/2 left-0 right-0 transform -translate-y-1/2 z-0"></div>
        <div 
          className="absolute h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 top-1/2 left-0 transform -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((index) => (
          <div
            key={`step-${index}`}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Step Circle */}
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 shadow-md ${
                index <= step
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" 
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
      </div>
    </div>
  );
};

export default ProgressIndicator;
