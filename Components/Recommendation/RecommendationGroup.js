import { useRef } from 'react';
import { motion } from 'framer-motion';
import HomeProductCard from '../../app/home/Components/HomeProductCard';

const RecommendationGroup = ({
  title,
  recommendations = [],
  onInteraction
}) => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -400 : 400;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!recommendations.length) return null;

  return (
    <div className="space-y-2">
      {/* Group Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        {/* Navigation Buttons */}
        {recommendations.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Scroll left"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Scroll right"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.product._id}
            className="flex-none w-72 snap-start mr-4 last:mr-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <HomeProductCard
              product={rec.product}
              reason={rec.reason}
              score={rec.score}
              onInteraction={(type) => onInteraction(rec.product._id, type, index)}
              showScore={false}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Group Info */}
      <div className="text-sm text-gray-500">
        {recommendations.length} {recommendations.length === 1 ? 'item' : 'items'}
      </div>

      {/* Custom Scrollbar Style */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RecommendationGroup;