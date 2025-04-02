import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export const Tag = ({ text, onRemove }) => (
  <motion.span 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    layout
    className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-violet-100 text-violet-800 m-0.5 border border-violet-200"
  >
    {text}
    <button
      onClick={onRemove}
      className="ml-1.5 p-0.5 rounded-full hover:bg-violet-200 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-300"
      aria-label={`Remove ${text}`}
      title="Remove skill"
    >
      <XMarkIcon className="h-3 w-3" />
    </button>
  </motion.span>
);
