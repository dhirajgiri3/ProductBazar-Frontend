import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Clock, Trophy } from 'lucide-react';

const ActivationGuide = React.memo(({ scrollToPosition }) => (
  <div className="text-center">
    <div className="relative max-w-2xl mx-auto">
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/30">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full mx-auto flex items-center justify-center border border-amber-500/20">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Unlock Your Growth Dashboard
          </h2>
          
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            You're successfully on the waitlist! To access your personalized Growth Dashboard and start earning referral rewards, you need to check your position first.
          </p>
          
          <button
            onClick={scrollToPosition}
            className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Zap className="w-5 h-5" />
            <span>Unlock My Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Takes 30 seconds</span>
            </div>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Earn rewards immediately</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ActivationGuide.displayName = 'ActivationGuide';

export default ActivationGuide; 