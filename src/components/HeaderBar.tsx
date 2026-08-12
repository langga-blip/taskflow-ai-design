import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Mic, Grid, Crown, Sparkles, Sun, Moon } from 'lucide-react';

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
    updateUserProfile,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isLight = userProfile.themeMode === 'Light';

  const toggleTheme = () => {
    updateUserProfile({ themeMode: isLight ? 'Dark' : 'Light' });
  };

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
    <header
      className={`w-full backdrop-blur-xl border-b transition-colors px-4 py-3 ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800'
          : 'bg-[#0A0C14]/90 border-[#2E3552] text-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 w-full overflow-hidden">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <div
            onClick={() => setCurrentScreen('dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:scale-105 transition-transform flex-shrink-0">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-[#0A0C14]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className={`font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap ${
                    isLight
                      ? 'text-slate-900'
                      : 'bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent'
                  }`}
                >
                  TaskFlow
                </span>
                {userProfile.isSubscribed ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] rounded-md border border-[#F59E0B]/40 flex items-center gap-0.5 flex-shrink-0">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] rounded-md border border-[#7C3AED]/30 flex-shrink-0">
                    AI
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-medium hidden md:block truncate ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {subtitle || getScreenTitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Current Screen Title (Compact Mobile view) */}
        <div
          className={`hidden xs:block md:hidden font-bold text-xs truncate max-w-[90px] ${
            isLight ? 'text-slate-800' : 'text-slate-200'
          }`}
        >
          {getScreenTitle()}
        </div>

        {/* Action Controls - Horizontally Swipeable Icon Bar */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-1.5 touch-pan-x ml-auto shrink-0 flex-nowrap rounded-xl border sm:bg-transparent sm:border-none sm:p-0 shadow-inner w-[170px] xs:w-[205px] sm:w-auto max-w-[170px] xs:max-w-[205px] sm:max-w-none ${
            isLight
              ? 'border-purple-200/80 bg-purple-100/70 text-purple-950'
              : 'border-[#2E3552]/50 bg-[#131726]/80 text-slate-200'
          }`}
        >
          {/* 1. Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className={`p-2 rounded-xl border cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation select-none transition-all duration-75 animate-glow-icon-amber ${
              isLight
                ? 'bg-white border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm'
                : 'bg-[#1E2338] border-[#2E3552] text-amber-400 hover:text-white hover:border-[#7C3AED]/50'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            )}
          </button>

          {/* 2. Quick Nav Popup Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickNavOpen(true);
            }}
            className={`p-2 rounded-xl border cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation select-none transition-all duration-75 animate-glow-icon-cyan ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                : 'bg-[#1E2338] border-[#2E3552] text-slate-300 hover:text-white hover:border-[#7C3AED]/50'
            }`}
            title="Quick Navigation"
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 3. Voice Command Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVoiceSheetOpen(true);
            }}
            className={`p-2 rounded-xl border cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation select-none transition-all duration-75 animate-glow-icon-teal ${
              isLight
                ? 'bg-white border-slate-300 text-[#06B6D4] hover:bg-cyan-50 shadow-sm'
                : 'bg-[#1E2338] border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]/50'
            }`}
            title="Voice Commands"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 4. Notifications Bell */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationSheetOpen(true);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsNotificationSheetOpen(true);
            }}
            className={`relative p-2 rounded-xl border cursor-pointer flex-shrink-0 active:scale-95 touch-manipulation select-none transition-all duration-75 animate-glow-icon-red ${
              isLight
                ? 'bg-white border-purple-300 text-purple-800 hover:bg-purple-50 shadow-sm'
                : 'bg-[#1E2338] border-[#2E3552] text-slate-200 hover:text-white hover:border-[#7C3AED]/50'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500/85 backdrop-blur-md border border-red-300/70 shadow-[0_0_10px_rgba(239,68,68,0.6)] text-white font-extrabold text-[9px] sm:text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 5. User Profile Avatar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentScreen('profile');
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] p-0.5 cursor-pointer active:scale-95 touch-manipulation select-none flex-shrink-0 transition-all duration-75 animate-glow-icon-indigo"
            title="Profile & Settings"
          >
            <div
              className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${
                isLight ? 'bg-white text-[#7C3AED]' : 'bg-[#131726] text-white'
              }`}
            >
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
