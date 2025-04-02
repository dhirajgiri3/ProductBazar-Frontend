import React from 'react';
import { Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';

const RecommendationExplanation = ({ type, score, reason, productName }) => {
  const getExplanationDetails = () => {
    switch (type) {
      case 'collaborative':
        return {
          icon: '👥',
          title: 'Collaborative Recommendation',
          detail: 'Based on similar users\' interests'
        };
      case 'category':
        return {
          icon: '📁',
          title: 'Category Match',
          detail: 'Matches your preferred categories'
        };
      case 'tag':
        return {
          icon: '🏷️',
          title: 'Tag Match',
          detail: 'Based on tags you interact with'
        };
      case 'trending':
        return {
          icon: '📈',
          title: 'Trending Product',
          detail: 'Popular in the community'
        };
      case 'maker':
        return {
          icon: '👨‍💻',
          title: 'From Followed Maker',
          detail: 'From a maker you follow'
        };
      default:
        return {
          icon: '💡',
          title: 'Personalized Recommendation',
          detail: 'Based on your interests'
        };
    }
  };

  const details = getExplanationDetails();

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <span>{details.icon}</span>
      <span>{reason || details.title}</span>
      <Tooltip title={
        <div className="p-2">
          <p className="font-semibold">{details.title}</p>
          <p>{details.detail}</p>
          {score && <p className="mt-1">Relevance Score: {(score * 100).toFixed(1)}%</p>}
        </div>
      }>
        <Info fontSize="small" className="text-gray-400 cursor-help" />
      </Tooltip>
    </div>
  );
};

export default RecommendationExplanation;