import { motion } from "framer-motion";
import { useCallback } from "react";
import { HiRefresh } from "react-icons/hi";

export default function TrendingHeader({ onRefresh, isRefreshing, onOpenFilters, totalProducts }) {
  const handleRefresh = useCallback(() => {
    if (!isRefreshing) {
      onRefresh();
    }
  }, [isRefreshing, onRefresh]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Trending Products</h1>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-full transition-colors ${
              isRefreshing
                ? "bg-gray-200 text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <HiRefresh className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </motion.button>
          {/* Optionally add filters toggle button in future */}
        </div>
      </div>
      {totalProducts > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Showing {totalProducts} trending {totalProducts === 1 ? "product" : "products"}
        </p>
      )}
    </motion.div>
  );
}
