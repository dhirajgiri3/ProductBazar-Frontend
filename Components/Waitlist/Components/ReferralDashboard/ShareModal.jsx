import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, ArrowUp } from "lucide-react";

const ShareModal = ({ isOpen, onClose, onShare, referralCode }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform) => {
    onShare(platform);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full border border-slate-800/50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-lg opacity-60" />
          
          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-2xl font-light text-white">Share Your Link</h3>
                <p className="text-slate-400">
                  Get <span className="font-medium text-emerald-400">+5 positions</span> for each successful connection
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Copy Link */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?ref=${referralCode || ''}`}
                className="w-full pr-32 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
              />
              <button
                onClick={handleCopy}
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-all duration-200 ${
                  isCopied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Share */}
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-500">Or share via</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-3 bg-slate-800/50 text-slate-300 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center gap-3 bg-slate-800/50 text-slate-300 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="flex items-start gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              
              <div>
                <h4 className="font-medium text-indigo-400 mb-2">Pro Tip</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Personal messages perform 3x better than generic shares. Tell your friends why you're excited about the product!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal; 