import React, { useState } from 'react';
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
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    userProfile,
    tasks,
    toggleTask,
    setCurrentScreen,
    formatRevenue,
    getTimeOfDayGreeting,
    generateDailyPlan,
    saveTask,
    triggerNotification,
  } = useApp();

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Revenue metrics
  const revGoal = userProfile.monthlyRevenueGoal || 10000;
  const currentRev = userProfile.currentMonthlyRevenue || 3450;
  const revPercent = Math.min(100, Math.round((currentRev / revGoal) * 100));

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
    <div className="space-y-6 pb-24 animate-fade-in max-w-4xl mx-auto">
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
      <GlassCard className="space-y-4 border-[#7C3AED]/30 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl text-[#00E676]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Monthly Revenue Progress</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatRevenue(currentRev)}
                <span className="text-xs font-medium text-slate-400 ml-2">
                  / {formatRevenue(revGoal, false)} goal
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen('revenue')}
            className="px-3 py-1.5 rounded-xl bg-[#1E2338] border border-[#2E3552] hover:border-[#00E676] text-xs font-bold text-[#00E676] flex items-center gap-1 cursor-pointer transition-colors"
          >
            Manage <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
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
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      task.isCompleted
                        ? 'bg-[#00E676] border-[#00E676] text-black'
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
                <input
                  type="checkbox"
                  checked={t.isCompleted}
                  onChange={() => toggleTask(t.id)}
                  className="w-4 h-4 rounded text-[#7C3AED] focus:ring-0 cursor-pointer"
                />
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
    </div>
  );
};
