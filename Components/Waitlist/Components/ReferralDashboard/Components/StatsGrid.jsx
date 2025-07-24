import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatsGrid = ({ referralStats, currentUserRank, currentUserPosition }) => {
  // Ensure we have valid numbers for all stats
  const ensureNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const stats = [
    {
      name: 'Global Rank',
      value: currentUserRank,
      unit: '',
      color: 'text-indigo-400',
      description: 'Your rank among all participants.'
    },
    {
      name: 'Referrals',
      value: ensureNumber(referralStats?.stats?.totalReferrals),
      unit: 'connects',
      color: 'text-amber-400',
      description: 'Successful sign-ups from your link.'
    },
    {
      name: 'Position Boost',
      value: ensureNumber(referralStats?.positionImprovement),
      unit: 'spots',
      color: 'text-emerald-400',
      description: 'How many spots you have moved up.'
    }
  ];

  const statVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.name}
          custom={i}
          variants={statVariant}
          initial="hidden"
          animate="visible"
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-400">{stat.name}</p>
            <div className={`text-4xl font-light ${stat.color} mt-2`}>
              {stat.name === 'Global Rank' ? (
                stat.value ? `#${stat.value}` : 'N/A'
              ) : stat.name === 'Position Boost' ? (
                <>
                  {stat.value > 0 && '+'}{/* Only add + for positive values */}
                  <CountUp
                    start={0}
                    end={Math.abs(stat.value)} // Use absolute value to ensure positive display
                    duration={2.5}
                    separator=","
                    useEasing={true}
                  />
                </>
              ) : (
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  separator=","
                  useEasing={true}
                />
              )}
              {stat.unit && <span className="text-lg font-medium ml-2 text-slate-500">{stat.unit}</span>}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            {stat.name === 'Global Rank' && currentUserPosition ? 
              `${stat.description} (Position: ${currentUserPosition})` : 
              stat.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
