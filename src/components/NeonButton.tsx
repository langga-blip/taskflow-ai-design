import React from 'react';

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
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-2xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#2563EB] text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-[#1E2338] text-white border border-[#2E3552] hover:border-[#7C3AED]/50 hover:bg-[#252C48]',
    outline:
      'bg-transparent text-[#06B6D4] border border-[#06B6D4]/50 hover:bg-[#06B6D4]/10 hover:border-[#06B6D4]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-[1.02]',
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
