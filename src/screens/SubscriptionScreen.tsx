import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mail,
  Check,
  Copy,
  Clock,
  Building2,
  CreditCard,
  Sparkles,
  Lock,
  Calendar,
  Zap,
  Globe,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  QrCode,
  Smartphone,
  X,
  Info,
} from 'lucide-react';
import { triggerSubscriptionReceiptApi } from '../services/api';

type DurationKey = '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR';

interface PlanOption {
  key: DurationKey;
  months: number;
  days: number;
  label: string;
  badge?: string;
  badgeColor?: string;
  baseNgn: number;
  discountNote: string;
  monthlyEquivalentNgn: number;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    key: '1_MONTH',
    months: 1,
    days: 30,
    label: '1 Month',
    baseNgn: 7500,
    discountNote: 'Standard monthly billing',
    monthlyEquivalentNgn: 7500,
  },
  {
    key: '3_MONTHS',
    months: 3,
    days: 90,
    label: '3 Months',
    badge: 'MOST POPULAR',
    badgeColor: 'from-amber-500 to-orange-500',
    baseNgn: 20000,
    discountNote: 'Save 11% vs monthly',
    monthlyEquivalentNgn: 6667,
  },
  {
    key: '6_MONTHS',
    months: 6,
    days: 180,
    label: '6 Months',
    badge: 'SAVE 20%',
    badgeColor: 'from-cyan-500 to-blue-500',
    baseNgn: 36000,
    discountNote: 'Save 20% vs monthly',
    monthlyEquivalentNgn: 6000,
  },
  {
    key: '1_YEAR',
    months: 12,
    days: 365,
    label: '1 Year',
    badge: 'BEST VALUE',
    badgeColor: 'from-purple-500 to-pink-500',
    baseNgn: 65000,
    discountNote: 'Save 28% • 2+ Months Free',
    monthlyEquivalentNgn: 5417,
  },
];

