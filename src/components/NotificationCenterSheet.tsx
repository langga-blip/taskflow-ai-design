import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationCategory, ScreenRoute } from '../types';
import { X, CheckCheck, Trash2, Bell, Sparkles, CreditCard, Users, ShieldAlert } from 'lucide-react';

export const NotificationCenterSheet: React.FC = () => {
  const {
    notifications,
    isNotificationSheetOpen,
    setIsNotificationSheetOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    setCurrentScreen,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!isNotificationSheetOpen) return null;

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'SYSTEM', label: 'System' },
    { id: 'CLIENTS', label: 'Clients' },
    { id: 'PAYMENTS', label: 'Payments' },
    { id: 'AI', label: 'AI Strategy' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'ALL') return true;
    return n.category === selectedFilter;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'CLIENTS':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'PAYMENTS':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'AI':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleNotificationClick = (actionRoute?: ScreenRoute, id?: string) => {
    if (id) markNotificationAsRead(id);
    if (actionRoute) {
      setCurrentScreen(actionRoute);
      setIsNotificationSheetOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0A0C14] border-l border-[#2E3552] h-full flex flex-col p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2E3552]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#7C3AED]/20 rounded-xl border border-[#7C3AED]/40 text-[#A78BFA]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Notifications</h2>
              <p className="text-xs text-slate-400">Activity & Spectrey Workspace Updates</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationSheetOpen(false)}
            className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between my-4 gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFilter === cat.id
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-[#131726] text-slate-400 hover:text-slate-200 border border-[#2E3552]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications found.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.actionRoute as ScreenRoute, n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-[#131726]/60 border-[#2E3552]/60 text-slate-400'
                    : 'bg-[#131726] border-[#7C3AED]/40 text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(n.category)}
                    <span className="font-bold text-sm text-slate-100">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2E3552]/40 text-[11px]">
                  {n.actionRoute && (
                    <span className="text-[#06B6D4] font-semibold hover:underline">
                      Tap to open &rarr;
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="ml-auto text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#2E3552] flex items-center justify-between gap-3 text-xs">
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All Read
          </button>
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
