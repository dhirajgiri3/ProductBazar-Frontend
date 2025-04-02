import React from 'react';

const RecommendationLoadingState = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationLoadingState;