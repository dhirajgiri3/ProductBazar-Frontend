import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const ProductTrendsCard = ({ cardVariants, darkMode }) => {
  const trends = [
    { name: 'AI/ML Tools', trend: 'up', change: '+45%', description: 'Growing demand for AI solutions' },
    { name: 'Design Systems', trend: 'up', change: '+28%', description: 'Consistent design patterns' },
    { name: 'Analytics Platforms', trend: 'down', change: '-12%', description: 'Market saturation' },
    { name: 'Collaboration Tools', trend: 'up', change: '+32%', description: 'Remote work adoption' }
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
          <TrendingUp size={16} className="mr-2.5 text-amber-500" /> Market Trends
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-amber-900/50 text-amber-400 shadow-lg shadow-amber-900/30' 
            : 'bg-amber-100 text-amber-600 shadow-md shadow-amber-200/30'
        }`}>
          Live Data
        </span>
      </div>
      
      <div className="space-y-3">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.name}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ${
              darkMode 
                ? 'hover:bg-slate-700/50' 
                : 'hover:bg-slate-50/50'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>{trend.name}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                  trend.trend === 'up' 
                    ? darkMode 
                      ? 'text-emerald-400 bg-emerald-900/50 shadow-lg shadow-emerald-900/30' 
                      : 'text-emerald-600 bg-emerald-100 shadow-md shadow-emerald-200/30'
                    : darkMode 
                      ? 'text-red-400 bg-red-900/50 shadow-lg shadow-red-900/30' 
                      : 'text-red-600 bg-red-100 shadow-md shadow-red-200/30'
                }`}>
                  {trend.change}
                </span>
              </div>
              <p className={`text-[10px] transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{trend.description}</p>
            </div>
            <div className={`ml-3 p-1 rounded-full transition-colors duration-300 ${
              trend.trend === 'up' 
                ? darkMode 
                  ? 'bg-emerald-900/50 shadow-lg shadow-emerald-900/30' 
                  : 'bg-emerald-100 shadow-md shadow-emerald-200/30'
                : darkMode 
                  ? 'bg-red-900/50 shadow-lg shadow-red-900/30' 
                  : 'bg-red-100 shadow-md shadow-red-200/30'
            }`}>
              {trend.trend === 'up' ? (
                <TrendingUp size={12} className={darkMode ? "text-emerald-400" : "text-emerald-600"} />
              ) : (
                <TrendingDown size={12} className={darkMode ? "text-red-400" : "text-red-600"} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 