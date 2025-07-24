import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export const TrafficSourcesChart = ({ cardVariants, darkMode }) => {
  const sources = [
    { name: 'Organic Search', value: 45, color: '#10b981' },
    { name: 'Direct', value: 25, color: '#3b82f6' },
    { name: 'Social Media', value: 20, color: '#f59e0b' },
    { name: 'Referral', value: 10, color: '#8b5cf6' }
  ];
  
  const total = sources.reduce((sum, source) => sum + source.value, 0);
  let currentAngle = 0;
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`backdrop-blur-xl rounded-xl p-4 shadow-xl border cursor-default transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800/70 border-slate-700/60' 
          : 'bg-white/70 border-slate-200/60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          <BarChart3 size={16} className="mr-2.5 text-emerald-500" /> Traffic Sources
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-medium">
          This Month
        </span>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {sources.map((source, index) => {
              const percentage = (source.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 50 + 35 * Math.cos((currentAngle - 90) * Math.PI / 180);
              const y2 = 50 + 35 * Math.sin((currentAngle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              return (
                <motion.path
                  key={source.name}
                  d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={source.color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                />
              );
            })}
            <circle cx="50" cy="50" r="15" fill={darkMode ? "#1e293b" : "white"} />
          </svg>
        </div>
      </div>
      
      <div className="space-y-2">
        {sources.map((source, index) => (
          <motion.div
            key={source.name}
            className="flex items-center justify-between text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: source.color }}
              />
              <span className={`transition-colors duration-300 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>{source.name}</span>
            </div>
            <span className={`font-medium transition-colors duration-300 ${
              darkMode ? 'text-slate-100' : 'text-slate-800'
            }`}>{source.value}%</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 