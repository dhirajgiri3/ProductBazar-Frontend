import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { colorMap } from '../../constants';

export const MetricCard = ({ item, cardVariants, itemVariants, darkMode }) => {
  const progressValue = ((item.label.length * 5) % 30) + 65;
  const color = colorMap[item.color] || colorMap.slate;
  return (
    <motion.div
      variants={cardVariants || itemVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-lg p-3.5 shadow-xl border cursor-default group transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
          : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <motion.span
            className={`flex items-center justify-center w-7 h-7 rounded-lg mr-2.5 transition-all duration-300 ${
              darkMode 
                ? `${color.darkBg} ${color.darkText} shadow-lg shadow-slate-900/50` 
                : `${color.bg} ${color.text} shadow-md shadow-slate-200/50`
            } group-hover:shadow-lg`}
            whileHover={{ scale: 1.12, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
          >
            {item.icon}
          </motion.span>
          <span className={`text-xs font-medium transition-colors duration-300 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>{item.label}</span>
        </div>
        <motion.span
          className={`text-xs font-medium flex items-center px-1.5 py-0.5 rounded-full transition-all duration-300 ${
            darkMode 
              ? 'text-emerald-400 bg-emerald-900/50 shadow-lg shadow-emerald-900/30' 
              : 'text-emerald-600 bg-emerald-100/80 shadow-md shadow-emerald-200/30'
          } group-hover:shadow-lg`}
          whileHover={{ scale: 1.06 }}
        >
          <ArrowUp size={10} className="mr-0.5" />
          {item.change}
        </motion.span>
      </div>
      <p
        className={`text-xl font-bold transition-all duration-300 ${
          darkMode ? color.darkText : color.text
        } ml-10 group-hover:ml-9`}
      >
        {item.value}
      </p>
      <div className={`w-full h-1.5 mt-3 rounded-full overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-slate-700/70' : 'bg-slate-200/70'
      }`}>
        <motion.div
          className={`h-1.5 rounded-full bg-gradient-to-r ${color.gradFrom} ${color.gradTo}`}
          initial={{ width: '0%' }}
          animate={{ width: `${progressValue}%` }}
          transition={{ delay: 0.3, duration: 0.9, ease: 'circOut' }}
        />
      </div>
    </motion.div>
  );
}; 