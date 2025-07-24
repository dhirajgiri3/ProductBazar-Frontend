import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

export const ProductCategoriesCard = ({ cardVariants, darkMode }) => {
  const categories = [
    { name: 'Development Tools', count: 8, color: '#3b82f6', percentage: 33 },
    { name: 'Design Resources', count: 6, color: '#8b5cf6', percentage: 25 },
    { name: 'Marketing Tools', count: 5, color: '#10b981', percentage: 21 },
    { name: 'Analytics', count: 3, color: '#f59e0b', percentage: 12 },
    { name: 'Others', count: 2, color: '#ef4444', percentage: 9 }
  ];

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
          : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <FolderOpen size={16} className="mr-2.5 text-indigo-500" /> Product Categories
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-indigo-900/50 text-indigo-400 shadow-lg shadow-indigo-900/30' 
            : 'bg-indigo-100 text-indigo-600 shadow-md shadow-indigo-200/30'
        }`}>
          5 Categories
        </span>
      </div>
      
      <div className="space-y-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium transition-colors duration-300 ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>{category.name}</span>
              <span className={`text-xs font-bold transition-colors duration-300 ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}>{category.count} products</span>
            </div>
            <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
              darkMode ? 'bg-slate-700/60' : 'bg-slate-200/60'
            }`}>
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: category.color }}
                initial={{ width: 0 }}
                animate={{ width: `${category.percentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
              />
            </div>
            <span className={`text-[10px] mt-1 block transition-colors duration-300 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {category.percentage}% of total
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 