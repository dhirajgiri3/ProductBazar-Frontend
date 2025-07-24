import { motion } from 'framer-motion';
import { Zap, Plus, Upload, Download, Edit } from 'lucide-react';
import { colorMap } from '../../constants';

export const QuickActionsCard = ({ cardVariants, darkMode }) => {
  const actions = [
    { label: 'Add New Product', icon: <Plus size={16} />, color: 'emerald', action: 'add' },
    { label: 'Import Products', icon: <Upload size={16} />, color: 'blue', action: 'import' },
    { label: 'Export Data', icon: <Download size={16} />, color: 'violet', action: 'export' },
    { label: 'Bulk Edit', icon: <Edit size={16} />, color: 'amber', action: 'edit' }
  ];

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
          <Zap size={16} className="mr-2.5 text-orange-500" /> Quick Actions
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
          Fast Access
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const color = colorMap[action.color] || colorMap.slate;
          return (
            <motion.button
              key={action.label}
              className={`p-3 rounded-lg border transition-all group ${color.bg} ${color.text} ${
                darkMode 
                  ? 'border-slate-700/60 hover:bg-slate-700/50' 
                  : 'border-slate-200/60 hover:bg-slate-50/50'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.text} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>{action.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}; 