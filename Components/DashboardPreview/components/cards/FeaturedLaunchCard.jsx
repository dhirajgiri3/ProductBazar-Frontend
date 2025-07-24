import { motion } from 'framer-motion';
import { Sparkles, Code, TrendingUp, ChevronRight } from 'lucide-react';

export const FeaturedLaunchCard = ({ cardVariants, darkMode }) => (
  <motion.div
    variants={cardVariants}
    whileHover="hover"
    className={`backdrop-blur-xl rounded-lg p-4 shadow-lg border cursor-default md:col-span-1 self-start transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-800/60 border-slate-700/50' 
        : 'bg-white/60 border-slate-200/50'
    }`}
  >
    <h3 className={`font-medium mb-3 text-sm flex items-center transition-colors duration-300 ${
      darkMode ? 'text-slate-200' : 'text-slate-700'
    }`}>
      <Sparkles size={14} className="mr-2 text-amber-400" /> Featured Launch
    </h3>
    <div className={`p-4 rounded-lg border shadow-inner relative overflow-hidden group transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800/70 to-slate-700/70 border-slate-600/70' 
        : 'bg-gradient-to-br from-violet-100/70 to-purple-100/70 border-violet-200/70'
    }`}>
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-600/15 rounded-full blur-2xl group-hover:bg-purple-600/25 transition-all duration-700"></div>
      <div className="absolute -left-8 -bottom-8 w-20 h-20 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.18, rotate: 6 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg cursor-grab transition-colors duration-300 ${
            darkMode 
              ? 'bg-slate-700 text-violet-400' 
              : 'bg-white text-violet-500'
          }`}
        >
          <Code size={24} strokeWidth={1.5} />
        </motion.div>
        <p className={`font-medium text-sm transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>AI Code Assistant</p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium flex items-center mt-1 text-emerald-500">
            <TrendingUp size={11} className="mr-1" /> Trending High
          </p>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
            New
          </span>
        </div>
        <div className={`mt-3 flex items-center justify-between text-[10px] transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>Release: Today</span>
          <span>Users: 2.4k+</span>
        </div>
        <motion.button
          className="mt-3 w-full bg-violet-500 hover:bg-violet-600 text-white text-[10px] font-medium py-2 px-3 rounded-md transition-all shadow-md shadow-violet-300/50 pointer-events-auto focus:outline-none focus:ring-1 focus:ring-violet-400 focus:ring-offset-1 focus:ring-offset-white"
          whileHover={{ scale: 1.04, y: -1.5, boxShadow: '0 5px 12px rgba(124,58,237,0.2)' }}
          whileTap={{ scale: 0.97 }}
        >
          View Details <ChevronRight size={12} className="inline ml-0.5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
); 