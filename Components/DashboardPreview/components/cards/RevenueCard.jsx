import { motion } from 'framer-motion';
import { BarChart3, ArrowUp } from 'lucide-react';

export const RevenueCard = ({ cardVariants, darkMode }) => {
  // Realistic revenue data with smooth progression - reduced quantity for minimalism
  const revenueData = [28, 35, 42, 52, 58, 65, 72, 78, 85, 92, 102, 112, 122];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create smooth path data
  const createSmoothPath = (data) => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / 130) * 80; // Scale to fit in chart
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

  const smoothPath = createSmoothPath(revenueData);
  const areaPath = createSmoothPath(revenueData) + ' L 100 100 L 0 100 Z';

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-5 shadow-xl border cursor-default w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
          : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <BarChart3 size={16} className="mr-2.5 text-violet-500" /> Revenue Analytics
        </h3>
        <div className="flex space-x-1">
          {['Week', 'Month', 'Year'].map((period, index) => (
            <motion.button
              key={period}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                index === 1 
                  ? darkMode 
                    ? 'bg-violet-900/50 text-violet-400 shadow-lg shadow-violet-900/30' 
                    : 'bg-violet-100 text-violet-700 shadow-md shadow-violet-200/30'
                  : darkMode 
                    ? 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 shadow-md shadow-slate-900/30' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-md shadow-slate-200/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {period}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className={`h-48 mb-4 p-4 rounded-xl border shadow-inner backdrop-blur-sm relative overflow-hidden transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-700/60 border-slate-600/50' 
          : 'bg-gradient-to-br from-slate-50/80 to-white/60 border-slate-200/50'
      }`}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`w-full h-px transition-colors duration-300 ${
              darkMode ? 'bg-slate-600/30' : 'bg-slate-300/30'
            }`} />
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-4 top-0 h-full flex flex-col justify-between text-[9px] py-4 font-medium">
          {['$120k', '$100k', '$80k', '$60k', '$40k', '$20k'].map((label, i) => (
            <div key={i} className={`transition-colors duration-300 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {label}
            </div>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="absolute bottom-4 left-12 right-4 h-[calc(100%-32px)]">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#revenueAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
            
            {/* Main line */}
            <motion.path
              d={smoothPath}
              stroke="url(#revenueLineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
            />
            
            {/* Data points - reduced size and quantity for minimalism */}
            {revenueData.map((value, i) => {
              const x = (i / (revenueData.length - 1)) * 100;
              const y = 100 - (value / 130) * 80;
              const isHighlighted = i === revenueData.length - 1;
              
              return (
                <motion.circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={isHighlighted ? "1.8" : "1"}
                  fill={isHighlighted ? "#8b5cf6" : "#a855f7"}
                  stroke="white"
                  strokeWidth={isHighlighted ? "1" : "0.5"}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 1.2 + i * 0.05,
                    type: 'spring',
                    stiffness: 300
                  }}
                  className="cursor-pointer hover:r-2 transition-all"
                />
              );
            })}
            
            {/* Tooltip for latest point */}
            <motion.foreignObject
              x={`${(revenueData.length - 1) / (revenueData.length - 1) * 100 - 8}%`}
              y={`${100 - (revenueData[revenueData.length - 1] / 130) * 80 - 25}%`}
              width="16"
              height="20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <div className="bg-violet-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg transform -translate-x-1/2 -translate-y-full">
                ${revenueData[revenueData.length - 1]}k
              </div>
            </motion.foreignObject>
            
            {/* Gradients */}
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="revenueLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-1 left-12 right-4 flex justify-between text-[9px] font-medium">
          {months.map((month, i) => (
            <div
              key={i}
              className={`${i === 9 ? 'text-violet-600' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              {month}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className={`flex items-center text-sm transition-colors duration-300 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>
            <span className="font-medium">Monthly Target:</span>
            <span className="font-bold ml-2 text-violet-600">${revenueData[revenueData.length - 1]}k / $130k</span>
          </div>
          <div className={`w-56 rounded-full h-2 transition-colors duration-300 ${
            darkMode ? 'bg-slate-700/60' : 'bg-slate-200/60'
          }`}>
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(revenueData[revenueData.length - 1] / 120) * 100}%` }}
              transition={{ delay: 1, duration: 1.5, ease: 'circOut' }}
            />
          </div>
        </div>
        <div className="text-right">
          <motion.div 
            className="flex items-center justify-end text-emerald-600 font-bold text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
          >
            <ArrowUp size={14} className="mr-1" />
            <span>+24.8%</span>
          </motion.div>
          <span className={`text-[10px] transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>vs last month</span>
        </div>
      </div>
    </motion.div>
  );
}; 