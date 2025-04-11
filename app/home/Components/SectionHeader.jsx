"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const SectionHeader = ({ 
  title, 
  icon, 
  iconBgColor = "bg-violet-100", 
  iconColor = "text-violet-600", 
  viewAllUrl = null, 
  viewAllText = "View all",
  actions = null
}) => {
  return (
    <motion.div 
      className="flex items-center justify-between mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center">
        {icon && (
          <div className={`${iconBgColor} w-8 h-8 rounded-md mr-3 flex items-center justify-center shadow-sm`}>
            {React.cloneElement(icon, { className: `w-4 h-4 ${iconColor}` })}
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="flex items-center gap-3">
        {actions}
        
        {viewAllUrl && (
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
            <Link 
              href={viewAllUrl}
              className="flex items-center text-sm font-medium text-violet-700 hover:text-violet-800 transition-colors bg-violet-50 px-3 py-1.5 rounded-lg"
            >
              {viewAllText}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SectionHeader;