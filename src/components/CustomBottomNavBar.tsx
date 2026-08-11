import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenRoute } from '../types';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Layers,
  Bot,
} from 'lucide-react';

export const CustomBottomNavBar: React.FC = () => {
  const { currentScreen, setCurrentScreen, userProfile } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const navItems: { id: ScreenRoute; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'planner',
      label: 'AI Plan',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'workflows',
      label: 'Templates',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: <Bot className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl border-t py-2 px-3 transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-lg'
          : 'bg-[#0A0C14]/90 border-[#2E3552]'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer active:opacity-80 touch-manipulation select-none ${
                isActive
                  ? isLight
                    ? 'text-purple-900 bg-purple-100 border border-purple-300 font-extrabold shadow-sm'
                    : 'text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131726] font-medium'
              }`}
            >
              <div>
                {item.icon}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? (isLight ? 'font-extrabold text-purple-900' : 'font-bold text-[#06B6D4]') : (isLight ? 'font-semibold text-slate-700' : 'font-medium')}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
