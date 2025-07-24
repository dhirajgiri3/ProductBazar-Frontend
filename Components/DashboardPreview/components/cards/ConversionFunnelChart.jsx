import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export const ConversionFunnelChart = ({ cardVariants, darkMode }) => {
  const funnelData = [
    { stage: 'Visitors', count: '24.5k', percentage: 100, color: '#3b82f6' },
    { stage: 'Product Views', count: '18.2k', percentage: 74, color: '#8b5cf6' },
    { stage: 'Add to Cart', count: '12.8k', percentage: 52, color: '#f59e0b' },
    { stage: 'Checkout', count: '8.9k', percentage: 36, color: '#ef4444' },
    { stage: 'Purchase', count: '6.4k', percentage: 26, color: '#10b981' }
  ];
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-700/60' 
          : 'bg-white/70 border-slate-200/60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <Target size={16} className="mr-2.5 text-amber-500" /> Conversion Funnel
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">
          26% Rate
        </span>
      </div>
      
      <div className="space-y-3">
        {funnelData.map((item, index) => (
          <motion.div
            key={item.stage}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium transition-colors duration-300 ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>{item.stage}</span>
              <span className={`text-xs font-bold transition-colors duration-300 ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}>{item.count}</span>
            </div>
            <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
              darkMode ? 'bg-slate-700/60' : 'bg-slate-200/60'
            }`}>
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
              />
            </div>
            <span className={`text-[10px] mt-1 block transition-colors duration-300 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {item.percentage}% conversion
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 