import { motion } from "framer-motion";

export default function TrendingFilters({ 
  currentFilter, 
  currentCategory, 
  onFilterChange, 
  onCategoryChange, 
  disabled 
}) {
  const filters = ["today", "week", "month", "all-time"];
  const categories = ["all", "ai", "saas", "fintech", "design", "developer-tools", "marketing"];

  return (
    <div className="space-y-4 px-2">
      <div className="flex flex-wrap gap-3">
        {filters.map((item) => (
          <motion.button
            key={item}
            whileHover={!disabled && { scale: 1.05 }}
            whileTap={!disabled && { scale: 0.95 }}
            onClick={() => !disabled && onFilterChange(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${currentFilter === item
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${currentCategory === cat
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {cat.split("-").map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(" ")}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
