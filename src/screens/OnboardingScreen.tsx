import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { CURRENCY_OPTIONS } from '../data/initialData';
import { Sparkles, Building2, Target, DollarSign, Globe, Check, ArrowRight } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();

  const [businessName, setBusinessName] = useState(userProfile.businessName || 'Apex Scale Agency');
  const [industry, setIndustry] = useState(userProfile.industry || 'Marketing Agency / Consulting');
  const [goal1, setGoal1] = useState(userProfile.goal1 || 'Reach $10,000 Monthly Recurring Revenue');
  const [goal2, setGoal2] = useState(userProfile.goal2 || 'Automate Client Onboarding & Reporting');
  const [goal3, setGoal3] = useState(userProfile.goal3 || 'Launch Cold Email Outreach Campaign');
  const [targetRevenue, setTargetRevenue] = useState(userProfile.monthlyRevenueGoal || 10000);
  const [currencyCode, setCurrencyCode] = useState(userProfile.currencyCode || 'USD');

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const currOption = CURRENCY_OPTIONS.find((c) => c.code === currencyCode) || CURRENCY_OPTIONS[0];

    updateUserProfile({
      businessName,
      industry,
      goal1,
      goal2,
      goal3,
      monthlyRevenueGoal: Number(targetRevenue),
      currencyCode: currOption.code,
      currencySymbol: currOption.symbol,
      isOnboarded: true,
    });

    triggerNotification('Onboarding Complete 🎉', 'Your Spectrey workspace is configured & synchronized.', 'SYSTEM', 'dashboard');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0C14] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="max-w-lg w-full space-y-6 my-auto z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <div className="w-full h-full bg-[#0A0C14] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#06B6D4]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Setup Your Business Profile</h2>
          <p className="text-xs text-slate-400">
            TaskFlow AI customizes daily strategies and templates to your exact goals
          </p>
        </div>

        <GlassCard className="space-y-4">
          <form onSubmit={handleFinishOnboarding} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Business / Company Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Scale Agency"
                  className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. B2B SaaS, Marketing Agency, E-commerce, Consulting"
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Revenue Goal
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(Number(e.target.value))}
                    className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Currency
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] appearance-none"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#0A0C14] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Top 3 Strategic Business Goals
              </label>
              <input
                type="text"
                value={goal1}
                onChange={(e) => setGoal1(e.target.value)}
                placeholder="Goal 1: e.g. Scale to $10k MRR"
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
              />
              <input
                type="text"
                value={goal2}
                onChange={(e) => setGoal2(e.target.value)}
                placeholder="Goal 2: e.g. Automate client onboarding"
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
              />
              <input
                type="text"
                value={goal3}
                onChange={(e) => setGoal3(e.target.value)}
                placeholder="Goal 3: e.g. Launch cold email outreach"
                className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <NeonButton type="submit" size="lg" fullWidth>
              Complete Workspace Setup <ArrowRight className="w-5 h-5" />
            </NeonButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
