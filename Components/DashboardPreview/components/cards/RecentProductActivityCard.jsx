import { motion } from 'framer-motion';
import { Clock, Rocket, RefreshCw, Star, Wrench, Activity } from 'lucide-react';

export const RecentProductActivityCard = ({ cardVariants, darkMode }) => {
  const activities = [
    { action: 'New product launched', product: 'AI Code Assistant', time: '2 hours ago', type: 'launch' },
    { action: 'Product updated', product: 'Marketing Suite Pro', time: '4 hours ago', type: 'update' },
    { action: 'Review received', product: 'Data Analytics Platform', time: '6 hours ago', type: 'review' },
    { action: 'Bug fixed', product: 'Design System Kit', time: '8 hours ago', type: 'fix' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'launch': return <Rocket size={12} className="text-emerald-500" />;
      case 'update': return <RefreshCw size={12} className="text-blue-500" />;
      case 'review': return <Star size={12} className="text-amber-500" />;
      case 'fix': return <Wrench size={12} className="text-violet-500" />;
      default: return <Activity size={12} className="text-slate-500" />;
    }
  };

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
          <Clock size={16} className="mr-2.5 text-purple-500" /> Recent Activity
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-purple-900/50 text-purple-400 shadow-lg shadow-purple-900/30' 
            : 'bg-purple-100 text-purple-600 shadow-md shadow-purple-200/30'
        }`}>
          Live Feed
        </span>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={`${activity.product}-${index}`}
            className={`flex items-start space-x-3 p-2 rounded-lg transition-colors duration-300 ${
              darkMode 
                ? 'hover:bg-slate-700/50' 
                : 'hover:bg-slate-50/50'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{activity.action}</span>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>{activity.product}</span>
              </div>
              <div className={`text-[10px] mt-0.5 transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 