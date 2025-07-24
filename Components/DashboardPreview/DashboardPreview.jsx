import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, Clock, BarChart3, Users, DollarSign, Activity,
  Code, Target
} from 'lucide-react';
import SectionLabel from '../Landing/Components/Animations/SectionLabel';
import LoadingSpinner from '../common/LoadingSpinner';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { DashboardLoadingFallback } from './DashboardLoadingFallback';
import { TABS_DATA } from './constants';
import { BrowserHeader } from './components/BrowserHeader';
import { AppHeader } from './components/AppHeader';
import { TabNavigation } from './components/TabNavigation';
import { TabContent } from './components/TabContent';
import { DashboardFooter } from './components/DashboardFooter';

// Main Dashboard Preview Component
const DashboardPreviewCore = ({ isDark = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  
  const intervalRef = useRef(null);

  // Client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dashboard screens
  const dashboardScreens = [
    'https://res.cloudinary.com/dgak25skk/image/upload/f_auto,q_auto,w_1200,c_limit,dpr_auto/v1745437791/Screenshot_2025-04-23_at_4.49.11_PM_d3oqjt.png',
    'https://res.cloudinary.com/dgak25skk/image/upload/f_auto,q_auto,w_1200,c_limit,dpr_auto/v1745437942/Screenshot_2025-04-24_at_1.22.02_AM_rpkjsn.png',
    'https://res.cloudinary.com/dgak25skk/image/upload/f_auto,q_auto,w_1200,c_limit,dpr_auto/v1745406725/Screenshot_2025-04-23_at_4.40.17_PM_tslhhj.png',
    'https://res.cloudinary.com/dgak25skk/image/upload/f_auto,q_auto,w_1200,c_limit,dpr_auto/v1745437793/Screenshot_2025-04-23_at_4.48.44_PM_sdwqzb.png'
  ];

  // Auto-switch tabs
  const startAutoSwitch = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveTab(prev => (prev + 1) % TABS_DATA.length);
    }, 7000);
  }, []);

  useEffect(() => {
    startAutoSwitch();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSwitch]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    startAutoSwitch();
  };

  // Static data for dashboard content
  const performanceData = [
    { label: 'Total Users', value: '14.2k', change: '+27%', color: 'indigo', icon: <Users size={14} /> },
    { label: 'Revenue', value: '$92.8k', change: '+18%', color: 'violet', icon: <DollarSign size={14} /> },
    { label: 'Engagement', value: '94%', change: '+5%', color: 'emerald', icon: <Activity size={14} /> },
    { label: 'Conversion', value: '3.8%', change: '+12%', color: 'amber', icon: <ArrowUp size={14} /> },
  ];

  const productsData = [
    { name: 'AI Code Assistant', icon: <Code size={16} />, progress: 80, change: '+24%', users: '16,482', target: '20,000', color: 'violet' },
    { name: 'Marketing Suite', icon: <Target size={16} />, progress: 60, change: '+12%', users: '9,217', target: '15,000', color: 'indigo' },
    { name: 'Data Analytics Platform', icon: <BarChart3 size={16} />, progress: 45, change: '+8%', users: '5,103', target: '10,000', color: 'blue' },
  ];

  const analyticsData = [
    { name: 'User Growth', value: '14,256', change: '+27%', period: 'vs last month', color: 'emerald', icon: <Users size={16} /> },
    { name: 'Revenue', value: '$92,845', change: '+18%', period: 'vs last month', color: 'blue', icon: <DollarSign size={16} /> },
    { name: 'Active Sessions', value: '8,492', change: '+32%', period: 'vs last month', color: 'violet', icon: <Activity size={16} /> },
    { name: 'Avg. Session Duration', value: '4m 32s', change: '+12%', period: 'vs last month', color: 'indigo', icon: <Clock size={16} /> },
  ];

  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
    hover: { y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  return (
    <div className={`py-12 sm:py-16 transition-colors duration-300`}>
      <div className="flex justify-center mb-8">
        {isClient ? (
          <SectionLabel
            text="Dashboard Preview"
            size="medium"
            alignment="center"
            variant="dashboard"
            glowEffect={true}
            animationStyle="fade"
            gradientText={true}
          />
        ) : (
          <div className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-300 ${
            darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-600 bg-slate-100'
          }`}>
            Dashboard Preview
          </div>
        )}
      </div>

      <motion.div
        className={`relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden h-[85vh] flex flex-col border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950/90 border-slate-700/50 shadow-black/40' 
            : 'bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 border-slate-200/80 shadow-slate-200/60'
        }`}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Browser Header */}
          <BrowserHeader darkMode={darkMode} />
          
          {/* App Header */}
          <AppHeader darkMode={darkMode} onDarkModeToggle={() => setDarkMode(!darkMode)} />
          
          {/* Tab Navigation */}
          <TabNavigation 
            tabs={TABS_DATA}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            isClient={isClient}
            darkMode={darkMode}
          />

          {/* Main Content */}
          <div className="flex-grow relative overflow-hidden">
            {isClient ? (
              <AnimatePresence initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.97, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full"
                >
                  <motion.img
                    src={dashboardScreens[activeTab]}
                    alt={`${TABS_DATA[activeTab]?.name || 'Dashboard'} Background`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-25"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/85' 
                      : 'bg-gradient-to-br from-white/90 via-white/80 to-slate-50/70'
                  }`} />
                  
                  <div className="absolute inset-0 p-4 sm:p-5 pointer-events-none overflow-y-auto">
                    <TabContent 
                      activeTab={activeTab}
                      performanceData={performanceData}
                      productsData={productsData}
                      analyticsData={analyticsData}
                      notificationsEnabled={notificationsEnabled}
                      twoFactorAuthEnabled={twoFactorAuthEnabled}
                      darkMode={darkMode}
                      onNotificationToggle={() => setNotificationsEnabled(!notificationsEnabled)}
                      on2FAToggle={() => setTwoFactorAuthEnabled(!twoFactorAuthEnabled)}
                      onDarkModeToggle={() => setDarkMode(!darkMode)}
                      containerVariants={containerVariants}
                      cardVariants={cardVariants}
                      itemVariants={itemVariants}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="md" color="violet" showBackground fullScreen />
              </div>
            )}
          </div>

          {/* Footer */}
          <DashboardFooter darkMode={darkMode} />
        </div>
      </motion.div>
    </div>
  );
};

// Production-safe wrapper component
const DashboardPreview = ({ isDark = false }) => {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <DashboardPreviewCore isDark={isDark} />
      </Suspense>
    </DashboardErrorBoundary>
  );
};

export default DashboardPreview; 