import { motion } from 'framer-motion';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { HeaderButton } from './HeaderButton';

export const AppHeader = ({ darkMode, onDarkModeToggle }) => (
  <motion.div
    className={`backdrop-blur-lg px-5 py-3 border-b flex items-center justify-between transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-950/80 border-slate-700/50 shadow-lg shadow-black/40' 
        : 'bg-white/90 border-slate-200/70 shadow-lg shadow-slate-200/30'
    }`}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
    }}
  >
    <motion.div 
      className="flex items-center"
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    >
      <motion.div
        className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center text-sm w-8 h-8 p-1 mr-3 shadow-md shadow-violet-300/50"
        whileHover={{ scale: 1.08 }}
      >
        PB
      </motion.div>
      <div>
        <h2 className={`text-sm font-semibold tracking-tight transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>ProductBazar</h2>
        <p className="text-xs text-indigo-400 mt-0.5">Dashboard</p>
      </div>
    </motion.div>
    <div className="flex items-center space-x-1.5">
      <HeaderButton label="Search" darkMode={darkMode}>
        <Search size={15} />
      </HeaderButton>
      <HeaderButton label="Notifications" darkMode={darkMode}>
        <Bell size={15} />
        <motion.span
          className="absolute top-0.5 right-0.5 block w-1.5 h-1.5 bg-red-500 rounded-full border border-white"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </HeaderButton>
      <motion.button
        onClick={onDarkModeToggle}
        className={`flex items-center p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500 ${
          darkMode 
            ? 'hover:bg-slate-900/60 text-slate-300' 
            : 'hover:bg-slate-100/70 text-slate-600'
        }`}
        whileHover={{ scale: 1.05 }}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={15} /> : <Moon size={15} />}
      </motion.button>
      <motion.button
        className={`flex items-center p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500 ${
          darkMode 
            ? 'hover:bg-slate-900/60' 
            : 'hover:bg-slate-100/70'
        }`}
        whileHover={{ scale: 1.05 }}
        aria-label="User Profile"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
            : 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600'
        }`}>
          <User size={12} />
        </div>
      </motion.button>
    </div>
  </motion.div>
); 