import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { SearchableCountrySelector } from '../components/SearchableCountrySelector';
import {
  CountryData,
  GENDER_OPTIONS,
  getCountryByName,
} from '../data/countriesData';
import { Sparkles, Building2, DollarSign, ArrowRight, Phone } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const [businessName, setBusinessName] = useState(userProfile.businessName || 'Apex Scale Agency');
  const [industry, setIndustry] = useState(userProfile.industry || 'Marketing Agency / Consulting');
  const [goal1, setGoal1] = useState(userProfile.goal1 || 'Reach $10,000 Monthly Recurring Revenue');
  const [goal2, setGoal2] = useState(userProfile.goal2 || 'Automate Client Onboarding & Reporting');
  const [goal3, setGoal3] = useState(userProfile.goal3 || 'Launch Cold Email Outreach Campaign');
  const [targetRevenue, setTargetRevenue] = useState(userProfile.monthlyRevenueGoal || 10000);
  const [gender, setGender] = useState(userProfile.gender || 'Prefer not to say');

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return getCountryByName(userProfile.country || 'United States');
  });

  const [phoneDigits, setPhoneDigits] = useState('801 234 5678');

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();

    const fullPhone = `${selectedCountry.dialCode} ${phoneDigits.trim()}`;

    updateUserProfile({
      businessName,
      industry,
      goal1,
      goal2,
      goal3,
      monthlyRevenueGoal: Number(targetRevenue),
      gender,
      country: selectedCountry.name,
      currencyCode: selectedCountry.currencyCode,
      currencySymbol: selectedCountry.currencySymbol,
      timezoneId: selectedCountry.timezone,
      phoneNumber: fullPhone,
      isOnboarded: true,
    });

    triggerNotification(
      'Onboarding Complete 🎉',
      `Workspace configured for ${selectedCountry.name} (${selectedCountry.currencyCode} ${selectedCountry.currencySymbol}).`,
      'SYSTEM',
      'dashboard'
    );
    setCurrentScreen('dashboard');
  };

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C14] text-white'
      }`}
    >
      <div className="max-w-lg w-full space-y-6 my-auto z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isLight ? 'bg-white' : 'bg-[#0A0C14]'
              }`}
            >
              <Sparkles className="w-6 h-6 text-[#06B6D4]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold">Setup Your Business Profile</h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            TaskFlow AI customizes daily strategies and templates to your exact goals
          </p>
        </div>

        <GlassCard className="space-y-4">
          <form onSubmit={handleFinishOnboarding} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Business / Company Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Scale Agency"
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Industry Sector</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. B2B SaaS, Marketing Agency, E-commerce, Consulting"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
            </div>

            {/* Gender Options */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">Gender Option</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                      gender === g
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0A0C14] border-[#2E3552] text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Country Options (All Countries Searchable) */}
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Country / Region</span>
                <span className="text-[10px] text-[#06B6D4] font-normal">
                  Auto-selects Currency & Timezone
                </span>
              </label>
              <SearchableCountrySelector
                selectedCountry={selectedCountry}
                onSelectCountry={(c) => setSelectedCountry(c)}
                isLightMode={isLight}
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Phone Number ({selectedCountry.dialCode})
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                    isLight
                      ? 'bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-[#1E2338] border-[#2E3552] text-slate-200'
                  }`}
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </div>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="801 234 5678"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                      isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Monthly Revenue Goal ({selectedCountry.currencyCode})
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Number(e.target.value))}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold">
                Top 3 Strategic Business Goals
              </label>
              <input
                type="text"
                value={goal1}
                onChange={(e) => setGoal1(e.target.value)}
                placeholder="Goal 1: e.g. Scale to $10k MRR"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#06B6D4] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
              <input
                type="text"
                value={goal2}
                onChange={(e) => setGoal2(e.target.value)}
                placeholder="Goal 2: e.g. Automate client onboarding"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#06B6D4] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
              <input
                type="text"
                value={goal3}
                onChange={(e) => setGoal3(e.target.value)}
                placeholder="Goal 3: e.g. Launch cold email outreach"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#06B6D4] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
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
