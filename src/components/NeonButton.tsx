import React from 'react';
import { useApp } from '../context/AppContext';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  let isLight = false;
  try {
    const { userProfile } = useApp();
    isLight = userProfile?.themeMode === 'Light';
  } catch (e) {
    isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-2xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#2563EB] text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] active:opacity-90',
    secondary: isLight
      ? 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 active:opacity-90 font-semibold shadow-sm'
      : 'bg-[#1E2338] text-white border border-[#2E3552] hover:border-[#7C3AED]/50 hover:bg-[#252C48] active:opacity-90 font-semibold',
    outline: isLight
      ? 'bg-transparent text-purple-700 border border-purple-300 hover:bg-purple-50 active:opacity-90 font-semibold'
      : 'bg-transparent text-[#06B6D4] border border-[#06B6D4]/50 hover:bg-[#06B6D4]/10 hover:border-[#06B6D4] active:opacity-90 font-semibold',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] active:opacity-90',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};
