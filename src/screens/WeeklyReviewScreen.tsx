import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WeeklyReview } from '../types';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { BarChart3, Sparkles, Trophy, AlertTriangle, Lightbulb, Calendar } from 'lucide-react';

export const WeeklyReviewScreen: React.FC = () => {
  const { weeklyReviews, generateWeeklyReview, addWeeklyReview, formatRevenue, tasks, userProfile } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [activeReview, setActiveReview] = useState<WeeklyReview | null>(
    weeklyReviews.length > 0 ? weeklyReviews[0] : null
  );

  const handleGenerateReview = async () => {
    setIsLoading(true);
    try {
      const completedTitles = tasks.filter((t) => t.isCompleted).map((t) => t.title);
      const revAmount = userProfile.currentMonthlyRevenue || 0;
      const partialReview = await generateWeeklyReview(completedTitles, revAmount);

      const fullReview: WeeklyReview = {
        id: Date.now(),
        weekTitle: 'Weekly Executive Reflection',
        dateRange: partialReview.dateRange || 'This Week',
        totalTasksCompleted: completedTitles.length || 5,
        revenueGenerated: revAmount,
        productivityScore: 95,
        winsSummary: partialReview.winsSummary || 'Completed core operational priorities.',
        bottlenecksSummary: partialReview.bottlenecksSummary || 'Manual client outreach created slight scheduling delays.',
        improvementsSummary: partialReview.improvementsSummary || 'Implement automated outreach sequences.',
        nextWeekPriorities: partialReview.nextWeekPriorities || '1. Scale outbound leads\n2. Close pending retainer deals',
        createdAt: Date.now(),
      };

      addWeeklyReview(fullReview);
      setActiveReview(fullReview);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#A78BFA]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-xs font-bold border border-[#7C3AED]/30">
              <BarChart3 className="w-3.5 h-3.5" /> AI Executive Reflection
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Weekly Performance Review</h1>
            <p className="text-xs text-slate-400">
              Automated synthesis of weekly wins, bottlenecks & top strategic priorities
            </p>
          </div>

          <NeonButton onClick={handleGenerateReview} disabled={isLoading} size="md">
            <Sparkles className="w-4 h-4" /> {isLoading ? 'Generating...' : 'Generate New Review'}
          </NeonButton>
        </div>
      </GlassCard>

      {/* Review Display Card */}
      {activeReview ? (
        <GlassCard className="space-y-5 border-[#7C3AED]/30">
          <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wider">
                {activeReview.dateRange}
              </span>
              <h2 className="text-xl font-extrabold text-white">{activeReview.weekTitle}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Revenue Logged</span>
              <p className="text-lg font-bold text-[#00E676]">{formatRevenue(activeReview.revenueGenerated)}</p>
            </div>
          </div>

          {/* Wins */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Strategic Wins & Key Accomplishments
            </h3>
            <div className="p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {activeReview.winsSummary}
            </div>
          </div>

          {/* Bottlenecks */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Identified Bottlenecks & Friction Points
            </h3>
            <div className="p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {activeReview.bottlenecksSummary}
            </div>
          </div>

          {/* Learnings & Improvements */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Key Learnings & Systems Optimizations
            </h3>
            <div className="p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {activeReview.improvementsSummary}
            </div>
          </div>

          {/* Next Week Priorities */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Next Week Top Strategic Focus
            </h3>
            <div className="p-3.5 bg-[#0A0C14] border border-[#2E3552] rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {activeReview.nextWeekPriorities}
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="text-center py-12 space-y-3">
          <BarChart3 className="w-10 h-10 text-[#A78BFA] mx-auto" />
          <h3 className="font-bold text-base text-white">No Weekly Review Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the button above to synthesize your completed tasks and revenue gains into an executive digest.
          </p>
          <NeonButton onClick={handleGenerateReview} size="sm">
            <Sparkles className="w-4 h-4" /> Generate First Weekly Review
          </NeonButton>
        </GlassCard>
      )}

      {/* Historical Reviews Archive */}
      {weeklyReviews.length > 0 && (
        <GlassCard className="space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Historical Performance Archive
          </h3>
          <div className="space-y-2">
            {weeklyReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => setActiveReview(rev)}
                className={`p-3 bg-[#0A0C14] border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  activeReview?.id === rev.id
                    ? 'border-[#7C3AED] bg-[#1E2338]/50'
                    : 'border-[#2E3552] hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white">{rev.weekTitle} ({rev.dateRange})</div>
                  <span className="text-[10px] text-slate-400">{rev.totalTasksCompleted} Tasks Completed</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-[#00E676]">{formatRevenue(rev.revenueGenerated)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
