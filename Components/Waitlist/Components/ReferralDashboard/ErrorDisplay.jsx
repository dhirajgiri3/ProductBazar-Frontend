import React from "react";
import { motion } from "framer-motion";
import { X, RefreshCw } from "lucide-react";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Unable to Load Data</h3>
          <p className="text-slate-400 text-sm max-w-md">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay; 