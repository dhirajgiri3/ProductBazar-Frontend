import React from "react";
import { motion } from "framer-motion";
import { Share2, RefreshCw } from "lucide-react";

const DashboardHeader = ({ onRefresh, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8"
    >
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-light text-white">
            Referral Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Track your progress and accelerate your waitlist position
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/30 backdrop-blur-xl rounded-xl border border-slate-800/50">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 text-sm font-medium">
              Growth Dashboard
            </span>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader; 