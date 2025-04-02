import React, { useState } from 'react';
import FilteredRecommendations from './FilteredRecommendations';
import RecommendationSettings from './RecommendationSettings';
import RecommendationExplanation from './RecommendationExplanation';
import { IconButton, Drawer } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const RecommendationFeed = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings Toggle */}
      <div className="absolute top-0 right-0">
        <IconButton 
          onClick={() => setSettingsOpen(true)}
          className="text-gray-600 hover:text-gray-800"
          title="Recommendation Settings"
        >
          <SettingsIcon />
        </IconButton>
      </div>

      {/* Main Feed */}
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Recommended For You</h2>
          <p className="text-gray-600">
            Personalized recommendations based on your interests and interactions
          </p>
        </div>

        {/* Filtered Recommendations Component */}
        <FilteredRecommendations maxItems={12} />
      </div>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <div className="w-[400px] max-w-full p-4">
          <RecommendationSettings />
        </div>
      </Drawer>
    </div>
  );
};

export default RecommendationFeed;