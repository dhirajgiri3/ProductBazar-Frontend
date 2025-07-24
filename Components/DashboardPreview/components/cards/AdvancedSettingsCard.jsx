import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { ToggleButton } from '../ToggleButton';

export const AdvancedSettingsCard = ({ cardVariants, itemVariants, darkMode }) => {
  const advancedSettings = [
    { label: 'Auto-backup', description: 'Daily automatic backups', enabled: true },
    { label: 'Analytics Tracking', description: 'Collect usage analytics', enabled: true },
    { label: 'Beta Features', description: 'Access experimental features', enabled: false },
    { label: 'Debug Mode', description: 'Enable detailed logging', enabled: false }
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
          <Settings size={16} className="mr-2.5 text-indigo-500" /> Advanced Settings
        </h3>
        <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 font-medium">
          Expert
        </span>
      </div>
      
      <div className="space-y-3">
        {advancedSettings.map((setting, index) => (
          <motion.div
            key={setting.label}
            variants={itemVariants}
            className={`flex items-center justify-between p-3 rounded-lg border group transition-colors duration-300 ${
              darkMode 
                ? 'border-slate-700/70 hover:bg-slate-700/40' 
                : 'border-slate-200/70 hover:bg-slate-50/40'
            }`}
            whileHover={{ x: 2.5 }}
          >
            <div>
              <p className={`text-xs font-medium transition-colors duration-300 ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>{setting.label}</p>
              <p className={`text-[10px] mt-0.5 transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{setting.description}</p>
            </div>
            <ToggleButton
              checked={setting.enabled}
              onChange={() => {}}
              activeColor={setting.enabled ? 'emerald' : 'slate'}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 