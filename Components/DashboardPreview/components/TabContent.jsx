import { motion } from 'framer-motion';
import { MetricCard } from './cards/MetricCard';
import { RevenueCard } from './cards/RevenueCard';
import { ProductListCard } from './cards/ProductListCard';
import { FeaturedLaunchCard } from './cards/FeaturedLaunchCard';
import { ProductStatsCard } from './cards/ProductStatsCard';
import { ProductCategoriesCard } from './cards/ProductCategoriesCard';
import { ProductTrendsCard } from './cards/ProductTrendsCard';
import { RecentProductActivityCard } from './cards/RecentProductActivityCard';
import { QuickActionsCard } from './cards/QuickActionsCard';
import { AnalyticsCard } from './cards/AnalyticsCard';
import { UserEngagementChart } from './cards/UserEngagementChart';
import { TrafficSourcesChart } from './cards/TrafficSourcesChart';
import { ConversionFunnelChart } from './cards/ConversionFunnelChart';
import { TopProductsTable } from './cards/TopProductsTable';
import { RecentActivityFeed } from './cards/RecentActivityFeed';
import { SettingsCard } from './cards/SettingsCard';
import { SecurityOverviewCard } from './cards/SecurityOverviewCard';
import { AccountStatusCard } from './cards/AccountStatusCard';
import { AdvancedSettingsCard } from './cards/AdvancedSettingsCard';
import { IntegrationSettingsCard } from './cards/IntegrationSettingsCard';

export const TabContent = ({ 
  activeTab, 
  performanceData, 
  productsData, 
  analyticsData,
  notificationsEnabled,
  twoFactorAuthEnabled,
  darkMode,
  onNotificationToggle,
  on2FAToggle,
  onDarkModeToggle,
  containerVariants,
  cardVariants,
  itemVariants 
}) => {
  switch (activeTab) {
    case 0:
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {performanceData.map(item => (
            <MetricCard key={item.label} item={item} cardVariants={cardVariants} darkMode={darkMode} />
          ))}
          <div className="sm:col-span-2 lg:col-span-4">
            <RevenueCard cardVariants={cardVariants} darkMode={darkMode} />
          </div>
        </motion.div>
      );
    case 1:
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Top row - Product overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProductListCard productsData={productsData} cardVariants={cardVariants} itemVariants={itemVariants} darkMode={darkMode} />
            <FeaturedLaunchCard cardVariants={cardVariants} darkMode={darkMode} />
            <ProductStatsCard cardVariants={cardVariants} darkMode={darkMode} />
          </div>
          
          {/* Middle row - Product categories and trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProductCategoriesCard cardVariants={cardVariants} darkMode={darkMode} />
            <ProductTrendsCard cardVariants={cardVariants} darkMode={darkMode} />
          </div>
          
          {/* Bottom row - Recent activity and quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentProductActivityCard cardVariants={cardVariants} darkMode={darkMode} />
            <QuickActionsCard cardVariants={cardVariants} darkMode={darkMode} />
          </div>
        </motion.div>
      );
    case 2:
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Top row - Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {analyticsData.map(item => (
              <AnalyticsCard key={item.name} item={item} cardVariants={cardVariants} darkMode={darkMode} />
            ))}
          </div>
          
          {/* Middle row - Charts and insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <UserEngagementChart cardVariants={cardVariants} darkMode={darkMode} />
            <TrafficSourcesChart cardVariants={cardVariants} darkMode={darkMode} />
            <ConversionFunnelChart cardVariants={cardVariants} darkMode={darkMode} />
          </div>
          
          {/* Bottom row - Detailed analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopProductsTable cardVariants={cardVariants} darkMode={darkMode} />
            <RecentActivityFeed cardVariants={cardVariants} darkMode={darkMode} />
          </div>
        </motion.div>
      );
    case 3:
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Settings Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SettingsCard
              notificationsEnabled={notificationsEnabled}
              twoFactorAuthEnabled={twoFactorAuthEnabled}
              darkMode={darkMode}
              onNotificationToggle={onNotificationToggle}
              on2FAToggle={on2FAToggle}
              onDarkModeToggle={onDarkModeToggle}
              cardVariants={cardVariants}
              itemVariants={itemVariants}
            />
            <SecurityOverviewCard cardVariants={cardVariants} darkMode={darkMode} />
            <AccountStatusCard cardVariants={cardVariants} darkMode={darkMode} />
          </div>
          
          {/* Advanced Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AdvancedSettingsCard cardVariants={cardVariants} itemVariants={itemVariants} darkMode={darkMode} />
            <IntegrationSettingsCard cardVariants={cardVariants} itemVariants={itemVariants} darkMode={darkMode} />
          </div>
        </motion.div>
      );
    default:
      return null;
  }
}; 