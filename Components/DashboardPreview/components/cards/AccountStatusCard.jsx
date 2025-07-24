import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { colorMap } from '../../constants';

export const AccountStatusCard = ({ cardVariants, darkMode }) => {
  const accountStats = [
    { label: 'Account Type', value: 'Premium', color: 'violet' },
    { label: 'Storage Used', value: '2.4 GB / 10 GB', color: 'blue' },
    { label: 'API Calls', value: '1,247 / 5,000', color: 'emerald' },
    { label: 'Team Members', value: '8 active', color: 'amber' }
  ];

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
          : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <User size={16} className="mr-2.5 text-blue-500" /> Account Status
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-blue-900/50 text-blue-400 shadow-lg shadow-blue-900/30' 
            : 'bg-blue-100 text-blue-600 shadow-md shadow-blue-200/30'
        }`}>
          Premium
        </span>
      </div>
      
      <div className="space-y-3">
        {accountStats.map((stat, index) => {
          const color = colorMap[stat.color] || colorMap.slate;
          return (
            <motion.div
              key={stat.label}
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{stat.label}</span>
                <span className={`text-xs font-bold ${color.text}`}>{stat.value}</span>
              </div>
              {stat.label !== 'Account Type' && (
                <div className={`w-full rounded-full h-1.5 transition-colors duration-300 ${
                  darkMode ? 'bg-slate-700/60' : 'bg-slate-200/60'
                }`}>
                  <motion.div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${color.gradFrom} ${color.gradTo}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 60}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}; 