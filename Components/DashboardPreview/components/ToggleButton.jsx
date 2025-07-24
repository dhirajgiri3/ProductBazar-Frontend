import { motion } from 'framer-motion';

export const ToggleButton = ({ checked, onChange, activeColor = 'violet' }) => {
  const colorSchemes = {
    violet: {
      active: 'bg-gradient-to-r from-violet-500 to-violet-600 shadow-lg shadow-violet-500/40',
      inactive: 'bg-slate-300 dark:bg-slate-600 shadow-md shadow-slate-300/40 dark:shadow-slate-600/40',
      ring: 'focus:ring-violet-500/50',
      glow: 'shadow-violet-500/30',
      handleActive: 'bg-gradient-to-r from-violet-400 to-violet-500'
    },
    emerald: {
      active: 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/40',
      inactive: 'bg-slate-300 dark:bg-slate-600 shadow-md shadow-slate-300/40 dark:shadow-slate-600/40',
      ring: 'focus:ring-emerald-500/50',
      glow: 'shadow-emerald-500/30',
      handleActive: 'bg-gradient-to-r from-emerald-400 to-emerald-500'
    },
    indigo: {
      active: 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/40',
      inactive: 'bg-slate-300 dark:bg-slate-600 shadow-md shadow-slate-300/40 dark:shadow-slate-600/40',
      ring: 'focus:ring-indigo-500/50',
      glow: 'shadow-indigo-500/30',
      handleActive: 'bg-gradient-to-r from-indigo-400 to-indigo-500'
    },
    slate: {
      active: 'bg-gradient-to-r from-slate-500 to-slate-600 shadow-lg shadow-slate-500/40',
      inactive: 'bg-slate-300 dark:bg-slate-600 shadow-md shadow-slate-300/40 dark:shadow-slate-600/40',
      ring: 'focus:ring-slate-500/50',
      glow: 'shadow-slate-500/30',
      handleActive: 'bg-gradient-to-r from-slate-400 to-slate-500'
    }
  };

  const scheme = colorSchemes[activeColor] || colorSchemes.violet;

  return (
    <motion.button
      onClick={onChange}
      aria-pressed={checked}
      className={`relative w-12 h-6 rounded-full cursor-pointer flex items-center p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
        checked 
          ? `${scheme.active} ${scheme.ring}` 
          : `${scheme.inactive} ${scheme.ring}`
      }`}
      whileHover={{ 
        scale: 1.05,
        boxShadow: checked 
          ? '0 10px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.2)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      whileTap={{ scale: 0.95 }}
      whileFocus={{ 
        scale: 1.02,
        boxShadow: checked 
          ? '0 0 0 3px rgba(139, 92, 246, 0.3), 0 10px 25px -5px rgba(139, 92, 246, 0.3)' 
          : '0 0 0 3px rgba(139, 92, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      initial={false}
    >
      {/* Background glow effect */}
      {checked && (
        <motion.div
          className={`absolute inset-0 rounded-full ${scheme.glow} blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Pulse effect for active state */}
      {checked && (
        <motion.div
          className={`absolute inset-0 rounded-full ${scheme.glow} blur-md`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Toggle handle */}
      <motion.div
        className={`relative w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          checked ? 'shadow-white/50' : 'shadow-slate-400/50'
        }`}
        initial={false}
        animate={{ 
          x: checked ? 24 : 0,
          scale: checked ? 1.1 : 1
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 700, 
          damping: 35,
          mass: 0.8
        }}
        whileHover={{ 
          scale: checked ? 1.15 : 1.05,
          transition: { duration: 0.1 }
        }}
      >
        {/* Inner icon or indicator */}
        <motion.div
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            checked 
              ? scheme.handleActive
              : 'bg-slate-400'
          }`}
          animate={{ 
            scale: checked ? 1 : 0.8,
            opacity: checked ? 1 : 0.6
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
      
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.5, opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Status indicator dots */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <motion.div
          className={`w-1 h-1 rounded-full transition-all duration-300 ${
            checked ? 'bg-white/60' : 'bg-slate-400/60'
          }`}
          animate={{ 
            scale: checked ? 0.8 : 1,
            opacity: checked ? 0.6 : 1
          }}
        />
        <motion.div
          className={`w-1 h-1 rounded-full transition-all duration-300 ${
            checked ? 'bg-white/60' : 'bg-slate-400/60'
          }`}
          animate={{ 
            scale: checked ? 1 : 0.8,
            opacity: checked ? 1 : 0.6
          }}
        />
      </div>
    </motion.button>
  );
}; 