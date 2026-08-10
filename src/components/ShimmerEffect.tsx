import React from 'react';

export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = 'h-12 w-full' }) => {
  return (
    <div
      className={`bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`}
    />
  );
};
