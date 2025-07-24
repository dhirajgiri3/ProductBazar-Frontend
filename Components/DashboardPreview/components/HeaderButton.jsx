import { motion } from 'framer-motion';

export const HeaderButton = ({ children, label, darkMode }) => (
  <motion.button
    className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400 ${
      darkMode 
        ? 'text-slate-300 hover:bg-violet-900/70 hover:text-violet-300' 
        : 'text-slate-500 hover:bg-violet-100/70 hover:text-violet-600'
    }`}
    whileHover={{ scale: 1.18 }}
    whileTap={{ scale: 0.92 }}
    aria-label={label}
  >
    {children}
  </motion.button>
); 