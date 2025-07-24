import { motion } from 'framer-motion';
import { BarChart3, Package, Rocket, Star, DollarSign } from 'lucide-react';
import { colorMap } from '../../constants';

export const ProductStatsCard = ({ cardVariants, darkMode }) => {
  const stats = [
    { label: 'Total Products', value: '24', change: '+3', icon: <Package size={14} />, color: 'violet' },
    { label: 'Active Launches', value: '8', change: '+1', icon: <Rocket size={14} />, color: 'emerald' },
    { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: <Star size={14} />, color: 'amber' },
    { label: 'Revenue', value: '$142k', change: '+18%', icon: <DollarSign size={14} />, color: 'blue' }
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
          <BarChart3 size={16} className="mr-2.5 text-emerald-500" /> Product Stats
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-emerald-900/50 text-emerald-400 shadow-lg shadow-emerald-900/30' 
            : 'bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-200/30'
        }`}>
          This Month
        </span>
      </div>
      
      <div className="space-y-3">
        {stats.map((stat, index) => {
          const color = colorMap[stat.color] || colorMap.slate;
          return (
            <motion.div
              key={stat.label}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'hover:bg-slate-700/50' 
                  : 'hover:bg-slate-50/50'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.text} flex items-center justify-center mr-3`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-xs font-medium transition-colors duration-300 ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>{stat.label}</p>
                  <p className={`text-sm font-bold ${color.text}`}>{stat.value}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                {stat.change}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}; 