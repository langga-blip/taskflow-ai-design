import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Mic, Grid, Crown, Sparkles, User } from 'lucide-react';
import { ScreenRoute } from '../types';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ title, subtitle }) => {
  const {
    currentScreen,
    setCurrentScreen,
    notifications,
    setIsNotificationSheetOpen,
    setIsVoiceSheetOpen,
    setIsQuickNavOpen,
    userProfile,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getScreenTitle = (): string => {
    if (title) return title;
    switch (currentScreen) {
      case 'dashboard':
        return 'Executive Overview';
      case 'tasks':
        return 'Task Manager';
      case 'planner':
        return 'AI Daily Planner';
      case 'revenue':
        return 'Revenue Dashboard';
      case 'workflows':
        return '50+ Workflow Templates';
      case 'review':
        return 'AI Weekly Review';
      case 'assistant':
        return 'AI Business Assistant';
      case 'profile':
        return 'Profile Settings';
      case 'subscription':
        return 'TaskFlow AI Pro';
      default:
        return 'TaskFlow AI';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0C14]/80 backdrop-blur-xl border-b border-[#2E3552] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0A0C14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  TaskFlow AI
                </span>
                {userProfile.isSubscribed ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] rounded-md border border-[#F59E0B]/40 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#7C3AED]/20 text-[#A78BFA] rounded-md border border-[#7C3AED]/30">
                    Spectrey
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {subtitle || getScreenTitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Current Screen Title (Mobile view) */}
        <div className="sm:hidden font-bold text-sm text-slate-200 truncate">
          {getScreenTitle()}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Nav Popup Button */}
          <button
            onClick={() => setIsQuickNavOpen(true)}
            className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-300 hover:text-white hover:border-[#7C3AED]/50 transition-colors cursor-pointer"
            title="Quick Navigation"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Voice Command Button */}
          <button
            onClick={() => setIsVoiceSheetOpen(true)}
            className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title="Voice Commands"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotificationSheetOpen(true)}
            className="relative p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-300 hover:text-white hover:border-[#7C3AED]/50 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse border border-[#0A0C14]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setCurrentScreen('profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] p-0.5 cursor-pointer hover:scale-105 transition-transform"
            title="Profile & Settings"
          >
            <div className="w-full h-full bg-[#131726] rounded-[10px] flex items-center justify-center text-white font-bold text-xs">
              {userProfile.userName
                ? userProfile.userName.substring(0, 2).toUpperCase()
                : 'AR'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
