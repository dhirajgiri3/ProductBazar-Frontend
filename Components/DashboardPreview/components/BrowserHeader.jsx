import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export const BrowserHeader = ({ darkMode }) => (
  <div className={`backdrop-blur-lg px-4 py-3 border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-300 ${
    darkMode 
      ? 'bg-slate-950/80 border-slate-700/50 shadow-lg shadow-black/40' 
      : 'bg-white/90 border-slate-200/70 shadow-lg shadow-slate-200/30'
  }`}>
    <div className="flex space-x-2">
      {['red-500', 'yellow-500', 'green-500'].map(color => (
        <motion.div
          key={color}
          className={`w-3 h-3 bg-${color} rounded-full shadow-md`}
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        />
      ))}
    </div>
    <div className="flex-grow text-center mx-4">
      <motion.div
        className={`mx-auto rounded-lg flex items-center justify-center px-4 py-1.5 text-xs border shadow-md transition-colors duration-300 ${
          darkMode 
            ? 'bg-slate-900/80 text-slate-300 border-slate-700/50 shadow-lg shadow-black/40' 
            : 'bg-slate-100/90 text-slate-700 border-slate-300/70 shadow-lg shadow-slate-200/30'
        }`}
        whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Lock size={10} className="mr-2 text-violet-500" /> 
        <span className="font-medium">productbazar.in/dashboard</span>
        <motion.div
          className="ml-2 w-2 h-2 bg-emerald-500 rounded-full shadow-sm"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
    <div className="w-20 text-right">
      <motion.div
        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-semibold py-1 px-2 rounded-md shadow-md"
        whileHover={{ scale: 1.05, y: -1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </motion.div>
    </div>
  </div>
); 