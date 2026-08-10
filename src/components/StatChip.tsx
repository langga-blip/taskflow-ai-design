import React from 'react';

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
  const colorStyles = {
    purple: 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30',
    blue: 'bg-[#2563EB]/10 text-[#60A5FA] border-[#2563EB]/30',
    green: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    gold: 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30',
    cyan: 'bg-[#06B6D4]/10 text-[#22D3EE] border-[#06B6D4]/30',
  }[color];

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${colorStyles} backdrop-blur-md`}>
      {icon && <div className="text-lg">{icon}</div>}
      <div>
        <div className="text-xs text-slate-400 font-medium">{label}</div>
        <div className="flex items-center gap-1.5 font-bold text-sm text-white">
          <span>{value}</span>
          {trend && <span className="text-[10px] text-[#00E676] font-semibold">{trend}</span>}
        </div>
      </div>
    </div>
  );
};
