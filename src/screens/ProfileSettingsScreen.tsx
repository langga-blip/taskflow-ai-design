import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { CURRENCY_OPTIONS } from '../data/initialData';
import {
  User,
  Building2,
  Globe,
  Crown,
  Cpu,
  LogOut,
  Save,
  RotateCcw,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';

export const ProfileSettingsScreen: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    aiProvider,
    setAiProvider,
    setCurrentScreen,
    triggerNotification,
  } = useApp();

  const [userName, setUserName] = useState(userProfile.userName);
  const [businessName, setBusinessName] = useState(userProfile.businessName);
  const [industry, setIndustry] = useState(userProfile.industry);
  const [currencyCode, setCurrencyCode] = useState(userProfile.currencyCode);
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(userProfile.monthlyRevenueGoal);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = CURRENCY_OPTIONS.find((c) => c.code === currencyCode) || CURRENCY_OPTIONS[0];

    updateUserProfile({
      userName,
      businessName,
      industry,
      currencyCode: curr.code,
      currencySymbol: curr.symbol,
      monthlyRevenueGoal: Number(monthlyRevenueGoal),
    });

    triggerNotification('Profile Updated', 'Saved Spectrey workspace configuration changes.', 'SYSTEM');
  };

  const handleResetOnboarding = () => {
    if (confirm('Re-run onboarding wizard? Your goals and business settings will be reconfigured.')) {
      setCurrentScreen('onboarding');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#7C3AED]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#2563EB] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
              <div className="w-full h-full bg-[#0A0C14] rounded-[14px] flex items-center justify-center font-extrabold text-white text-base">
                {userProfile.userName ? userProfile.userName.substring(0, 2).toUpperCase() : 'AR'}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">{userProfile.userName}</h1>
              <p className="text-xs text-slate-400">
                {userProfile.userEmail} • {userProfile.businessName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userProfile.isSubscribed ? (
              <span className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold text-xs flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Pro Annual Active
              </span>
            ) : (
              <button
                onClick={() => setCurrentScreen('subscription')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Settings Form */}
      <GlassCard className="space-y-4">
        <h2 className="font-bold text-base text-white border-b border-[#2E3552] pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#06B6D4]" /> Workspace & Business Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Revenue Target
              </label>
              <input
                type="number"
                required
                value={monthlyRevenueGoal}
                onChange={(e) => setMonthlyRevenueGoal(Number(e.target.value))}
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <NeonButton type="submit" size="md">
              <Save className="w-4 h-4" /> Save Profile Changes
            </NeonButton>
          </div>
        </form>
      </GlassCard>

      {/* AI Provider Config */}
      <GlassCard className="space-y-3">
        <h2 className="font-bold text-base text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#A78BFA]" /> Executive AI Engine Selector
        </h2>
        <p className="text-xs text-slate-400">
          Choose which AI model handles your Daily Strategy, Task Generation & Chat Assistant.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'GEMINI', name: 'Gemini 3.5 Flash', tag: 'Fastest & Recommended', icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
            { id: 'OPENAI', name: 'OpenAI GPT-4o', tag: 'Advanced Reasoning', icon: <Cpu className="w-5 h-5 text-purple-400" /> },
            { id: 'DEEPSEEK', name: 'DeepSeek R1', tag: 'Deep Logic & Math', icon: <Shield className="w-5 h-5 text-emerald-400" /> },
          ].map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                setAiProvider(provider.id as any);
                triggerNotification('AI Model Switch', `Switched active provider to ${provider.name}`, 'SYSTEM');
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                aiProvider === provider.id
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                  : 'bg-[#0A0C14] border-[#2E3552] hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                {provider.icon}
                {aiProvider === provider.id && (
                  <Check className="w-4 h-4 text-[#00E676]" />
                )}
              </div>
              <h3 className="font-bold text-sm text-white mt-2">{provider.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{provider.tag}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Account Management & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleResetOnboarding}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#131726] border border-[#2E3552] hover:border-amber-500/50 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Re-run Setup Onboarding Wizard
        </button>

        <button
          onClick={() => {
            triggerNotification('Signed Out', 'You have been signed out of your workspace.', 'SYSTEM');
            setCurrentScreen('landing');
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-[#131726] border border-[#2E3552] hover:border-red-500/50 text-xs font-bold text-red-400 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out of TaskFlow AI
        </button>
      </div>
    </div>
  );
};
