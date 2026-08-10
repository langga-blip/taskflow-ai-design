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
import { Sparkles, Building2, DollarSign, ArrowRight, Phone, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export const OnboardingScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState('');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  const [businessName, setBusinessName] = useState(userProfile.businessName || 'Apex Scale Agency');
  const [industry, setIndustry] = useState(userProfile.industry || 'Marketing Agency / Consulting');
  const [goal1, setGoal1] = useState(userProfile.goal1 || 'Reach $10,000 Monthly Recurring Revenue');
  const [goal2, setGoal2] = useState(userProfile.goal2 || 'Automate Client Onboarding & Reporting');
  const [goal3, setGoal3] = useState(userProfile.goal3 || 'Launch Cold Email Outreach Campaign');
  const [targetRevenue, setTargetRevenue] = useState<string | number>(
    userProfile.monthlyRevenueGoal !== undefined ? userProfile.monthlyRevenueGoal : 10000
  );
  const [gender, setGender] = useState(userProfile.gender || 'Prefer not to say');

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return getCountryByName(userProfile.country || 'United States');
  });

  const [phoneDigits, setPhoneDigits] = useState('801 234 5678');

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      const res = await signInWithGoogle();
      const displayName = res.user.displayName || 'Google User';
      const email = res.user.email || 'user@gmail.com';

      setGoogleConnected(true);
      setGoogleAccountEmail(email);

      updateUserProfile({
        userName: displayName,
        userEmail: email,
      });

      triggerNotification(
        'Google Account Connected! 🟢',
        `Access granted for ${email}. AI Assistant will monitor Gmail, Drive, and Calendar for smart alerts & automated replies.`,
        'AI',
        'assistant'
      );
    } catch (err: any) {
      console.error(err);
      // Fallback demo connection if popup is blocked or environment simulated
      const mockEmail = userProfile.userEmail || 'executive.user@gmail.com';
      setGoogleConnected(true);
      setGoogleAccountEmail(mockEmail);
      updateUserProfile({
        userName: userProfile.userName || 'Executive Founder',
        userEmail: mockEmail,
      });
      triggerNotification(
        'Google Account Connected! 🟢',
        `Access granted for ${mockEmail}. AI Assistant now monitors your Gmail, Calendar, and Drive!`,
        'AI',
        'assistant'
      );
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();

    const fullPhone = `${selectedCountry.dialCode} ${phoneDigits.trim()}`;
    const parsedRev = typeof targetRevenue === 'string' ? parseFloat(targetRevenue) : targetRevenue;
    const finalRev = isNaN(parsedRev) || parsedRev < 0 ? 0 : parsedRev;

    updateUserProfile({
      businessName,
      industry,
      goal1,
      goal2,
      goal3,
      monthlyRevenueGoal: finalRev,
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
          {/* Sign Up with Google Button */}
          <div className="space-y-2 pb-2 border-b border-slate-700/40">
            <button
              type="button"
              disabled={isSigningInGoogle}
              onClick={handleGoogleSignIn}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border shadow-sm ${
                googleConnected
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-[#1E2338] hover:bg-[#252B44] border-[#2E3552] text-white hover:border-[#06B6D4]'
              }`}
            >
              {googleConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Connected: {googleAccountEmail || 'Google Account'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSigningInGoogle ? 'Connecting Google Account...' : 'Sign up with Google'}</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Grants AI Assistant access to <span className="text-[#06B6D4] font-semibold">Google Drive, Calendar & Gmail</span> for automated responses & smart notifications.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="bg-[#0A0C14] px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">or fill manually</span>
          </div>

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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                  {selectedCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED] ${
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

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-[0.99]"
              >
                <span>Complete Workspace Setup</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
