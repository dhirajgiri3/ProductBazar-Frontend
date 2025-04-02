import React from 'react';
import { Skeleton } from "@nextui-org/react";

const RecommendationLoadingState = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg border">
          <Skeleton className="rounded-lg">
            <div className="h-40 bg-default-300"></div>
          </Skeleton>
          <div className="space-y-3 mt-4">
            <Skeleton className="w-3/4 rounded-lg">
              <div className="h-3 w-3/4 bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-4/5 rounded-lg">
              <div className="h-3 w-4/5 bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-2/6 rounded-lg">
              <div className="h-3 w-2/6 bg-default-300"></div>
            </Skeleton>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationLoadingState;