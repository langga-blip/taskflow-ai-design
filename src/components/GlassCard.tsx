import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#131726]/90 backdrop-blur-xl border border-[#2E3552] rounded-2xl p-5 shadow-xl transition-all duration-200 ${
        hoverEffect ? 'hover:border-[#7C3AED]/50 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
