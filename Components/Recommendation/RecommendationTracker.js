import { useEffect } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';
import { useInView } from 'react-intersection-observer';

const RecommendationTracker = ({ productId, recommendationType, onImpression }) => {
  const { recordInteraction } = useRecommendation();
  const { ref, inView, entry } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    let timeout;
    if (inView) {
      // Record impression after the item has been visible for 1 second
      timeout = setTimeout(() => {
        recordInteraction(productId, 'impression', {
          type: recommendationType,
          timestamp: Date.now(),
          viewportPosition: entry?.boundingClientRect?.y
        });
        onImpression?.();
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [inView, productId, recommendationType]);

  // Track clicks
  const handleClick = () => {
    recordInteraction(productId, 'click', {
      type: recommendationType,
      timestamp: Date.now()
    });
  };

  return (
    <div ref={ref} onClick={handleClick}>
      {/* This is a wrapper component - it doesn't render anything itself */}
      {/* but tracks interactions with its children */}
    </div>
  );
};

export default RecommendationTracker;