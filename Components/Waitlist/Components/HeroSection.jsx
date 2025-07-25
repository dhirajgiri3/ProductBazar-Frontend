import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Timer, ChevronRight, User } from 'lucide-react';
import WaitlistForm from './WaitlistForm';
import SimpleEmailForm from './SimpleEmailForm';
import WaitlistSuccessModal from './WaitlistSuccessModal';
import PositionCheckCTA from './PositionCheckCTA';
import { DESIGN_TOKENS, MOTION_VARIANTS } from '../designTokens.js';

function HeroSection({
  liveCounter,
  showSuccess,
  showFullForm,
  submissionData,
  resetForm,
  handleFormSuccess,
  handleSimpleFormSuccess,
  setShowFullForm,
  onAccessDashboard,
  onCheckPosition,
  isCheckingPosition = false,
  isLoading = false, // Add loading state prop
}) {
  const heroVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: DESIGN_TOKENS.animations.duration.slow, 
        ease: DESIGN_TOKENS.animations.ease 
      } 
    },
  };

  // Format the counter with proper loading state
  const formatCounter = () => {
    if (isLoading) {
      return (
        <motion.span
          className="text-emerald-400 font-semibold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading...
        </motion.span>
      );
    }
    
    const count = liveCounter || 0;
    return (
      <span className="text-emerald-400 font-semibold">
        {count.toLocaleString()}
      </span>
    );
  };

  return (
    <div className="text-center space-y-12">
      {/* Success Modal Overlay */}
      <WaitlistSuccessModal 
        open={showSuccess} 
        onClose={resetForm} 
        submissionData={submissionData} 
        onAccessDashboard={onAccessDashboard}
      />
      
      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DESIGN_TOKENS.animations.duration.normal }}
        className="flex justify-center px-4"
      >
        <div className={`inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${DESIGN_TOKENS.colors.background.elevated} backdrop-blur-sm ${DESIGN_TOKENS.radius.pill} ${DESIGN_TOKENS.colors.border.secondary} ${DESIGN_TOKENS.shadows.card} max-w-full`}>
          <motion.div
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full flex-shrink-0"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className={`${DESIGN_TOKENS.colors.text.secondary} text-xs sm:text-sm truncate`}>
            {formatCounter()}{' '}
            <span className="hidden xs:inline">Builders, Investors & Partners Inside</span>
            <span className="xs:hidden">Members Inside</span>
          </span>
          <div className="w-1 h-1 bg-slate-600 rounded-full flex-shrink-0 hidden sm:block" />
          <span className={`${DESIGN_TOKENS.colors.text.tertiary} text-xs sm:text-sm flex-shrink-0 hidden sm:block`}>
            Founding Access Only
          </span>
        </div>
      </motion.div>

      {/* Main Headline Section */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero Title */}
        <div className="space-y-4">
          <motion.h1
            className={`${DESIGN_TOKENS.typography.h1} w-full italic ${DESIGN_TOKENS.colors.text.primary}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DESIGN_TOKENS.animations.duration.slow, delay: 0.2 }}
          >
            Beyond The{' '}
            <motion.span
              className="relative inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DESIGN_TOKENS.animations.duration.slow, delay: 0.5 }}
            >
              <span className={`bg-gradient-to-r ${DESIGN_TOKENS.colors.primary[50]} bg-clip-text text-transparent font-medium`}>
                Launch.
              </span>
            </motion.span>
          </motion.h1>

          <motion.p
            className={`${DESIGN_TOKENS.typography.body} ${DESIGN_TOKENS.colors.text.secondary} max-w-xl mx-auto`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DESIGN_TOKENS.animations.duration.slow, delay: 0.6 }}
          >
            The ecosystem for products with a story. Launch with context, track your journey, and connect with the people who will help you grow. Secure your founding member status and unlock referral rewards.
          </motion.p>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DESIGN_TOKENS.animations.duration.slow, delay: 1.0 }}
        className="space-y-8"
      >
        {/* Main Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              {showFullForm ? (
                <WaitlistForm
                  onSuccess={handleFormSuccess}
                  onClose={() => setShowFullForm(false)}
                />
              ) : (
                <SimpleEmailForm
                  onSuccess={handleSimpleFormSuccess}
                  onUpgrade={() => setShowFullForm(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Position Check CTA for existing users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DESIGN_TOKENS.animations.duration.normal, delay: 1.1 }}
          className="flex justify-center"
        >
          <PositionCheckCTA 
            onCheckPosition={onCheckPosition}
            isChecking={isCheckingPosition}
          />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: DESIGN_TOKENS.animations.duration.normal }}
          className={`flex flex-wrap items-center justify-center gap-6 sm:gap-8 ${DESIGN_TOKENS.colors.text.muted} ${DESIGN_TOKENS.typography.small}`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Founding Member Benefits</span>
          </div>
          <div className="w-1 h-1 bg-slate-600 rounded-full" />
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Curated Access</span>
          </div>
          <div className="w-1 h-1 bg-slate-600 rounded-full" />
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Strategic Advantage</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: DESIGN_TOKENS.animations.duration.slow }}
        className="flex justify-center pb-8 lg:pb-12"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() =>
            document.getElementById('dashboard-preview')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <span className={`${DESIGN_TOKENS.colors.text.muted} ${DESIGN_TOKENS.typography.small} uppercase group-hover:${DESIGN_TOKENS.colors.text.tertiary} transition-colors`}>
            See the Full Picture
          </span>
          <ChevronRight className="w-5 h-5 text-slate-600 rotate-90 group-hover:text-slate-500 transition-colors" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HeroSection; 