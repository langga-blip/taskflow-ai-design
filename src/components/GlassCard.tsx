import React from 'react';
import { useApp } from '../context/AppContext';

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
  let isLight = false;
  try {
    const { userProfile } = useApp();
    isLight = userProfile?.themeMode === 'Light';
  } catch (e) {
    isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
  }

  const hasSpecificGlow = className.includes('animate-glow-');
  const defaultGlowClass = hasSpecificGlow ? '' : 'animate-glow-border';

  const baseThemeClasses = isLight
    ? `bg-white/95 backdrop-blur-xl border border-slate-200/90 text-slate-900 shadow-sm ${defaultGlowClass}`
    : `bg-[#131726]/90 backdrop-blur-xl border border-[#2E3552] text-white shadow-xl ${defaultGlowClass}`;

  const hoverClasses = hoverEffect
    ? isLight
      ? 'hover:border-[#7C3AED]/40 hover:shadow-md'
      : 'hover:border-[#7C3AED]/50 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseThemeClasses} rounded-2xl p-5 transition-all duration-200 ${hoverClasses} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
