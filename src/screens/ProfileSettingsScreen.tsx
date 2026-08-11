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
import {
  Building2,
  Crown,
  Cpu,
  LogOut,
  Save,
  RotateCcw,
  Check,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Phone,
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

  const isLight = userProfile.themeMode === 'Light';

  const [userName, setUserName] = useState(userProfile.userName);
  const [businessName, setBusinessName] = useState(userProfile.businessName);
  const [industry, setIndustry] = useState(userProfile.industry);
  const [gender, setGender] = useState(userProfile.gender || 'Prefer not to say');

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return getCountryByName(userProfile.country || 'United States');
  });

  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '+1 801 234 5678');
  const [currentMonthlyRevenue, setCurrentMonthlyRevenue] = useState<string | number>(
    userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 0
  );
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState<string | number>(
    userProfile.monthlyRevenueGoal !== undefined ? userProfile.monthlyRevenueGoal : 10000
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRev = typeof currentMonthlyRevenue === 'string' ? parseFloat(currentMonthlyRevenue) : currentMonthlyRevenue;
    const finalRev = isNaN(parsedRev) || parsedRev < 0 ? 0 : parsedRev;

    const parsedGoal = typeof monthlyRevenueGoal === 'string' ? parseFloat(monthlyRevenueGoal) : monthlyRevenueGoal;
    const finalGoal = isNaN(parsedGoal) || parsedGoal <= 0 ? 10000 : parsedGoal;

    updateUserProfile({
      userName,
      businessName,
      industry,
      gender,
      country: selectedCountry.name,
      currencyCode: selectedCountry.currencyCode,
      currencySymbol: selectedCountry.currencySymbol,
      timezoneId: selectedCountry.timezone,
      phoneNumber,
      currentMonthlyRevenue: finalRev,
      monthlyRevenueGoal: finalGoal,
    });

    triggerNotification('Profile Updated 🎉', `Saved changes for ${selectedCountry.name}.`, 'SYSTEM');
  };

  const toggleThemeMode = (mode: 'Dark' | 'Light') => {
    updateUserProfile({ themeMode: mode });
    triggerNotification('Theme Switched', `Switched to ${mode} mode`, 'SYSTEM');
  };

  const handleResetOnboarding = () => {
    if (confirm('Re-run onboarding wizard? Your goals and business settings will be reconfigured.')) {
      setCurrentScreen('onboarding');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      {/* Header Banner */}
      <GlassCard className="border-[#7C3AED]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#2563EB] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center font-extrabold text-base ${
                  isLight ? 'bg-white text-[#7C3AED]' : 'bg-[#0A0C14] text-white'
                }`}
              >
                {userProfile.userName ? userProfile.userName.substring(0, 2).toUpperCase() : 'AR'}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{userProfile.userName}</h1>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
                type="button"
                onClick={() => setCurrentScreen('subscription')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Theme Selection Card */}
      <GlassCard className="space-y-3">
        <h2 className="font-bold text-base flex items-center gap-2">
          {isLight ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />} Theme Mode
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toggleThemeMode('Light')}
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              userProfile.themeMode === 'Light'
                ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-extrabold shadow-sm'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" /> Light Mode
          </button>
          <button
            type="button"
            onClick={() => toggleThemeMode('Dark')}
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              userProfile.themeMode === 'Dark'
                ? 'bg-[#7C3AED]/25 border-[#7C3AED] text-[#A78BFA] font-extrabold shadow-sm'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
          </button>
        </div>
      </GlassCard>

      {/* Settings Form */}
      <GlassCard className="space-y-4">
        <h2 className="font-bold text-base border-b border-slate-200 dark:border-[#2E3552] pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#06B6D4]" /> Workspace & Business Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Company Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
            </div>
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Gender Option</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer truncate ${
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

          {/* Searchable Country Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
              <span>Country / Region</span>
              <span className="text-[10px] text-[#06B6D4]">Auto-updates currency & timezone</span>
            </label>
            <SearchableCountrySelector
              selectedCountry={selectedCountry}
              onSelectCountry={(c) => setSelectedCountry(c)}
              isLightMode={isLight}
            />
          </div>

          {/* Phone Number & Industry & Revenue Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Phone Number ({selectedCountry.dialCode})
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Current Revenue ({selectedCountry.currencyCode})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                  {selectedCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={currentMonthlyRevenue}
                  onChange={(e) => setCurrentMonthlyRevenue(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#00E676] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Monthly Target Goal ({selectedCountry.currencyCode})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                  {selectedCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={monthlyRevenueGoal}
                  onChange={(e) => setMonthlyRevenueGoal(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
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
        <h2 className="font-bold text-base flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#A78BFA]" /> Executive AI Engine Selector
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
              type="button"
              onClick={() => {
                setAiProvider(provider.id as any);
                triggerNotification('AI Model Switch', `Switched active provider to ${provider.name}`, 'SYSTEM');
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                aiProvider === provider.id
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 hover:border-slate-400'
                  : 'bg-[#0A0C14] border-[#2E3552] hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                {provider.icon}
                {aiProvider === provider.id && (
                  <Check className="w-4 h-4 text-[#00E676]" />
                )}
              </div>
              <h3 className="font-bold text-sm mt-2">{provider.name}</h3>
              <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{provider.tag}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Account Management & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleResetOnboarding}
          className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold text-amber-500 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            isLight
              ? 'bg-white border-slate-300 hover:bg-slate-100'
              : 'bg-[#131726] border-[#2E3552] hover:border-amber-500/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Re-run Setup Onboarding Wizard
        </button>

        <button
          type="button"
          onClick={() => {
            triggerNotification('Signed Out', 'You have been signed out of your workspace.', 'SYSTEM');
            setCurrentScreen('landing');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold text-red-500 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            isLight
              ? 'bg-white border-slate-300 hover:bg-slate-100'
              : 'bg-[#131726] border-[#2E3552] hover:border-red-500/50'
          }`}
        >
          <LogOut className="w-4 h-4" /> Sign Out of TaskFlow AI
        </button>
      </div>
    </div>
  );
};
