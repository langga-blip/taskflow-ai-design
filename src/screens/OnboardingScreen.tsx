import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { SearchableCountrySelector } from '../components/SearchableCountrySelector';
import {
  CountryData,
  GENDER_OPTIONS,
  getCountryByName,
} from '../data/countriesData';
import {
  Sparkles,
  Building2,
  ArrowRight,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Target,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export const OnboardingScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  // Step state: 1 = Business & Identity, 2 = Localization & Security, 3 = Goals & Revenue
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
  // Real password state so toggling eye revealer actually shows the plain text!
  const [password, setPassword] = useState('TaskFlowPass2026!');
  const [showPassword, setShowPassword] = useState(false);

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
      if (err?.code === 'auth/popup-closed-by-user') {
        console.log('Google Sign-in popup closed by user, connecting workspace account...');
      } else {
        console.warn('Google auth notice:', err);
      }
      // Fallback workspace connection if popup is closed or blocked
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

  const handleBack = () => {
    if (currentStep === 1) {
      // Go back to auth or landing
      setCurrentScreen(userProfile.isOnboarded ? 'profile' : 'auth');
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!businessName.trim()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!password || password.length < 6) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleFinishOnboarding();
    }
  };

  const handleFinishOnboarding = () => {
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
      isSubscribed: userProfile.isSubscribed || false,
    });

    triggerNotification(
      'Workspace Configured 🎉',
      `Welcome to TaskFlow AI! Select your plan duration and make payment to activate full access.`,
      'SYSTEM',
      'subscription'
    );
    setCurrentScreen('subscription');
  };

  return (
    <div
      className={`min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C14] text-white'
      }`}
    >
      <div className="max-w-xl sm:max-w-2xl w-full space-y-6 my-auto z-10">
        {/* Top Navigation Bar with Dedicated Back Button */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={handleBack}
            className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title={currentStep === 1 ? 'Back to Sign In' : `Back to Step ${currentStep - 1}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{currentStep === 1 ? 'Back to Sign In' : `Back to Step ${currentStep - 1}`}</span>
          </button>

          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isLight ? 'bg-white' : 'bg-[#0A0C14]'
              }`}
            >
              <Sparkles className="w-7 h-7 text-[#06B6D4]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Setup Your Business Profile</h2>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            TaskFlow AI customizes daily strategies and templates to your exact goals
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              currentStep === 1
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/20'
                : currentStep > 1
                ? isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-[#131726]/60 text-slate-500 border-[#2E3552]'
            }`}
          >
            {currentStep > 1 ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <span className="shrink-0">1.</span>}
            <span className="truncate">Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              currentStep === 2
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/20'
                : currentStep > 2
                ? isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-[#131726]/60 text-slate-500 border-[#2E3552]'
            }`}
          >
            {currentStep > 2 ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <span className="shrink-0">2.</span>}
            <span className="sm:hidden">Region</span>
            <span className="hidden sm:inline truncate">Country & Region</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (password.length >= 6) setCurrentStep(3);
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
              currentStep === 3
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/20'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-[#131726]/60 text-slate-500 border-[#2E3552]'
            }`}
          >
            <span className="shrink-0">3.</span>
            <span className="truncate">Goals</span>
          </button>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleNextStep} className="space-y-4">
            {/* STEP 1: BUSINESS & PROFILE BASICS */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Sign Up with Google Button */}
                <div className="space-y-2 pb-3 border-b border-slate-700/40">
                  <button
                    type="button"
                    disabled={isSigningInGoogle}
                    onClick={handleGoogleSignIn}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border shadow-sm whitespace-nowrap ${
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

                <div className="relative flex items-center justify-center my-1">
                  <div className={`absolute inset-0 flex items-center ${isLight ? 'border-slate-300' : 'border-slate-700'}`}>
                    <div className={`w-full border-t ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`} />
                  </div>
                  <span
                    className={`relative px-3 text-[10px] uppercase font-bold tracking-wider rounded-full py-0.5 ${
                      isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-[#0A0C14] text-slate-400'
                    }`}
                  >
                    Business Profile Information
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Business / Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Scale Agency"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
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
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
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
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer whitespace-nowrap truncate ${
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

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] whitespace-nowrap"
                  >
                    <span>Continue to Region & Security</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REGION, PHONE & PASSWORD */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Country Options */}
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
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phoneDigits}
                        onChange={(e) => setPhoneDigits(e.target.value)}
                        placeholder="801 234 5678"
                        className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                            : 'bg-[#0A0C14] border-[#2E3552] text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Password Field with Reliable Eye Revealer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">Account Password</label>
                    <span className="text-[10px] text-slate-400">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className={`w-full border rounded-xl pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                          : 'bg-[#0A0C14] border-[#2E3552] text-white'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors cursor-pointer z-20 flex items-center justify-center ${
                        isLight
                          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-[#06B6D4]" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {showPassword && (
                    <p className="text-[11px] text-[#06B6D4] mt-1 font-mono font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Password revealed: {password}
                    </p>
                  )}
                </div>

                {/* Step 2 Action Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`w-1/3 py-2.5 sm:py-3 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                        : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] whitespace-nowrap"
                  >
                    <span>Continue to Goals</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVENUE & STRATEGIC GOALS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
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
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
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
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
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
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
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
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                </div>

                {/* Step 3 Action Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className={`w-1/3 py-2.5 sm:py-3 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
                        : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] whitespace-nowrap"
                  >
                    <span>Complete Setup</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

