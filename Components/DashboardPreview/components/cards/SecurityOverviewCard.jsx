import { motion } from 'framer-motion';
import { Shield, Monitor, CheckCircle, AlertCircle } from 'lucide-react';

export const SecurityOverviewCard = ({ cardVariants, darkMode }) => {
  const securityItems = [
    { label: 'Last Login', value: '2 hours ago', status: 'secure', icon: <Shield size={14} /> },
    { label: 'Active Sessions', value: '3 devices', status: 'warning', icon: <Monitor size={14} /> },
    { label: 'Security Score', value: '92/100', status: 'excellent', icon: <CheckCircle size={14} /> },
    { label: 'Failed Attempts', value: '0 today', status: 'secure', icon: <AlertCircle size={14} /> }
  ];

  const getStatusColor = (status, darkMode) => {
    switch (status) {
      case 'secure': 
        return darkMode 
          ? 'text-emerald-400 bg-emerald-900/50 shadow-lg shadow-emerald-900/30' 
          : 'text-emerald-600 bg-emerald-100 shadow-md shadow-emerald-200/30';
      case 'warning': 
        return darkMode 
          ? 'text-amber-400 bg-amber-900/50 shadow-lg shadow-amber-900/30' 
          : 'text-amber-600 bg-amber-100 shadow-md shadow-amber-200/30';
      case 'excellent': 
        return darkMode 
          ? 'text-blue-400 bg-blue-900/50 shadow-lg shadow-blue-900/30' 
          : 'text-blue-600 bg-blue-100 shadow-md shadow-blue-200/30';
      default: 
        return darkMode 
          ? 'text-slate-400 bg-slate-700/50 shadow-lg shadow-slate-900/30' 
          : 'text-slate-600 bg-slate-100 shadow-md shadow-slate-200/30';
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
          <Shield size={16} className="mr-2.5 text-emerald-500" /> Security Overview
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
          darkMode 
            ? 'bg-emerald-900/50 text-emerald-400 shadow-lg shadow-emerald-900/30' 
            : 'bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-200/30'
        }`}>
          Secure
        </span>
      </div>
      
      <div className="space-y-3">
        {securityItems.map((item, index) => (
          <motion.div
            key={item.label}
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
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-300 ${
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {item.icon}
              </div>
              <div>
                <p className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>{item.label}</p>
                <p className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>{item.value}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(item.status, darkMode)}`}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 