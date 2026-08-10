import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenRoute } from '../types';
import {
  X,
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Layers,
  BarChart3,
  Bot,
  User,
  Crown,
} from 'lucide-react';

export const QuickNavPopupMenu: React.FC = () => {
  const { isQuickNavOpen, setIsQuickNavOpen, setCurrentScreen, userProfile } = useApp();

  if (!isQuickNavOpen) return null;

  const routes: { id: ScreenRoute; name: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      name: 'Executive Dashboard',
      desc: 'High-level business KPIs & daily overview',
      icon: <LayoutDashboard className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'tasks',
      name: 'Task Manager',
      desc: 'Prioritized task list with revenue impacts',
      icon: <CheckSquare className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'planner',
      name: 'AI Daily Planner',
      desc: '24/7 Gemini strategy & time blocking',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'revenue',
      name: 'Revenue Dashboard',
      desc: 'Global currency tracking & goal progress',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'workflows',
      name: '50+ Workflow Templates',
      desc: '1-click business automation playbooks',
      icon: <Layers className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'review',
      name: 'AI Weekly Review',
      desc: 'Performance wins, bottlenecks & priorities',
      icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'assistant',
      name: '24/7 AI Business Assistant',
      desc: 'Chat with executive strategy advisor',
      icon: <Bot className="w-5 h-5 text-pink-400" />,
    },
    {
      id: 'profile',
      name: 'Profile & Settings',
      desc: 'Business profile, currency, AI provider',
      icon: <User className="w-5 h-5 text-slate-400" />,
    },
    {
      id: 'subscription',
      name: 'TaskFlow AI Pro Annual',
      desc: 'Unlock all AI tools & global currencies',
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      badge: userProfile.isSubscribed ? 'Active' : 'Upgrade',
    },
  ];

  const handleNav = (id: ScreenRoute) => {
    setCurrentScreen(id);
    setIsQuickNavOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
          <h2 className="font-bold text-lg text-white">Quick Navigation</h2>
          <button
            onClick={() => setIsQuickNavOpen(false)}
            className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => handleNav(r.id)}
              className="flex items-start gap-3 p-3 bg-[#131726] hover:bg-[#1E2338] border border-[#2E3552] hover:border-[#7C3AED]/50 rounded-2xl transition-all text-left cursor-pointer group"
            >
              <div className="p-2 bg-[#0A0C14] rounded-xl border border-[#2E3552] group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-[#06B6D4] truncate">
                    {r.name}
                  </span>
                  {r.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                      {r.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
