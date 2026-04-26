import React from 'react';
import { Card, CardContent } from '@mui/material';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card elevation={0} className="rounded-2xl border border-gray-100 p-4 w-full bg-white/50 animate-pulse-fast">
            <div className="flex gap-4 items-center mb-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              <div className="h-3 bg-gray-100 rounded w-4/6"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </Card>
        );
      case 'text':
        return (
          <div className="space-y-3 animate-pulse-fast w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          </div>
        );
      default:
        return <div className="h-8 bg-gray-200 rounded animate-pulse-fast w-full"></div>;
    }
  };

  return (
    <div className={`grid gap-4 ${type === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
