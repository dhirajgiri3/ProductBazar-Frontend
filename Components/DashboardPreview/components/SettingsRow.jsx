import { motion } from 'framer-motion';
import { colorMap } from '../constants';

export const SettingsRow = ({ label, description, icon, children, variants, iconColor = 'slate', darkMode }) => {
  const color = colorMap[iconColor] || colorMap.slate;
  return (
    <motion.div
      variants={variants}
      className={`flex items-center justify-between p-3 rounded-lg border group transition-colors duration-300 ${
        darkMode 
          ? 'border-slate-600/70 hover:bg-slate-700/50 shadow-md shadow-slate-900/20' 
          : 'border-slate-200/70 hover:bg-violet-50/50 shadow-md shadow-slate-200/20'
      }`}
      whileHover={{ x: 2.5 }}
    >
      <div className="flex items-center">
        <motion.div
          className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
            darkMode 
              ? `${color.darkBg} ${color.darkText} shadow-lg shadow-slate-900/50` 
              : `${color.bg} ${color.text} shadow-md shadow-slate-200/50`
          } group-hover:shadow-lg`}
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 350, damping: 15 }}
        >
          {icon}
        </motion.div>
        <div>
          <p className={`text-xs font-medium transition-colors duration-300 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>{label}</p>
          {description && <p className={`text-[9px] mt-0.5 transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{description}</p>}
        </div>
      </div>
      <div className="pointer-events-auto">{children}</div>
    </motion.div>
  );
}; 