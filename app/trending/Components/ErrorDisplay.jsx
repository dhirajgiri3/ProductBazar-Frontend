import { motion } from "framer-motion";
import Image from "next/image";

export default function ErrorDisplay({ 
  message,
  onRetry,
  onReset,
  showResetButton = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {message || "Try adjusting your filters or check back later for new products."}
      </p>
      <div className="flex gap-4">
        {showResetButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium
              hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium
            hover:bg-blue-700 transition-colors"
        >
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}
