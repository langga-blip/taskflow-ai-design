import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { ShimmerEffect } from '../components/ShimmerEffect';
import { Sparkles, Calendar, Clock, Plus, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const AiDailyPlannerScreen: React.FC = () => {
  const { userProfile, generateDailyPlan, saveTask, setCurrentScreen, triggerNotification, aiProvider } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Task[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setIsAdded(false);
    try {
      const plan = await generateDailyPlan();
      setGeneratedPlan(plan);
    } catch (e) {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToTasks = () => {
    if (generatedPlan.length === 0) return;
    generatedPlan.forEach((t) => saveTask(t));
    setIsAdded(true);
    triggerNotification(
      'Daily AI Strategy Active 🚀',
      `Added ${generatedPlan.length} priorities to your active Task Manager.`,
      'AI',
      'tasks'
    );
  };

  const timeBlocks = [
    { time: '09:00 AM - 10:30 AM', focus: 'Deep Work: Revenue & Sales Outreach', icon: '🔥' },
    { time: '11:00 AM - 12:30 PM', focus: 'High-Ticket Client Deliverables & Proposals', icon: '💼' },
    { time: '02:00 PM - 03:30 PM', focus: 'Operations, Systems & Team Sync', icon: '⚙️' },
    { time: '04:00 PM - 05:00 PM', focus: 'Lead Magnet & Content Batching', icon: '🚀' },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#06B6D4]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-xs font-bold border border-[#06B6D4]/30">
              <Sparkles className="w-3.5 h-3.5" /> Powered by {aiProvider}
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Daily Strategy Planner</h1>
            <p className="text-xs text-slate-400">
              Aligning today's tasks with goal: <span className="text-[#06B6D4] font-semibold">{userProfile.goal1}</span>
            </p>
          </div>

          <NeonButton onClick={handleGeneratePlan} disabled={isLoading} size="md">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Strategy
              </>
            )}
          </NeonButton>
        </div>
      </GlassCard>

      {/* Generated Strategy Container */}
      {isLoading ? (
        <GlassCard className="space-y-3">
          <ShimmerEffect className="h-6 w-1/3" />
          <ShimmerEffect className="h-16 w-full" />
          <ShimmerEffect className="h-16 w-full" />
          <ShimmerEffect className="h-16 w-full" />
        </GlassCard>
      ) : generatedPlan.length > 0 ? (
        <GlassCard className="space-y-4 border-[#7C3AED]/40">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00E676]" /> Today's Prioritized AI Execution Plan
            </h3>
            <button
              onClick={handleAddAllToTasks}
              disabled={isAdded}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAdded
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added to Task Manager
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add All to My Tasks
                </>
              )}
            </button>
          </div>

          <div className="space-y-2.5">
            {generatedPlan.map((t, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0A0C14] border border-[#2E3552] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#7C3AED]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-xs font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-white">{t.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 pl-7">{t.description}</p>
                </div>

                <div className="flex items-center gap-2 pl-7 sm:pl-0">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#1E2338] text-slate-300 rounded border border-[#2E3552]">
                    {t.category}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">
                    $$$ High Impact
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    ⏱️ {t.estimatedMinutes}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="text-center py-10 space-y-3">
          <Sparkles className="w-10 h-10 text-[#06B6D4] mx-auto animate-pulse" />
          <h3 className="font-bold text-base text-white">Generate Today's AI Business Strategy</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tap the button above to let Gemini analyze your revenue goals and generate 3-4 top execution priorities.
          </p>
          <NeonButton onClick={handleGeneratePlan} size="sm">
            <Sparkles className="w-4 h-4" /> Launch Strategy Generator
          </NeonButton>
        </GlassCard>
      )}

      {/* Time-Blocking Schedule Blueprint */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#A78BFA]" />
          <h3 className="font-bold text-base text-white">Optimal Daily Time-Block Schedule</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timeBlocks.map((b, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl flex items-start gap-3"
            >
              <span className="text-xl">{b.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-[#06B6D4]">{b.time}</span>
                <p className="font-bold text-xs text-white mt-0.5">{b.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
