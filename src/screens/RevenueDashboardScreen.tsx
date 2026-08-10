import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCY_OPTIONS } from '../data/initialData';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import {
  TrendingUp,
  Globe,
  Plus,
  DollarSign,
  Edit2,
  RefreshCw,
  Check,
  ArrowUpRight,
  PieChart,
  Target,
  Zap,
} from 'lucide-react';

export const RevenueDashboardScreen: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    switchCurrency,
    formatRevenue,
    exchangeRates,
    refreshExchangeRates,
    triggerNotification,
  } = useApp();

  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLogIncomeOpen, setIsLogIncomeOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeNotes, setIncomeNotes] = useState('');

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [newTargetGoal, setNewTargetGoal] = useState(userProfile.monthlyRevenueGoal || 10000);

  const currentRev = userProfile.currentMonthlyRevenue || 3450;
  const revGoal = userProfile.monthlyRevenueGoal || 10000;
  const percentAchieved = Math.min(100, Math.round((currentRev / revGoal) * 100));

  const handleLogIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(incomeAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const updatedRevenue = currentRev + amountNum;
    updateUserProfile({ currentMonthlyRevenue: updatedRevenue });

    triggerNotification(
      'Income Logged! 💰',
      `Logged ${formatRevenue(amountNum)} (${incomeNotes || 'Client Payment'}). Total Monthly Revenue is now ${formatRevenue(updatedRevenue)}.`,
      'PAYMENTS'
    );

    setIncomeAmount('');
    setIncomeNotes('');
    setIsLogIncomeOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTargetGoal <= 0) return;

    updateUserProfile({ monthlyRevenueGoal: Number(newTargetGoal) });
    triggerNotification('Revenue Goal Updated', `Monthly target set to ${formatRevenue(newTargetGoal, false)}.`, 'SYSTEM');
    setIsEditGoalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#00E676]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-bold border border-[#00E676]/30">
              <TrendingUp className="w-3.5 h-3.5" /> Spectrey Global Revenue Engine
            </div>
            <h1 className="text-2xl font-extrabold text-white">Revenue & Goal Dashboard</h1>
            <p className="text-xs text-slate-400">
              Track monthly recurring income, currency conversions & target milestones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCurrencyModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#0A0C14] border border-[#2E3552] hover:border-[#06B6D4] text-xs font-bold text-[#06B6D4] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" /> {userProfile.currencyCode} ({userProfile.currencySymbol})
            </button>
            <NeonButton onClick={() => setIsLogIncomeOpen(true)} size="sm">
              <Plus className="w-4 h-4" /> Log Income
            </NeonButton>
          </div>
        </div>
      </GlassCard>

      {/* Hero Revenue Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="sm:col-span-2 space-y-4 border-[#00E676]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Monthly Revenue</span>
            <button
              onClick={() => setIsEditGoalOpen(true)}
              className="text-xs font-bold text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Target
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatRevenue(currentRev)}
            </h2>
            <p className="text-xs text-slate-400">
              Target Goal: <span className="text-white font-bold">{formatRevenue(revGoal, false)}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#00E676]">{percentAchieved}% Achieved</span>
              <span className="text-slate-400">
                {formatRevenue(Math.max(0, revGoal - currentRev), false)} Needed
              </span>
            </div>
            <div className="w-full h-3.5 bg-[#0A0C14] rounded-full overflow-hidden p-0.5 border border-[#2E3552]">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#00E676] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(0,230,118,0.5)]"
                style={{ width: `${percentAchieved}%` }}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Active Currency Rate</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-1.5 mt-1">
              <Globe className="w-5 h-5 text-[#06B6D4]" /> {userProfile.currencyCode}
            </h3>
            <p className="text-[11px] text-slate-400">
              1 USD = {(exchangeRates[userProfile.currencyCode.toUpperCase()] || 1.0).toLocaleString()} {userProfile.currencyCode}
            </p>
          </div>

          <button
            onClick={refreshExchangeRates}
            className="w-full py-2 bg-[#0A0C14] border border-[#2E3552] hover:border-[#06B6D4] text-xs font-bold text-slate-300 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Rates
          </button>
        </GlassCard>
      </div>

      {/* Revenue Milestones & Growth Projections */}
      <GlassCard className="space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#F59E0B]" /> Revenue Milestones & Growth Forecast
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-[#0A0C14] border border-[#2E3552] rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Q1 Forecast</span>
            <p className="font-bold text-lg text-white">{formatRevenue(currentRev * 3, false)}</p>
            <span className="text-[10px] text-[#00E676] font-bold">+15% vs last quarter</span>
          </div>

          <div className="p-4 bg-[#0A0C14] border border-[#2E3552] rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Annual Run Rate (ARR)</span>
            <p className="font-bold text-lg text-[#06B6D4]">{formatRevenue(currentRev * 12, false)}</p>
            <span className="text-[10px] text-slate-400">Based on current pace</span>
          </div>

          <div className="p-4 bg-[#0A0C14] border border-[#2E3552] rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Average Client Retainer</span>
            <p className="font-bold text-lg text-[#A78BFA]">{formatRevenue(currentRev > 0 ? currentRev / 3 : 1500, false)}</p>
            <span className="text-[10px] text-slate-400">High-ticket package average</span>
          </div>
        </div>
      </GlassCard>

      {/* Currency Switcher Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#06B6D4]" /> Select Primary Fiat Currency
              </h2>
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {CURRENCY_OPTIONS.map((c) => {
                const isSelected = userProfile.currencyCode === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      switchCurrency(c.code);
                      setIsCurrencyModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm">{c.code} ({c.symbol})</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Log Income Modal */}
      {isLogIncomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white">Log Income / Client Payment</h2>
              <button
                onClick={() => setIsLogIncomeOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLogIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount ({userProfile.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Client Name
                </label>
                <input
                  type="text"
                  value={incomeNotes}
                  onChange={(e) => setIncomeNotes(e.target.value)}
                  placeholder="e.g. Acme Corp Monthly Retainer Payment"
                  className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <NeonButton type="submit" size="md" fullWidth>
                Log Payment To Dashboard
              </NeonButton>
            </form>
          </div>
        </div>
      )}

      {/* Edit Target Goal Modal */}
      {isEditGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white">Edit Monthly Revenue Goal</h2>
              <button
                onClick={() => setIsEditGoalOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Monthly Revenue ({userProfile.currencySymbol})
                </label>
                <input
                  type="number"
                  required
                  value={newTargetGoal}
                  onChange={(e) => setNewTargetGoal(Number(e.target.value))}
                  className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <NeonButton type="submit" size="md" fullWidth>
                Save New Target Goal
              </NeonButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
