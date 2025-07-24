import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { colorMap } from '../../constants';

export const AnalyticsCard = ({ item, cardVariants, itemVariants, darkMode }) => {
  const color = colorMap[item.color] || colorMap.slate;
  return (
    <motion.div
      variants={cardVariants || itemVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default group transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
          : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center mb-3">
        <motion.span
          className={`flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300 ${
            darkMode 
              ? `${color.darkBg} ${color.darkText} shadow-lg shadow-slate-900/50` 
              : `${color.bg} ${color.text} shadow-md shadow-slate-200/50`
          } group-hover:shadow-lg`}
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15 }}
        >
          {item.icon}
        </motion.span>
        <div>
          <span className={`text-xs font-medium transition-colors duration-300 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>{item.name}</span>
          <p
            className={`text-xl font-bold transition-transform duration-300 ${
              darkMode ? color.darkText : color.text
            } group-hover:translate-x-0.5`}
          >
            {item.value}
          </p>
        </div>
      </div>
      <div className={`flex items-center justify-between mt-3 pt-3 border-t border-dashed border-opacity-40 transition-colors duration-300 ${
        darkMode ? 'border-slate-600' : 'border-slate-300'
      }`}>
        <motion.span
          className={`text-xs font-medium flex items-center px-2 py-1 rounded-full transition-all duration-300 ${
            darkMode 
              ? 'text-emerald-400 bg-emerald-900/50 shadow-lg shadow-emerald-900/30' 
              : 'text-emerald-600 bg-emerald-100/80 shadow-md shadow-emerald-200/30'
          } group-hover:shadow-lg`}
          whileHover={{ scale: 1.06 }}
        >
          <ArrowUp size={10} className="mr-0.5" />
          {item.change}
        </motion.span>
        <span className={`text-[10px] italic transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>{item.period}</span>
      </div>
    </motion.div>
  );
}; 