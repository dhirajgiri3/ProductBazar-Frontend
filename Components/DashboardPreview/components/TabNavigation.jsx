import { motion } from 'framer-motion';

export const TabNavigation = ({ tabs, activeTab, onTabClick, isClient, darkMode }) => (
  <div className={`flex border-b backdrop-blur-md px-4 transition-colors duration-300 ${
    darkMode 
      ? 'border-slate-700/50 bg-slate-950/80 shadow-lg shadow-black/20' 
      : 'border-slate-200/70 bg-white/80 shadow-lg shadow-slate-200/20'
  }`}>
    {isClient && tabs ? (
      tabs.map((tab, index) => (
        <motion.button
          key={`${tab.name}-${index}`}
          onClick={() => onTabClick(index)}
          className={`relative flex items-center px-4 py-3 text-xs font-medium transition-colors duration-200 ${
            activeTab === index 
              ? 'text-indigo-400' 
              : darkMode 
                ? 'text-slate-400 hover:text-indigo-400' 
                : 'text-slate-500 hover:text-indigo-600'
          }`}
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <motion.span
            className={`mr-1.5 transition-colors duration-200 ${
              activeTab === index 
                ? 'text-indigo-400' 
                : darkMode 
                  ? 'text-slate-500' 
                  : 'text-slate-400'
            }`}
            animate={{ scale: activeTab === index ? 1.1 : 1 }}
          >
            {tab.icon}
          </motion.span>
          {tab.name}
          {activeTab === index && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-full"
              layoutId="activeTabIndicator"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
        </motion.button>
      ))
    ) : (
      <div className="flex">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`px-4 py-3 text-xs animate-pulse transition-colors duration-300 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Loading...
          </div>
        ))}
      </div>
    )}
  </div>
); 