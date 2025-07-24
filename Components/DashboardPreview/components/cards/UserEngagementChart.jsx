import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export const UserEngagementChart = ({ cardVariants, darkMode }) => {
  const engagementData = [65, 72, 68, 75, 82, 79, 85, 88, 92, 89, 94, 96];
  const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM', '12AM', '2AM', '4AM'];
  
  const createEngagementPath = (data) => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / 100) * 80;
      return { x, y };
    });
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (next) {
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        const cp2x = curr.x - (next.x - curr.x) * 0.5;
        const cp2y = curr.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    return path;
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
          <Activity size={16} className="mr-2.5 text-blue-500" /> User Engagement
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-blue-900/50 text-blue-400 shadow-lg shadow-blue-900/30' 
            : 'bg-blue-100 text-blue-600 shadow-md shadow-blue-200/30'
        }`}>
          Live
        </span>
      </div>
      
      <div className="h-32 mb-3 relative">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d={createEngagementPath(engagementData)}
            stroke="url(#engagementGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          {engagementData.map((value, i) => {
            const x = (i / (engagementData.length - 1)) * 100;
            const y = 100 - (value / 100) * 80;
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="1"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
              />
            );
          })}
          <defs>
            <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className={`flex justify-between text-[8px] transition-colors duration-300 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {hours.map((hour, i) => (
          <span key={i} className={i % 3 === 0 ? 'font-medium' : ''}>
            {hour}
          </span>
        ))}
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className={`text-xs transition-colors duration-300 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <span className="font-medium">Peak:</span> 96% at 8PM
        </div>
        <div className="text-xs text-emerald-600 font-medium">
          +12.4% vs yesterday
        </div>
      </div>
    </motion.div>
  );
}; 