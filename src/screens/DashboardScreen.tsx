import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { StatChip } from '../components/StatChip';
import { CurvyDivider } from '../components/CurvyDivider';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Zap,
  CheckSquare,
  Bot,
  Layers,
  BarChart3,
  Globe,
  Edit2,
  DollarSign,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    tasks,
    toggleTask,
    setCurrentScreen,
    formatRevenue,
    getTimeOfDayGreeting,
    generateDailyPlan,
    saveTask,
    triggerNotification,
  } = useApp();

  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    let animId: number;
    let lastTime = Date.now();

    const updateClock = () => {
      const current = Date.now();
      if (current - lastTime >= 1000) {
        lastTime = current;
        setNow(new Date());
      }
      animId = requestAnimationFrame(updateClock);
    };

    animId = requestAnimationFrame(updateClock);

    const handleScrollOrTouch = () => {
      setNow(new Date());
    };

    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
    };
  }, []);

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isEditRevModalOpen, setIsEditRevModalOpen] = useState(false);
  const [tempCurrentRev, setTempCurrentRev] = useState<string | number>(
    userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 3450
  );

  useEffect(() => {
    if (isEditRevModalOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditRevModalOpen]);

  // Revenue metrics
  const revGoal = userProfile.monthlyRevenueGoal || 10000;
  const currentRev = userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 0;
  const revPercent = revGoal > 0 ? Math.min(100, Math.round((currentRev / revGoal) * 100)) : 0;
  const isLight = userProfile.themeMode === 'Light';

  const handleSaveRevenueFromDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = typeof tempCurrentRev === 'string' ? parseFloat(tempCurrentRev) : tempCurrentRev;
    const finalVal = isNaN(parsed) || parsed < 0 ? 0 : parsed;

    updateUserProfile({ currentMonthlyRevenue: finalVal });
    triggerNotification(
      'Current Revenue Updated 💰',
      `Monthly revenue updated to ${formatRevenue(finalVal)}.`,
      'PAYMENTS'
    );
    setIsEditRevModalOpen(false);
  };

  // Task metrics
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const productivityScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Active High Impact tasks
  const highImpactTasks = tasks.filter((t) => !t.isCompleted && t.revenueImpact === 'HIGH').slice(0, 3);
  const activeTasks = tasks.slice(0, 5);

  const handleGenerateQuickStrategy = async () => {
    setIsGeneratingPlan(true);
    try {
      const newPlan = await generateDailyPlan();
      newPlan.forEach((t) => saveTask(t));
      triggerNotification('AI Strategy Active', `Added ${newPlan.length} high-impact priorities for today.`, 'AI', 'tasks');
    } catch (e) {
      /* ignore */
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-4xl mx-auto overflow-x-hidden">
      {/* Date & Time Header Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border shadow-md animate-glow-border ${
          isLight
            ? 'bg-gradient-to-r from-purple-50 via-white to-purple-50 border-purple-200 text-slate-800'
            : 'bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] border-[#2E3552] text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isLight
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-[#06B6D4]/20 border border-[#06B6D4]/30 text-[#06B6D4]'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                isLight ? 'text-purple-700' : 'text-[#06B6D4]'
              }`}
            >
              System Date & Time
            </span>
            <span className="text-xs sm:text-sm font-extrabold">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-2 ${
              isLight
                ? 'bg-white border-purple-200 text-purple-900 shadow-sm'
                : 'bg-[#0A0C14] border-[#2E3552] text-[#00E676]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Greeting Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl shadow-xl border animate-glow-border ${
          isLight
            ? 'bg-gradient-to-r from-purple-50 via-white to-purple-50 border-purple-200 text-slate-900'
            : 'bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] border-[#2E3552] text-white'
        }`}
      >
        <div>
          <h1 className={`text-xl sm:text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {getTimeOfDayGreeting()}
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            {userProfile.businessName} • {userProfile.industry}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NeonButton onClick={() => setCurrentScreen('planner')} size="sm">
            <Sparkles className="w-4 h-4" /> AI Planner
          </NeonButton>
        </div>
      </div>

      {/* Revenue Tracker Hero Card */}
      <GlassCard
        className={`space-y-4 overflow-hidden max-w-full border ${
          isLight
            ? 'bg-gradient-to-br from-purple-50/80 via-white to-purple-100/50 border-purple-200 text-slate-900 shadow-sm'
            : 'border-[#7C3AED]/30 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338] text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl text-[#00E676] flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-xs font-bold block ${isLight ? 'text-purple-900' : 'text-slate-400'}`}>
                Monthly Revenue Progress
              </span>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {formatRevenue(currentRev)}
                <span className={`text-xs font-semibold ml-2 block sm:inline ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  / {formatRevenue(revGoal, false)} goal
                </span>
              </h2>
            </div>
          </div>

          {/* Action buttons vertically stacked: Edit Revenue above, Manage below */}
          <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0 pt-1 sm:pt-0">
            <button
              onClick={() => {
                setTempCurrentRev(currentRev);
                setIsEditRevModalOpen(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-[#0A0C14] border-[#2E3552] text-[#00E676] hover:border-[#00E676]'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Revenue
            </button>
            <button
              onClick={() => setCurrentScreen('revenue')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:bg-cyan-100'
                  : 'bg-[#1E2338] border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]'
              }`}
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className={isLight ? 'text-emerald-700' : 'text-[#00E676]'}>{revPercent}% Achieved</span>
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
              {formatRevenue(Math.max(0, revGoal - currentRev), false)} Remaining
            </span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0A0C14] border-[#2E3552]'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#00E676] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,230,118,0.5)]"
              style={{ width: `${revPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-purple-50/80 border-purple-200' : 'bg-[#0A0C14]/60 border-[#2E3552]/60'
          }`}>
            <span className={`text-[10px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Currency</span>
            <p className={`font-bold flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Globe className="w-3.5 h-3.5 text-[#06B6D4]" /> {userProfile.currencyCode} ({userProfile.currencySymbol})
            </p>
          </div>
          <div className={`p-2.5 rounded-xl border ${
            isLight ? 'bg-purple-50/80 border-purple-200' : 'bg-[#0A0C14]/60 border-[#2E3552]/60'
          }`}>
            <span className={`text-[10px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Projected Run-Rate</span>
            <p className={`font-bold mt-0.5 ${isLight ? 'text-emerald-700' : 'text-[#00E676]'}`}>
              {formatRevenue(currentRev * 1.2, false)}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl border col-span-2 sm:col-span-1 ${
            isLight ? 'bg-purple-50/80 border-purple-200' : 'bg-[#0A0C14]/60 border-[#2E3552]/60'
          }`}>
            <span className={`text-[10px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Revenue Impact Tasks</span>
            <p className={`font-bold mt-0.5 ${isLight ? 'text-purple-800' : 'text-[#A78BFA]'}`}>
              {highImpactTasks.length} Urgent Priorities
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stat Chips Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatChip
          label="Tasks Completed"
          value={`${completedCount} / ${totalCount}`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          color="green"
        />
        <StatChip
          label="Productivity Score"
          value={`${productivityScore}%`}
          icon={<Zap className="w-4 h-4 text-purple-500" />}
          trend="+12%"
          color="purple"
        />
        <StatChip
          label="Active Currency"
          value={userProfile.currencyCode}
          icon={<Globe className="w-4 h-4 text-cyan-500" />}
          color="cyan"
        />
      </div>

      {/* AI Daily Strategy Quick Banner */}
      <GlassCard className={`space-y-3 ${isLight ? 'border-purple-200' : 'border-[#06B6D4]/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#06B6D4]" />
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>AI Daily Strategy Engine</h3>
          </div>
          <button
            onClick={handleGenerateQuickStrategy}
            disabled={isGeneratingPlan}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isLight
                ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-900'
                : 'bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 border-[#06B6D4]/40 text-[#06B6D4]'
            }`}
          >
            {isGeneratingPlan ? 'Generating...' : 'Refresh Strategy'}
          </button>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
          Based on your business goals ({userProfile.goal1 || 'Scale Revenue'}), Gemini prepares 3 high-impact priorities daily.
        </p>

        {highImpactTasks.length > 0 && (
          <div className="space-y-2 pt-1">
            {highImpactTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer border ${
                  isLight
                    ? 'bg-purple-50/70 border-purple-200 hover:border-purple-400'
                    : 'bg-[#0A0C14] border-[#2E3552] hover:border-[#7C3AED]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.isCompleted
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                        : isLight
                        ? 'border-slate-400 hover:border-[#7C3AED]'
                        : 'border-slate-500 hover:border-[#7C3AED]'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${
                      task.isCompleted
                        ? 'line-through text-slate-400'
                        : isLight
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}>
                      {task.title}
                    </p>
                    <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{task.category} • {task.estimatedMinutes}m</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">
                  $$$ High Impact
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Quick Launchers Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setCurrentScreen('tasks')}
          className={`p-4 border rounded-2xl text-left space-y-2 group cursor-pointer transition-all animate-glow-purple ${
            isLight
              ? 'bg-purple-50/70 border-purple-300 hover:bg-purple-100/80'
              : 'bg-[#131726] border-[#7C3AED]/60 hover:border-[#7C3AED]'
          }`}
        >
          <div className="p-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Task Manager</h4>
          <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{tasks.length} Active Tasks</p>
        </button>

        <button
          onClick={() => setCurrentScreen('revenue')}
          className={`p-4 border rounded-2xl text-left space-y-2 group cursor-pointer transition-all animate-glow-green ${
            isLight
              ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/80'
              : 'bg-[#131726] border-[#00E676]/60 hover:border-[#00E676]'
          }`}
        >
          <div className="p-2 bg-[#00E676]/10 text-emerald-700 dark:text-[#00E676] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Revenue Tracker</h4>
          <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{userProfile.currencyCode} Goal Progress</p>
        </button>

        <button
          onClick={() => setCurrentScreen('workflows')}
          className={`p-4 border rounded-2xl text-left space-y-2 group cursor-pointer transition-all animate-glow-amber ${
            isLight
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-100/80'
              : 'bg-[#131726] border-[#F59E0B]/60 hover:border-[#F59E0B]'
          }`}
        >
          <div className="p-2 bg-[#F59E0B]/10 text-amber-600 dark:text-[#F59E0B] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>50+ Workflows</h4>
          <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Playbook Library</p>
        </button>

        <button
          onClick={() => setCurrentScreen('assistant')}
          className={`p-4 border rounded-2xl text-left space-y-2 group cursor-pointer transition-all animate-glow-cyan ${
            isLight
              ? 'bg-cyan-50/70 border-cyan-300 hover:bg-cyan-100/80'
              : 'bg-[#131726] border-[#06B6D4]/60 hover:border-[#06B6D4]'
          }`}
        >
          <div className="p-2 bg-[#06B6D4]/10 text-cyan-700 dark:text-[#06B6D4] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>AI Assistant</h4>
          <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>24/7 Growth Advisor</p>
        </button>
      </div>

      <CurvyDivider />

      {/* Active Task Queue */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Active Priorities Queue</h3>
          <button
            onClick={() => setCurrentScreen('tasks')}
            className="text-xs font-semibold text-[#06B6D4] hover:underline cursor-pointer"
          >
            View All ({tasks.length}) &rarr;
          </button>
        </div>

        <div className="space-y-2">
          {activeTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                  : 'bg-[#0A0C14] border-[#2E3552] hover:border-[#7C3AED]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    t.isCompleted
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                      : isLight
                      ? 'border-slate-400 hover:border-[#7C3AED]'
                      : 'border-slate-500 hover:border-[#7C3AED]'
                  }`}
                >
                  {t.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <p className={`text-xs font-bold ${
                    t.isCompleted
                      ? 'line-through text-slate-400'
                      : isLight
                      ? 'text-slate-900'
                      : 'text-slate-200'
                  }`}>
                    {t.title}
                  </p>
                  <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{t.category}</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  t.priority === 'URGENT'
                    ? 'bg-red-500/20 text-red-500 border-red-500/40'
                    : t.priority === 'HIGH'
                    ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
                    : t.priority === 'MEDIUM'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40'
                    : 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/40'
                }`}
              >
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Edit Revenue Modal */}
      {isEditRevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-purple-200 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-purple-200' : 'border-[#2E3552]'
            }`}>
              <h2 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <DollarSign className="w-5 h-5 text-[#00E676]" /> Edit Current Monthly Revenue
              </h2>
              <button
                onClick={() => setIsEditRevModalOpen(false)}
                className={`p-2 rounded-xl border cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                    : 'bg-[#131726] border-[#2E3552] text-slate-400 hover:text-white'
                }`}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRevenueFromDashboard} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Current Monthly Revenue ({userProfile.currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    {userProfile.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tempCurrentRev}
                    onChange={(e) => setTempCurrentRev(e.target.value)}
                    className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-[#00E676] border ${
                      isLight
                        ? 'bg-slate-50 border-purple-200 text-slate-900'
                        : 'bg-[#131726] border-[#2E3552] text-white'
                    }`}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Directly update your current active revenue for this month.
                </p>
              </div>

              <NeonButton type="submit" size="md" fullWidth>
                Update Revenue
              </NeonButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
