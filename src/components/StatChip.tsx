import React from 'react';
import { useApp } from '../context/AppContext';

interface StatChipProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'purple' | 'blue' | 'green' | 'gold' | 'cyan';
}

export const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'purple',
}) => {
  let isLight = false;
  try {
    const { userProfile } = useApp();
    isLight = userProfile?.themeMode === 'Light';
  } catch (e) {
    isLight = false;
  }

  const darkColorStyles = {
    purple: 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30',
    blue: 'bg-[#2563EB]/10 text-[#60A5FA] border-[#2563EB]/30',
    green: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    gold: 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30',
    cyan: 'bg-[#06B6D4]/10 text-[#22D3EE] border-[#06B6D4]/30',
  }[color];

  const lightColorStyles = {
    purple: 'bg-purple-50 text-purple-900 border-purple-200 shadow-sm',
    blue: 'bg-blue-50 text-blue-900 border-blue-200 shadow-sm',
    green: 'bg-emerald-50 text-emerald-950 border-emerald-200 shadow-sm',
    gold: 'bg-amber-50 text-amber-950 border-amber-200 shadow-sm',
    cyan: 'bg-cyan-50 text-cyan-950 border-cyan-200 shadow-sm',
  }[color];

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-md ${
        isLight ? lightColorStyles : darkColorStyles
      }`}
    >
      {icon && <div className="text-lg shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className={`text-xs ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-medium'}`}>
          {label}
        </div>
        <div className={`flex items-center gap-1.5 font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <span className="truncate">{value}</span>
          {trend && (
            <span className={`text-[10px] font-bold ${isLight ? 'text-emerald-700' : 'text-[#00E676]'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
