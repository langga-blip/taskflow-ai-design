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
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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
        className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border shadow-md ${
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#131726] via-[#1E2338] to-[#131726] border border-[#2E3552] p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {getTimeOfDayGreeting()}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
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
      <GlassCard className="space-y-4 border-[#7C3AED]/30 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338] overflow-hidden max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl text-[#00E676] flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-xs font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Monthly Revenue Progress
              </span>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {formatRevenue(currentRev)}
                <span className={`text-xs font-medium ml-2 block sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold text-[#00E676] flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#0A0C14] border-[#2E3552] hover:border-[#00E676]'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Revenue
            </button>
            <button
              onClick={() => setCurrentScreen('revenue')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold text-[#06B6D4] flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-cyan-50 border-cyan-300 hover:bg-cyan-100'
                  : 'bg-[#1E2338] border-[#2E3552] hover:border-[#06B6D4]'
              }`}
            >
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#00E676]">{revPercent}% Achieved</span>
            <span className="text-slate-400">
              {formatRevenue(Math.max(0, revGoal - currentRev), false)} Remaining
            </span>
          </div>
          <div className="w-full h-3 bg-[#0A0C14] rounded-full overflow-hidden p-0.5 border border-[#2E3552]">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#00E676] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,230,118,0.5)]"
              style={{ width: `${revPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className="bg-[#0A0C14]/60 p-2.5 rounded-xl border border-[#2E3552]/60">
            <span className="text-slate-400 text-[10px]">Currency</span>
            <p className="font-bold text-white flex items-center gap-1 mt-0.5">
              <Globe className="w-3.5 h-3.5 text-[#06B6D4]" /> {userProfile.currencyCode} ({userProfile.currencySymbol})
            </p>
          </div>
          <div className="bg-[#0A0C14]/60 p-2.5 rounded-xl border border-[#2E3552]/60">
            <span className="text-slate-400 text-[10px]">Projected Run-Rate</span>
            <p className="font-bold text-[#00E676] mt-0.5">
              {formatRevenue(currentRev * 1.2, false)}
            </p>
          </div>
          <div className="bg-[#0A0C14]/60 p-2.5 rounded-xl border border-[#2E3552]/60 col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-[10px]">Revenue Impact Tasks</span>
            <p className="font-bold text-[#A78BFA] mt-0.5">
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
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          color="green"
        />
        <StatChip
          label="Productivity Score"
          value={`${productivityScore}%`}
          icon={<Zap className="w-4 h-4 text-purple-400" />}
          trend="+12%"
          color="purple"
        />
        <StatChip
          label="Active Currency"
          value={userProfile.currencyCode}
          icon={<Globe className="w-4 h-4 text-cyan-400" />}
          color="cyan"
        />
      </div>

      {/* AI Daily Strategy Quick Banner */}
      <GlassCard className="border-[#06B6D4]/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#06B6D4]" />
            <h3 className="font-bold text-base text-white">AI Daily Strategy Engine</h3>
          </div>
          <button
            onClick={handleGenerateQuickStrategy}
            disabled={isGeneratingPlan}
            className="px-3 py-1.5 text-xs font-bold bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isGeneratingPlan ? 'Generating...' : 'Refresh Strategy'}
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Based on your business goals ({userProfile.goal1 || 'Scale Revenue'}), Gemini prepares 3 high-impact priorities daily.
        </p>

        {highImpactTasks.length > 0 && (
          <div className="space-y-2 pt-1">
            {highImpactTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center justify-between p-3 bg-[#0A0C14] border border-[#2E3552] rounded-xl hover:border-[#7C3AED]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.isCompleted
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                        : 'border-slate-500 hover:border-[#7C3AED]'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-white ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400">{task.category} • {task.estimatedMinutes}m</span>
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
          className="p-4 bg-[#131726] border border-[#2E3552] hover:border-[#7C3AED]/50 rounded-2xl text-left space-y-2 group cursor-pointer transition-all"
        >
          <div className="p-2 bg-[#7C3AED]/10 text-[#A78BFA] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Task Manager</h4>
          <p className="text-[11px] text-slate-400">{tasks.length} Active Tasks</p>
        </button>

        <button
          onClick={() => setCurrentScreen('revenue')}
          className="p-4 bg-[#131726] border border-[#2E3552] hover:border-[#00E676]/50 rounded-2xl text-left space-y-2 group cursor-pointer transition-all"
        >
          <div className="p-2 bg-[#00E676]/10 text-[#00E676] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Revenue Tracker</h4>
          <p className="text-[11px] text-slate-400">{userProfile.currencyCode} Goal Progress</p>
        </button>

        <button
          onClick={() => setCurrentScreen('workflows')}
          className="p-4 bg-[#131726] border border-[#2E3552] hover:border-[#06B6D4]/50 rounded-2xl text-left space-y-2 group cursor-pointer transition-all"
        >
          <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">50+ Workflows</h4>
          <p className="text-[11px] text-slate-400">Playbook Library</p>
        </button>

        <button
          onClick={() => setCurrentScreen('assistant')}
          className="p-4 bg-[#131726] border border-[#2E3552] hover:border-pink-500/50 rounded-2xl text-left space-y-2 group cursor-pointer transition-all"
        >
          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">AI Assistant</h4>
          <p className="text-[11px] text-slate-400">24/7 Growth Advisor</p>
        </button>
      </div>

      <CurvyDivider />

      {/* Active Task Queue */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Active Priorities Queue</h3>
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
              className="flex items-center justify-between p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl hover:border-[#7C3AED]/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    t.isCompleted
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                      : 'border-slate-500 hover:border-[#7C3AED]'
                  }`}
                >
                  {t.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <p className={`text-xs font-bold text-slate-200 ${t.isCompleted ? 'line-through text-slate-500' : ''}`}>
                    {t.title}
                  </p>
                  <span className="text-[10px] text-slate-400">{t.category}</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  t.priority === 'URGENT'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30'
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
          <div className="w-full max-w-md bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#00E676]" /> Edit Current Monthly Revenue
              </h2>
              <button
                onClick={() => setIsEditRevModalOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRevenueFromDashboard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-[#00E676]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
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
