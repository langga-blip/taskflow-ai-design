import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationCategory, ScreenRoute, AppNotification } from '../types';
import {
  X,
  CheckCheck,
  Trash2,
  Bell,
  Sparkles,
  CreditCard,
  Users,
  ShieldAlert,
  Mail,
  RefreshCw,
  Send,
  Copy,
  BookmarkPlus,
  Check,
  ExternalLink,
} from 'lucide-react';
import { suggestEmailReplyApi } from '../services/api';
import { AppEmoji } from './AppEmoji';

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
    saveTask,
    triggerNotification,
    userProfile,
  } = useApp();

  const isLight = userProfile?.themeMode === 'Light';

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Map of notificationId -> { replies: string[]; activeIdx: number; isGenerating: boolean }
  const [emailRepliesState, setEmailRepliesState] = useState<
    Record<string, { replies: string[]; activeIdx: number; isGenerating: boolean }>
  >({});

  const categories: { id: string; label: string; emoji?: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'EMAIL', label: 'Email Alerts', emoji: '📧' },
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
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'CLIENTS':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'PAYMENTS':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'AI':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
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

  const getRepliesState = (n: AppNotification) => {
    if (emailRepliesState[n.id]) return emailRepliesState[n.id];
    // Initial default reply option
    const initialReply = `Hi ${n.senderName || 'there'}, thanks for reaching out! I reviewed your message regarding "${
      n.emailSubject || n.title
    }" and would be happy to proceed. Let us sync on timing today. Best, ${
      userProfile?.userName || 'Alex'
    }`;
    return {
      replies: [initialReply],
      activeIdx: 0,
      isGenerating: false,
    };
  };

  const handleRegenerateReply = async (n: AppNotification) => {
    const notifId = n.id;
    const current = getRepliesState(n);

    setEmailRepliesState((prev) => ({
      ...prev,
      [notifId]: { ...current, isGenerating: true },
    }));

    const attemptNumber = current.replies.length + 1;
    const res = await suggestEmailReplyApi(
      n.senderName || 'Sender',
      n.senderEmail || 'client@example.com',
      n.emailSubject || n.title,
      n.message,
      current.replies,
      attemptNumber,
      userProfile
    );

    const newReplyText = res.replyText;

    setEmailRepliesState((prev) => {
      const updated = [...current.replies, newReplyText];
      return {
        ...prev,
        [notifId]: {
          replies: updated,
          activeIdx: updated.length - 1,
          isGenerating: false,
        },
      };
    });
  };

  const handleCopyReply = (text: string, notifId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(notifId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendViaGmail = (n: AppNotification, replyText: string) => {
    const to = encodeURIComponent(n.senderEmail || userProfile.userEmail || 'mummom692@gmail.com');
    const subject = encodeURIComponent(`Re: ${n.emailSubject || n.title}`);
    const body = encodeURIComponent(replyText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    triggerNotification('Gmail Compose Opened ✉️', `Opened Gmail draft for ${n.senderEmail || 'registered recipient'}`, 'EMAIL');
  };

  const handleConvertReplyToTask = (n: AppNotification, replyText: string) => {
    saveTask({
      title: `📧 Email Reply: ${n.emailSubject || n.title}`,
      description: `Recipient: ${n.senderEmail || 'Client'}\nDraft Reply:\n${replyText}`,
      category: 'GENERAL',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      dueDate: 'Today',
    });
    triggerNotification('Converted to Task 📌', `Created task from email reply to ${n.senderName || 'client'}`, 'SYSTEM', 'tasks');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsNotificationSheetOpen(false);
        }
      }}
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-150 ease-out ${
        isNotificationSheetOpen
          ? 'bg-black/60 opacity-100 pointer-events-auto'
          : 'bg-black/0 opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full flex flex-col p-4 sm:p-5 shadow-2xl overflow-hidden border-l transition-transform duration-150 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform ${
          isNotificationSheetOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0A0C14] border-[#2E3552] text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3 sm:pb-4 border-b ${
            isLight ? 'border-slate-200' : 'border-[#2E3552]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,0.4)]'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Notifications & Gmail AI
              </h2>
              <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Google Workspace Email Sync & AI Reply Generation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationSheetOpen(false)}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between my-3 sm:my-4 gap-2 text-xs overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap border ${
                  selectedFilter === cat.id
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#131726] text-slate-400 hover:text-slate-200 border-[#2E3552]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {cat.emoji && <AppEmoji symbolOrName={cat.emoji} size="sm" />}
                  <span>{cat.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-none space-y-3.5 pr-1 my-1">
          {filteredNotifications.length === 0 ? (
            <div className={`text-center py-12 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications found.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isEmailNotif = n.category === 'EMAIL' || !!n.senderEmail || !!n.emailSubject;
              const replyObj = isEmailNotif ? getRepliesState(n) : null;
              const currentReplyText = replyObj ? replyObj.replies[replyObj.activeIdx] : '';

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.actionRoute as ScreenRoute, n.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    n.isRead
                      ? isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-[#131726]/60 border-[#2E3552]/60 text-slate-400'
                      : isLight
                      ? 'bg-slate-50/90 border-slate-300 text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'bg-[#131726] border-[#2E3552] text-white shadow-md'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        isLight
                          ? 'border-slate-300 bg-slate-100 text-slate-700'
                          : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {getCategoryIcon(n.category)}
                      </div>
                      <div>
                        <span className={`font-bold text-xs sm:text-sm block ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {n.title}
                        </span>
                        {n.senderEmail && (
                          <span className={`text-[10px] font-mono block ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                            From: {n.senderName || 'Sender'} &lt;{n.senderEmail}&gt;
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {n.timestamp}
                    </span>
                  </div>

                  <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {n.message}
                  </p>

                  {/* AI Email Suggested Reply & Regenerate Box */}
                  {isEmailNotif && replyObj && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-3 p-3 rounded-xl border relative space-y-2 ${
                        isLight
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'bg-[#0A0C14] border-[#2E3552] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#06B6D4] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Suggested Reply #{replyObj.activeIdx + 1}
                        </span>
                        {replyObj.replies.length > 1 && (
                          <div className="flex items-center gap-1 text-[10px] font-mono">
                            {replyObj.replies.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setEmailRepliesState((prev) => ({
                                    ...prev,
                                    [n.id]: { ...replyObj, activeIdx: idx },
                                  }))
                                }
                                className={`w-4 h-4 rounded-full text-[9px] font-bold ${
                                  replyObj.activeIdx === idx
                                    ? 'bg-[#7C3AED] text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <p
                        className={`text-xs p-2.5 rounded-lg border font-mono leading-relaxed select-text ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-[#131726] border-[#2E3552] text-slate-200'
                        }`}
                      >
                        {replyObj.isGenerating ? (
                          <span className="flex items-center gap-2 text-[#06B6D4] animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating new distinct reply draft...
                          </span>
                        ) : (
                          currentReplyText
                        )}
                      </p>

                      {/* Reply Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                        <button
                          type="button"
                          disabled={replyObj.isGenerating}
                          onClick={() => handleRegenerateReply(n)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#A78BFA] border border-[#7C3AED]/50 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                          title="Generate a brand-new, distinct AI reply"
                        >
                          <RefreshCw className={`w-3 h-3 ${replyObj.isGenerating ? 'animate-spin' : ''}`} />
                          <span>Regenerate Reply ({replyObj.replies.length})</span>
                        </button>

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleCopyReply(currentReplyText, n.id)}
                            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 cursor-pointer ${
                              copiedId === n.id
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : isLight
                                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
                            }`}
                            title="Copy reply text"
                          >
                            {copiedId === n.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConvertReplyToTask(n, currentReplyText)}
                            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
                            }`}
                            title="Save as task"
                          >
                            <BookmarkPlus className="w-3 h-3 text-[#06B6D4]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendViaGmail(n, currentReplyText)}
                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-[11px] flex items-center gap-1 shadow-md hover:brightness-110 cursor-pointer"
                            title="Open Gmail compose with reply"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Gmail</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Bar */}
                  <div
                    className={`flex items-center justify-between mt-3 pt-2 border-t text-[11px] ${
                      isLight ? 'border-slate-200' : 'border-[#2E3552]/40'
                    }`}
                  >
                    {n.actionRoute && (
                      <span className="text-[#06B6D4] font-semibold hover:underline flex items-center gap-1">
                        Tap to open <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="ml-auto text-slate-500 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#2E3552] flex items-center justify-between gap-3 text-xs">
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

