import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export const DashboardFooter = ({ darkMode }) => (
  <div className={`backdrop-blur-md px-5 py-2.5 border-t flex items-center justify-between text-xs transition-colors duration-300 ${
    darkMode 
      ? 'bg-slate-950/80 border-slate-700/50 shadow-lg shadow-black/40' 
      : 'bg-white/80 border-slate-200/70 shadow-lg shadow-slate-200/30'
  }`}>
    <div className={`flex items-center space-x-4 transition-colors duration-300 ${
      darkMode ? 'text-slate-400' : 'text-slate-500'
    }`}>
      <motion.div className="flex items-center" whileHover={{ x: 1.5 }}>
        <motion.div
          className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        All systems operational
      </motion.div>
      <div className="hidden sm:flex items-center text-[10px]">
        <Clock size={9} className="mr-1" /> Last update:
        <span className={`font-medium ml-1 transition-colors duration-300 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>Just now</span>
      </div>
    </div>
    <Link href="/product/new">
      <motion.button
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[10px] font-medium py-1.5 px-3 rounded-md transition-all flex items-center shadow-md shadow-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        whileHover={{ scale: 1.04, y: -1.5 }}
        whileTap={{ scale: 0.97 }}
      >
        <Plus size={12} className="mr-1 -ml-0.5" /> Add Product
      </motion.button>
    </Link>
  </div>
); 