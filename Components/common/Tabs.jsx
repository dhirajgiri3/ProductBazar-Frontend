// src/components/common/Tabs.jsx
import { motion } from "framer-motion";

const Tabs = ({ tabs, activeTab, onChange, className = "", size = "md", fullWidth = false }) => {
  const sizeClasses = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-6",
  };

  const tabClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={className}>
      <div className={`bg-gray-100 p-1 rounded-lg flex ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${tabClass} relative rounded-md font-medium transition-colors ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'} ${fullWidth ? 'flex-1' : ''}`}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;