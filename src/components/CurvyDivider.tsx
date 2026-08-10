import React from 'react';

export const CurvyDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden my-4 opacity-40 ${className}`}>
      <svg
        viewBox="0 0 1200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-3 text-[#7C3AED]"
      >
        <path
          d="M0 12C150 24 300 0 450 12C600 24 750 0 900 12C1050 24 1200 12 1200 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
