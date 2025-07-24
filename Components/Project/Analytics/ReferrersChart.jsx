"use client";

import React from 'react';
import LoadingSpinner from '@/Components/common/LoadingSpinner';

const ReferrersChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" color="violet" showBackground fullScreen />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Referrers</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Referrers chart will be implemented here</p>
      </div>
    </div>
  );
};

export default ReferrersChart; 