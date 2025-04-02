import { useState } from 'react';
import { useRecommendation } from '../../Contexts/Recommendation/RecommendationContext';

const RecommendationFeedback = ({ productId, recommendationType }) => {
  const [feedback, setFeedback] = useState('');
  const { recordInteraction } = useRecommendation();

  const handleFeedback = async (type) => {
    setFeedback(type);
    await recordInteraction(productId, 'feedback', {
      feedbackType: type,
      recommendationType,
      timestamp: Date.now()
    });
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <span>Was this helpful?</span>
      <button
        onClick={() => handleFeedback('relevant')}
        className={`px-2 py-1 rounded ${
          feedback === 'relevant' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
        }`}
      >
        👍 Yes
      </button>
      <button
        onClick={() => handleFeedback('irrelevant')}
        className={`px-2 py-1 rounded ${
          feedback === 'irrelevant' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
        }`}
      >
        👎 No
      </button>
    </div>
  );
};

export default RecommendationFeedback;