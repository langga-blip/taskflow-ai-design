import React from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { Crown, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const SubscriptionScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const handleActivatePro = () => {
    updateUserProfile({ isSubscribed: true });
    triggerNotification('Pro Annual Activated! 👑', 'Unlocked unlimited AI strategy, global currencies & 50+ templates.', 'SYSTEM', 'dashboard');
    setCurrentScreen('dashboard');
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
              SPECTREY PRO ANNUAL
            </span>
            <h2 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>$199 / Year</h2>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Equivalent to $16.50/month (Save 40%)</p>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-xs border border-[#F59E0B]/40">
            BEST VALUE
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
          {userProfile.isSubscribed ? (
            <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/40 rounded-2xl text-center text-xs font-bold text-emerald-700 dark:text-[#00E676] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Pro Annual Pass is Currently Active on Your Account
            </div>
          ) : (
            <button
              onClick={handleActivatePro}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#7C3AED] text-white font-extrabold text-sm shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" /> Activate Pro Pass Instantly <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
