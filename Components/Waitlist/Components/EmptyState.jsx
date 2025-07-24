import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, ArrowRight, TrendingUp, Star } from 'lucide-react';
import {
  DESIGN_TOKENS,
  MOTION_VARIANTS,
  getButtonClass,
  getCardClass,
  getGradientClass,
  getTextGradientClass,
} from '../designTokens.js';

const EmptyState = React.memo(() => (
  <section className="text-center" id="empty-state">
    <div className="relative max-w-3xl mx-auto">
      {/* Minimal card with subtle glass effect */}
      <motion.div
        variants={MOTION_VARIANTS.slideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className={`${getCardClass('primary')} ${DESIGN_TOKENS.spacing.card} relative`}
      >
         {/* Subtle animated background grid */}
        <motion.div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${DESIGN_TOKENS.colors.border.primary.replace('border-', '')} 1px, transparent 1px),
              linear-gradient(to bottom, ${DESIGN_TOKENS.colors.border.primary.replace('border-', '')} 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
        />

        {/* Floating particles effect */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/40 rounded-full"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Improved grid background */}
        <motion.div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1px, transparent 0)
            `,
            backgroundSize: '24px 24px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        />

        <motion.div
          variants={MOTION_VARIANTS.staggerContainer}
          className="relative z-10 space-y-12 py-16"
        >
          {/* Minimal icon section */}
          <motion.div variants={MOTION_VARIANTS.scaleIn} className="mx-auto w-16 h-16">
            <motion.div
              className="w-full h-full bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/30 flex items-center justify-center relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <Trophy className="w-7 h-7 text-amber-400/90" />
            </motion.div>
          </motion.div>

          {/* Clean heading section */}
          <motion.div variants={MOTION_VARIANTS.fadeIn} className="space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                <span className="text-xs text-slate-400 tracking-[0.2em] uppercase font-medium">
                  Founding Access
                </span>
                <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
              </motion.div>

              <div className="relative">
                {/* Animated gradient sheen behind main title */}
                <motion.div
                  className={`absolute inset-0 ${getGradientClass('primary', 50)} opacity-20 blur-2xl`}
                  animate={{ x: ["-10%", "10%", "-10%"], rotate: [0, 5, 0], opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-light text-white leading-[1.1] tracking-tight main-title">
                  Join the{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-normal">
                    Founding Community
                  </span>
                </h2>
              </div>
            </div>

            <motion.p
              className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Be among the first to access ProductBazar's ecosystem. Join thousands of builders, investors, and partners on the waitlist.
            </motion.p>
          </motion.div>

          {/* Minimal feature indicators */}
          <motion.div
            variants={MOTION_VARIANTS.staggerContainer}
            className="flex justify-center gap-12"
            initial="hidden"
            animate="visible"
          >
            {[
              { Icon: Users, label: 'Community' },
              { Icon: TrendingUp, label: 'Growth' },
              { Icon: Trophy, label: 'Rewards' }
            ].map(({ Icon, label }) => (
              <motion.div
                key={label}
                variants={MOTION_VARIANTS.staggerItem}
                className="flex flex-col items-center gap-3 group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Clean CTA section */}
          <motion.div variants={MOTION_VARIANTS.fadeIn} className="space-y-4">
            <motion.button
              type="button"
              aria-label="Join the waitlist"
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Join the Waitlist
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.button>

            <motion.p
              className="text-sm text-slate-500 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span>No commitment required</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span>Join thousands of others</span>
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
));

EmptyState.displayName = 'EmptyState';

export default EmptyState;