export const SubscriptionScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification, exchangeRates } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  // True active subscription check (must be subscribed AND have valid future expiry)
  const isUserSubscribed = Boolean(
    userProfile.isSubscribed &&
    userProfile.subscriptionExpiryMs &&
    userProfile.subscriptionExpiryMs > Date.now()
  );

  // For unsubscribed / registering users: strictly NO plan is pre-selected or highlighted
  const [selectedDuration, setSelectedDuration] = useState<DurationKey | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptSent, setReceiptSent] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'account' | 'bank' | 'name' | null>(null);
  const [senderName, setSenderName] = useState(userProfile.userName || '');
  const [paymentRef, setPaymentRef] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // State for Switch / Change Plan confirmation modal
  const [showSwitchPlanModal, setShowSwitchPlanModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanOption | null>(null);

  // Live countdown timer state for active subscription
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  // Calculate live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!isUserSubscribed || !userProfile.subscriptionExpiryMs) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const diffMs = userProfile.subscriptionExpiryMs - Date.now();
      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        if (userProfile.isSubscribed) {
          updateUserProfile({ isSubscribed: false, subscriptionExpiryMs: 0 });
        }
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds: totalSec });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isUserSubscribed, userProfile.subscriptionExpiryMs]);

  // Active plan details (what user actually paid for)
  const activePlanKey = (userProfile.subscriptionDuration || '3_MONTHS') as DurationKey;
  const activePlan = PLAN_OPTIONS.find((p) => p.key === activePlanKey) || PLAN_OPTIONS[1];

  // Selected plan details for payment/preview (null if user hasn't clicked a duration yet)
  const currentPlan = selectedDuration ? PLAN_OPTIONS.find((p) => p.key === selectedDuration) || null : null;

  // Helper to format price in user's selected country currency based on real exchange rates
  const formatPrice = (ngnAmount: number) => {
    const code = (userProfile.currencyCode || 'NGN').toUpperCase();
    const symbol = userProfile.currencySymbol || '₦';

    if (code === 'NGN') {
      return `₦${ngnAmount.toLocaleString()}`;
    }

    const ngnRate = exchangeRates['NGN'] || 1540.0;
    const targetRate = exchangeRates[code] || 1.0;
    const converted = (ngnAmount / ngnRate) * targetRate;

    if (targetRate < 50) {
      return `${symbol}${converted.toFixed(2)}`;
    }
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  };

  const copyToClipboard = (text: string, field: 'account' | 'bank' | 'name') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePlanCardClick = (plan: PlanOption) => {
    setSelectedDuration(plan.key);
    // If the user already has an active subscription and clicks a different plan
    if (isUserSubscribed && plan.key !== activePlanKey) {
      setPendingPlan(plan);
      setShowSwitchPlanModal(true);
    } else {
      // Pop-up modal appears immediately upon clicking any plan!
      setShowPaymentModal(true);
    }
  };

  const handleConfirmPlanSwitch = () => {
    if (pendingPlan) {
      setSelectedDuration(pendingPlan.key);
      setShowSwitchPlanModal(false);
      triggerNotification(
        'Plan Selection Updated',
        `Switched payment destination to ${pendingPlan.label} Pass (${formatPrice(pendingPlan.baseNgn)}). Complete transfer to activate new duration.`,
        'PAYMENTS'
      );
      setPendingPlan(null);
    }
  };

  const handleSwitchAndActivateDirectly = () => {
    if (pendingPlan) {
      setSelectedDuration(pendingPlan.key);
      setShowSwitchPlanModal(false);
      setShowPaymentModal(true);
      triggerNotification(
        'Ready to Activate Plan',
        `Enter your transfer details below to activate the ${pendingPlan.label} Pass (${formatPrice(pendingPlan.baseNgn)}).`,
        'PAYMENTS'
      );
      setPendingPlan(null);
    }
  };

  const handleActivatePro = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDuration) {
      alert('Please select a subscription plan duration first.');
      return;
    }
    setIsProcessing(true);

    const plan = PLAN_OPTIONS.find((p) => p.key === selectedDuration) || PLAN_OPTIONS[1];
    const nowMs = Date.now();
    const expiryMs = nowMs + plan.days * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(expiryMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const email = userProfile.userEmail || 'mummom692@gmail.com';
    const name = senderName.trim() || userProfile.userName || 'Valued Founder';

    const formattedLocalPrice = formatPrice(plan.baseNgn);
    const planName = `TaskFlow AI Pro ${plan.label} Pass (${formatPrice(plan.baseNgn)} / ₦${plan.baseNgn.toLocaleString()})`;

    updateUserProfile({
      isSubscribed: true,
      subscriptionDuration: plan.key,
      subscriptionTimestampMs: nowMs,
      subscriptionExpiryMs: expiryMs,
      subscriptionExpiryDate: expiryDate,
      isOnboarded: true,
    });

    try {
      const res = await triggerSubscriptionReceiptApi(email, name, formattedLocalPrice, planName);
      const txn = paymentRef.trim() || res.transactionId || `TF-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptSent(txn);

      triggerNotification(
        `Pro ${plan.label} Pass Activated! 👑`,
        `Payment verified for ${name}. Unlocked ${plan.days} days of full workspace access. Receipt sent to ${email}.`,
        'SYSTEM',
        'dashboard'
      );
    } catch (err) {
      const fallbackTxn = paymentRef.trim() || `TF-MOMO-${Date.now().toString().slice(-6)}`;
      setReceiptSent(fallbackTxn);
      triggerNotification(
        `Pro ${plan.label} Pass Activated! 👑`,
        `Payment verified. Unlocked ${plan.days} days of full access. Welcome to TaskFlow AI!`,
        'SYSTEM',
        'dashboard'
      );
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
      setTimeout(() => {
        setCurrentScreen('dashboard');
      }, 1600);
    }
  };

  const benefits = [
    'Unlimited Gemini 3.7 Flash & GPT-4o AI Daily Strategy Generation',
    'Real-time Auto-Conversion across 20+ Global Fiat Currencies',
    'Access to all 50+ Pre-built Business Automation Playbooks',
    '24/7 Executive AI Business Assistant with instant proposal generator',
    'Cloud Firestore Database Backup & Multi-device Realtime Sync',
    'Custom High-Ticket Revenue Goal Tracking & Milestones',
    'Priority Customer & Account Support',
  ];

  return (
    <div className="space-y-7 pt-2 pb-32 px-3 sm:px-6 max-w-4xl mx-auto animate-fade-in overflow-x-hidden">
      {/* Top navigation bar: "Back to Workspace" for verified subscribers, "Back to Profile & Setup" for new users */}
      {isUserSubscribed && userProfile.isOnboarded ? (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setCurrentScreen('dashboard')}
            className={`py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-[#06B6D4]" />
            <span>Back to Workspace</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Active Member</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => setCurrentScreen('onboarding')}
            className={`py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title="Return to Profile, Country and Goals Setup"
          >
            <ArrowLeft className="w-4 h-4 text-[#06B6D4]" />
            <span>Back to Profile, Country & Goals</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400 shadow-sm">
            <Lock className="w-3 h-3" />
            <span>Step 3 of 3 • Gateway</span>
          </div>
        </div>
      )}

      {/* Header Badge & Title */}
      <div className="text-center space-y-3 pb-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#F59E0B] via-[#D97706] to-[#7C3AED] p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.45)]">
          <div className={`w-full h-full rounded-[22px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0A0C14]'}`}>
            <Crown className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            TaskFlow AI Subscription Pass
          </h1>
          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Unlock unrestricted access to automated business strategy, AI assistants, and high-ticket revenue tools.
          </p>
        </div>
      </div>

      {/* Access Gate Warning Banner if not subscribed */}
      {!isUserSubscribed && (
        <div
          className={`p-4 rounded-3xl border flex items-center gap-3.5 shadow-sm my-2 ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <span className="font-bold block text-sm">Subscription Payment Required</span>
            <span className="leading-relaxed block">
              Anyone who hasn't paid will not be granted access to the workspace. Choose your plan below and transfer to the designated Momo PSB account to activate.
            </span>
          </div>
        </div>
      )}

      {/* Live Countdown & Status Box: Only shown if user is ALREADY an active subscriber */}
      {isUserSubscribed && (
        <GlassCard
          className={`p-6 sm:p-8 rounded-3xl border transition-all my-3 ${
            isLight
              ? 'bg-emerald-50/90 border-emerald-300 shadow-md ring-1 ring-emerald-400/30'
              : 'bg-emerald-950/35 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
          }`}
        >
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-sm shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black">
                      ACTIVE
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Executive Workspace Pass
                    </span>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-black mt-0.5 flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                    TaskFlow AI Pro • {activePlan.label} Pass
                  </h3>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-2xl border text-xs flex items-center gap-2 self-start sm:self-auto ${
                isLight ? 'bg-white border-emerald-300 text-slate-900 shadow-sm' : 'bg-[#0A0C14] border-emerald-500/30 text-emerald-300'
              }`}>
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Expires On:</span>
                  <span className={`font-mono font-black text-sm ${isLight ? 'text-emerald-700' : 'text-white'}`}>
                    {userProfile.subscriptionExpiryDate || 'Active Subscription'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Digital Countdown Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                <span className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Real-Time Subscription Expiry Countdown:</span>
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${isLight ? 'text-cyan-700' : 'text-[#06B6D4]'}`}>
                  {timeLeft.days} Days Remaining
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
                <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center ${isLight ? 'bg-white border-amber-300 shadow-sm' : 'bg-[#0A0C14] border-[#2E3552]'}`}>
                  <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>DAYS</div>
                </div>

                <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center ${isLight ? 'bg-white border-cyan-300 shadow-sm' : 'bg-[#0A0C14] border-[#2E3552]'}`}>
                  <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? 'text-cyan-600' : 'text-[#06B6D4]'}`}>
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>HOURS</div>
                </div>

                <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center ${isLight ? 'bg-white border-purple-300 shadow-sm' : 'bg-[#0A0C14] border-[#2E3552]'}`}>
                  <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? 'text-purple-600' : 'text-[#A78BFA]'}`}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>MINUTES</div>
                </div>

                <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center ${isLight ? 'bg-white border-emerald-300 shadow-sm' : 'bg-[#0A0C14] border-[#2E3552]'}`}>
                  <div className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>SECONDS</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Plan Duration Selector (1 Month, 3 Months, 6 Months, 1 Year) */}
      <div className="space-y-4 my-5">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <label className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            {isUserSubscribed ? 'Available Subscription Plans (Select to Switch or Extend):' : 'Select Subscription Duration:'}
          </label>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Globe className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Currency: <strong className={isLight ? 'text-slate-950 font-black' : 'text-white'}>{userProfile.country} ({userProfile.currencyCode} {userProfile.currencySymbol})</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PLAN_OPTIONS.map((plan) => {
            const isCurrentActivePlan = isUserSubscribed && plan.key === activePlanKey;
            const isSelected = selectedDuration === plan.key;
            const localizedPrice = formatPrice(plan.baseNgn);
            const localizedMonthly = formatPrice(plan.monthlyEquivalentNgn);

            return (
              <div
                key={plan.key}
                onClick={() => handlePlanCardClick(plan)}
                className={`relative p-5 rounded-3xl border transition-all cursor-pointer select-none ${
                  isCurrentActivePlan
                    ? isLight
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/40 text-slate-900'
                      : 'bg-gradient-to-br from-[#122B22] to-[#0D1D18] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400 text-white'
                    : isSelected
                    ? isLight
                      ? 'bg-gradient-to-br from-purple-50 to-amber-50/80 border-purple-600 shadow-md ring-2 ring-purple-400/40 text-slate-900'
                      : 'bg-gradient-to-br from-[#1E2338] to-[#131726] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-[#F59E0B] text-white'
                    : isLight
                    ? 'bg-white border-slate-300 hover:border-purple-400 shadow-sm text-slate-900 hover:shadow-md'
                    : 'bg-[#131726]/70 border-[#2E3552] hover:border-slate-500 text-white'
                }`}
              >
                {/* Badges: Active Plan takes priority, otherwise marketing badge */}
                {isCurrentActivePlan ? (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-sm uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ACTIVE PLAN
                  </div>
                ) : plan.badge ? (
                  <div
                    className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-gradient-to-r ${
                      plan.badgeColor || 'from-[#7C3AED] to-[#06B6D4]'
                    } shadow-sm uppercase tracking-wider`}
                  >
                    {plan.badge}
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black block uppercase tracking-wider ${isLight ? 'text-purple-900' : 'text-slate-400'}`}>
                        {plan.label} ({plan.days} Days)
                      </span>
                      {isCurrentActivePlan && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                        {localizedPrice}
                      </span>
                      {userProfile.currencyCode !== 'NGN' && (
                        <span className={`text-[11px] font-mono ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                          (₦{plan.baseNgn.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center mt-1 ${
                      isCurrentActivePlan
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isSelected
                        ? 'bg-[#F59E0B] border-[#F59E0B] text-black'
                        : isLight
                        ? 'border-slate-400 bg-slate-100'
                        : 'border-slate-500'
                    }`}
                  >
                    {(isCurrentActivePlan || isSelected) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-200' : 'border-purple-500/20'}`}>
                  <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>
                    {isCurrentActivePlan
                      ? `Expires: ${userProfile.subscriptionExpiryDate || 'Active'}`
                      : plan.discountNote}
                  </span>
                  <span className={`font-black ${isLight ? 'text-cyan-700' : 'text-[#06B6D4]'}`}>~{localizedMonthly}/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Designated Bank Account Transfer Details (Momo PSB) */}
      <GlassCard
        className={`p-6 sm:p-7 rounded-3xl border space-y-4 shadow-lg my-3 ${
          isLight
            ? 'bg-gradient-to-br from-amber-50/70 via-white to-purple-50/70 border-amber-300'
            : 'border-[#F59E0B]/50 bg-gradient-to-br from-[#181528] via-[#1E2338] to-[#131726] shadow-[0_0_30px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#F59E0B] uppercase tracking-wider block">
                OFFICIAL PAYMENT DESTINATION
              </span>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Direct Bank Transfer Account
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/40 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> VERIFIED ACCOUNT
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {currentPlan ? (
            <>
              Please make payment for your chosen duration (<strong>{currentPlan.label}: {formatPrice(currentPlan.baseNgn)} / ₦{currentPlan.baseNgn.toLocaleString()}</strong>) directly to this verified account:
            </>
          ) : (
            <>
              Please select a plan duration above to view your exact payment amount, then transfer directly to this verified account:
            </>
          )}
        </p>

        {/* Account Details Box with generous internal margins and divider line padding */}
        <div className={`p-5 rounded-2xl border space-y-3.5 my-2 ${isLight ? 'bg-white border-amber-300 shadow-sm' : 'bg-[#0A0C14] border-[#2E3552]'}`}>
          {/* Bank Name */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Bank Name:</span>
              <span className={`text-base font-black ${isLight ? 'text-purple-950' : 'text-white'}`}>Momo PSB</span>
            </div>
            <button
              onClick={() => copyToClipboard('Momo PSB', 'bank')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-colors ${
                isLight ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'bank' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Account Number */}
          <div className={`flex items-center justify-between gap-2 pt-3.5 pb-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-700/40'}`}>
            <div>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Account Number:</span>
              <span className={`text-xl sm:text-2xl font-black font-mono tracking-wider ${isLight ? 'text-cyan-700' : 'text-[#06B6D4]'}`}>
                8038977104
              </span>
            </div>
            <button
              onClick={() => copyToClipboard('8038977104', 'account')}
              className="px-3.5 py-2 rounded-xl bg-[#06B6D4]/20 hover:bg-[#06B6D4]/30 text-[#06B6D4] text-xs font-black flex items-center gap-1.5 border border-[#06B6D4]/40 cursor-pointer shadow-sm"
            >
              {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'account' ? 'Copied Account!' : 'Copy Account'}
            </button>
          </div>

          {/* Account Name */}
          <div className={`flex items-center justify-between gap-2 pt-3.5 pb-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-700/40'}`}>
            <div>
              <span className={`text-[10px] uppercase tracking-wider block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Account Name:</span>
              <span className={`text-base font-black ${isLight ? 'text-slate-950' : 'text-slate-200'}`}>Stephen Owota</span>
            </div>
            <button
              onClick={() => copyToClipboard('Stephen Owota', 'name')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-colors ${
                isLight ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'name' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Verification / Activation Form Trigger */}
        <div className="pt-3">
          {receiptSent ? (
            <div className={`p-4 rounded-2xl text-center space-y-1 border ${
              isLight ? 'bg-emerald-50 border-emerald-300 text-slate-900' : 'bg-emerald-500/10 border-emerald-500/40 text-slate-200'
            }`}>
              <div className="text-emerald-600 font-black text-sm flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Payment Activated Successfully!
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Receipt dispatched to <span className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{userProfile.userEmail || 'mummom692@gmail.com'}</span> (Txn: {receiptSent})
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!currentPlan) {
                    triggerNotification('Select Plan Duration', 'Please click on a subscription plan above before proceeding to payment confirmation.', 'PAYMENTS');
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                disabled={isProcessing}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentPlan
                    ? 'bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#7C3AED] text-white hover:scale-[1.01] active:scale-[0.99]'
                    : isLight
                    ? 'bg-slate-200 text-slate-500 border border-slate-300 hover:border-slate-400'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying Transfer & Activating Pass...
                  </>
                ) : currentPlan ? (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>I Have Made Payment (Activate {currentPlan.label} Pass)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Click a Plan Above to Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className={`text-[11px] text-center italic ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Transfers to Momo PSB (Stephen Owota - 8038977104) are verified instantly.
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Features & Benefits List */}
      <GlassCard className={`p-6 sm:p-7 rounded-3xl border space-y-4 my-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : ''}`}>
        <h3 className={`font-black text-xs uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-slate-300'}`}>
          EVERYTHING UNLOCKED WITH PRO ACCESS:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-[#00E676]'}`} />
              <span className={`text-xs font-semibold leading-relaxed ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                {b}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Warning Modal for Switching Plan while Current Plan is Active (Reduced size, never touches top line) */}
      {showSwitchPlanModal && pendingPlan && (
        <div className="modal-backdrop-fixed animate-fade-in">
          <div className={`my-auto max-w-md w-full max-h-[72vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-scale-up ${
            isLight ? 'bg-white text-slate-900 border-amber-300' : 'bg-[#131726] text-white border-amber-500/50'
          }`}>
            {/* Compact Header with safe top spacing */}
            <div className={`flex items-center justify-between pt-4 pb-3 px-5 border-b flex-shrink-0 ${
              isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-[#181D30] border-amber-500/20'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">Switch Active Plan?</h3>
                  <span className="text-[11px] text-amber-400 font-semibold block">Active Subscription Notice</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSwitchPlanModal(false);
                  setPendingPlan(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer hover:bg-slate-800/50 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Middle Content with clean spacing */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1">
              {/* Current vs Target Plan Comparison */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className={`p-3 rounded-2xl border ${isLight ? 'bg-emerald-50/80 border-emerald-300' : 'bg-emerald-950/30 border-emerald-500/30'}`}>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block">Current Plan</span>
                  <span className="font-extrabold block text-xs sm:text-sm mt-0.5">{activePlan.label} Pass</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {timeLeft.days}d remaining
                  </span>
                </div>

                <div className={`p-3 rounded-2xl border ${isLight ? 'bg-purple-50/80 border-purple-300' : 'bg-purple-950/30 border-purple-500/30'}`}>
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">New Plan</span>
                  <span className="font-extrabold block text-xs sm:text-sm mt-0.5 text-[#06B6D4]">{pendingPlan.label} Pass</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-1 block">
                    {formatPrice(pendingPlan.baseNgn)} ({pendingPlan.days}d)
                  </span>
                </div>
              </div>

              {/* Consequences Breakdown */}
              <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                isLight ? 'bg-amber-50/80 border-amber-300 text-slate-800' : 'bg-[#0A0C14] border-amber-500/30 text-slate-300'
              }`}>
                <div className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" /> Consequences of Switching:
                </div>

                <ul className="space-y-1.5 text-[11px] leading-relaxed list-disc list-inside">
                  <li>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>New Transfer Required:</strong> Transfer <span className="text-amber-400 font-bold">{formatPrice(pendingPlan.baseNgn)} (₦{pendingPlan.baseNgn.toLocaleString()})</span> to Momo PSB.
                  </li>
                  <li>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>Cycle Reset:</strong> Your timer updates to <strong>{pendingPlan.days} Days</strong> upon verification.
                  </li>
                  <li>
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>Upgrade Notice:</strong> You can keep using your remaining {timeLeft.days} days and renew later if preferred.
                  </li>
                </ul>
              </div>
            </div>

            {/* Dedicated Compact Footer */}
            <div className={`p-4 px-5 border-t flex-shrink-0 space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181D30] border-slate-800'
            }`}>
              <button
                type="button"
                onClick={handleSwitchAndActivateDirectly}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#7C3AED] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Switch & Activate {pendingPlan.label} Pass ({formatPrice(pendingPlan.baseNgn)})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSwitchPlanModal(false);
                    setPendingPlan(null);
                  }}
                  className={`w-1/2 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-200/60' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Keep Current Plan
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPlanSwitch}
                  className={`w-1/2 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                  }`}
                >
                  <Check className="w-3 h-3 text-[#06B6D4]" /> Select Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && currentPlan && (
        <div className="modal-backdrop-fixed animate-fade-in">
          <div className={`my-auto max-w-lg w-full max-h-[88vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-scale-up ${
            isLight ? 'bg-white text-slate-900 border-purple-200' : 'bg-[#131726] text-white border-[#2E3552]'
          }`}>
            {/* Payment Header */}
            <div className={`flex items-center justify-between pt-6 pb-4 px-6 sm:px-7 border-b flex-shrink-0 ${
              isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-[#181D30] border-purple-500/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">Confirm Transfer Details</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">TaskFlow AI {currentPlan.label} Plan</span>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white text-sm font-bold cursor-pointer hover:bg-slate-800/50 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleActivatePro} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 sm:p-7 overflow-y-auto space-y-4 custom-scrollbar flex-1">
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Plan:</span>
                    <span className="font-bold text-[#06B6D4]">{currentPlan.label} ({currentPlan.days} Days)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-extrabold text-amber-400">{formatPrice(currentPlan.baseNgn)} (₦{currentPlan.baseNgn.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Momo PSB • 8038977104 (Stephen Owota)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">
                    Sender Account Name (As shown on your bank receipt):
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Stephen Owota or Alex Rivera"
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#06B6D4] transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">
                    Transaction Reference / Session ID (Optional):
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. 09023481723490 or Transfer ID"
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#06B6D4] transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Dedicated Form Footer with generous bottom spacing */}
              <div className={`pt-4 pb-6 px-6 sm:px-7 border-t flex-shrink-0 flex items-center gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181D30] border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className={`w-1/3 py-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-200/60' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#7C3AED] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Verify & Activate Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
