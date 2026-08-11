import React, { useState, useEffect } from 'react';
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

  const [isEditRevenueOpen, setIsEditRevenueOpen] = useState(false);
  const [newCurrentRevenue, setNewCurrentRevenue] = useState<string | number>(
    userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 0
  );

  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [newTargetGoal, setNewTargetGoal] = useState<string | number>(
    userProfile.monthlyRevenueGoal !== undefined ? userProfile.monthlyRevenueGoal : 10000
  );

  useEffect(() => {
    if (isEditRevenueOpen || isEditGoalOpen || isLogIncomeOpen || isCurrencyModalOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditRevenueOpen, isEditGoalOpen, isLogIncomeOpen, isCurrencyModalOpen]);

  const currentRev = userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 0;
  const revGoal = userProfile.monthlyRevenueGoal || 10000;
  const percentAchieved = revGoal > 0 ? Math.min(100, Math.round((currentRev / revGoal) * 100)) : 0;
  const isLight = userProfile.themeMode === 'Light';

  const handleSaveRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = typeof newCurrentRevenue === 'string' ? parseFloat(newCurrentRevenue) : newCurrentRevenue;
    const finalVal = isNaN(parsed) || parsed < 0 ? 0 : parsed;

    updateUserProfile({ currentMonthlyRevenue: finalVal });
    triggerNotification(
      'Current Revenue Updated 💰',
      `Current monthly revenue updated to ${formatRevenue(finalVal)}.`,
      'PAYMENTS'
    );
    setIsEditRevenueOpen(false);
  };

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
    const parsed = typeof newTargetGoal === 'string' ? parseFloat(newTargetGoal) : newTargetGoal;
    if (isNaN(parsed) || parsed <= 0) return;

    updateUserProfile({ monthlyRevenueGoal: parsed });
    triggerNotification('Revenue Goal Updated', `Monthly target set to ${formatRevenue(parsed, false)}.`, 'SYSTEM');
    setIsEditGoalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      {/* Header Banner */}
      <GlassCard className={`border ${
        isLight
          ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 border-emerald-200 text-slate-900 shadow-sm'
          : 'border-[#00E676]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338] text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isLight
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                : 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" /> Task Flow Global Revenue Engine
            </div>
            <h1 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Revenue & Goal Dashboard</h1>
            <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Track monthly recurring income, currency conversions & target milestones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCurrencyModalOpen(true)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:bg-cyan-100'
                  : 'bg-[#0A0C14] border-[#2E3552] text-[#06B6D4] hover:border-[#06B6D4]'
              }`}
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
        <GlassCard className={`sm:col-span-2 space-y-4 border ${
          isLight ? 'bg-white border-purple-200 text-slate-900' : 'border-[#00E676]/30 bg-[#131726] text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Current Monthly Revenue</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewCurrentRevenue(currentRev);
                  setIsEditRevenueOpen(true);
                }}
                className={`text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline ${
                  isLight ? 'text-emerald-700' : 'text-[#00E676]'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Revenue
              </button>
              <button
                onClick={() => {
                  setNewTargetGoal(revGoal);
                  setIsEditGoalOpen(true);
                }}
                className={`text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline ${
                  isLight ? 'text-cyan-800' : 'text-[#06B6D4]'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Target
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatRevenue(currentRev)}
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Target Goal: <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatRevenue(revGoal, false)}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className={isLight ? 'text-emerald-800 font-extrabold' : 'text-[#00E676]'}>{percentAchieved}% Achieved</span>
              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                {formatRevenue(Math.max(0, revGoal - currentRev), false)} Needed
              </span>
            </div>
            <div className={`w-full h-3.5 rounded-full overflow-hidden p-0.5 border ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0A0C14] border-[#2E3552]'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#00E676] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(0,230,118,0.5)]"
                style={{ width: `${percentAchieved}%` }}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className={`space-y-3 flex flex-col justify-between border ${
          isLight ? 'bg-white border-purple-200 text-slate-900' : 'border-[#2E3552] bg-[#131726] text-white'
        }`}>
          <div className="space-y-1">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Active Currency Rate</span>
            <h3 className={`text-xl font-bold flex items-center gap-1.5 mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Globe className="w-5 h-5 text-[#06B6D4]" /> {userProfile.currencyCode}
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              1 USD = {(exchangeRates[userProfile.currencyCode.toUpperCase()] || 1.0).toLocaleString()} {userProfile.currencyCode}
            </p>
          </div>

          <button
            onClick={refreshExchangeRates}
            className={`w-full py-2 border rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs font-bold ${
              isLight
                ? 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100'
                : 'bg-[#0A0C14] border-[#2E3552] text-slate-300 hover:text-white hover:border-[#06B6D4]'
            }`}
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

      {/* Edit Current Revenue Modal */}
      {isEditRevenueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#00E676]" /> Edit Current Monthly Revenue
              </h2>
              <button
                onClick={() => setIsEditRevenueOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRevenue} className="space-y-4">
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
                    value={newCurrentRevenue}
                    onChange={(e) => setNewCurrentRevenue(e.target.value)}
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-[#00E676]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This directly sets your current active monthly revenue total for this month.
                </p>
              </div>

              <NeonButton type="submit" size="md" fullWidth>
                Update Current Revenue
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
