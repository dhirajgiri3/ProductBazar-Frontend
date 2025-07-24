import { motion } from 'framer-motion';
import { Settings, BellIcon, Shield, Moon, Sun } from 'lucide-react';
import { SettingsRow } from '../SettingsRow';
import { ToggleButton } from '../ToggleButton';

export const SettingsCard = ({
  notificationsEnabled,
  twoFactorAuthEnabled,
  darkMode,
  onNotificationToggle,
  on2FAToggle,
  onDarkModeToggle,
  cardVariants,
  itemVariants,
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className={`backdrop-blur-xl rounded-xl p-5 shadow-xl border cursor-default transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-800/80 border-slate-600/60 shadow-slate-900/30' 
        : 'bg-white/90 border-slate-200/70 shadow-slate-200/40'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className={`font-semibold text-sm flex items-center transition-colors duration-300 ${
        darkMode ? 'text-slate-100' : 'text-slate-800'
      }`}>
        <Settings size={16} className="mr-2.5 text-violet-500" /> System Settings
      </h3>
      <span className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
        darkMode 
          ? 'bg-violet-900/50 text-violet-400 shadow-lg shadow-violet-900/30' 
          : 'bg-violet-100 text-violet-600 shadow-md shadow-violet-200/30'
      }`}>Admin</span>
    </div>
    <div className="space-y-3">
      <SettingsRow
        label="Email Notifications"
        description="Receive email updates about your account activity"
        icon={<BellIcon size={15} />}
        variants={itemVariants}
        iconColor="violet"
        darkMode={darkMode}
      >
        <ToggleButton
          checked={notificationsEnabled}
          onChange={onNotificationToggle}
          activeColor="violet"
        />
      </SettingsRow>
      <SettingsRow
        label="Two-Factor Auth"
        description="Add an extra layer of security to your account"
        icon={<Shield size={15} />}
        variants={itemVariants}
        iconColor="emerald"
        darkMode={darkMode}
      >
        <ToggleButton
          checked={twoFactorAuthEnabled}
          onChange={on2FAToggle}
          activeColor="emerald"
        />
      </SettingsRow>
      <SettingsRow
        label="Dark Mode"
        description="Switch between light and dark themes"
        icon={darkMode ? <Sun size={15} /> : <Moon size={15} />}
        variants={itemVariants}
        iconColor="slate"
        darkMode={darkMode}
      >
        <ToggleButton
          checked={darkMode}
          onChange={onDarkModeToggle}
          activeColor="slate"
        />
      </SettingsRow>
    </div>
  </motion.div>
); 