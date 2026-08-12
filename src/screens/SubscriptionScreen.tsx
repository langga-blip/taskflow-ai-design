import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { Crown, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Mail, Check } from 'lucide-react';
import { triggerSubscriptionReceiptApi } from '../services/api';

export const SubscriptionScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptSent, setReceiptSent] = useState<string | null>(null);

  const handleActivatePro = async () => {
    setIsProcessing(true);
    updateUserProfile({ isSubscribed: true });

    const email = userProfile.userEmail || 'mummom692@gmail.com';
    const name = userProfile.userName || 'Valued User';

    try {
      const res = await triggerSubscriptionReceiptApi(email, name, '₦20,000', 'TaskFlow AI Pro 3-Month Pass');
      const txn = res.transactionId || `TF-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptSent(txn);

      triggerNotification(
        'Pro 3-Month Pass Activated! 👑',
        `Payment receipt sent to ${email} (Txn: ${txn}). Unlocked full access!`,
        'SYSTEM',
        'dashboard'
      );
    } catch (err) {
      triggerNotification(
        'Pro 3-Month Pass Activated! 👑',
        'Unlocked unlimited AI strategy, global currencies & 50+ templates.',
        'SYSTEM',
        'dashboard'
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setCurrentScreen('dashboard');
      }, 1500);
    }
  };

  const benefits = [
    'Unlimited Gemini 3.5 Flash & GPT-4o AI Daily Strategy Generation',
    'Real-time Auto-Conversion across 20+ Global Fiat Currencies',
    'Access to all 50+ Pre-built Business Automation Playbooks',
    '24/7 Executive AI Business Assistant with proposal generator',
    'Cloud Firestore Database Backup & Multi-device Sync',
    'Custom High-Ticket Revenue Goal Tracking & Milestones',
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#F59E0B] via-[#D97706] to-[#7C3AED] p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
          <div className={`w-full h-full rounded-[22px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0A0C14]'}`}>
            <Crown className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </div>
        <h1 className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>TaskFlow AI Pro Pass</h1>
        <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Scale your business to $10k+ monthly recurring revenue with autonomous AI tools.
        </p>
      </div>

      <GlassCard
        className={`p-6 space-y-6 border shadow-lg ${
          isLight
            ? 'bg-gradient-to-br from-amber-50/50 via-white to-purple-50/50 border-amber-300'
            : 'border-[#F59E0B]/50 bg-gradient-to-br from-[#131726] via-[#1E2338] to-[#131726] shadow-[0_0_30px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-amber-200' : 'border-[#2E3552]'}`}>
          <div>
            <span className="text-[10px] font-extrabold text-[#F59E0B] uppercase tracking-wider">
              TASK FLOW PRO QUARTERLY PASS
            </span>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ₦20,000 / 3 Months
            </h2>
            <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              20,000 Naira / 3 Months (~₦6,666/month) • Global Tier: $49 / 3 Months
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-xs border border-[#F59E0B]/40">
            POPULAR TIER
          </span>
        </div>

        <div className="space-y-3">
          <h3 className={`font-bold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>EVERYTHING INCLUDED IN PRO:</h3>
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#00E676] flex-shrink-0 mt-0.5" />
              <span className={`text-xs font-medium leading-normal ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{b}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          {userProfile.isSubscribed && !isProcessing && !receiptSent ? (
            <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/40 rounded-2xl text-center text-xs font-bold text-emerald-700 dark:text-[#00E676] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Pro 3-Month Pass is Currently Active on Your Account
            </div>
          ) : receiptSent ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-1">
              <div className="text-emerald-500 font-extrabold text-xs flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Payment Successful & Receipt Dispatched!
              </div>
              <p className="text-[11px] text-slate-400">
                Email receipt sent to <span className="text-white font-semibold">{userProfile.userEmail || 'mummom692@gmail.com'}</span> (Txn: {receiptSent})
              </p>
            </div>
          ) : (
            <button
              onClick={handleActivatePro}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#7C3AED] text-white font-extrabold text-sm shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment & Generating Receipt...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" /> Activate Pro Pass (₦20,000 / 3 Months) <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
