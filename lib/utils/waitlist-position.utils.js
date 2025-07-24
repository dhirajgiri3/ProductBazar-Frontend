/**
 * Waitlist Position Utilities - Frontend
 * Mirroring some of the backend logic for optimistic UI updates and consistent calculations.
 */

/**
 * Calculate position improvement for referral stats
 * @param {number} referralCount - Number of successful referrals
 * @param {number} currentPosition - Current position
 * @param {number} boostAmount - Position boost per referral (default: 5)
 * @returns {number} Total position improvement
 */
export const calculatePositionImprovement = (referralCount, currentPosition, boostAmount = 5) => {
  if (!referralCount || referralCount <= 0) return 0;
  
  const totalBoost = referralCount * boostAmount;
  return Math.min(totalBoost, currentPosition > 0 ? currentPosition - 1 : 0);
};

/**
 * Format position for display with proper formatting
 * @param {number} position - The position number
 * @returns {string} Formatted position string
 */
export const formatPosition = (position) => {
  if (position === null || position === undefined) {
    return 'N/A';
  }
  return `#${position.toLocaleString()}`;
};

/**
 * Get position status based on position number
 * @param {number} position - The position number
 * @returns {Object} Status information
 */
export const getPositionStatus = (position) => {
  if (position <= 50) {
    return {
      color: 'emerald',
      text: 'Very Soon!',
      icon: 'Crown',
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-500/20 to-teal-500/20',
      description: "You're in the VIP zone! Early access is just around the corner.",
    };
  }
  if (position <= 200) {
    return {
      color: 'indigo',
      text: 'Coming Soon',
      icon: 'Rocket',
      gradient: 'from-indigo-400 to-purple-500',
      bgGradient: 'from-indigo-500/20 to-purple-500/20',
      description: "You're in the fast lane! Access is coming very soon.",
    };
  }
  if (position <= 500) {
    return {
      color: 'amber',
      text: 'In Progress',
      icon: 'Zap',
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      description: "Great position! You're moving up in the queue.",
    };
  }
  return {
    color: 'slate',
    text: 'Queued',
    icon: 'Timer',
    gradient: 'from-slate-400 to-slate-500',
    bgGradient: 'from-slate-500/20 to-slate-600/20',
    description: "You're in the queue. Share your link to move up faster!",
  };
};

/**
 * Calculate progress percentage based on position and total waiting
 * @param {number} position - User's position
 * @param {number} totalWaiting - Total waiting count
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgressPercentage = (position, totalWaiting) => {
  if (!position || !totalWaiting) return 0;
  return Math.max(
    0,
    Math.min(100, ((totalWaiting - position) / totalWaiting) * 100)
  );
};

/**
 * Get estimated invite date based on position
 * @param {number} position - User's position
 * @returns {Date} Estimated invite date
 */
export const calculateEstimatedInviteDate = (rawPosition) => {
  // More realistic invite rate: 25-50 invites per week
  const baseInviteRate = 35; // invites per week
  const weeksToInvite = Math.ceil(rawPosition / baseInviteRate);
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (weeksToInvite * 7));
  
  // Add some buffer for weekends and holidays
  estimatedDate.setDate(estimatedDate.getDate() + 2);
  
  return estimatedDate;
}; 